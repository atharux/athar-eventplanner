import React, { useState } from 'react';
import DemoModeToggle from './demoModeToggle';
import DEVnewSurgical from './DEVnewSurgical';
import NewGamifiedPath from './newGamifiedPath';
import NarrativeLayer from "./narrativeLayer";


export default function DemoApp() {
  const [demoMode, setDemoMode] = useState("classic"); 
  // "classic" | "gamified"

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200">
      {/* Narrative Layer is ALWAYS ON */}
      <NarrativeLayer demoMode={demoMode} />

      {/* Safe demo switch */}
      <DemoModeToggle
        mode={demoMode}
        onChange={setDemoMode}
      />

      {/* Render target */}
      {demoMode === "classic" ? (
        <APPDEVnewSurgical />
      ) : (
        <NewGamifiedPath />
      )}
    </div>
  );
}
