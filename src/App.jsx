"use client";
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
  Home,
  Mail
} from "lucide-react";

export default function EventPlannerApp() {
  // --- UI State ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // --- Demo Data ---
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

  const tasks = [
    { id: 1, title: "Finalize menu with caterer", event: "Summer Gala 2025", dueDate: "2025-05-01", status: "pending", priority: "high" },
    { id: 2, title: "Send venue contract", event: "Thompson Wedding", dueDate: "2025-04-28", status: "completed", priority: "high" },
    { id: 3, title: "Confirm DJ setup", event: "Summer Gala 2025", dueDate: "2025-05-10", status: "pending", priority: "medium" },
    { id: 4, title: "Review floral samples", event: "Thompson Wedding", dueDate: "2025-04-30", status: "in-progress", priority: "high" }
  ];

  // --- Helpers ---
  const pct = (num, denom) => (denom ? Math.round((num / denom) * 100) : 0);
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // --- Render ---
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
      {/* --- Sidebar --- */}
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
            {id:'tasks', label:'Tasks', icon:CheckCircle},
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
      {/* --- Main content goes here! --- */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            {/* ... add widgets and demo data as above ... */}
          </div>
        )}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">Events</h1>
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
        {/* ...vendors, tasks, messages, settings, plus your event & task modals... */}
      </main>
      {/* ...Modals here as in previous code... */}
    </div>
  );
}
