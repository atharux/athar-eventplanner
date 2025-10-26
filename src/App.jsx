"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar, CheckCircle, DollarSign, MapPin, Menu, MessageSquare, Plus,
  Send, Settings, Star, Upload, Users, X, Edit, Home, UserPlus, Mail
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [activeEventTab, setActiveEventTab] = useState("overview");

  const [events, setEvents] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [tasks, setTasks] = useState([]);

  // ------------------ Backend Hooks ------------------

  // Fetch all events
  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  };

  // Fetch vendors
  const fetchVendors = async () => {
    const res = await fetch("/api/vendors");
    const data = await res.json();
    setVendors(data);
  };

  // Fetch tasks
  const fetchTasks = async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  };

  // On mount
  useEffect(() => {
    fetchEvents();
    fetchVendors();
    fetchTasks();
  }, []);

  // Add or update event
  const saveEvent = async (event) => {
    if (event.id) {
      await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(event)
      });
    } else {
      await fetch("/api/events", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(event)
      });
    }
    fetchEvents();
  };

  // Add or update task
  const saveTask = async (task) => {
    if (task.id) {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(task)
      });
    } else {
      await fetch("/api/tasks", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(task)
      });
    }
    fetchTasks();
    fetchEvents(); // refresh events to update tasks in event detail
  };

  // Assign vendor to event
  const assignVendorToEvent = async (eventId, vendor) => {
    const event = events.find(e=>e.id===eventId);
    if (!event.vendors.find(v=>v.id===vendor.id)) {
      const updated = {...event, vendors:[...event.vendors,vendor]};
      await saveEvent(updated);
    }
  };

  const pct = (num, denom) => (denom ? Math.round((num / denom) * 100) : 0);

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ------------------ Modals ------------------
  const TaskModal = ({ task, eventId }) => {
    const [title, setTitle] = useState(task?.title || "");
    const [dueDate, setDueDate] = useState(task?.dueDate || "");
    const [status, setStatus] = useState(task?.status || "pending");
    const [priority, setPriority] = useState(task?.priority || "medium");

    const handleSave = () => {
      saveTask({ id: task?.id, title, dueDate, status, priority, eventId });
      setShowTaskModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-4 rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold">{task ? "Update Task" : "Add Task"}</h3>
            <button onClick={()=>setShowTaskModal(false)}><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Task Title" className="w-full bg-slate-800 px-3 py-2 rounded" />
            <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full bg-slate-800 px-3 py-2 rounded" />
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full bg-slate-800 px-3 py-2 rounded">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select value={priority} onChange={e=>setPriority(e.target.value)} className="w-full bg-slate-800 px-3 py-2 rounded">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
            <button onClick={handleSave} className="bg-blue-600 px-4 py-2 rounded">{task ? "Update" : "Add"}</button>
          </div>
        </div>
      </div>
    );
  };

  const VendorModal = ({ event }) => {
    const assign = (vendor) => {
      assignVendorToEvent(event.id, vendor);
      setShowVendorModal(false);
    };
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl p-4 rounded">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold">Assign Vendor</h3>
            <button onClick={()=>setShowVendorModal(false)}><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredVendors.map(v => (
              <div key={v.id} className="bg-slate-800 border border-slate-700 p-3 rounded flex justify-between items-center cursor-pointer hover:bg-blue-600" onClick={()=>assign(v)}>
                <div>{v.name} <div className="text-xs text-slate-400">{v.category}</div></div>
                <div className="text-xs text-slate-300">{v.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ------------------ Event Detail ------------------
  const EventDetailView = ({ event }) => {
    const [tab, setTab] = useState(activeEventTab);
    const eventTasks = tasks.filter(t => t.eventId === event.id);

    return (
      <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex items-start md:items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl rounded-md overflow-hidden">
          <div className="bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{event.name}</h2>
              <p className="text-sm text-slate-400">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowEventDetail(false)} className="p-2"><X size={20} /></button>
            </div>
          </div>

          <div className="p-4 border-b border-slate-700 flex gap-2">
            {["overview","team","vendors","tasks"].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm capitalize ${tab===t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {tab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-700 p-6">
                    <h3 className="text-xl font-bold mb-2">Description</h3>
                    <p className="text-slate-300">{event.description}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-700 p-6">
                    <h3 className="text-lg font-bold mb-3">Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-slate-400">Tasks</span><span className="font-semibold">{eventTasks.length}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Vendors</span><span className="font-semibold">{event.vendors.length}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {tab === 'team' && (
              <div className="space-y-3">
                {event.team.map(member => (
                  <div key={member.id} className="bg-slate-900 border border-slate-700 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded font-bold">{member.avatar}</div>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-slate-400">{member.role}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-2"><Mail size={12} />{member.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === 'vendors' && (
              <div>
                <button onClick={()=>setShowVendorModal(true)} className="bg-blue-600 px-3 py-2 rounded mb-3"><Plus size={14}/> Assign Vendor</button>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.vendors.map(v => (
                    <div key={v.id} className="bg-slate-900 border border-slate-700 p-4">
                      <div className="font-semibold">{v.name}</div>
                      <div className="text-xs text-slate-400">{v.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === 'tasks' && (
              <div>
                <button onClick={()=>{ setSelectedTask(null); setShowTaskModal(true); }} className="bg-blue-600 px-3 py-2 rounded mb-3"><Plus size={14}/> Add Task</button>
                <div className="space-y-3">
                  {eventTasks.map(task => (
                    <div key={task.id} className="bg-slate-900 border border-slate-700 p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-slate-400">Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <select value={task.status} onChange={(e)=>saveTask({...task,status:e.target.value})} className="bg-slate-800 px-2 py-1 rounded text-xs">
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ------------------ Render ------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
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
            {id:'settings', label:'Settings', icon:Settings},
          ].map(item => {
            const Icon = item.icon;
            return <button key={item.id} onClick={()=>setActiveTab(item.id)} className={`flex items-center gap-2 px-3 py-2 rounded w-full ${activeTab===item.id?'bg-blue-600':'hover:bg-slate-800'}`}>
              <Icon size={16} /> {item.label}
            </button>;
          })}
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab==='dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-700 p-4 rounded">
                <div className="text-slate-400 text-sm">Events</div>
                <div className="font-bold text-xl">{events.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded">
                <div className="text-slate-400 text-sm">Vendors</div>
                <div className="font-bold text-xl">{vendors.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 p-4 rounded">
                <div className="text-slate-400 text-sm">Tasks</div>
                <div className="font-bold text-xl">{tasks.length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab==='events' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Events</h2>
              <button onClick={()=>setShowCreateEvent(true)} className="bg-blue-600 px-4 py-2 rounded"><Plus size={16}/> New Event</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(ev => (
                <div key={ev.id} className="bg-slate-900 border border-slate-700 p-4 rounded cursor-pointer hover:bg-slate-800" onClick={()=>{setSelectedEvent(ev); setShowEventDetail(true);}}>
                  <div className="font-bold">{ev.name}</div>
                  <div className="text-xs text-slate-400">{new Date(ev.date).toLocaleDateString()} • {ev.location}</div>
                  <div className="text-xs mt-1 text-slate-400">Tasks: {ev.tasks.length} • Vendors: {ev.vendors.length}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==='vendors' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Vendors</h2>
              <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search vendor..." className="bg-slate-800 px-3 py-2 rounded w-64"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVendors.map(v => (
                <div key={v.id} className="bg-slate-900 border border-slate-700 p-4 rounded">
                  <div className="font-semibold">{v.name}</div>
                  <div className="text-xs text-slate-400">{v.category}</div>
                  <div className="text-xs text-slate-400">Rating: {v.rating} ⭐</div>
                  <div className="text-xs text-slate-400">{v.price}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showEventDetail && <EventDetailView event={selectedEvent} />}
        {showTaskModal && <TaskModal task={selectedTask} eventId={selectedEvent?.id || 1} />}
        {showVendorModal && <VendorModal event={selectedEvent} />}
      </main>
    </div>
  );
}
