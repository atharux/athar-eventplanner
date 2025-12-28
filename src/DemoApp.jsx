import React, { useState } from 'react';
import DemoModeToggle from './demoModeToggle';
import DEVnewSurgical from './DEVnewSurgical';
import NewGamifiedPath from './newGamifiedPath';
import NarrativeLayer from "./narrativeLayer";

export default function DemoApp() {
  const [mode, setMode] = useState('classic');

  return (
    <div data-demo-mode={mode}>
      <DemoModeToggle mode={mode} setMode={setMode} />

      {mode === 'classic' && <DEVnewSurgical />}
      {mode === 'gamified' && <NewGamifiedPath />}
    </div>
  );
}
