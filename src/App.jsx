import React, { useState } from 'react';
import { Calendar, Users, MessageSquare, Search, Plus, X, Send, CheckCircle, Clock, DollarSign, MapPin, Star, Upload, Menu, Home, Settings, UserPlus, Mail, Edit, Building2, FileText, BarChart3, ChevronRight } from 'lucide-react';

export default function EventPlannerApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [activeEventTab, setActiveEventTab] = useState('overview');

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
    { id: 1, name: 'Elegant Catering Co.', category: 'Catering', rating: 4.9, price: '$$$$', location: 'Downtown', reviews: 127, booked: true },
    { id: 2, name: 'Harmony DJ Services', category: 'Entertainment', rating: 4.8, price: '$$$', location: 'Citywide', reviews: 89, booked: true },
    { id: 3, name: 'Bloom & Petal', category: 'Florals', rating: 5.0, price: '$$$', location: 'Westside', reviews: 156, booked: false },
    { id: 4, name: 'Grand Ballroom', category: 'Venue', rating: 4.7, price: '$$$$', location: 'Central', reviews: 203, booked: true },
    { id: 5, name: 'Snapshot Studios', category: 'Photography', rating: 4.9, price: '$$$', location: 'East Bay', reviews: 94, booked: false },
    { id: 6, name: 'Sparkle Decor', category: 'Decorations', rating: 4.6, price: '$$', location: 'North', reviews: 71, booked: true },
    { id: 7, name: 'Gourmet Delights', category: 'Catering', rating: 4.8, price: '$$$', location: 'Midtown', reviews: 112, booked: false },
    { id: 8, name: 'Live Band Collective', category: 'Entertainment', rating: 4.7, price: '$$$$', location: 'Downtown', reviews: 78, booked: false }
  ];

  const conversations = [
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

  const tasks = [
    { id: 1, title: 'Finalize menu with caterer', event: 'Summer Gala 2025', dueDate: '2025-05-01', status: 'pending', priority: 'high' },
    { id: 2, title: 'Send venue contract', event: 'Thompson Wedding', dueDate: '2025-04-28', status: 'completed', priority: 'high' },
    { id: 3, title: 'Confirm DJ setup', event: 'Summer Gala 2025', dueDate: '2025-05-10', status: 'pending', priority: 'medium' },
    { id: 4, title: 'Review floral samples', event: 'Thompson Wedding', dueDate: '2025-04-30', status: 'in-progress', priority: 'high' }
  ];

  const budgetItems = [
    { id: 1, category: 'Venue', vendor: 'Grand Ballroom', amount: 12000, paid: 12000, status: 'paid', event: 'Summer Gala 2025' },
    { id: 2, category: 'Catering', vendor: 'Elegant Catering', amount: 15000, paid: 7500, status: 'partial', event: 'Summer Gala 2025' },
    { id: 3, category: 'Entertainment', vendor: 'Harmony DJ', amount: 2500, paid: 0, status: 'pending', event: 'Summer Gala 2025' }
  ];

  const guests = [
    { id: 1, name: 'John Smith', email: 'john@email.com', rsvp: 'confirmed', plusOne: true, event: 'Summer Gala 2025', table: 'A1' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', rsvp: 'confirmed', plusOne: false, event: 'Summer Gala 2025', table: 'A1' },
    { id: 3, name: 'Michael Chen', email: 'michael@email.com', rsvp: 'pending', plusOne: true, event: 'Summer Gala 2025', table: 'B2' }
  ];

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const EventDetailView = ({ event }) => (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setShowEventDetail(false)} className="text-gray-400 hover:text-white flex items-center gap-2">
              <X size={20} /> Back to Events
            </button>
            <div className="flex gap-2">
              <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 text-sm flex items-center gap-2">
                <Edit size={16} /> Edit
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><MapPin size={14} />{event.location}</span>
            <span className={`px-2 py-0.5 text-xs ${event.status === 'active' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>{event.status}</span>
          </div>
          <div className="flex gap-2 mt-4 border-b border-gray-700">
            {['overview', 'team', 'vendors', 'tasks', 'budget', 'guests'].map(tab => (
              <button key={tab} onClick={() => setActiveEventTab(tab)}
                className={`pb-2 px-3 text-sm font-medium capitalize ${activeEventTab === tab ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-gray-300'}`}>
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
              <div className="bg-gray-800 border border-gray-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                <p className="text-gray-300 text-sm">{event.description}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-5">
                <h2 className="text-lg font-semibold text-white mb-4">Progress</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-400">Tasks Completion</span>
                      <span className="text-white font-medium">{Math.round((event.completed / event.tasks) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2"><div className="bg-purple-500 h-full" style={{width: `${(event.completed / event.tasks) * 100}%`}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2 text-sm">
                      <span className="text-gray-400">Budget Used</span>
                      <span className="text-white font-medium">{Math.round((event.spent / event.budget) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2"><div className="bg-emerald-500 h-full" style={{width: `${(event.spent / event.budget) * 100}%`}}></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800 border border-gray-700 p-5">
                <h2 className="text-base font-semibold text-white mb-4">Quick Stats</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-400">Budget</span><span className="text-white font-medium">${event.budget.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Spent</span><span className="text-emerald-400 font-medium">${event.spent.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Guests</span><span className="text-white font-medium">{event.guests}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Confirmed</span><span className="text-emerald-400 font-medium">{event.confirmed}</span></div>
                </div>
              </div>
              <div className="bg-gray-800 border border-gray-700 p-5">
                <h2 className="text-base font-semibold text-white mb-4">Team</h2>
                <div className="space-y-3">
                  {event.team.map(member => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 flex items-center justify-center font-semibold text-white text-xs">{member.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-gray-400 truncate">{member.role}</p>
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
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm flex items-center gap-2"><UserPlus size={16} />Add Member</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.team.map(member => (
                <div key={member.id} className="bg-gray-800 border border-gray-700 p-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-purple-600 flex items-center justify-center font-bold text-white">{member.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">{member.name}</h3>
                      <p className="text-sm text-purple-400">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-2"><Mail size={12} /><span className="truncate">{member.email}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeEventTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Tasks</h2>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm flex items-center gap-2"><Plus size={16} />Add Task</button>
            </div>
            <div className="space-y-2">
              {tasks.filter(t => t.event === event.name).map(task => (
                <div key={task.id} className="bg-gray-800 border border-gray-700 p-4 hover:border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-sm mb-1">{task.title}</h3>
                      <p className="text-xs text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs ${task.status === 'completed' ? 'bg-emerald-900/50 text-emerald-400' : task.status === 'in-progress' ? 'bg-blue-900/50 text-blue-400' : 'bg-amber-900/50 text-amber-400'}`}>{task.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeEventTab === 'budget' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Budget Breakdown</h2>
            <div className="bg-gray-800 border border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-900/50">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Vendor</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Amount</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">Paid</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                </tr></thead>
                <tbody>
                  {budgetItems.filter(i => i.event === event.name).map(item => (
                    <tr key={item.id} className="border-t border-gray-700">
                      <td className="py-3 px-4 text-white">{item.category}</td>
                      <td className="py-3 px-4 text-gray-300">{item.vendor}</td>
                      <td className="py-3 px-4 text-right text-white">${item.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">${item.paid.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center"><span className={`px-2 py-0.5 text-xs ${item.status === 'paid' ? 'bg-emerald-900/50 text-emerald-400' : item.status === 'partial' ? 'bg-amber-900/50 text-amber-400' : 'bg-red-900/50 text-red-400'}`}>{item.status}</span></td>
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
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm flex items-center gap-2"><Plus size={16} />Add Guest</button>
            </div>
            <div className="bg-gray-800 border border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-900/50">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">RSVP</th>
                  <th className="text-center py-3 px-4 text-gray-400 font-medium">Table</th>
                </tr></thead>
                <tbody>
                  {guests.filter(g => g.event === event.name).map(guest => (
                    <tr key={guest.id} className="border-t border-gray-700">
                      <td className="py-3 px-4 text-white">{guest.name}</td>
                      <td className="py-3 px-4 text-gray-300">{guest.email}</td>
                      <td className="py-3 px-4 text-center"><span className={`px-2 py-0.5 text-xs ${guest.rsvp === 'confirmed' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>{guest.rsvp}</span></td>
                      <td className="py-3 px-4 text-center text-gray-300">{guest.table}</td>
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      <div className="md:hidden bg-gray-800 border-b border-gray-700 p-4 flex justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold">Athar UX</div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu size={20} /></button>
      </div>

      <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-56 bg-gray-800 border-r border-gray-700 md:sticky md:top-0 md:h-screen overflow-y-auto`}>
        <div className="hidden md:block p-5 border-b border-gray-700">
          <h1 className="text-lg font-bold">Athar UX</h1>
          <p className="text-xs text-gray-400 mt-1">All-in-one event planning</p>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm ${activeTab === item.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'}`}>
                <Icon size={18} /><span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold">{events.length}</div>
              <div className="text-xs text-gray-400">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</div>
              <div className="text-xs text-gray-400">Tasks Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{conversations.filter(c => c.unread).length}</div>
              <div className="text-xs text-gray-400">Unread</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input type="text" placeholder="Search..." className="bg-gray-700 border border-gray-600 pl-9 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 w-64" />
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
                <p className="text-sm text-gray-400">Overview of all your events and activities</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 border border-gray-700 p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Upcoming Events</h2>
                    <button onClick={() => setShowCreateEvent(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 text-sm flex items-center gap-2"><Plus size={14} />New</button>
                  </div>
                  <div className="space-y-3">
                    {events.map(event => (
                      <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
                        className="bg-gray-700/50 border border-gray-600 p-4 hover:border-purple-500 cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{event.name}</h3>
                          <span className={`text-xs px-2 py-0.5 ${event.status === 'active' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>{event.status}</span>
                        </div>
                        <div className="text-xs text-gray-400 mb-3">{new Date(event.date).toLocaleDateString()} • {event.guests} guests</div>
                        <div className="w-full bg-gray-600 h-1.5"><div className="bg-purple-500 h-full" style={{width: `${(event.completed/event.tasks)*100}%`}}></div></div>
                        <div className="text-xs text-gray-400 mt-2">{event.completed}/{event.tasks} tasks</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-800 border border-gray-700 p-5">
                    <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
                    <div className="space-y-2">
                      {tasks.filter(t => t.status === 'pending').map(task => (
                        <div key={task.id} className="bg-gray-700/50 border border-gray-600 p-3">
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 mt-1.5 ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{task.title}</h3>
                              <p className="text-xs text-gray-400 mt-1">{task.event}</p>
                              <span className="text-xs text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800 border border-gray-700 p-5">
                    <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-600 flex items-center justify-center text-xs font-bold">EC</div>
                        <div className="flex-1">
                          <p className="text-sm text-white">Elegant Catering sent menu proposal</p>
                          <p className="text-xs text-gray-400">10:30 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-600 flex items-center justify-center text-xs font-bold">✓</div>
                        <div className="flex-1">
                          <p className="text-sm text-white">Venue contract completed</p>
                          <p className="text-xs text-gray-400">Yesterday</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-xs font-bold">SM</div>
                        <div className="flex-1">
                          <p className="text-sm text-white">Sarah Mitchell joined the team</p>
                          <p className="text-xs text-gray-400">2 days ago</p>
                        </div>
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
                <h1 className="text-2xl font-bold">Events</h1>
                <button onClick={() => setShowCreateEvent(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm flex items-center gap-2"><Plus size={16} />Create Event</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(event => (
                  <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
                    className="bg-gray-800 border border-gray-700 p-5 hover:border-purple-500 cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{event.name}</h3>
                        <span className="text-xs text-gray-400">{event.type}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 ${event.status === 'active' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>{event.status}</span>
                    </div>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-300"><Calendar size={14} className="text-gray-400" />{new Date(event.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2 text-gray-300"><Users size={14} className="text-gray-400" />{event.guests} guests ({event.confirmed} confirmed)</div>
                      <div className="flex items-center gap-2 text-gray-300"><DollarSign size={14} className="text-gray-400" />${event.spent.toLocaleString()} / ${event.budget.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-700 p-3">
                      <div className="flex justify-between text-xs mb-2"><span className="text-gray-400">Progress</span><span className="font-semibold">{Math.round((event.completed/event.tasks)*100)}%</span></div>
                      <div className="w-full bg-gray-600 h-1.5"><div className="bg-purple-500 h-full" style={{width: `${(event.completed/event.tasks)*100}%`}}></div></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Vendors & Service Providers</h1>

              <div className="bg-gray-800 border border-gray-700 p-5">
                <div className="flex gap-3 mb-5">
                  <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-gray-700 border border-gray-600 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-gray-700 border border-gray-600 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500">
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
                      className="bg-gray-700 border border-gray-600 p-4 hover:border-purple-500 cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-1 bg-gray-600 px-2 py-1">
                          <Star className="text-amber-400 fill-amber-400" size={12} />
                          <span className="text-xs font-semibold">{vendor.rating}</span>
                        </div>
                        {vendor.booked && <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5">Booked</span>}
                      </div>
                      <h3 className="text-base font-semibold mb-1">{vendor.name}</h3>
                      <p className="text-xs text-purple-400 mb-3">{vendor.category}</p>
                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-400 font-semibold">{vendor.price}</span>
                        <span className="text-gray-400">{vendor.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Messages</h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gray-800 border border-gray-700 p-4">
                  <h2 className="text-base font-semibold mb-4">Conversations</h2>
                  <div className="space-y-2">
                    {conversations.map((conv, idx) => (
                      <div key={conv.id} onClick={() => setSelectedConversation(idx)}
                        className={`p-3 cursor-pointer ${selectedConversation === idx ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        <h3 className="font-semibold text-sm mb-1">{conv.vendor}</h3>
                        <p className="text-xs text-gray-300 truncate">{conv.lastMessage}</p>
                        {conv.unread && <span className="inline-block mt-2 text-xs bg-purple-500 px-2 py-0.5">New</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-gray-800 border border-gray-700 flex flex-col">
                  <div className="p-5 border-b border-gray-700">
                    <h2 className="text-lg font-semibold">{conversations[selectedConversation].vendor}</h2>
                  </div>

                  <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[500px]">
                    {conversations[selectedConversation].messages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                        <div className={`p-3 max-w-md text-sm ${msg.sender === 'me' ? 'bg-purple-600' : 'bg-gray-700'}`}>
                          <p className="text-white">{msg.text}</p>
                          <span className="text-xs text-gray-300 mt-1 block">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-5 border-t border-gray-700">
                    <div className="flex gap-3">
                      <button className="p-2 bg-gray-700 hover:bg-gray-600"><Upload size={18} className="text-gray-400" /></button>
                      <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type message..."
                        className="flex-1 bg-gray-700 border border-gray-600 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
                      <button className="px-5 bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2"><Send size={16} />Send</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'venues' || activeTab === 'clients' || activeTab === 'settings') && (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold capitalize">{activeTab}</h1>
              <div className="bg-gray-800 border border-gray-700 p-8 text-center">
                <p className="text-gray-400">This section is coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-2xl">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Event</h2>
              <button onClick={() => setShowCreateEvent(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <input type="text" placeholder="Event Name" className="w-full bg-gray-700 border border-gray-600 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
              <select className="w-full bg-gray-700 border border-gray-600 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500">
                <option>Wedding</option>
                <option>Corporate</option>
                <option>Birthday</option>
                <option>Conference</option>
              </select>
              <input type="date" className="w-full bg-gray-700 border border-gray-600 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
              <input type="number" placeholder="Budget ($)" className="w-full bg-gray-700 border border-gray-600 px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
              <button onClick={() => setShowCreateEvent(false)} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold">
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-2xl">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{selectedVendor.name}</h2>
                <p className="text-sm text-purple-400 mt-1">{selectedVendor.category}</p>
              </div>
              <button onClick={() => setShowVendorModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="text-amber-400 fill-amber-400" size={16} />
                  <span className="font-bold">{selectedVendor.rating}</span>
                  <span className="text-gray-400">({selectedVendor.reviews} reviews)</span>
                </div>
                <div className="text-emerald-400 font-bold">{selectedVendor.price}</div>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{selectedVendor.location}</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold mb-2">About</h3>
                <p className="text-sm text-gray-300">Professional {selectedVendor.category.toLowerCase()} services with over 10 years of experience. We specialize in creating unforgettable moments for your special day.</p>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5">Send Inquiry</button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-2.5">Save to Favorites</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEventDetail && selectedEvent && <EventDetailView event={selectedEvent} />}
    </div>
  );
}
