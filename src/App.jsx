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
// Event Detail View Component
// -----------------------------------------------------------------------------
function EventDetailView({ event }) {
  const [activeEventTab, setActiveEventTab] = useState("overview");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 flex justify-between items-center p-6">
          <h2 className="text-2xl font-bold">{event.name}</h2>
          <button onClick={() => window.location.reload()}>
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
// Main Component
// -----------------------------------------------------------------------------
export default function EventPlannerApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [messageInput, setMessageInput] = useState("");

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterCategory === "All" || v.category === filterCategory)
  );

  // ---------------------------------------------------------------------------
  // Layout: Sidebar + Main Tabs (Dashboard, Events, Vendors, Messages, Settings)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      {/* ... same sidebar and main tab content from earlier completion ... */}
      {/* Modals and EventDetailView */}
      {/* ... same modals and event detail view from earlier completion ... */}
    </div>
  );
}
