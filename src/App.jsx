// DEVnewSurgical.jsx
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

  // New modal toggles for add forms & client management
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showClientDetailModal, setShowClientDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Add Task modal toggle
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  // AI Output toggle
  const [showAIOutput, setShowAIOutput] = useState(false);
    
  const [newEventForm, setNewEventForm] = useState({
    name: '',
    date: '',
    type: 'Corporate',
    location: '',
    description: '',
    budget: '',
    guests: ''
  });

  /* -------------------- Enhanced Create Event Modal with AI Prompt -------------------- */

  const CreateEventModal = ({ onClose }) => {
    // Add AI-related state
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleCreate = () => {
      if (!newEventForm.name || !newEventForm.date) {
        alert('Please fill in event name and date');
        return;
      }

      const newEvent = {
        id: Math.max(0, ...events.map(e => e.id)) + 1,
        name: newEventForm.name,
        date: newEventForm.date,
        type: newEventForm.type,
        location: newEventForm.location || 'TBD',
        description: newEventForm.description || 'Event description to be added',
        budget: Number(newEventForm.budget) || 0,
        spent: 0,
        guests: Number(newEventForm.guests) || 0,
        confirmed: 0,
        status: 'planning',
        vendors: 0,
        tasks: 0,
        completed: 0,
        team: [
          { id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' }
        ],
        schedule: []
      };

      setEvents(prev => [...prev, newEvent]);
      
      // Reset form
      setNewEventForm({
        name: '',
        date: '',
        type: 'Corporate',
        location: '',
        description: '',
        budget: '',
        guests: ''
      });
      
      setShowAIOutput(false);
      onClose();
    };

    const handleAIGenerate = async () => {
      if (!aiPrompt.trim()) return;
      
      setIsGenerating(true);
      
      // TODO: Replace with actual API call to your AI backend
      // Simulating AI generation for now
      setTimeout(() => {
        // Mock extraction - replace with real AI parsing
        const mockParsed = {
          name: "Annual Tech Summit 2025",
          date: "2025-06-15",
          type: "Conference",
          location: "Convention Center, Berlin",
          description: "Three-day technology conference featuring keynote speakers, workshops, and networking sessions.",
          budget: "75000",
          guests: "500"
        };
        
        setNewEventForm(prev => ({
          ...prev,
          name: mockParsed.name,
          date: mockParsed.date,
          type: mockParsed.type,
          location: mockParsed.location,
          description: mockParsed.description,
          budget: mockParsed.budget,
          guests: mockParsed.guests
        }));
        
        setShowAIOutput(true);
        setIsGenerating(false);
      }, 1500);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className={`${classes.panelBg} ${classes.border} rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto`} style={{ boxShadow: neonBoxShadow, borderColor: '#2b2b2b' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Create New Event</h3>
              <p className="text-sm text-slate-400 mt-1">Use AI or fill in the details manually</p>
            </div>
            <button onClick={onClose}><X size={20} className="text-slate-300 hover:text-white" /></button>
          </div>

          <div className="space-y-4">
            {/* AI PROMPT SECTION */}
            <div className="p-5 rounded-xl mb-6" style={{ 
              background: 'linear-gradient(135deg, rgba(160, 32, 240, 0.1) 0%, rgba(160, 32, 240, 0.2) 100%)',
              border: '2px solid rgba(160, 32, 240, 0.5)'
            }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{
                background: 'linear-gradient(135deg, #A020F0 0%, #8B00FF 100%)',
                color: 'white'
              }}>
                <span>✨</span>
                <span>AI Assistant</span>
              </div>
              
              <label className="block mb-2">
                <span className="text-sm font-semibold text-slate-300">
                  Describe your event in natural language
                </span>
                <textarea
                  className="w-full border-2 rounded-lg px-3 py-2.5 mt-2 transition-all resize-none"
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#0b1220' : '#fff',
                    borderColor: '#2b2b2b',
                    color: theme === 'dark' ? '#fff' : '#111'
                  }}
                  rows="3"
                  placeholder="Example: Corporate tech conference for 500 attendees on June 15th at the Convention Center. Budget around €75,000 for venue, catering, speakers, and AV equipment."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#A020F0'}
                  onBlur={(e) => e.target.style.borderColor = '#2b2b2b'}
                />
              </label>
              
              <p className="text-xs text-slate-400 italic mb-3">
                The AI will analyze your description and populate the event details below.
              </p>
              
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={!aiPrompt.trim() || isGenerating}
                className="px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isGenerating ? '#6B7280' : 'linear-gradient(135deg, #A020F0 0%, #8B00FF 100%)',
                  boxShadow: !isGenerating ? '0 4px 12px rgba(160, 32, 240, 0.4)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isGenerating && aiPrompt.trim()) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(160, 32, 240, 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(160, 32, 240, 0.4)';
                }}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate Event Plan"
                )}
              </button>
            </div>

            {/* AI OUTPUT PANEL */}
            {showAIOutput && (
              <div className="p-6 rounded-xl mb-6" style={{
                background: 'linear-gradient(180deg, rgba(40, 45, 75, 0.85), rgba(20, 25, 45, 0.9))',
                boxShadow: '0 0 0 1px rgba(150, 100, 255, 0.35), 0 0 40px rgba(150, 100, 255, 0.25)'
              }}>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{
                    background: 'rgba(150, 100, 255, 0.25)',
                    color: '#cdbbff'
                  }}>
                    <span>✨</span>
                    <span>AI Assistant</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-2">Event Plan Generated</h3>
                  <p className="text-sm text-slate-300 mt-1">Operational summary based on your event description</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(10, 15, 30, 0.6)' }}>
                    <div className="text-xs text-slate-400 mb-2">Total Estimated Cost</div>
                    <div className="text-2xl font-semibold text-white mb-2">€11,360</div>
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">Within Budget</span>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'rgba(10, 15, 30, 0.6)' }}>
                    <div className="text-xs text-slate-400 mb-2">Risk Assessment</div>
                    <div className="text-2xl font-semibold text-white mb-2">No Risks Detected</div>
                    <span className="text-xs px-2 py-1 rounded bg-slate-500/20 text-slate-300">All clear</span>
                  </div>
                </div>

                {/* Recommended Vendors */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Recommended Vendors</h4>
                  <div className="space-y-2">
                    {[
                      { type: 'Venue', tier: 'Standard', cost: '€3,600' },
                      { type: 'Catering', tier: 'Mid', cost: '€4,800' },
                      { type: 'DJ', tier: 'Standard', cost: '€2,000' },
                      { type: 'Security', tier: 'Standard', cost: '€960' }
                    ].map((vendor, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-4 py-2 px-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span className="text-sm text-slate-200">{vendor.type}</span>
                        <span className="text-sm text-slate-400">{vendor.tier}</span>
                        <span className="text-sm text-purple-300 text-right font-semibold">{vendor.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Actions */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Next Actions</h4>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      Proceed to vendor outreach
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      Confirm availability
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* DIVIDER */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: '#2b2b2b' }}></div>
              <span className="text-sm font-semibold text-slate-400">OR ENTER MANUALLY</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#2b2b2b' }}></div>
            </div>

            {/* EXISTING FORM FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Event Name *</label>
                <input
                  value={newEventForm.name}
                  onChange={e => setNewEventForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Summer Gala 2025"
                  className="w-full p-3 rounded-md border-2"
                  style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', borderColor: '#2b2b2b', color: theme === 'dark' ? '#fff' : '#111' }}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Date *</label>
                <input
                  type="date"
                  value={newEventForm.date}
                  onChange={e => setNewEventForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 rounded-md border-2"
                  style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', borderColor: '#2b2b2b', color: theme === 'dark' ? '#fff' : '#111' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Event Type</label>
                <select
                  value={newEventForm.type}
                  onChange={e => setNewEventForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 rounded-md border-2"
                  style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', borderColor: '#2b2b2b', color: theme === 'dark' ? '#fff' : '#111' }}
                >
                  <option>Corporate</option>
                  <option>Wedding</option>
                  <option>Conference</option>
                  <option>Birthday</option>
                  <option>Fundraiser</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Location</label>
                <input
                  value={newEventForm.location}
                  onChange={e => setNewEventForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Grand Ballroom, Downtown"
                  className="w-full p-3 rounded-md border-2"
                  style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', borderColor: '#2b2b2b', color: theme === 'dark' ? '#fff' : '#111' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Budget</label>
                <input
                  type="number"
                  value={newEventForm.budget}
                  onChange={e => setNewEventForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="50000"
                  className="w-full p-3 rounded-md border-2"
                  style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', borderColor: '#2b2b2b', color: theme === 'dark' ? '#fff' : '#111' }}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Expected Guests</label>
                <input
                  type="number"
                  value={newEventForm.guests}
                  onChange={e => setNewEventForm(prev => ({ ...prev, guests: e.target.value }))}
                  placeholder="250"
                  className="w-full p-3 rounded-md border-2"
                  style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', borderColor: '#2b2b2b', color: theme === 'dark' ? '#fff' : '#111' }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Description</label>
              <textarea
                rows={4}
                value={newEventForm.description}
                onChange={e => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the event, theme, special requirements..."
                className="w-full p-3 rounded-md border-2"
                style={{ backgroundColor: theme === 'dark' ? '#0b1220' : '#fff', borderColor: '#2b2b2b', color: theme === 'dark' ? '#fff' : '#111' }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2" style={{ borderColor: '#2b2b2b' }}>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-md font-semibold text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2 rounded-md bg-purple-700 hover:bg-purple-600 text-white font-semibold flex items-center gap-2"
              >
                <Plus size={16} /> Create Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
    

    
  /* -------------------- Sample Data -------------------- */
  const [events, setEvents] = useState([
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
  ]);

  const vendors = useMemo(() => ([
    { id: 1, name: 'Elegant Catering Co.', category: 'Catering', rating: 4.9, price: '$$$$', location: 'Downtown', reviews: 127, booked: true, lastContact: '2 days ago' },
    { id: 2, name: 'Harmony DJ Services', category: 'Entertainment', rating: 4.8, price: '$$$', location: 'Citywide', reviews: 89, booked: true, lastContact: '1 week ago' },
    { id: 3, name: 'Bloom & Petal', category: 'Florals', rating: 5.0, price: '$$$', location: 'Westside', reviews: 156, booked: false, lastContact: 'Never' },
    { id: 4, name: 'Gourmet Delights', category: 'Catering', rating: 4.8, price: '$$$', location: 'Midtown', reviews: 112, booked: false, lastContact: '1 month ago' },
    { id: 5, name: 'Live Band Collective', category: 'Entertainment', rating: 4.7, price: '$$$$', location: 'Downtown', reviews: 78, booked: false, lastContact: 'Never' }
  ]), []);

  const venues = useMemo(() => ([
    { id: 1, name: 'Grand Ballroom', location: 'Downtown', capacity: 300, price: '$$$$$', rating: 4.7, reviews: 203, booked: true, amenities: ['Kitchen', 'Parking', 'AV Equipment'] },
    { id: 2, name: 'Crystal Palace', location: 'Waterfront', capacity: 250, price: '$$$$', rating: 4.8, reviews: 189, booked: false, amenities: ['Waterfront', 'Indoor/Outdoor', 'Catering'] },
    { id: 3, name: 'Convention Center', location: 'Tech District', capacity: 1000, price: '$$$$$', rating: 4.6, reviews: 267, booked: false, amenities: ['Multiple Rooms', 'Tech Setup', 'Catering'] },
    { id: 4, name: 'Garden Estate', location: 'Suburbs', capacity: 150, price: '$$$', rating: 4.9, reviews: 145, booked: false, amenities: ['Outdoor', 'Gardens', 'Tents Available'] }
  ]), []);

  const [conversations, setConversations] = useState([
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
  ]);

  const [tasks, setTasks] = useState([
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
  ]);

  const [budgetItems, setBudgetItems] = useState([
    { id: 1, category: 'Venue', vendor: 'Grand Ballroom', amount: 12000, paid: 12000, status: 'paid', event: 'Summer Gala 2025', dueDate: '2025-03-01' },
    { id: 2, category: 'Catering', vendor: 'Elegant Catering', amount: 15000, paid: 7500, status: 'partial', event: 'Summer Gala 2025', dueDate: '2025-06-01' },
    { id: 3, category: 'Entertainment', vendor: 'Harmony DJ', amount: 2500, paid: 0, status: 'pending', event: 'Summer Gala 2025', dueDate: '2025-06-10' }
  ]);

  const [guests, setGuests] = useState([
    { id: 1, name: 'John Smith', email: 'john@email.com', rsvp: 'confirmed', plusOne: true, event: 'Summer Gala 2025', table: 'A1', dietaryRestrictions: 'Vegetarian' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', rsvp: 'confirmed', plusOne: false, event: 'Summer Gala 2025', table: 'A1', dietaryRestrictions: 'None' },
    { id: 3, name: 'Michael Chen', email: 'michael@email.com', rsvp: 'pending', plusOne: true, event: 'Summer Gala 2025', table: 'B2', dietaryRestrictions: 'Gluten-free' }
  ]);

  const [clients, setClients] = useState([
    { id: 1, company: 'Acme Corp', contact: 'Laura Peters', email: 'laura@acme.com', phone: '+49 30 1234567', status: 'active', events: 3, clientSince: '2022-03-12', notes: 'Prefers waterfront venues' },
    { id: 2, company: 'The Thompson Family', contact: 'James Thompson', email: 'james@thompson.com', phone: '+49 30 9876543', status: 'active', events: 1, clientSince: '2025-01-05', notes: 'Wedding client' },
    { id: 3, company: 'NextGen Tech', contact: 'Rita Gomez', email: 'rita@nextgen.com', phone: '+49 30 5551212', status: 'prospect', events: 0, clientSince: '2024-11-01', notes: 'Interested in conference packages' }
  ]);

  /* -------------------- Filtering helpers -------------------- */
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVenues = venues.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));

  /* -------------------- Nested UI components -------------------- */

  /* Task Detail Modal */
  const TaskDetailModal = ({ task, onClose }) => {
    if (!task) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
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

  /* Event Detail View - Keeping original for brevity, you can continue with the rest... */
  
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
                {['overview', 'team', 'vendors', 'tasks', 'budget', 'guests', 'schedule'].map(tab => (
                  <button key={tab} onClick={() => setActiveEventTab(tab)} className={`pb-2 px-3 text-sm font-semibold ${activeEventTab === tab ? 'text-purple-300 border-b-2 border-purple-400' : 'text-slate-300 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-6">
            {activeEventTab === 'overview' && (
              <div className="text-white">Overview content here...</div>
            )}
            {/* Add other tabs as needed */}
          </div>
        </div>
      </div>
    );
  };

  /* Additional modals and components would continue here... */

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
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <div className="mt-4">
                <label className="text-sm text-slate-300">Theme</label>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setTheme('dark')} className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'}`}>Dark</button>
                  <button onClick={() => setTheme('light')} className={`px-4 py-2 rounded ${theme === 'light' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800'}`}>Light</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showCreateEvent && <CreateEventModal onClose={() => setShowCreateEvent(false)} />}
      {showTaskDetail && <TaskDetailModal task={selectedTask} onClose={() => setShowTaskDetail(false)} />}
      {showEventDetail && <EventDetailView event={selectedEvent} onClose={() => setShowEventDetail(false)} />}

    </div>
  );
}
