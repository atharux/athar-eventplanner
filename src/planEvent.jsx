import React, { useMemo, useState } from 'react';
import { VENUES, SERVICES, lineTotal, priceLabel, venueCapacityFor } from './data/catalog';
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

async function submitQuote(payload) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ type: 'wedding', date: '', guests: 80, budget: '' });
  const [venueId, setVenueId] = useState(null);
  const [picked, setPicked] = useState({});          // service id -> true
  const [hours, setHours] = useState(5);
  const [staffCount, setStaffCount] = useState(2);
  const [contact, setContact] = useState({ name: '', email: '', phone: '', notes: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);        // { via, ref }
  const [error, setError] = useState(null);

  const guests = Number(form.guests) || 0;
  const venue = VENUES.find(v => v.id === venueId) || null;

  const lines = useMemo(() => {
    const out = [];
    if (venue) out.push({ id: venue.id, label: `${venue.name} — venue`, amount: lineTotal(venue, { guests, hours }) });
    for (const s of SERVICES) {
      if (!picked[s.id]) continue;
      const opts = { guests, hours, headcount: s.kind === 'staff' ? staffCount : 1 };
      const detail = s.pricing.model === 'per_person' ? ` — ${guests} × €${s.pricing.amount}`
        : s.pricing.model === 'per_hour' ? (s.kind === 'staff' ? ` — ${staffCount} × ${hours}h × €${s.pricing.amount}` : ` — ${hours}h × €${s.pricing.amount}`)
        : '';
      out.push({ id: s.id, label: `${s.name}${detail}`, amount: lineTotal(s, opts) });
    }
    return out;
  }, [venue, picked, guests, hours, staffCount]);

  const total = lines.reduce((s, l) => s + l.amount, 0);
  const budget = Number(form.budget) || 0;
  const overBudget = budget > 0 && total > budget;

  const canNext = [
    form.type && guests > 0,                                   // basics
    !!venue,                                                   // venue
    true,                                                      // services (optional)
    lines.length > 0,                                          // summary
    contact.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email), // contact
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
        payload: { hours, staffCount, notes: contact.notes.trim() || null },
      };
      setResult(await submitQuote(payload));
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
          <p className="rt-note" style={{ marginTop: 24 }}>
            Questions? <a href="mailto:hello@risingtide.store" style={{ color: 'var(--rt-teal)' }}>hello@risingtide.store</a>
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
        <h1 className="rt-h1">{STEPS[step]}</h1>
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
          <div style={{ display: 'grid', gap: 14 }}>
            {SERVICES.map(s => (
              <div key={s.id} className={`rt-card selectable ${picked[s.id] ? 'selected' : ''}`}
                onClick={() => setPicked(p => ({ ...p, [s.id]: !p[s.id] }))}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
                  <strong className="rt-display" style={{ fontSize: 17 }}>{s.name}</strong>
                  <span className="rt-mono" style={{ fontSize: 13 }}>{priceLabel(s)}</span>
                </div>
                <p className="rt-note" style={{ margin: '6px 0 0' }}>{s.blurb}</p>
              </div>
            ))}
            {(picked['dj-av'] || picked['staff']) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label>Event hours</label>
                  <input type="number" min="1" max="24" value={hours} onChange={e => setHours(Number(e.target.value) || 1)} />
                </div>
                {picked['staff'] && (
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
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'grid', gap: 16 }}>
            <div><label>Your name</label><input value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} /></div>
            <div><label>Email</label><input type="email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} /></div>
            <div><label>Phone / WhatsApp (optional)</label><input value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} /></div>
            <div><label>Anything we should know?</label><textarea rows="3" value={contact.notes} onChange={e => setContact(c => ({ ...c, notes: e.target.value }))} /></div>
            {error && <p className="rt-error">{error}</p>}
          </div>
        )}
      </div>

      <div className="rt-total-bar">
        <div className="rt-wrap-bar">
          <div>
            <div className="rt-note">Estimated total</div>
            <div className="rt-display" style={{ fontSize: 20 }}>€{total.toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {step > 0 && <button className="rt-btn out" onClick={() => setStep(s => s - 1)}>Back</button>}
            {step < STEPS.length - 1 && <button className="rt-btn" disabled={!canNext} onClick={() => setStep(s => s + 1)}>Next</button>}
            {step === STEPS.length - 1 && (
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
