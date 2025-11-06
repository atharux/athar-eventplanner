// ==== FILE: src/components/modals/ModalWrapper.jsx ====
import React from 'react';
const NEON = '#A020F0';
const neonBoxShadow = `0 6px 30px -6px ${NEON}, 0 0 20px 2px ${NEON}55`;
export default function ModalWrapper({ children, onClose, size='md' }){
  const maxWidth = size === 'lg' ? 'max-w-3xl' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor:'rgba(0,0,0,0.8)', backdropFilter:'blur(6px)' }}>
      <div className={`w-full ${maxWidth} rounded-2xl p-6`} style={{ boxShadow: neonBoxShadow, border:'2px solid #2b2b2b' }}>
        <div className="flex justify-end"><button onClick={onClose} className="text-slate-300">Close</button></div>
        {children}
      </div>
    </div>
  );
}