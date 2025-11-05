import React, { useState, useMemo } from "react";
import {
  Calendar,
  Users,
  Plus,
  X,
} from "lucide-react";

const NEON = "#A020F0";
const neonBoxShadow = `0 6px 30px -6px ${NEON}, 0 0 20px 2px ${NEON}55`;

// Small helper for theme colors (adjust to your actual theme system)
function useThemeClasses(theme) {
  const isDark = theme === "dark";
  return {
    appBg: isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900",
    panelBg: isDark ? "bg-slate-800" : "bg-white",
    subtleBg: isDark ? "bg-slate-700" : "bg-slate-50",
    border: "border border-2",
    mutedText: isDark ? "text-slate-300" : "text-slate-500",
    strongText: isDark ? "text-slate-100" : "text-slate-900",
  };
}

export default function App() {
  const [theme, setTheme] = useState("dark");
  const classes = useThemeClasses(theme);

  // Example Tasks State
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Finalize menu with caterer",
      description: "Review and approve final menu selections.",
      assignedTo: "James Cooper",
      dueDate: "2025-05-01",
      status: "in-progress",
      priority: "high",
      event: "Summer Gala 2025",
      createdBy: "Sarah Mitchell",
    },
    {
      id: 2,
      title: "Confirm DJ setup requirements",
      description: "Coordinate with DJ on equipment and setup.",
      assignedTo: "Emily Rodriguez",
      dueDate: "2025-05-10",
      status: "pending",
      priority: "medium",
      event: "Summer Gala 2025",
      createdBy: "James Cooper",
    },
  ]);

  const [taskView, setTaskView] = useState("board"); // "list" or "board"
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedOverStatus, setDraggedOverStatus] = useState(null);

  const statuses = [
    { key: "pending", label: "To Do" },
    { key: "in-progress", label: "In Progress" },
    { key: "completed", label: "Done" },
  ];

  // Add Task Modal Component
  function AddTaskModal({ onClose }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assignedTo, setAssignedTo] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [status, setStatus] = useState("pending");

    const handleAdd = () => {
      if (!title.trim()) {
        alert("Title is required");
        return;
      }
      const newTask = {
        id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
        title,
        description,
        assignedTo,
        dueDate,
        status,
        priority: "medium",
        event: "Sample Event",
        createdBy: "You",
      };
      setTasks((prev) => [...prev, newTask]);
      onClose();
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      >
        <div className={`bg-white rounded-2xl w-full max-w-md p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Add Task</h3>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 font-bold text-xl"
            >
              &times;
            </button>
          </div>
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Assigned person"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {statuses.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-md bg-purple-700 text-white hover:bg-purple-800"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle drag start for task
  const onDragStart = (taskId) => {
    setDraggedTaskId(taskId);
  };

  // Allow drag over on status column
  const onDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop onto status column
  const onDrop = (status) => {
    if (draggedTaskId === null) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggedTaskId ? { ...task, status: status } : task
      )
    );
    setDraggedTaskId(null);
  };

  return (
    <div className={`${classes.appBg} min-h-screen p-6 font-sans`}>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-purple-400">Task Board</h1>
        <button
          onClick={() => setShowAddTaskModal(true)}
          className="flex items-center gap-2 bg-purple-700 text-white px-4 py-2 rounded-md hover:bg-purple-800"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {taskView === "board" && (
        <div className="grid grid-cols-3 gap-4">
          {statuses.map(({ key, label }) => (
            <div
              key={key}
              onDragOver={onDragOver}
              onDrop={() => onDrop(key)}
              className={`${classes.panelBg} border border-gray-700 rounded-md p-4 min-h-[300px] flex flex-col`}
            >
              <h2 className="font-semibold text-gray-300 mb-3">{label}</h2>
              <div className="flex flex-col gap-3 flex-grow overflow-auto">
                {tasks
                  .filter((task) => task.status === key)
                  .map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => onDragStart(task.id)}
                      className={`bg-gray-800 rounded-md p-3 cursor-move shadow hover:shadow-lg border border-gray-600`}
                    >
                      <div className="font-bold text-white">{task.title}</div>
                      {task.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-400 mt-1 flex justify-between">
                        <span>Assigned: {task.assignedTo || "Unassigned"}</span>
                        <span>Due: {task.dueDate || "N/A"}</span>
                      </div>
                    </div>
                  ))}
                {tasks.filter((t) => t.status === key).length === 0 && (
                  <p className="text-gray-500 text-sm italic mt-auto">No tasks</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddTaskModal && (
        <AddTaskModal onClose={() => setShowAddTaskModal(false)} />
      )}
    </div>
  );
}
