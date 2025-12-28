// EventPlannerQuest.jsx - Complete single-file app with dark accessible glassmorphic UI
import React, { useState, useMemo } from 'react';
import { Calendar, Users, MessageSquare, Search, Plus, X, Send, DollarSign, MapPin, Star, Upload, Menu, Home, Settings, Building2, Edit, Paperclip, UserPlus } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showAIOutput, setShowAIOutput] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventForm, setNewEventForm] = useState({ name: '', date: '', type: 'Corporate', location: '', description: '', budget: '', guests: '' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [events, setEvents] = useState([
    { id: 1, name: 'Summer Gala 2025', date: '2025-06-15', budget: 50000, spent: 32000, guests: 250, confirmed: 180, status: 'active', vendors: 8, tasks: 24, completed: 18, type: 'Corporate', location: 'Grand Ballroom' },
    { id: 2, name: 'Thompson Wedding', date: '2025-07-22', budget: 75000, spent: 45000, guests: 180, confirmed: 150, status: 'active', vendors: 12, tasks: 31, completed: 22, type: 'Wedding', location: 'Waterfront' }
  ]);

  const totalXP = events.reduce((sum, e) => sum + (e.completed * 50), 0);
  const totalEvents = events.length;
  const totalCompleted = events.filter(e => e.status === 'active').length;

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setNewEventForm({ name: 'Annual Tech Summit 2025', date: '2025-06-15', type: 'Conference', location: 'Convention Center, Berlin', description: 'Three-day technology conference.', budget: '75000', guests: '500' });
      setShowAIOutput(true);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCreateEvent = () => {
    if (!newEventForm.name || !newEventForm.date) { alert('Please fill in event name and date'); return; }
    const newEvent = { id: Math.max(0, ...events.map(e => e.id)) + 1, name: newEventForm.name, date: newEventForm.date, type: newEventForm.type, location: newEventForm.location || 'TBD', description: newEventForm.description, budget: Number(newEventForm.budget) || 0, spent: 0, guests: Number(newEventForm.guests) || 0, confirmed: 0, status: 'planning', vendors: 0, tasks: 0, completed: 0 };
    setEvents(prev => [...prev, newEvent]);
    setNewEventForm({ name: '', date: '', type: 'Corporate', location: '', description: '', budget: '', guests: '' });
    setShowCreateEvent(false);
    setShowAIOutput(false);
  };

  const QuestCard = ({ title, description, rewardLabel, rewardType = 'xp', progress, total, status, ctaLabel, onAction, children }) => {
    const percent = Math.min(100, Math.round((progress / total) * 100 || 0));
    const isComplete = status === 'complete';
    const rewardClass = rewardType === 'gems' ? 'quest-reward-ruby' : rewardType === 'gold' ? 'quest-reward-gold' : 'quest-reward-pill';
    return (
      <article className={`quest-card ${isComplete ? 'is-claimed' : ''}`}>
        <header className="quest-header">
          <h2 className="quest-title">{title}</h2>
          <span className={rewardClass}>
            <span className="reward-icon">{rewardType === 'gems' ? '♦' : rewardType === 'gold' ? '◎' : '★'}</span>
            <span className="reward-amount">{rewardLabel}</span>
          </span>
        </header>
        <p className="quest-description">{description}</p>
        {!isComplete && progress !== undefined && (
          <div className="quest-progress">
            <div className="quest-progress-track">
              <div className="quest-progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="quest-progress-label">{progress} / {total}</span>
          </div>
        )}
        {children}
        <div className="quest-footer">
          {isComplete ? <span className="quest-status">✓ Completed</span> : <button className="quest-cta" onClick={onAction}>{ctaLabel}</button>}
        </div>
      </article>
    );
  };

  return (
    <>
      <style>{`
        :root {
          --radius-sm: 6px;
          --radius-md: 8px;
          --radius-lg: 10px;
          --radius-xl: 12px;
          --bg-base: #050a15;
          --bg-elevated: #0d1526;
          --bg-glass: rgba(15, 23, 42, 0.25);
          --bg-glass-hover: rgba(15, 23, 42, 0.35);
          --bg-input: rgba(5, 10, 21, 0.6);
          --text-primary: #f1f5f9;
          --text-secondary: #e2e8f0;
          --text-muted: #cbd5e1;
          --text-subtle: #94a3b8;
          --accent-primary: #7dd3fc;
          --accent-hover: #bae6fd;
          --accent-glow: rgba(125, 211, 252, 0.25);
          --border-default: rgba(148, 163, 184, 0.2);
          --border-accent: rgba(125, 211, 252, 0.4);
          --border-focus: rgba(125, 211, 252, 0.8);
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, var(--bg-base) 0%, var(--bg-elevated) 100%); color: var(--text-primary); min-height: 100vh; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .app-shell { display: flex; flex-direction: column; min-height: 100vh; }
        .topbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; background: rgba(13, 21, 38, 0.3); backdrop-filter: blur(8px); border-bottom: 2px solid var(--border-default); }
        .topbar-title { display: flex; align-items: center; gap: 0.75rem; font-size: 1.25rem; font-weight: 700; color: var(--accent-primary); }
        .topbar-logo { font-size: 1.5rem; }
        .icon-button { background: var(--bg-glass); border: 2px solid var(--border-accent); border-radius: var(--radius-md); padding: 0.5rem; cursor: pointer; color: var(--accent-primary); display: flex; flex-direction: column; gap: 4px; transition: all 0.2s ease; }
        .icon-button:hover { background: var(--bg-glass-hover); border-color: var(--accent-hover); }
        .icon-button:focus { outline: 3px solid var(--accent-primary); outline-offset: 2px; }
        .icon-button span { width: 20px; height: 2px; background: currentColor; border-radius: 2px; }
        .avatar-button { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--accent-primary); overflow: hidden; cursor: pointer; background: #1e40af; color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
        .avatar-button:hover { border-color: var(--accent-hover); transform: scale(1.05); }
        .avatar-button:focus { outline: 3px solid var(--accent-primary); outline-offset: 2px; }
        .balances { display: flex; gap: 1rem; padding: 1rem 1.5rem; background: rgba(15, 23, 42, 0.2); border-bottom: 2px solid var(--border-default); overflow-x: auto; }
        .balance-pill { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.75rem 1.25rem; background: var(--bg-glass); border: 2px solid var(--border-accent); border-radius: var(--radius-lg); min-width: 140px; }
        .balance-pill .label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .balance-pill .value { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
        .main-content { flex: 1; padding: 1.5rem; overflow-y: auto; }
        .quest-list { display: flex; flex-direction: column; gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
        .quest-card { background: rgba(15, 23, 42, 0.3); backdrop-filter: blur(6px); border: 2px solid var(--border-accent); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5); transition: all 0.3s ease; }
        .quest-card:hover { background: rgba(15, 23, 42, 0.4); border-color: var(--accent-hover); box-shadow: 0 6px 30px var(--accent-glow); transform: translateY(-2px); }
        .quest-card.is-claimed { opacity: 0.65; border-color: rgba(134, 239, 172, 0.5); }
        .quest-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; }
        .quest-title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
        .quest-reward-pill { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: rgba(125, 211, 252, 0.2); border: 2px solid var(--accent-primary); border-radius: var(--radius-xl); font-size: 0.875rem; font-weight: 700; color: var(--text-primary); }
        .quest-reward-ruby { background: rgba(239, 68, 68, 0.2); border-color: rgba(252, 165, 165, 0.6); color: #fca5a5; }
        .quest-reward-gold { background: rgba(251, 191, 36, 0.2); border-color: rgba(253, 224, 71, 0.6); color: #fde047; }
        .quest-description { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 1.25rem; }
        .quest-progress { margin-bottom: 1rem; }
        .quest-progress-track { width: 100%; height: 8px; background: rgba(5, 10, 21, 0.8); border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 0.5rem; border: 1px solid var(--border-default); }
        .quest-progress-fill { height: 100%; background: linear-gradient(90deg, #7dd3fc 0%, #3b82f6 100%); border-radius: var(--radius-sm); transition: width 0.3s ease; }
        .quest-progress-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; }
        .quest-footer { display: flex; justify-content: space-between; align-items: center; }
        .quest-cta { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #7dd3fc 0%, #3b82f6 100%); border: none; border-radius: var(--radius-md); color: #020617; font-weight: 700; font-size: 0.875rem; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px var(--accent-glow); }
        .quest-cta:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(125, 211, 252, 0.4); background: linear-gradient(135deg, #bae6fd 0%, #60a5fa 100%); }
        .quest-cta:focus { outline: 3px solid var(--accent-primary); outline-offset: 2px; }
        .quest-cta:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .quest-status { color: #86efac; font-weight: 700; font-size: 0.875rem; }
        .quest-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .inline-form { background: rgba(15, 23, 42, 0.25); border: 2px solid var(--border-default); border-radius: var(--radius-lg); padding: 1.5rem; margin-top: 1rem; }
        .inline-form-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; }
        .field { margin-bottom: 1rem; }
        .field-label { display: block; font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 600; }
        .field-input, select { width: 100%; padding: 0.75rem; background: var(--bg-input); border: 2px solid var(--border-default); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.95rem; transition: all 0.2s ease; }
        .field-input:focus, select:focus { outline: none; border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-glow); background: rgba(5, 10, 21, 0.8); }
        .field-input::placeholder { color: var(--text-subtle); }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .bottom-nav { display: flex; justify-content: space-around; align-items: center; padding: 1rem; background: rgba(13, 21, 38, 0.4); backdrop-filter: blur(8px); border-top: 2px solid var(--border-default); }
        .nav-item { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 0.5rem 1rem; background: transparent; border: none; color: var(--text-subtle); cursor: pointer; transition: all 0.2s ease; border-radius: var(--radius-md); }
        .nav-item:hover { color: var(--text-secondary); background: rgba(125, 211, 252, 0.1); }
        .nav-item:focus { outline: 3px solid var(--accent-primary); outline-offset: 2px; }
        .nav-item.active { color: var(--accent-primary); background: rgba(125, 211, 252, 0.15); font-weight: 700; }
        .nav-label { font-size: 0.75rem; font-weight: 600; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal-content { background: rgba(13, 21, 38, 0.95); backdrop-filter: blur(8px); border: 2px solid var(--border-accent); border-radius: var(--radius-xl); padding: 2rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .modal-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .close-button { background: var(--bg-glass); border: 2px solid var(--border-accent); border-radius: var(--radius-md); padding: 0.5rem; cursor: pointer; color: var(--accent-primary); transition: all 0.2s ease; }
        .close-button:hover { background: var(--bg-glass-hover); border-color: var(--accent-hover); }
        .close-button:focus { outline: 3px solid var(--accent-primary); outline-offset: 2px; }
        .ai-prompt-section { background: linear-gradient(135deg, rgba(160, 32, 240, 0.15) 0%, rgba(139, 0, 255, 0.15) 100%); border: 2px solid rgba(160, 32, 240, 0.5); border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1.5rem; }
        .ai-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #A020F0 0%, #8B00FF 100%); color: white; border-radius: var(--radius-xl); font-size: 0.75rem; font-weight: 700; margin-bottom: 1rem; }
        textarea { width: 100%; padding: 0.75rem; background: var(--bg-input); border: 2px solid var(--border-default); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.95rem; resize: vertical; font-family: inherit; line-height: 1.6; transition: all 0.2s ease; }
        textarea:focus { outline: none; border-color: var(--border-focus); box-shadow: 0 0 0 3px var(--accent-glow); background: rgba(5, 10, 21, 0.8); }
        textarea::placeholder { color: var(--text-subtle); }
        .button-primary { padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #7dd3fc 0%, #3b82f6 100%); border: none; border-radius: var(--radius-md); color: #020617; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px var(--accent-glow); }
        .button-primary:hover { background: linear-gradient(135deg, #bae6fd 0%, #60a5fa 100%); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(125, 211, 252, 0.4); }
        .button-primary:focus { outline: 3px solid var(--accent-primary); outline-offset: 2px; }
        .button-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .button-secondary { padding: 0.75rem 1.5rem; background: var(--bg-glass); border: 2px solid var(--border-accent); border-radius: var(--radius-md); color: var(--accent-primary); font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .button-secondary:hover { background: var(--bg-glass-hover); border-color: var(--accent-hover); }
        .button-secondary:focus { outline: 3px solid var(--accent-primary); outline-offset: 2px; }
        @media (max-width: 768px) { .quest-grid { grid-template-columns: 1fr; } .field-row { grid-template-columns: 1fr; } .topbar { padding: 0.75rem 1rem; } .modal-content { padding: 1.5rem; } }
        ::-webkit-scrollbar { width: 12px; height: 12px; }
        ::-webkit-scrollbar-track { background: var(--bg-base); }
        ::-webkit-scrollbar-thumb { background: var(--border-accent); border-radius: var(--radius-sm); }
        ::-webkit-scrollbar-thumb:hover { background: var(--accent-primary); }
      `}</style>
      
      <div className="app-shell">
        <header className="topbar">
          <button className="icon-button" aria-label="Menu"><span /><span /><span /></button>
          <div className="topbar-title"><span className="topbar-logo">🎯</span><span>EventQuest</span></div>
          <div className="avatar-button">SM</div>
        </header>
        <section className="balances">
          <div className="balance-pill"><span className="label">Event XP</span><span className="value">{totalXP}</span></div>
          <div className="balance-pill"><span className="label">Active Events</span><span className="value">{totalCompleted}</span></div>
          <div className="balance-pill"><span className="label">Rank</span><span className="value">Planner</span></div>
        </section>
        <main className="main-content">
          <div className="quest-list">
            {activeTab === 'dashboard' && (<><QuestCard title="Create Your Next Event" description="Start a new event to unlock vendor quests, budget tracking, and team coordination rewards." rewardLabel="+100 XP" rewardType="xp" progress={events.length} total={events.length + 1} status="active" ctaLabel="Launch Event Creator" onAction={() => setShowCreateEvent(true)} /><div className="quest-grid">{events.map(event => (<QuestCard key={event.id} title={event.name} description={`${event.guests} guests • ${event.location} • ${new Date(event.date).toLocaleDateString()}`} rewardLabel={`${event.completed}/${event.tasks} tasks`} rewardType="gold" progress={event.completed} total={event.tasks} status={event.completed === event.tasks ? 'complete' : 'active'} ctaLabel="Manage Event" onAction={() => { setSelectedEvent(event); setActiveTab('event-detail'); }} />))}</div></>)}
            {activeTab === 'events' && (<><QuestCard title="Your Event Portfolio" description={`Managing ${events.length} events with ${totalXP} total XP earned.`} rewardLabel="View All" rewardType="xp" progress={totalCompleted} total={events.length} status="active" ctaLabel="Create New Event" onAction={() => setShowCreateEvent(true)} /><div className="quest-grid">{events.map(event => (<QuestCard key={event.id} title={event.name} description={`Budget: $${event.spent.toLocaleString()} / $${event.budget.toLocaleString()}`} rewardLabel={`${Math.round((event.spent/event.budget)*100)}%`} rewardType="gold" progress={event.spent} total={event.budget} status="active" ctaLabel="View Details" onAction={() => { setSelectedEvent(event); setActiveTab('event-detail'); }} />))}</div></>)}
          </div>
        </main>
        <nav className="bottom-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><Home size={20} /><span className="nav-label">Dashboard</span></button>
          <button className={`nav-item ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}><Calendar size={20} /><span className="nav-label">Events</span></button>
          <button className={`nav-item ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}><Building2 size={20} /><span className="nav-label">Vendors</span></button>
          <button className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}><MessageSquare size={20} /><span className="nav-label">Messages</span></button>
        </nav>
      </div>
      {showCreateEvent && (<div className="modal-overlay"><div className="modal-content"><div className="modal-header"><h3 className="modal-title">Create New Event</h3><button className="close-button" onClick={() => setShowCreateEvent(false)}><X size={20} /></button></div><div className="ai-prompt-section"><span className="ai-badge"><span>✨</span><span>AI Assistant</span></span><div className="field"><label className="field-label">Describe your event in natural language</label><textarea rows="3" placeholder="Example: Corporate tech conference for 500 attendees on June 15th at the Convention Center. Budget around €75,000." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} /></div><button className="button-primary" onClick={handleAIGenerate} disabled={!aiPrompt.trim() || isGenerating} style={{ marginTop: '1rem' }}>{isGenerating ? 'Generating...' : 'Generate Event Plan'}</button></div>{showAIOutput && (<div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(125, 211, 252, 0.15)', borderRadius: 'var(--radius-lg)', border: '2px solid rgba(125, 211, 252, 0.4)' }}><p style={{ color: '#86efac', fontWeight: 700, marginBottom: '0.5rem' }}>✓ AI Analysis Complete</p><p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Event details populated below. Review and adjust as needed.</p></div>)}<div className="inline-form"><h3 className="inline-form-title">Event Details</h3><div className="field"><label className="field-label">Event Name *</label><input className="field-input" value={newEventForm.name} onChange={e => setNewEventForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Summer Gala 2025" /></div><div className="field-row"><div className="field"><label className="field-label">Date *</label><input type="date" className="field-input" value={newEventForm.date} onChange={e => setNewEventForm(prev => ({ ...prev, date: e.target.value }))} /></div><div className="field"><label className="field-label">Type</label><select className="field-input" value={newEventForm.type} onChange={e => setNewEventForm(prev => ({ ...prev, type: e.target.value }))}><option>Corporate</option><option>Wedding</option><option>Conference</option><option>Birthday</option></select></div></div><div className="field"><label className="field-label">Location</label><input className="field-input" value={newEventForm.location} onChange={e => setNewEventForm(prev => ({ ...prev, location: e.target.value }))} placeholder="Grand Ballroom, Downtown" /></div><div className="field-row"><div className="field"><label className="field-label">Budget</label><input type="number" className="field-input" value={newEventForm.budget} onChange={e => setNewEventForm(prev => ({ ...prev, budget: e.target.value }))} placeholder="50000" /></div><div className="field"><label className="field-label">Expected Guests</label><input type="number" className="field-input" value={newEventForm.guests} onChange={e => setNewEventForm(prev => ({ ...prev, guests: e.target.value }))} placeholder="250" /></div></div><div className="field"><label className="field-label">Description</label><textarea rows={4} className="field-input" value={newEventForm.description} onChange={e => setNewEventForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the event..." /></div><div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}><button className="button-secondary" onClick={() => setShowCreateEvent(false)}>Cancel</button><button className="button-primary" onClick={handleCreateEvent}><Plus size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Create Event</button></div></div></div></div>)}
    </>
  );
}
