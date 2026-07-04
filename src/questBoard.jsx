import React, { useEffect, useRef, useState } from 'react';

/* Quest definitions — completion is derived from real workspace data,
   so progress survives reloads without separate quest state. */
const QUEST_DEFS = [
  { id: 'first-event',    label: 'Create your first event',  xp: 50, done: (s) => s.events.length >= 1 },
  { id: 'five-tasks',     label: 'Add 5 tasks to an event',  xp: 75, done: (s) => s.tasks.length >= 5 },
  { id: 'complete-three', label: 'Complete 3 tasks',         xp: 60, done: (s) => s.tasks.filter(t => t.status === 'completed').length >= 3 },
  { id: 'message-vendor', label: 'Message a vendor',         xp: 40, done: (s) => s.conversations.some(c => (c.messages || []).some(m => m.sender === 'me')) },
  { id: 'book-vendor',    label: 'Book a vendor',            xp: 50, done: (s) => s.vendors.some(v => v.booked) },
  { id: 'ten-confirmed',  label: 'Confirm 10 guest RSVPs',   xp: 75, done: (s) => s.guests.filter(g => g.rsvp === 'confirmed').length >= 10 },
];

export function computeQuests(state) {
  return QUEST_DEFS.map(q => ({ ...q, completed: q.done(state) }));
}

export default function QuestBoard({ quests }) {
  const [rewardFlash, setRewardFlash] = useState(null);
  const prevCompleted = useRef(null);
  const completedIds = quests.filter(q => q.completed).map(q => q.id);
  const completedKey = completedIds.join(',');

  useEffect(() => {
    if (prevCompleted.current !== null) {
      const newlyDone = quests.filter(q => q.completed && !prevCompleted.current.includes(q.id));
      if (newlyDone.length > 0) {
        setRewardFlash(`+${newlyDone.reduce((s, q) => s + q.xp, 0)} XP`);
        prevCompleted.current = completedIds;
        const t = setTimeout(() => setRewardFlash(null), 1600);
        return () => clearTimeout(t);
      }
    }
    prevCompleted.current = completedIds;
  }, [completedKey]);

  return (
    <div className="panel-glass glass-border p-6 rounded-md relative" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-white">Active Quests</h2>
        <span className="text-xs text-slate-400">{completedIds.length}/{quests.length} completed</span>
      </div>

      {rewardFlash && (
        <div className="absolute top-4 right-6 text-sm font-semibold text-purple-300 animate-pulse">
          {rewardFlash}
        </div>
      )}

      <div className="space-y-3">
        {quests.map(q => (
          <div
            key={q.id}
            className={`p-4 border border-slate-700/60 rounded-md transition-all
              ${q.completed ? 'opacity-40' : 'hover:border-purple-500/70'}`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-200">
                {q.completed && <span className="text-emerald-400 mr-2">✓</span>}
                {q.label}
              </span>
              <span className="text-xs text-purple-300">+{q.xp} XP</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
