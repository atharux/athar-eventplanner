// ==== FILE: src/components/shared/useThemeClasses.jsx ====
import React from 'react';
export default function useThemeClasses(theme){
  const isDark = theme === 'dark';
  return {
    appBg: isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900',
    panelBg: isDark ? 'bg-slate-800' : 'bg-white',
    subtleBg: isDark ? 'bg-slate-700' : 'bg-slate-50',
    border: 'border-2',
    mutedText: isDark ? 'text-slate-300' : 'text-slate-500',
    strongText: isDark ? 'text-slate-100' : 'text-slate-900',
  };
}
