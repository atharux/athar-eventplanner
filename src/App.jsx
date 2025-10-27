import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Calendar, Users, MessageSquare, Search, Plus, X, Send, CheckCircle, Clock, DollarSign,
  MapPin, Star, Upload, Menu, Home, Settings, UserPlus, Mail, Edit, Building2, FileText,
  BarChart3, ChevronRight, Trash2, Sun, Moon, Target
} from 'lucide-react';

/**
 * EventPlannerApp with:
 * - LocalStorage backed mock API
 * - CRUD for events, vendors, guests, tasks, budgets
 * - Drawer (slide-in) event detail panel
 * - ThemeContext (provider) using Context pattern + localStorage (persisted)
 * - Three themes: light, dark, focused
 *
 * Requirements:
 * - Tailwind installed and configured (backdrop-blur, etc.)
 * - lucide-react installed
 *
 * Single-file for copy/paste convenience.
 */

/* ----------------------
   Theme Context (Context API + localStorage)
   ---------------------- */

const THEME_KEY = 'ep_theme_v1';
const NEON = '#1E90FF';

const themes = {
  dark: {
    id: 'dark',
    name: 'Dark',
    bg: 'linear-gradient(180deg,#0b1116 0%, #263238 100%)',
    panel: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.06)',
    text: '#E6EEF6',
    neon: NEON,
    accentBg: 'rgba(30,144,255,0.12)'
  },
  light: {
    id: 'light',
    name: 'Light',
    bg: 'linear-gradient(180deg,#F0F4F8 0%, #E0E7EF 100%)',
    panel: 'rgba(14,20,26,0.03)',
    border: 'rgba(14,20,26,0.06)',
    text: '#0b1220',
    neon: NEON,
    accentBg: 'rgba(30,144,255,0.08)'
  },
  focused: {
    id: 'focused',
    name: 'Focused',
    bg: 'linear-gradient(180deg,#0f1720 0%, #0b1220 100%)',
    panel: 'rgba(255,255,255,0.02)',
    border: 'rgba(255,255,255,0.05)',
    text: '#dbeafe',
    neon: '#7be0ff',
    accentBg: 'rgba(123,224,255,0.08)'
  }
};

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    try {
      const t = localStorage.getItem(THEME_KEY);
      return t || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, themeId);
    } catch (e) { /* ignore */ }
    // set CSS vars for convenience
    const theme = themes[themeId] || themes.dark;
    document.documentElement.style.setProperty('--ep-bg', theme.bg);
    document.documentElement.style.setProperty('--ep-panel', theme.panel);
    document.documentElement.style.setProperty('--ep-border', theme.border);
    document.documentElement.style.setProperty('--ep-text', theme.text);
    document.documentElement.style.setProperty('--ep-neon', theme.neon);
    document.documentElement.style.setProperty('--ep-accent-bg', theme.accentBg);
  }, [themeId]);

  const value = {
    themeId,
    theme: themes[themeId] || themes.dark,
    setTheme: setThemeId
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/* ----------------------
   LocalStorage keys + helpers
   ---------------------- */
const LS_KEYS = {
  EVENTS: 'ep_events_v1',
  VENDORS: 'ep_vendors_v1',
  TASKS: 'ep_tasks_v1',
  BUDGET: 'ep_budget_v1',
  GUESTS: 'ep_guests_v1',
  CONVERSATIONS: 'ep_conversations_v1'
};

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

const saveLS = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('localStorage save error', e);
  }
};

const nextId = (arr) => {
  if (!arr || arr.length === 0) return 1;
  return Math.max(...arr.map(a => a.id || 0)) + 1;
};

/* ----------------------
   Seeds (unchanged demo data)
   ---------------------- */
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

/* ----------------------
   Modal, Forms, small components (kept inside file)
   ---------------------- */

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal>
      <div onClick={onClose} className="absolute inset-0 bg-black/60"></div>
      <div className="relative w-full max-w-2xl" style={{ minHeight: 120 }}>
        <div className="relative w-full bg-[var(--ep-panel)] border" style={{ borderColor: 'var(--ep-border)', borderRadius: 12, overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

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
        <h2 className="text-xl font-bold" style={{ color: 'var(--ep-text)' }}>{event ? 'Edit Event' : 'Create New Event'}</h2>
        <button onClick={onCancel} className="text-gray-400"><X size={18} /></button>
      </div>

      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Event Name" className="w-full bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        <div className="flex gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)} className="flex-1 bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }}>
            <option>Wedding</option>
            <option>Corporate</option>
            <option>Birthday</option>
            <option>Conference</option>
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        </div>
        <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" placeholder="Budget ($)" className="w-full bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={4} className="w-full bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />

        <div className="flex gap-2 mt-3">
          <button onClick={() => onSubmit({
            name, type, date, budget: Number(budget || 0), location, description,
            guests: 0, confirmed: 0, status: 'planning', vendors: 0, tasks: 0, completed: 0, team: []
          })} className="bg-[var(--ep-neon)] text-white px-4 py-2 rounded">Save</button>
          <button onClick={onCancel} className="bg-white/6 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}

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
        <h2 className="text-xl font-bold" style={{ color: 'var(--ep-text)' }}>{vendor ? 'Edit Vendor' : (isVenue ? 'Add Venue' : 'Add Vendor')}</h2>
        <button onClick={onCancel} className="text-gray-400"><X size={18} /></button>
      </div>

      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        <div className="flex gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-1 bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }}>
            <option>Catering</option>
            <option>Entertainment</option>
            <option>Florals</option>
            <option>Venue</option>
            <option>Photography</option>
            <option>Decorations</option>
          </select>
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price level e.g. $$$" className="flex-1 bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        </div>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        <div className="flex gap-2">
          <input value={rating} onChange={(e) => setRating(Number(e.target.value))} type="number" min="0" max="5" step="0.1" placeholder="Rating" className="flex-1 bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
          <input value={reviews} onChange={(e) => setReviews(Number(e.target.value))} type="number" placeholder="Reviews" className="flex-1 bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        </div>
        <div className="flex items-center gap-2">
          <input id="booked" checked={booked} onChange={(e) => setBooked(e.target.checked)} type="checkbox" className="accent-[var(--ep-neon)]" />
          <label htmlFor="booked" className="text-sm" style={{ color: 'var(--ep-text)' }}>Booked</label>
        </div>

        <div className="flex gap-2 mt-3">
          {!vendor && <button onClick={() => onCreate({ name, category, rating, price, location, reviews, booked })} className="bg-[var(--ep-neon)] text-white px-4 py-2 rounded">Create</button>}
          {vendor && <button onClick={() => onUpdate({ name, category, rating, price, location, reviews, booked })} className="bg-[var(--ep-neon)] text-white px-4 py-2 rounded">Save</button>}
          {vendor && <button onClick={onDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>}
          <button onClick={onCancel} className="bg-white/6 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function GuestForm({ guest = null, onCreate, onUpdate, onCancel, events = [] }) {
  const [name, setName] = useState(guest ? guest.name : '');
  const [email, setEmail] = useState(guest ? guest.email : '');
  const [rsvp, setRsvp] = useState(guest ? guest.rsvp : 'pending');
  const [plusOne, setPlusOne] = useState(guest ? guest.plusOne : false);
  const [event, setEvent] = useState(guest ? guest.event : (events.length ? events[0].name : ''));
  const [table, setTable] = useState(guest ? guest.table : '');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--ep-text)' }}>{guest ? 'Edit Guest' : 'Add Guest'}</h2>
        <button onClick={onCancel} className="text-gray-400"><X size={18} /></button>
      </div>

      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        <div className="flex gap-2">
          <select value={rsvp} onChange={(e) => setRsvp(e.target.value)} className="flex-1 bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }}>
            <option value="confirmed">confirmed</option>
            <option value="pending">pending</option>
            <option value="declined">declined</option>
          </select>
          <input value={table} onChange={(e) => setTable(e.target.value)} placeholder="Table" className="flex-1 bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
        </div>
        <div className="flex items-center gap-2">
          <input id="plusone" checked={plusOne} onChange={(e) => setPlusOne(e.target.checked)} type="checkbox" className="accent-[var(--ep-neon)]" />
          <label htmlFor="plusone" className="text-sm" style={{ color: 'var(--ep-text)' }}>Plus one</label>
        </div>

        <div className="flex gap-2 mt-3">
          {!guest && <button onClick={() => onCreate({ name, email, rsvp, plusOne, event: event || (events[0] && events[0].name) || '', table })} className="bg-[var(--ep-neon)] text-white px-4 py-2 rounded">Create</button>}
          {guest && <button onClick={() => onUpdate({ name, email, rsvp, plusOne, table })} className="bg-[var(--ep-neon)] text-white px-4 py-2 rounded">Save</button>}
          <button onClick={onCancel} className="bg-white/6 px-4 py-2 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------
   Main App
   ---------------------- */

export default function EventPlannerApp() {
  // theme context
  // Wrap app with ThemeProvider inside this component so user can drop single file
  return (
    <ThemeProviderWrapper />
  );
}

/* ThemeProviderWrapper contains the entire app so the ThemeContext is available */
function ThemeProviderWrapper() {
  return (
    <ThemeProvider>
      <EventPlannerAppInner />
    </ThemeProvider>
  );
}

function EventPlannerAppInner() {
  const { themeId, theme, setTheme } = useTheme();

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // modals & drawer
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEditVendor, setShowEditVendor] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showEditGuest, setShowEditGuest] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showEditVenue, setShowEditVenue] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  // event drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // selected items
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // data state (load or seed)
  const [events, setEvents] = useState(() => loadOrSeed(LS_KEYS.EVENTS, seedEvents));
  const [vendors, setVendors] = useState(() => loadOrSeed(LS_KEYS.VENDORS, seedVendors));
  const [conversations, setConversations] = useState(() => loadOrSeed(LS_KEYS.CONVERSATIONS, seedConversations));
  const [tasks, setTasks] = useState(() => loadOrSeed(LS_KEYS.TASKS, seedTasks));
  const [budgetItems, setBudgetItems] = useState(() => loadOrSeed(LS_KEYS.BUDGET, seedBudget));
  const [guests, setGuests] = useState(() => loadOrSeed(LS_KEYS.GUESTS, seedGuests));

  // persist
  useEffect(() => saveLS(LS_KEYS.EVENTS, events), [events]);
  useEffect(() => saveLS(LS_KEYS.VENDORS, vendors), [vendors]);
  useEffect(() => saveLS(LS_KEYS.CONVERSATIONS, conversations), [conversations]);
  useEffect(() => saveLS(LS_KEYS.TASKS, tasks), [tasks]);
  useEffect(() => saveLS(LS_KEYS.BUDGET, budgetItems), [budgetItems]);
  useEffect(() => saveLS(LS_KEYS.GUESTS, guests), [guests]);

  // search + filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  const venues = vendors.filter(v => v.category === 'Venue');

  // messaging
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(0);

  // contextual descriptions for active panel
  const activePanelDescription = {
    dashboard: 'Overview of events, tasks, and recent activity. Click an event to open its detail drawer.',
    events: 'Browse, create, or open events. Use the New button to add an event.',
    vendors: 'Search and manage vendors. Click a vendor to view details, edit, or toggle booked.',
    venues: 'Manage venue listings. Add or edit venues used for events.',
    messages: 'Communicate with vendors. Open a conversation to send messages.',
    clients: 'Client management area — coming soon.',
    settings: 'Change app settings, themes, and other preferences.'
  };

  // CRUD: events
  const handleCreateEvent = (payload) => {
    const newE = { id: nextId(events), ...payload };
    setEvents(prev => [newE, ...prev]);
    setShowCreateEvent(false);
    setSelectedEvent(newE);
    openDrawer(newE);
  };
  const handleUpdateEvent = (id, patch) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
    setShowEditEvent(false);
    setSelectedEvent(prev => prev && prev.id === id ? { ...prev, ...patch } : prev);
  };
  const handleDeleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    closeDrawer();
  };

  // CRUD: vendors
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

  // CRUD: guests
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

  // tasks
  const openTask = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };
  const handleUpdateTask = (id, patch) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
    setShowTaskDetail(false);
  };

  // messaging send
  const sendMessage = () => {
    const conv = conversations[selectedConversation];
    if (!conv || !messageInput) return;
    const newMsg = { sender: 'me', text: messageInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    const updated = { ...conv, messages: [...conv.messages, newMsg], lastMessage: messageInput, time: newMsg.time, unread: false };
    setConversations(prev => prev.map((c, i) => i === selectedConversation ? updated : c));
    setMessageInput('');
  };

  // drawer controls
  const openDrawer = (event) => {
    setSelectedEvent(event);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedEvent(null), 300); // let animation finish
  };

  // UI helpers
  const glassStyle = { background: 'var(--ep-panel)', borderColor: 'var(--ep-border)' };

  /* ----------------------
     Rendering
     ---------------------- */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ep-bg)', color: 'var(--ep-text)' }}>
      {/* mobile top bar */}
      <div className="md:hidden bg-[rgba(0,0,0,0.25)] border-b" style={{ borderColor: 'var(--ep-border)' }}>
        <div className="p-4 flex justify-between items-center">
          <div className="font-bold">Athar UX</div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={20} /></button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-full md:w-56 ${mobileMenuOpen ? 'block' : 'hidden'} md:block`} style={{ background: 'transparent', borderRight: `1px solid var(--ep-border)` }}>
          <div className="hidden md:block p-5" style={glassStyle}>
            <h1 className="text-lg font-bold">Athar UX</h1>
            <p className="text-xs mt-1">All-in-one event planning</p>
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm ${activeTab === item.id ? 'bg-[var(--ep-accent-bg)] text-white' : 'text-gray-300 hover:bg-white/3 hover:text-white'}`} style={{ borderRadius: 8 }}>
                  <Icon size={18} className={activeTab === item.id ? 'text-[var(--ep-neon)]' : 'text-gray-300'} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* contextual description (replaces theme text) */}
          <div className="p-4 border-t mt-auto hidden md:block" style={{ borderColor: 'var(--ep-border)' }}>
            <div className="text-xs" style={{ color: 'var(--ep-text)' }}>{activePanelDescription[activeTab]}</div>
            <div className="mt-3 text-xs text-gray-300">Tip: Use keyboard shortcuts (TBD) — or open a panel to see actions.</div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* header stats */}
          <div className="p-4 mb-6 rounded" style={glassStyle}>
            <div className="flex items-center justify-between">
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
                  <input type="text" placeholder="Search..." className="bg-transparent border px-3 py-2 pl-9 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* content body */}
          <div>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
                  <p className="text-sm text-gray-300">Overview of all your events and activities</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div style={glassStyle} className="p-5 rounded">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Upcoming Events</h2>
                      <button onClick={() => setShowCreateEvent(true)} className="bg-[var(--ep-neon)] text-white px-3 py-1.5 text-sm flex items-center gap-2 rounded"><Plus size={14} />New</button>
                    </div>
                    <div className="space-y-3">
                      {events.map(event => (
                        <div key={event.id} onClick={() => openDrawer(event)}
                          className="p-4 rounded border" style={{ borderColor: 'var(--ep-border)', background: 'transparent', cursor: 'pointer' }}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-sm">{event.name}</h3>
                            <span className={`text-xs px-2 py-0.5 ${event.status === 'active' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-amber-900/40 text-amber-300'}`}>{event.status}</span>
                          </div>
                          <div className="text-xs text-gray-300 mb-3">{new Date(event.date).toLocaleDateString()} • {event.guests} guests</div>
                          <div className="w-full bg-white/6 h-1.5 rounded"><div className="h-full" style={{ width: `${(event.completed/event.tasks)*100}%`, background: 'var(--ep-neon)' }}></div></div>
                          <div className="text-xs text-gray-300 mt-2">{event.completed}/{event.tasks} tasks</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div style={glassStyle} className="p-5 rounded">
                      <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
                      <div className="space-y-2">
                        {tasks.filter(t => t.status === 'pending').map(task => (
                          <div key={task.id} className="p-3 rounded border" style={{ borderColor: 'var(--ep-border)' }}>
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 mt-1.5 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                              <div className="flex-1">
                                <h3 className="font-medium text-sm">{task.title}</h3>
                                <p className="text-xs text-gray-300 mt-1">{task.event}</p>
                                <span className="text-xs text-gray-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                              <button onClick={() => openTask(task)} className="ml-3 text-xs px-2 py-1 bg-[var(--ep-neon)] text-white rounded">Details</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={glassStyle} className="p-5 rounded">
                      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-[var(--ep-accent-bg)] flex items-center justify-center text-xs font-bold">EC</div>
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
                          <div className="w-8 h-8 bg-[var(--ep-accent-bg)] flex items-center justify-center text-xs font-bold">SM</div>
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
                  <button onClick={() => setShowCreateEvent(true)} className="bg-[var(--ep-neon)] text-white px-4 py-2 text-sm flex items-center gap-2 rounded"><Plus size={16} />Create Event</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map(event => (
                    <div key={event.id} onClick={() => openDrawer(event)}
                      className="p-5 rounded border" style={{ borderColor: 'var(--ep-border)', cursor: 'pointer' }}>
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
                        <div className="w-full bg-white/6 h-1.5 rounded"><div className="h-full" style={{ width: `${(event.completed/event.tasks)*100}%`, background: 'var(--ep-neon)' }}></div></div>
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
                    <button onClick={() => { setSelectedVendor(null); setShowVendorModal(true); }} className="bg-[var(--ep-neon)] text-white px-3 py-2 text-sm flex items-center gap-2 rounded"><Plus size={14} />Add Vendor</button>
                  </div>
                </div>

                <div style={glassStyle} className="p-5 rounded">
                  <div className="flex gap-3 mb-5">
                    <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }}>
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
                        className="p-4 rounded border" style={{ borderColor: 'var(--ep-border)', cursor: 'pointer', background: vendor.booked ? 'var(--ep-accent-bg)' : 'transparent' }}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                            <Star size={12} className="text-[rgba(255,215,64,0.9)]" />
                            <span className="text-xs font-semibold">{vendor.rating}</span>
                          </div>
                          {vendor.booked && <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded">Booked</span>}
                        </div>
                        <h3 className="text-base font-semibold mb-1">{vendor.name}</h3>
                        <p className="text-xs" style={{ color: 'var(--ep-neon)' }}>{vendor.category}</p>
                        <div className="flex justify-between text-xs mt-3">
                          <span className="text-emerald-400 font-semibold">{vendor.price}</span>
                          <span className="text-gray-300">{vendor.location}</span>
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
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Venues</h1>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedVenue(null); setShowVenueModal(true); }} className="bg-[var(--ep-neon)] text-white px-3 py-2 text-sm flex items-center gap-2 rounded"><Plus size={14} />Add Venue</button>
                  </div>
                </div>

                <div style={glassStyle} className="p-5 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venues.map(v => (
                      <div key={v.id} className="p-4 rounded border" style={{ borderColor: 'var(--ep-border)' }}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <h3 className="text-lg font-semibold">{v.name}</h3>
                            <span className="text-xs text-gray-300">{v.location}</span>
                          </div>
                          <div className="text-sm text-gray-300">{v.rating} ★</div>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">Capacity / pricing: {v.price}</p>
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedVenue(v); setShowEditVenue(true); }} className="text-sm px-3 py-1 bg-[var(--ep-neon)] text-white rounded">Edit</button>
                          <button onClick={() => handleDeleteVendor(v.id)} className="text-sm px-3 py-1 bg-red-600 text-white rounded">Delete</button>
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
                  <div style={glassStyle} className="p-4 rounded">
                    <h2 className="text-base font-semibold mb-4">Conversations</h2>
                    <div className="space-y-2">
                      {conversations.map((conv, idx) => (
                        <div key={conv.id} onClick={() => setSelectedConversation(idx)}
                          className={`p-3 rounded ${selectedConversation === idx ? 'bg-[var(--ep-accent-bg)]' : ''}`} style={{ cursor: 'pointer' }}>
                          <h3 className="font-semibold text-sm mb-1">{conv.vendor}</h3>
                          <p className="text-xs text-gray-300 truncate">{conv.lastMessage}</p>
                          {conv.unread && <span className="inline-block mt-2 text-xs bg-[var(--ep-neon)] px-2 py-0.5 rounded">New</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col">
                    <div style={glassStyle} className="p-5 rounded mb-4">
                      <h2 className="text-lg font-semibold">{conversations[selectedConversation]?.vendor}</h2>
                    </div>

                    <div style={glassStyle} className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px] mb-4 rounded">
                      {conversations[selectedConversation]?.messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                          <div className={`p-3 max-w-md text-sm rounded ${msg.sender === 'me' ? '' : ''}`} style={{ background: msg.sender === 'me' ? 'var(--ep-neon)' : 'rgba(255,255,255,0.04)', color: msg.sender === 'me' ? '#002233' : 'var(--ep-text)' }}>
                            <p className="text-sm">{msg.text}</p>
                            <span className="text-xs block mt-1" style={{ color: 'var(--ep-text)' }}>{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={glassStyle} className="p-5 rounded">
                      <div className="flex gap-3">
                        <button className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}><Upload size={18} /></button>
                        <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type message..."
                          className="flex-1 bg-transparent border px-4 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
                        <button onClick={sendMessage} className="px-5 bg-[var(--ep-neon)] text-white font-semibold flex items-center gap-2 rounded"><Send size={16} />Send</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Clients / Settings placeholders */}
            {(activeTab === 'clients') && (
              <div style={glassStyle} className="p-8 rounded">
                <h1 className="text-2xl font-bold">Clients</h1>
                <p className="text-gray-300 mt-2">Client management area — coming soon.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={glassStyle} className="p-6 rounded">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">Settings</h1>
                  <div className="text-sm text-gray-300">Theme: {theme.name}</div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded border" style={{ borderColor: 'var(--ep-border)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--ep-text)' }}>Theme Mode</h3>
                    <p className="text-xs text-gray-300 mt-2">Choose between Light, Dark, and Focused modes inspired by modern tools.</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => setTheme('light')} className={`flex-1 px-3 py-2 rounded ${themeId === 'light' ? 'bg-[var(--ep-neon)] text-white' : 'bg-white/6'}`}>Light <Sun size={14} className="inline ml-2" /></button>
                      <button onClick={() => setTheme('dark')} className={`flex-1 px-3 py-2 rounded ${themeId === 'dark' ? 'bg-[var(--ep-neon)] text-white' : 'bg-white/6'}`}>Dark <Moon size={14} className="inline ml-2" /></button>
                      <button onClick={() => setTheme('focused')} className={`flex-1 px-3 py-2 rounded ${themeId === 'focused' ? 'bg-[var(--ep-neon)] text-white' : 'bg-white/6'}`}>Focused <Target size={14} className="inline ml-2" /></button>
                    </div>
                  </div>

                  <div className="p-4 rounded border" style={{ borderColor: 'var(--ep-border)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--ep-text)' }}>Persistence</h3>
                    <p className="text-xs text-gray-300 mt-2">Theme and demo data persist in localStorage. Clear storage to reset seeds.</p>
                  </div>

                  <div className="p-4 rounded border" style={{ borderColor: 'var(--ep-border)' }}>
                    <h3 className="font-semibold" style={{ color: 'var(--ep-text)' }}>Shortcuts (placeholder)</h3>
                    <p className="text-xs text-gray-300 mt-2">Planned: Keyboard shortcuts and quick actions (Add task, quick vendor search, open drawer).</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Drawers & Modals */}
      {/* Create Event Modal */}
      {showCreateEvent && (
        <Modal onClose={() => setShowCreateEvent(false)}>
          <EventForm onSubmit={handleCreateEvent} onCancel={() => setShowCreateEvent(false)} />
        </Modal>
      )}

      {/* Edit Event */}
      {showEditEvent && selectedEvent && (
        <Modal onClose={() => setShowEditEvent(false)}>
          <EventForm event={selectedEvent} onSubmit={(payload) => handleUpdateEvent(selectedEvent.id, payload)} onCancel={() => setShowEditEvent(false)} />
        </Modal>
      )}

      {/* Vendor modal / edit */}
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

      {/* Guest modals */}
      {(showGuestModal || showEditGuest) && (
        <Modal onClose={() => { setShowGuestModal(false); setShowEditGuest(false); }}>
          <GuestForm
            guest={showEditGuest ? selectedGuest : null}
            events={events}
            onCreate={handleCreateGuest}
            onUpdate={(patch) => handleUpdateGuest(selectedGuest.id, patch)}
            onCancel={() => { setShowGuestModal(false); setShowEditGuest(false); }}
          />
        </Modal>
      )}

      {/* Vendor quick view */}
      {showVendorModal && selectedVendor && (
        <Modal onClose={() => setShowVendorModal(false)}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--ep-text)' }}>{selectedVendor.name}</h2>
                <p className="text-sm" style={{ color: 'var(--ep-neon)' }}>{selectedVendor.category}</p>
              </div>
              <button onClick={() => setShowVendorModal(false)} className="text-gray-400"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-[rgba(255,215,64,0.95)]" />
                  <span className="font-bold">{selectedVendor.rating}</span>
                  <span className="text-gray-300">({selectedVendor.reviews} reviews)</span>
                </div>
                <div className="text-[var(--ep-neon)] font-bold">{selectedVendor.price}</div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={14} />
                  <span>{selectedVendor.location}</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--ep-text)' }}>About</h3>
                <p className="text-sm text-gray-300">Professional {selectedVendor.category.toLowerCase()} services with over 10 years of experience. We specialize in creating unforgettable moments for your special day.</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => alert('Inquiry sent (mock)')} className="w-full bg-[var(--ep-neon)] text-white font-semibold py-2.5 rounded">Send Inquiry</button>
                <button onClick={() => handleUpdateVendor(selectedVendor.id, { booked: !selectedVendor.booked })} className="w-full bg-white/6 hover:bg-white/8 text-gray-300 font-semibold py-2.5 rounded">Toggle Booked</button>
                <div className="flex gap-2">
                  <button onClick={() => { setShowEditVendor(true); setShowVendorModal(false); }} className="w-1/2 bg-white/6 text-white py-2 rounded">Edit</button>
                  <button onClick={() => { handleDeleteVendor(selectedVendor.id); }} className="w-1/2 bg-red-600 text-white py-2 rounded">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Task detail */}
      {showTaskDetail && selectedTask && (
        <Modal onClose={() => setShowTaskDetail(false)}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--ep-text)' }}>{selectedTask.title}</h2>
              <button onClick={() => setShowTaskDetail(false)} className="text-gray-400"><X size={20} /></button>
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
                <select defaultValue={selectedTask.status} onChange={(e) => setSelectedTask(s => ({ ...s, status: e.target.value }))} className="bg-transparent border px-3 py-2 rounded" style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }}>
                  <option value="pending">pending</option>
                  <option value="in-progress">in-progress</option>
                  <option value="completed">completed</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-300">Notes</div>
                <textarea defaultValue={selectedTask.notes} onChange={(e) => setSelectedTask(s => ({ ...s, notes: e.target.value }))} className="w-full bg-transparent border px-3 py-2 rounded" rows={4} style={{ borderColor: 'var(--ep-border)', color: 'var(--ep-text)' }} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleUpdateTask(selectedTask.id, { status: selectedTask.status, notes: selectedTask.notes })} className="bg-[var(--ep-neon)] text-white px-4 py-2 rounded">Save</button>
                <button onClick={() => setShowTaskDetail(false)} className="bg-white/6 px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Drawer: Slide-in event detail */}
      <div
        className={`fixed top-0 right-0 h-full z-50 transform transition-transform duration-300 ease-in-out`}
        style={{
          width: drawerOpen ? '38%' : '0%',
          maxWidth: drawerOpen ? 720 : 0,
          overflow: 'hidden'
        }}
        aria-hidden={!drawerOpen}
      >
        <div style={{ height: '100%', background: 'linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.75))', padding: drawerOpen ? 24 : 0 }}>
          {drawerOpen && selectedEvent && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <h2 style={{ color: 'var(--ep-text)', fontSize: 20, fontWeight: 700 }}>{selectedEvent.name}</h2>
                  <div style={{ color: 'gray', fontSize: 13 }}>{new Date(selectedEvent.date).toLocaleDateString()} • {selectedEvent.location}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowEditEvent(true); }} className="px-3 py-1 rounded" style={{ background: 'transparent', border: '1px solid var(--ep-border)', color: 'var(--ep-text)' }}><Edit size={14} /></button>
                  <button onClick={() => { handleDeleteEvent(selectedEvent.id); }} className="px-3 py-1 rounded" style={{ background: 'red', color: '#fff' }}><Trash2 size={14} /></button>
                  <button onClick={closeDrawer} className="px-3 py-1 rounded" style={{ background: 'transparent', border: '1px solid var(--ep-border)', color: 'var(--ep-text)' }}><X size={16} /></button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ background: 'var(--ep-panel)', padding: 12, borderRadius: 8, border: `1px solid var(--ep-border)`, marginBottom: 12 }}>
                  <h3 style={{ color: 'var(--ep-text)', fontWeight: 600 }}>Description</h3>
                  <p style={{ color: 'var(--ep-text)', fontSize: 13 }}>{selectedEvent.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                  <div style={{ background: 'var(--ep-panel)', padding: 12, borderRadius: 8, border: `1px solid var(--ep-border)` }}>
                    <h4 style={{ color: 'var(--ep-text)', fontWeight: 700 }}>Progress</h4>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9aa4b2', fontSize: 13 }}>
                        <span>Tasks Completion</span>
                        <span style={{ color: 'var(--ep-text)', fontWeight: 700 }}>{Math.round((selectedEvent.completed / selectedEvent.tasks) * 100)}%</span>
                      </div>
                      <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 6, marginTop: 6 }}>
                        <div style={{ height: '100%', width: `${(selectedEvent.completed/selectedEvent.tasks)*100}%`, background: 'var(--ep-neon)', borderRadius: 6 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9aa4b2', fontSize: 13, marginTop: 12 }}>
                        <span>Budget Used</span>
                        <span style={{ color: 'var(--ep-text)', fontWeight: 700 }}>{Math.round((selectedEvent.spent / selectedEvent.budget) * 100)}%</span>
                      </div>
                      <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 6, marginTop: 6 }}>
                        <div style={{ height: '100%', width: `${(selectedEvent.spent/selectedEvent.budget)*100}%`, background: '#16a34a', borderRadius: 6 }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--ep-panel)', padding: 12, borderRadius: 8, border: `1px solid var(--ep-border)` }}>
                    <h4 style={{ color: 'var(--ep-text)', fontWeight: 700 }}>Team</h4>
                    <div style={{ marginTop: 8 }}>
                      {selectedEvent.team.map(m => (
                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30,144,255,0.08)', color: 'var(--ep-neon)', fontWeight: 700 }}>{m.avatar}</div>
                          <div>
                            <div style={{ color: 'var(--ep-text)', fontWeight: 700 }}>{m.name}</div>
                            <div style={{ color: 'gray', fontSize: 12 }}>{m.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'var(--ep-panel)', padding: 12, borderRadius: 8, border: `1px solid var(--ep-border)` }}>
                    <h4 style={{ color: 'var(--ep-text)', fontWeight: 700 }}>Tasks</h4>
                    <div style={{ marginTop: 8 }}>
                      {tasks.filter(t => t.event === selectedEvent.name).map(t => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 6, marginBottom: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.02)' }}>
                          <div>
                            <div style={{ color: 'var(--ep-text)', fontWeight: 600 }}>{t.title}</div>
                            <div style={{ color: 'gray', fontSize: 12 }}>{new Date(t.dueDate).toLocaleDateString()}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => openTask(t)} className="px-2 py-1 rounded" style={{ background: 'var(--ep-neon)', color: '#002233' }}>Details</button>
                            <span style={{ fontSize: 12, color: t.status === 'completed' ? '#10b981' : '#fbbf24', padding: '4px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.02)' }}>{t.status}</span>
                          </div>
                        </div>
                      ))}
                      {tasks.filter(t => t.event === selectedEvent.name).length === 0 && <div className="text-gray-300">No tasks for this event.</div>}
                    </div>
                  </div>

                  <div style={{ background: 'var(--ep-panel)', padding: 12, borderRadius: 8, border: `1px solid var(--ep-border)` }}>
                    <h4 style={{ color: 'var(--ep-text)', fontWeight: 700 }}>Guests</h4>
                    <div style={{ marginTop: 8 }}>
                      {guests.filter(g => g.event === selectedEvent.name).map(g => (
                        <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderRadius: 6, marginBottom: 8 }}>
                          <div>
                            <div style={{ color: 'var(--ep-text)', fontWeight: 600 }}>{g.name}</div>
                            <div style={{ color: 'gray', fontSize: 12 }}>{g.email}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 12, color: g.rsvp === 'confirmed' ? '#10b981' : '#fbbf24' }}>{g.rsvp}</div>
                            <div style={{ fontSize: 12, color: 'gray' }}>{g.table}</div>
                          </div>
                        </div>
                      ))}
                      {guests.filter(g => g.event === selectedEvent.name).length === 0 && <div className="text-gray-300">No guests yet.</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setShowEditEvent(true); }} className="px-4 py-2 rounded" style={{ background: 'var(--ep-neon)', color: '#001b2a' }}>Edit Event</button>
                  <button onClick={() => { handleDeleteEvent(selectedEvent.id); }} className="px-4 py-2 rounded" style={{ background: 'red', color: '#fff' }}>Delete</button>
                  <button onClick={closeDrawer} className="px-4 py-2 rounded" style={{ background: 'transparent', border: '1px solid var(--ep-border)', color: 'var(--ep-text)' }}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
