import React, { useState } from "react";
import {
  Calendar,
  Users,
  MessageSquare,
  Plus,
  X,
  Send,
  CheckCircle,
  DollarSign,
  MapPin,
  Star,
  Upload,
  Menu,
  Home,
  Settings,
  UserPlus,
  Mail,
  Edit,
} from "lucide-react";

export default function EventPlannerApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [messageInput, setMessageInput] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [activeEventTab, setActiveEventTab] = useState("overview");

  // ---------------------- Data ----------------------
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
        {
          id: 1,
          name: "Sarah Mitchell",
          role: "Lead Planner",
          email: "sarah@eventflow.com",
          avatar: "SM",
        },
        {
          id: 2,
          name: "James Cooper",
          role: "Vendor Coordinator",
          email: "james@eventflow.com",
          avatar: "JC",
        },
      ],
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
      team: [
        {
          id: 1,
          name: "Sarah Mitchell",
          role: "Lead Planner",
          email: "sarah@eventflow.com",
          avatar: "SM",
        },
      ],
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
      team: [
        {
          id: 1,
          name: "Sarah Mitchell",
          role: "Lead Planner",
          email: "sarah@eventflow.com",
          avatar: "SM",
        },
      ],
    },
  ];

  const vendors = [
    {
      id: 1,
      name: "Elegant Catering Co.",
      category: "Catering",
      rating: 4.9,
      price: "$$$$",
      location: "Downtown",
      reviews: 127,
      booked: true,
    },
    {
      id: 2,
      name: "Harmony DJ Services",
      category: "Entertainment",
      rating: 4.8,
      price: "$$$",
      location: "Citywide",
      reviews: 89,
      booked: true,
    },
    {
      id: 3,
      name: "Bloom & Petal",
      category: "Florals",
      rating: 5.0,
      price: "$$$",
      location: "Westside",
      reviews: 156,
      booked: false,
    },
    {
      id: 4,
      name: "Grand Ballroom",
      category: "Venue",
      rating: 4.7,
      price: "$$$$",
      location: "Central",
      reviews: 203,
      booked: true,
    },
    {
      id: 5,
      name: "Snapshot Studios",
      category: "Photography",
      rating: 4.9,
      price: "$$$",
      location: "East Bay",
      reviews: 94,
      booked: false,
    },
    {
      id: 6,
      name: "Sparkle Decor",
      category: "Decorations",
      rating: 4.6,
      price: "$$",
      location: "North",
      reviews: 71,
      booked: true,
    },
    {
      id: 7,
      name: "Gourmet Delights",
      category: "Catering",
      rating: 4.8,
      price: "$$$",
      location: "Midtown",
      reviews: 112,
      booked: false,
    },
    {
      id: 8,
      name: "Live Band Collective",
      category: "Entertainment",
      rating: 4.7,
      price: "$$$$",
      location: "Downtown",
      reviews: 78,
      booked: false,
    },
  ];

  const conversations = [
    {
      id: 1,
      vendor: "Elegant Catering Co.",
      lastMessage: "Menu proposal attached",
      time: "10:30 AM",
      unread: true,
      messages: [
        {
          sender: "vendor",
          text: "Hi! Thanks for reaching out about catering.",
          time: "9:15 AM",
        },
        { sender: "me", text: "We need catering for 250 guests.", time: "9:20 AM" },
        {
          sender: "vendor",
          text: "Menu proposal attached for your review",
          time: "10:30 AM",
        },
      ],
    },
    {
      id: 2,
      vendor: "Harmony DJ Services",
      lastMessage: "Confirming booking",
      time: "9:15 AM",
      unread: false,
      messages: [
        {
          sender: "vendor",
          text: "Confirming booking for June 15th.",
          time: "9:15 AM",
        },
      ],
    },
  ];

  const tasks = [
    {
      id: 1,
      title: "Finalize menu with caterer",
      event: "Summer Gala 2025",
      dueDate: "2025-05-01",
      status: "pending",
      priority: "high",
    },
    {
      id: 2,
      title: "Send venue contract",
      event: "Thompson Wedding",
      dueDate: "2025-04-28",
      status: "completed",
      priority: "high",
    },
    {
      id: 3,
      title: "Confirm DJ setup",
      event: "Summer Gala 2025",
      dueDate: "2025-05-10",
      status: "pending",
      priority: "medium",
    },
    {
      id: 4,
      title: "Review floral samples",
      event: "Thompson Wedding",
      dueDate: "2025-04-30",
      status: "in-progress",
      priority: "high",
    },
  ];

  const budgetItems = [
    {
      id: 1,
      category: "Venue",
      vendor: "Grand Ballroom",
      amount: 12000,
      paid: 12000,
      status: "paid",
      event: "Summer Gala 2025",
    },
    {
      id: 2,
      category: "Catering",
      vendor: "Elegant Catering",
      amount: 15000,
      paid: 7500,
      status: "partial",
      event: "Summer Gala 2025",
    },
    {
      id: 3,
      category: "Entertainment",
      vendor: "Harmony DJ",
      amount: 2500,
      paid: 0,
      status: "pending",
      event: "Summer Gala 2025",
    },
  ];

  const guests = [
    {
      id: 1,
      name: "John Smith",
      email: "john@email.com",
      rsvp: "confirmed",
      plusOne: true,
      event: "Summer Gala 2025",
      table: "A1",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah@email.com",
      rsvp: "confirmed",
      plusOne: false,
      event: "Summer Gala 2025",
      table: "A1",
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "michael@email.com",
      rsvp: "pending",
      plusOne: true,
      event: "Summer Gala 2025",
      table: "B2",
    },
  ];

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ---------------------- Event Detail Modal ----------------------
  const EventDetailView = ({ event }: { event: any }) => (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto">
      <div className="bg-slate-900 border-b border-slate-700 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowEventDetail(false)}
              className="text-slate-400 hover:text-white flex items-center gap-2"
            >
              <X size={20} /> Back
            </button>
            <button className="bg-slate-800 text-slate-300 px-4 py-2 border border-slate-700 flex items-center gap-2">
              <Edit size={18} /> Edit
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={16} />
              {new Date(event.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={16} />
              {event.location}
            </span>
            <span
              className={`px-3 py-1 text-xs ${
                event.status === "active"
                  ? "bg-green-900 text-green-400"
                  : "bg-yellow-900 text-yellow-400"
              }`}
            >
              {event.status}
            </span>
          </div>
          <div className="flex gap-4 mt-6 border-b border-slate-700">
            {["overview", "team", "tasks", "budget", "guests"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveEventTab(tab)}
                className={`pb-3 px-2 font-medium capitalize ${
                  activeEventTab === tab
                    ? "text-white border-b-2 border-blue-500"
                    : "text-slate-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeEventTab === "overview" && (
          <div className="bg-slate-900 border border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-3 text-white">Description</h2>
            <p className="text-slate-300">{event.description}</p>
          </div>
        )}

        {activeEventTab === "team" && (
          <div className="space-y-6">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold text-white">Team Members</h2>
              <button className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2">
                <UserPlus size={18} /> Add Member
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.team.map((member: any) => (
                <div key={member.id} className="bg-slate-900 border border-slate-700 p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-600 flex items-center justify-center font-bold text-white text-xl">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">{member.name}</h3>
                      <p className="text-sm text-blue-400">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    <Mail size={14} /> {member.email}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeEventTab === "tasks" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
            <div className="space-y-3">
              {tasks
                .filter((t) => t.event === event.name)
                .map((task) => (
                  <div key={task.id} className="bg-slate-900 border border-slate-700 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-semibold">{task.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs ${
                          task.status === "completed"
                            ? "bg-green-900 text-green-400"
                            : "bg-yellow-900 text-yellow-400"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeEventTab === "budget" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Budget</h2>
            <div className="bg-slate-900 border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Category</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Vendor</th>
                    <th className="text-right py-3 px-4 text-slate-400 text-sm">Amount</th>
                    <th className="text-right py-3 px-4 text-slate-400 text-sm">Paid</th>
                    <th className="text-center py-3 px-4 text-slate-400 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetItems
                    .filter((i) => i.event === event.name)
                    .map((item) => (
                      <tr key={item.id} className="border-t border-slate-800">
                        <td className="py-3 px-4 text-white">{item.category}</td>
                        <td className="py-3 px-4 text-slate-300">{item.vendor}</td>
                        <td className="py-3 px-4 text-right text-white">
                          ${item.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-green-400">
                          ${item.paid.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-1 text-xs ${
                              item.status === "paid"
                                ? "bg-green-900 text-green-400"
                                : item.status === "partial"
                                ? "bg-yellow-900 text-yellow-400"
                                : "bg-red-900 text-red-400"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeEventTab === "guests" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Guests</h2>
            <div className="bg-slate-900 border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800">
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Name</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Email</th>
                    <th className="text-center py-3 px-4 text-slate-400 text-sm">RSVP</th>
                    <th className="text-center py-3 px-4 text-slate-400 text-sm">Table</th>
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
          </div>
        )}
      </div>
    </div>
  );

  // ---------------------- Main Return ----------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-700 p-4 flex justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 border-2 border-blue-500 flex items-center justify-center font-bold">
            E
          </div>
          <span className="text-xl font-bold">EventFlow</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar */}
      <nav
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-slate-900 border-r border-slate-700 md:sticky md:top-0 md:h-screen overflow-y-auto`}
      >
        <div className="hidden md:block p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 border-2 border-blue-500 flex items-center justify-center font-bold text-2xl">
              E
            </div>
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
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-slate-400">Welcome back!</p>
              </div>
              <button
                onClick={() => setShowCreateEvent(true)}
                className="bg-blue-600 text-white px-6 py-2 flex items-center gap-2"
              >
                <Plus size={20} /> New Event
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-600 p-6">
                <div className="flex justify-between mb-4">
                  <Calendar size={32} />
                  <span className="text-3xl font-bold">{events.length}</span>
                </div>
                <h3 className="text-sm">Total Events</h3>
              </div>
              <div className="bg-purple-600 p-6">
                <div className="flex justify-between mb-4">
                  <Users size={32} />
                  <span className="text-3xl font-bold">
                    {vendors.filter((v) => v.booked).length}
                  </span>
                </div>
                <h3 className="text-sm">Booked Vendors</h3>
              </div>
              <div className="bg-green-600 p-6">
                <div className="flex justify-between mb-4">
                  <CheckCircle size={32} />
                  <span className="text-3xl font-bold">
                    {tasks.filter((t) => t.status === "completed").length}
                  </span>
                </div>
                <h3 className="text-sm">Tasks Done</h3>
              </div>
              <div className="bg-orange-600 p-6">
                <div className="flex justify-between mb-4">
                  <MessageSquare size={32} />
                  <span className="text-3xl font-bold">
                    {conversations.filter((c) => c.unread).length}
                  </span>
                </div>
                <h3 className="text-sm">New Messages</h3>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-700 p-6">
                <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventDetail(true);
                      }}
                      className="bg-slate-800 border border-slate-700 p-4 hover:border-blue-500 cursor-pointer"
                    >
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold">{event.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 ${
                            event.status === "active"
                              ? "bg-green-900 text-green-400"
                              : "bg-yellow-900 text-yellow-400"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        {new Date(event.date).toLocaleDateString()} • {event.guests} guests
                      </div>
                      <div className="w-full bg-slate-900 h-2 mt-3">
                        <div
                          className="bg-blue-600 h-full"
                          style={{
                            width: `${(event.completed / event.tasks) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-700 p-6">
                <h2 className="text-xl font-bold mb-4">Pending Tasks</h2>
                <div className="space-y-3">
                  {tasks
                    .filter((t) => t.status === "pending")
                    .map((task) => (
                      <div
                        key={task.id}
                        className="bg-slate-800 border border-slate-700 p-4"
                      >
                        <h3 className="font-medium text-sm">{task.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{task.event}</p>
                        <span className="text-xs text-slate-500 mt-2 block">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-6">
            <div className="flex justify-between">
              <h1 className="text-3xl font-bold">Events</h1>
              <button
                onClick={() => setShowCreateEvent(true)}
                className="bg-blue-600 text-white px-6 py-2 flex items-center gap-2"
              >
                <Plus size={20} /> Create Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    setShowEventDetail(true);
                  }}
                  className="bg-slate-900 border border-slate-700 p-6 hover:border-blue-500 cursor-pointer"
                >
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{event.name}</h3>
                      <span className="text-sm text-slate-400">{event.type}</span>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 h-fit ${
                        event.status === "active"
                          ? "bg-green-900 text-green-400"
                          : "bg-yellow-900 text-yellow-400"
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Calendar size={16} className="text-blue-400" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Users size={16} className="text-purple-400" />
                      {event.guests} guests
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <DollarSign size={16} className="text-green-400" />${event.spent.toLocaleString()} / ${event.budget.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-800 p-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className="font-semibold">
                        {Math.round((event.completed / event.tasks) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2">
                      <div
                        className="bg-blue-600 h-full"
                        style={{
                          width: `${(event.completed / event.tasks) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "vendors" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Vendors</h1>
            <div className="bg-slate-900 border border-slate-700 p-6">
              <div className="flex gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
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
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    onClick={() => {
                      setSelectedVendor(vendor);
                      setShowVendorModal(true);
                    }}
                    className="bg-slate-800 border border-slate-700 p-5 hover:border-blue-500 cursor-pointer"
                  >
                    <div className="flex justify-between mb-4">
                      <div className="flex items-center gap-1 bg-slate-900 px-2 py-1">
                        <Star className="text-yellow-500 fill-yellow-500" size={14} />
                        <span className="text-sm font-bold">{vendor.rating}</span>
                      </div>
                      {vendor.booked && (
                        <span className="text-xs bg-green-900 text-green-400 px-2 py-1">
                          Booked
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{vendor.name}</h3>
                    <p className="text-blue-400 text-sm mb-3">{vendor.category}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400 font-bold">{vendor.price}</span>
                      <span className="text-slate-400">{vendor.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Messages</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-700 p-4">
                <h2 className="text-lg font-bold mb-4">Conversations</h2>
                <div className="space-y-2">
                  {conversations.map((conv, idx) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(idx)}
                      className={`p-4 cursor-pointer ${
                        selectedConversation === idx ? "bg-blue-600" : "bg-slate-800"
                      }`}
                    >
                      <h3 className="font-bold text-sm">{conv.vendor}</h3>
                      <p className="text-sm text-slate-300 truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unread && (
                        <span className="inline-block mt-2 text-xs bg-blue-600 px-2 py-1">
                          New
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-900 border border-slate-700 flex flex-col">
                <div className="p-6 border-b border-slate-700">
                  <h2 className="text-xl font-bold">
                    {conversations[selectedConversation].vendor}
                  </h2>
                </div>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[500px]">
                  {conversations[selectedConversation].messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        msg.sender === "me" ? "justify-end" : ""
                      }`}
                    >
                      <div
                        className={`p-4 max-w-md ${
                          msg.sender === "me" ? "bg-blue-600" : "bg-slate-800"
                        }`}
                      >
                        <p className="text-white">{msg.text}</p>
                        <span className="text-xs text-slate-300 mt-1 block">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-slate-700">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="p-3 bg-slate-800 border border-slate-700"
                    >
                      <Upload size={20} className="text-blue-400" />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type message..."
                      className="flex-1 bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      className="px-6 bg-blue-600 text-white font-semibold flex items-center gap-2"
                    >
                      <Send size={20} /> Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <div className="bg-slate-900 border border-slate-700 p-6">
              <p className="text-slate-400">Settings coming soon...</p>
            </div>
          </div>
        )}
      </main>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between">
              <h2 className="text-2xl font-bold">Create Event</h2>
              <button onClick={() => setShowCreateEvent(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Event Name"
                className="w-full bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <select className="w-full bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                <option>Wedding</option>
                <option>Corporate</option>
                <option>Birthday</option>
                <option>Conference</option>
              </select>
              <input
                type="date"
                className="w-full bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                placeholder="Budget"
                className="w-full bg-slate-800 border border-slate-700 px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowCreateEvent(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Modal */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between">
              <div>
                <h2 className="text-2xl font-bold">{selectedVendor.name}</h2>
                <p className="text-blue-400 text-sm mt-1">
                  {selectedVendor.category}
                </p>
              </div>
              <button onClick={() => setShowVendorModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star
                    className="text-yellow-500 fill-yellow-500"
                    size={20}
                  />
                  <span className="font-bold text-lg">
                    {selectedVendor.rating}
                  </span>
                  <span className="text-slate-400 text-sm">
                    ({selectedVendor.reviews} reviews)
                  </span>
                </div>
                <div className="text-green-400 font-bold text-lg">
                  {selectedVendor.price}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={16} className="text-blue-400" />
                  <span className="text-sm">{selectedVendor.location}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-3">About</h3>
                <p className="text-slate-300">
                  Professional {selectedVendor.category.toLowerCase()} services
                  with over 10 years of experience. We specialize in creating
                  unforgettable moments for your special day.
                </p>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                  Send Inquiry
                </button>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 border border-slate-700">
                  Save to Favorites
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetail && selectedEvent && (
        <EventDetailView event={selectedEvent} />
      )}
    </div>
  );
}
