import { Lock } from 'lucide-react';

/**
 * ProGate — wraps a feature behind a pro-plan wall.
 * On free plan: shows upgrade prompt instead of children.
 * Props: plan, feature (label), onUpgrade (callback), children
 */
export function ProGate({ plan, feature, onUpgrade, children }) {
  if (plan !== 'free') return children;

  return (
    <button
      onClick={onUpgrade}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.85rem',
        background: 'var(--accent-dim)',
        border: '1px solid var(--accent-border)',
        borderRadius: 'var(--r)',
        color: 'var(--accent)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.68rem',
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '0.05em',
        whiteSpace: 'nowrap',
        transition: 'background 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(var(--ef-brand-rgb),0.18)';
        e.currentTarget.style.boxShadow = 'var(--accent-glow)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--accent-dim)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      title={`Upgrade to unlock: ${feature}`}
    >
      <Lock size={11} />
      PRO
    </button>
  );
}
