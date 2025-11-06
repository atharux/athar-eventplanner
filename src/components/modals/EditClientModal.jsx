// ==== FILE: src/components/modals/EditClientModal.jsx ====
import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import { isEmailValid, requireValue } from '../../utils/validation.js';


export default function EditClientModal({ client, onClose, onEdit, events }){
  const [company, setCompany] = useState(client.company);
  const [contact, setContact] = useState(client.contact);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone);
  const [status, setStatus] = useState(client.status);
  const [linked, setLinked] = useState(client.events || []);
  const [notes, setNotes] = useState(client.notes || '');

  const [errors, setErrors] = useState({});

  const validate = ()=>{
    const e = {};
    if(!requireValue(company)) e.company = 'Company name is required';
    if(!requireValue(contact)) e.contact = 'Contact person is required';
    if(!requireValue(email)) e.email = 'Email is required';
    else if(!isEmailValid(email)) e.email = 'Invalid email address';
    return e;
  };

  const handleSave = ()=>{
    const e = validate();
    if(Object.keys(e).length){ setErrors(e); return; }
    const updated = { ...client, company, contact, email, phone, status, events: linked, notes, history:[...(client.history||[]), {ts:Date.now(), msg:'Edited'}] };
    onEdit(updated);
  };

  const handleDelete = ()=>{
    if(window.confirm('Delete client? This will unlink from events.')){
      // call parent onEdit with a deleted flag? We'll let parent provide delete separately via onEdit callback if desired.
      // Simpler: trigger a custom event on window so parent can catch; but here we assume parent passed a delete prop in real integration.
      // For this modular version we will call onEdit with null to signal delete
      onEdit(null);
    }
  };

  return (
    <ModalWrapper onClose={onClose}>
      <h3 className="text-lg font-semibold text-white mb-3">Edit Client</h3>
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

        <div>
          <label className="text-xs text-slate-300">Notes</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="w-full p-2 rounded-md" />
        </div>

        <div className="flex justify-between items-center">
          <button onClick={handleDelete} className="px-3 py-2 rounded-md bg-red-600 text-white">Delete Client</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-md bg-purple-700 text-white">Save</button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
