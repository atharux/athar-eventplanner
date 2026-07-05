import React, { useEffect, useState } from 'react';
import { RefreshCw, Download, Copy, CalendarPlus } from 'lucide-react';
import { VENUES, venueCapacityFor } from './data/catalog';

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

const STATUS_CHIP = {
  pending: 'bg-amber-900/40 text-amber-300',
  confirmed: 'bg-emerald-900/40 text-emerald-300',
  declined: 'bg-red-900/40 text-red-300',
};

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
                </div>
              </div>

              <div className="space-y-1 mb-4">
                {q.items.map(i => (
                  <div key={i.id} className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">{i.provider_name} — {i.label}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-white">€{i.amount_eur.toLocaleString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold ${STATUS_CHIP[i.status]}`}>{i.status}</span>
                    </span>
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
