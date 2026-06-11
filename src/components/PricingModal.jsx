import React from 'react';
import { X, Check, Zap } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    period: 'forever',
    accent: '#475569',
    features: [
      'Up to 3 events',
      'Up to 3 clients',
      '50 guests per event',
      'Vendor directory (view)',
      'Task & budget tracking',
      'Venue discovery (5/day)',
    ],
    cta: 'Current plan',
    ctaDisabled: true,
  },
  {
    id: 'solo',
    name: 'Solo',
    price: '€29',
    period: '/month',
    accent: '#8b5cf6',
    badge: 'Most popular',
    features: [
      'Unlimited events',
      'Unlimited clients',
      'Unlimited guests',
      'Full vendor CRM (add & edit)',
      'AI event generation',
      'PDF proposal export',
      'Unlimited venue discovery',
      'Priority support',
    ],
    cta: 'Start free trial',
    ctaDisabled: false,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '€79',
    period: '/month',
    accent: '#06b6d4',
    features: [
      'Everything in Solo',
      'Team members (unlimited)',
      'Client portal (share-link)',
      'White-label PDF export',
      'Multi-event dashboard',
      'Dedicated onboarding call',
    ],
    cta: 'Contact sales',
    ctaDisabled: false,
  },
];

export function PricingModal({ onClose, onUpgrade }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderTop: '2px solid #8b5cf6', borderRadius: 8, padding: '2rem', maxWidth: 860, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
              EventFlow Plans
            </h2>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.7rem', color: '#475569', marginTop: 6 }}>
              Start free. Scale when you need it.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                background: plan.id === 'solo' ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${plan.id === 'solo' ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                borderTop: `2px solid ${plan.accent}`,
                borderRadius: 6,
                padding: '1.5rem',
                position: 'relative',
              }}
            >
              {plan.badge && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: plan.accent, color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: '0.6rem', fontWeight: 700, padding: '2px 10px', borderRadius: 99, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>
                  {plan.badge.toUpperCase()}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: plan.accent, letterSpacing: '0.1em', marginBottom: 6 }}>
                  {plan.name.toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#e2e8f0' }}>{plan.price}</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', color: '#475569' }}>{plan.period}</span>
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', color: '#94a3b8' }}>
                    <Check size={13} style={{ color: plan.accent, flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !plan.ctaDisabled && onUpgrade?.(plan.id)}
                disabled={plan.ctaDisabled}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  background: plan.ctaDisabled ? 'rgba(255,255,255,0.04)' : plan.accent,
                  border: plan.ctaDisabled ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  borderRadius: 4,
                  color: plan.ctaDisabled ? '#475569' : '#fff',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  cursor: plan.ctaDisabled ? 'default' : 'pointer',
                }}
              >
                {plan.cta.toUpperCase()}
              </button>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.6rem', color: '#374151', textAlign: 'center', marginTop: '1.5rem' }}>
          All plans include a 14-day free trial. No credit card required. Cancel anytime.
          <br />
          Questions? <a href="mailto:athar@atharux.com" style={{ color: '#8b5cf6', textDecoration: 'none' }}>athar@atharux.com</a>
        </p>
      </div>
    </div>
  );
}
