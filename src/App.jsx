import React, { useState, useMemo } from 'react';
import {
  Calendar, Users, MessageSquare, Search, Plus, X, Send, DollarSign, MapPin, Star,
  Upload, Menu, Home, Settings, Building2, Edit, Paperclip, UserPlus
} from 'lucide-react';

/**
 * Single-file Event Planner App
 * - Dark base theme by default
 * - Theme toggle in Settings (dark <-> light)
 * - 80% dark backdrop for modals + blur
 * - Neon purple glow (#A020F0) for modals and key elements
 * - 2px borders, bolder fonts, higher contrast
 *
 * Copy-paste into /src/App.jsx (Vite + React). Keep lucide-react installed.
 */

/* Neon glow style using the chosen accent color: Neon Purple */
const NEON = '#A020F0';
const neonBoxShadow = `0 6px 30px -6px ${NEON}, 0 0 20px 2px ${NEON}55`;

/* -------------------- localStorage utilities -------------------- */
const STORAGE_KEYS = {
  EVENTS: 'athar_events',
  TASKS: 'athar_tasks',
  VENDORS: 'athar_vendors',
  CLIENTS: 'athar_clients',
  GUESTS: 'athar_guests',
  CONVERSATIONS: 'athar_conversations'
};

function loadFromStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from storage:', error);
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}

/* Small helper to apply dark / light tokenized classes */
function useThemeClasses(theme) {
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

export default function App() {
  const [theme, setTheme] = useState('dark'); // dark default
  const classes = useThemeClasses(theme);

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [activeEventTab, setActiveEventTab] = useState('overview');
  const [taskView, setTaskView] = useState('list'); // list, board, calendar
  const [showCreateTask, setShowCreateTask] = useState(false);

 /* -------------------- State with localStorage persistence -------------------- */
  const [events, setEvents] = useState(() => loadFromStorage(STORAGE_KEYS.EVENTS, [
    {
      id: 1, name: 'Summer Gala 2025', date: '2025-06-15', budget: 50000, spent: 32000,
      guests: 250, confirmed: 180, status: 'active', vendors: 8, tasks: 24, completed: 18,
      type: 'Corporate', location: 'Grand Ballroom, Downtown',
      description: 'Annual corporate gala celebrating company achievements and milestones.',
      team: [
        { id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' },
        { id: 2, name: 'James Cooper', role: 'Vendor Coordinator', email: 'james@eventflow.com', avatar: 'JC' },
        { id: 3, name: 'Emily Rodriguez', role: 'Guest Manager', email: 'emily@eventflow.com', avatar: 'ER' }
      ]
    },
    {
      id: 2, name: 'Thompson Wedding', date: '2025-07-22', budget: 75000, spent: 45000,
      guests: 180, confirmed: 150, status: 'active', vendors: 12, tasks: 31, completed: 22,
      type: 'Wedding', location: 'Crystal Palace, Waterfront',
      description: 'Elegant waterfront wedding celebration.',
      team: [{ id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' }]
    },
    {
      id: 3, name: 'Tech Conference 2025', date: '2025-08-10', budget: 120000, spent: 15000,
      guests: 500, confirmed: 320, status: 'planning', vendors: 5, tasks: 42, completed: 8,
      type: 'Conference', location: 'Convention Center',
      description: 'Three-day technology conference.',
      team: [{ id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' }]
    }
  ]));

  const [vendors, setVendors] = useState(() => loadFromStorage(STORAGE_KEYS.VENDORS, [
    { id: 1, name: 'Elegant Catering Co.', category: 'Catering', rating: 4.9, price: '$$$$', location: 'Downtown', reviews: 127, booked: true, lastContact: '2 days ago' },
    { id: 2, name: 'Harmony DJ Services', category: 'Entertainment', rating: 4.8, price: '$$$', location: 'Citywide', reviews: 89, booked: true, lastContact: '1 week ago' },
    { id: 3, name: 'Bloom & Petal', category: 'Florals', rating: 5.0, price: '$$$', location: 'Westside', reviews: 156, booked: false, lastContact: 'Never' },
    { id: 4, name: 'Gourmet Delights', category: 'Catering', rating: 4.8, price: '$$$', location: 'Midtown', reviews: 112, booked: false, lastContact: '1 month ago' },
    { id: 5, name: 'Live Band Collective', category: 'Entertainment', rating: 4.7, price: '$$$$', location: 'Downtown', reviews: 78, booked: false, lastContact: 'Never' }
  ]));

  const [venues, setVenues] = useState(() => loadFromStorage(STORAGE_KEYS.VENUES, [
    { id: 1, name: 'Grand Ballroom', location: 'Downtown', capacity: 300, price: '$$$$$', rating: 4.7, reviews: 203, booked: true, amenities: ['Kitchen', 'Parking', 'AV Equipment'] },
    { id: 2, name: 'Crystal Palace', location: 'Waterfront', capacity: 250, price: '$$$$', rating: 4.8, reviews: 189, booked: false, amenities: ['Waterfront', 'Indoor/Outdoor', 'Catering'] },
    { id: 3, name: 'Convention Center', location: 'Tech District', capacity: 1000, price: '$$$$$', rating: 4.6, reviews: 267, booked: false, amenities: ['Multiple Rooms', 'Tech Setup', 'Catering'] },
    { id: 4, name: 'Garden Estate', location: 'Suburbs', capacity: 150, price: '$$$', rating: 4.9, reviews: 145, booked: false, amenities: ['Outdoor', 'Gardens', 'Tents Available'] }
  ]));

  const [conversations, setConversations] = useState(() => loadFromStorage(STORAGE_KEYS.CONVERSATIONS, [
    {
      id: 1, vendor: 'Elegant Catering Co.', lastMessage: 'Menu proposal attached', time: '10:30 AM', unread: true,
      messages: [
        { sender: 'vendor', text: 'Hi! Thanks for reaching out about catering.', time: '9:15 AM', attachments: [] },
        { sender: 'me', text: 'We need catering for 250 guests.', time: '9:20 AM', attachments: [] },
        { sender: 'vendor', text: 'Menu proposal attached for your review', time: '10:30 AM', attachments: ['menu-proposal.pdf'] }
      ]
    },
    { id: 2, vendor: 'Harmony DJ Services', lastMessage: 'Confirming booking', time: '9:15 AM', unread: false,
      messages: [{ sender: 'vendor', text: 'Confirming booking for June 15th.', time: '9:15 AM', attachments: [] }]
    }
  ]));

  const [tasks, setTasks] = useState(() => loadFromStorage(STORAGE_KEYS.TASKS, [
    {
      id: 1, title: 'Finalize menu with caterer', event: 'Summer Gala 2025', dueDate: '2025-05-01',
      status: 'in-progress', priority: 'high', assignedTo: 'James Cooper', createdBy: 'Sarah Mitchell',
      description: 'Review and approve final menu selections for the gala. Ensure dietary restrictions are accommodated.',
      subtasks: [
        { id: 1, title: 'Review menu options', completed: true },
        { id: 2, title: 'Check dietary accommodations', completed: true },
        { id: 3, title: 'Get client approval', completed: false },
        { id: 4, title: 'Finalize with caterer', completed: false }
      ],
      tags: ['catering', 'urgent'],
      comments: [
        { user: 'James Cooper', text: 'Menu options look great. Awaiting client feedback.', time: '2 hours ago' }
      ],
      attachments: ['menu-options.pdf', 'dietary-requirements.xlsx']
    },
    {
      id: 2, title: 'Send venue contract', event: 'Thompson Wedding', dueDate: '2025-04-28',
      status: 'completed', priority: 'high', assignedTo: 'Sarah Mitchell', createdBy: 'Sarah Mitchell',
      description: 'Prepare and send signed venue contract to Grand Ballroom.',
      subtasks: [
        { id: 1, title: 'Review contract terms', completed: true },
        { id: 2, title: 'Get signatures', completed: true },
        { id: 3, title: 'Send to venue', completed: true }
      ],
      tags: ['legal', 'venue'],
      comments: [],
      attachments: ['venue-contract-signed.pdf']
    },
    {
      id: 3, title: 'Confirm DJ setup requirements', event: 'Summer Gala 2025', dueDate: '2025-05-10',
      status: 'pending', priority: 'medium', assignedTo: 'Emily Rodriguez', createdBy: 'James Cooper',
      description: 'Coordinate with DJ to confirm equipment needs, power requirements, and setup timing.',
      subtasks: [
        { id: 1, title: 'Contact DJ service', completed: false },
        { id: 2, title: 'Confirm power requirements', completed: false },
        { id: 3, title: 'Schedule setup time', completed: false }
      ],
      tags: ['entertainment', 'logistics'],
      comments: [],
      attachments: []
    },
    {
      id: 4, title: 'Review floral samples', event: 'Thompson Wedding', dueDate: '2025-04-30',
      status: 'in-progress', priority: 'high', assignedTo: 'Sarah Mitchell', createdBy: 'Sarah Mitchell',
      description: 'Meet with florist to review centerpiece and bouquet samples.',
      subtasks: [
        { id: 1, title: 'Schedule appointment', completed: true },
        { id: 2, title: 'Review samples', completed: false },
        { id: 3, title: 'Select final designs', completed: false }
      ],
      tags: ['florals', 'vendor-meeting'],
      comments: [
        { user: 'Sarah Mitchell', text: 'Appointment scheduled for Friday 2pm', time: '1 day ago' }
      ],
      attachments: ['floral-inspiration.jpg']
    }
  ]));

  const budgetItems = useMemo(() => ([
    { id: 1, category: 'Venue', vendor: 'Grand Ballroom', amount: 12000, paid: 12000, status: 'paid', event: 'Summer Gala 2025', dueDate: '2025-03-01' },
    { id: 2, category: 'Catering', vendor: 'Elegant Catering', amount: 15000, paid: 7500, status: 'partial', event: 'Summer Gala 2025', dueDate: '2025-06-01' },
    { id: 3, category: 'Entertainment', vendor: 'Harmony DJ', amount: 2500, paid: 0, status: 'pending', event: 'Summer Gala 2025', dueDate: '2025-06-10' }
  ]), []);

  const [guests, setGuests] = useState(() => loadFromStorage(STORAGE_KEYS.GUESTS, [
    { id: 1, name: 'John Smith', email: 'john@email.com', rsvp: 'confirmed', plusOne: true, event: 'Summer Gala 2025', table: 'A1', dietaryRestrictions: 'Vegetarian' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', rsvp: 'confirmed', plusOne: false, event: 'Summer Gala 2025', table: 'A1', dietaryRestrictions: 'None' },
    { id: 3, name: 'Michael Chen', email: 'michael@email.com', rsvp: 'pending', plusOne: true, event: 'Summer Gala 2025', table: 'B2', dietaryRestrictions: 'Gluten-free' }
  ]));

   // Auto-save to localStorage whenever data changes
  React.useEffect(() => {
    saveToStorage(STORAGE_KEYS.EVENTS, events);
  }, [events]);

  React.useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  React.useEffect(() => {
    saveToStorage(STORAGE_KEYS.VENDORS, vendors);
  }, [vendors]);

  React.useEffect(() => {
    saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
  }, [conversations]);

  React.useEffect(() => {
    saveToStorage(STORAGE_KEYS.GUESTS, guests);
  }, [guests]);

/* -------------------- Clients state + helpers (INSERT HERE) -------------------- */
// Clients state persisted in localStorage
const [clients, setClients] = useState(() => loadFromStorage(STORAGE_KEYS.CLIENTS, [
  { id: 1, name: 'Aisha Khan', company: 'Rising Tide', email: 'aisha@risingtide.com', phone: '+49 30 1234 5678', notes: 'Prefers email contact. VIP', address: 'Berlin', tags: ['VIP','repeat'], createdAt: '2025-04-01' },
  { id: 2, name: 'Luca Bauer', company: 'Nova Events', email: 'luca@nova.com', phone: '+49 40 9876 5432', notes: '', address: 'Hamburg', tags: ['prospect'], createdAt: '2025-05-12' }
]));

// Client UI state
const [showClientModal, setShowClientModal] = useState(false);
const [clientFormMode, setClientFormMode] = useState('add'); // 'add' | 'edit' | 'view'
const [selectedClient, setSelectedClient] = useState(null);

// Auto-save clients
React.useEffect(() => {
  saveToStorage(STORAGE_KEYS.CLIENTS, clients);
}, [clients]);

// CRUD helpers
function addClient(client) {
  const id = Math.max(...clients.map(c => c.id), 0) + 1;
  const newClient = { ...client, id, createdAt: new Date().toISOString() };
  setClients(prev => [...prev, newClient]);
  return newClient;
}

function updateClient(id, patch) {
  setClients(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)));
}

function deleteClient(id) {
  setClients(prev => prev.filter(c => c.id !== id));
}


  /* Filtering helpers */
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVenues = venues.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));

  /* -------------------- Nested UI components (kept inline to remain single file) -------------------- */

  /* Task Detail Modal (inline) */
  const TaskDetailModal = ({ task, onClose }) => {
    if (!task) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' /* 80% dark overlay */, backdropFilter: 'blur(8px)' }}
      >
        <div
          className={`w-full md:max-w-4xl md:max-h-[90vh] overflow-y-auto ${classes.panelBg} ${classes.border} rounded-2xl`}
          style={{
            boxShadow: neonBoxShadow,
            borderColor: '#2b2b2b'
          }}
        >
          <div className="sticky top-0 p-4 flex justify-between items-start border-b-2" style={{ borderColor: '#2b2b2b' }}>
            <div className="flex-1">
              <input
                type="text"
                defaultValue={task.title}
                className="w-full bg-transparent text-xl font-bold focus:outline-none"
                style={{ color: classes.strongText === 'text-slate-100' ? '#fff' : '#111' }}
              />
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs px-2 py-1 font-semibold ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                  {task.status}
                </span>
                <span className={`text-xs px-2 py-1 font-semibold ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-700'}`}>
                  {task.priority}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Description</label>
                <textarea rows="3" defaultValue={task.description} className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f8fafc', color: theme === 'dark' ? '#fff' : '#111' }} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-300">Subtasks</label>
                  <span className="text-xs text-slate-400">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} completed</span>
                </div>
                <div className="space-y-2">
                  {task.subtasks.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded-md">
                      <input type="checkbox" checked={s.completed} readOnly className="w-4 h-4" />
                      <span className={`text-sm ${s.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>{s.title}</span>
                    </div>
                  ))}
                  <button className="text-sm font-semibold mt-2 flex items-center gap-2 text-purple-300">
                    <Plus size={14} /> Add subtask
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-3 block">Comments</label>
                <div className="space-y-3">
                  {task.comments.map((c, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-700 text-white flex items-center justify-center rounded">{c.user.split(' ').map(n => n[0]).join('')}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{c.user}</span>
                          <span className="text-xs text-slate-400">{c.time}</span>
                        </div>
                        <p className="text-sm text-slate-200 mt-1">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <div className="w-8 h-8 bg-slate-600 flex items-center justify-center rounded text-slate-200">You</div>
                    <input type="text" placeholder="Add a comment..." className="flex-1 p-2 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#f8fafc', color: theme === 'dark' ? '#fff' : '#111' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">ASSIGNED TO</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-700 text-white flex items-center justify-center rounded text-xs">{task.assignedTo.split(' ').map(n => n[0]).join('')}</div>
                  <span className="text-sm font-semibold">{task.assignedTo}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">DUE DATE</label>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Calendar size={14} />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">EVENT</label>
                <div className="text-sm text-slate-200">{task.event}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">TAGS</label>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map(tag => <span key={tag} className="text-xs px-2 py-1 rounded-md bg-slate-700 text-slate-200">{tag}</span>)}
                </div>
              </div>

              {task.attachments.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block">ATTACHMENTS</label>
                  <div className="space-y-2">
                    {task.attachments.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700 cursor-pointer">
                        <Paperclip size={14} /> <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full py-2 rounded-md font-semibold bg-slate-700 hover:bg-slate-600">Add Attachment</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------- Clients UI components (INSERT HERE) -------------------- */

/* Client Detail Modal (view & edit) */
const ClientDetailModal = ({ client, mode = 'view', onClose }) => {
  const [form, setForm] = React.useState(client || {});
  React.useEffect(() => setForm(client || {}), [client]);

  if (!client && mode === 'view') return null;

  const applySave = () => {
    if (mode === 'add') {
      const created = addClient({
        name: form.name || 'Unnamed',
        company: form.company || '',
        email: form.email || '',
        phone: form.phone || '',
        notes: form.notes || '',
        address: form.address || '',
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });
      setSelectedClient(created);
      setClientFormMode('view');
      setShowClientModal(false);
      return;
    }
    if (mode === 'edit') {
      updateClient(client.id, {
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        notes: form.notes,
        address: form.address,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });
      setShowClientModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className={`${classes.panelBg} rounded-2xl p-6 w-full max-w-2xl ${classes.border}`} style={{ borderColor: '#2b2b2b', boxShadow: neonBoxShadow }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{mode === 'add' ? 'Add Client' : mode === 'edit' ? 'Edit Client' : client.name}</h2>
            {mode !== 'add' && <p className="text-sm text-slate-300 mt-1">{client.company}</p>}
          </div>
          <div className="flex gap-2">
            {mode === 'view' && <button onClick={() => setClientFormMode('edit')} className="py-2 px-3 rounded-md border-2">Edit</button>}
            <button onClick={() => { onClose(); setClientFormMode('view'); }} className="text-slate-300 hover:text-white p-2"><X size={20} /></button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.name || ''} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Full name" className="p-3 rounded-md" readOnly={mode === 'view'} />
            <input value={form.company || ''} onChange={(e) => setForm({...form, company: e.target.value})} placeholder="Company" className="p-3 rounded-md" readOnly={mode === 'view'} />
            <input value={form.email || ''} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="Email" className="p-3 rounded-md" readOnly={mode === 'view'} />
            <input value={form.phone || ''} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="Phone" className="p-3 rounded-md" readOnly={mode === 'view'} />
            <input value={form.address || ''} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="Address" className="p-3 rounded-md md:col-span-2" readOnly={mode === 'view'} />
            <input value={form.tags || (client && client.tags ? client.tags.join(', ') : '')} onChange={(e) => setForm({...form, tags: e.target.value})} placeholder="Tags (comma separated)" className="p-3 rounded-md md:col-span-2" readOnly={mode === 'view'} />
          </div>

          <div>
            <label className="text-sm text-slate-300">Notes</label>
            <textarea value={form.notes || ''} onChange={(e) => setForm({...form, notes: e.target.value})} rows="4" className="w-full p-3 rounded-md" readOnly={mode === 'view'} />
          </div>

          <div className="flex gap-3">
            {mode !== 'view' && <button onClick={applySave} className="py-2 px-4 rounded-md font-semibold" style={{ background: NEON, color: '#fff' }}>{mode === 'add' ? 'Create' : 'Save'}</button>}
            {mode === 'view' && <button onClick={() => { deleteClient(client.id); onClose(); }} className="py-2 px-4 rounded-md border-2">Delete</button>}
            <button onClick={() => { onClose(); setClientFormMode('view'); }} className="py-2 px-4 rounded-md">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Clients list subpanel (used inside Clients tab) */
const ClientsListPanel = () => {
  const [localQuery, setLocalQuery] = useState(searchQuery || '');
  const [localTagFilter, setLocalTagFilter] = useState('All');

  const visible = clients.filter(c => {
    const q = localQuery.toLowerCase();
    const matchesQuery = !q || (c.name && c.name.toLowerCase().includes(q)) || (c.company && c.company.toLowerCase().includes(q)) || (c.email && c.email.toLowerCase().includes(q));
    const matchesTag = localTagFilter === 'All' || (c.tags && c.tags.includes(localTagFilter));
    return matchesQuery && matchesTag;
  });

  // available tags for quick filter
  const tags = Array.from(new Set(clients.flatMap(c => c.tags || [])));

  return (
    <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <input value={localQuery} onChange={(e) => { setLocalQuery(e.target.value); setSearchQuery(e.target.value); }} placeholder="Search clients..." className="p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff' }} />
          <select value={localTagFilter} onChange={(e) => setLocalTagFilter(e.target.value)} className="p-3 rounded-md">
            <option>All</option>
            {tags.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={() => { setClientFormMode('add'); setSelectedClient(null); setShowClientModal(true); }} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2">
            <UserPlus size={14} /> Add Client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map(c => (
          <div key={c.id} className={`${classes.panelBg} ${classes.border} p-4 rounded-md cursor-pointer`} style={{ borderColor: '#2b2b2b' }}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">{c.name}</h3>
                <p className="text-xs text-slate-300">{c.company}</p>
              </div>
              <div className="text-xs text-slate-300">{c.tags && c.tags.slice(0,2).join(', ')}</div>
            </div>
            <div className="text-xs text-slate-300 mb-3">
              <div>{c.email}</div>
              <div>{c.phone}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setSelectedClient(c); setClientFormMode('view'); setShowClientModal(true); }} className="py-2 px-3 rounded-md border-2">View</button>
              <button onClick={() => { setSelectedClient(c); setClientFormMode('edit'); setShowClientModal(true); }} className="py-2 px-3 rounded-md">Edit</button>
            </div>
          </div>
        ))}
        {visible.length === 0 && <div className="text-slate-300 p-4">No clients found.</div>}
      </div>
    </div>
  );
};

  /* Event Detail Overlay (inline) */
  const EventDetailView = ({ event, onClose }) => {
    if (!event) return null;
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className="min-h-screen bg-slate-900">
          <div className={`${classes.panelBg} ${classes.border} rounded-b-2xl`} style={{ boxShadow: neonBoxShadow, borderColor: '#2b2b2b' }}>
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={onClose} className="flex items-center gap-2 text-slate-200">
                  <X size={18} /> Back to Events
                </button>
                <div className="flex gap-2">
                  <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2">
                    <Edit size={14} /> Edit
                  </button>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300 mb-4">
                <span className="flex items-center gap-1"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><MapPin size={14} />{event.location}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{event.status}</span>
              </div>

              <div className="flex gap-2 border-b-2 pb-4" style={{ borderColor: '#2b2b2b' }}>
                {['overview', 'team', 'vendors', 'tasks', 'budget', 'guests'].map(tab => (
                  <button key={tab} onClick={() => setActiveEventTab(tab)} className={`pb-2 px-3 text-sm font-semibold ${activeEventTab === tab ? 'text-purple-300 border-b-2 border-purple-400' : 'text-slate-300 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-6">
            {activeEventTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: '#2b2b2b', boxShadow: '0 8px 30px -10px rgba(0,0,0,0.6)' }}>
                    <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                    <p className="text-slate-300 text-sm leading-relaxed">{event.description}</p>
                  </div>

                  <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: '#2b2b2b', boxShadow: '0 8px 30px -10px rgba(0,0,0,0.6)' }}>
                    <h2 className="text-lg font-semibold text-white mb-4">Progress</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2 text-sm text-slate-300">
                          <span>Tasks Completion</span>
                          <span className="text-white font-semibold">{Math.round((event.completed / event.tasks) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded"><div className="h-full" style={{ width: `${(event.completed / event.tasks) * 100}%`, background: NEON }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm text-slate-300">
                          <span>Budget Used</span>
                          <span className="text-white font-semibold">{Math.round((event.spent / event.budget) * 100)}%</span>
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded"><div className="h-full" style={{ width: `${(event.spent / event.budget) * 100}%`, background: '#00d19a' }} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
                    <h2 className="text-base font-semibold text-white mb-4">Quick Stats</h2>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div className="flex justify-between"><span>Budget</span><span className="font-semibold text-white">${event.budget.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Spent</span><span className="font-semibold text-emerald-400">${event.spent.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Guests</span><span className="font-semibold text-white">{event.guests}</span></div>
                      <div className="flex justify-between"><span>Confirmed</span><span className="font-semibold text-emerald-400">{event.confirmed}</span></div>
                    </div>
                  </div>

                  <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
                    <h2 className="text-base font-semibold text-white mb-4">Team</h2>
                    <div className="space-y-3">
                      {event.team.map(member => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-700 flex items-center justify-center rounded font-bold text-white text-xs">{member.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{member.name}</p>
                            <p className="text-xs text-slate-300 truncate">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {activeEventTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">Tasks</h2>
                    <div className="flex gap-1 bg-slate-800 p-1 rounded">
                 <button onClick={() => setTaskView('list')} className={`px-3 py-1 text-xs font-semibold rounded ${taskView === 'list' ? 'bg-slate-700 text-white shadow' : 'text-slate-300'}`}>List</button>
                <button
  onClick={() => {
    setTaskView('board');
    console.log('🟣 taskView now = board');
  }}
  className={`px-3 py-1 text-xs font-semibold rounded ${taskView === 'board' ? 'bg-slate-700 text-white shadow' : 'text-slate-300'}`}
>
  Board
</button>
</div>
                  </div>
                  <button onClick={() => setShowCreateTask(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2"><Plus size={16} /> Add Task</button>
                </div>

                {taskView === 'list' && (
                  <div className={`${classes.panelBg} ${classes.border} rounded-md overflow-hidden`} style={{ borderColor: '#2b2b2b' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-800">
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Task</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Assigned</th>
                          <th className="text-center py-3 px-4 text-slate-300 font-semibold">Priority</th>
                          <th className="text-center py-3 px-4 text-slate-300 font-semibold">Status</th>
                          <th className="text-center py-3 px-4 text-slate-300 font-semibold">Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.filter(t => t.event === event.name).map(task => (
                          <tr key={task.id} onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }} className="border-b hover:bg-slate-700 cursor-pointer" style={{ borderColor: '#1f2937' }}>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{task.title}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</div>
                            </td>
                            <td className="py-3 px-4 text-slate-300">{task.assignedTo}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-700 text-slate-200'}`}>{task.priority}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-700 text-slate-200'}`}>{task.status}</span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-300">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {taskView === 'board' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Pending Column */}
                    <div className={`${classes.panelBg} ${classes.border} rounded-md p-4`} style={{ borderColor: '#2b2b2b' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase">Pending</h3>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded font-semibold">
                          {tasks.filter(t => t.event === event.name && t.status === 'pending').length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {tasks.filter(t => t.event === event.name && t.status === 'pending').map(task => (
                          <div 
                            key={task.id} 
                            onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }}
                            className="bg-slate-800 border-2 border-slate-700 p-3 rounded-md cursor-pointer hover:border-purple-500 transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-semibold text-white flex-1">{task.title}</h4>
                              <span className={`text-xs px-2 py-0.5 font-semibold rounded ml-2 ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-600 text-slate-200'}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">{task.assignedTo}</span>
                              <span className="text-slate-400">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            {task.subtasks.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-700">
                                <div className="text-xs text-slate-400">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</div>
                                <div className="w-full bg-slate-700 h-1 rounded mt-1">
                                  <div className="h-full bg-purple-500 rounded" style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }} />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {tasks.filter(t => t.event === event.name && t.status === 'pending').length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-sm">No pending tasks</div>
                        )}
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className={`${classes.panelBg} ${classes.border} rounded-md p-4`} style={{ borderColor: '#2b2b2b' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-blue-400 uppercase">In Progress</h3>
                        <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded font-semibold">
                          {tasks.filter(t => t.event === event.name && t.status === 'in-progress').length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {tasks.filter(t => t.event === event.name && t.status === 'in-progress').map(task => (
                          <div 
                            key={task.id}
                            onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }}
                            className="bg-slate-800 border-2 border-blue-900 p-3 rounded-md cursor-pointer hover:border-blue-500 transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-semibold text-white flex-1">{task.title}</h4>
                              <span className={`text-xs px-2 py-0.5 font-semibold rounded ml-2 ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-600 text-slate-200'}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">{task.assignedTo}</span>
                              <span className="text-slate-400">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            {task.subtasks.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-700">
                                <div className="text-xs text-slate-400">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</div>
                                <div className="w-full bg-slate-700 h-1 rounded mt-1">
                                  <div className="h-full bg-blue-500 rounded" style={{ width: `${(task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100}%` }} />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {tasks.filter(t => t.event === event.name && t.status === 'in-progress').length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-sm">No tasks in progress</div>
                        )}
                      </div>
                    </div>

                    {/* Completed Column */}
                    <div className={`${classes.panelBg} ${classes.border} rounded-md p-4`} style={{ borderColor: '#2b2b2b' }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-emerald-400 uppercase">Completed</h3>
                        <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-1 rounded font-semibold">
                          {tasks.filter(t => t.event === event.name && t.status === 'completed').length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {tasks.filter(t => t.event === event.name && t.status === 'completed').map(task => (
                          <div 
                            key={task.id}
                            onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }}
                            className="bg-slate-800 border-2 border-emerald-900 p-3 rounded-md cursor-pointer hover:border-emerald-500 transition-all opacity-75"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm font-semibold text-white flex-1 line-through">{task.title}</h4>
                              <span className={`text-xs px-2 py-0.5 font-semibold rounded ml-2 ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-600 text-slate-200'}`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">{task.assignedTo}</span>
                              <span className="text-emerald-400 flex items-center gap-1">
                                <span>✓</span> Completed
                              </span>
                            </div>
                          </div>
                        ))}
                        {tasks.filter(t => t.event === event.name && t.status === 'completed').length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-sm">No completed tasks</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* -------------------- Main App JSX -------------------- */

  return (
    <div className={`min-h-screen ${classes.appBg} font-sans`}>
      {/* Top mobile header */}
      <div className="md:hidden bg-slate-900 border-b-2" style={{ borderColor: '#1f2937' }}>
        <div className="p-4 flex justify-between items-center">
          <div className="text-lg font-bold text-white">Athar UX</div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            <Menu size={20} className="text-slate-200" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 ${classes.panelBg} ${classes.border} md:h-screen overflow-y-auto`}
             style={{ borderColor: '#2b2b2b', boxShadow: '0 6px 20px -8px rgba(0,0,0,0.6)' }}>
          <div className="hidden md:block p-6 border-b-2" style={{ borderColor: '#1f2937' }}>
            <h1 className="text-xl font-bold text-white">Athar UX</h1>
            <p className="text-xs text-slate-300 mt-1">Event planning platform</p>
          </div>
          <div className="p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'vendors', label: 'Vendors', icon: Building2 },
              { id: 'venues', label: 'Venues', icon: MapPin },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded ${activeTab === item.id ? 'bg-slate-800 text-purple-300 font-semibold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                  <Icon size={18} className="text-slate-300" />
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 p-6">
          {/* Top bar with stats and search */}
          <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md mb-6 flex items-center justify-between`} style={{ borderColor: '#2b2b2b', boxShadow: '0 6px 20px -10px rgba(0,0,0,0.6)' }}>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{events.length}</div>
                <div className="text-xs text-slate-300">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{tasks.filter(t => t.status === 'completed').length}</div>
                <div className="text-xs text-slate-300">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{conversations.filter(c => c.unread).length}</div>
                <div className="text-xs text-slate-300">Unread</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search..." className="pl-9 pr-4 py-2 rounded-md text-sm" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#f8fafc', color: theme === 'dark' ? '#fff' : '#111' }} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
                  <p className="text-sm text-slate-300">Overview of all your events and activities</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`${classes.panelBg} ${classes.border} p-6 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
                    <div className="flex justify-between items-center mb-5">
                      <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
                      <button onClick={() => setShowCreateEvent(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2 shadow-sm"><Plus size={14} />New</button>
                    </div>
                    <div className="space-y-3">
                      {events.map(event => (
                        <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }} className="border-2 rounded-md p-4 hover:shadow-md cursor-pointer transition-all" style={{ borderColor: '#1f2937', background: theme === 'dark' ? '#0b1220' : '#fff' }}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-white text-sm">{event.name}</h3>
                            <span className={`text-xs px-2 py-1 font-semibold ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{event.status}</span>
                          </div>
                          <div className="text-xs text-slate-300 mb-3 font-medium">{new Date(event.date).toLocaleDateString()} • {event.guests} guests</div>
                          <div className="w-full bg-slate-700 h-2 rounded overflow-hidden"><div className="h-full" style={{ width: `${(event.completed/event.tasks)*100}%`, background: NEON }} /></div>
                          <div className="text-xs text-slate-300 mt-2 font-medium">{event.completed}/{event.tasks} tasks completed</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className={`${classes.panelBg} ${classes.border} p-6 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
                      <h2 className="text-lg font-semibold text-white mb-5">High Priority Tasks</h2>
                      <div className="space-y-2">
                        {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').map(task => (
                          <div key={task.id} onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }} className="border-2 rounded-md p-4 hover:shadow-md cursor-pointer transition-all" style={{ borderColor: '#1f2937' }}>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-red-600 mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-white text-sm">{task.title}</h3>
                                <p className="text-xs text-slate-300 mt-1 font-medium">{task.event}</p>
                                <span className="text-xs text-slate-300 font-medium">Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`${classes.panelBg} ${classes.border} p-6 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
                      <h2 className="text-lg font-semibold text-white mb-5">Recent Activity</h2>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">EC</div>
                          <div className="flex-1">
                            <p className="text-sm text-white font-semibold">Elegant Catering sent menu proposal</p>
                            <p className="text-xs text-slate-300 mt-1">10:30 AM</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">✓</div>
                          <div className="flex-1">
                            <p className="text-sm text-white font-semibold">Venue contract completed</p>
                            <p className="text-xs text-slate-300 mt-1">Yesterday</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">SM</div>
                          <div className="flex-1">
                            <p className="text-sm text-white font-semibold">Sarah Mitchell joined team</p>
                            <p className="text-xs text-slate-300 mt-1">2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Events list */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-white">Events</h1>
                  <button onClick={() => setShowCreateEvent(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2"><Plus size={16} />Create Event</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map(event => (
                    <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }} className={`${classes.panelBg} ${classes.border} p-5 rounded-md cursor-pointer hover:shadow-lg`} style={{ borderColor: '#2b2b2b' }}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{event.name}</h3>
                          <span className="text-xs text-slate-300">{event.type}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 font-semibold ${event.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{event.status}</span>
                      </div>
                      <div className="space-y-2 mb-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Users size={14} />{event.guests} guests</div>
                        <div className="flex items-center gap-2"><DollarSign size={14} />${event.spent.toLocaleString()} / ${event.budget.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-800 border-2 rounded p-3" style={{ borderColor: '#1f2937' }}>
                        <div className="flex justify-between text-xs mb-2"><span className="text-slate-300">Progress</span><span className="font-semibold text-white">{Math.round((event.completed/event.tasks)*100)}%</span></div>
                        <div className="w-full bg-slate-700 h-1.5 rounded overflow-hidden"><div className="h-full" style={{ width: `${(event.completed/event.tasks)*100}%`, background: NEON }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendors */}
            {activeTab === 'vendors' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-white">Vendors</h1>
                <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
                  <div className="flex gap-3 mb-5">
                    <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#f8fafc', color: theme === 'dark' ? '#fff' : '#111' }} />
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }}>
                      <option>All</option>
                      <option>Catering</option>
                      <option>Entertainment</option>
                      <option>Florals</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredVendors.map(vendor => (
                      <div key={vendor.id} onClick={() => { setSelectedVendor(vendor); setShowVendorModal(true); }} className={`${classes.panelBg} ${classes.border} p-4 rounded-md cursor-pointer`} style={{ borderColor: '#2b2b2b' }}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded">
                            <Star className="text-amber-400" size={12} />
                            <span className="text-xs font-semibold text-white">{vendor.rating}</span>
                          </div>
                          {vendor.booked && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 font-semibold rounded">Booked</span>}
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">{vendor.name}</h3>
                        <p className="text-xs text-purple-300 mb-3">{vendor.category}</p>
                        <div className="flex justify-between text-xs text-slate-300">
                          <span className="text-emerald-400 font-semibold">{vendor.price}</span>
                          <span>{vendor.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Venues */}
            {activeTab === 'venues' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-white">Venues</h1>
                <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
                  <div className="mb-5">
                    <input type="text" placeholder="Search venues..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVenues.map(venue => (
                      <div key={venue.id} className={`${classes.panelBg} ${classes.border} p-4 rounded-md cursor-pointer`} style={{ borderColor: '#2b2b2b' }}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-slate-300">
                            <Star size={12} />
                            <span className="text-xs font-semibold">{venue.rating}</span>
                          </div>
                          {venue.booked && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 font-semibold rounded">Booked</span>}
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">{venue.name}</h3>
                        <p className="text-xs text-slate-300 mb-3 flex items-center gap-1"><MapPin size={12} />{venue.location}</p>
                        <div className="flex justify-between text-xs mb-3">
                          <span className="text-slate-300">Capacity: {venue.capacity}</span>
                          <span className="text-emerald-400 font-semibold">{venue.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {venue.amenities.slice(0, 2).map((amenity, idx) => (
                            <span key={idx} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{amenity}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-white">Messages</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
                    <h2 className="text-base font-semibold text-white mb-4">Conversations</h2>
                    <div className="space-y-2">
                      {conversations.map((conv, idx) => (
                        <div key={conv.id} onClick={() => setSelectedConversation(idx)} className={`p-3 cursor-pointer border-2 rounded ${selectedConversation === idx ? 'bg-slate-800 border-purple-600' : 'border-slate-700 hover:bg-slate-800'}`} style={{ borderColor: selectedConversation === idx ? NEON : '#1f2937' }}>
                          <h3 className="font-semibold text-white text-sm mb-1">{conv.vendor}</h3>
                          <p className="text-xs text-slate-300 truncate">{conv.lastMessage}</p>
                          {conv.unread && <span className="inline-block mt-2 text-xs bg-purple-600 text-white px-2 py-0.5 font-semibold rounded">New</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 ${classes.panelBg} p-4 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', border: '2px solid #1f2937' }}>
                    <div className="p-5 border-b-2" style={{ borderColor: '#1f2937' }}>
                      <h2 className="text-lg font-semibold text-white">{conversations[selectedConversation].vendor}</h2>
                    </div>

                    <div className="p-5 space-y-4 overflow-y-auto max-h-[500px]">
                      {conversations[selectedConversation].messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                          <div className={`p-3 max-w-md text-sm ${msg.sender === 'me' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-200'} rounded-md`}>
                            <p>{msg.text}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {msg.attachments.map((file, i) => (
                                  <div key={i} className="flex items-center gap-1 text-xs opacity-80">
                                    <Paperclip size={10} />{file}
                                  </div>
                                ))}
                              </div>
                            )}
                            <span className={`text-xs mt-1 block ${msg.sender === 'me' ? 'text-purple-100' : 'text-slate-400'}`}>{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-5 border-t-2" style={{ borderColor: '#1f2937' }}>
                      <div className="flex gap-3">
                        <button className="p-2 border-2 rounded-md" style={{ borderColor: '#1f2937' }}><Upload size={18} /></button>
                        <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type message..." className="flex-1 p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
                        <button className="px-5 bg-purple-700 hover:bg-purple-600 text-white font-semibold flex items-center gap-2 rounded-md"><Send size={16} />Send</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Clients & Settings */}
{(activeTab === 'clients' || activeTab === 'settings') && (
  <div className="space-y-4">
    {/* Clients tab */}
    {activeTab === 'clients' && (
      <>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span>{clients.length} clients</span>
            <button onClick={() => { setClientFormMode('add'); setSelectedClient(null); setShowClientModal(true); }} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2">
              <UserPlus size={14} /> New Client
            </button>
          </div>
        </div>

        <ClientsListPanel />

        {/* client modal (add/edit/view) */}
        {showClientModal && (clientFormMode === 'add'
          ? <ClientDetailModal client={null} mode="add" onClose={() => setShowClientModal(false)} />
          : <ClientDetailModal client={selectedClient} mode={clientFormMode} onClose={() => setShowClientModal(false)} />
        )}
      </>
    )}

    {/* Settings: show theme toggle (unchanged) */}
    {activeTab === 'settings' && (
      <div>
        <h1 className="text-2xl font-bold text-white capitalize">settings</h1>
        <div className={`${classes.panelBg} ${classes.border} p-8 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
          <p className="text-slate-300">General settings and preferences</p>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-2">Appearance</h3>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-300">Theme</span>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="py-2 px-4 rounded-md font-semibold" style={{ background: theme === 'dark' ? '#2a2540' : '#f3f0f8', color: theme === 'dark' ? '#fff' : '#111' }}>
                Toggle to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <div className="text-sm text-slate-300">Accent: <span style={{ color: NEON, fontWeight: 700 }}>Neon Purple</span></div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className={`${classes.panelBg} rounded-2xl p-6 w-full max-w-2xl ${classes.border}`} style={{ borderColor: '#2b2b2b', boxShadow: neonBoxShadow }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create New Event</h2>
              <button onClick={() => setShowCreateEvent(false)} className="text-slate-300 hover:text-white"><X size={20} /></button>
            </div>
           
            <form id="create-event-form" className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newEvent = {
                id: Math.max(...events.map(e => e.id), 0) + 1,
                name: formData.get('name'),
                type: formData.get('type'),
                date: formData.get('date'),
                budget: parseInt(formData.get('budget')) || 0,
                spent: 0,
                guests: 0,
                confirmed: 0,
                status: 'planning',
                vendors: 0,
                tasks: 0,
                completed: 0,
                location: 'TBD',
                description: '',
                team: []
              };
              setEvents([...events, newEvent]);
              setShowCreateEvent(false);
              e.target.reset();
            }}>
              <input name="name" type="text" placeholder="Event Name" required className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
              <select name="type" required className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }}>
                <option value="">Select event type...</option>
                <option>Wedding</option>
                <option>Corporate</option>
                <option>Birthday</option>
                <option>Conference</option>
              </select>
              <input name="date" type="date" required className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
              <input name="budget" type="number" placeholder="Budget ($)" required className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
              <button type="submit" className="w-full py-3 rounded-md font-bold" style={{ background: NEON, color: '#fff' }}>Create Event</button>
            </form>
          </div>
        </div>
      )}

      {/* Vendor modal */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className={`${classes.panelBg} rounded-2xl p-6 w-full max-w-2xl ${classes.border}`} style={{ borderColor: '#2b2b2b', boxShadow: neonBoxShadow }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedVendor.name}</h2>
                <p className="text-sm text-purple-300 mt-1 font-semibold">{selectedVendor.category}</p>
              </div>
              <button onClick={() => setShowVendorModal(false)} className="text-slate-300 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="text-amber-400" size={16} />
                  <span className="font-bold text-white">{selectedVendor.rating}</span>
                  <span className="text-slate-400">({selectedVendor.reviews} reviews)</span>
                </div>
                <div className="text-emerald-400 font-bold text-base">{selectedVendor.price}</div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={14} />
                  <span>{selectedVendor.location}</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">About</h3>
                <p className="text-sm text-slate-300 leading-relaxed">Professional {selectedVendor.category.toLowerCase()} services with over 10 years of experience. We specialize in creating unforgettable moments for your special day.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">Last Contact</h3>
                <p className="text-sm text-slate-300">{selectedVendor.lastContact}</p>
              </div>
              <div className="space-y-3">
                <button className="w-full py-3 rounded-md font-semibold" style={{ background: NEON, color: '#fff' }}>Send Inquiry</button>
                <button className="w-full py-3 rounded-md border-2" style={{ borderColor: '#2b2b2b', color: theme === 'dark' ? '#fff' : '#111' }}>Save to Favorites</button>
              </div>
            </div>
          </div>
        </div>
      )}
            
{/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className={`${classes.panelBg} rounded-2xl p-6 w-full max-w-2xl ${classes.border}`} style={{ borderColor: '#2b2b2b', boxShadow: neonBoxShadow }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create New Task</h2>
              <button onClick={() => setShowCreateTask(false)} className="text-slate-300 hover:text-white"><X size={20} /></button>
            </div>
            
            <form id="create-task-form" className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newTask = {
                id: Math.max(...tasks.map(t => t.id), 0) + 1,
                title: formData.get('title'),
                event: formData.get('event'),
                dueDate: formData.get('dueDate'),
                status: 'pending',
                priority: formData.get('priority'),
                assignedTo: formData.get('assignedTo'),
                createdBy: 'You',
                description: formData.get('description'),
                subtasks: [],
                tags: [],
                comments: [],
                attachments: []
              };
              setTasks([...tasks, newTask]);
              setShowCreateTask(false);
              e.target.reset();
            }}>
              <input name="title" type="text" placeholder="Task Title" required className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
              
              <select name="event" required className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }}>
                <option value="">Select event...</option>
                {events.map(event => (
                  <option key={event.id} value={event.name}>{event.name}</option>
                ))}
              </select>

              <textarea name="description" placeholder="Task Description" rows="3" className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
              
              <div className="grid grid-cols-2 gap-4">
                <select name="priority" required className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }}>
                  <option value="">Priority...</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <input name="dueDate" type="date" required className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />
              </div>

              <input name="assignedTo" type="text" placeholder="Assign to (e.g., Sarah Mitchell)" required className="w-full p-3 rounded-md" style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', color: theme === 'dark' ? '#fff' : '#111' }} />

              <button type="submit" className="w-full py-3 rounded-md font-bold" style={{ background: NEON, color: '#fff' }}>Create Task</button>
            </form>
          </div>
        </div>
      )}
              
       {/* Event detail & Task modals render behind overlay */}
      {showEventDetail && selectedEvent && (
        <EventDetailView
          event={selectedEvent}
          onClose={() => setShowEventDetail(false)}
        />
      )}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setShowTaskDetail(false)}
        />
      )}

    {/* Small footer spacing */}
            <div className="h-8" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
