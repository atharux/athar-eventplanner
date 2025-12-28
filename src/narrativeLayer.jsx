const RANKS = [
  {
    id: "rookie",
    label: "Rookie Host",
    description: "You are prototyping your hosting style.",
    minXP: 0,
    live: true
  },
  {
    id: "seasoned",
    label: "Seasoned Strategist",
    description: "You design repeatable systems, not one-offs.",
    minXP: 200,
    live: false
  },
  {
    id: "legendary",
    label: "Legendary Producer",
    description: "You orchestrate experiences at scale.",
    minXP: 600,
    live: false
  }
];

export default function NarrativeLayer({ demoMode }) {
  const xp = 140; // simulated Phase-1 value
  const currentRank = RANKS[0];

  return (
    <div className="border-b border-slate-800 bg-[#070b14]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <div className="text-xs text-slate-400">
            Phase 1 — Progress Infrastructure
          </div>
          <div className="text-sm text-white font-semibold">
            {currentRank.label}
          </div>
          <div className="text-xs text-slate-400">
            {currentRank.description}
          </div>
        </div>

        <div className="flex gap-3">
          {RANKS.map(rank => (
            <div
              key={rank.id}
              className={`px-3 py-1 text-xs rounded border
                ${rank.live
                  ? "border-purple-500 text-purple-300"
                  : "border-slate-700 text-slate-500"}`}
            >
              {rank.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
