import React, { useEffect, useState } from 'react';
import './rtTheme.css';

/* RT Network — provider backstage (#backstage/<token>).
   Capability-link auth: the URL token is the identity. API required —
   no offline fallback here. */

export default function Backstage({ token }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | invalid | error
  const [busy, setBusy] = useState(null);        // item id in flight
  const [flash, setFlash] = useState(null);
  const [declining, setDeclining] = useState(null); // item awaiting a reason
  const [reason, setReason] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/backstage/${token}`)
      .then(r => {
        if (r.status === 404) throw Object.assign(new Error('invalid'), { invalid: true });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => { if (!cancelled) { setData(d); setState('ok'); } })
      .catch(e => { if (!cancelled) setState(e.invalid ? 'invalid' : 'error'); });
    return () => { cancelled = true; };
  }, [token]);

  async function respond(item, action, declineReason) {
    setBusy(item.id);
    setDeclining(null);
    const prev = data;
    // optimistic
    setData(d => ({
      ...d,
      items: d.items.map(i => i.id === item.id
        ? { ...i, status: action === 'confirm' ? 'confirmed' : 'declined', responded_at: 'just now' }
        : i),
    }));
    try {
      const res = await fetch(`/api/backstage/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: item.id, action, reason: declineReason }),
      });
      if (!res.ok) throw new Error();
      setFlash(action === 'confirm' ? `Confirmed — you're booked for ${item.quote_ref}` : 'Declined');
      setTimeout(() => setFlash(null), 3000);
    } catch {
      setData(prev); // rollback
      setFlash('Could not save your response — try again');
      setTimeout(() => setFlash(null), 3000);
    } finally {
      setBusy(null);
      setReason('');
    }
  }

  if (state === 'loading') {
    return <div className="rt-light"><div className="rt-wrap" style={{ paddingTop: 60 }}><p className="rt-note">Loading your backstage…</p></div></div>;
  }
  if (state === 'invalid') {
    return (
      <div className="rt-light"><div className="rt-wrap" style={{ paddingTop: 60 }}>
        <h1 className="rt-h1">Link not recognized</h1>
        <p className="rt-lead">This backstage link is invalid or has been rotated. Contact <a href="mailto:hello@risingtide.store" style={{ color: 'var(--rt-teal)' }}>hello@risingtide.store</a> for a fresh one.</p>
      </div></div>
    );
  }
  if (state === 'error') {
    return (
      <div className="rt-light"><div className="rt-wrap" style={{ paddingTop: 60 }}>
        <h1 className="rt-h1">Portal unavailable</h1>
        <p className="rt-lead">We couldn't reach the network right now. Try again in a minute, or contact <a href="mailto:hello@risingtide.store" style={{ color: 'var(--rt-teal)' }}>hello@risingtide.store</a>.</p>
      </div></div>
    );
  }

  const pending = data.items.filter(i => i.status === 'pending');
  const past = data.items.filter(i => i.status !== 'pending');
  const ratePct = Math.round(data.provider.commission_rate * 1000) / 10;
  const neverHadAGig = data.items.length === 0;

  return (
    <div className="rt-light">
      <div className="rt-wrap">
        <div className="rt-header">
          <img src="/rt-logo-white.webp" alt="Rising Tide Collective" className="rt-logo" />
          <span className="rt-pill teal">Backstage</span>
        </div>

        <div className="rt-kicker">Gig requests</div>
        <h1 className="rt-h1">{neverHadAGig ? `Welcome, ${data.provider.name} 👋` : data.provider.name}</h1>
        <p className="rt-lead" style={{ marginBottom: 8 }}>
          {data.provider.founding && <span className="rt-pill teal" style={{ marginRight: 8 }}>Founding member</span>}
          <span className="rt-note">Commission: {ratePct}%{data.provider.founding ? ' founding rate' : ''}</span>
        </p>

        {flash && <p className="rt-note" style={{ color: 'var(--rt-teal)', margin: '10px 0' }}>{flash}</p>}

        {neverHadAGig ? (
          <div className="rt-card" style={{ marginTop: 18 }}>
            <p style={{ fontWeight: 700, marginBottom: 10 }}>You're all set.</p>
            <p className="rt-note" style={{ marginBottom: 14 }}>This link is yours — bookmark it. Here's what happens next:</p>
            <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.9 }}>
              <li>A client requests you → you get an email</li>
              <li>You see the gig and your exact payout, right here</li>
              <li>Confirm or decline — ten seconds</li>
            </ol>
            <p className="rt-note" style={{ marginTop: 14 }}>Nothing to do yet — we'll email you the moment a request comes in.</p>
          </div>
        ) : (
          <>
            <h2 className="rt-display" style={{ fontSize: 20, margin: '22px 0 12px' }}>Pending ({pending.length})</h2>
            {pending.length === 0 && <p className="rt-note">No pending requests — you're all caught up.</p>}
          </>
        )}
        <div style={{ display: 'grid', gap: 14 }}>
          {pending.map(item => (
            <div key={item.id} className="rt-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <strong className="rt-display" style={{ fontSize: 16 }}>
                  {item.event_type} · {item.event_date || 'date TBC'} · {item.guests} guests
                </strong>
                <span className="rt-mono rt-note">{item.quote_ref}</span>
              </div>
              <p className="rt-note" style={{ margin: '8px 0' }}>{item.label}</p>
              <div className="rt-line" style={{ borderBottom: 'none', padding: '4px 0' }}>
                <span>Gross</span><span>€{item.amount_eur.toLocaleString()}</span>
              </div>
              <div className="rt-line" style={{ borderBottom: 'none', padding: '4px 0', fontWeight: 700 }}>
                <span>You receive</span><span style={{ color: 'var(--rt-teal)' }}>€{item.payout_eur.toLocaleString()}</span>
              </div>
              {declining === item.id ? (
                <div style={{ marginTop: 12 }}>
                  <input value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Optional — why? (helps us match better next time)" style={{ marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="rt-btn out" style={{ flex: 1 }} onClick={() => respond(item, 'decline', reason || null)}>Confirm decline</button>
                    <button className="rt-btn out" style={{ flex: 1 }} onClick={() => { setDeclining(null); setReason(''); }}>Back</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <button className="rt-btn teal" style={{ flex: 1 }} disabled={busy === item.id}
                    onClick={() => respond(item, 'confirm')}>Confirm gig</button>
                  <button className="rt-btn out" style={{ flex: 1 }} disabled={busy === item.id}
                    onClick={() => setDeclining(item.id)}>Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {past.length > 0 && (
          <>
            <h2 className="rt-display" style={{ fontSize: 20, margin: '30px 0 12px' }}>Past responses</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {past.map(item => (
                <div key={item.id} className="rt-card" style={{ opacity: 0.75 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14 }}>{item.quote_ref} · {item.label}</span>
                    <span className={`rt-pill ${item.status === 'confirmed' ? 'teal' : 'red'}`}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="rt-note" style={{ marginTop: 34 }}>
          Confirming books you for the gig at the shown payout. Questions: <a href="mailto:hello@risingtide.store" style={{ color: 'var(--rt-teal)' }}>hello@risingtide.store</a>
        </p>
      </div>
    </div>
  );
}
