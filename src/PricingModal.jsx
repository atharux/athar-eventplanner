import { X, Zap, Building2, Check } from 'lucide-react';

const PLANS = [
  {
    id: 'solo',
    name: 'Solo',
    price: '€29',
    period: '/month',
    tagline: 'For independent event planners',
    accent: '#475569',
    features: [
      'Unlimited events',
      'Unlimited clients',
      'Unlimited guests',
      'AI event builder',
      'CSV export',
      'Vendor management',
      'Schedule & Gantt view',
      'Email support',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '€79',
    period: '/month',
    tagline: 'For teams & agencies',
    accent: '#00e5a0',
    badge: 'BEST VALUE',
    features: [
      'Everything in Solo',
      'Team collaboration',
      'Multi-user access',
      'Custom branding',
      'Priority support',
      'API access (coming soon)',
      'Bulk event import',
      'Dedicated onboarding',
    ],
  },
];

export function PricingModal({ onClose, onUpgrade }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
        backdropFilter: 'blur(6px)',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-bright)',
          borderRadius: 'var(--r-xl)',
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--glow-md)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.75rem 2rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: '0.35rem', fontWeight: 700 }}>
                EVENTFLOW PRO
              </div>
              <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                Unlock everything
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
                Free plan: 3 events · 3 clients · 50 guests. Upgrade to remove all limits.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '0.25rem', borderRadius: 'var(--r)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ padding: '1.5rem 2rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              style={{
                background: 'var(--surface-2)',
                border: `1px solid ${plan.id === 'agency' ? 'var(--accent-border)' : 'var(--border)'}`,
                borderRadius: 'var(--r-lg)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                boxShadow: plan.id === 'agency' ? 'var(--accent-glow)' : 'none',
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-1px',
                  right: '1rem',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0 0 var(--r) var(--r)',
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Plan name + icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r)', background: `${plan.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {plan.id === 'solo' ? <Zap size={16} color={plan.accent} /> : <Building2 size={16} color={plan.accent} />}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, color: 'var(--text-1)', fontSize: '1rem' }}>{plan.name}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: '0.72rem' }}>{plan.tagline}</div>
                </div>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-1)' }}>{plan.price}</span>
                <span style={{ color: 'var(--text-2)', fontSize: '0.8rem' }}>{plan.period}</span>
              </div>

              {/* Feature list */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-2)' }}>
                    <Check size={13} color={plan.accent} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => onUpgrade(plan.id)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 'var(--r)',
                  border: plan.id === 'agency' ? 'none' : '1px solid var(--accent-border)',
                  background: plan.id === 'agency' ? 'var(--accent)' : 'var(--accent-dim)',
                  color: plan.id === 'agency' ? '#fff' : 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'filter 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
              >
                GET {plan.name.toUpperCase()} →
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ padding: '0 2rem 1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-3)', fontSize: '0.72rem' }}>
            Cancel any time · Secure payment · 7-day free trial on all plans
          </p>
        </div>
      </div>
    </div>
  );
}
