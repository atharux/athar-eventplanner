import React from 'react';

export default function DemoModeToggle({ mode, setMode }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1f2937',
        borderRadius: 8,
        padding: '6px 10px',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 12, color: '#94a3b8' }}>Demo Mode</span>
      <button
        onClick={() => setMode('classic')}
        style={{
          fontSize: 12,
          padding: '4px 8px',
          background: mode === 'classic' ? '#7c3aed' : '#020617',
          color: '#fff',
          borderRadius: 4,
          border: '1px solid #1f2937',
          cursor: 'pointer',
        }}
      >
        Classic
      </button>
      <button
        onClick={() => setMode('gamified')}
        style={{
          fontSize: 12,
          padding: '4px 8px',
          background: mode === 'gamified' ? '#7c3aed' : '#020617',
          color: '#fff',
          borderRadius: 4,
          border: '1px solid #1f2937',
          cursor: 'pointer',
        }}
      >
        Gamified
      </button>
    </div>
  );
}
