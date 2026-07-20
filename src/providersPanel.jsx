import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Plus, Copy, Check, Search, ArrowUpDown } from 'lucide-react';

/* Operator Providers tab — onboard a new provider without touching code or
   running a deploy: the form writes straight to D1 via the admin-authenticated
   API and hands back a ready-to-send backstage link. Reads the same
   'rt_admin_token' as the Quotes tab (Settings → RT Admin API Token). */

const KIND_LABELS = { venue: 'Venue', catering: 'Catering', dj_av: 'DJ & Sound', staff: 'Event crew', photo: 'Photography' };
const MODEL_LABELS = { flat: 'Flat fee', per_person: 'Per guest', per_hour: 'Per hour' };

const BLANK_FORM = {
  name: '', kind: 'catering', pricing_model: 'per_person', pricing_amount: '',
  blurb: '', contact: '', founding: true, capacity_standing: '', capacity_seated: '', address: '',
};

export default function ProvidersPanel({ classes }) {
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null); // { id, backstage_url }
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('rt_admin_token') : null;

  /* Client-side smart search + sort over the loaded catalog — no extra API. */
  const visibleProviders = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = (providers || []).filter(p => {
      const matchesQuery = !q || [p.name, p.contact, KIND_LABELS[p.kind] || p.kind, p.blurb]
        .some(v => (v || '').toLowerCase().includes(q));
      const matchesKind = kindFilter === 'all' || p.kind === kindFilter;
      return matchesQuery && matchesKind;
    });
    const cmp = {
      name: (a, b) => (a.name || '').localeCompare(b.name || ''),
      kind: (a, b) => (KIND_LABELS[a.kind] || a.kind || '').localeCompare(KIND_LABELS[b.kind] || b.kind || '') || (a.name || '').localeCompare(b.name || ''),
      commission: (a, b) => (a.commission_rate || 0) - (b.commission_rate || 0),
      price: (a, b) => (a.pricing_amount || 0) - (b.pricing_amount || 0),
    }[sortBy];
    return cmp ? [...list].sort(cmp) : list;
  }, [providers, query, kindFilter, sortBy]);

  async function load() {
    if (!adminToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/providers', { headers: { Authorization: `Bearer ${adminToken}` } });
      if (res.status === 401) throw new Error('Admin token rejected — check Settings → RT Admin API Token');
      if (!res.ok) throw new Error(`API error (HTTP ${res.status})`);
      setProviders((await res.json()).providers);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(), kind: form.kind, pricing_model: form.pricing_model,
        pricing_amount: Number(form.pricing_amount), blurb: form.blurb.trim() || null,
        contact: form.contact.trim() || null, founding: form.founding,
        ...(form.kind === 'venue' ? {
          capacity_standing: Number(form.capacity_standing), capacity_seated: Number(form.capacity_seated),
          address: form.address.trim(),
        } : {}),
      };
      const res = await fetch('/api/providers', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setCreated({ id: data.id, backstage_url: data.backstage_url });
      setForm(BLANK_FORM);
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(created.backstage_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!adminToken) {
    return (
      <div className="panel-glass glass-border rounded-md p-8 text-center">
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Set the <strong>RT Admin API Token</strong> in Settings → AI / API Keys to manage providers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Providers</h1>
          <p className="text-sm text-slate-300">The live, bookable catalog clients see in the quote builder</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading}
            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => { setShowForm(s => !s); setCreated(null); }}
            className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2">
            <Plus size={14} /> Add Provider
          </button>
        </div>
      </div>

      {error && <div className="panel-glass glass-border rounded-md p-4 text-sm text-red-300">{error}</div>}

      {created && (
        <div className="panel-glass glass-border rounded-md p-5" style={{ borderColor: 'rgba(52,211,153,0.35)' }}>
          <p className="text-sm font-semibold text-emerald-300 mb-2">✓ Provider created — send this link to them:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-black/30 text-slate-200 px-3 py-2 rounded break-all">{created.backstage_url}</code>
            <button onClick={copyLink} className="bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded flex items-center gap-1 text-xs font-semibold whitespace-nowrap">
              {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">They're now bookable in the quote builder — no deploy needed.</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className={`${classes.panelBg} ${classes.border} p-5 rounded-md space-y-4`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Name</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="dark-input w-full p-2.5 rounded-md text-sm" placeholder="e.g. Berlin Bites Catering" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Category</label>
              <select value={form.kind} onChange={e => setForm(f => ({ ...f, kind: e.target.value }))} className="dark-input w-full p-2.5 rounded-md text-sm">
                {Object.entries(KIND_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Pricing model</label>
              <select value={form.pricing_model} onChange={e => setForm(f => ({ ...f, pricing_model: e.target.value }))} className="dark-input w-full p-2.5 rounded-md text-sm">
                {Object.entries(MODEL_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Amount (€)</label>
              <input required type="number" min="1" step="0.01" value={form.pricing_amount}
                onChange={e => setForm(f => ({ ...f, pricing_amount: e.target.value }))} className="dark-input w-full p-2.5 rounded-md text-sm" />
            </div>
          </div>

          {form.kind === 'venue' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Standing capacity</label>
                <input required type="number" min="1" value={form.capacity_standing} onChange={e => setForm(f => ({ ...f, capacity_standing: e.target.value }))} className="dark-input w-full p-2.5 rounded-md text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Seated capacity</label>
                <input required type="number" min="1" value={form.capacity_seated} onChange={e => setForm(f => ({ ...f, capacity_seated: e.target.value }))} className="dark-input w-full p-2.5 rounded-md text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Address</label>
                <input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="dark-input w-full p-2.5 rounded-md text-sm" />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Short description (shown to clients)</label>
            <input value={form.blurb} onChange={e => setForm(f => ({ ...f, blurb: e.target.value }))} className="dark-input w-full p-2.5 rounded-md text-sm" placeholder="One line — what makes this option distinct" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Contact email (optional)</label>
              <input type="email" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className="dark-input w-full p-2.5 rounded-md text-sm" placeholder="for new-gig email alerts" />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={form.founding} onChange={e => setForm(f => ({ ...f, founding: e.target.checked }))} className="w-4 h-4" />
                Founding member — 2% commission, locked 24 months (unchecked = standard 10%)
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="px-5 py-2 rounded-md text-sm font-semibold text-white bg-purple-700 hover:bg-purple-600 disabled:opacity-50">
              {submitting ? 'Creating…' : 'Create provider'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-md text-sm" style={{ background: 'var(--surface-3)', color: 'var(--text-1)' }}>Cancel</button>
          </div>
        </form>
      )}

      {providers && providers.length === 0 && !showForm && (
        <div className="panel-glass glass-border rounded-md p-8 text-center text-sm" style={{ color: 'var(--text-2)' }}>
          No providers yet.
        </div>
      )}

      {providers && providers.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search name, contact, category…"
              className="dark-input w-full pl-9 pr-3 py-2 rounded-md text-sm"
            />
          </div>
          <select value={kindFilter} onChange={e => setKindFilter(e.target.value)} className="dark-input py-2 px-3 rounded-md text-sm">
            <option value="all">All categories</option>
            {Object.entries(KIND_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="dark-input py-2 pl-9 pr-3 rounded-md text-sm">
              <option value="name">Name (A–Z)</option>
              <option value="kind">Category</option>
              <option value="commission">Commission (low→high)</option>
              <option value="price">Price (low→high)</option>
            </select>
          </div>
        </div>
      )}

      {providers && providers.length > 0 && visibleProviders.length === 0 && (
        <div className="panel-glass glass-border rounded-md p-6 text-center text-sm" style={{ color: 'var(--text-2)' }}>
          No providers match “{query}”.
        </div>
      )}

      <div className="space-y-2">
        {visibleProviders.map(p => (
          <div key={p.id} className={`${classes.panelBg} ${classes.border} p-4 rounded-md flex flex-wrap justify-between items-center gap-3`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                {!!p.founding && <span className="text-xs px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 font-semibold">Founding</span>}
                {!p.active && <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">Inactive</span>}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {KIND_LABELS[p.kind] || p.kind} · {p.pricing_model ? `${MODEL_LABELS[p.pricing_model]} — €${p.pricing_amount}` : 'no pricing set'} · {(p.commission_rate * 100).toFixed(0)}% commission
                {p.contact ? ` · ${p.contact}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
