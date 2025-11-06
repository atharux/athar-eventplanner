// ==== FILE: src/App.jsx ==== 
import React, { useState, useEffect } from 'react';
import ClientsView from './components/views/ClientsView';
import { Calendar, Users, Menu, Search, Home } from 'lucide-react';
import useThemeClasses from './components/shared/useThemeClasses';

export default function App(){
  const [theme, setTheme] = useState('dark');
  const classes = useThemeClasses(theme);

  // Global demo state: clients + events (minimal for linking)
  const [clients, setClients] = useState(() => {
    try{
      const raw = localStorage.getItem('demo_clients_v1');
      return raw ? JSON.parse(raw) : [
        { id:1, company:'Acme Corp', contact:'Laura Peters', email:'laura@acme.com', phone:'+49 30 1234567', status:'active', events:[1,2], clientSince:'2022-03-12', notes:'Prefers waterfront venues', history:[{ts:Date.now(), msg:'Created'}] },
        { id:2, company:'The Thompson Family', contact:'James Thompson', email:'james@thompson.com', phone:'+49 30 9876543', status:'active', events:[2], clientSince:'2025-01-05', notes:'Wedding client', history:[{ts:Date.now(), msg:'Created'}] }
      ];
    }catch(e){ return []; }
  });

  const [events, setEvents] = useState(() => {
    try{
      const raw = localStorage.getItem('demo_events_v1');
      return raw ? JSON.parse(raw) : [
        { id:1, name:'Summer Gala 2025', date:'2025-06-15' },
        { id:2, name:'Thompson Wedding', date:'2025-07-22' }
      ];
    }catch(e){ return []; }
  });

  // persist
  useEffect(()=>{ localStorage.setItem('demo_clients_v1', JSON.stringify(clients)); }, [clients]);
  useEffect(()=>{ localStorage.setItem('demo_events_v1', JSON.stringify(events)); }, [events]);

  // clients CRUD handlers
  const addClient = (client) => {
    setClients(prev => [...prev, client]);
  };
  const editClient = (updated) => {
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
  };
  const deleteClient = (id) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className={`min-h-screen ${classes.appBg} font-sans`}>
      <div className="flex">
        <aside className={`${classes.panelBg} w-64 p-6 border-r-2`} style={{borderColor:'#2b2b2b'}}>
          <h1 className="text-xl font-bold text-white">Athar UX</h1>
          <nav className="mt-6 space-y-2">
            <button className="w-full text-left text-slate-300 flex items-center gap-2"><Home size={16}/> Dashboard</button>
            <button className="w-full text-left text-purple-300 font-semibold flex items-center gap-2"><Calendar size={16}/> Events</button>
            <button className="w-full text-left text-slate-300 flex items-center gap-2"><Users size={16}/> Clients</button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md mb-6`} style={{borderColor:'#2b2b2b'}}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Clients</h2>
                <p className="text-sm text-slate-300">Manage your clients — add, edit, link to events.</p>
              </div>
              <div>
                <label className="text-xs text-slate-300 mr-2">Theme</label>
                <select value={theme} onChange={e=>setTheme(e.target.value)} className="p-2 rounded-md">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>
          </div>

          <ClientsView
            clients={clients}
            onAddClient={addClient}
            onEditClient={editClient}
            onDeleteClient={deleteClient}
            events={events}
            classes={classes}
          />
        </main>
      </div>
    </div>
  );
}
