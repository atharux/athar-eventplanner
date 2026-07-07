import React, { useMemo, useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useLocalStorage } from './useStorage';
import { runPreflight } from './data/preflightEngine';
import { PREFLIGHT_EVENTS } from './data/preflightEvents';

/* Pre-Flight panel — runs the deterministic constraint engine LIVE in the
   browser (src/data/preflightEngine.js, a faithful JS port of
   agents/event_ops/schemas/engine.py — verified byte-identical output).
   Roster and committed-spend are editable right here and persist to
   localStorage per event; every edit recomputes violations instantly, so
   clearing a finding is a few clicks, not a Python re-run + redeploy.
   Ceilings/coverage minimums (policy) stay fixed — edit
   src/data/preflightEvents.js to change those, then this screen picks it
   up automatically since it imports that file directly. */

const Card = ({ title, children }) => (
  <div className="panel-glass glass-border rounded-md p-5" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
    <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-2)' }}>{title}</h2>
    {children}
  </div>
);

export default function PreflightPanel() {
  const [selectedId, setSelectedId] = useState(PREFLIGHT_EVENTS[0].id);
  const event = PREFLIGHT_EVENTS.find(e => e.id === selectedId) || PREFLIGHT_EVENTS[0];
  const [liveData, setLiveData] = useLocalStorage(event.storageKey, event.baseData);

  const report = useMemo(
    () => runPreflight({ version: '1.0', data: liveData, constraints: event.constraints }),
    [liveData, event.constraints]
  );

  function selectEvent(id) {
    setSelectedId(id);
  }
  function updateData(patch) {
    setLiveData(prev => ({ ...prev, ...patch }));
  }
  function resetToOriginal() {
    if (!window.confirm(`Discard your edits and restore ${event.label}'s original pilot roster/spend?`)) return;
    setLiveData(event.baseData);
  }

  const roster = liveData.staffing?.volunteer_roster || [];
  function updateVolunteer(idx, patch) {
    const next = roster.map((v, i) => i === idx ? { ...v, ...patch } : v);
    updateData({ staffing: { ...liveData.staffing, volunteer_roster: next } });
  }
  function removeVolunteer(idx) {
    updateData({ staffing: { ...liveData.staffing, volunteer_roster: roster.filter((_, i) => i !== idx) } });
  }
  function addVolunteer() {
    updateData({ staffing: { ...liveData.staffing, volunteer_roster: [...roster, { name: '', role: '', availability: '' }] } });
  }

  const selector = (
    <div className="flex gap-2">
      {PREFLIGHT_EVENTS.map(e => (
        <button key={e.id} onClick={() => selectEvent(e.id)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${selectedId === e.id ? 'bg-purple-700 text-white' : 'hover:bg-white/5'}`}
          style={selectedId === e.id ? {} : { background: 'var(--surface-3)', color: 'var(--text-2)' }}>
          {e.label}
        </button>
      ))}
    </div>
  );

  const d = report.result.validated_data;
  const approved = report.status === 'approved';
  const budget = d.budget || {};
  const categories = budget.categories || {};
  const spend = liveData.budget?.committed_spend || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Pre-Flight Check</h1>
          <p className="text-sm text-slate-300 mb-2">{d.event_name} · {d.date}</p>
          {selector}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={resetToOriginal} className="text-xs flex items-center gap-1 hover:text-white" style={{ color: 'var(--text-3)' }} title="Discard edits, restore original pilot data">
            <RotateCcw size={12} /> Reset
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm"
            style={approved
              ? { background: 'rgba(0,229,160,0.12)', color: 'var(--color-green, #34d399)', border: '1px solid rgba(52,211,153,0.35)' }
              : { background: 'rgba(255,107,107,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.35)' }}>
            {approved ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            {approved ? 'APPROVED — all constraints satisfied' : `BLOCKED — ${report.result.reason}`}
          </div>
        </div>
      </div>

      {/* Violations & risks */}
      {(d.violations.length > 0 || d.risk_flags.length > 0) && (
        <Card title="FINDINGS">
          <div className="space-y-3">
            {d.violations.map((v, i) => (
              <div key={`v${i}`}>
                <div className="flex items-start gap-2 text-sm text-red-300">
                  <ShieldAlert size={15} className="mt-0.5 flex-shrink-0" /> {v}
                </div>
                {d.recommended_actions?.[i] && (
                  <div className="text-xs text-emerald-300 mt-1 ml-6">
                    To fix → {d.recommended_actions[i]}
                  </div>
                )}
              </div>
            ))}
            {d.risk_flags.map((r, i) => (
              <div key={`r${i}`} className="flex items-start gap-2 text-sm text-amber-300">
                <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" /> {r}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Capacity (venues that declare it) — expected attendees editable */}
      {d.capacity && (
        <div className="panel-glass glass-border rounded-md px-5 py-3 flex items-center justify-between gap-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <span className="text-sm" style={{ color: 'var(--text-2)' }}>Venue capacity</span>
          <span className="flex items-center gap-2">
            <input type="number" min="0" value={liveData.expected_attendees ?? 0}
              onChange={e => updateData({ expected_attendees: Number(e.target.value) || 0 })}
              className="dark-input w-20 px-2 py-1 rounded text-sm text-right" />
            <span className={`text-sm font-semibold ${d.capacity.over ? 'text-red-300' : d.capacity.expected_attendees >= 0.9 * d.capacity.max_attendees ? 'text-amber-300' : 'text-white'}`}>
              expected / {d.capacity.max_attendees} max
            </span>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget — committed spend per category editable */}
        <Card title="BUDGET">
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: 'var(--text-2)' }}>Committed</span>
            <span className="font-semibold text-white">
              €{(budget.committed_total ?? 0).toLocaleString()} / €{(budget.total_ceiling ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded overflow-hidden mb-1">
            <div className="h-full" style={{
              width: `${budget.total_ceiling ? Math.min((budget.committed_total / budget.total_ceiling) * 100, 100) : 0}%`,
              background: budget.hard_stop_breached ? '#f87171' : 'linear-gradient(90deg, var(--ef-brand-deep), var(--ef-brand-2))',
            }} />
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>
            Hard stop at €{(budget.hard_stop_at ?? 0).toLocaleString()}
            {budget.hard_stop_breached ? ' — BREACHED' : ''} · headroom €{(budget.headroom ?? 0).toLocaleString()}
          </div>
          <div className="space-y-2">
            {Object.entries(categories).map(([cat, c]) => (
              <div key={cat}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span style={{ color: 'var(--text-2)' }}>{cat}</span>
                  <span className="flex items-center gap-1">
                    <span style={{ color: 'var(--text-3)' }}>€</span>
                    <input type="number" min="0" value={spend[cat] ?? 0}
                      onChange={e => updateData({ budget: { ...liveData.budget, committed_spend: { ...spend, [cat]: Number(e.target.value) || 0 } } })}
                      className={`dark-input w-16 px-1.5 py-0.5 rounded text-right ${c.over ? 'text-red-300 font-semibold' : 'text-slate-300'}`} />
                    <span style={{ color: 'var(--text-3)' }}>/ €{c.ceiling.toLocaleString()}</span>
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded overflow-hidden">
                  <div className="h-full" style={{
                    width: `${c.ceiling ? Math.min((c.committed / c.ceiling) * 100, 100) : 0}%`,
                    background: c.over ? '#f87171' : 'var(--accent-dim, rgba(139,92,246,0.5))',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Staffing coverage (computed) */}
        <Card title="STAFFING COVERAGE">
          <div className="space-y-4">
            {Object.entries(d.staffing || {}).map(([role, windows]) => windows.map((w, i) => (
              <div key={`${role}${i}`} className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{role.replace(/_/g, ' ')}</div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {w.window} · {w.volunteers.join(', ') || 'no one confirmed'}
                    {w.unfilled_placeholder_slots > 0 && ` · ${w.unfilled_placeholder_slots} slot(s) unfilled`}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-semibold flex items-center gap-1 ${w.met ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'}`}>
                  {w.met ? <CheckCircle2 size={12} /> : <ShieldAlert size={12} />}
                  {w.confirmed_full_window}/{w.required}
                </span>
              </div>
            )))}
          </div>
        </Card>
      </div>

      {/* Roster — editable, this is where violations actually get resolved */}
      <Card title="VOLUNTEER ROSTER">
        <div className="space-y-2">
          {roster.map((v, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_2fr_auto] gap-2 items-center">
              <input value={v.name} onChange={e => updateVolunteer(i, { name: e.target.value })}
                placeholder="Name" className="dark-input px-2 py-1.5 rounded text-sm" />
              <input value={Array.isArray(v.role) ? v.role.join(', ') : (v.role || '')}
                onChange={e => updateVolunteer(i, { role: e.target.value.includes(',') ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : e.target.value })}
                placeholder="Role(s), comma-separated" className="dark-input px-2 py-1.5 rounded text-sm" />
              <input value={Array.isArray(v.availability) ? v.availability.join(', ') : (v.availability || '')}
                onChange={e => updateVolunteer(i, { availability: e.target.value })}
                placeholder="17:00-19:00" className="dark-input px-2 py-1.5 rounded text-sm font-mono" />
              <button onClick={() => removeVolunteer(i)} className="p-1.5 text-slate-400 hover:text-red-400" title="Remove">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button onClick={addVolunteer} className="text-xs font-semibold text-purple-300 flex items-center gap-1 mt-2 hover:text-purple-200">
            <Plus size={14} /> Add volunteer
          </button>
        </div>
      </Card>

      {/* AV / equipment (read-only — edit src/data/preflightEvents.js for gear changes) */}
      <Card title="AV / EQUIPMENT">
        {Object.keys(d.av_equipment?.missing_dependencies || {}).length === 0 && (d.av_equipment?.double_booked || []).length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <CheckCircle2 size={15} /> Dependency chains closed, no double-booked gear.
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            {Object.entries(d.av_equipment.missing_dependencies).map(([item, deps]) => (
              <div key={item} className="text-red-300 flex items-start gap-2">
                <ShieldAlert size={15} className="mt-0.5 flex-shrink-0" /> {item}: missing {deps.join(', ')}
              </div>
            ))}
            {d.av_equipment.double_booked.map((c, i) => (
              <div key={i} className="text-red-300 flex items-start gap-2">
                <ShieldAlert size={15} className="mt-0.5 flex-shrink-0" />
                {c.item} double-booked ({c.session} {c.window}) — demand {c.concurrent_demand}, available {c.qty_available}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Audit line */}
      <div className="text-xs" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
        Deterministic constraint engine · computed live in your browser · edits save automatically ·
        cross-check anytime: python3 agents/event_ops/schemas/{event.id === 'gaib' ? 'global_ai_berlin' : 'lilium_berlin'}.py
      </div>
    </div>
  );
}
