import { useState, useEffect } from "react";
import { FaHome, FaCalendar, FaUsers, FaCog } from "react-icons/fa";

// ---------- Sidebar Component ----------
function Sidebar({ activePanel, setActivePanel }) {
  const items = [
    { name: "Dashboard", icon: <FaHome />, panel: "dashboard" },
    { name: "Events", icon: <FaCalendar />, panel: "events" },
    { name: "Guests", icon: <FaUsers />, panel: "guests" },
    { name: "Settings", icon: <FaCog />, panel: "settings" },
  ];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 p-4 backdrop-blur-lg bg-white/60 dark:bg-gray-900/60 border-r border-gray-200 dark:border-gray-800 z-40 ${
        isMobile ? "translate-x-[-100%] sm:translate-x-0" : ""
      } transition-transform`}
    >
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">EventHub</h1>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.panel}
            onClick={() => setActivePanel(item.panel)}
            className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors
              ${
                activePanel === item.panel
                  ? "bg-[#1E90FF]/20 text-[#1E90FF]"
                  : "text-gray-800 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800/50"
              }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
        Active Panel: <span className="font-semibold">{activePanel}</span>
      </p>
    </aside>
  );
}

// ---------- Modal Component ----------
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xl transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-lg w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ---------- Theme Toggle ----------
function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark", "focused");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <div className="flex items-center space-x-2 mt-4">
      <label className="font-medium text-gray-700 dark:text-gray-300">Theme:</label>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="p-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="focused">Focused</option>
      </select>
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  const [activePanel, setActivePanel] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("events") || "[]");
    setEvents(storedEvents);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  const handleSaveEvent = (event) => {
    if (editingEvent) {
      setEvents(events.map((e) => (e.id === editingEvent.id ? { ...editingEvent, ...event } : e)));
    } else {
      setEvents([...events, { id: Date.now(), ...event }]);
    }
    setEditingEvent(null);
    setModalOpen(false);
  };

  return (
    <div className="flex">
      <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />

      {/* Main Panel */}
      <div className="flex-1 min-h-screen ml-64 p-6 bg-gray-50 dark:bg-gray-800 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{activePanel}</h2>
          {activePanel === "settings" && <ThemeToggle />}
        </div>

        {/* Panel Content */}
        {activePanel === "dashboard" && <p className="text-gray-700 dark:text-gray-200">Welcome to your dashboard!</p>}

        {activePanel === "events" && (
          <div>
            <button
              onClick={() => setModalOpen(true)}
              className="mb-4 px-4 py-2 rounded-lg bg-[#1E90FF] text-white hover:bg-[#1E90FF]/80 transition"
            >
              Add Event
            </button>
            {events.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-200">No events yet.</p>
            ) : (
              <ul className="space-y-2">
                {events.map((event) => (
                  <li
                    key={event.id}
                    className="p-4 rounded-lg bg-white dark:bg-gray-900 shadow hover:shadow-lg transition cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-gray-900 dark:text-gray-200">{event.name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditingEvent(event);
                          setModalOpen(true);
                        }}
                        className="px-2 py-1 bg-[#1E90FF]/20 text-[#1E90FF] rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setEvents(events.filter((e) => e.id !== event.id))}
                        className="px-2 py-1 bg-red-500/20 text-red-500 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activePanel === "guests" && <p className="text-gray-700 dark:text-gray-200">Guests panel content here.</p>}
        {activePanel === "settings" && <p className="text-gray-700 dark:text-gray-200">Settings panel content here.</p>}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => {setModalOpen(false); setEditingEvent(null);}}>
        <EventForm
          onSave={handleSaveEvent}
          editingEvent={editingEvent}
        />
      </Modal>
    </div>
  );
}

// ---------- Event Form Component ----------
function EventForm({ onSave, editingEvent }) {
  const [name, setName] = useState(editingEvent ? editingEvent.name : "");

  useEffect(() => {
    if (editingEvent) setName(editingEvent.name);
  }, [editingEvent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-bold mb-4">{editingEvent ? "Edit Event" : "Create Event"}</h3>
      <input
        className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        type="text"
        placeholder="Event Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => onSave(null)}
          className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-[#1E90FF] text-white hover:bg-[#1E90FF]/80 transition"
        >
          Save
        </button>
      </div>
    </form>
  );
}
