import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Download, Copy, CalendarPlus, Euro } from 'lucide-react';
import { VENUES, venueCapacityFor } from './data/catalog';
import { memberFor } from './data/team';

/* Operator Quotes tab — dark CRM styled. Reads client-submitted quotes from
   /api/quotes with the admin capability token (Settings → RT Admin API Token). */

const KIND_TO_CATEGORY = { venue: 'venue', catering: 'catering', dj_av: 'av_equipment', staff: 'misc', photo: 'misc' };

/* Emit the exact {version, data, constraints} shape the deterministic engine
   consumes (canonical example: agents/event_ops/schemas/lilium_berlin.py).
   committed_spend = confirmed items only; category_ceilings = all quoted. */
export function quoteToEngineInput(quote) {
  const cats = ['venue', 'av_equipment', 'catering', 'misc'];
  const sum = (pred) => Object.fromEntries(cats.map(c => [c,
    quote.items.filter(i => KIND_TO_CATEGORY[i.kind] === c && pred(i))
      .reduce((s, i) => s + i.amount_eur, 0),
  ]));
  const committed = sum(i => i.status === 'confirmed');
  const ceilings = sum(() => true);
  const venueItem = quote.items.find(i => i.kind === 'venue');
  const catalogVenue = venueItem ? VENUES.find(v => v.id === venueItem.provider_id) : null;

  return {
    version: '1.0',
    data: {
      event_id: quote.ref,
      event_name: `${quote.client_name} — ${quote.event_type}`,
      event_type: quote.event_type,
      date: quote.event_date || 'TBC',
      expected_attendees: quote.guests,
      ...(catalogVenue ? {
        venue: {
          address: catalogVenue.address,
          capacity_standing: catalogVenue.capacity.standing,
          capacity_seated: catalogVenue.capacity.seated,
        },
      } : {}),
      budget: { committed_spend: committed },
      staffing: { volunteer_roster: [] },
      av_equipment: { items: [] },
    },
    constraints: {
      ...(catalogVenue ? { capacity: { max_attendees: venueCapacityFor(catalogVenue, quote.event_type) } } : {}),
      budget: {
        total_ceiling: quote.budget || Object.values(ceilings).reduce((a, b) => a + b, 0),
        hard_stop_threshold_eur: quote.budget || Object.values(ceilings).reduce((a, b) => a + b, 0),
        category_ceilings: ceilings,
      },
      staffing: { roles: [] },
      av: { conflict_check: 'flag_if_same_item_id_booked_twice_same_window' },
    },
  };
}

/* ---- Auto-populate Schedule + Tasks from a quote — deterministic, no AI ---- */

function to12Hour(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function minutesOf(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function categoryForTitle(title) {
  const t = title.toLowerCase();
  if (t.includes('setup') || t.includes('crew call') || t.includes('sound & light check')) return 'Setup';
  if (t.includes('doors') || t.includes('arrival') || t.includes('farewell')) return 'Reception';
  if (t.includes('dinner') || t.includes('food') || t.includes('catering')) return 'Catering';
  if (t.includes('dj') || t.includes('dance') || t.includes('music')) return 'Entertainment';
  if (t.includes('photo')) return 'Photography';
  if (t.includes('breakdown') || t.includes('load-out') || t.includes('last call') || t.includes('ends')) return 'Wrap-up';
  return 'Program';
}

/* Reads the run-of-show generated at submission time (src/data/runOfShow.js)
   out of the quote's stored payload and reshapes it into the CRM's Schedule
   tab format ({time, title, duration, assigned, category}). */
export function buildScheduleForQuote(quote) {
  let ros;
  try {
    ros = JSON.parse(quote.payload_json)?.payload?.run_of_show;
  } catch {
    return [];
  }
  if (!Array.isArray(ros) || ros.length === 0) return [];

  return ros.map((row, i) => {
    const next = ros[i + 1];
    const mins = next ? minutesOf(next.time) - minutesOf(row.time) : 60;
    const wrapped = mins < 0 ? mins + 1440 : mins; // crosses midnight
    const duration = wrapped < 60 ? `${wrapped} minutes`
      : wrapped % 60 === 0 ? `${wrapped / 60} hour${wrapped === 60 ? '' : 's'}`
      : `${(wrapped / 60).toFixed(1)} hours`;
    return { time: to12Hour(row.time), title: row.title, duration, assigned: row.owner, category: categoryForTitle(row.title) };
  });
}

/* One follow-up task per still-live provider (skips declined items — nothing
   to confirm there) plus a billing task, so "convert" hands the operator a
   real to-do list instead of a blank Tasks tab. */
const TASK_TEMPLATES = {
  venue: { title: p => `Confirm venue contract & final walkthrough — ${p}`, priority: 'high', daysBefore: 21, capacity: 'planning' },
  catering: { title: p => `Confirm final headcount & menu with ${p}`, priority: 'high', daysBefore: 7, capacity: 'vendor' },
  dj_av: { title: p => `Confirm arrival time & tech rider with ${p}`, priority: 'medium', daysBefore: 5, capacity: 'logistics' },
  staff: { title: p => `Confirm crew schedule & call times with ${p}`, priority: 'medium', daysBefore: 3, capacity: 'ops' },
  photo: { title: p => `Share shot list & timeline with ${p}`, priority: 'medium', daysBefore: 5, capacity: 'vendor' },
};

function dueDateFor(eventDateStr, daysBefore) {
  const base = eventDateStr ? new Date(eventDateStr) : new Date(Date.now() + 14 * 86400000);
  base.setDate(base.getDate() - daysBefore);
  const today = new Date();
  return (base < today ? today : base).toISOString().slice(0, 10);
}

export function buildTasksForQuote(quote, eventName) {
  const tasks = [];
  for (const item of quote.items) {
    if (item.status === 'declined') continue;
    const tmpl = TASK_TEMPLATES[item.kind];
    if (!tmpl) continue;
    tasks.push({
      title: tmpl.title(item.provider_name), event: eventName,
      dueDate: dueDateFor(quote.event_date, tmpl.daysBefore),
      status: 'pending', priority: tmpl.priority,
      assignedTo: memberFor(tmpl.capacity)?.name || 'Unassigned', createdBy: 'RT Network',
      description: `Auto-generated from quote ${quote.ref} — ${item.label} (€${item.amount_eur.toLocaleString()}).`,
      subtasks: [], tags: [item.kind, 'auto-generated'], comments: [], attachments: [],
    });
  }
  const total = quote.items.reduce((s, i) => s + i.amount_eur, 0);
  if (total > 0) {
    tasks.push({
      title: `Send deposit invoices for ${eventName}`, event: eventName,
      dueDate: dueDateFor(quote.event_date, 30),
      status: 'pending', priority: 'high',
      assignedTo: memberFor('billing')?.name || 'Unassigned', createdBy: 'RT Network',
      description: `Total package value €${total.toLocaleString()} across ${quote.items.length} provider(s).`,
      subtasks: [], tags: ['billing', 'auto-generated'], comments: [], attachments: [],
    });
  }
  return tasks;
}

/* One Budget-tab line per still-live provider, same amounts used everywhere
   else (the engine export, the ledger, the task descriptions) — no formula,
   just the real quoted figure. Due dates reuse the same per-category offset
   as the matching confirm task, since final payment typically lands
   alongside final confirmation. Declined items get no line — nothing owed. */
const KIND_TO_BUDGET_CATEGORY = { venue: 'Venue', catering: 'Catering', dj_av: 'Entertainment', staff: 'Staffing', photo: 'Photography' };

export function buildBudgetItemsForQuote(quote, eventName) {
  const items = [];
  for (const item of quote.items) {
    if (item.status === 'declined') continue;
    const tmpl = TASK_TEMPLATES[item.kind];
    items.push({
      category: KIND_TO_BUDGET_CATEGORY[item.kind] || 'Misc',
      vendor: item.provider_name,
      amount: item.amount_eur,
      paid: 0,
      status: 'pending',
      event: eventName,
      dueDate: dueDateFor(quote.event_date, tmpl ? tmpl.daysBefore : 7),
    });
  }
  return items;
}

const STATUS_CHIP = {
  pending: 'bg-amber-900/40 text-amber-300',
  confirmed: 'bg-emerald-900/40 text-emerald-300',
  declined: 'bg-red-900/40 text-red-300',
};

const QUOTE_STATUSES = ['submitted', 'confirmed', 'completed', 'cancelled'];

export default function QuotesPanel({ classes, onConvert }) {
  const [quotes, setQuotes] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('rt_admin_token') : null;

  async function load() {
    if (!adminToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quotes', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (res.status === 401) throw new Error('Admin token rejected — check Settings → RT Admin API Token');
      if (!res.ok) throw new Error(`API error (HTTP ${res.status})`);
      setQuotes((await res.json()).quotes);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const ledger = useMemo(() => {
    if (!quotes) return null;
    const byProvider = {};
    let totalCommission = 0;   // venue/provider booking fees
    let totalServiceFee = 0;   // planner service fees (2%)
    for (const q of quotes) {
      if (q.client_fee_eur) totalServiceFee += q.client_fee_eur;
      for (const i of q.items) {
        if (i.status !== 'confirmed' || !i.commission_eur) continue;
        byProvider[i.provider_name] = (byProvider[i.provider_name] || 0) + i.commission_eur;
        totalCommission += i.commission_eur;
      }
    }
    return { byProvider, totalCommission, totalServiceFee, totalTake: totalCommission + totalServiceFee };
  }, [quotes]);

  async function setQuoteStatus(quote, status) {
    try {
      const res = await fetch('/api/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ id: quote.id, status }),
      });
      if (!res.ok) throw new Error();
      setQuotes(qs => qs.map(q => q.id === quote.id ? { ...q, status } : q));
    } catch {
      alert('Could not update status — try refreshing.');
    }
  }

  function exportEngineJson(quote) {
    const blob = new Blob([JSON.stringify(quoteToEngineInput(quote), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${quote.ref}-preflight-input.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (!adminToken) {
    return (
      <div className="panel-glass glass-border rounded-md p-8 text-center">
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Set the <strong>RT Admin API Token</strong> in Settings → AI / API Keys to load client quotes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Quotes</h1>
          <p className="text-sm text-slate-300">Client packages submitted via the RT Network quote builder</p>
        </div>
        <button onClick={load} disabled={loading}
          className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && <div className="panel-glass glass-border rounded-md p-4 text-sm text-red-300">{error}</div>}

      {ledger && ledger.totalTake > 0 && (
        <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Euro size={14} className="text-purple-300" />
            <h2 className="text-sm font-bold text-white">Fee ledger — confirmed bookings</h2>
          </div>
          <div className="space-y-1 mb-2">
            {Object.entries(ledger.byProvider).map(([name, amt]) => (
              <div key={name} className="flex justify-between text-sm text-slate-300">
                <span>{name} <span className="text-slate-500">· booking fee</span></span><span>€{amt.toFixed(2)}</span>
              </div>
            ))}
            {ledger.totalServiceFee > 0 && (
              <div className="flex justify-between text-sm text-slate-300">
                <span>Planner service fees <span className="text-slate-500">· 2%</span></span><span>€{ledger.totalServiceFee.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
            <span>Total RT Network take</span><span>€{ledger.totalTake.toFixed(2)}</span>
          </div>
        </div>
      )}

      {quotes && quotes.length === 0 && (
        <div className="panel-glass glass-border rounded-md p-8 text-center text-sm" style={{ color: 'var(--text-2)' }}>
          No quotes yet. Share the builder: <span className="font-mono text-purple-300">{window.location.origin}/#plan</span>
        </div>
      )}

      <div className="space-y-4">
        {(quotes || []).map(q => {
          const total = q.items.reduce((s, i) => s + i.amount_eur, 0);
          const confirmed = q.items.filter(i => i.status === 'confirmed').length;
          return (
            <div key={q.id} className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{q.client_name}</h3>
                    <span className="text-xs font-mono text-purple-300">{q.ref}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {q.event_type} · {q.event_date || 'date TBC'} · {q.guests} guests
                    {q.budget ? ` · budget €${q.budget.toLocaleString()}` : ''} · {q.client_email}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">€{total.toLocaleString()}</div>
                  <div className="text-xs text-slate-400">{confirmed}/{q.items.length} confirmed</div>
                  <select value={q.status} onChange={e => setQuoteStatus(q, e.target.value)}
                    className="mt-1 text-xs dark-input rounded px-2 py-1">
                    {QUOTE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1 mb-4">
                {q.items.map(i => (
                  <div key={i.id} className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">{i.provider_name} — {i.label}</span>
                      <span className="flex items-center gap-3">
                        <span className="text-white">€{i.amount_eur.toLocaleString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${STATUS_CHIP[i.status]}`}>{i.status}</span>
                      </span>
                    </div>
                    {i.status === 'declined' && i.declined_reason && (
                      <div className="text-xs text-slate-500 mt-0.5">Reason: {i.declined_reason}</div>
                    )}
                  </div>
                ))}
              </div>

              {(() => {
                try {
                  const ros = JSON.parse(q.payload_json)?.payload?.run_of_show;
                  if (!Array.isArray(ros) || ros.length === 0) return null;
                  return (
                    <details className="mb-4">
                      <summary className="text-xs font-semibold text-purple-300 cursor-pointer">Run of show ({ros.length} items)</summary>
                      <div className="mt-2 space-y-1">
                        {ros.map((r, i) => (
                          <div key={i} className="flex justify-between text-xs text-slate-300">
                            <span><span className="font-mono text-slate-400 mr-2">{r.time}</span>{r.title}</span>
                            <span className="text-slate-500">{r.owner}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  );
                } catch { return null; }
              })()}

              <div className="flex flex-wrap gap-2">
                <button onClick={() => exportEngineJson(q)}
                  className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-2">
                  <Download size={12} /> Export engine JSON
                </button>
                <button onClick={() => navigator.clipboard.writeText(JSON.stringify(quoteToEngineInput(q), null, 2))}
                  className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-2">
                  <Copy size={12} /> Copy engine JSON
                </button>
                <button onClick={() => onConvert(q)}
                  className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-2">
                  <CalendarPlus size={12} /> Convert to CRM event
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
