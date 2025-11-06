// ==== FILE: src/components/modals/ClientDetailModal.jsx ====
import React from 'react';
import ModalWrapper from './ModalWrapper';

export default function ClientDetailModal({ client, onClose, events, onEdit }){
  if(!client) return null;
  const linkedEvents = (client.events||[]).map(id => events.find(e=>e.id===id)).filter(Boolean);

  return (
    <ModalWrapper onClose={onClose} size="lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{client.company}</h3>
          <div className="text-xs text-slate-300 mt-1">{client.contact} • {client.email} • {client.phone}</div>
        </div>
        <div>
          <div className={`text-xs px-2 py-1 rounded ${client.status==='active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{client.status}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Linked Events</h4>
          <ul className="text-slate-200 text-sm">
            {linkedEvents.length ? linkedEvents.map(ev=> <li key={ev.id} className="mb-2">• {ev.name} — {new Date(ev.date).toLocaleDateString()}</li>) : <li className="text-slate-400">No linked events</li>}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Client History</h4>
          <div className="text-slate-200 text-sm space-y-2">
            {(client.history||[]).slice().reverse().map((h,idx)=> (
              <div key={idx} className="text-xs text-slate-300">{new Date(h.ts).toLocaleString()} — {h.msg}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={()=>{ onEdit(client); onClose(); }} className="px-4 py-2 rounded-md bg-purple-700 text-white">Edit Client</button>
      </div>
    </ModalWrapper>
  );
}
