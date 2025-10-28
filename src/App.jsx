// src/App.jsx
import React, { useState } from 'react';
import {
  Calendar, Users, MessageSquare, Search, Plus, X, Send, CheckCircle, Clock, DollarSign, MapPin, Star, Upload,
  Menu, Home, Settings, Edit, Building2, Paperclip
} from 'lucide-react';

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
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [activeEventTab, setActiveEventTab] = useState('overview');
  const [taskView, setTaskView] = useState('list');
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Finalize menu with caterer', event: 'Summer Gala 2025', dueDate: '2025-05-01', status: 'in-progress', priority: 'high', assignedTo: 'James Cooper' },
    { id: 2, title: 'Send venue contract', event: 'Thompson Wedding', dueDate: '2025-04-28', status: 'completed', priority: 'high', assignedTo: 'Sarah Mitchell' },
    { id: 3, title: 'Confirm DJ setup requirements', event: 'Summer Gala 2025', dueDate: '2025-05-10', status: 'pending', priority: 'medium', assignedTo: 'Emily Rodriguez' },
    { id: 4, title: 'Review floral samples', event: 'Thompson Wedding', dueDate: '2025-04-30', status: 'in-progress', priority: 'high', assignedTo: 'Sarah Mitchell' }
  ]);

  const events = [
    { id: 1, name: 'Summer Gala 2025', date: '2025-06-15', tasks: 24, completed: 18 },
    { id: 2, name: 'Thompson Wedding', date: '2025-07-22', tasks: 31, completed: 22 },
    { id: 3, name: 'Tech Conference 2025', date: '2025-08-10', tasks: 42, completed: 8 }
  ];

  /* -------------------- NEW: Add Task Modal -------------------- */
  const AddTaskModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-5" style={{ boxShadow: neonBoxShadow }}>
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <h2 className="text-lg font-bold text-white">Add New Task</h2>
          <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <form className="space-y-4">
          <input type="text" placeholder="Task Title" className="w-full bg-slate-800 p-3 rounded-md text-slate-200" />
          <select className="w-full bg-slate-800 p-3 rounded-md text-slate-200">
            <option>Select Event</option>
            {events.map(e => <option key={e.id}>{e.name}</option>)}
          </select>
          <div className="flex gap-3">
            <input type="date" className="flex-1 bg-slate-800 p-3 rounded-md text-slate-200" />
            <select className="flex-1 bg-slate-800 p-3 rounded-md text-slate-200">
              <option>Status</option>
              <option value="pending">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Done</option>
            </select>
          </div>
          <input type="text" placeholder="Assigned To" className="w-full bg-slate-800 p-3 rounded-md text-slate-200" />
          <textarea rows="3" placeholder="Description" className="w-full bg-slate-800 p-3 rounded-md text-slate-200" />
          <button type="button" className="w-full bg-purple-700 hover:bg-purple-600 text-white py-3 rounded-md font-semibold">Save Task</button>
        </form>
      </div>
    </div>
  );

  /* -------------------- NEW: Drag-and-Drop Board View -------------------- */
  const TaskBoardView = ({ event }) => {
    const [draggedTask, setDraggedTask] = useState(null);

    const handleDragStart = (task) => setDraggedTask(task);
    const handleDrop = (status) => {
      if (!draggedTask) return;
      setTasks(prev =>
        prev.map(t =>
          t.id === draggedTask.id ? { ...t, status } : t
        )
      );
      setDraggedTask(null);
    };

    const columns = [
      { key: 'pending', label: 'To Do' },
      { key: 'in-progress', label: 'In Progress' },
      { key: 'completed', label: 'Done' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(col => (
          <div key={col.key}
            className="bg-slate-800 border-2 border-slate-700 rounded-md p-4 min-h-[250px]"
            style={{ boxShadow: neonBoxShadow }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.key)}
          >
            <h3 className="text-lg font-semibold text-white mb-3">{col.label}</h3>
            <div className="space-y-3">
              {tasks
                .filter(t => t.event === event.name && t.status === col.key)
                .map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="bg-slate-700 hover:bg-slate-600 p-3 rounded-md cursor-grab transition-all border border-slate-600 active:cursor-grabbing"
                  >
                    <h4 className="text-sm font-semibold text-white">{task.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">{task.assignedTo}</p>
                    <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded ${task.priority === 'high' ? 'bg-red-500/30 text-red-300' : 'bg-slate-600 text-slate-300'}`}>{task.priority}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* -------------------- Event Detail View -------------------- */
  const EventDetailView = ({ event }) => {
    if (!event) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
        <div className="min-h-screen bg-slate-900 p-6">
          <div className="flex justify-between items-center mb-4">
            <button onClick={() => setShowEventDetail(false)} className="text-slate-300 hover:text-white flex items-center gap-2 text-sm font-semibold">
              <X size={18} /> Back to Events
            </button>
            <div className="flex gap-2">
              <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2">
                <Edit size={14} /> Edit
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{event.name}</h1>
          <div className="flex gap-2 mt-4 border-b border-slate-700 pb-2">
            {['overview', 'tasks'].map(tab => (
              <button key={tab} onClick={() => setActiveEventTab(tab)}
                className={`pb-2 px-3 text-sm font-semibold ${activeEventTab === tab ? 'text-white border-b-2 border-purple-500' : 'text-slate-400 hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>

          {activeEventTab === 'tasks' && (
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">Tasks</h2>
                  <div className="flex gap-1 bg-slate-800 p-1 rounded">
                    <button onClick={() => setTaskView('list')} className={`px-3 py-1 text-xs font-semibold ${taskView === 'list' ? 'bg-slate-700 text-white shadow' : 'text-slate-300'}`}>List</button>
                    <button onClick={() => setTaskView('board')} className={`px-3 py-1 text-xs font-semibold ${taskView === 'board' ? 'bg-slate-700 text-white shadow' : 'text-slate-300'}`}>Board</button>
                  </div>
                </div>
                <button onClick={() => setShowAddTaskModal(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2"><Plus size={16} />Add Task</button>
              </div>

              {taskView === 'list' && (
                <div className="bg-slate-800 border-2 border-slate-700 rounded-md overflow-hidden">
                  <table className="w-full text-sm text-slate-300">
                    <thead>
                      <tr className="bg-slate-700 text-slate-200">
                        <th className="text-left py-3 px-4 font-semibold">Task</th>
                        <th className="text-left py-3 px-4 font-semibold">Assigned</th>
                        <th className="text-center py-3 px-4 font-semibold">Priority</th>
                        <th className="text-center py-3 px-4 font-semibold">Status</th>
                        <th className="text-center py-3 px-4 font-semibold">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.filter(t => t.event === event.name).map(task => (
                        <tr key={task.id} className="border-t border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4 text-white">{task.title}</td>
                          <td className="py-3 px-4">{task.assignedTo}</td>
                          <td className="py-3 px-4 text-center">{task.priority}</td>
                          <td className="py-3 px-4 text-center">{task.status}</td>
                          <td className="py-3 px-4 text-center">{new Date(task.dueDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {taskView === 'board' && <TaskBoardView event={event} />}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* -------------------- Main Layout -------------------- */
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:flex-row">
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Events</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {events.map(event => (
              <div key={event.id} onClick={() => { setSelectedEvent(event); setShowEventDetail(true); }}
                className="bg-white border-2 border-gray-300 p-5 hover:border-blue-400 hover:shadow-md cursor-pointer rounded-md">
                <h3 className="text-lg font-semibold text-slate-900">{event.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        {showEventDetail && selectedEvent && <EventDetailView event={selectedEvent} />}
        {showAddTaskModal && <AddTaskModal />}
      </main>
    </div>
  );
}
