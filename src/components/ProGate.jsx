import React, { useState } from 'react';
import { Zap, X } from 'lucide-react';
import { PricingModal } from './PricingModal';

/**
 * Wraps any clickable child. On click:
 *  - If plan === 'pro' OR feature is not gated → calls through to children's onClick
 *  - If plan === 'free' → shows upgrade modal instead
 *
 * Usage:
 *   <ProGate plan={plan} feature="unlimited events" onUpgrade={setShowPricing}>
 *     <button onClick={createEvent}>Create</button>
 *   </ProGate>
 */
export function ProGate({ plan, feature, children, onUpgrade }) {
  const [showModal, setShowModal] = useState(false);

  if (plan === 'pro') return children;

  const child = React.Children.only(children);

  const intercepted = React.cloneElement(child, {
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      setShowModal(true);
    },
  });

  return (
    <>
      {intercepted}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ background: '#0d1117', border: '1px solid rgba(139,92,246,0.3)', borderTop: '2px solid #8b5cf6', borderRadius: 8, padding: '2rem', maxWidth: 420, width: '100%' }}
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
              <div style={{ width: 40, height: 40, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#e2e8f0' }}>Pro feature</div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>Upgrade to unlock</div>
              </div>
            </div>

            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              <strong style={{ color: '#e2e8f0' }}>{feature}</strong> is available on the Solo plan (€29/mo) and above.
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowModal(false); onUpgrade?.(); }}
                style={{ flex: 1, padding: '0.65rem', background: '#8b5cf6', border: 'none', borderRadius: 4, color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em' }}
              >
                SEE PLANS
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '0.65rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 4, color: '#475569', fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', cursor: 'pointer' }}
              >
                NOT NOW
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
