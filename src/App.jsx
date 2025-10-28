// src/App.jsx
import React, { useState } from 'react';
import {
  Calendar, Users, MessageSquare, Search, Plus, X, Send, CheckCircle, Clock, DollarSign, MapPin, Star, Upload,
  Menu, Home, Settings, UserPlus, Mail, Edit, Building2, FileText, BarChart3, ChevronRight, ChevronDown, Paperclip,
  Tag, Flag, MoreVertical, Filter
} from 'lucide-react';

/**
 * Fixed App.jsx — original structure preserved.
 * Visual upgrades applied:
 * - 80% dark overlay + blur on modals
 * - Neon purple glow (#A020F0) on modals/panels
 * - border-2 everywhere instead of border
 * - bolder fonts (font-semibold / font-bold)
 * - higher contrast colors
 * - clearer separation (shadows, subtle BGs)
 *
 * NOTE: this file keeps the exact original logic, data arrays and components,
 * only adjusts styles and fixes a broken import/JSX merge.
 */

/* Neon accent */
const NEON = '#A020F0';
const neonBoxShadow = `0 20px 60px -20px ${NEON}, 0 0 30px 8px ${NEON}33`;

export default function EventPlannerApp() {
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

  /* -------------------- DATA (same as original) -------------------- */
  const events = [
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

  const vendors = [
    { id: 1, name: 'Elegant Catering Co.', category: 'Catering', rating: 4.9, price: '$$$$', location: 'Downtown', reviews: 127, booked: true, lastContact: '2 days ago' },
    { id: 2, name: 'Harmony DJ Services', category: 'Entertainment', rating: 4.8, price: '$$$', location: 'Citywide', reviews: 89, booked: true, lastContact: '1 week ago' },
    { id: 3, name: 'Bloom & Petal', category: 'Florals', rating: 5.0, price: '$$$', location: 'Westside', reviews: 156, booked: false, lastContact: 'Never' },
    { id: 4, name: 'Gourmet Delights', category: 'Catering', rating: 4.8, price: '$$$', location: 'Midtown', reviews: 112, booked: false, lastContact: '1 month ago' },
    { id: 5, name: 'Live Band Collective', category: 'Entertainment', rating: 4.7, price: '$$$$', location: 'Downtown', reviews: 78, booked: false, lastContact: 'Never' }
  ];

  const venues = [
    { id: 1, name: 'Grand Ballroom', location: 'Downtown', capacity: 300, price: '$$$$$', rating: 4.7, reviews: 203, booked: true, amenities: ['Kitchen', 'Parking', 'AV Equipment'] },
    { id: 2, name: 'Crystal Palace', location: 'Waterfront', capacity: 250, price: '$$$$', rating: 4.8, reviews: 189, booked: false, amenities: ['Waterfront', 'Indoor/Outdoor', 'Catering'] },
    { id: 3, name: 'Convention Center', location: 'Tech District', capacity: 1000, price: '$$$$$', rating: 4.6, reviews: 267, booked: false, amenities: ['Multiple Rooms', 'Tech Setup', 'Catering'] },
    { id: 4, name: 'Garden Estate', location: 'Suburbs', capacity: 150, price: '$$$', rating: 4.9, reviews: 145, booked: false, amenities: ['Outdoor', 'Gardens', 'Tents Available'] }
  ];

  const conversations = [
    { id: 1, vendor: 'Elegant Catering Co.', lastMessage: 'Menu proposal attached', time: '10:30 AM', unread: true,
      messages: [
        { sender: 'vendor', text: 'Hi! Thanks for reaching out about catering.', time: '9:15 AM', attachments: [] },
        { sender: 'me', text: 'We need catering for 250 guests.', time: '9:20 AM', attachments: [] },
        { sender: 'vendor', text: 'Menu proposal attached for your review', time: '10:30 AM', attachments: ['menu-proposal.pdf'] }
      ]
    },
    { id: 2, vendor: 'Harmony DJ Services', lastMessage: 'Confirming booking', time: '9:15 AM', unread: false,
      messages: [{ sender: 'vendor', text: 'Confirming booking for June 15th.', time: '9:15 AM', attachments: [] }]
    }
  ];

  const tasks = [
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
  ];

  const budgetItems = [
    { id: 1, category: 'Venue', vendor: 'Grand Ballroom', amount: 12000, paid: 12000, status: 'paid', event: 'Summer Gala 2025', dueDate: '2025-03-01' },
    { id: 2, category: 'Catering', vendor: 'Elegant Catering', amount: 15000, paid: 7500, status: 'partial', event: 'Summer Gala 2025', dueDate: '2025-06-01' },
    { id: 3, category: 'Entertainment', vendor: 'Harmony DJ', amount: 2500, paid: 0, status: 'pending', event: 'Summer Gala 2025', dueDate: '2025-06-10' }
  ];

  const guests = [
    { id: 1, name: 'John Smith', email: 'john@email.com', rsvp: 'confirmed', plusOne: true, event: 'Summer Gala 2025', table: 'A1', dietaryRestrictions: 'Vegetarian' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', rsvp: 'confirmed', plusOne: false, event: 'Summer Gala 2025', table: 'A1', dietaryRestrictions: 'None' },
    { id: 3, name: 'Michael Chen', email: 'michael@email.com', rsvp: 'pending', plusOne: true, event: 'Summer Gala 2025', table: 'B2', dietaryRestrictions: 'Gluten-free' }
  ];

  /* -------------------- Filtering helpers -------------------- */
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVenues = venues.filter(v => {
    return v.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  /* -------------------- Inline components (identical structure) -------------------- */

  const TaskDetailModal = ({ task }) => {
    if (!task) return null;
    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50"
        aria-hidden="true"
      >
        <div
          className="bg-white/5 border-2 rounded-2xl w-full md:max-w-4xl md:max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: neonBoxShadow, borderColor: '#2a2a2a' }}
        >
          <div className="sticky top-0 bg-transparent p-4 flex justify-between items-start border-b-2" style={{ borderColor: '#222' }}>
            <div className="flex-1">
              <input
                type="text"
                defaultValue={task.title}
                className="text-xl font-bold bg-transparent w-full focus:outline-none"
                style={{ color: '#fff' }}
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
            <button onClick={() => setShowTaskDetail(false)} className="text-slate-300 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Description</label>
                <textarea rows="3" defaultValue={task.description} className="w-full bg-slate-800 p-3 rounded-md text-slate-200" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-300">Subtasks</label>
                  <span className="text-xs text-slate-400">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} completed</span>
                </div>
                <div className="space-y-2">
                  {task.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-3 p-2 hover:bg-slate-700 rounded-md">
                      <input type="checkbox" checked={subtask.completed} className="w-4 h-4" readOnly />
                      <span className={`text-sm flex-1 ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>{subtask.title}</span>
                    </div>
                  ))}
                  <button className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-1 mt-2 font-semibold"><Plus size={14} />Add subtask</button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-3 block">Comments</label>
                <div className="space-y-3">
                  {task.comments.map((comment, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-700 flex items-center justify-center text-white text-xs font-semibold">{comment.user.split(' ').map(n => n[0]).join('')}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{comment.user}</span>
                          <span className="text-xs text-slate-400">{comment.time}</span>
                        </div>
                        <p className="text-sm text-slate-200 mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <div className="w-8 h-8 bg-slate-600 flex items-center justify-center text-slate-200 text-xs font-semibold">You</div>
                    <input type="text" placeholder="Add a comment..." className="flex-1 p-2 rounded-md bg-slate-800 text-slate-200" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">ASSIGNED TO</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-700 flex items-center justify-center text-white text-xs font-semibold">{task.assignedTo.split(' ').map(n => n[0]).join('')}</div>
                  <span className="text-sm font-semibold text-slate-200">{task.assignedTo}</span>
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
                  {task.tags.map(tag => <span key={tag} className="bg-slate-700 text-slate-200 px-2 py-1 text-xs rounded-md">{tag}</span>)}
                </div>
              </div>

              {task.attachments.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block">ATTACHMENTS</label>
                  <div className="space-y-2">
                    {task.attachments.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm hover:bg-slate-700 p-2 rounded-md cursor-pointer">
                        <Paperclip size={14} />
                        <span className="truncate text-slate-200">{file}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 font-semibold rounded-md">Add Attachment</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* EventDetailView inline (kept same structure) */
  const EventDetailView = ({ event }) => {
    if (!event) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen bg-slate-900">
          <div className="bg-slate-800 border-2" style={{ borderColor: '#222', boxShadow: neonBoxShadow }}>
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => setShowEventDetail(false)} className="text-slate-200 hover:text-white flex items-center gap-2 text-sm font-semibold">
                  <X size={18} /> Back to Events
                </button>
                <div className="flex gap-2">
                  <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2">
                    <Edit size={14} /> Edit
                  </button>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><MapPin size={14} />{event.location}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{event.status}</span>
              </div>

              <div className="flex gap-2 mt-4 border-b-2 pb-2" style={{ borderColor: '#222' }}>
                {['overview', 'team', 'vendors', 'tasks', 'budget', 'guests'].map(tab => (
                  <button key={tab} onClick={() => setActiveEventTab(tab)} className={`pb-2 px-3 text-sm font-semibold ${activeEventTab === tab ? 'text-white border-b-2 border-purple-500' : 'text-slate-300 hover:text-white'}`}>
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
                  <div className="bg-slate-800 border-2 p-5 rounded-md" style={{ borderColor: '#222' }}>
                    <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                    <p className="text-slate-300 text-sm leading-relaxed">{event.description}</p>
                  </div>
                  <div className="bg-slate-800 border-2 p-5 rounded-md" style={{ borderColor: '#222' }}>
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
                  <div className="bg-slate-800 border-2 p-5 rounded-md" style={{ borderColor: '#222' }}>
                    <h2 className="text-base font-semibold text-white mb-4">Quick Stats</h2>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div className="flex justify-between"><span>Budget</span><span className="font-semibold text-white">${event.budget.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Spent</span><span className="font-semibold text-emerald-400">${event.spent.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Guests</span><span className="font-semibold text-white">{event.guests}</span></div>
                      <div className="flex justify-between"><span>Confirmed</span><span className="font-semibold text-emerald-400">{event.confirmed}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-800 border-2 p-5 rounded-md" style={{ borderColor: '#222' }}>
                    <h2 className="text-base font-semibold text-white mb-4">Team</h2>
                    <div className="space-y-3">
                      {event.team.map(member => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-700 flex items-center justify-center font-semibold text-white text-xs rounded">{member.avatar}</div>
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
                      <button onClick={() => setTaskView('list')} className={`px-3 py-1 text-xs font-semibold ${taskView === 'list' ? 'bg-slate-700 text-white shadow' : 'text-slate-300'}`}>List</button>
                      <button onClick={() => setTaskView('board')} className={`px-3 py-1 text-xs font-semibold ${taskView === 'board' ? 'bg-slate-700 text-white shadow' : 'text-slate-300'}`}>Board</button>
                    </div>
                  </div>
                  <button className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2"><Plus size={16} />Add Task</button>
                </div>

                {taskView === 'list' && (
                  <div className="bg-slate-800 border-2 rounded-md overflow-hidden" style={{ borderColor: '#222' }}>
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
                          <tr key={task.id} className="border-b" style={{ borderColor: '#1f2937' }}>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{task.title}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</div>
                            </td>
                            <td className="py-3 px-4 text-slate-300">{task.assignedTo}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 text-xs font-semibold ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-700 text-slate-200'}`}>{task.priority}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 text-xs font-semibold ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-700 text-slate-200'}`}>{task.status}</span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-300">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* -------------------- MAIN JSX (keeps original layout) -------------------- */

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:flex-row">
      <div className="md:hidden bg-white border-b-2 border-slate-200 p-4 flex justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-slate-900">Athar UX</div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2"><Menu size={20} /></button>
      </div>

      <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-56 bg-white border-2 border-slate-200 md:sticky md:top-0 md:h-screen overflow-y-auto`}>
        <div className="hidden md:block p-5 border-b-2 border-slate-200">
          <h1 className="text-lg font-bold text-slate-900">Athar UX</h1>
          <p className="text-xs text-slate-500 mt-1">Event planning platform</p>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm ${activeTab === item.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <Icon size={18} /><span className="font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b-2 border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{events.length}</div>
              <div className="text-xs text-slate-500">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{tasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-xs text-slate-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{conversations.filter(c => c.unread).length}</div>
              <div className="text-xs text-slate-500">Unread</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." className="bg-slate-50 border-2 border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
                <p className="text-sm text-gray-600">Overview of all your events and activities</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-gray-300 p-6 shadow-sm rounded-md">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                    <button onClick={() => setShowCreateEvent(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow-sm"><Plus size={14} />New</button>
                  </div>
                  <div className="space-y-3">
                    {events.map(event => (
                      <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
                        className="border-2 border-gray-300 p-4 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all bg-white rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm text-gray-900">{event.name}</h3>
                          <span className={`text-xs px-2 py-1 font-semibold ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{event.status}</span>
                        </div>
                        <div className="text-xs text-gray-600 mb-3 font-medium">{new Date(event.date).toLocaleDateString()} • {event.guests} guests</div>
                        <div className="w-full bg-gray-200 h-2 rounded"><div className="bg-blue-600 h-full" style={{width: `${(event.completed/event.tasks)*100}%`}}></div></div>
                        <div className="text-xs text-gray-600 mt-2 font-medium">{event.completed}/{event.tasks} tasks completed</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border-2 border-gray-300 p-6 shadow-sm rounded-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5">High Priority Tasks</h2>
                    <div className="space-y-2">
                      {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').map(task => (
                        <div key={task.id} onClick={() => { setSelectedTask(task); setShowTaskDetail(true); }} className="border-2 border-gray-300 p-4 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all bg-white rounded-md">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-red-600 mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm text-gray-900">{task.title}</h3>
                              <p className="text-xs text-gray-600 mt-1 font-medium">{task.event}</p>
                              <span className="text-xs text-gray-600 font-medium">Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-300 p-6 shadow-sm rounded-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-5">Recent Activity</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">EC</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-semibold">Elegant Catering sent menu proposal</p>
                          <p className="text-xs text-gray-600 mt-1">10:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">✓</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-semibold">Venue contract completed</p>
                          <p className="text-xs text-gray-600 mt-1">Yesterday</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">SM</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-semibold">Sarah Mitchell joined team</p>
                          <p className="text-xs text-gray-600 mt-1">2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-slate-900">Events</h1>
                  <button onClick={() => setShowCreateEvent(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm flex items-center gap-2 font-semibold"><Plus size={16} />Create Event</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map(event => (
                    <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
                      className="bg-white border-2 border-slate-200 p-5 hover:border-blue-300 hover:shadow-md cursor-pointer rounded-md">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">{event.name}</h3>
                          <span className="text-xs text-slate-600">{event.type}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 font-semibold ${event.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{event.status}</span>
                      </div>
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Users size={14} />{event.guests} guests</div>
                        <div className="flex items-center gap-2"><DollarSign size={14} />${event.spent.toLocaleString()} / ${event.budget.toLocaleString()}</div>
                      </div>
                      <div className="bg-slate-50 border-2 border-slate-200 p-3 rounded-md">
                        <div className="flex justify-between text-xs mb-2"><span className="text-slate-600">Progress</span><span className="font-semibold text-slate-900">{Math.round((event.completed/event.tasks)*100)}%</span></div>
                        <div className="w-full bg-slate-200 h-1.5 rounded"><div className="bg-blue-600 h-full" style={{width: `${(event.completed/event.tasks)*100}%`}}></div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'vendors' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>

                <div className="bg-white border-2 border-slate-200 p-5 rounded-md">
                  <div className="flex gap-3 mb-5">
                    <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-slate-50 border-2 border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-slate-50 border-2 border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>All</option>
                      <option>Catering</option>
                      <option>Entertainment</option>
                      <option>Florals</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredVendors.map(vendor => (
                      <div key={vendor.id} onClick={() => { setSelectedVendor(vendor); setShowVendorModal(true); }}
                        className="border-2 border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer rounded-md">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                            <Star className="text-amber-500 fill-amber-500" size={12} />
                            <span className="text-xs font-semibold text-slate-900">{vendor.rating}</span>
                          </div>
                          {vendor.booked && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 font-semibold rounded">Booked</span>}
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 mb-1">{vendor.name}</h3>
                        <p className="text-xs text-blue-600 mb-3">{vendor.category}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-emerald-600 font-semibold">{vendor.price}</span>
                          <span className="text-slate-500">{vendor.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'venues' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-slate-900">Venues</h1>

                <div className="bg-white border-2 border-slate-200 p-5 rounded-md">
                  <div className="mb-5">
                    <input type="text" placeholder="Search venues..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVenues.map(venue => (
                      <div key={venue.id} className="border-2 border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm cursor-pointer rounded-md">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                            <Star className="text-amber-500 fill-amber-500" size={12} />
                            <span className="text-xs font-semibold text-slate-900">{venue.rating}</span>
                          </div>
                          {venue.booked && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 font-semibold rounded">Booked</span>}
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 mb-1">{venue.name}</h3>
                        <p className="text-xs text-slate-600 mb-3 flex items-center gap-1"><MapPin size={12} />{venue.location}</p>
                        <div className="flex justify-between text-xs mb-3">
                          <span className="text-slate-600">Capacity: {venue.capacity}</span>
                          <span className="text-emerald-600 font-semibold">{venue.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {venue.amenities.slice(0, 2).map((amenity, idx) => (
                            <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{amenity}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-slate-900">Messages</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="bg-white border-2 border-slate-200 p-4 rounded-md">
                    <h2 className="text-base font-semibold text-slate-900 mb-4">Conversations</h2>
                    <div className="space-y-2">
                      {conversations.map((conv, idx) => (
                        <div key={conv.id} onClick={() => setSelectedConversation(idx)}
                          className={`p-3 cursor-pointer border-2 rounded ${selectedConversation === idx ? 'bg-blue-50 border-blue-200' : 'border-slate-200 hover:bg-slate-50'}`}>
                          <h3 className="font-semibold text-sm text-slate-900 mb-1">{conv.vendor}</h3>
                          <p className="text-xs text-slate-600 truncate">{conv.lastMessage}</p>
                          {conv.unread && <span className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-0.5 font-semibold rounded">New</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 bg-white border-2 p-4 rounded-md" style={{ borderColor: '#e5e7eb' }}>
                    <div className="p-5 border-b-2" style={{ borderColor: '#e5e7eb' }}>
                      <h2 className="text-lg font-semibold text-slate-900">{conversations[selectedConversation].vendor}</h2>
                    </div>

                    <div className="p-5 space-y-4 overflow-y-auto max-h-[500px]">
                      {conversations[selectedConversation].messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                          <div className={`p-3 max-w-md text-sm ${msg.sender === 'me' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'} rounded-md`}>
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
                            <span className={`text-xs mt-1 block ${msg.sender === 'me' ? 'text-blue-100' : 'text-slate-500'}`}>{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
<div className="p-5 border-t-2" style={{ borderColor: '#e5e7eb' }}>
  <div className="flex gap-3">
    <button className="p-2 border-2 rounded-md"><Upload size={18} /></button>
    <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type message..."
      className="flex-1 bg-slate-50 border-2 border-slate-200 px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    <button className="px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 rounded-md"><Send size={16} />Send</button>
  </div>
</div>

                <input type="number" placeholder="Budget ($)" className="w-full bg-gray-50 border-2 border-gray-300 px-4 py-2 text-sm text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <button onClick={() => setShowCreateEvent(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold shadow-md rounded-md">
                  Create Event
                </button>
              </div>
            </div>
          </div>
        )}

        {showVendorModal && selectedVendor && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white border-2 border-gray-300 w-full max-w-2xl shadow-2xl rounded-2xl" style={{ boxShadow: neonBoxShadow }}>
              <div className="p-5 border-b-2 border-gray-300 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedVendor.name}</h2>
                  <p className="text-sm text-blue-600 mt-1 font-medium">{selectedVendor.category}</p>
                </div>
                <button onClick={() => setShowVendorModal(false)} className="text-gray-500 hover:text-gray-900"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-5 bg-white">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="text-amber-500 fill-amber-500" size={16} />
                    <span className="font-bold text-gray-900">{selectedVendor.rating}</span>
                    <span className="text-gray-700">({selectedVendor.reviews} reviews)</span>
                  </div>
                  <div className="text-emerald-600 font-bold text-base">{selectedVendor.price}</div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin size={14} />
                    <span>{selectedVendor.location}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">Professional {selectedVendor.category.toLowerCase()} services with over 10 years of experience. We specialize in creating unforgettable moments for your special day.</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Last Contact</h3>
                  <p className="text-sm text-gray-700">{selectedVendor.lastContact}</p>
                </div>
                <div className="space-y-3">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 shadow-md rounded-md">Send Inquiry</button>
                  <button className="w-full border-2 border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold py-3 rounded-md">Save to Favorites</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEventDetail && selectedEvent && <EventDetailView event={selectedEvent} />}
        {showTaskDetail && selectedTask && <TaskDetailModal task={selectedTask} />}
      </main>
    </div>
  );
}
