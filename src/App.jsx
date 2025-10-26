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
  const [messageInput, setMessageInput] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(0);

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

  const pct = (num, denom) => (denom ? Math.round((num / denom) * 100) : 0);

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // --- Modal Components (copy from previous code for brevity, all work unchanged) ---
  // ... TaskDetailView, EventDetailView as previously provided ...

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* ...Sidebar code unchanged... */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-slate-400">Welcome back — overview of your events.</p>
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
                    <div key={t.id} className="bg-slate-800 border border-slate-700 p-3 rounded hover:border-blue-500 cursor-pointer"
                      onClick={()=>{ setSelectedTask(t); setShowTaskDetail(true); }}>
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
        {/* ... vendors, tasks, modals, etc ... */}
      </main>
      {/* ... Modals and other code ... */}
    </div>
  );
}
