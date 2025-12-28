import React, { useState } from "react";
import {
  Home,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  Plus
} from "lucide-react";

/* =======================
   Visual System (Disciplined)
======================= */

const GLASS =
  "bg-[rgba(18,22,34,0.78)] backdrop-blur-md";

const GLASS_BORDER =
  "border border-[rgba(255,255,255,0.08)]";

const PANEL =
  `${GLASS} ${GLASS_BORDER}`;

const RADIUS =
  "rounded-md";

const NEON =
  "linear-gradient(90deg, #7c3aed, #a855f7)";

/* =======================
   Data
======================= */

const QUESTS = [
  { id: 1, label: "Create your first event", xp: 50 },
  { id: 2, label: "Add 5 tasks to an event", xp: 75 },
  { id: 3, label: "Message a vendor", xp: 40 }
];

const EVENTS = [
  { id: 1, name: "Berlin Tech Mixer", progress: 0.8 },
  { id: 2, name: "Private Dinner", progress: 0.55 }
];

/* =======================
   App
======================= */

export default function PreviewGamifiedApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [xp, setXp] = useState(140);
  const [rewardFlash, setRewardFlash] = useState(null);
  const [completedQuests, setCompletedQuests] = useState([1]);

  const level = Math.floor(xp / 100);
  const xpProgress = xp % 100;

  const completeQuest = (quest) => {
    if (completedQuests.includes(quest.id)) return;

    setCompletedQuests(prev => [...prev, quest.id]);
    setXp(prev => prev + quest.xp);
    setRewardFlash(`+${quest.xp} XP`);

    setTimeout(() => setRewardFlash(null), 1200);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 font-sans flex">
      {/* Sidebar */}
      <aside className={`w-64 p-6 ${PANEL}`}>
        <h1 className="text-xl font-bold text-white mb-8">
          Athar UX
        </h1>

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
      <main className="flex-1 p-10 space-y-10">
        {/* Header */}
        <header className={`${PANEL} ${RADIUS} p-6 relative`}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-400">Level</div>
              <div className="text-2xl font-bold text-white">{level}</div>

              <div className="mt-2 h-2 bg-slate-800 rounded overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{ width: `${xpProgress}%`, background: NEON }}
                />
              </div>

              <div className="text-xs text-slate-400 mt-1">
                {xpProgress} / 100 XP
              </div>
            </div>

            <button className="flex items-center gap-2 bg-purple-700 px-4 py-2 text-sm font-semibold rounded-md">
              <Plus size={14} /> New Event
            </button>
          </div>

          {rewardFlash && (
            <div className="absolute top-4 right-6 text-sm font-semibold text-purple-300 animate-pulse">
              {rewardFlash}
            </div>
          )}
        </header>

        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Quests */}
            <div className={`${PANEL} ${RADIUS} p-6`}>
              <h2 className="text-lg font-semibold text-white mb-5">
                Active Quests
              </h2>

              <div className="space-y-4">
                {QUESTS.map(q => {
                  const done = completedQuests.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`p-4 border border-slate-700/60 ${RADIUS}
                        ${done ? "opacity-40" : "hover:border-purple-500/70"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{q.label}</span>
                        <span className="text-xs text-purple-300">
                          +{q.xp} XP
                        </span>
                      </div>

                      {!done && (
                        <button
                          onClick={() => completeQuest(q)}
                          className="mt-2 text-xs text-purple-400 hover:underline"
                        >
                          Complete Quest
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Events */}
            <div className={`${PANEL} ${RADIUS} p-6 xl:col-span-2`}>
              <h2 className="text-lg font-semibold text-white mb-5">
                Events Progress
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {EVENTS.map(event => (
                  <div
                    key={event.id}
                    className={`p-5 border border-slate-700/60 ${RADIUS}`}
                  >
                    <div className="flex justify-between mb-3">
                      <h3 className="font-semibold text-white">
                        {event.name}
                      </h3>
                      <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded">
                        Active
                      </span>
                    </div>

                    <div className="h-2 bg-slate-800 rounded overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${event.progress * 100}%`,
                          background: NEON
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
