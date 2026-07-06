import React, { useEffect, useMemo, useRef, useState } from 'react';
import { VENUES as STATIC_VENUES, SERVICES as STATIC_SERVICES, KIND_LABELS, lineTotal, priceLabel, effectivePerGuest, venueCapacityFor } from './data/catalog';
import { buildRunOfShow } from './data/runOfShow';
import PlanChat from './planChat';
import './rtTheme.css';

/* RT Network — client quote builder (#plan).
   RT light brand; standalone from the dark CRM. Submits to /api/quotes (D1),
   falling back to the Rising Tide Formspree inbox when the API is absent. */

const FORMSPREE = 'https://formspree.io/f/mqeovdkp';
const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding' },
  { id: 'corporate', label: 'Corporate' },
  { id: 'party', label: 'Party' },
];
const STEPS = ['Basics', 'Venue', 'Services', 'Your quote', 'Contact'];

function makeRef() {
  return `RT-${Date.now().toString(36).toUpperCase()}`;
}

/* Turnstile is entirely optional: without VITE_TURNSTILE_SITE_KEY set, this
   hook never loads the widget and submission proceeds unverified (the
   server applies the same rule — verifyTurnstile passes with no secret set). */
function useTurnstile(containerRef) {
  const [token, setToken] = useState(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;
    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return;
      window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (t) => setToken(t),
        'expired-callback': () => setToken(null),
      });
    };
    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.onload = renderWidget;
      document.head.appendChild(script);
    }
  }, [siteKey]);

  return { enabled: !!siteKey, token };
}

/* Live catalog from D1 (any provider onboarded via the operator's Providers
   tab shows up here immediately, no deploy) — falls back to the static
   bundled list on any failure (offline, local dev without wrangler, etc.),
   so onboarding issues server-side never break the builder for a client. */
function useCatalog() {
  const [venues, setVenues] = useState(STATIC_VENUES);
  const [services, setServices] = useState(STATIC_SERVICES);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/catalog')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => {
        if (cancelled) return;
        if (Array.isArray(d.venues) && d.venues.length) setVenues(d.venues);
        if (Array.isArray(d.services) && d.services.length) setServices(d.services);
      })
      .catch(() => {}); // silent — static defaults already in state
    return () => { cancelled = true; };
  }, []);

  return { venues, services };
}

async function submitQuote(payload, turnstileToken) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, turnstile_token: turnstileToken || undefined }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (res.ok) return { via: 'api', ...(await res.json()) };
    if (res.status === 400) {
      const body = await res.json().catch(() => ({}));
      throw Object.assign(new Error(body.error || 'Invalid request'), { fatal: true });
    }
  } catch (e) {
    if (e.fatal) throw e;
    // network/5xx → fall through to the email fallback
  }
  const ref = makeRef();
  const fs = await fetch(FORMSPREE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ _subject: `RT Network quote ${ref}`, email: payload.client_email, ref, quote: payload }),
  });
  if (!fs.ok) throw new Error('We could not send your request — please email hello@risingtide.store');
  return { via: 'formspree', ref };
}

export default function PlanEvent() {
  const [mode, setMode] = useState('chat');          // chat | steps
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ type: 'wedding', date: '', guests: 80, budget: '' });
  const [venueId, setVenueId] = useState(null);
  const [selected, setSelected] = useState({});      // kind -> provider id (one per category)
  const [caps, setCaps] = useState({});              // kind -> max €/guest cap (unset = no cap)
  const [hours, setHours] = useState(5);
  const [staffCount, setStaffCount] = useState(2);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', notes: '' });
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);        // { via, ref }
  const [error, setError] = useState(null);
  const turnstileRef = useRef(null);
  const turnstile = useTurnstile(turnstileRef);
  const { venues: VENUES, services: SERVICES } = useCatalog();

  const guests = Number(form.guests) || 0;
  const venue = VENUES.find(v => v.id === venueId) || null;

  const lines = useMemo(() => {
    const out = [];
    if (venue) out.push({ id: venue.id, label: `${venue.name} — venue`, amount: lineTotal(venue, { guests, hours }) });
    for (const s of SERVICES) {
      if (selected[s.kind] !== s.id) continue;
      const opts = { guests, hours, headcount: s.kind === 'staff' ? staffCount : 1 };
      const detail = s.pricing.model === 'per_person' ? ` — ${guests} × €${s.pricing.amount}`
        : s.pricing.model === 'per_hour' ? (s.kind === 'staff' ? ` — ${staffCount} × ${hours}h × €${s.pricing.amount}` : ` — ${hours}h × €${s.pricing.amount}`)
        : '';
      out.push({ id: s.id, label: `${s.name}${detail}`, amount: lineTotal(s, opts) });
    }
    return out;
  }, [venue, SERVICES, selected, guests, hours, staffCount]);

  /* Service groups + per-guest slider bounds, recomputed as guests/hours change. */
  const serviceGroups = useMemo(() => {
    const kinds = [...new Set(SERVICES.map(s => s.kind))];
    return kinds.map(kind => {
      const options = SERVICES.filter(s => s.kind === kind);
      const opts = { guests: Math.max(guests, 1), hours, headcount: kind === 'staff' ? staffCount : 1 };
      const perGuest = Object.fromEntries(options.map(o => [o.id, effectivePerGuest(o, opts)]));
      const values = Object.values(perGuest);
      return {
        kind, options, perGuest,
        sliderMin: Math.floor(Math.min(...values)),
        sliderMax: Math.ceil(Math.max(...values)),
        hasSlider: options.length > 1,
      };
    });
  }, [SERVICES, guests, hours, staffCount]);

  const total = lines.reduce((s, l) => s + l.amount, 0);
  const budget = Number(form.budget) || 0;
  const overBudget = budget > 0 && total > budget;

  /* Deterministic run of show from the current package — no AI. */
  const runOfShow = useMemo(() => {
    if (!venue && lines.length === 0) return [];
    return buildRunOfShow({
      eventType: form.type, hours, guests, staffCount,
      selections: selected, venueName: venue?.name || 'the venue',
    });
  }, [form.type, hours, guests, staffCount, selected, venue, lines.length]);

  /* Concierge chat → same state as the stepper. */
  const chatSlots = {
    event_type: form.type, event_date: form.date || null, guests, budget: budget || null,
    venue_id: venueId, selections: selected, hours, staff_count: staffCount,
  };
  function applySlots(s) {
    if (!s || typeof s !== 'object') return;
    setForm(f => ({
      ...f,
      ...(s.event_type && ['wedding', 'corporate', 'party'].includes(s.event_type) ? { type: s.event_type } : {}),
      ...(s.event_date ? { date: s.event_date } : {}),
      ...(Number.isFinite(s.guests) && s.guests > 0 ? { guests: Math.min(s.guests, 600) } : {}),
      ...(Number.isFinite(s.budget) && s.budget > 0 ? { budget: s.budget } : {}),
    }));
    if (s.venue_id && VENUES.some(v => v.id === s.venue_id)) setVenueId(s.venue_id);
    if (s.selections && typeof s.selections === 'object') {
      const valid = {};
      for (const [kind, id] of Object.entries(s.selections)) {
        if (id === null) valid[kind] = null;
        else if (SERVICES.some(x => x.id === id && x.kind === kind)) valid[kind] = id;
      }
      if (Object.keys(valid).length) setSelected(sel => ({ ...sel, ...valid }));
    }
    if (Number.isFinite(s.hours) && s.hours >= 1 && s.hours <= 24) setHours(s.hours);
    if (Number.isFinite(s.staff_count) && s.staff_count >= 1 && s.staff_count <= 20) setStaffCount(s.staff_count);
  }

  const canNext = [
    form.type && guests > 0,                                   // basics
    !!venue,                                                   // venue
    true,                                                      // services (optional)
    lines.length > 0,                                          // summary
    contact.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)
      && agreedTerms && (!turnstile.enabled || !!turnstile.token),        // contact
  ][step];

  async function handleSubmit() {
    setSending(true);
    setError(null);
    try {
      const payload = {
        event_type: form.type,
        event_date: form.date || null,
        guests,
        budget: budget || null,
        client_name: contact.name.trim(),
        client_email: contact.email.trim(),
        client_phone: contact.phone.trim() || null,
        items: lines.map(l => ({ provider_id: l.id, label: l.label, amount_eur: l.amount })),
        payload: { hours, staffCount, notes: contact.notes.trim() || null, run_of_show: runOfShow },
      };
      setResult(await submitQuote(payload, turnstile.token));
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  if (result) {
    return (
      <div className="rt-light">
        <div className="rt-wrap" style={{ paddingTop: 40, textAlign: 'center' }}>
          <img src="/rt-logo-white.webp" alt="Rising Tide" className="rt-logo" style={{ margin: '0 auto 28px' }} />
          <div className="rt-kicker">Request received</div>
          <h1 className="rt-h1">You're in the tide. 🌊</h1>
          <p className="rt-lead">
            Your quote reference is <strong className="rt-mono">{result.ref}</strong>.
            Every provider in your package is being asked to confirm — we'll get back to you at <strong>{contact.email}</strong>.
          </p>
          {result.via === 'formspree' && (
            <p className="rt-note" style={{ marginBottom: 20 }}>
              Your request was sent by email and will be confirmed manually.
            </p>
          )}
          <div className="rt-card" style={{ textAlign: 'left', marginTop: 10 }}>
            {lines.map(l => (
              <div className="rt-line" key={l.id}><span>{l.label}</span><span>€{l.amount.toLocaleString()}</span></div>
            ))}
            <div className="rt-line" style={{ fontWeight: 700 }}><span>Total</span><span>€{total.toLocaleString()}</span></div>
          </div>
          {runOfShow.length > 0 && (
            <div className="rt-card" style={{ textAlign: 'left', marginTop: 14 }}>
              <div className="rt-kicker" style={{ marginBottom: 8 }}>Draft run of show</div>
              {runOfShow.map((r, i) => (
                <div className="rt-line" key={i} style={{ padding: '6px 0' }}>
                  <span><span className="rt-mono" style={{ marginRight: 10 }}>{r.time}</span>{r.title}</span>
                  <span className="rt-note" style={{ whiteSpace: 'nowrap' }}>{r.owner}</span>
                </div>
              ))}
            </div>
          )}
          <p className="rt-note" style={{ marginTop: 24 }}>
            Questions? <a href="mailto:hello@risingtide.store" style={{ color: 'var(--rt-teal)' }}>hello@risingtide.store</a>
          </p>
          <p className="rt-note" style={{ marginTop: 12 }}>
            <a href="#impressum" style={{ color: 'var(--rt-muted)', marginRight: 14 }}>Impressum</a>
            <a href="#datenschutz" style={{ color: 'var(--rt-muted)' }}>Datenschutz</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rt-light">
      <div className="rt-wrap">
        <div className="rt-header">
          <img src="/rt-logo-white.webp" alt="Rising Tide Collective" className="rt-logo" />
          <span className="rt-pill teal">RT Network</span>
        </div>

        <div className="rt-kicker">Plan your event</div>
        <h1 className="rt-h1">{mode === 'chat' ? 'Tell us about it' : STEPS[step]}</h1>

        {mode === 'chat' ? (
          <PlanChat
            slots={chatSlots}
            applySlots={applySlots}
            onComplete={() => { setMode('steps'); setStep(venueId ? 3 : 1); }}
            onSwitchToSteps={() => setMode('steps')}
          />
        ) : (
        <>
        <div className="rt-steps">
          {STEPS.map((s, i) => <div key={s} className={`rt-step-dot ${i <= step ? 'done' : ''}`} />)}
        </div>

        {step === 0 && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label>Event type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {EVENT_TYPES.map(t => (
                  <button key={t.id} className={`rt-btn ${form.type === t.id ? 'teal' : 'out'}`} style={{ flex: 1 }}
                    onClick={() => setForm(f => ({ ...f, type: t.id }))}>{t.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label>Date (if you have one)</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label>Guest count</label>
              <input type="number" min="1" max="600" value={form.guests} onChange={e => setForm(f => ({ ...f, guests: e.target.value }))} />
            </div>
            <div>
              <label>Budget in € (optional)</label>
              <input type="number" min="0" placeholder="e.g. 8000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'grid', gap: 14 }}>
            {VENUES.map(v => {
              const cap = venueCapacityFor(v, form.type);
              const over = guests > cap;
              return (
                <div key={v.id}
                  className={`rt-card selectable ${venueId === v.id ? 'selected' : ''} ${over ? 'disabled' : ''}`}
                  onClick={() => !over && setVenueId(v.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                    <strong className="rt-display" style={{ fontSize: 18 }}>{v.name}</strong>
                    <span className="rt-mono" style={{ fontSize: 13 }}>{priceLabel(v)}</span>
                  </div>
                  <p className="rt-note" style={{ margin: '6px 0' }}>{v.blurb}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {v.founding && <span className="rt-pill teal">Founding member</span>}
                    <span className={`rt-pill ${over ? 'red' : ''}`}>
                      {over ? `Over capacity — max ${cap} ${form.type === 'party' ? 'standing' : 'seated'}` : `Up to ${cap} ${form.type === 'party' ? 'standing' : 'seated'}`}
                    </span>
                  </div>
                </div>
              );
            })}
            {guests > 300 && guests <= 600 && (
              <p className="rt-note">For {guests} guests: Lilium + Fluxbau are neighbors and co-rent for combined events up to 600 — <a href="mailto:hello@risingtide.store" style={{ color: 'var(--rt-teal)' }}>ask us</a>.</p>
            )}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gap: 26 }}>
            {serviceGroups.map(group => {
              const cap = Math.min(caps[group.kind] ?? group.sliderMax, group.sliderMax);
              return (
                <div key={group.kind}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <strong className="rt-display" style={{ fontSize: 19 }}>{KIND_LABELS[group.kind]}</strong>
                    {selected[group.kind] && <span className="rt-note">tap again to remove</span>}
                  </div>

                  {group.hasSlider && (
                    <div style={{ marginBottom: 12 }}>
                      <label>Budget per guest — up to €{cap}</label>
                      <input
                        type="range"
                        min={group.sliderMin}
                        max={group.sliderMax}
                        step="1"
                        value={cap}
                        onChange={e => {
                          const v = Number(e.target.value);
                          setCaps(c => ({ ...c, [group.kind]: v }));
                          // Deselect a provider the new cap prices out.
                          const sel = group.options.find(o => o.id === selected[group.kind]);
                          if (sel && group.perGuest[sel.id] > v) {
                            setSelected(s => ({ ...s, [group.kind]: null }));
                          }
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }} className="rt-note">
                        <span>€{group.sliderMin}/guest</span>
                        <span>€{group.sliderMax}/guest</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gap: 10 }}>
                    {group.options.map(s => {
                      const perGuest = group.perGuest[s.id];
                      const priced_out = group.hasSlider && perGuest > cap;
                      const isSelected = selected[s.kind] === s.id;
                      const total = lineTotal(s, { guests, hours, headcount: s.kind === 'staff' ? staffCount : 1 });
                      return (
                        <div key={s.id}
                          className={`rt-card selectable ${isSelected ? 'selected' : ''} ${priced_out ? 'disabled' : ''}`}
                          onClick={() => !priced_out && setSelected(sel => ({ ...sel, [s.kind]: isSelected ? null : s.id }))}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                            <strong className="rt-display" style={{ fontSize: 16 }}>{s.name}</strong>
                            <span className="rt-mono" style={{ fontSize: 13 }}>{priceLabel(s)}</span>
                          </div>
                          <p className="rt-note" style={{ margin: '6px 0 8px' }}>{s.blurb}</p>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className={`rt-pill ${priced_out ? 'amber' : 'teal'}`}>
                              ≈ €{Math.round(perGuest * 100) / 100}/guest
                            </span>
                            <span className="rt-note">€{total.toLocaleString()} for {guests} guests</span>
                            {priced_out && <span className="rt-pill amber">above your per-guest budget</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {(selected['dj_av'] || selected['staff']) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label>Event hours</label>
                  <input type="number" min="1" max="24" value={hours} onChange={e => setHours(Number(e.target.value) || 1)} />
                </div>
                {selected['staff'] && (
                  <div>
                    <label>Crew size</label>
                    <input type="number" min="1" max="20" value={staffCount} onChange={e => setStaffCount(Number(e.target.value) || 1)} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="rt-card">
              {lines.map(l => (
                <div className="rt-line" key={l.id}><span>{l.label}</span><span>€{l.amount.toLocaleString()}</span></div>
              ))}
              <div className="rt-line" style={{ fontWeight: 700, fontSize: 16 }}><span>Total</span><span>€{total.toLocaleString()}</span></div>
            </div>
            {overBudget && (
              <p className="rt-note" style={{ color: 'var(--rt-amber)', marginTop: 12 }}>
                ⚠ €{(total - budget).toLocaleString()} over your €{budget.toLocaleString()} budget — you can still submit, or go back and adjust.
              </p>
            )}
            <p className="rt-note" style={{ marginTop: 12 }}>
              Submitting sends this package to each provider for confirmation. Nothing is booked or charged until everyone confirms.
            </p>
            {runOfShow.length > 0 && (
              <div className="rt-card" style={{ marginTop: 16 }}>
                <div className="rt-kicker" style={{ marginBottom: 8 }}>Your draft run of show</div>
                {runOfShow.map((r, i) => (
                  <div className="rt-line" key={i} style={{ padding: '6px 0' }}>
                    <span><span className="rt-mono" style={{ marginRight: 10 }}>{r.time}</span>{r.title}</span>
                    <span className="rt-note" style={{ whiteSpace: 'nowrap' }}>{r.owner}</span>
                  </div>
                ))}
                <p className="rt-note" style={{ marginTop: 8 }}>Auto-generated from your package — your organizer refines it with you.</p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div><label>Your name</label><input value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} /></div>
            <div><label>Email</label><input type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} /></div>
            <div><label>Phone / WhatsApp (optional)</label><input value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} /></div>
            <div><label>Anything we should know?</label><textarea rows="3" value={contact.notes} onChange={e => setContact(c => ({ ...c, notes: e.target.value }))} /></div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textTransform: 'none', letterSpacing: 0, fontSize: 13 }}>
              <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)}
                style={{ width: 18, height: 18, minHeight: 'unset', flexShrink: 0, marginTop: 2 }} />
              <span>
                I agree this sends my request to the providers I've selected for confirmation (not a booking yet), per the{' '}
                <a href="#terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rt-teal)' }}>terms</a>.
              </span>
            </label>

            {turnstile.enabled && <div ref={turnstileRef} />}

            {error && <p className="rt-error">{error}</p>}
          </div>
        )}
        </>
        )}

        <p className="rt-note" style={{ marginTop: 30, paddingBottom: 90 }}>
          <a href="#impressum" style={{ color: 'var(--rt-muted)', marginRight: 14 }}>Impressum</a>
          <a href="#datenschutz" style={{ color: 'var(--rt-muted)' }}>Datenschutz</a>
        </p>
      </div>

      <div className="rt-total-bar">
        <div className="rt-wrap-bar">
          <div>
            <div className="rt-note">Estimated total</div>
            <div className="rt-display" style={{ fontSize: 20 }}>€{total.toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {mode === 'chat' && lines.length > 0 && (
              <button className="rt-btn" onClick={() => { setMode('steps'); setStep(3); }}>Review quote</button>
            )}
            {mode === 'steps' && step > 0 && <button className="rt-btn out" onClick={() => setStep(s => s - 1)}>Back</button>}
            {mode === 'steps' && step < STEPS.length - 1 && <button className="rt-btn" disabled={!canNext} onClick={() => setStep(s => s + 1)}>Next</button>}
            {mode === 'steps' && step === STEPS.length - 1 && (
              <button className="rt-btn teal" disabled={!canNext || sending} onClick={handleSubmit}>
                {sending ? 'Sending…' : 'Submit for confirmation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
