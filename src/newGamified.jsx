import React, { useState } from "react";
import {
  Home, Calendar, Users, Settings, Plus, Star, MessageSquare
} from "lucide-react";

/* =======================
   Visual Tokens
======================= */

const GLASS =
  "bg-[rgba(18,22,34,0.75)] backdrop-blur-xl border border-slate-700/60";
const PANEL = `${GLASS} shadow-[0_8px_30px_rgba(0,0,0,0.6)]`;
const NEON = "linear-gradient(90deg,#7c7cff,#b983ff)";
const RADIUS = "rounded-lg";

/* =======================
   Gamification Config
======================= */

const QUESTS = [
  { id: 1, label: "Create your first event", xp: 50 },
  { id: 2, label: "Add 5 tasks", xp: 75 },
  { id: 3, label: "Message a vendor", xp: 40 }
];

/* =======================
   App
======================= */

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [xp, setXp] = useState(120);
  const [completedQuests, setCompletedQuests] = useState([1]);

  const xpLevel = Math.floor(xp / 100);
  const xpProgress = xp % 100;

  const completeQuest = (id, reward) => {
    if (!completedQuests.includes(id)) {
      setCompletedQuests([...completedQuests, id]);
      setXp(xp + reward);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans flex">
      {/* Sidebar */}
      <aside className={`w-64 p-6 ${PANEL}`}>
        <h1 className="text-xl font-bold text-white mb-6">Athar UX</h1>
        {[
          { id: "dashboard", label: "Dashboard", icon: Home },
          { id: "events", label: "Events", icon: Calendar },
          { id: "clients", label: "Clients", icon: Users },
          { id: "messages", label: "Messages", icon: MessageSquare },
          { id: "settings", label: "Settings", icon: Settings }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 text-sm ${RADIUS}
                ${activeTab === item.id
                  ? "bg-slate-800 text-white"
                  : "hover:bg-slate-800/60"}`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 space-y-8">

        {/* Header */}
        <header className={`${PANEL} ${RADIUS} p-6 flex justify-between`}>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Level {xpLevel}
            </h2>
            <div className="mt-2 h-2 bg-slate-800 rounded overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${xpProgress}%`,
                  background: NEON
                }}
              />
            </div>
            <p className="text-xs mt-1 text-slate-400">
              {xpProgress}/100 XP
            </p>
          </div>
          <button className="bg-purple-700 px-4 py-2 text-sm font-semibold rounded-md">
            <Plus size={14} /> New
          </button>
        </header>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quests */}
            <div className={`${PANEL} ${RADIUS} p-6`}>
              <h3 className="text-lg font-semibold text-white mb-4">
                Active Quests
              </h3>
              <div className="space-y-3">
                {QUESTS.map(q => {
                  const done = completedQuests.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`p-4 border border-slate-700/60 ${RADIUS}
                        ${done ? "opacity-50" : "hover:border-purple-500"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{q.label}</span>
                        <span className="text-xs text-purple-300">
                          +{q.xp} XP
                        </span>
                      </div>
                      {!done && (
                        <button
                          onClick={() => completeQuest(q.id, q.xp)}
                          className="mt-2 text-xs text-purple-400 hover:underline"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Events Preview */}
            <div className={`${PANEL} ${RADIUS} p-6 lg:col-span-2`}>
              <h3 className="text-lg font-semibold text-white mb-4">
                Upcoming Events
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`p-4 border border-slate-700/60 ${RADIUS}`}
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="font-semibold">Event {i}</h4>
                      <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">
                      12 tasks • 80% complete
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: "80%", background: NEON }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Placeholder Tabs */}
        {activeTab !== "dashboard" && (
          <div className={`${PANEL} ${RADIUS} p-10 text-center`}>
            <h2 className="text-xl font-semibold text-white mb-2">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-slate-400 text-sm">
              UI preserved conceptually. Screenshots ready.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
