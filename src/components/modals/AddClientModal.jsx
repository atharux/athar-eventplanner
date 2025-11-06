// ==== FILE: src/components/modals/AddClientModal.jsx ====
import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import { isEmailValid, requireValue } from '../../utils/validation';

export default function AddClientModal({ onClose, onAdd, events }){
  const [company, setCompany] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('prospect');
  const [linked, setLinked] = useState([]);

  const [errors, setErrors] = useState({});

  const validate = ()=>{
    const e = {};
    if(!requireValue(company)) e.company = 'Company name is required';
    if(!requireValue(contact)) e.contact = 'Contact person is required';
    if(!requireValue(email)) e.email = 'Email is required';
    else if(!isEmailValid(email)) e.email = 'Invalid email address';
    return e;
  };

  const handleSubmit = ()=>{
    const e = validate();
    if(Object.keys(e).length){ setErrors(e); return; }
    const newClient = { id: Math.max(0, ...((JSON.parse(localStorage.getItem('demo_clients_v1'))||[]).map(c=>c.id))) + 1, company, contact, email, phone, status, events: linked, clientSince: new Date().toISOString().slice(0,10), notes:'', history:[{ts:Date.now(), msg:'Created via UI'}] };
    onAdd(newClient);
  };

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-lg font-semibold text-white mb-3">Add Client</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-300">Company *</label>
          <input value={company} onChange={e=>setCompany(e.target.value)} className={`w-full p-2 rounded-md ${errors.company ? 'border-red-500 border' : ''}`} />
          {errors.company && <div className="text-red-400 text-xs mt-1">{errors.company}</div>}
        </div>
        <div>
          <label className="text-xs text-slate-300">Contact Person *</label>
          <input value={contact} onChange={e=>setContact(e.target.value)} className={`w-full p-2 rounded-md ${errors.contact ? 'border-red-500 border' : ''}`} />
          {errors.contact && <div className="text-red-400 text-xs mt-1">{errors.contact}</div>}
        </div>
        <div>
          <label className="text-xs text-slate-300">Email *</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className={`w-full p-2 rounded-md ${errors.email ? 'border-red-500 border' : ''}`} />
          {errors.email && <div className="text-red-400 text-xs mt-1">{errors.email}</div>}
        </div>
        <div>
          <label className="text-xs text-slate-300">Phone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-2 rounded-md" />
        </div>

        <div>
          <label className="text-xs text-slate-300">Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full p-2 rounded-md">
            <option value="prospect">Prospect</option>
            <option value="active">Active</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-300">Link Events</label>
          <select multiple value={linked} onChange={e=>setLinked(Array.from(e.target.selectedOptions).map(o=>Number(o.value)))} className="w-full p-2 rounded-md">
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-purple-700 text-white">Create Client</button>
        </div>
      </div>
    </ModalWrapper>
  );
}
