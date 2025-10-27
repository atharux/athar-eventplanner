import React, { useEffect, useState } from 'react';
import {
  Calendar, Users, MessageSquare, Search, Plus, X, Send, CheckCircle, Clock, DollarSign,
  MapPin, Star, Upload, Menu, Home, Settings, UserPlus, Mail, Edit, Building2, FileText,
  BarChart3, ChevronRight, Trash2
} from 'lucide-react';

/**
 * EventPlannerApp
 *
 * - LocalStorage-backed mock API
 * - CRUD modals: events, vendors, guests, venues
 * - Task details modal
 * - Dark glassmorphism + electric blue neon accents
 *
 * Note: Tailwind CSS is required in the parent project. The component uses Tailwind utility classes.
 */

const NEON = '#1E90FF';
const LS_KEYS = {
  EVENTS: 'ep_events_v1',
  VENDORS: 'ep_vendors_v1',
  TASKS: 'ep_tasks_v1',
  BUDGET: 'ep_budget_v1',
  GUESTS: 'ep_guests_v1',
  CONVERSATIONS: 'ep_conversations_v1'
};

// Helpers: localStorage mock API
const loadOrSeed = (key, seed) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('localStorage load error', e);
    return seed;
  }
};

const save = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('localStorage save error', e);
  }
};

// Helper: generate ID
const nextId = (arr) => {
  if (!arr || arr.length === 0) return 1;
  return Math.max(...arr.map(a => a.id || 0)) + 1;
};

export default function EventPlannerApp() {
  // UI state (same as before plus new modals)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEditVendor, setShowEditVendor] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showEditGuest, setShowEditGuest] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showEditVenue, setShowEditVenue] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [activeEventTab, setActiveEventTab] = useState('overview');

  // -----------------------
  // Seed data exactly as provided by user (unchanged)
  // -----------------------
  const seedEvents = [
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
  ];

  const seedVendors = [
    { id: 1, name: 'Elegant Catering Co.', category: 'Catering', rating: 4.9, price: '$$$$', location: 'Downtown', reviews: 127, booked: true },
    { id: 2, name: 'Harmony DJ Services', category: 'Entertainment', rating: 4.8, price: '$$$', location: 'Citywide', reviews: 89, booked: true },
    { id: 3, name: 'Bloom & Petal', category: 'Florals', rating: 5.0, price: '$$$', location: 'Westside', reviews: 156, booked: false },
    { id: 4, name: 'Grand Ballroom', category: 'Venue', rating: 4.7, price: '$$$$', location: 'Central', reviews: 203, booked: true },
    { id: 5, name: 'Snapshot Studios', category: 'Photography', rating: 4.9, price: '$$$', location: 'East Bay', reviews: 94, booked: false },
    { id: 6, name: 'Sparkle Decor', category: 'Decorations', rating: 4.6, price: '$$', location: 'North', reviews: 71, booked: true },
    { id: 7, name: 'Gourmet Delights', category: 'Catering', rating: 4.8, price: '$$$', location: 'Midtown', reviews: 112, booked: false },
    { id: 8, name: 'Live Band Collective', category: 'Entertainment', rating: 4.7, price: '$$$$', location: 'Downtown', reviews: 78, booked: false }
  ];

  const seedConversations = [
    { id: 1, vendor: 'Elegant Catering Co.', lastMessage: 'Menu proposal attached', time: '10:30 AM', unread: true,
      messages: [
        { sender: 'vendor', text: 'Hi! Thanks for reaching out about catering.', time: '9:15 AM' },
        { sender: 'me', text: 'We need catering for 250 guests.', time: '9:20 AM' },
        { sender: 'vendor', text: 'Menu proposal attached for your review', time: '10:30 AM' }
      ]
    },
    { id: 2, vendor: 'Harmony DJ Services', lastMessage: 'Confirming booking', time: '9:15 AM', unread: false,
      messages: [{ sender: 'vendor', text: 'Confirming booking for June 15th.', time: '9:15 AM' }]
    }
  ];

  const seedTasks = [
    { id: 1, title: 'Finalize menu with caterer', event: 'Summer Gala 2025', dueDate: '2025-05-01', status: 'pending', priority: 'high', notes: '' },
    { id: 2, title: 'Send venue contract', event: 'Thompson Wedding', dueDate: '2025-04-28', status: 'completed', priority: 'high', notes: '' },
    { id: 3, title: 'Confirm DJ setup', event: 'Summer Gala 2025', dueDate: '2025-05-10', status: 'pending', priority: 'medium', notes: '' },
    { id: 4, title: 'Review floral samples', event: 'Thompson Wedding', dueDate: '2025-04-30', status: 'in-progress', priority: 'high', notes: '' }
  ];

  const seedBudget = [
    { id: 1, category: 'Venue', vendor: 'Grand Ballroom', amount: 12000, paid: 12000, status: 'paid', event: 'Summer Gala 2025' },
    { id: 2, category: 'Catering', vendor: 'Elegant Catering', amount: 15000, paid: 7500, status: 'partial', event: 'Summer Gala 2025' },
    { id: 3, category: 'Entertainment', vendor: 'Harmony DJ', amount: 2500, paid: 0, status: 'pending', event: 'Summer Gala 2025' }
  ];

  const seedGuests = [
    { id: 1, name: 'John Smith', email: 'john@email.com', rsvp: 'confirmed', plusOne: true, event: 'Summer Gala 2025', table: 'A1' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', rsvp: 'confirmed', plusOne: false, event: 'Summer Gala 2025', table: 'A1' },
    { id: 3, name: 'Michael Chen', email: 'michael@email.com', rsvp: 'pending', plusOne: true, event: 'Summer Gala 2025', table: 'B2' }
  ];

  // -----------------------
  // Load or seed into localStorage
  // -----------------------
  const [events, setEvents] = useState(() => loadOrSeed(LS_KEYS.EVENTS, seedEvents));
  const [vendors, setVendors] = useState(() => loadOrSeed(LS_KEYS.VENDORS, seedVendors));
  const [conversations, setConversations] = useState(() => loadOrSeed(LS_KEYS.CONVERSATIONS, seedConversations));
  const [tasks, setTasks] = useState(() => loadOrSeed(LS_KEYS.TASKS, seedTasks));
  const [budgetItems, setBudgetItems] = useState(() => loadOrSeed(LS_KEYS.BUDGET, seedBudget));
  const [guests, setGuests] = useState(() => loadOrSeed(LS_KEYS.GUESTS, seedGuests));

  // Keep localStorage updated whenever arrays change
  useEffect(() => save(LS_KEYS.EVENTS, events), [events]);
  useEffect(() => save(LS_KEYS.VENDORS, vendors), [vendors]);
  useEffect(() => save(LS_KEYS.CONVERSATIONS, conversations), [conversations]);
  useEffect(() => save(LS_KEYS.TASKS, tasks), [tasks]);
  useEffect(() => save(LS_KEYS.BUDGET, budgetItems), [budgetItems]);
  useEffect(() => save(LS_KEYS.GUESTS, guests), [guests]);

  // Derived: filteredVendors (search + category)
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Venues list (derived from vendors with category === 'Venue')
  const venues = vendors.filter(v => v.category === 'Venue');

  // -----------------------
  // CRUD: Events
  // -----------------------
  const handleCreateEvent = (payload) => {
    const newE = { id: nextId(events), ...payload };
    setEvents(prev => [newE, ...prev]);
    setShowCreateEvent(false);
    setSelectedEvent(newE);
    setShowEventDetail(true);
  };

  const handleUpdateEvent = (id, patch) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
    setShowEditEvent(false);
  };

  const handleDeleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setShowEventDetail(false);
  };

  // -----------------------
  // CRUD: Vendors & Venues (vendors array contains venues)
  // -----------------------
  const handleCreateVendor = (payload) => {
    const newV = { id: nextId(vendors), ...payload };
    setVendors(prev => [newV, ...prev]);
    setShowVendorModal(false);
  };

  const handleUpdateVendor = (id, patch) => {
    setVendors(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
    setShowEditVendor(false);
    setShowEditVenue(false);
  };

  const handleDeleteVendor = (id) => {
    setVendors(prev => prev.filter(v => v.id !== id));
    setShowVendorModal(false);
  };

  // -----------------------
  // CRUD: Guests
  // -----------------------
  const handleCreateGuest = (payload) => {
    const newG = { id: nextId(guests), ...payload };
    setGuests(prev => [newG, ...prev]);
    setShowGuestModal(false);
  };

  const handleUpdateGuest = (id, patch) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
    setShowEditGuest(false);
  };

  const handleDeleteGuest = (id) => {
    setGuests(prev => prev.filter(g => g.id !== id));
  };

  // -----------------------
  // Tasks: details, update
  // -----------------------
  const openTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleUpdateTask = (id, patch) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    setShowTaskDetail(false);
  };

  // -----------------------
  // Messaging (simple append, mark as read)
  // -----------------------
  const sendMessage = () => {
    const conv = conversations[selectedConversation];
    if (!conv) return;
    const newMsg = { sender: 'me', text: messageInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    const updated = { ...conv, messages: [...conv.messages, newMsg], lastMessage: messageInput, time: newMsg.time, unread: false };
    setConversations(prev => prev.map((c, i) => i === selectedConversation ? updated : c));
    setMessageInput('');
  };

  // -----------------------
  // UI helpers: style strings for glass + neon
  // -----------------------
  const glass = "bg-white/3 backdrop-blur-md border border-white/6";
  const neonOutline = `shadow-[0_0_18px_rgba(30,144,255,0.12)] ring-1 ring-[${NEON}]/20`;

  // -----------------------
  // Event detail view component (keeps most of your existing structure)
  // -----------------------
  const EventDetailView = ({ event }) => (
    <div className="fixed inset-0 bg-[#071018]/70 z-50 overflow-y-auto">
      <div className={`${glass} border-gray-700 sticky top-0`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setShowEventDetail(false)} className="text-gray-300 hover:text-white flex items-center gap-2">
              <X size={20} /> Back to Events
            </button>
            <div className="flex gap-2">
              <button onClick={() => { setShowEditEvent(true); }} className="bg-transparent border border-white/6 hover:bg-white/4 text-white px-4 py-2 text-sm flex items-center gap-2">
                <Edit size={16} /> Edit
              </button>
              <button onClick={() => handleDeleteEvent(event.id)} className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 text-sm flex items-center gap-2">
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
            <span className="flex items-center gap-1"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><MapPin size={14} />{event.location}</span>
            <span className={`px-2 py-0.5 text-xs ${event.status === 'active' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-amber-900/40 text-amber-300'}`}>{event.status}</span>
          </div>
          <div className="flex gap-2 mt-4 border-b border-white/6">
            {['overview', 'team', 'vendors', 'tasks', 'budget', 'guests'].map(tab => (
              <button key={tab} onClick={() => setActiveEventTab(tab)}
                className={`pb-2 px-3 text-sm font-medium capitalize ${activeEventTab === tab ? 'text-white border-b-2 border-[rgba(30,144,255,0.8)]' : 'text-gray-300 hover:text-white'}`}>
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
              <div className={`${glass} p-5`}>
                <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                <p className="text-gray-200 text-sm">{event.description}</p>
              </div>
              <div className={`${glass} p-5`}>
                <h2 className="text-lg font-semibold text-white mb-4">Progress</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-300">Tasks Completion</span>
                      <span className="text-white font-medium">{Math.round((event.completed / event.tasks) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/6 h-2 rounded"><div className="bg-[rgba(30,144,255,0.9)] h-full" style={{width: `${(event.completed / event.tasks) * 100}%`}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-300">Budget Used</span>
                      <span className="text-white font-medium">{Math.round((event.spent / event.budget) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/6 h-2 rounded"><div className="bg-emerald-400 h-full" style={{width: `${(event.spent / event.budget) * 100}%`}}></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className={`${glass} p-5`}>
                <h2 className="text-base font-semibold text-white mb-4">Quick Stats</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-300">Budget</span><span className="text-white font-medium">${event.budget.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">Spent</span><span className="text-emerald-400 font-medium">${event.spent.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">Guests</span><span className="text-white font-medium">{event.guests}</span></div>
                  <div className="flex justify-between"><span className="text-gray-300">Confirmed</span><span className="text-emerald-400 font-medium">{event.confirmed}</span></div>
                </div>
              </div>
              <div className={`${glass} p-5`}>
                <h2 className="text-base font-semibold text-white mb-4">Team</h2>
                <div className="space-y-3">
                  {event.team.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[rgba(30,144,255,0.14)] border border-[rgba(30,144,255,0.25)] flex items-center justify-center font-semibold text-[rgba(30,144,255,0.95)] text-xs">{member.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-gray-300 truncate">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeEventTab === 'team' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Team Members</h2>
              <button onClick={() => alert('Add Member flow - you can wire this to modal')} className="bg-[rgba(30,144,255,0.95)] hover:brightness-95 text-white px-4 py-2 text-sm flex items-center gap-2"><UserPlus size={16} />Add Member</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.team.map(member => (
                <div key={member.id} className={`${glass} p-5`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-[rgba(30,144,255,0.12)] flex items-center justify-center font-bold text-[rgba(30,144,255,0.95)]">{member.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">{member.name}</h3>
                      <p className="text-sm text-[rgba(30,144,255,0.85)]">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 flex items-center gap-2"><Mail size={12} /><span className="truncate">{member.email}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeEventTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Tasks</h2>
              <button onClick={() => alert('Create Task flow - wire to modal if needed')} className="bg-[rgba(30,144,255,0.95)] hover:brightness-95 text-white px-4 py-2 text-sm flex items-center gap-2"><Plus size={16} />Add Task</button>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.event === event.name).map(task => (
                <div key={task.id} className={`${glass} p-4 hover:border-[rgba(30,144,255,0.18)] cursor-pointer`} onClick={() => openTask(task)}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm mb-1">{task.title}</h3>
                      <p className="text-xs text-gray-300">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs ${task.status === 'completed' ? 'bg-emerald-900/40 text-emerald-300' : task.status === 'in-progress' ? 'bg-[#0b3a66]/30 text-[#63b3ff]' : 'bg-amber-900/40 text-amber-300'}`}>{task.status}</span>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.event === event.name).length === 0 && <div className="text-sm text-gray-300">No tasks for this event.</div>}
            </div>
          </div>
        )}

        {activeEventTab === 'budget' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Budget Breakdown</h2>
            <div className={`${glass} overflow-hidden`}>
              <table className="w-full text-sm">
                <thead><tr className="bg-white/3">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Vendor</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Amount</th>
                  <th className="text-right py-3 px-4 text-gray-300 font-medium">Paid</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {budgetItems.filter(i => i.event === event.name).map(item => (
                    <tr key={item.id} className="border-t border-white/6">
                      <td className="py-3 px-4 text-white">{item.category}</td>
                      <td className="py-3 px-4 text-gray-300">{item.vendor}</td>
                      <td className="py-3 px-4 text-right text-white">${item.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">${item.paid.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center"><span className={`px-2 py-0.5 text-xs ${item.status === 'paid' ? 'bg-emerald-900/40 text-emerald-300' : item.status === 'partial' ? 'bg-amber-900/40 text-amber-300' : 'bg-red-900/40 text-red-300'}`}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeEventTab === 'guests' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Guest List</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowGuestModal(true)} className="bg-[rgba(30,144,255,0.95)] hover:brightness-95 text-white px-4 py-2 text-sm flex items-center gap-2"><Plus size={16} />Add Guest</button>
              </div>
            </div>
            <div className={`${glass} overflow-hidden`}>
              <table className="w-full text-sm">
                <thead><tr className="bg-white/3">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Email</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">RSVP</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Table</th>
                  <th className="text-center py-3 px-4 text-gray-300 font-medium">Actions</th>
                </tr></thead>
                <tbody>
                  {guests.filter(g => g.event === event.name).map(guest => (
                    <tr key={guest.id} className="border-t border-white/6">
                      <td className="py-3 px-4 text-white">{guest.name}</td>
                      <td className="py-3 px-4 text-gray-300">{guest.email}</td>
                      <td className="py-3 px-4 text-center"><span className={`px-2 py-0.5 text-xs ${guest.rsvp === 'confirmed' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-amber-900/40 text-amber-300'}`}>{guest.rsvp}</span></td>
                      <td className="py-3 px-4 text-center text-gray-300">{guest.table}</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => { setSelectedGuest(guest); setShowEditGuest(true); }} className="text-sm px-2 py-1 bg-white/3 rounded">Edit</button>
                        <button onClick={() => handleDeleteGuest(guest.id)} className="text-sm px-2 py-1 ml-2 bg-red-600/70 rounded">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // -----------------------
  // Main render
  // -----------------------
  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg,#0b1116 0%, #263238 100%)`, color: '#e6eef6' }}>
      <div className="md:hidden bg-[#08121a] border-b border-white/6 p-4 flex justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold">Athar UX</div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={20} className="text-white" /></button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-56 bg-[#071018]/60 border-r border-white/6 md:sticky md:top-0 md:h-screen overflow-y-auto p-0`}>
          <div className="hidden md:block p-5 border-b border-white/6">
            <h1 className="text-lg font-bold">Athar UX</h1>
            <p className="text-xs text-gray-300 mt-1">All-in-one event planning</p>
          </div>

          <div className="p-3 space-y-1">
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
                <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm ${activeTab === item.id ? 'bg-[rgba(30,144,255,0.08)] text-white' : 'text-gray-300 hover:bg-white/3 hover:text-white'}`}>
                  <Icon size={18} className={activeTab === item.id ? 'text-[rgba(30,144,255,0.95)]' : 'text-gray-300'} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/6 mt-auto hidden md:block">
            <div className="text-xs text-gray-300">Theme</div>
            <div className="mt-2">
              <div className="text-sm text-gray-200">Dark glassmorphic • Neon accent</div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 overflow-y-auto min-h-screen">
          <div className={`${glass} border-white/6 px-6 py-4 flex items-center justify-between`}>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold">{events.length}</div>
                <div className="text-xs text-gray-300">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</div>
                <div className="text-xs text-gray-300">Tasks Done</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{conversations.filter(c => c.unread).length}</div>
                <div className="text-xs text-gray-300">Unread</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search..." className="bg-transparent border border-white/6 pl-9 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgba(30,144,255,0.12)] rounded w-64" />
              </div>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
                  <p className="text-sm text-gray-300">Overview of all your events and activities</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`${glass} p-5`}>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Upcoming Events</h2>
                      <button onClick={() => setShowCreateEvent(true)} className="bg-[rgba(30,144,255,0.95)] hover:brightness-95 text-white px-3 py-1.5 text-sm flex items-center gap-2"><Plus size={14} />New</button>
                    </div>
                    <div className="space-y-3">
                      {events.map(event => (
                        <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
                          className={`bg-white/3 border border-white/6 p-4 hover:border-[rgba(30,144,255,0.18)] cursor-pointer`}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-sm">{event.name}</h3>
                            <span className={`text-xs px-2 py-0.5 ${event.status === 'active' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-amber-900/40 text-amber-300'}`}>{event.status}</span>
                          </div>
                          <div className="text-xs text-gray-300 mb-3">{new Date(event.date).toLocaleDateString()} • {event.guests} guests</div>
                          <div className="w-full bg-white/6 h-1.5 rounded"><div className="bg-[rgba(30,144,255,0.95)] h-full" style={{width: `${(event.completed/event.tasks)*100}%`}}></div></div>
                          <div className="text-xs text-gray-300 mt-2">{event.completed}/{event.tasks} tasks</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className={`${glass} p-5`}>
                      <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
                      <div className="space-y-2">
                        {tasks.filter(t => t.status === 'pending').map(task => (
                          <div key={task.id} className="bg-white/3 border border-white/6 p-3">
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 mt-1.5 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                              <div className="flex-1">
                                <h3 className="font-medium text-sm">{task.title}</h3>
                                <p className="text-xs text-gray-300 mt-1">{task.event}</p>
                                <span className="text-xs text-gray-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                              <button onClick={() => openTask(task)} className="ml-3 text-xs px-2 py-1 bg-[rgba(30,144,255,0.9)] text-white rounded">Details</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`${glass} p-5`}>
                      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-[rgba(30,144,255,0.12)] flex items-center justify-center text-xs font-bold">EC</div>
                          <div className="flex-1">
                            <p className="text-sm">Elegant Catering sent menu proposal</p>
                            <p className="text-xs text-gray-300">10:30 AM</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-emerald-600 flex items-center justify-center text-xs font-bold">✓</div>
                          <div className="flex-1">
                            <p className="text-sm">Venue contract completed</p>
                            <p className="text-xs text-gray-300">Yesterday</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-[rgba(30,144,255,0.12)] flex items-center justify-center text-xs font-bold">SM</div>
                          <div className="flex-1">
                            <p className="text-sm">Sarah Mitchell joined the team</p>
                            <p className="text-xs text-gray-300">2 days ago</p>
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
                  <h1 className="text-2xl font-bold">Events</h1>
                  <button onClick={() => setShowCreateEvent(true)} className="bg-[rgba(30,144,255,0.95)] hover:brightness-95 text-white px-4 py-2 text-sm flex items-center gap-2"><Plus size={16} />Create Event</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map(event => (
                    <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
                      className={`${glass} p-5 hover:border-[rgba(30,144,255,0.18)] cursor-pointer`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{event.name}</h3>
                          <span className="text-xs text-gray-300">{event.type}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 ${event.status === 'active' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-amber-900/40 text-amber-300'}`}>{event.status}</span>
                      </div>
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2 text-gray-300"><Users size={14} />{event.guests} guests ({event.confirmed} confirmed)</div>
                        <div className="flex items-center gap-2 text-gray-300"><DollarSign size={14} />${event.spent.toLocaleString()} / ${event.budget.toLocaleString()}</div>
                      </div>
                      <div className="bg-white/4 p-3 rounded">
                        <div className="flex justify-between text-xs mb-2"><span className="text-gray-300">Progress</span><span className="font-semibold">{Math.round((event.completed/event.tasks)*100)}%</span></div>
                        <div className="w-full bg-white/6 h-1.5 rounded"><div className="bg-[rgba(30,144,255,0.95)] h-full" style={{width: `${(event.completed/event.tasks)*100}%`}}></div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendors */}
            {activeTab === 'vendors' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Vendors & Service Providers</h1>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedVendor(null); setShowVendorModal(true); }} className="bg-[rgba(30,144,255,0.95)] text-white px-3 py-2 text-sm flex items-center gap-2"><Plus size={14} />Add Vendor</button>
                  </div>
                </div>

                <div className={`${glass} p-5`}>
                  <div className="flex gap-3 mb-5">
                    <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border border-white/6 px-4 py-2 text-sm text-white focus:outline-none rounded" />
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-transparent border border-white/6 px-4 py-2 text-sm text-white focus:outline-none rounded">
                      <option>All</option>
                      <option>Catering</option>
                      <option>Entertainment</option>
                      <option>Florals</option>
                      <option>Venue</option>
                      <option>Photography</option>
                      <option>Decorations</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredVendors.map(vendor => (
                      <div key={vendor.id} onClick={() => { setSelectedVendor(vendor); setShowVendorModal(true); }}
                        className={`p-4 border border-white/6 ${vendor.booked ? 'bg-[rgba(30,144,255,0.04)]' : 'bg-transparent'} cursor-pointer`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                            <Star size={12} className="text-[rgba(255,215,64,0.9)]" />
                            <span className="text-xs font-semibold">{vendor.rating}</span>
                          </div>
                          {vendor.booked && <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded">Booked</span>}
                        </div>
                        <h3 className="text-base font-semibold mb-1">{vendor.name}</h3>
                        <p className="text-xs text-[rgba(30,144,255,0.9)] mb-3">{vendor.category}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-400 font-semibold">{vendor.price}</span>
                          <span className="text-gray-300">{vendor.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Venues tab - implemented */}
            {activeTab === 'venues' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Venues</h1>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedVenue(null); setShowVenueModal(true); }} className="bg-[rgba(30,144,255,0.95)] text-white px-3 py-2 text-sm flex items-center gap-2"><Plus size={14} />Add Venue</button>
                  </div>
                </div>

                <div className={`${glass} p-5`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venues.map(v => (
                      <div key={v.id} className="p-4 border border-white/6 bg-transparent">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <h3 className="text-lg font-semibold">{v.name}</h3>
                            <span className="text-xs text-gray-300">{v.location}</span>
                          </div>
                          <div className="text-sm text-gray-300">{v.rating} ★</div>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">Capacity / pricing: {v.price}</p>
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedVenue(v); setShowEditVenue(true); }} className="text-sm px-3 py-1 bg-[rgba(30,144,255,0.9)] text-white rounded">Edit</button>
                          <button onClick={() => handleDeleteVendor(v.id)} className="text-sm px-3 py-1 bg-red-600/70 rounded">Delete</button>
                        </div>
                      </div>
                    ))}
                    {venues.length === 0 && <div className="text-gray-300">No venues available.</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold">Messages</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className={`${glass} p-4`}>
                    <h2 className="text-base font-semibold mb-4">Conversations</h2>
                    <div className="space-y-2">
                      {conversations.map((conv, idx) => (
                        <div key={conv.id} onClick={() => { setSelectedConversation(idx); setActiveTab('messages'); }}
                          className={`p-3 cursor-pointer ${selectedConversation === idx ? 'bg-[rgba(30,144,255,0.12)]' : 'bg-transparent hover:bg-white/3'}`}>
                          <h3 className="font-semibold text-sm mb-1">{conv.vendor}</h3>
                          <p className="text-xs text-gray-300 truncate">{conv.lastMessage}</p>
                          {conv.unread && <span className="inline-block mt-2 text-xs bg-[rgba(30,144,255,0.9)] px-2 py-0.5 rounded">New</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col">
                    <div className={`${glass} p-5 mb-4`}>
                      <h2 className="text-lg font-semibold">{conversations[selectedConversation]?.vendor}</h2>
                    </div>

                    <div className={`${glass} flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px] mb-4`}>
                      {conversations[selectedConversation]?.messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                          <div className={`p-3 max-w-md text-sm ${msg.sender === 'me' ? 'bg-[rgba(30,144,255,0.95)] text-white rounded' : 'bg-white/6 rounded'}`}>
                            <p className="text-white">{msg.text}</p>
                            <span className="text-xs text-gray-300 mt-1 block">{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`${glass} p-5`}>
                      <div className="flex gap-3">
                        <button className="p-2 bg-white/6 hover:bg-white/8 rounded"><Upload size={18} className="text-gray-300" /></button>
                        <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type message..."
                          className="flex-1 bg-transparent border border-white/6 px-4 py-2 text-sm text-white focus:outline-none rounded" />
                        <button onClick={sendMessage} className="px-5 bg-[rgba(30,144,255,0.95)] hover:brightness-95 text-white font-semibold flex items-center gap-2 rounded"><Send size={16} />Send</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generic placeholders */}
            {(activeTab === 'clients' || activeTab === 'settings') && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
                <div className={`${glass} p-8 text-center`}>
                  <p className="text-gray-300">This section is coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals: Create Event */}
      {showCreateEvent && (
        <Modal onClose={() => setShowCreateEvent(false)}>
          <EventForm onSubmit={handleCreateEvent} onCancel={() => setShowCreateEvent(false)} events={events} />
        </Modal>
      )}

      {/* Edit Event modal */}
      {showEditEvent && selectedEvent && (
        <Modal onClose={() => setShowEditEvent(false)}>
          <EventForm event={selectedEvent} onSubmit={(payload) => handleUpdateEvent(selectedEvent.id, payload)} onCancel={() => setShowEditEvent(false)} />
        </Modal>
      )}

      {/* Vendor modal (create/edit combined) */}
      {(showVendorModal || showEditVendor) && (
        <Modal onClose={() => { setShowVendorModal(false); setShowEditVendor(false); }}>
          <VendorForm
            vendor={showEditVendor ? selectedVendor : null}
            onCreate={handleCreateVendor}
            onUpdate={(patch) => handleUpdateVendor(selectedVendor.id, patch)}
            onDelete={() => handleDeleteVendor(selectedVendor.id)}
            onCancel={() => { setShowVendorModal(false); setShowEditVendor(false); }}
          />
        </Modal>
      )}

      {/* Venue modal */}
      {(showVenueModal || showEditVenue) && (
        <Modal onClose={() => { setShowVenueModal(false); setShowEditVenue(false); }}>
          <VendorForm
            vendor={showEditVenue ? selectedVenue : null}
            onCreate={(payload) => { handleCreateVendor({ ...payload, category: 'Venue' }); }}
            onUpdate={(patch) => handleUpdateVendor(selectedVenue.id, patch)}
            onDelete={() => handleDeleteVendor(selectedVenue.id)}
            onCancel={() => { setShowVenueModal(false); setShowEditVenue(false); }}
            isVenue
          />
        </Modal>
      )}

      {/* Guest modal */}
      {(showGuestModal || showEditGuest) && (
        <Modal onClose={() => { setShowGuestModal(false); setShowEditGuest(false); }}>
          <GuestForm
            guest={showEditGuest ? selectedGuest : null}
            onCreate={handleCreateGuest}
            onUpdate={(patch) => handleUpdateGuest(selectedGuest.id, patch)}
            onCancel={() => { setShowGuestModal(false); setShowEditGuest(false); }}
          />
        </Modal>
      )}

      {/* Vendor quick-view modal */}
      {showVendorModal && selectedVendor && (
        <Modal onClose={() => setShowVendorModal(false)}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedVendor.name}</h2>
                <p className="text-sm text-[rgba(30,144,255,0.9)] mt-1">{selectedVendor.category}</p>
              </div>
              <button onClick={() => setShowVendorModal(false)} className="text-gray-300 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-[rgba(255,215,64,0.95)]" />
                  <span className="font-bold">{selectedVendor.rating}</span>
                  <span className="text-gray-300">({selectedVendor.reviews} reviews)</span>
                </div>
                <div className="text-[rgba(30,144,255,0.95)] font-bold">{selectedVendor.price}</div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={14} />
                  <span>{selectedVendor.location}</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">About</h3>
                <p className="text-sm text-gray-300">Professional {selectedVendor.category.toLowerCase()} services with over 10 years of experience. We specialize in creating unforgettable moments for your special day.</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => { /* Example: add to event logic */ alert('Inquiry sent (mock)'); }} className="w-full bg-[rgba(30,144,255,0.95)] hover:brightness-95 text-white font-semibold py-2.5">Send Inquiry</button>
                <button onClick={() => handleUpdateVendor(selectedVendor.id, { booked: !selectedVendor.booked })} className="w-full bg-white/6 hover:bg-white/8 text-gray-300 font-semibold py-2.5">Toggle Booked</button>
                <div className="flex gap-2">
                  <button onClick={() => { setShowEditVendor(true); setShowVendorModal(false); }} className="w-1/2 bg-white/6 text-white py-2 rounded">Edit</button>
                  <button onClick={() => { handleDeleteVendor(selectedVendor.id); }} className="w-1/2 bg-red-600 text-white py-2 rounded">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Task detail modal */}
      {showTaskDetail && selectedTask && (
        <Modal onClose={() => setShowTaskDetail(false)}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{selectedTask.title}</h2>
              <button onClick={() => setShowTaskDetail(false)} className="text-gray-300 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-300">Event</div>
                <div className="font-medium">{selectedTask.event}</div>
              </div>
              <div>
                <div className="text-xs text-gray-300">Due date</div>
                <div className="font-medium">{new Date(selectedTask.dueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-300">Status</div>
                <select defaultValue={selectedTask.status} onChange={(e) => setSelectedTask(s => ({ ...s, status: e.target.value }))} className="bg-transparent border border-white/6 px-3 py-2 rounded">
                  <option value="pending">pending</option>
                  <option value="in-progress">in-progress</option>
                  <option value="completed">completed</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-300">Notes</div>
                <textarea defaultValue={selectedTask.notes} onChange={(e) => setSelectedTask(s => ({ ...s, notes: e.target.value }))} className="w-full bg-transparent border border-white/6 px-3 py-2 rounded" rows={4} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleUpdateTask(selectedTask.id, { status: selectedTask.status, notes: selectedTask.notes })} className="bg-[rgba(30,144,255,0.95)] text-white px-4 py-2 rounded">Save</button>
                <button onClick={() => setShowTaskDetail(false)} className="bg-white/6 px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit guest modal */}
      {showEditGuest && selectedGuest && (
        <Modal onClose={() => setShowEditGuest(false)}>
          <GuestForm guest={selectedGuest} onUpdate={(patch) => handleUpdateGuest(selectedGuest.id, patch)} onCancel={() => setShowEditGuest(false)} />
        </Modal>
      )}

    </div>
  );
}

/* -----------------------
   Small reusable components below: Modal, Forms
   Keep these inside same file for copy/paste simplicity
   ----------------------- */

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal>
      <div onClick={onClose} className="absolute inset-0 bg-black/60"></div>
      <div className="relative w-full max-w-2xl bg-[#071018]/80 border border-white/6 rounded-lg overflow-hidden shadow-lg p-0">
        {children}
      </div>
    </div>
  );
}

/* Event form — used for create and edit */
function EventForm({ event = null, onSubmit, onCancel }) {
  const [name, setName] = useState(event ? event.name : '');
  const [type, setType] = useState(event ? event.type : 'Wedding');
  const [date, setDate] = useState(event ? event.date : '');
  const [budget, setBudget] = useState(event ? event.budget : '');
  const [location, setLocation] = useState(event ? event.location : '');
  const [description, setDescription] = useState(event ? event.description : '');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{event ? 'Edit Event' : 'Create New Event'}</h2>
      </div>

      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Event Name" className="w-full bg-transparent border border-white/6 px-4 py-2 rounded" />
        <div className="flex gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="flex-1 bg-transparent border border-white/6 px-4 py-2 rounded">
            <option>Wedding</option>
            <option>Corporate</option>
            <option>Birthday</option>
            <option>Conference</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 bg-transparent border border-white/6 px-4 py-2 rounded" />
        </div>
        <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" placeholder="Budget ($)" className="w-full bg-transparent border border-white/6 px-4 py-2 rounded" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full bg-transparent border border-white/6 px-4 py-2 rounded" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full bg-transparent border border-white/6 px-4 py-2 rounded" />

        <div className="flex gap-2 mt-3">
          <button onClick={() => onSubmit({
            name, type, date, budget: Number(budget || 0), location, description,
            guests: 0, confirmed: 0, status: 'planning', vendors: 0, tasks: 0, completed: 0, team: []
          })} className="bg-[rgba(30,144,255,0.95)] text-white px-4 py-2 rounded">Save</button>
          <button onClick={onCancel} className="bg-white/6 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* Vendor form — create/edit vendor or venue
   props:
     vendor - existing vendor to edit (optional)
     onCreate - function(payload)
     onUpdate - function(patch)
     onDelete - function()
     onCancel - function()
*/
function VendorForm({ vendor = null, onCreate, onUpdate, onDelete, onCancel, isVenue = false }) {
  const [name, setName] = useState(vendor ? vendor.name : '');
  const [category, setCategory] = useState(vendor ? vendor.category : (isVenue ? 'Venue' : 'Catering'));
  const [rating, setRating] = useState(vendor ? vendor.rating : 4.5);
  const [price, setPrice] = useState(vendor ? vendor.price : '$$$');
  const [location, setLocation] = useState(vendor ? vendor.location : '');
  const [reviews, setReviews] = useState(vendor ? vendor.reviews : 0);
  const [booked, setBooked] = useState(!!(vendor && vendor.booked));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{vendor ? 'Edit Vendor' : (isVenue ? 'Add Venue' : 'Add Vendor')}</h2>
        <button onClick={onCancel} className="text-gray-300 hover:text-white"><X size={20} /></button>
      </div>

      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full bg-transparent border border-white/6 px-4 py-2 rounded" />
        <div className="flex gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 bg-transparent border border-white/6 px-4 py-2 rounded">
            <option>Catering</option>
            <option>Entertainment</option>
            <option>Florals</option>
            <option>Venue</option>
            <option>Photography</option>
            <option>Decorations</option>
          </select>
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price level e.g. $$$" className="flex-1 bg-transparent border border-white/6 px-4 py-2 rounded" />
        </div>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full bg-transparent border border-white/6 px-4 py-2 rounded" />
        <div className="flex gap-2">
          <input value={rating} onChange={(e) => setRating(Number(e.target.value))} type="number" min="0" max="5" step="0.1" placeholder="Rating" className="flex-1 bg-transparent border border-white/6 px-4 py-2 rounded" />
          <input value={reviews} onChange={(e) => setReviews(Number(e.target.value))} type="number" placeholder="Reviews" className="flex-1 bg-transparent border border-white/6 px-4 py-2 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <input id="booked" checked={booked} onChange={(e) => setBooked(e.target.checked)} type="checkbox" className="accent-[rgba(30,144,255,0.95)]" />
          <label htmlFor="booked" className="text-sm text-gray-300">Booked</label>
        </div>

        <div className="flex gap-2 mt-3">
          {!vendor && <button onClick={() => onCreate({ name, category, rating, price, location, reviews, booked })} className="bg-[rgba(30,144,255,0.95)] text-white px-4 py-2 rounded">Create</button>}
          {vendor && <button onClick={() => onUpdate({ name, category, rating, price, location, reviews, booked })} className="bg-[rgba(30,144,255,0.95)] text-white px-4 py-2 rounded">Save</button>}
          {vendor && <button onClick={onDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>}
          <button onClick={onCancel} className="bg-white/6 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* Guest form */
function GuestForm({ guest = null, onCreate, onUpdate, onCancel }) {
  const [name, setName] = useState(guest ? guest.name : '');
  const [email, setEmail] = useState(guest ? guest.email : '');
  const [rsvp, setRsvp] = useState(guest ? guest.rsvp : 'pending');
  const [plusOne, setPlusOne] = useState(guest ? guest.plusOne : false);
  const [event, setEvent] = useState(guest ? guest.event : '');
  const [table, setTable] = useState(guest ? guest.table : '');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{guest ? 'Edit Guest' : 'Add Guest'}</h2>
        <button onClick={onCancel} className="text-gray-300 hover:text-white"><X size={20} /></button>
      </div>

      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full bg-transparent border border-white/6 px-4 py-2 rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-transparent border border-white/6 px-4 py-2 rounded" />
        <div className="flex gap-2">
          <select value={rsvp} onChange={(e) => setRsvp(e.target.value)} className="flex-1 bg-transparent border border-white/6 px-4 py-2 rounded">
            <option value="confirmed">confirmed</option>
            <option value="pending">pending</option>
            <option value="declined">declined</option>
          </select>
          <input value={table} onChange={(e) => setTable(e.target.value)} placeholder="Table" className="flex-1 bg-transparent border border-white/6 px-4 py-2 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <input id="plusone" checked={plusOne} onChange={(e) => setPlusOne(e.target.checked)} type="checkbox" className="accent-[rgba(30,144,255,0.95)]" />
          <label htmlFor="plusone" className="text-sm text-gray-300">Plus one</label>
        </div>

        <div className="flex gap-2 mt-3">
          {!guest && <button onClick={() => onCreate({ name, email, rsvp, plusOne, event: event || 'Summer Gala 2025', table })} className="bg-[rgba(30,144,255,0.95)] text-white px-4 py-2 rounded">Create</button>}
          {guest && <button onClick={() => onUpdate({ name, email, rsvp, plusOne, table })} className="bg-[rgba(30,144,255,0.95)] text-white px-4 py-2 rounded">Save</button>}
          <button onClick={onCancel} className="bg-white/6 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}
