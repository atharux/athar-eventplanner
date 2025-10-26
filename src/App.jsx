"use client";
import React, { useState } from "react";
import {
  Calendar,
  CheckCircle,
  DollarSign,
  Home,
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
} from "lucide-react";

// -----------------------------------------------------------------------------
// Mock Data
// -----------------------------------------------------------------------------
const events = [
  {
    id: 1,
    name: "Summer Gala",
    date: "2025-08-12",
    guests: 150,
    budget: 10000,
    spent: 6500,
    tasks: 10,
    completed: 6,
    type: "Corporate",
    status: "active",
  },
  {
    id: 2,
    name: "Wedding Bliss",
    date: "2025-10-02",
    guests: 200,
    budget: 20000,
    spent: 18500,
    tasks: 20,
    completed: 20,
    type: "Wedding",
    status: "completed",
  },
];

const vendors = [
  {
    id: 1,
    name: "Berlin Catering Co.",
    category: "Catering",
    rating: 4.8,
    reviews: 120,
    price: "€2,500",
    booked: true,
    location: "Berlin",
  },
  {
    id: 2,
    name: "DJ Nova",
    category: "Entertainment",
    rating: 4.9,
    reviews: 80,
    price: "€1,200",
    booked: false,
    location: "Hamburg",
  },
];

const tasks = [
  {
    id: 1,
    title: "Confirm catering menu",
    event: "Summer Gala",
    status: "completed",
    dueDate: "2025-08-01",
  },
  {
    id: 2,
    title: "Finalize DJ contract",
    event: "Summer Gala",
    status: "pending",
    dueDate: "2025-08-05",
  },
];

const conversations = [
  {
    id: 1,
    vendor: "Berlin Catering Co.",
    lastMessage: "Looking forward to the menu details.",
    unread: true,
    messages: [
      { sender: "vendor", text: "Can we confirm guest count?", time: "10:30 AM" },
      { sender: "me", text: "Yes, 150 confirmed!", time: "11:00 AM" },
    ],
  },
  {
    id: 2,
    vendor: "DJ Nova",
    lastMessage: "Ready to lock the date.",
    unread: false,
    messages: [
      { sender: "vendor", text: "Ready to lock the date.", time: "2:00 PM" },
    ],
  },
];

const guests = [
  { id: 1, name: "Alice", email: "alice@email.com", rsvp: "confirmed", table: 1, event: "Summer Gala" },
  { id: 2, name: "Bob", email: "bob@email.com", rsvp: "pending", table: 2, event: "Summer Gala" },
];

// -----------------------------------------------------------------------------
// Event Detail View
// -----------------------------------------------------------------------------
function EventDetailView({ event, onClose }) {
  const [activeEventTab, setActiveEventTab] = useState("overview");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 flex justify-between items-center p-6">
          <h2 className="text-2xl font-bold">{event.name}</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-4 px-6 py-4 border-b border-slate-700">
          {["overview", "tasks", "budget", "guests"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveEventTab(tab)}
              className={`px-4 py-2 text-sm font-medium ${
                activeEventTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeEventTab === "overview" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800 p-4">
                <p className="text-slate-400 text-sm">Date</p>
                <p className="text-lg font-semibold">{event.date}</p>
              </div>
              <div className="bg-slate-800 p-4">
                <p className="text-slate-400 text-sm">Guests</p>
                <p className="text-lg font-semibold">{event.guests}</p>
              </div>
              <div className="bg-slate-800 p-4">
                <p className="text-slate-400 text-sm">Budget</p>
                <p className="text-lg font-semibold">€{event.budget.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800 p-4">
                <p className="text-slate-400 text-sm">Status</p>
                <p className="text-lg font-semibold capitalize">{event.status}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tasks */}
        {activeEventTab === "tasks" && (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Tasks</h3>
            <ul className="space-y-2">
              {tasks
                .filter((t) => t.event === event.name)
                .map((t) => (
                  <li
                    key={t.id}
                    className="bg-slate-800 border border-slate-700 p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-slate-400">
                        Due: {new Date(t.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs ${
                        t.status === "completed"
                          ? "bg-green-900 text-green-400"
                          : "bg-yellow-900 text-yellow-400"
                      }`}
                    >
                      {t.status}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Budget */}
        {activeEventTab === "budget" && (
          <div className="p-6 space-y-6">
            <h3 className="text-xl font-bold">Budget Summary</h3>
            <div className="bg-slate-800 p-6">
              <p>Total Budget: €{event.budget.toLocaleString()}</p>
              <p>Spent: €{event.spent.toLocaleString()}</p>
              <p>Remaining: €{(event.budget - event.spent).toLocaleString()}</p>
              <div className="w-full bg-slate-900 h-3 mt-3">
                <div
                  className="bg-blue-600 h-full"
                  style={{
                    width: `${(event.spent / event.budget) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Guests */}
        {activeEventTab === "guests" && (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Guest List</h3>
            <table className="w-full text-left">
              <thead className="bg-slate-800">
                <tr>
                  <th className="py-3 px-4 text-slate-400 text-sm">Name</th>
                  <th className="py-3 px-4 text-slate-400 text-sm">Email</th>
                  <th className="py-3 px-4 text-slate-400 text-sm">RSVP</th>
                  <th className="py-3 px-4 text-slate-400 text-sm">Table</th>
                </tr>
              </thead>
              <tbody>
                {guests
                  .filter((g) => g.event === event.name)
                  .map((guest) => (
                    <tr key={guest.id} className="border-t border-slate-800">
                      <td className="py-3 px-4 text-white">{guest.name}</td>
                      <td className="py-3 px-4 text-slate-300">{guest.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-1 text-xs ${
                            guest.rsvp === "confirmed"
                              ? "bg-green-900 text-green-400"
                              : "bg-yellow-900 text-yellow-400"
                          }`}
                        >
                          {guest.rsvp}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-300">
                        {guest.table}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main App
// -----------------------------------------------------------------------------
export default function EventPlannerApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const filteredVendors = vendors;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-slate-900 border-r border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">EventFlow</h1>
        </div>
        <div className="p-4 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "events", label: "Events", icon: Calendar },
            { id: "vendors", label: "Vendors", icon: Users },
            { id: "messages", label: "Messages", icon: MessageSquare },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 ${
                  activeTab === item.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === "dashboard" && <h1 className="text-3xl font-bold">Dashboard</h1>}
        {activeTab === "events" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Events</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventDetail(true);
                  }}
                  className="bg-slate-900 border border-slate-700 p-4 hover:border-blue-500 cursor-pointer"
                >
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-slate-400 text-sm">{event.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === "vendors" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Vendors</h1>
            {filteredVendors.map((v) => (
              <div
                key={v.id}
                onClick={() => {
                  setSelectedVendor(v);
                  setShowVendorModal(true);
                }}
                className="bg-slate-900 border border-slate-700 p-4 mb-3 hover:border-blue-500 cursor-pointer"
              >
                <h3 className="text-lg font-semibold">{v.name}</h3>
                <p className="text-slate-400 text-sm">{v.category}</p>
              </div>
            ))}
          </div>
        )}
        {activeTab === "messages" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Messages</h1>
            <p className="text-slate-400">Messaging area coming soon...</p>
          </div>
        )}
        {activeTab === "settings" && (
          <div>
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <p className="text-slate-400">Settings coming soon...</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateEvent && <div>Create Event Modal</div>}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">{selectedVendor.name}</h2>
            <p>{selectedVendor.category}</p>
            <button
              onClick={() => setShowVendorModal(false)}
              className="mt-4 bg-blue-600 px-4 py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {showEventDetail && selectedEvent && (
        <EventDetailView event={selectedEvent} onClose={() => setShowEventDetail(false)} />
      )}
    </div>
  );
}
