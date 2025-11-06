// ==== FILE: src/components/views/ClientsView.jsx ====
import React, { useState } from 'react';
import AddClientModal from '../modals/AddClientModal';
import EditClientModal from '../modals/EditClientModal';
import ClientDetailModal from '../modals/ClientDetailModal';
import { Plus, Edit, Trash } from 'lucide-react';

export default function ClientsView({ clients, onAddClient, onEditClient, onDeleteClient, events, classes }){
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [active, setActive] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Clients</h3>
        <button onClick={()=>setShowAdd(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-2"><Plus size={14}/> Add Client</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map(client=> (
          <div key={client.id} className={`${classes.panelBg} ${classes.border} p-4 rounded-md relative`} style={{borderColor:'#2b2b2b'}}>
            <div className="absolute right-3 top-3 flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
              <button onClick={(e)=>{ e.stopPropagation(); setActive(client); setShowEdit(true); }} className="p-1 rounded hover:bg-slate-700"><Edit size={14} /></button>
              <button onClick={(e)=>{ e.stopPropagation(); if(window.confirm('Delete client?')) onDeleteClient(client.id); }} className="p-1 rounded hover:bg-slate-700"><Trash size={14} /></button>
            </div>

            <div onClick={()=>{ setActive(client); setShowDetail(true); }} className="cursor-pointer">
              <h4 className="text-white font-semibold">{client.company}</h4>
              <div className="text-xs text-slate-300 mt-1">{client.contact} • {client.email}</div>
              <div className="flex justify-between items-center text-xs text-slate-400 mt-3">
                <div className="px-2 py-0.5 rounded text-xs font-semibold" style={{background: client.status==='active' ? '#D1FAE5' : '#FEF3C7'}}>{client.status}</div>
                <div>Events: {client.events?.length ?? client.events}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddClientModal onClose={()=>setShowAdd(false)} onAdd={(c)=>{ onAddClient(c); setShowAdd(false); }} events={events} />}
      {showEdit && active && <EditClientModal client={active} onClose={()=>setShowEdit(false)} onEdit={(c)=>{ onEditClient(c); setShowEdit(false); }} events={events} />}
      {showDetail && active && <ClientDetailModal client={active} onClose={()=>setShowDetail(false)} events={events} onEdit={(c)=>{ onEditClient(c); }} />}
    </div>
  );
}
