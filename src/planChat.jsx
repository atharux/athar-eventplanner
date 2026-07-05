import React, { useEffect, useRef, useState } from 'react';

/* RT Network concierge chat — natural-language planning that fills the same
   state as the classic stepper. LLM (via /api/assist) translates language to
   slots; ALL pricing stays deterministic in the parent. When no model is
   reachable, a deterministic scripted flow asks the same questions. */

const OPENERS = {
  llm: "Hi! I'm the RT Network concierge. Tell me about your event — what are you celebrating, roughly how many guests, and when?",
  scripted: "Hi! I'll walk you through planning your event with a few quick questions.",
};

const SCRIPT = [
  { key: 'event_type', q: 'What kind of event is it?', chips: [['Wedding', 'wedding'], ['Corporate', 'corporate'], ['Party', 'party']] },
  { key: 'guests', q: 'Roughly how many guests?', input: 'number', placeholder: 'e.g. 120' },
  { key: 'event_date', q: 'Do you have a date? (skip if not)', input: 'date', skippable: true },
  { key: 'budget', q: 'A rough total budget in € helps me flag overruns — optional.', input: 'number', placeholder: 'e.g. 8000', skippable: true },
];

export default function PlanChat({ slots, applySlots, onComplete, onSwitchToSteps }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: OPENERS.llm }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState('llm');        // llm | scripted
  const [scriptIdx, setScriptIdx] = useState(0);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);

  function say(content) {
    setMessages(m => [...m, { role: 'assistant', content }]);
  }

  function enterScripted() {
    setMode('scripted');
    setScriptIdx(0);
    say(`${OPENERS.scripted} ${SCRIPT[0].q}`);
  }

  async function sendLLM(text, history) {
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...history, { role: 'user', content: text }].slice(-12), slots }),
    });
    if (!res.ok) throw new Error(`assist ${res.status}`);
    return res.json();
  }

  function handleScripted(text, chipValue) {
    const stepDef = SCRIPT[scriptIdx];
    if (!stepDef) return;
    const value = chipValue ?? text.trim();
    if (value && value !== 'skip') {
      const parsed = stepDef.input === 'number' ? (parseInt(value, 10) || null) : value;
      if (parsed != null) applySlots({ [stepDef.key]: parsed });
    }
    const next = scriptIdx + 1;
    setScriptIdx(next);
    if (next < SCRIPT.length) {
      say(SCRIPT[next].q);
    } else {
      say("Great — that's the essentials. Now pick your venue and services; I've pre-filled everything you told me. Prices update live as you choose.");
      setTimeout(onComplete, 1200);
    }
  }

  async function send(text, chipValue) {
    const shown = chipValue ? text : text.trim();
    if (!shown || busy) return;
    setMessages(m => [...m, { role: 'user', content: shown }]);
    setInput('');

    if (mode === 'scripted') {
      handleScripted(shown, chipValue);
      return;
    }

    setBusy(true);
    try {
      const history = messages.filter(m => m.role === 'user' || m.role === 'assistant');
      const data = await sendLLM(chipValue ?? shown, history);
      if (data.slots && Object.keys(data.slots).length) applySlots(data.slots);
      say(data.reply);
      if (data.done) setTimeout(onComplete, 1200);
    } catch {
      say("I couldn't reach the assistant just now — switching to quick questions instead.");
      enterScripted();
    } finally {
      setBusy(false);
    }
  }

  const scriptStep = mode === 'scripted' ? SCRIPT[scriptIdx] : null;

  return (
    <div>
      <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'assistant' ? 'rt-card' : ''}
            style={m.role === 'user'
              ? { justifySelf: 'end', background: 'var(--rt-ink)', color: '#fff', borderRadius: 8, padding: '10px 14px', maxWidth: '85%', fontSize: 14 }
              : { maxWidth: '92%', fontSize: 14 }}>
            {m.content}
          </div>
        ))}
        {busy && <div className="rt-note">thinking…</div>}
        <div ref={endRef} />
      </div>

      {/* Quick chips — LLM opener or scripted step */}
      {!busy && mode === 'llm' && messages.length === 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {[['A wedding 💍', "We're planning a wedding"], ['Company event 🏢', 'A corporate event for my company'], ['A party 🎉', "We're throwing a party"]].map(([label, text]) => (
            <button key={label} className="rt-btn out" style={{ padding: '9px 14px', fontSize: 11 }} onClick={() => send(text)}>{label}</button>
          ))}
        </div>
      )}
      {!busy && scriptStep?.chips && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {scriptStep.chips.map(([label, value]) => (
            <button key={value} className="rt-btn out" style={{ padding: '9px 14px', fontSize: 11 }} onClick={() => send(label, value)}>{label}</button>
          ))}
        </div>
      )}
      {!busy && scriptStep?.skippable && (
        <button className="rt-note" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginBottom: 10 }}
          onClick={() => send('skip', 'skip')}>skip this</button>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type={scriptStep?.input === 'number' ? 'number' : scriptStep?.input === 'date' ? 'date' : 'text'}
          value={input}
          placeholder={scriptStep?.placeholder || 'Type your answer…'}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send(input); }}
          style={{ flex: 1 }}
        />
        <button className="rt-btn teal" disabled={busy || !input.trim()} onClick={() => send(input)}>Send</button>
      </div>

      <button className="rt-note" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: 14 }}
        onClick={onSwitchToSteps}>
        Prefer the classic step-by-step form? Switch anytime — your answers carry over.
      </button>
    </div>
  );
}
