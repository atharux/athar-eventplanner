# Writing a complete React component file to /mnt/data/event_planner_app.jsx
content = r''' "use client";
import React, { useState } from "react";
import {
  Calendar,
  CheckCircle,
  DollarSign,
  MapPin,
  Menu,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Star,
  Upload,
  Users,
  X,
  Edit,
  Home,
  UserPlus,
  Mail
} from "lucide-react";

/**
 * Complete Event Planner App component
 * Save as: /src/components/event_planner_app.jsx
 * This is a self-contained React component (client-side). It uses Tailwind CSS classes.
 */

export default function EventPlannerApp() {
  // ----- UI State -----
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [messageInput, setMessageInput] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [activeEventTab, setActiveEventTab] = useState("overview");

  // ----- Mock data -----
  const events = [
    {
      id: 1,
      name: "Summer Gala 2025",
      date: "2025-06-15",
      budget: 50000,
      spent: 32000,
      guests: 250,
      confirmed: 180,
      status: "active",
      vendors: 8,
      tasks: 24,
      completed: 18,
      type: "Corporate",
      location: "Grand Ballroom, Downtown",
      description: "Annual corporate gala celebrating company achievements.",
      team: [
        { id: 1, name: "Sarah Mitchell", role: "Lead Planner", email: "sarah@eventflow.com", avatar: "SM" },
        { id: 2, name: "James Cooper", role: "Vendor Coordinator", email: "james@eventflow.com", avatar: "JC" }
      ]
    },
    {
      id: 2,
      name: "Thompson Wedding",
      date: "2025-07-22",
      budget: 75000,
      spent: 45000,
      guests: 180,
      confirmed: 150,
      status: "active",
      vendors: 12,
      tasks: 31,
      completed: 22,
      type: "Wedding",
      location: "Crystal Palace, Waterfront",
      description: "Elegant waterfront wedding celebration.",
      team: [{ id: 1, name: "Sarah Mitchell", role: "Lead Planner", email: "sarah@eventflow.com", avatar: "SM" }]
    },
    {
      id: 3,
      name: "Tech Conference 2025",
      date: "2025-08-10",
      budget: 120000,
      spent: 15000,
      guests: 500,
      confirmed: 320,
      status: "planning",
      vendors: 5,
      tasks: 42,
      completed: 8,
      type: "Conference",
      location: "Convention Center",
      description: "Three-day technology conference.",
      team: [{ id: 1, name: "Sarah Mitchell", role: "Lead Planner", email: "sarah@eventflow.com", avatar: "SM" }]
    }
  ];

  const vendors = [
    { id: 1, name: "Elegant Catering Co.", category: "Catering", rating: 4.9, price: "$$$$", location: "Downtown", reviews: 127, booked: true },
    { id: 2, name: "Harmony DJ Services", category: "Entertainment", rating: 4.8, price: "$$$", location: "Citywide", reviews: 89, booked: true },
    { id: 3, name: "Bloom & Petal", category: "Florals", rating: 5.0, price: "$$$", location: "Westside", reviews: 156, booked: false },
    { id: 4, name: "Grand Ballroom", category: "Venue", rating: 4.7, price: "$$$$", location: "Central", reviews: 203, booked: true },
    { id: 5, name: "Snapshot Studios", category: "Photography", rating: 4.9, price: "$$$", location: "East Bay", reviews: 94, booked: false },
    { id: 6, name: "Sparkle Decor", category: "Decorations", rating: 4.6, price: "$$", location: "North", reviews: 71, booked: true },
    { id: 7, name: "Gourmet Delights", category: "Catering", rating: 4.8, price: "$$$", location: "Midtown", reviews: 112, booked: false },
    { id: 8, name: "Live Band Collective", category: "Entertainment", rating: 4.7, price: "$$$$", location: "Downtown", reviews: 78, booked: false }
  ];

  const conversations = [
    { id: 1, vendor: "Elegant Catering Co.", lastMessage: "Menu proposal attached", time: "10:30 AM", unread: true,
      messages: [
        { sender: "vendor", text: "Hi! Thanks for reaching out about catering.", time: "9:15 AM" },
        { sender: "me", text: "We need catering for 250 guests.", time: "9:20 AM" },
        { sender: "vendor", text: "Menu proposal attached for your review", time: "10:30 AM" }
      ]
    },
    { id: 2, vendor: "Harmony DJ Services", lastMessage: "Confirming booking", time: "9:15 AM", unread: false,
      messages: [{ sender: "vendor", text: "Confirming booking for June 15th.", time: "9:15 AM" }]
    }
  ];

  const tasks = [
    { id: 1, title: "Finalize menu with caterer", event: "Summer Gala 2025", dueDate: "2025-05-01", status: "pending", priority: "high" },
    { id: 2, title: "Send venue contract", event: "Thompson Wedding", dueDate: "2025-04-28", status: "completed", priority: "high" },
    { id: 3, title: "Confirm DJ setup", event: "Summer Gala 2025", dueDate: "2025-05-10", status: "pending", priority: "medium" },
    { id: 4, title: "Review floral samples", event: "Thompson Wedding", dueDate: "2025-04-30", status: "in-progress", priority: "high" }
  ];

  const budgetItems = [
    { id: 1, category: "Venue", vendor: "Grand Ballroom", amount: 12000, paid: 12000, status: "paid", event: "Summer Gala 2025" },
    { id: 2, category: "Catering", vendor: "Elegant Catering", amount: 15000, paid: 7500, status: "partial", event: "Summer Gala 2025" },
    { id: 3, category: "Entertainment", vendor: "Harmony DJ", amount: 2500, paid: 0, status: "pending", event: "Summer Gala 2025" }
  ];

  const guests = [
    { id: 1, name: "John Smith", email: "john@email.com", rsvp: "confirmed", plusOne: true, event: "Summer Gala 2025", table: "A1" },
    { id: 2, name: "Sarah Johnson", email: "sarah@email.com", rsvp: "confirmed", plusOne: false, event: "Summer Gala 2025", table: "A1" },
    { id: 3, name: "Michael Chen", email: "michael@email.com", rsvp: "pending", plusOne: true, event: "Summer Gala 2025", table: "B2" }
  ];

  // ----- computed -----
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ----- small helpers -----
  const pct = (num, denom) => (denom ? Math.round((num / denom) * 100) : 0);

  // ----- Event Detail Component (inline) -----
  const EventDetailView = ({ event }) => {
    const [tab, setTab] = useState(activeEventTab);

    return (
      <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex items-start md:items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-md overflow-hidden">
          <div className="bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{event.name}</h2>
              <p className="text-sm text-slate-400">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowEventDetail(false)} type="button" className="p-2">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-slate-700 flex gap-2">
            {["overview","team","vendors","tasks","budget","guests"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm capitalize ${tab===t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {tab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-900 border border-slate-700 p-6">
                    <h3 className="text-xl font-bold mb-2">Description</h3>
                    <p className="text-slate-300">{event.description}</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 p-6">
                    <h3 className="text-xl font-bold mb-3">Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-400">Tasks Completion</span>
                          <span className="text-white font-semibold">{pct(event.completed, event.tasks)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-3 rounded"><div className="bg-blue-600 h-full" style={{width:`${pct(event.completed,event.tasks)}%`}} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-slate-400">Budget Used</span>
                          <span className="text-white font-semibold">{pct(event.spent, event.budget)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-3 rounded"><div className="bg-green-600 h-full" style={{width:`${pct(event.spent,event.budget)}%`}} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-700 p-6">
                    <h3 className="text-lg font-bold mb-4">Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-slate-400">Budget</span><span className="font-semibold">${event.budget.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Spent</span><span className="text-green-400 font-semibold">${event.spent.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Guests</span><span className="font-semibold">{event.guests}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Confirmed</span><span className="text-green-400 font-semibold">{event.confirmed}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-700 p-6">
                    <h3 className="text-lg font-bold mb-3">Team</h3>
                    <div className="space-y-3">
                      {event.team.map(member => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded font-bold">{member.avatar}</div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-xs text-slate-400">{member.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'team' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Team Members</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.team.map(m => (
                    <div key={m.id} className="bg-slate-900 border border-slate-700 p-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-16 h-16 bg-blue-600 text-white flex items-center justify-center rounded text-xl font-bold">{m.avatar}</div>
                        <div>
                          <div className="font-bold">{m.name}</div>
                          <div className="text-sm text-slate-400">{m.role}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-2"><Mail size={12} />{m.email}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'vendors' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Vendors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vendors.map(v => (
                    <div key={v.id} className="bg-slate-900 border border-slate-700 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">{v.name}</div>
                          <div className="text-sm text-slate-400">{v.category}</div>
                        </div>
                        <div className="text-sm text-slate-300">{v.price}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Star size={14} /> {v.rating} • {v.reviews} reviews
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'tasks' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Tasks</h3>
                <div className="space-y-3">
                  {tasks.filter(t => t.event === event.name).map(task => (
                    <div key={task.id} className="bg-slate-900 border border-slate-700 p-4 flex justify-between items-start">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-slate-400 mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs ${task.status==='completed' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'budget' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Budget</h3>
                <div className="bg-slate-900 border border-slate-700 p-4">
                  <table className="w-full">
                    <thead><tr className="bg-slate-800"><th className="py-2 px-3 text-slate-400 text-left">Category</th><th className="py-2 px-3 text-slate-400 text-left">Vendor</th><th className="py-2 px-3 text-slate-400 text-right">Amount</th><th className="py-2 px-3 text-slate-400 text-right">Paid</th><th className="py-2 px-3 text-slate-400 text-center">Status</th></tr></thead>
                    <tbody>
                      {budgetItems.filter(b=>b.event===event.name).map(item=>(
                        <tr key={item.id} className="border-t border-slate-800"><td className="py-2 px-3">{item.category}</td><td className="py-2 px-3 text-slate-300">{item.vendor}</td><td className="py-2 px-3 text-right">${item.amount.toLocaleString()}</td><td className="py-2 px-3 text-right text-green-400">${item.paid.toLocaleString()}</td><td className="py-2 px-3 text-center"><span className={`px-2 py-1 text-xs ${item.status==='paid' ? 'bg-green-900 text-green-400' : item.status==='partial' ? 'bg-yellow-900 text-yellow-400' : 'bg-red-900 text-red-400'}`}>{item.status}</span></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'guests' && (
              <div>
                <h3 className="text-xl font-bold mb-4">Guests</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="bg-slate-800"><th className="py-2 px-3 text-slate-400 text-left">Name</th><th className="py-2 px-3 text-slate-400 text-left">Email</th><th className="py-2 px-3 text-slate-400 text-center">RSVP</th><th className="py-2 px-3 text-slate-400 text-center">Table</th></tr></thead>
                    <tbody>
                      {guests.filter(g=>g.event===event.name).map(g=>(
                        <tr key={g.id} className="border-t border-slate-800"><td className="py-2 px-3">{g.name}</td><td className="py-2 px-3 text-slate-300">{g.email}</td><td className="py-2 px-3 text-center"><span className={`px-2 py-1 text-xs ${g.rsvp==='confirmed' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>{g.rsvp}</span></td><td className="py-2 px-3 text-center">{g.table}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  // ----- Render -----
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded font-bold">E</div>
          <div className="font-bold">EventFlow</div>
        </div>
        <button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu"><Menu size={24} /></button>
      </div>

      {/* Sidebar */}
      <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-slate-900 border-r border-slate-700 md:sticky md:top-0 md:h-screen overflow-y-auto`}>
        <div className="p-6 border-b border-slate-700 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 flex items-center justify-center rounded font-bold text-2xl">E</div>
            <div>
              <h1 className="text-xl font-bold">EventFlow</h1>
              <p className="text-xs text-slate-400">Event Planning</p>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {[
            {id:'dashboard', label:'Dashboard', icon:Home},
            {id:'events', label:'Events', icon:Calendar},
            {id:'vendors', label:'Vendors', icon:Users},
            {id:'messages', label:'Messages', icon:MessageSquare},
            {id:'settings', label:'Settings', icon:Settings}
          ].map(item=>{
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={()=>{ setActiveTab(item.id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 ${activeTab===item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-slate-400">Welcome back — overview of your events.</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={()=>setShowCreateEvent(true)} className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2"><Plus size={16}/> New Event</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-600 p-4 rounded">
                <div className="flex justify-between items-center mb-2"><Calendar size={28} /><div className="text-2xl font-bold">{events.length}</div></div>
                <div className="text-sm">Total Events</div>
              </div>
              <div className="bg-purple-600 p-4 rounded">
                <div className="flex justify-between items-center mb-2"><Users size={28} /><div className="text-2xl font-bold">{vendors.filter(v=>v.booked).length}</div></div>
                <div className="text-sm">Booked Vendors</div>
              </div>
              <div className="bg-green-600 p-4 rounded">
                <div className="flex justify-between items-center mb-2"><CheckCircle size={28} /><div className="text-2xl font-bold">{tasks.filter(t=>t.status==='completed').length}</div></div>
                <div className="text-sm">Tasks Done</div>
              </div>
              <div className="bg-orange-600 p-4 rounded">
                <div className="flex justify-between items-center mb-2"><MessageSquare size={28} /><div className="text-2xl font-bold">{conversations.filter(c=>c.unread).length}</div></div>
                <div className="text-sm">New Messages</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-700 p-4">
                <h2 className="font-bold text-lg mb-3">Upcoming Events</h2>
                <div className="space-y-3">
                  {events.map(ev=>(
                    <div key={ev.id} onClick={()=>{ setSelectedEvent(ev); setShowEventDetail(true); }} className="bg-slate-800 border border-slate-700 p-3 rounded hover:border-blue-500 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div><div className="font-semibold">{ev.name}</div><div className="text-xs text-slate-400">{new Date(ev.date).toLocaleDateString()}</div></div>
                        <div className={`text-xs px-2 py-1 ${ev.status==='active' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>{ev.status}</div>
                      </div>
                      <div className="w-full bg-slate-900 h-2 mt-3 rounded"><div className="bg-blue-600 h-full" style={{width:`${pct(ev.completed,ev.tasks)}%`}} /></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 p-4">
                <h2 className="font-bold text-lg mb-3">Pending Tasks</h2>
                <div className="space-y-2">
                  {tasks.filter(t=>t.status==='pending').map(t=>(
                    <div key={t.id} className="bg-slate-800 border border-slate-700 p-3 rounded">
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-slate-400">{t.event} • Due {new Date(t.dueDate).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Events</h1>
              <button onClick={()=>setShowCreateEvent(true)} className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2"><Plus size={16}/> Create Event</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(ev=>(
                <div key={ev.id} onClick={()=>{ setSelectedEvent(ev); setShowEventDetail(true); }} className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-blue-500 cursor-pointer">
                  <div className="flex justify-between items-center mb-2"><div><div className="font-semibold text-lg">{ev.name}</div><div className="text-sm text-slate-400">{ev.type}</div></div><div className={`text-xs px-2 py-1 ${ev.status==='active' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>{ev.status}</div></div>
                  <div className="text-sm text-slate-300 mb-2">{new Date(ev.date).toLocaleDateString()} • {ev.guests} guests</div>
                  <div className="w-full bg-slate-900 h-2 rounded"><div className="bg-blue-600 h-full" style={{width:`${pct(ev.completed,ev.tasks)}%`}} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Vendors</h1>
              <div className="flex gap-2">
                <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search vendors..." className="bg-slate-800 px-3 py-2 rounded text-sm" />
                <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="bg-slate-800 px-3 py-2 rounded text-sm">
                  <option>All</option><option>Catering</option><option>Entertainment</option><option>Florals</option><option>Venue</option><option>Photography</option><option>Decorations</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVendors.map(v=>(
                <div key={v.id} onClick={()=>{ setSelectedVendor(v); setShowVendorModal(true); }} className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-blue-500 cursor-pointer">
                  <div className="flex justify-between mb-2"><div className="font-semibold">{v.name}</div>{v.booked && <div className="text-xs bg-green-900 text-green-400 px-2 py-1 rounded">Booked</div>}</div>
                  <div className="text-sm text-slate-400 mb-2">{v.category}</div>
                  <div className="text-xs text-slate-300 flex justify-between"><div>{v.price}</div><div>{v.location}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Messages</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-700 p-4">
                <h3 className="font-bold mb-3">Conversations</h3>
                <div className="space-y-2">
                  {conversations.map((c, idx)=>(
                    <div key={c.id} onClick={()=>setSelectedConversation(idx)} className={`p-3 rounded cursor-pointer ${selectedConversation===idx ? 'bg-blue-600' : 'bg-slate-800'}`}>
                      <div className="font-medium">{c.vendor}</div>
                      <div className="text-sm text-slate-300 truncate">{c.lastMessage}</div>
                      {c.unread && <div className="text-xs mt-2 inline-block bg-blue-600 px-2 py-1 rounded">New</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 bg-slate-900 border border-slate-700 p-4 flex flex-col">
                <div className="border-b border-slate-700 p-3"><div className="font-bold">{conversations[selectedConversation].vendor}</div></div>
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {conversations[selectedConversation].messages.map((m,i)=>(
                    <div key={i} className={`p-3 rounded ${m.sender==='me' ? 'bg-blue-600 self-end text-white' : 'bg-slate-800'}`}><div>{m.text}</div><div className="text-xs text-slate-400 mt-1">{m.time}</div></div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-700 flex gap-2">
                  <button type="button" className="p-2 bg-slate-800 rounded"><Upload size={18} /></button>
                  <input value={messageInput} onChange={e=>setMessageInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-800 px-3 py-2 rounded" />
                  <button type="button" className="bg-blue-600 px-4 py-2 rounded flex items-center gap-2"><Send size={14}/>Send</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <div className="bg-slate-900 border border-slate-700 p-4">
              <p className="text-slate-400">Settings will be added here.</p>
            </div>
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl p-4 rounded">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold">Create Event</h3>
              <button onClick={()=>setShowCreateEvent(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Name" className="w-full bg-slate-800 px-3 py-2 rounded" />
              <select className="w-full bg-slate-800 px-3 py-2 rounded">
                <option>Wedding</option><option>Corporate</option><option>Birthday</option><option>Conference</option>
              </select>
              <input type="date" className="w-full bg-slate-800 px-3 py-2 rounded" />
              <input type="number" placeholder="Budget" className="w-full bg-slate-800 px-3 py-2 rounded" />
              <div className="flex gap-2">
                <button onClick={()=>setShowCreateEvent(false)} className="bg-blue-600 px-4 py-2 rounded">Create</button>
                <button onClick={()=>setShowCreateEvent(false)} className="bg-slate-800 px-4 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Modal */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl p-4 rounded">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-xl font-bold">{selectedVendor.name}</h3>
                <div className="text-sm text-slate-400">{selectedVendor.category}</div>
              </div>
              <button onClick={()=>setShowVendorModal(false)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="text-slate-300 mb-3">Professional {selectedVendor.category.toLowerCase()} services. Reviews: {selectedVendor.reviews}</div>
                <div className="flex gap-2"><button className="bg-blue-600 px-3 py-2 rounded">Send Inquiry</button><button className="bg-slate-800 px-3 py-2 rounded">Save</button></div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{selectedVendor.price}</div>
                <div className="text-sm text-slate-400 mt-1">{selectedVendor.location}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail modal */}
      {showEventDetail && selectedEvent && (
        <EventDetailView event={selectedEvent} />
      )}
    </div>
  );
}
'''
# write file
path = "/mnt/data/event_planner_app.jsx"
with open(path, "w", encoding="utf-8") as f:
    f.write(content)

path

