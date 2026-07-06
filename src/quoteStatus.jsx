import React, { useEffect, useState } from 'react';
import './rtTheme.css';

/* Client-facing status page (#quote/<ref>) — read-only, no login. Answers
   "did anyone see my request?" without an inbound email or call. */

const STATUS_COPY = {
  submitted: { label: 'Awaiting confirmations', pill: 'amber' },
  confirmed: { label: "Fully booked — you're all set", pill: 'teal' },
  completed: { label: 'Event completed', pill: 'teal' },
  cancelled: { label: 'Cancelled', pill: 'red' },
};

export default function QuoteStatus({ ref }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/quote/${ref}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { if (!cancelled) { setData(d); setState('ok'); } })
      .catch(() => { if (!cancelled) setState('error'); });
    return () => { cancelled = true; };
  }, [ref]);

  if (state === 'loading') {
    return <div className="rt-light"><div className="rt-wrap" style={{ paddingTop: 60 }}><p className="rt-note">Loading…</p></div></div>;
  }
  if (state === 'error') {
    return (
      <div className="rt-light"><div className="rt-wrap" style={{ paddingTop: 60 }}>
        <h1 className="rt-h1">Reference not found</h1>
        <p className="rt-lead">Double-check the link, or email <a href="mailto:hello@risingtide.store" style={{ color: 'var(--rt-teal)' }}>hello@risingtide.store</a> with your reference.</p>
      </div></div>
    );
  }

  const status = STATUS_COPY[data.status] || STATUS_COPY.submitted;
  const confirmed = data.items.filter(i => i.status === 'confirmed').length;

  return (
    <div className="rt-light">
      <div className="rt-wrap" style={{ paddingTop: 40 }}>
        <div className="rt-header">
          <img src="/rt-logo-white.webp" alt="Rising Tide Collective" className="rt-logo" />
          <span className="rt-pill teal">Quote status</span>
        </div>

        <div className="rt-kicker">{data.ref}</div>
        <h1 className="rt-h1">{data.event_type} · {data.guests} guests</h1>
        <p className="rt-lead">{data.event_date || 'Date not yet set'}</p>

        <div className="rt-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={`rt-pill ${status.pill}`} style={{ fontSize: 12 }}>{status.label}</span>
            <span className="rt-note">{confirmed}/{data.items.length} confirmed</span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {data.items.map((it, i) => (
            <div key={i} className="rt-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <span>{it.provider_name} — {it.label}</span>
                <span className={`rt-pill ${it.status === 'confirmed' ? 'teal' : it.status === 'declined' ? 'red' : 'amber'}`}>{it.status}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="rt-note" style={{ marginTop: 24 }}>
          Questions? <a href="mailto:hello@risingtide.store" style={{ color: 'var(--rt-teal)' }}>hello@risingtide.store</a>
        </p>
      </div>
    </div>
  );
}
