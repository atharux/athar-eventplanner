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
  Mail,
} from "lucide-react";

export default function EventPlannerApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // --- MOCK DATA ---
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
      location: "Grand Ballroom, Downtown",
      description: "Annual corporate gala celebrating company achievements.",
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
      location: "Crystal Palace, Waterfront",
      description: "Elegant waterfront wedding celebration.",
    },
  ];

  const vendors = [
    { id: 1, name: "Elegant Catering Co.", category: "Catering", rating: 4.9, price: "$$$$", location: "Downtown", reviews: 127 },
    { id: 2, name: "Harmony DJ Services", category: "Entertainment", rating: 4.8, price: "$$$", location: "Citywide", reviews: 89 },
  ];

  const tasks = [
    { id: 1, title: "Finalize menu with caterer", event: "Summer Gala 2025", dueDate: "2025-05-01", status: "pending" },
    { id: 2, title: "Send venue contract", event: "Thompson Wedding", dueDate: "2025-04-28", status: "completed" },
  ];

  const messages = [
    { id: 1, sender: "Elegant Catering Co.", text: "Menu proposal attached", time: "10:30 AM" },
    { id: 2, sender: "Harmony DJ Services", text: "Confirming booking for June 15th", time: "9:15 AM" },
  ];

  const pct = (num, denom) => (denom ? Math.round((num / denom) * 100) : 0);

  const Sidebar = () => (
    <aside
      className={`${
        mobileMenuOpen ? "block" : "hidden"
      } md:block w-full md:w-64 bg-slate-900 border-r border-slate-700 md:sticky md:top-0 md:h-screen overflow-y-auto`}
    >
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
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "events", label: "Events", icon: Calendar },
          { id: "vendors", label: "Vendors", icon: Users },
          { id: "tasks", label: "Tasks", icon: CheckCircle },
          { id: "messages", label: "Messages", icon: MessageSquare },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 ${
                activeTab === item.id ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold">E</div>
          <div className="font-bold">EventFlow</div>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
          <Menu size={24} />
        </button>
      </div>

      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-y-auto space-y-8">
        {/* --- Dashboard --- */}
        {activeTab === "dashboard" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Dashboard Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-700 p-4 rounded">
                <h3 className="text-slate-400 text-sm">Active Events</h3>
                <div className="text-2xl font-bold">{events.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded">
                <h3 className="text-slate-400 text-sm">Vendors</h3>
                <div className="text-2xl font-bold">{vendors.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded">
                <h3 className="text-slate-400 text-sm">Pending Tasks</h3>
                <div className="text-2xl font-bold">{tasks.filter((t) => t.status !== "completed").length}</div>
              </div>
            </div>
          </div>
        )}

        {/* --- Events Tab --- */}
        {activeTab === "events" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Events</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {events.map((e) => (
                <div
                  key={e.id}
                  className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-blue-500 cursor-pointer"
                  onClick={() => {
                    setSelectedEvent(e);
                    setShowEventDetail(true);
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{e.name}</h3>
                    <span className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-400">{e.location}</p>
                  <div className="mt-3 text-xs text-slate-500">
                    Tasks: {e.completed}/{e.tasks} ({pct(e.completed, e.tasks)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Vendors Tab --- */}
        {activeTab === "vendors" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Vendors</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vendors.map((v) => (
                <div
                  key={v.id}
                  className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-blue-500 cursor-pointer"
                  onClick={() => {
                    setSelectedVendor(v);
                    setShowVendorModal(true);
                  }}
                >
                  <h3 className="font-bold mb-1">{v.name}</h3>
                  <p className="text-sm text-slate-400 mb-1">{v.category}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Star size={12} /> {v.rating} • {v.reviews} reviews
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tasks Tab --- */}
        {activeTab === "tasks" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Tasks</h1>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-blue-500 cursor-pointer"
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskDetail(true);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{task.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        task.status === "completed"
                          ? "bg-green-900 text-green-400"
                          : "bg-yellow-900 text-yellow-400"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Messages Tab --- */}
        {activeTab === "messages" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Messages</h1>
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="bg-slate-900 border border-slate-700 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{m.sender}</h3>
                    <span className="text-xs text-slate-400">{m.time}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Settings --- */}
        {activeTab === "settings" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <p className="text-slate-400">Settings functionality coming soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
