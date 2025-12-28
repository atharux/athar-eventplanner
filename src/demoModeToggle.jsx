export default function DemoModeToggle({ mode, onChange }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-[rgba(18,22,34,0.85)] border border-slate-700 rounded-lg p-3 backdrop-blur">
      <div className="text-xs text-slate-400 mb-2">
        Demo Mode
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onChange("classic")}
          className={`px-3 py-1 text-xs rounded
            ${mode === "classic"
              ? "bg-slate-700 text-white"
              : "hover:bg-slate-800 text-slate-300"}`}
        >
          Classic
        </button>

        <button
          onClick={() => onChange("gamified")}
          className={`px-3 py-1 text-xs rounded
            ${mode === "gamified"
              ? "bg-purple-700 text-white"
              : "hover:bg-slate-800 text-slate-300"}`}
        >
          Gamified
        </button>
      </div>
    </div>
  );
}
