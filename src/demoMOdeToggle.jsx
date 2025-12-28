// PreviewGamifiedApp.jsx
// Demo Mode Toggle + Shared Narrative Layer Implementation

import { useState, useEffect } from 'react';
import { Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';

/* =========================
   Narrative Layer (Shared)
   ========================= */

const narrativeMap = {
  event_created: {
    title: 'Event Initialized',
    copy: 'A blank operational space has been created. Structure gives intent form.'
  },
  task_completed: {
    title: 'Momentum Achieved',
    copy: 'Completion compounds. Each finished task reduces cognitive load.'
  },
  budget_locked: {
    title: 'Constraints Defined',
    copy: 'Boundaries create freedom. Financial clarity enables decisive action.'
  }
};

function NarrativeToast({ narrative, onClose }) {
  if (!narrative) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-purple-700 rounded-xl p-4 w-80 shadow-xl">
      <div className="flex items-start gap-3">
        <Sparkles className="text-purple-400 mt-1" size={18} />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-white">{narrative.title}</h4>
          <p className="text-xs text-slate-300 mt-1">{narrative.copy}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 text-xs">×</button>
      </div>
    </div>
  );
}

/* =========================
   Demo Mode Toggle
   ========================= */

function DemoModeToggle({ mode, setMode }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-300">
      <span>Classic</span>
      <button
        onClick={() => setMode(mode === 'classic' ? 'gamified' : 'classic')}
        className="p-1"
      >
        {mode === 'gamified' ? (
          <ToggleRight className="text-purple-500" size={22} />
        ) : (
          <ToggleLeft className="text-slate-500" size={22} />
        )}
      </button>
      <span>Gamified</span>
    </div>
  );
}

/* =========================
   Main App Wrapper
   ========================= */

export default function PreviewGamifiedApp({ children }) {
  const [demoMode, setDemoMode] = useState('classic');
  const [activeNarrative, setActiveNarrative] = useState(null);

  // Example hook: simulate task completion narrative
  useEffect(() => {
    if (demoMode === 'gamified') {
      const timer = setTimeout(() => {
        setActiveNarrative(narrativeMap.task_completed);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [demoMode]);

  return (
    <div className="relative min-h-screen">
      {/* Demo Toggle */}
      <div className="fixed top-4 right-6 z-50 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-md">
        <DemoModeToggle mode={demoMode} setMode={setDemoMode} />
      </div>

      {/* App Content */}
      <div
        className={demoMode === 'gamified' ? 'transition-all duration-300' : ''}
        data-demo-mode={demoMode}
      >
        {children}
      </div>

      {/* Narrative Toast */}
      <NarrativeToast
        narrative={activeNarrative}
        onClose={() => setActiveNarrative(null)}
      />
    </div>
  );
}
