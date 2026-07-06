import React, { useState, useMemo } from 'react';
import {
  Calendar, Users, MessageSquare, Search, Plus, X, Send, Euro, MapPin, Star,
  Upload, Menu, Home, Settings, Building2, Edit, Paperclip, UserPlus, Zap, ShieldCheck, Inbox, Store
} from 'lucide-react';
import { useLocalStorage, checkLimit } from './useStorage';
import { ProGate } from './ProGate';
import { PricingModal } from './PricingModal';
import QuestBoard, { computeQuests } from './questBoard';
import PreflightPanel from './preflightPanel';
import QuotesPanel, { buildTasksForQuote, buildScheduleForQuote, buildBudgetItemsForQuote } from './quotesPanel';
import ProvidersPanel from './providersPanel';
import { TEAM } from './data/team';
import './theme.css';

const NEON_COLOR = 'var(--ef-brand)';
const NEON = 'linear-gradient(90deg, var(--ef-brand-deep), var(--ef-brand))';
const neonBoxShadow = 'var(--glow-md)';

// One-time data migration: clear stale seed data so new defaults load.
// Runs once at module load, not inside render.
if (typeof window !== 'undefined' && localStorage.getItem('ef_data_v') !== '3') {
  ['ef_events','ef_vendors','ef_venues','ef_convos','ef_tasks','ef_budget','ef_guests','ef_clients'].forEach(k => localStorage.removeItem(k));
  localStorage.setItem('ef_data_v', '3');
}

function useThemeClasses(theme) {
  const isDark = theme !== 'light';
  return {
    appBg:      'app-bg',
    panelBg:    'panel-glass',
    subtleBg:   isDark ? 'bg-slate-900' : 'ef-surface2',
    border:     'glass-border',
    mutedText:  isDark ? 'text-slate-400' : 'text-gray-500',
    strongText: isDark ? 'text-slate-100' : 'text-gray-900',
  };
}

/* ScheduleTab — extracted as proper component to satisfy Rules of Hooks */
function ScheduleTab({ event, setEvents, onAddSchedule }) {
  const [localSchedule, setLocalSchedule] = React.useState(event?.schedule || []);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);

  React.useEffect(() => {
    setLocalSchedule(event?.schedule || []);
  }, [event]);

  const data = localSchedule.length ? localSchedule : [
    { time: '09:00 AM', title: 'Venue Setup', duration: '2 hours', assigned: 'Setup Crew', category: 'Setup' },
    { time: '05:00 PM', title: 'Guest Arrival', duration: '1 hour', assigned: 'Reception Team', category: 'Reception' },
    { time: '06:00 PM', title: 'Cocktail Hour', duration: '1 hour', assigned: 'Catering Staff', category: 'Catering' },
    { time: '07:00 PM', title: 'Dinner Service', duration: '2 hours', assigned: 'Elegant Catering', category: 'Catering' },
    { time: '09:00 PM', title: 'Entertainment Begins', duration: '3 hours', assigned: 'Harmony DJ', category: 'Entertainment' },
    { time: '12:00 AM', title: 'Event Wrap-up', duration: '1 hour', assigned: 'Full Team', category: 'Wrap-up' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Run Sheet / Schedule</h2>
        <button onClick={onAddSchedule} className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm">
          <Plus size={14} /> Add Item
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 space-y-2">
          {data.map((it, idx) => (
            <div key={idx} className="panel-glass glass-border p-3 rounded-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-purple-300 font-bold text-sm">{it.time}</div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{it.title}</div>
                  <div className="text-xs" style={{ color: 'var(--text-2)' }}>{it.duration} · {it.assigned}</div>
                </div>
                <button onClick={() => { setEditingItem({ ...it, _orig: it.title }); setShowEditModal(true); }} className="p-1 hover:bg-white/5 rounded">
                  <Edit size={14} style={{ color: 'var(--text-2)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto relative h-64 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="absolute top-0 left-0 w-full flex justify-between text-xs p-2" style={{ color: 'var(--text-2)' }}>
            {['09 AM', '12 PM', '03 PM', '06 PM', '09 PM', '12 AM'].map(t => <span key={t}>{t}</span>)}
          </div>
          <div className="absolute inset-0 mt-6 space-y-3 p-4">
            {data.map((it, idx) => (
              <div key={idx} className="relative group" title={`${it.title} — ${it.duration}`}>
                <div className="h-6 rounded-md cursor-pointer" style={{ width: `${Math.min((parseInt(it.duration) || 1) * 20, 95)}%`, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }} />
                <div className="absolute hidden group-hover:flex top-7 left-0 text-xs px-2 py-1 rounded z-10 whitespace-nowrap" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
                  <span className="font-semibold mr-2">{it.title}</span><span style={{ color: 'var(--text-2)' }}>{it.time} · {it.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--overlay)', backdropFilter: 'blur(8px)' }}>
          <div className="panel-glass glass-border rounded-xl p-6 w-full max-w-md" style={{ boxShadow: 'var(--glow-md)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Edit Schedule Item</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const { _orig, ...edited } = editingItem;
              const updated = localSchedule.map(s => s.title === _orig ? edited : s);
              setLocalSchedule(updated);
              if (event) setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, schedule: updated } : ev));
              setShowEditModal(false);
            }} className="space-y-3">
              {[['Title','title'],['Assigned To','assigned'],['Start Time','time'],['Duration','duration']].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-sm mb-1" style={{ color: 'var(--text-2)' }}>{label}</label>
                  <input type="text" value={editingItem[key] || ''} onChange={e => setEditingItem(p => ({ ...p, [key]: e.target.value }))} className="w-full dark-input rounded px-3 py-2" />
                </div>
              ))}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded text-sm" style={{ background: 'var(--surface-3)', color: 'var(--text-1)' }}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-purple-700 text-white text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function EditEventInline({ event, onSave, onClose }) {
  const [form, setForm] = React.useState({
    name: event.name || '',
    date: event.date || '',
    type: event.type || 'Corporate',
    location: event.location || '',
    description: event.description || '',
    budget: event.budget || '',
    guests: event.guests || '',
  });
  const handle = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const EVENT_TYPES = ['Corporate', 'Wedding', 'Conference', 'Birthday', 'Fundraiser', 'Other'];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: 'var(--overlay)', backdropFilter: 'blur(8px)' }}>
      <div className="panel-glass glass-border rounded-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" style={{ boxShadow: 'var(--glow-md)' }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-1)' }}>Edit Event</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)' }}><X size={18} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ id: event.id, ...form, budget: form.budget === '' ? event.budget : Number(form.budget), guests: form.guests === '' ? event.guests : Number(form.guests) }); }} className="space-y-3">
          {[['Event Name', 'name', 'text'], ['Location', 'location', 'text'], ['Description', 'description', 'text']].map(([label, key, type]) => (
            <div key={key}>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => handle(key, e.target.value)} className="w-full dark-input rounded px-3 py-2 text-sm" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>Date</label>
              <input type="date" value={form.date} onChange={e => handle('date', e.target.value)} className="w-full dark-input rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>Type</label>
              <select value={form.type} onChange={e => handle('type', e.target.value)} className="w-full dark-input rounded px-3 py-2 text-sm">
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>Budget (€)</label>
              <input type="number" value={form.budget} onChange={e => handle('budget', e.target.value)} className="w-full dark-input rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>Guest Count</label>
              <input type="number" value={form.guests} onChange={e => handle('guests', e.target.value)} className="w-full dark-input rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 py-2 rounded text-sm font-semibold bg-purple-700 text-white hover:bg-purple-600">Save Changes</button>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm" style={{ background: 'var(--surface-3)', color: 'var(--text-1)' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMemberInline({ onAdd, onClose }) {
  const [form, setForm] = React.useState({ name: '', role: '', email: '' });
  const handle = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.role) return;
    onAdd({ ...form, avatar: form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) });
  };
  return (
    <form onSubmit={submit} className="panel-glass glass-border rounded-lg p-4 space-y-3">
      <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>New team member</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[['Name', 'name', 'text'], ['Role', 'role', 'text'], ['Email', 'email', 'email']].map(([label, key, type]) => (
          <div key={key}>
            <label className="block text-xs mb-1" style={{ color: 'var(--text-3)' }}>{label}</label>
            <input type={type} value={form[key]} onChange={e => handle(key, e.target.value)}
              className="w-full dark-input rounded px-3 py-2 text-sm" placeholder={label} />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-1.5 rounded text-xs font-semibold bg-purple-700 text-white hover:bg-purple-600">Add</button>
        <button type="button" onClick={onClose} className="px-4 py-1.5 rounded text-xs" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>Cancel</button>
      </div>
    </form>
  );
}

/* -------------------- Enhanced Create Event Modal with AI Prompt -------------------- */

const CreateEventModal = ({ onClose, events, setEvents, plan, classes }) => {
  // Add AI-related state
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIOutput, setShowAIOutput] = useState(false);
  const [newEventForm, setNewEventForm] = useState({
    name: '', date: '', type: 'Corporate', location: '', description: '', budget: '', guests: ''
  });

  const handleCreate = () => {
    if (!newEventForm.name || !newEventForm.date) {
      alert('Please fill in event name and date');
      return;
    }
    const limit = checkLimit(plan, 'events', events.length);
    if (!limit.allowed) {
      alert(limit.reason);
      return;
    }

    const newEvent = {
      id: Math.max(0, ...events.map(e => e.id)) + 1,
      name: newEventForm.name,
      date: newEventForm.date,
      type: newEventForm.type,
      location: newEventForm.location || 'TBD',
      description: newEventForm.description || 'Event description to be added',
      budget: Number(newEventForm.budget) || 0,
      spent: 0,
      guests: Number(newEventForm.guests) || 0,
      confirmed: 0,
      status: 'planning',
      vendors: 0,
      tasks: 0,
      completed: 0,
      team: [
        { id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' }
      ],
      schedule: []
    };

    setEvents(prev => [...prev, newEvent]);
    
    // Reset form
    setNewEventForm({
      name: '',
      date: '',
      type: 'Corporate',
      location: '',
      description: '',
      budget: '',
      guests: ''
    });
    
    onClose();
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    const groqKey = localStorage.getItem('groq_api_key');
    const orKey   = localStorage.getItem('openrouter_api_key');
    if (!groqKey && !orKey) {
      alert('Add a Groq or OpenRouter API key in Settings to use AI generation. Groq is free at console.groq.com');
      return;
    }
    setIsGenerating(true);
    try {
      const useGroq = !!groqKey;
      const endpoint = useGroq
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://openrouter.ai/api/v1/chat/completions';
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${useGroq ? groqKey : orKey}`,
      };
      const body = {
        model: useGroq ? 'llama-3.3-70b-versatile' : 'meta-llama/llama-3.3-70b-instruct:free',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are an event planning assistant. Extract event details from the user description and return ONLY valid JSON with keys: name (string), date (YYYY-MM-DD, use next suitable future date if vague), type (one of: Corporate|Wedding|Conference|Birthday|Fundraiser|Other), location (string), description (string, 1-2 sentences), budget (number as string), guests (number as string). Return ONLY the JSON object, no markdown.',
          },
          { role: 'user', content: aiPrompt },
        ],
      };
      const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) });
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
      setNewEventForm(prev => ({
        ...prev,
        name: parsed.name || prev.name,
        date: parsed.date || prev.date,
        type: parsed.type || prev.type,
        location: parsed.location || prev.location,
        description: parsed.description || prev.description,
        budget: parsed.budget || prev.budget,
        guests: parsed.guests || prev.guests,
      }));
      setShowAIOutput(true);
    } catch (err) {
      alert('AI generation failed: ' + (err.message || 'unknown error'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className={`${classes.panelBg} ${classes.border} rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto`} style={{ boxShadow: neonBoxShadow, borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Create New Event</h3>
            <p className="text-sm text-slate-400 mt-1">Use AI or fill in the details manually</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-slate-300 hover:text-white" /></button>
        </div>

        <div className="space-y-4">
          {/* AI PROMPT SECTION - SURGICAL ADDITION */}
          <div className="p-5 rounded-xl mb-6" style={{ 
            background: 'linear-gradient(135deg, rgba(var(--ef-bright-rgb), 0.1) 0%, rgba(var(--ef-bright-rgb), 0.2) 100%)',
            border: '2px solid rgba(var(--ef-bright-rgb), 0.5)'
          }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{
              background: 'var(--ef-grad-discover)',
              color: 'white'
            }}>
              <span>✨</span>
              <span>AI Assistant</span>
            </div>
            
            <label className="block mb-2">
              <span className="text-sm font-semibold text-slate-300">
                Describe your event in natural language
              </span>
              <textarea
                className="dark-input w-full rounded-lg px-3 py-2.5 mt-2 transition-all resize-none"
                rows="3"
                placeholder="Example: Corporate tech conference for 500 attendees on June 15th at the Convention Center. Budget around €75,000 for venue, catering, speakers, and AV equipment."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = 'var(--ef-brand)'}
                onBlur={(e) => e.target.style.borderColor = '#2b2b2b'}
              />
            </label>
            
            <p className="text-xs text-slate-400 italic mb-3">
              The AI will analyze your description and populate the event details below.
            </p>
            
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={!aiPrompt.trim() || isGenerating}
              className="px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isGenerating ? '#6B7280' : 'var(--ef-grad-discover)',
                boxShadow: !isGenerating ? '0 4px 12px rgba(var(--ef-bright-rgb), 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isGenerating && aiPrompt.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(var(--ef-bright-rgb), 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(var(--ef-bright-rgb), 0.4)';
              }}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Event Plan"
              )}
    </button>
          </div>

          {/* AI OUTPUT PANEL */}
          {showAIOutput && (
            <div className="p-6 rounded-xl mb-6" style={{
              background: 'linear-gradient(180deg, rgba(40, 45, 75, 0.85), rgba(20, 25, 45, 0.9))',
              boxShadow: '0 0 0 1px rgba(150, 100, 255, 0.35), 0 0 40px rgba(150, 100, 255, 0.25)'
            }}>
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2" style={{
                  background: 'rgba(150, 100, 255, 0.25)',
                  color: '#cdbbff'
                }}>
                  <span>✨</span>
                  <span>AI Assistant</span>
                </div>
                <h3 className="text-lg font-semibold text-white mt-2">Event Plan Generated</h3>
                <p className="text-sm text-slate-300 mt-1">Operational summary based on your event description</p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl" style={{ background: 'rgba(10, 15, 30, 0.6)' }}>
                  <div className="text-xs text-slate-400 mb-2">Event Name</div>
                  <div className="text-lg font-semibold text-white">{newEventForm.name || '—'}</div>
                  <div className="text-xs text-slate-400 mt-1">{newEventForm.type} · {newEventForm.date || 'date TBD'}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(10, 15, 30, 0.6)' }}>
                  <div className="text-xs text-slate-400 mb-2">Budget / Guests</div>
                  <div className="text-lg font-semibold text-white">€{newEventForm.budget || '0'}</div>
                  <div className="text-xs text-slate-400 mt-1">{newEventForm.guests || '0'} expected guests</div>
                </div>
              </div>

              {/* Location & description */}
              {(newEventForm.location || newEventForm.description) && (
                <div className="mb-6 p-4 rounded-xl text-sm" style={{ background: 'rgba(10, 15, 30, 0.6)' }}>
                  {newEventForm.location && <div className="text-slate-300 mb-1"><span className="text-slate-400">Location: </span>{newEventForm.location}</div>}
                  {newEventForm.description && <div className="text-slate-300"><span className="text-slate-400">Description: </span>{newEventForm.description}</div>}
                </div>
              )}

              {/* Next Actions */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Next Actions</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Review the pre-filled fields below and adjust as needed</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Click Create Event to save and start planning</li>
                </ul>
              </div>
            </div>
          )}

          {/* DIVIDER */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: '#2b2b2b' }}></div>
            <span className="text-sm font-semibold text-slate-400">OR ENTER MANUALLY</span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#2b2b2b' }}></div>
          </div>

          {/* EXISTING FORM FIELDS - Keep all your original fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Event Name *</label>
              <input
                value={newEventForm.name}
                onChange={e => setNewEventForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Summer Gala 2025"
                className="w-full p-3 rounded-md border-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Date *</label>
              <input
                type="date"
                value={newEventForm.date}
                onChange={e => setNewEventForm(prev => ({ ...prev, date: e.target.value }))}
                className="dark-input w-full p-3 rounded-md border-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Event Type</label>
              <select
                value={newEventForm.type}
                onChange={e => setNewEventForm(prev => ({ ...prev, type: e.target.value }))}
                className="dark-input w-full p-3 rounded-md"
              >
                <option>Corporate</option>
                <option>Wedding</option>
                <option>Conference</option>
                <option>Birthday</option>
                <option>Fundraiser</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Location</label>
              <input
                value={newEventForm.location}
                onChange={e => setNewEventForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Grand Ballroom, Downtown"
                className="dark-input w-full p-3 rounded-md border-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Budget</label>
              <input
                type="number"
                value={newEventForm.budget}
                onChange={e => setNewEventForm(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="50000"
                className="dark-input w-full p-3 rounded-md border-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-300 mb-2 block">Expected Guests</label>
              <input
                type="number"
                value={newEventForm.guests}
                onChange={e => setNewEventForm(prev => ({ ...prev, guests: e.target.value }))}
                placeholder="250"
                className="dark-input w-full p-3 rounded-md border-2"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-300 mb-2 block">Description</label>
            <textarea
              rows={4}
              value={newEventForm.description}
              onChange={e => setNewEventForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the event, theme, special requirements..."
              className="dark-input w-full p-3 rounded-md border-2"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-md font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-6 py-2 rounded-md bg-purple-700 hover:bg-purple-600 text-white font-semibold flex items-center gap-2"
            >
              <Plus size={16} /> Create Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Task Detail Modal (module scope so re-renders never remount it) */
const TaskDetailModal = ({ task, onClose, setTasks, classes }) => {
    const [comment, setComment] = useState('');
    const [newSubtask, setNewSubtask] = useState('');
    if (!task) return null;
    const update = (patch) => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...patch } : t));
    const addSubtask = () => {
      const title = newSubtask.trim();
      if (!title) return;
      update({ subtasks: [...task.subtasks, { id: Math.max(0, ...task.subtasks.map(s => s.id)) + 1, title, completed: false }] });
      setNewSubtask('');
    };
    const addComment = () => {
      const text = comment.trim();
      if (!text) return;
      update({ comments: [...task.comments, { user: 'You', text, time: 'just now' }] });
      setComment('');
    };
    return (
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.8)' /* 80% dark overlay */, backdropFilter: 'blur(8px)' }}
      >
        <div
          className={`w-full md:max-w-4xl md:max-h-[90vh] overflow-y-auto ${classes.panelBg} ${classes.border} rounded-2xl`}
          style={{
            boxShadow: neonBoxShadow,
            borderColor: 'rgba(255,255,255,0.08)'
          }}
        >
          <div className="sticky top-0 p-4 flex justify-between items-start border-b-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex-1">
              <input
                type="text"
                defaultValue={task.title}
                onBlur={e => { const v = e.target.value.trim(); if (v && v !== task.title) update({ title: v }); }}
                className="w-full bg-transparent text-xl font-bold focus:outline-none"
                style={{ color: classes.strongText === 'text-slate-100' ? '#fff' : '#111' }}
              />
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs px-2 py-1 font-semibold ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>
                  {task.status}
                </span>
                <span className={`text-xs px-2 py-1 font-semibold ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-700'}`}>
                  {task.priority}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-white p-2">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">Description</label>
                <textarea rows="3" defaultValue={task.description} onBlur={e => { const v = e.target.value; if (v !== task.description) update({ description: v }); }} className="dark-input w-full p-3 rounded-md" />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-300">Subtasks</label>
                  <span className="text-xs text-slate-400">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} completed</span>
                </div>
                <div className="space-y-2">
                  {task.subtasks.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-md cursor-pointer" onClick={() => {
                      setTasks(prev => prev.map(t => t.id === task.id
                        ? { ...t, subtasks: t.subtasks.map(sub => sub.id === s.id ? { ...sub, completed: !sub.completed } : sub) }
                        : t
                      ));
                    }}>
                      <input type="checkbox" checked={s.completed} onChange={() => {}} className="w-4 h-4 cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
                      <span className={`text-sm ${s.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>{s.title}</span>
                    </div>
                  ))}
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={newSubtask} onChange={e => setNewSubtask(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addSubtask(); }}
                      placeholder="New subtask..." className="dark-input flex-1 p-2 rounded-md text-sm" />
                    <button onClick={addSubtask} className="text-sm font-semibold flex items-center gap-1 text-purple-300 px-2">
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300 mb-3 block">Comments</label>
                <div className="space-y-3">
                  {task.comments.map((c, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-700 text-white flex items-center justify-center rounded">{c.user.split(' ').map(n => n[0]).join('')}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{c.user}</span>
                          <span className="text-xs text-slate-400">{c.time}</span>
                        </div>
                        <p className="text-sm text-slate-200 mt-1">{c.text}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <div className="w-8 h-8 bg-slate-600 flex items-center justify-center rounded text-slate-200">You</div>
                    <input type="text" value={comment} onChange={e => setComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') addComment(); }}
                      placeholder="Add a comment... (Enter to post)" className="dark-input flex-1 p-2 rounded-md" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">ASSIGNED TO</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-700 text-white flex items-center justify-center rounded text-xs">{task.assignedTo.split(' ').map(n => n[0]).join('')}</div>
                  <span className="text-sm font-semibold">{task.assignedTo}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">DUE DATE</label>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Calendar size={14} />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">EVENT</label>
                <div className="text-sm text-slate-200">{task.event}</div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">TAGS</label>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map(tag => <span key={tag} className="text-xs px-2 py-1 rounded-md bg-white/5 text-slate-200">{tag}</span>)}
                </div>
              </div>

              {task.attachments.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block">ATTACHMENTS</label>
                  <div className="space-y-2">
                    {task.attachments.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5 cursor-pointer">
                        <Paperclip size={14} /> <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    );
  };


export default function App() {
  const [theme, setTheme] = useState('dark');
  const classes = useThemeClasses(theme);

  // Plan state — stored in localStorage; 'free' | 'pro'
  // Pilot builds default to 'pro' so seeded demo data never blocks real entry.
  const [plan, setPlan] = useLocalStorage('ef_plan', 'pro');
  const [showPricing, setShowPricing] = useState(false);

  // First-run: offer demo data vs a clean workspace; 'ef_workspace' also
  // drives the DEMO badge visibility.
  const [showFirstRun, setShowFirstRun] = useState(() =>
    typeof window !== 'undefined' && !localStorage.getItem('ef_workspace'));
  const demoWorkspace = typeof window === 'undefined' || localStorage.getItem('ef_workspace') !== 'clean';

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(0);
  const [activeEventTab, setActiveEventTab] = useState('overview');
  const [taskView, setTaskView] = useState('list');

  // Modal toggles
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  // Venue discovery
  const [discoverCity, setDiscoverCity] = useState('');
  const [discoverCategory, setDiscoverCategory] = useState('event space');
  const [discoverResults, setDiscoverResults] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState('');
  const [showClientDetailModal, setShowClientDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddVendorToEvent, setShowAddVendorToEvent] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);

  /* ── Persisted data ── */
  const [events, setEvents] = useLocalStorage('ef_events', [
    {
      id: 1, name: 'Summer Gala 2025', date: '2026-09-15', budget: 50000, spent: 32000,
      guests: 250, confirmed: 180, status: 'active', vendors: 8, tasks: 24, completed: 18,
      type: 'Corporate', location: 'Grand Ballroom, Downtown',
      description: 'Annual corporate gala celebrating company achievements and milestones.',
      team: [
        { id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' },
        { id: 2, name: 'James Cooper', role: 'Vendor Coordinator', email: 'james@eventflow.com', avatar: 'JC' },
        { id: 3, name: 'Emily Rodriguez', role: 'Guest Manager', email: 'emily@eventflow.com', avatar: 'ER' }
      ]
    },
    {
      id: 2, name: 'Thompson Wedding', date: '2026-10-22', budget: 75000, spent: 45000,
      guests: 180, confirmed: 150, status: 'active', vendors: 12, tasks: 31, completed: 22,
      type: 'Wedding', location: 'Crystal Palace, Waterfront',
      description: 'Elegant waterfront wedding celebration.',
      team: [{ id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' }]
    },
    {
      id: 3, name: 'Tech Conference 2025', date: '2026-11-10', budget: 120000, spent: 15000,
      guests: 500, confirmed: 320, status: 'planning', vendors: 5, tasks: 42, completed: 8,
      type: 'Conference', location: 'Convention Center',
      description: 'Three-day technology conference.',
      team: [{ id: 1, name: 'Sarah Mitchell', role: 'Lead Planner', email: 'sarah@eventflow.com', avatar: 'SM' }]
    }
  ]);

  const [vendors, setVendors] = useLocalStorage('ef_vendors', [
    { id: 1, name: 'Elegant Catering Co.', category: 'Catering', rating: 4.9, price: '$$$$', location: 'Downtown', reviews: 127, booked: true, lastContact: '2 days ago' },
    { id: 2, name: 'Harmony DJ Services', category: 'Entertainment', rating: 4.8, price: '$$$', location: 'Citywide', reviews: 89, booked: true, lastContact: '1 week ago' },
    { id: 3, name: 'Bloom & Petal', category: 'Florals', rating: 5.0, price: '$$$', location: 'Westside', reviews: 156, booked: false, lastContact: 'Never' },
    { id: 4, name: 'Gourmet Delights', category: 'Catering', rating: 4.8, price: '$$$', location: 'Midtown', reviews: 112, booked: false, lastContact: '1 month ago' },
    { id: 5, name: 'Live Band Collective', category: 'Entertainment', rating: 4.7, price: '$$$$', location: 'Downtown', reviews: 78, booked: false, lastContact: 'Never' }
  ]);

  const [venues, setVenues] = useLocalStorage('ef_venues', [
    { id: 1, name: 'Grand Ballroom', location: 'Downtown', capacity: 300, price: '$$$$$', rating: 4.7, reviews: 203, booked: true, amenities: ['Kitchen', 'Parking', 'AV Equipment'] },
    { id: 2, name: 'Crystal Palace', location: 'Waterfront', capacity: 250, price: '$$$$', rating: 4.8, reviews: 189, booked: false, amenities: ['Waterfront', 'Indoor/Outdoor', 'Catering'] },
    { id: 3, name: 'Convention Center', location: 'Tech District', capacity: 1000, price: '$$$$$', rating: 4.6, reviews: 267, booked: false, amenities: ['Multiple Rooms', 'Tech Setup', 'Catering'] },
    { id: 4, name: 'Garden Estate', location: 'Suburbs', capacity: 150, price: '$$$', rating: 4.9, reviews: 145, booked: false, amenities: ['Outdoor', 'Gardens', 'Tents Available'] }
  ]);

  const [conversations, setConversations] = useLocalStorage('ef_convos', [
    {
      id: 1, vendor: 'Elegant Catering Co.', lastMessage: 'Menu proposal attached', time: '10:30 AM', unread: true,
      messages: [
        { sender: 'vendor', text: 'Hi! Thanks for reaching out about catering.', time: '9:15 AM', attachments: [] },
        { sender: 'me', text: 'We need catering for 250 guests.', time: '9:20 AM', attachments: [] },
        { sender: 'vendor', text: 'Menu proposal attached for your review', time: '10:30 AM', attachments: ['menu-proposal.pdf'] }
      ]
    },
    { id: 2, vendor: 'Harmony DJ Services', lastMessage: 'Confirming booking', time: '9:15 AM', unread: false,
      messages: [{ sender: 'vendor', text: 'Confirming booking for June 15th.', time: '9:15 AM', attachments: [] }]
    }
  ]);

  const [tasks, setTasks] = useLocalStorage('ef_tasks', [
    {
      id: 1, title: 'Finalize menu with caterer', event: 'Summer Gala 2025', dueDate: '2026-07-15',
      status: 'in-progress', priority: 'high', assignedTo: 'James Cooper', createdBy: 'Sarah Mitchell',
      description: 'Review and approve final menu selections for the gala. Ensure dietary restrictions are accommodated.',
      subtasks: [
        { id: 1, title: 'Review menu options', completed: true },
        { id: 2, title: 'Check dietary accommodations', completed: true },
        { id: 3, title: 'Get client approval', completed: false },
        { id: 4, title: 'Finalize with caterer', completed: false }
      ],
      tags: ['catering', 'urgent'],
      comments: [
        { user: 'James Cooper', text: 'Menu options look great. Awaiting client feedback.', time: '2 hours ago' }
      ],
      attachments: ['menu-options.pdf', 'dietary-requirements.xlsx']
    },
    {
      id: 2, title: 'Send venue contract', event: 'Thompson Wedding', dueDate: '2026-06-28',
      status: 'completed', priority: 'high', assignedTo: 'Sarah Mitchell', createdBy: 'Sarah Mitchell',
      description: 'Prepare and send signed venue contract to Grand Ballroom.',
      subtasks: [
        { id: 1, title: 'Review contract terms', completed: true },
        { id: 2, title: 'Get signatures', completed: true },
        { id: 3, title: 'Send to venue', completed: true }
      ],
      tags: ['legal', 'venue'],
      comments: [],
      attachments: ['venue-contract-signed.pdf']
    },
    {
      id: 3, title: 'Confirm DJ setup requirements', event: 'Summer Gala 2025', dueDate: '2026-07-20',
      status: 'pending', priority: 'medium', assignedTo: 'Emily Rodriguez', createdBy: 'James Cooper',
      description: 'Coordinate with DJ to confirm equipment needs, power requirements, and setup timing.',
      subtasks: [
        { id: 1, title: 'Contact DJ service', completed: false },
        { id: 2, title: 'Confirm power requirements', completed: false },
        { id: 3, title: 'Schedule setup time', completed: false }
      ],
      tags: ['entertainment', 'logistics'],
      comments: [],
      attachments: []
    },
    {
      id: 4, title: 'Review floral samples', event: 'Thompson Wedding', dueDate: '2026-07-30',
      status: 'in-progress', priority: 'high', assignedTo: 'Sarah Mitchell', createdBy: 'Sarah Mitchell',
      description: 'Meet with florist to review centerpiece and bouquet samples.',
      subtasks: [
        { id: 1, title: 'Schedule appointment', completed: true },
        { id: 2, title: 'Review samples', completed: false },
        { id: 3, title: 'Select final designs', completed: false }
      ],
      tags: ['florals', 'vendor-meeting'],
      comments: [
        { user: 'Sarah Mitchell', text: 'Appointment scheduled for Friday 2pm', time: '1 day ago' }
      ],
      attachments: ['floral-inspiration.jpg']
    }
  ]);

  const [budgetItems, setBudgetItems] = useLocalStorage('ef_budget', [
    { id: 1, category: 'Venue', vendor: 'Grand Ballroom', amount: 12000, paid: 12000, status: 'paid', event: 'Summer Gala 2025', dueDate: '2026-08-01' },
    { id: 2, category: 'Catering', vendor: 'Elegant Catering', amount: 15000, paid: 7500, status: 'partial', event: 'Summer Gala 2025', dueDate: '2026-09-01' },
    { id: 3, category: 'Entertainment', vendor: 'Harmony DJ', amount: 2500, paid: 0, status: 'pending', event: 'Summer Gala 2025', dueDate: '2026-09-10' }
  ]);

  const [guests, setGuests] = useLocalStorage('ef_guests', [
    { id: 1, name: 'John Smith', email: 'john@email.com', rsvp: 'confirmed', plusOne: true, event: 'Summer Gala 2025', table: 'A1', dietaryRestrictions: 'Vegetarian' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', rsvp: 'confirmed', plusOne: false, event: 'Summer Gala 2025', table: 'A1', dietaryRestrictions: 'None' },
    { id: 3, name: 'Michael Chen', email: 'michael@email.com', rsvp: 'pending', plusOne: true, event: 'Summer Gala 2025', table: 'B2', dietaryRestrictions: 'Gluten-free' }
  ]);

  const [clients, setClients] = useLocalStorage('ef_clients', [
    { id: 1, company: 'Acme Corp', contact: 'Laura Peters', email: 'laura@acme.com', phone: '+49 30 1234567', status: 'active', events: 3, clientSince: '2022-03-12', notes: 'Prefers waterfront venues', linkedEvents: [] },
    { id: 2, company: 'The Thompson Family', contact: 'James Thompson', email: 'james@thompson.com', phone: '+49 30 9876543', status: 'active', events: 1, clientSince: '2025-01-05', notes: 'Wedding client', linkedEvents: [] },
    { id: 3, company: 'NextGen Tech', contact: 'Rita Gomez', email: 'rita@nextgen.com', phone: '+49 30 5551212', status: 'prospect', events: 0, clientSince: '2024-11-01', notes: 'Interested in conference packages', linkedEvents: [] }
  ]);

  /* -------------------- Venue discovery -------------------- */
  /* ── Live-computed events — always in sync with tasks/guests/budget ── */
  const enrichedEvents = useMemo(() => events.map(ev => {
    const evTasks  = tasks.filter(t => t.event === ev.name);
    const evGuests = guests.filter(g => g.event === ev.name);
    const evBudget = budgetItems.filter(b => b.event === ev.name);
    return {
      ...ev,
      tasks:     evTasks.length  > 0 ? evTasks.length  : ev.tasks,
      completed: evTasks.filter(t => t.status === 'completed').length,
      guests:    evGuests.length > 0 ? evGuests.length : ev.guests,
      confirmed: evGuests.filter(g => g.rsvp === 'confirmed').length,
      spent:     evBudget.length > 0 ? evBudget.reduce((s, i) => s + i.paid, 0) : ev.spent,
    };
  }), [events, tasks, guests, budgetItems]);

  /* ── Gamification — quests + XP derived once per data change ── */
  const quests = useMemo(
    () => computeQuests({ events, tasks, conversations, vendors, guests }),
    [events, tasks, conversations, vendors, guests]
  );
  const totalXp = useMemo(
    () => tasks.filter(t => t.status === 'completed').length * 50
      + quests.reduce((s, q) => s + (q.completed ? q.xp : 0), 0),
    [tasks, quests]
  );

  /* ── Derived selected records — always reflect latest data ── */
  const selectedEvent = useMemo(
    () => selectedEventId ? enrichedEvents.find(e => e.id === selectedEventId) || null : null,
    [enrichedEvents, selectedEventId]
  );
  const selectedTask = useMemo(
    () => selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null,
    [tasks, selectedTaskId]
  );

  const DISCOVER_CATEGORIES = [
    'event space', 'wedding venue', 'nightclub', 'hotel', 'boutique hotel',
    'resort', 'restaurant', 'bar', 'coworking', 'live music venue',
  ];

  async function handleDiscover() {
    // Shared venue-scraper Worker (venue-outreach-db repo) — Overpass/OSM, free.
    // Its CORS allowlist includes this app's origin; override via VITE_SCRAPER_URL.
    const scraperUrl = import.meta.env.VITE_SCRAPER_URL || 'https://venue-scraper.athar-hafiz.workers.dev';
    if (!discoverCity.trim()) return;
    setIsDiscovering(true);
    setDiscoverError('');
    setDiscoverResults([]);
    try {
      const res = await fetch(`${scraperUrl}/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: discoverCity.trim(), category: discoverCategory, limit: 20 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Discovery failed');
      if ((data.results ?? []).length === 0) setDiscoverError('No results found — try a different city or category.');
      setDiscoverResults(data.results ?? []);
    } catch (err) {
      setDiscoverError(err.message);
    } finally {
      setIsDiscovering(false);
    }
  }

  function saveDiscoveredVenue(v) {
    const next = {
      id: Date.now(),
      name: v.name,
      location: v.address?.city || discoverCity,
      capacity: 0,
      price: '$$$',
      rating: 0,
      reviews: 0,
      booked: false,
      amenities: [v.tags?.amenity ?? v.tags?.tourism ?? v.category].filter(Boolean),
      website: v.website,
      phone: v.phone,
      lat: v.lat,
      lng: v.lng,
    };
    setVenues(prev => [...prev, next]);
    setDiscoverResults(prev => prev.filter(r => r.osm_id !== v.osm_id));
  }

  /* -------------------- Filtering helpers -------------------- */
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || v.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVenues = venues.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()));

  /* -------------------- Nested UI components (kept inline to remain single file) -------------------- */

  /* Event Detail Overlay (inline) */
  const EventDetailView = ({ event, onClose }) => {
    if (!event) return null;
    const eventBudgetItems = budgetItems.filter(i => i.event === event.name);
    const eventTasks = tasks.filter(t => t.event === event.name);
    const eventGuests = guests.filter(g => g.event === event.name);
    const sortedGuests = [...eventGuests].sort((a, b) => a.name.localeCompare(b.name));
    const taskPct = event.tasks ? (event.completed / event.tasks) * 100 : 0;
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className="min-h-screen app-bg">
          <div className={`${classes.panelBg} ${classes.border} rounded-b-2xl`} style={{ boxShadow: neonBoxShadow, borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={onClose} className="flex items-center gap-2 text-slate-200">
                  <X size={18} /> Back to Events
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setShowEditEvent(true)} className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2">
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      if (!window.confirm(`Delete "${event.name}" and all its tasks, guests and budget items? This cannot be undone.`)) return;
                      setTasks(prev => prev.filter(t => t.event !== event.name));
                      setGuests(prev => prev.filter(g => g.event !== event.name));
                      setBudgetItems(prev => prev.filter(b => b.event !== event.name));
                      setEvents(prev => prev.filter(ev => ev.id !== event.id));
                      onClose();
                    }}
                    className="bg-white/5 hover:bg-red-900/40 text-red-300 px-4 py-2 text-sm font-semibold rounded-md flex items-center gap-2"
                  >
                    <X size={14} /> Delete
                  </button>
                </div>
              </div>

              {showEditEvent && (
                <EditEventInline event={event} onSave={(updated) => {
                  const oldName = event.name;
                  setEvents(prev => prev.map(ev => ev.id === updated.id ? { ...ev, ...updated } : ev));
                  if (updated.name && updated.name !== oldName) {
                    setTasks(prev => prev.map(t => t.event === oldName ? { ...t, event: updated.name } : t));
                    setGuests(prev => prev.map(g => g.event === oldName ? { ...g, event: updated.name } : g));
                    setBudgetItems(prev => prev.map(b => b.event === oldName ? { ...b, event: updated.name } : b));
                  }
                  setShowEditEvent(false);
                }} onClose={() => setShowEditEvent(false)} />
              )}

              <h1 className="text-2xl font-bold text-white mb-2">{event.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-300 mb-4">
                <span className="flex items-center gap-1"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><MapPin size={14} />{event.location}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{event.status}</span>
              </div>

              <div className="flex gap-1 border-b-2 pb-4 overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                {['overview', 'team', 'vendors', 'tasks', 'budget', 'guests', 'schedule'].map(tab => (
                  <button key={tab} onClick={() => setActiveEventTab(tab)} className={`pb-2 px-3 text-sm font-semibold whitespace-nowrap ${activeEventTab === tab ? 'text-purple-300 border-b-2 border-purple-400' : 'text-slate-300 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-6">
            {activeEventTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 8px 30px -10px rgba(0,0,0,0.6)' }}>
                    <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
                    <p className="text-slate-300 text-sm leading-relaxed">{event.description}</p>
                  </div>

                  <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 8px 30px -10px rgba(0,0,0,0.6)' }}>
                    <h2 className="text-lg font-semibold text-white mb-4">Progress</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2 text-sm text-slate-300">
                          <span>Tasks Completion</span>
                          <span className="text-white font-semibold">{Math.round(taskPct)}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded"><div className="h-full" style={{ width: `${taskPct}%`, background: NEON }} /></div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2 text-sm text-slate-300">
                          <span>Budget Used</span>
                          <span className="text-white font-semibold">{Math.round((event.spent / event.budget) * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded"><div className="h-full" style={{ width: `${(event.spent / event.budget) * 100}%`, background: 'linear-gradient(90deg, #10b981, #059669)' }} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h2 className="text-base font-semibold text-white mb-4">Quick Stats</h2>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div className="flex justify-between"><span>Budget</span><span className="font-semibold text-white">€{event.budget.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Spent</span><span className="font-semibold text-emerald-400">€{event.spent.toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Guests</span><span className="font-semibold text-white">{event.guests}</span></div>
                      <div className="flex justify-between"><span>Confirmed</span><span className="font-semibold text-emerald-400">{event.confirmed}</span></div>
                    </div>
                  </div>

                  <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <h2 className="text-base font-semibold text-white mb-4">Team</h2>
                    <div className="space-y-3">
                      {event.team.map(member => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-700 flex items-center justify-center rounded font-bold text-white text-xs">{member.avatar}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{member.name}</p>
                            <p className="text-xs text-slate-300 truncate">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeEventTab === 'team' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Team</h2>
                  <button onClick={() => setShowAddMemberModal(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm">
                    <UserPlus size={14} /> Add Member
                  </button>
                </div>
                {showAddMemberModal && (
                  <AddMemberInline
                    onAdd={(member) => {
                      setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, team: [...ev.team, { id: Date.now(), ...member }] } : ev));
                      setShowAddMemberModal(false);
                    }}
                    onClose={() => setShowAddMemberModal(false)}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {event.team.length === 0 && (
                    <div className="col-span-3 text-center py-8" style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No team members yet. Add one above.</div>
                  )}
                  {event.team.map(member => (
                    <div key={member.id} className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderTop: '2px solid var(--accent)' }}>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-700 flex items-center justify-center rounded-lg font-bold text-white text-sm">{member.avatar || member.name?.split(' ').map(n=>n[0]).join('').toUpperCase()}</div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--text-1)' }}>{member.name}</p>
                          <p className="text-xs text-purple-300 mt-0.5">{member.role}</p>
                        </div>
                      </div>
                      <div className="text-xs space-y-1 mb-4" style={{ color: 'var(--text-2)' }}>
                        <div>{member.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const idx = conversations.findIndex(c => c.vendor === member.name);
                            if (idx >= 0) { setSelectedConversation(idx); setActiveTab('messages'); }
                            else {
                              setConversations(prev => [...prev, { id: Date.now(), vendor: member.name, lastMessage: '', time: 'now', unread: false, messages: [] }]);
                              setSelectedConversation(conversations.length);
                              setActiveTab('messages');
                            }
                          }}
                          className="flex-1 py-1.5 rounded text-xs font-semibold transition-colors" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>Message</button>
                        <button
                          onClick={() => { if (window.confirm(`Remove ${member.name} from team?`)) setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, team: ev.team.filter(m => m.id !== member.id) } : ev)); }}
                          className="flex-1 py-1.5 rounded text-xs font-semibold transition-colors" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeEventTab === 'vendors' && (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-white">Event Vendors</h2>
      <button onClick={() => setShowAddVendorToEvent(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm">
        <Plus size={14} /> Add Vendor
      </button>
    </div>

    {showAddVendorToEvent && (
      <div className="panel-glass glass-border rounded-lg p-4">
        <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Select a vendor to book for this event:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {vendors.filter(v => !v.booked).map(v => (
            <button key={v.id} onClick={() => { setVendors(prev => prev.map(vv => vv.id === v.id ? { ...vv, booked: true } : vv)); setShowAddVendorToEvent(false); }}
              className="flex items-center gap-3 p-3 rounded-md text-left transition-all"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{v.name}</div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>{v.category} · {v.price}</div>
              </div>
            </button>
          ))}
          {vendors.filter(v => !v.booked).length === 0 && <p className="text-sm col-span-2" style={{ color: 'var(--text-3)' }}>All vendors are already booked.</p>}
        </div>
        <button onClick={() => setShowAddVendorToEvent(false)} className="text-xs" style={{ color: 'var(--text-3)' }}>Cancel</button>
      </div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vendors.filter(v => v.booked).map(vendor => (
        <div
          key={vendor.id}
          onClick={() => { setSelectedVendor(vendor); setShowVendorModal(true); }}
          className={`${classes.panelBg} ${classes.border} p-4 rounded-md cursor-pointer hover:shadow-lg transition-all`}
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-white text-sm">{vendor.name}</h3>
              <p className="text-xs text-purple-300 mt-1">{vendor.category}</p>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-bold">{vendor.rating}</span>
            </div>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin size={12} />
              <span>{vendor.location}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400 font-bold">{vendor.price}</span>
              <span className="text-slate-400">Last: {vendor.lastContact}</span>
            </div>
          </div>
        </div>
      ))}
      {vendors.filter(v => v.booked).length === 0 && (
        <div className="col-span-3 text-center py-8 text-slate-400">No vendors assigned yet</div>
      )}
    </div>
  </div>
)}

            {activeEventTab === 'budget' && (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-white">Budget Overview</h2>
      <button onClick={() => setShowAddBudgetModal(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm">
        <Plus size={14} /> Add Item
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="text-sm text-slate-400 mb-1">Total Budget</div>
        <div className="text-2xl font-bold text-white">€{event.budget.toLocaleString()}</div>
      </div>
      <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="text-sm text-slate-400 mb-1">Spent</div>
        <div className="text-2xl font-bold text-emerald-400">€{event.spent.toLocaleString()}</div>
      </div>
      <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="text-sm text-slate-400 mb-1">Remaining</div>
        <div className="text-2xl font-bold text-purple-400">€{(event.budget - event.spent).toLocaleString()}</div>
      </div>
    </div>

    <div className={`${classes.panelBg} ${classes.border} rounded-md overflow-x-auto`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-slate-900">
          <tr>
            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Category</th>
            <th className="text-left py-3 px-4 text-slate-300 font-semibold">Vendor</th>
            <th className="text-right py-3 px-4 text-slate-300 font-semibold">Amount</th>
            <th className="text-right py-3 px-4 text-slate-300 font-semibold">Paid</th>
            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Status</th>
            <th className="text-center py-3 px-4 text-slate-300 font-semibold">Due Date</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {eventBudgetItems.map(item => (
            <tr key={item.id} className="border-b hover:bg-white/5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <td className="py-3 px-4 text-white font-semibold">{item.category}</td>
              <td className="py-3 px-4 text-slate-300">{item.vendor}</td>
              <td className="py-3 px-4 text-right text-white font-semibold">€{item.amount.toLocaleString()}</td>
              <td className="py-3 px-4 text-right text-emerald-400">€{item.paid.toLocaleString()}</td>
              <td className="py-3 px-4 text-center">
                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                  item.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                  item.status === 'partial' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="py-3 px-4 text-center text-slate-300">
                {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </td>
              <td className="py-3 px-2 text-center">
                <button onClick={() => { if (window.confirm('Delete this budget item?')) setBudgetItems(prev => prev.filter(i => i.id !== item.id)); }} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Delete">×</button>
              </td>
            </tr>
          ))}
          {eventBudgetItems.length === 0 && (
            <tr><td colSpan={7} className="py-8 text-center text-slate-400 text-sm">No budget items yet — add one above</td></tr>
          )}
        </tbody>
        <tfoot>
          <tr className="border-t-2" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
            <td colSpan={2} className="py-3 px-4 text-sm font-semibold text-slate-300">Total</td>
            <td className="py-3 px-4 text-right font-bold text-white">€{eventBudgetItems.reduce((s, i) => s + i.amount, 0).toLocaleString()}</td>
            <td className="py-3 px-4 text-right font-bold text-emerald-400">€{eventBudgetItems.reduce((s, i) => s + i.paid, 0).toLocaleString()}</td>
            <td colSpan={3} />
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
)}

           {activeEventTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">Tasks</h2>
                    <div className="flex gap-1 bg-slate-900 p-1 rounded">
                      <button onClick={() => setTaskView('list')} className={`px-3 py-1 text-xs font-semibold rounded ${taskView === 'list' ? 'bg-white/10 text-white shadow' : 'text-slate-300'}`}>List</button>
                      <button onClick={() => setTaskView('board')} className={`px-3 py-1 text-xs font-semibold rounded ${taskView === 'board' ? 'bg-white/10 text-white shadow' : 'text-slate-300'}`}>Board</button>
                    </div>
                  </div>
                  <button onClick={() => setShowAddTaskModal(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2"><Plus size={16} /> Add Task</button>
                </div>

                {taskView === 'list' && (
                  <div className={`${classes.panelBg} ${classes.border} rounded-md overflow-hidden`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-900">
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Task</th>
                          <th className="text-left py-3 px-4 text-slate-300 font-semibold">Assigned</th>
                          <th className="text-center py-3 px-4 text-slate-300 font-semibold">Priority</th>
                          <th className="text-center py-3 px-4 text-slate-300 font-semibold">Status</th>
                          <th className="text-center py-3 px-4 text-slate-300 font-semibold">Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.filter(t => t.event === event.name).length === 0 && (
                          <tr><td colSpan={5} className="py-10 text-center text-sm" style={{ color: 'var(--text-3)' }}>No tasks yet. Add a task to get started.</td></tr>
                        )}
                        {tasks.filter(t => t.event === event.name).map(task => {
                          const overdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
                          return (
                          <tr key={task.id} onClick={() => { setSelectedTaskId(task.id); setShowTaskDetail(true); }} className="border-b hover:bg-white/5 cursor-pointer" style={{ borderColor: 'rgba(255,255,255,0.05)', background: overdue ? 'rgba(255,107,107,0.04)' : undefined }}>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white flex items-center gap-2">
                                {task.title}
                                {overdue && <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/40 text-red-400 font-bold">OVERDUE</span>}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</div>
                            </td>
                            <td className="py-3 px-4 text-slate-300">{task.assignedTo}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-white/5 text-slate-200'}`}>{task.priority}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-white/5 text-slate-200'}`}>{task.status}</span>
                            </td>
                            <td className={`py-3 px-4 text-center ${overdue ? 'text-red-400 font-semibold' : 'text-slate-300'}`}>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {taskView === 'board' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Three columns: pending, in-progress, completed */}
                    {['pending', 'in-progress', 'completed'].map(status => (
                      <div
                        key={status}
                        className={`${classes.panelBg} ${classes.border} rounded-md p-4`}
                        style={{ borderColor: 'rgba(255,255,255,0.08)', minHeight: 200 }}
                        onDragOver={(e) => {
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const idStr = e.dataTransfer.getData('text/task-id');
                          if (!idStr) return;
                          const id = Number(idStr);
                          setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-slate-300 uppercase">{status.replace('-', ' ')}</h4>
                          <span className="text-xs bg-white/5 text-slate-300 px-2 py-0.5 rounded font-semibold">
                            {eventTasks.filter(t => t.status === status).length}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {eventTasks.filter(t => t.status === status).map(task => (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/task-id', String(task.id));
                                // optional: set drag image or effect
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onClick={() => { setSelectedTaskId(task.id); setShowTaskDetail(true); }}
                              className="bg-slate-900 p-3 rounded-md cursor-pointer hover:border-purple-500 transition-all border-2"
                              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-semibold text-white flex-1">{task.title}</h4>
                                <span className={`text-xs px-2 py-0.5 font-semibold rounded ml-2 ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {task.priority}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">{task.assignedTo}</span>
                                <span className="text-slate-400">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                          ))}

                          {eventTasks.filter(t => t.status === status).length === 0 && (
                            <div className="text-center py-6 text-slate-400 text-sm">No tasks</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeEventTab === 'guests' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Guest List</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const rows = [['Name','Email','RSVP','+1','Table','Dietary']];
                        guests.filter(g => g.event === event.name).forEach(g => {
                          rows.push([g.name, g.email, g.rsvp, g.plusOne ? 'Yes' : 'No', g.table, g.dietaryRestrictions]);
                        });
                        const csv = rows.map(r => r.map(c => `"${(c||'').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `${event.name.replace(/\s+/g,'-')}-guests.csv`; a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded text-sm"
                    >
                      Export CSV
                    </button>
                    <button onClick={() => setShowAddGuestModal(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm">
                      <UserPlus size={14} /> Add Guest
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="text-sm text-slate-400 mb-1">Total Invited</div>
                    <div className="text-2xl font-bold text-white">{event.guests}</div>
                  </div>
                  <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="text-sm text-slate-400 mb-1">Confirmed</div>
                    <div className="text-2xl font-bold text-emerald-400">{event.confirmed}</div>
                  </div>
                  <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="text-sm text-slate-400 mb-1">Pending</div>
                    <div className="text-2xl font-bold text-amber-400">{eventGuests.filter(g => g.rsvp === 'pending').length}</div>
                  </div>
                  <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="text-sm text-slate-400 mb-1">Declined</div>
                    <div className="text-2xl font-bold text-red-400">{eventGuests.filter(g => g.rsvp === 'declined').length}</div>
                  </div>
                </div>

                <div className={`${classes.panelBg} ${classes.border} rounded-md overflow-x-auto`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <table className="w-full text-sm min-w-[640px]">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Email</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold">RSVP</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold">+1</th>
                        <th className="text-center py-3 px-4 text-slate-300 font-semibold">Table</th>
                        <th className="text-left py-3 px-4 text-slate-300 font-semibold">Dietary</th>
                        <th className="w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {sortedGuests.map(guest => (
                        <tr key={guest.id} className="border-b hover:bg-white/5" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                          <td className="py-3 px-4 text-white font-semibold">{guest.name}</td>
                          <td className="py-3 px-4 text-slate-300">{guest.email}</td>
                          <td className="py-3 px-4 text-center">
                            <select
                              value={guest.rsvp}
                              onClick={e => e.stopPropagation()}
                              onChange={e => setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, rsvp: e.target.value } : g))}
                              className="text-xs font-semibold rounded px-2 py-1 cursor-pointer"
                              style={{ background: guest.rsvp === 'confirmed' ? 'rgba(0,229,160,0.12)' : guest.rsvp === 'pending' ? 'rgba(245,166,35,0.12)' : 'rgba(255,107,107,0.12)', color: guest.rsvp === 'confirmed' ? 'var(--color-green)' : guest.rsvp === 'pending' ? 'var(--color-amber)' : 'var(--color-red)', border: 'none' }}
                            >
                              <option value="confirmed">confirmed</option>
                              <option value="pending">pending</option>
                              <option value="declined">declined</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-300">{guest.plusOne ? 'Yes' : 'No'}</td>
                          <td className="py-3 px-4 text-center text-slate-300">{guest.table}</td>
                          <td className="py-3 px-4 text-slate-300">{guest.dietaryRestrictions}</td>
                          <td className="py-3 px-2 text-center">
                            <button onClick={e => { e.stopPropagation(); if (window.confirm('Remove this guest?')) setGuests(prev => prev.filter(g => g.id !== guest.id)); }} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Remove">×</button>
                          </td>
                        </tr>
                      ))}
                      {eventGuests.length === 0 && (
                        <tr><td colSpan={7} className="py-8 text-center text-slate-400 text-sm">No guests yet — add one above</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

{activeEventTab === 'schedule' && selectedEvent != null && (
  <ScheduleTab
    event={selectedEvent}
    setEvents={setEvents}
    onAddSchedule={() => setShowAddScheduleModal(true)}
  />
)}



          </div>
        </div>
      </div>
    );
  };

  /* -------------------- New Modals: Add Budget, Add Guest, Add Schedule (unchanged) -------------------- */

  const AddBudgetModal = ({ eventName, onClose }) => {
    const [category, setCategory] = useState('Venue');
    const [vendorName, setVendorName] = useState('');
    const [amount, setAmount] = useState('');
    const [paid, setPaid] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleAdd = () => {
      const newItem = {
        id: Math.max(0, ...budgetItems.map(i => i.id)) + 1,
        category,
        vendor: vendorName,
        amount: Number(amount) || 0,
        paid: Number(paid) || 0,
        status: Number(paid) >= Number(amount) ? 'paid' : Number(paid) > 0 ? 'partial' : 'pending',
        event: eventName,
        dueDate: dueDate || new Date().toISOString().slice(0,10)
      };
      setBudgetItems(prev => [...prev, newItem]);
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className={`${classes.panelBg} ${classes.border} rounded-2xl w-full max-w-md p-6`} style={{ boxShadow: neonBoxShadow, borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Add Budget Item</h3>
            <button onClick={onClose}><X size={18} className="text-slate-300" /></button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full dark-input p-2 rounded-md">
                <option>Venue</option>
                <option>Catering</option>
                <option>Entertainment</option>
                <option>Decor</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-300">Vendor</label>
              <input value={vendorName} onChange={e => setVendorName(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300">Amount</label>
                <input value={amount} onChange={e => setAmount(e.target.value)} className="w-full dark-input p-2 rounded-md" />
              </div>
              <div>
                <label className="text-xs text-slate-300">Paid</label>
                <input value={paid} onChange={e => setPaid(e.target.value)} className="w-full dark-input p-2 rounded-md" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-300">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button onClick={onClose} className="px-4 py-2 rounded-md">Cancel</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-md bg-purple-700 text-white">Add</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddGuestModal = ({ eventName, onClose }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [table, setTable] = useState('');
    const [dietary, setDietary] = useState('');
    const [plusOne, setPlusOne] = useState(false);

    const handleAdd = () => {
      if (!name.trim()) { alert('Guest name is required'); return; }
      const newGuest = {
        id: Math.max(0, ...guests.map(g => g.id)) + 1,
        name: name.trim(), email: email.trim(), rsvp: 'pending', plusOne, event: eventName, table, dietaryRestrictions: dietary
      };
      setGuests(prev => [...prev, newGuest]);
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className={`${classes.panelBg} ${classes.border} rounded-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto`} style={{ boxShadow: neonBoxShadow, borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Add Guest</h3>
            <button onClick={onClose}><X size={18} className="text-slate-300" /></button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Table Assignment</label>
              <input value={table} onChange={e => setTable(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Dietary Restrictions</label>
              <input value={dietary} onChange={e => setDietary(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={plusOne} onChange={e => setPlusOne(e.target.checked)} />
              <label className="text-xs text-slate-300">Plus One</label>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button onClick={onClose} className="px-4 py-2 rounded-md">Cancel</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-md bg-purple-700 text-white">Add</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AddScheduleModal = ({ eventName, onClose }) => {
    const [time, setTime] = useState('');
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [assigned, setAssigned] = useState('');

    const handleAdd = () => {
      const newItem = {
        id: Math.max(0, ...tasks.map(t => t.id)) + 1,
        title,
        event: eventName,
        dueDate: time || new Date().toISOString().slice(0,10),
        status: 'pending',
        priority: 'medium',
        assignedTo: assigned || 'Unassigned',
        description: `Schedule item — duration ${duration}`,
        subtasks: [],
        tags: ['schedule'],
        comments: [],
        attachments: []
      };
      setEvents(prev => prev.map(ev => ev.name === eventName ? { ...ev, schedule: [...(ev.schedule || []), { time, title, duration, assigned }] } : ev));
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className={`${classes.panelBg} ${classes.border} rounded-2xl w-full max-w-md p-6`} style={{ boxShadow: neonBoxShadow, borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Add Schedule Item</h3>
            <button onClick={onClose}><X size={18} className="text-slate-300" /></button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300">Time</label>
              <input value={time} onChange={e => setTime(e.target.value)} placeholder="09:00 AM" className="w-full dark-input p-2 rounded-md" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Duration</label>
              <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="1 hour" className="w-full dark-input p-2 rounded-md" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Assigned Person</label>
              <input value={assigned} onChange={e => setAssigned(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button onClick={onClose} className="px-4 py-2 rounded-md">Cancel</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-md bg-purple-700 text-white">Add</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------- Clients: List, Add, Detail (unchanged) -------------------- */

  const ClientDetailModal = ({ client, onClose }) => {
    if (!client) return null;
    const [draft, setDraft] = React.useState({ ...client });
    const [dirty, setDirty] = React.useState(false);
    const update = (field, val) => { setDraft(p => ({ ...p, [field]: val })); setDirty(true); };
    const save = () => {
      setClients(prev => prev.map(c => c.id === client.id ? { ...draft } : c));
      setDirty(false);
    };
    const clientEvents = events.filter(e => e.name && draft.linkedEvents?.includes(e.id));
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className={`${classes.panelBg} ${classes.border} rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto`} style={{ boxShadow: neonBoxShadow, borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-1)' }}>{draft.company || 'Client'}</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Client since {new Date(draft.clientSince).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              {dirty && <button onClick={save} className="px-3 py-1.5 rounded text-xs font-bold text-white bg-purple-700 hover:bg-purple-600">Save</button>}
              <button onClick={onClose}><X size={18} style={{ color: 'var(--text-2)' }} /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              ['Company', 'company'], ['Contact Person', 'contact'], ['Email', 'email'], ['Phone', 'phone'],
            ].map(([label, field]) => (
              <div key={field}>
                <label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>{label.toUpperCase()}</label>
                <input value={draft[field] || ''} onChange={e => update(field, e.target.value)} className="dark-input w-full p-2 rounded-md text-sm" />
              </div>
            ))}
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>STATUS</label>
              <select value={draft.status} onChange={e => update('status', e.target.value)} className="dark-input w-full p-2 rounded-md text-sm">
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>LINKED EVENT</label>
              <select
                value=""
                onChange={e => {
                  const id = Number(e.target.value);
                  if (!id) return;
                  const linked = draft.linkedEvents || [];
                  if (!linked.includes(id)) update('linkedEvents', [...linked, id]);
                }}
                className="dark-input w-full p-2 rounded-md text-sm"
              >
                <option value="">Link an event...</option>
                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
              </select>
              {(draft.linkedEvents || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(draft.linkedEvents || []).map(id => {
                    const ev = events.find(e => e.id === id);
                    return ev ? (
                      <span key={id} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>
                        {ev.name}
                        <button onClick={() => update('linkedEvents', (draft.linkedEvents || []).filter(i => i !== id))} className="hover:text-red-400 ml-1">×</button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>NOTES</label>
            <textarea rows={3} value={draft.notes || ''} onChange={e => update('notes', e.target.value)} className="dark-input w-full p-2 rounded-md text-sm" placeholder="Client preferences, important details..." />
          </div>

          <div className="flex justify-between items-center mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => { if (window.confirm('Delete this client? This cannot be undone.')) { setClients(prev => prev.filter(c => c.id !== client.id)); onClose(); } }}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Delete client
            </button>
            {dirty && <button onClick={save} className="px-4 py-2 rounded text-sm font-semibold text-white bg-purple-700 hover:bg-purple-600">Save changes</button>}
          </div>
        </div>
      </div>
    );
  };

  const AddClientModal = ({ onClose }) => {
    const [company, setCompany] = useState('');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState('prospect');

    const handleAdd = () => {
      const newClient = {
        id: Math.max(0, ...clients.map(c => c.id)) + 1,
        company, contact, email, phone, status, events: 0, clientSince: new Date().toISOString().slice(0,10), notes: ''
      };
      setClients(prev => [...prev, newClient]);
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className={`${classes.panelBg} ${classes.border} rounded-2xl w-full max-w-md p-6`} style={{ boxShadow: neonBoxShadow, borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Add Client</h3>
            <button onClick={onClose}><X size={18} className="text-slate-300" /></button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300">Company</label>
              <input value={company} onChange={e => setCompany(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Contact Person</label>
              <input value={contact} onChange={e => setContact(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Phone</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>
            <div>
              <label className="text-xs text-slate-300">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full dark-input p-2 rounded-md">
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button onClick={onClose} className="px-4 py-2 rounded-md">Cancel</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-md bg-purple-700 text-white">Add Client</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ClientListView = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowAddClientModal(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={16} /> Add Client</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <div key={client.id} onClick={() => { setSelectedClient(client); setShowClientDetailModal(true); }} className={`${classes.panelBg} ${classes.border} p-4 rounded-md cursor-pointer hover:shadow-lg`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm">{client.company}</h3>
                  <p className="text-xs text-slate-300 mt-1">{client.contact}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 font-semibold ${client.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{client.status}</span>
              </div>

              <div className="text-xs text-slate-300 mb-3">
                <div>{client.email}</div>
                <div className="mt-1">{client.phone}</div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400">
                <div>{client.events} events</div>
                <div>Since {new Date(client.clientSince).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* -------------------- Add Task Modal & helpers -------------------- */

  const AddTaskModal = ({ eventName, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('pending'); // pending, in-progress, completed
    const [priority, setPriority] = useState('medium');

    const handleAdd = () => {
      const newTask = {
        id: Math.max(0, ...tasks.map(t => t.id)) + 1,
        title: title || 'Untitled Task',
        event: eventName,
        dueDate: dueDate || new Date().toISOString().slice(0,10),
        status,
        priority,
        assignedTo: assignedTo || 'Unassigned',
        createdBy: 'You',
        description,
        subtasks: [],
        tags: [],
        comments: [],
        attachments: []
      };
      setTasks(prev => [...prev, newTask]);
      onClose();
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
        <div className={`${classes.panelBg} ${classes.border} rounded-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto`} style={{ boxShadow: neonBoxShadow, borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Add Task</h3>
            <button onClick={onClose}><X size={18} className="text-slate-300" /></button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>

            <div>
              <label className="text-xs text-slate-300">Description</label>
              <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>

            <div>
              <label className="text-xs text-slate-300">Assigned Person</label>
              <input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full dark-input p-2 rounded-md" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full dark-input p-2 rounded-md" />
              </div>
              <div>
                <label className="text-xs text-slate-300">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full dark-input p-2 rounded-md">
                  <option value="pending">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Done</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full dark-input p-2 rounded-md">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button onClick={onClose} className="px-4 py-2 rounded-md">Cancel</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-md bg-purple-700 text-white">Add Task</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* -------------------- Main App JSX -------------------- */

  return (
    <div data-theme={theme} className={`app-root min-h-screen ${classes.appBg} font-sans`}>
      {/* First-run choice: explore demo data or start clean */}
      {showFirstRun && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
          <div className="panel-glass glass-border rounded-2xl p-8 w-full max-w-md text-center" style={{ boxShadow: 'var(--glow-md)' }}>
            <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-white font-bold" style={{ background: 'var(--accent)' }}>RT</div>
            <h2 className="text-xl font-bold text-white mb-2">Welcome to RT Network</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>How do you want to start?</p>
            <div className="space-y-3">
              <button
                onClick={() => { localStorage.setItem('ef_workspace', 'clean'); ['ef_events','ef_vendors','ef_venues','ef_convos','ef_tasks','ef_budget','ef_guests','ef_clients'].forEach(k => localStorage.setItem(k, '[]')); window.location.reload(); }}
                className="w-full py-3 rounded-md font-semibold text-white bg-purple-700 hover:bg-purple-600">
                Start clean — plan my real event
              </button>
              <button
                onClick={() => { localStorage.setItem('ef_workspace', 'demo'); setShowFirstRun(false); }}
                className="w-full py-3 rounded-md font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--text-1)' }}>
                Explore with demo data
              </button>
            </div>
            <p className="text-xs mt-4" style={{ color: 'var(--text-3)' }}>You can switch anytime in Settings → Data.</p>
          </div>
        </div>
      )}

      {/* Top mobile header */}
      <div className="md:hidden app-bg border-b-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <div className="p-4 flex justify-between items-center">
          <div className="text-lg font-bold text-white flex items-center gap-2">
            RT Network
            {demoWorkspace && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--color-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.06em' }}>DEMO</span>}
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            <Menu size={20} className="text-slate-200" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Mobile sidebar backdrop */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-20" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileMenuOpen(false)} />
        )}
        {/* Sidebar */}
        <nav className={`${mobileMenuOpen ? 'block fixed inset-y-0 left-0 z-30' : 'hidden'} md:relative md:block w-72 md:w-64 ${classes.panelBg} ${classes.border} md:h-screen overflow-y-auto`}
             style={{ borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 30px rgba(0,0,0,0.8)' }}>
          <div className="hidden md:flex items-center gap-3 p-5 border-b-2" style={{ borderColor: 'var(--border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--accent)' }}>RT</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold" style={{ color: 'var(--text-1)', fontFamily: 'var(--font-sans)' }}>RT Network</h1>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>Event planning CRM</p>
            </div>
            {demoWorkspace && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--color-amber)', fontFamily: 'var(--font-mono)', fontSize: '0.5rem', letterSpacing: '0.06em' }}>DEMO</span>}
          </div>

          <div className="p-4 space-y-1">
            {/* OPERATIONS */}
            <div className="px-3 pt-3 pb-1">
              <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>OPERATIONS</span>
            </div>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'quotes', label: 'Quotes', icon: Inbox },
              { id: 'providers', label: 'Providers', icon: Store },
              { id: 'preflight', label: 'Pre-Flight', icon: ShieldCheck },
              { id: 'events', label: 'Events', icon: Calendar },
              { id: 'vendors', label: 'Vendors', icon: Building2 },
              { id: 'venues', label: 'Venues', icon: MapPin },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${activeTab === item.id ? 'nav-active-bg text-purple-300 font-semibold border-l-2 border-purple-500' : 'hover:bg-white/5'}`}
                  style={{ color: activeTab === item.id ? 'var(--accent)' : 'var(--text-2)' }}
                >
                  <Icon size={16} />
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })}

            {/* MANAGEMENT */}
            <div className="px-3 pt-4 pb-1">
              <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>MANAGEMENT</span>
            </div>
            {[
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${activeTab === item.id ? 'nav-active-bg text-purple-300 font-semibold border-l-2 border-purple-500' : 'hover:bg-white/5'}`}
                  style={{ color: activeTab === item.id ? 'var(--accent)' : 'var(--text-2)' }}
                >
                  <Icon size={16} />
                  <span className="font-semibold">{item.label}</span>
                  {item.id === 'messages' && conversations.filter(c => c.unread).length > 0 && (
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>
                      {conversations.filter(c => c.unread).length}
                    </span>
                  )}
                </button>
              );
            })}

            {/* SYSTEM */}
            <div className="px-3 pt-4 pb-1">
              <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>SYSTEM</span>
            </div>
            <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded transition-colors ${activeTab === 'settings' ? 'nav-active-bg text-purple-300 font-semibold border-l-2 border-purple-500' : 'hover:bg-white/5'}`}
              style={{ color: activeTab === 'settings' ? 'var(--accent)' : 'var(--text-2)' }}
            >
              <Settings size={16} />
              <span className="font-semibold">Settings</span>
            </button>
          </div>

          {/* Pro upgrade CTA in sidebar */}
          {plan === 'free' && (
            <div className="p-4 mt-auto">
              <button
                onClick={() => setShowPricing(true)}
                style={{ width: '100%', padding: '0.65rem', background: 'rgba(var(--ef-brand-rgb),0.12)', border: '1px solid rgba(var(--ef-brand-rgb),0.3)', borderRadius: 6, color: 'var(--ef-brand-text)', fontFamily: 'Space Mono, monospace', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, letterSpacing: '0.06em' }}
              >
                <Zap size={13} /> UPGRADE TO PRO
              </button>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.55rem', color: '#374151', textAlign: 'center', marginTop: 6 }}>
                3 events remaining on free plan
              </p>
            </div>
          )}
          {plan === 'pro' && (
            <div style={{ padding: '0.75rem 1rem', margin: '0 0.5rem 0.5rem', background: 'rgba(var(--ef-brand-rgb),0.08)', border: '1px solid rgba(var(--ef-brand-rgb),0.2)', borderRadius: 4, fontFamily: 'Space Mono, monospace', fontSize: '0.6rem', color: 'var(--ef-brand-text)', textAlign: 'center' }}>
              ✓ PRO PLAN ACTIVE
            </div>
          )}
        </nav>

        {/* Main */}
        <main className="flex-1 p-6">
          {/* Top bar with stats and search */}
          <div className={`${classes.panelBg} ${classes.border} p-4 rounded-md mb-6 flex items-center justify-between`} style={{ borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 0 20px rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{events.length}</div>
                <div className="text-xs text-slate-300">Total Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{tasks.filter(t => t.status === 'completed').length}</div>
                <div className="text-xs text-slate-300">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{conversations.filter(c => c.unread).length}</div>
                <div className="text-xs text-slate-300">Unread</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search..." className="dark-input pl-9 pr-4 py-2 rounded-md text-sm" />
              </div>
              <button
                onClick={() => setShowPricing(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.4rem 0.75rem', background: plan === 'pro' ? 'rgba(var(--ef-brand-rgb),0.12)' : 'rgba(var(--ef-brand-rgb),0.15)', border: '1px solid rgba(var(--ef-brand-rgb),0.3)', borderRadius: 4, color: 'var(--ef-brand-text)', fontFamily: 'Space Mono, monospace', fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}
              >
                <Zap size={11} /> {plan === 'pro' ? 'PRO' : 'UPGRADE'}
              </button>
            </div>
          </div>

          {/* XP strip — XP from completed tasks plus quest rewards */}
          <div className="panel-glass border border-white/5 rounded-md px-5 py-3 mb-6 flex items-center gap-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-xs text-slate-400 uppercase tracking-widest">Level</div>
              <div className="text-lg font-bold text-white">{Math.floor(totalXp / 150) + 1}</div>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${((totalXp % 150) / 150) * 100}%`, background: 'linear-gradient(90deg, var(--ef-brand-deep), var(--ef-brand-2))' }} />
              </div>
              <div className="text-xs text-slate-400">{totalXp} XP</div>
            </div>
            <div className="text-xs text-purple-300 font-semibold">Event Planner</div>
          </div>

          {/* Content */}
          <div>
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
                  <p className="text-sm text-slate-300">Overview of all your events and activities</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`${classes.panelBg} ${classes.border} p-6 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="flex justify-between items-center mb-5">
                      <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
                      {events.length >= 3 && plan === 'free' ? (
                        <ProGate plan={plan} feature="Unlimited events" onUpgrade={() => setShowPricing(true)} />
                      ) : (
                        <button onClick={() => setShowCreateEvent(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2 shadow-sm"><Plus size={14} />New</button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {enrichedEvents.length === 0 && (
                        <div className="text-center py-10">
                          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No events yet.</p>
                          <button onClick={() => setShowCreateEvent(true)} className="mt-3 px-4 py-2 rounded text-sm font-semibold text-white bg-purple-700 hover:bg-purple-600">Create your first event</button>
                        </div>
                      )}
                      {enrichedEvents.map(event => (
                        <div key={event.id} onClick={() => { setSelectedEventId(event.id); setShowEventDetail(true); }} className="border-2 rounded-md p-4 hover:shadow-md cursor-pointer transition-all" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'var(--surface-2)' }}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-white text-sm">{event.name}</h3>
                            <span className={`text-xs px-2 py-1 font-semibold ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{event.status}</span>
                          </div>
                          <div className="text-xs text-slate-300 mb-3 font-medium">{new Date(event.date).toLocaleDateString()} • {event.guests} guests</div>
                          <div className="w-full bg-white/5 h-2 rounded overflow-hidden"><div className="h-full" style={{ width: `${event.tasks ? (event.completed/event.tasks)*100 : 0}%`, background: NEON }} /></div>
                          <div className="text-xs text-slate-300 mt-2 font-medium">{event.completed}/{event.tasks} tasks completed</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <QuestBoard quests={quests} />

                    <div className={`${classes.panelBg} ${classes.border} p-6 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <h2 className="text-lg font-semibold text-white mb-5">High Priority Tasks</h2>
                      <div className="space-y-2">
                        {tasks.filter(t => t.priority === 'high' && t.status !== 'completed').map(task => (
                          <div key={task.id} onClick={() => { setSelectedTaskId(task.id); setShowTaskDetail(true); }} className="border-2 rounded-md p-4 hover:shadow-md cursor-pointer transition-all" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-red-600 mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-white text-sm">{task.title}</h3>
                                <p className="text-xs text-slate-300 mt-1 font-medium">{task.event}</p>
                                <span className="text-xs text-slate-300 font-medium">Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={`${classes.panelBg} ${classes.border} p-6 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <h2 className="text-lg font-semibold text-white mb-5">Recent Activity</h2>
                      <div className="space-y-4">
                        {(() => {
                          const items = [];
                          conversations.slice(0, 2).forEach(conv => {
                            if (conv.lastMessage) items.push({ avatar: conv.vendor.substring(0,2).toUpperCase(), color: 'bg-purple-700', text: `${conv.vendor}: ${conv.lastMessage}`, time: conv.time });
                          });
                          tasks.filter(t => t.status === 'completed').slice(0, 2).forEach(t => {
                            items.push({ avatar: '✓', color: 'bg-emerald-600', text: `Task completed: ${t.title}`, time: t.dueDate });
                          });
                          tasks.filter(t => t.status !== 'completed').slice(0, 1).forEach(t => {
                            items.push({ avatar: t.assignedTo?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '??', color: 'bg-blue-700', text: `${t.title} — ${t.status}`, time: t.dueDate });
                          });
                          if (items.length === 0) return <p className="text-sm" style={{ color: 'var(--text-3)' }}>No recent activity. Create events and tasks to see updates here.</p>;
                          return items.slice(0, 4).map((item, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className={`w-10 h-10 ${item.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0 rounded`}>{item.avatar}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-white font-semibold truncate">{item.text}</p>
                                <p className="text-xs text-slate-300 mt-1">{item.time}</p>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Client quotes from the RT Network builder */}
            {activeTab === 'quotes' && (
              <QuotesPanel classes={classes} onConvert={(q) => {
                const limit = checkLimit(plan, 'events', events.length);
                if (!limit.allowed) { alert(limit.reason); return; }
                const eventName = `${q.client_name} — ${q.event_type} (${q.ref})`;
                const schedule = buildScheduleForQuote(q);
                const newTasks = buildTasksForQuote(q, eventName);
                const newBudgetItems = buildBudgetItemsForQuote(q, eventName);
                setEvents(prev => [...prev, {
                  id: Math.max(0, ...prev.map(e => e.id)) + 1,
                  name: eventName,
                  date: q.event_date || new Date().toISOString().slice(0, 10),
                  type: q.event_type === 'wedding' ? 'Wedding' : q.event_type === 'corporate' ? 'Corporate' : 'Other',
                  location: 'TBD',
                  description: `Client quote ${q.ref} — ${q.client_email}${q.client_phone ? ` · ${q.client_phone}` : ''}`,
                  budget: q.budget || q.items.reduce((s, i) => s + i.amount_eur, 0),
                  spent: 0,
                  guests: q.guests, confirmed: 0, status: 'planning',
                  vendors: q.items.length, tasks: newTasks.length, completed: 0,
                  team: TEAM, schedule,
                }]);
                if (newTasks.length > 0) {
                  setTasks(prev => {
                    const base = Math.max(0, ...prev.map(t => t.id));
                    return [...prev, ...newTasks.map((t, i) => ({ ...t, id: base + i + 1 }))];
                  });
                }
                if (newBudgetItems.length > 0) {
                  setBudgetItems(prev => {
                    const base = Math.max(0, ...prev.map(b => b.id));
                    return [...prev, ...newBudgetItems.map((b, i) => ({ ...b, id: base + i + 1 }))];
                  });
                }
                alert(`Quote ${q.ref} converted — ${newTasks.length} task(s) assigned across your team, a ${schedule.length}-item run sheet, and ${newBudgetItems.length} budget line(s) added. See the Events tab.`);
              }} />
            )}

            {/* Onboard / manage the live provider catalog */}
            {activeTab === 'providers' && <ProvidersPanel classes={classes} />}

            {/* Pre-Flight constraint report */}
            {activeTab === 'preflight' && <PreflightPanel />}

            {/* Events list */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-white">Events</h1>
                  {events.length >= 3 && plan === 'free' ? (
                    <ProGate plan={plan} feature="Unlimited events" onUpgrade={() => setShowPricing(true)} />
                  ) : (
                    <button onClick={() => setShowCreateEvent(true)} className="bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold rounded flex items-center gap-2"><Plus size={16} />Create Event</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {enrichedEvents.length === 0 && (
                    <div className="col-span-3 text-center py-16">
                      <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>No events yet.</p>
                      <button onClick={() => setShowCreateEvent(true)} className="mt-3 px-5 py-2 rounded text-sm font-semibold text-white bg-purple-700 hover:bg-purple-600">Create your first event</button>
                    </div>
                  )}
                  {enrichedEvents.map(event => (
                    <div key={event.id} onClick={() => { setSelectedEventId(event.id); setShowEventDetail(true); }} className={`${classes.panelBg} ${classes.border} p-5 rounded-md cursor-pointer hover:shadow-lg`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{event.name}</h3>
                          <span className="text-xs text-slate-300">{event.type}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 font-semibold ${event.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{event.status}</span>
                      </div>
                      <div className="space-y-2 mb-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2"><Calendar size={14} />{new Date(event.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-2"><Users size={14} />{event.guests} guests</div>
                        <div className="flex items-center gap-2"><Euro size={14} />€{event.spent.toLocaleString()} / €{event.budget.toLocaleString()}</div>
                      </div>
                      <div className="rounded p-3" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'var(--surface-2)', border: '2px solid var(--border)' }}>
                        <div className="flex justify-between text-xs mb-2"><span className="text-slate-300">Progress</span><span className="font-semibold text-white">{event.tasks ? Math.round((event.completed/event.tasks)*100) : 0}%</span></div>
                        <div className="w-full bg-white/5 h-1.5 rounded overflow-hidden"><div className="h-full" style={{ width: `${event.tasks ? (event.completed/event.tasks)*100 : 0}%`, background: NEON }} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vendors */}
            {activeTab === 'vendors' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-white">Vendors</h1>
                <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex gap-3 mb-5">
                    <input type="text" placeholder="Search vendors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="dark-input flex-1 p-3 rounded-md" />
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="dark-input p-3 rounded-md">
                      <option>All</option>
                      <option>Catering</option>
                      <option>Entertainment</option>
                      <option>Florals</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredVendors.map(vendor => (
                      <div key={vendor.id} onClick={() => { setSelectedVendor(vendor); setShowVendorModal(true); }} className={`${classes.panelBg} ${classes.border} p-4 rounded-md cursor-pointer`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded">
                            <Star className="text-amber-400" size={12} />
                            <span className="text-xs font-semibold text-white">{vendor.rating}</span>
                          </div>
                          {vendor.booked && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 font-semibold rounded">Booked</span>}
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">{vendor.name}</h3>
                        <p className="text-xs text-purple-300 mb-3">{vendor.category}</p>
                        <div className="flex justify-between text-xs text-slate-300">
                          <span className="text-emerald-400 font-semibold">{vendor.price}</span>
                          <span>{vendor.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Venues */}
            {activeTab === 'venues' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-white">Venues</h1>

                {/* Live discovery panel */}
                <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)', boxShadow: neonBoxShadow }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--ef-grad-discover)', color: 'white' }}>
                      <Search size={12} /> Discover
                    </div>
                    <span className="text-sm text-slate-300">Find real venues anywhere via OpenStreetMap — free, no API key</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="City (e.g. Berlin, Dubai, Amsterdam)"
                      value={discoverCity}
                      onChange={e => setDiscoverCity(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleDiscover()}
                      className="dark-input flex-1 p-3 rounded-md"
                    />
                    <select
                      value={discoverCategory}
                      onChange={e => setDiscoverCategory(e.target.value)}
                      className="dark-input p-3 rounded-md"
                    >
                      {DISCOVER_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.replace(/\b\w/g, l => l.toUpperCase())}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleDiscover}
                      disabled={isDiscovering || !discoverCity.trim()}
                      className="px-5 py-3 rounded-md font-semibold text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      style={{ background: 'var(--ef-grad-discover)' }}
                    >
                      {isDiscovering ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      ) : <Search size={16} />}
                      {isDiscovering ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  {discoverError && (
                    <div className="text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md px-4 py-3 mb-4">{discoverError}</div>
                  )}

                  {discoverResults.length > 0 && (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-slate-300">{discoverResults.length} venues found in <span className="text-white font-semibold">{discoverCity}</span></p>
                        <button onClick={() => setDiscoverResults([])} className="text-xs text-slate-400 hover:text-white">Clear</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {discoverResults.map(v => (
                          <div key={v.osm_id} className="bg-slate-900 border-2 rounded-md p-4" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                            <h3 className="font-semibold text-white text-sm mb-1 leading-tight">{v.name}</h3>
                            {v.address?.road && <p className="text-xs text-slate-400 mb-1">{v.address.road}</p>}
                            <p className="text-xs text-purple-300 mb-2 capitalize">{v.category}</p>
                            <div className="space-y-1 text-xs text-slate-400 mb-3">
                              {v.phone && <div className="flex items-center gap-1">📞 {v.phone}</div>}
                              {v.website && /^https?:\/\//i.test(v.website) && (
                                <a href={v.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-purple-300 hover:text-purple-200 truncate">
                                  🌐 {v.website.replace(/^https?:\/\//, '')}
                                </a>
                              )}
                              {v.opening_hours && <div>🕐 {v.opening_hours}</div>}
                            </div>
                            <button
                              onClick={() => saveDiscoveredVenue(v)}
                              className="w-full text-xs py-1.5 rounded font-semibold text-white"
                              style={{ background: 'var(--ef-brand)' }}
                            >
                              + Save Venue
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Saved / hardcoded venues */}
                <div className={`${classes.panelBg} ${classes.border} p-5 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-white">Saved Venues</h2>
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="dark-input p-2 rounded-md text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredVenues.map(venue => (
                      <div key={venue.id} className={`${classes.panelBg} ${classes.border} p-4 rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded text-slate-300">
                            <Star size={12} />
                            <span className="text-xs font-semibold">{venue.rating || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {venue.booked && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 font-semibold rounded">Booked</span>}
                            <button onClick={() => { if (window.confirm('Remove this saved venue?')) setVenues(prev => prev.filter(v => v.id !== venue.id)); }} className="text-slate-500 hover:text-red-400 transition-colors text-xs" title="Remove">×</button>
                          </div>
                        </div>
                        <h3 className="text-base font-semibold text-white mb-1">{venue.name}</h3>
                        <p className="text-xs text-slate-300 mb-3 flex items-center gap-1"><MapPin size={12} />{venue.location}</p>
                        <div className="flex justify-between text-xs mb-3">
                          <span className="text-slate-300">Cap: {venue.capacity || 'TBD'}</span>
                          <span className="text-emerald-400 font-semibold">{venue.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {venue.amenities.slice(0, 2).map((amenity, idx) => (
                            <span key={idx} className="text-xs bg-white/5 text-slate-300 px-2 py-0.5 rounded">{amenity}</span>
                          ))}
                        </div>
                        <select
                          defaultValue=""
                          onChange={e => {
                            const eventName = e.target.value;
                            if (!eventName) return;
                            setVenues(prev => prev.map(v => v.id === venue.id ? { ...v, assignedEvent: eventName, booked: true } : v));
                            e.target.value = '';
                          }}
                          className="w-full text-xs dark-input rounded px-2 py-1.5"
                        >
                          <option value="">Assign to event...</option>
                          {events.map(ev => <option key={ev.id} value={ev.name}>{ev.name}</option>)}
                        </select>
                        {venue.assignedEvent && (
                          <p className="text-xs mt-1.5" style={{ color: 'var(--color-green)' }}>✓ {venue.assignedEvent}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-white mb-4">Messages</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Conversation List */}
                  <div className={`${classes.panelBg} ${classes.border} rounded-md`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="p-4 border-b-2 flex justify-between items-center" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <h2 className="font-semibold text-white">Conversations</h2>
                      <button onClick={() => setShowNewConversation(true)} className="p-1.5 rounded hover:bg-white/10 transition-colors" title="New conversation">
                        <Plus size={16} style={{ color: 'var(--accent)' }} />
                      </button>
                    </div>
                    {showNewConversation && (
                      <div className="p-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-3)' }}>Start conversation with:</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {vendors.filter(v => !conversations.some(c => c.vendor === v.name)).map(v => (
                            <button key={v.id} onClick={() => {
                              setConversations(prev => [...prev, { id: Date.now(), vendor: v.name, lastMessage: '', time: 'now', unread: false, messages: [] }]);
                              setSelectedConversation(conversations.length);
                              setShowNewConversation(false);
                            }} className="w-full text-left px-3 py-2 rounded text-sm transition-colors hover:bg-white/5" style={{ color: 'var(--text-1)' }}>
                              {v.name} <span className="text-xs" style={{ color: 'var(--text-3)' }}>· {v.category}</span>
                            </button>
                          ))}
                          {vendors.filter(v => !conversations.some(c => c.vendor === v.name)).length === 0 && (
                            <p className="text-xs px-3 py-2" style={{ color: 'var(--text-3)' }}>All vendors have conversations.</p>
                          )}
                        </div>
                        <button onClick={() => setShowNewConversation(false)} className="mt-2 text-xs" style={{ color: 'var(--text-3)' }}>Cancel</button>
                      </div>
                    )}
                    <div className="divide-y-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {conversations.map((conv, idx) => (
                        <div
                          key={conv.id}
                          onClick={() => setSelectedConversation(idx)}
                          className={`p-4 cursor-pointer hover:bg-white/5 transition-colors ${
                            selectedConversation === idx ? 'bg-white/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {conv.vendor.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="font-semibold text-white text-sm truncate">{conv.vendor}</h3>
                                <span className="text-xs text-slate-400">{conv.time}</span>
                              </div>
                              <p className={`text-xs truncate ${conv.unread ? 'text-white font-semibold' : 'text-slate-400'}`}>
                                {conv.lastMessage}
                              </p>
                            </div>
                            {conv.unread && <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Thread */}
                  <div className={`lg:col-span-2 ${classes.panelBg} ${classes.border} rounded-md flex flex-col`} style={{ borderColor: 'rgba(255,255,255,0.08)', height: '600px' }}>
                    <div className="p-4 border-b-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <h2 className="font-semibold text-white">{conversations[selectedConversation]?.vendor}</h2>
                      <p className="text-xs text-slate-400 mt-1">Vendor Communication</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {conversations[selectedConversation]?.messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${msg.sender === 'me' ? 'bg-purple-700' : 'bg-white/5'} rounded-lg p-3`}>
                            <p className="text-sm text-white">{msg.text}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {msg.attachments.map((file, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs text-purple-200 bg-purple-800 rounded px-2 py-1">
                                    <Paperclip size={12} />
                                    <span>{file}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-slate-300 mt-1">{msg.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/5 rounded">
                          <Paperclip size={18} className="text-slate-300" />
                        </button>
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type your message..."
                          className="dark-input flex-1 p-2 rounded-md"
                        />
                        <button
                          onClick={() => {
                            if (messageInput.trim()) {
                              const newMsg = { sender: 'me', text: messageInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), attachments: [] };
                              setConversations(prev => prev.map((c, i) => i === selectedConversation
                                ? { ...c, messages: [...c.messages, newMsg], lastMessage: messageInput, unread: false }
                                : c
                              ));
                              setMessageInput('');
                            }
                          }}
                          className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-2"
                        >
                          <Send size={14} /> Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Clients */}
            {activeTab === 'clients' && (
              <ClientListView />
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Settings</h1>

                {/* Appearance */}
                <div className="panel-glass glass-border rounded-lg p-5" style={{ borderTop: '2px solid var(--accent)' }}>
                  <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-2)' }}>APPEARANCE</h2>
                  <div className="flex gap-3">
                    {['dark','light'].map(t => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className="px-5 py-2 rounded-md text-sm font-semibold transition-all"
                        style={{
                          background: theme === t ? 'var(--accent)' : 'var(--surface-3)',
                          color: theme === t ? '#fff' : 'var(--text-2)',
                          border: `1px solid ${theme === t ? 'var(--accent)' : 'var(--border)'}`,
                        }}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI / API Keys */}
                <div className="panel-glass glass-border rounded-lg p-5">
                  <h2 className="text-sm font-bold mb-1" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-2)' }}>AI / API KEYS</h2>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>Used for AI event generation. Keys are stored locally in your browser only.</p>
                  <div className="space-y-4">
                    {[
                      { label: 'Groq API Key', key: 'groq_api_key', placeholder: 'gsk_...', hint: 'Free at console.groq.com' },
                      { label: 'OpenRouter API Key', key: 'openrouter_api_key', placeholder: 'sk-or-...', hint: 'Free models available at openrouter.ai' },
                      { label: 'RT Admin API Token', key: 'rt_admin_token', placeholder: 'hex…', hint: 'Matches the ADMIN_TOKEN Pages secret — enables the Quotes tab' },
                    ].map(({ label, key, placeholder, hint }) => {
                      const val = localStorage.getItem(key) || '';
                      return (
                        <div key={key}>
                          <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>{label}</label>
                          <p className="text-xs mb-2" style={{ color: 'var(--text-3)' }}>{hint}</p>
                          <div className="flex gap-2">
                            <input
                              type="password"
                              defaultValue={val}
                              placeholder={placeholder}
                              id={`setting-${key}`}
                              className="flex-1 dark-input rounded-md px-3 py-2 text-sm"
                            />
                            <button
                              onClick={() => {
                                const v = document.getElementById(`setting-${key}`)?.value || '';
                                if (v) { localStorage.setItem(key, v); alert(`${label} saved.`); }
                                else { localStorage.removeItem(key); alert(`${label} cleared.`); }
                              }}
                              className="px-3 py-2 rounded-md text-sm font-semibold"
                              style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Plan */}
                <div className="panel-glass glass-border rounded-lg p-5">
                  <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-2)' }}>PLAN</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-1)' }}>{plan === 'pro' ? 'Solo Plan' : 'Free Plan'}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>{plan === 'pro' ? 'All features unlocked.' : '3 events, 3 clients, 50 guests — upgrade to remove limits.'}</div>
                    </div>
                    {plan === 'free' && (
                      <button onClick={() => setShowPricing(true)} className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-purple-700 hover:bg-purple-600 flex items-center gap-2">
                        <Zap size={14} /> Upgrade
                      </button>
                    )}
                    {plan === 'pro' && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>✓ PRO</span>
                    )}
                  </div>
                </div>

                {/* Data */}
                <div className="panel-glass glass-border rounded-lg p-5">
                  <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-2)' }}>DATA</h2>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--text-1)' }}>Start clean workspace</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>Remove the demo events, vendors and guests and start empty. Plan and API keys are kept. ("Reset all data" below restores the demo content instead.)</div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Clear the demo data and start with an empty workspace?')) {
                          localStorage.setItem('ef_workspace', 'clean');
                          ['ef_events','ef_vendors','ef_venues','ef_convos','ef_tasks','ef_budget','ef_guests','ef_clients'].forEach(k => localStorage.setItem(k, '[]'));
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap"
                      style={{ background: 'var(--surface-3)', color: 'var(--text-1)' }}
                    >
                      Start clean
                    </button>
                  </div>
                </div>

                {/* App Info */}
                <div className="panel-glass glass-border rounded-lg p-5">
                  <h2 className="text-sm font-bold mb-3" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', color: 'var(--text-2)' }}>APP INFO</h2>
                  <div className="text-xs space-y-1" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    <div>RT Network CRM — Rising Tide Collective</div>
                    <div>Data stored locally in browser</div>
                    <div>Bookmark this page — the operator CRM lives at <span className="text-purple-300">#ops</span>, client requests go to the root URL</div>
                    <div>
                      <button onClick={() => { if (window.confirm('Reset all data? This cannot be undone.')) { localStorage.clear(); window.location.reload(); } }} className="text-red-400 hover:text-red-300 mt-2">
                        Reset all data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals rendered at root so they overlay everything */}
      {showCreateEvent && <CreateEventModal onClose={() => setShowCreateEvent(false)} events={events} setEvents={setEvents} plan={plan} classes={classes} />}
      {showTaskDetail && <TaskDetailModal task={selectedTask} onClose={() => setShowTaskDetail(false)} setTasks={setTasks} classes={classes} />}
      {showEventDetail && <EventDetailView event={selectedEvent} onClose={() => setShowEventDetail(false)} />}

      {/* Vendor modal */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--overlay)', backdropFilter: 'blur(8px)' }}>
          <div className="panel-glass glass-border rounded-2xl w-full max-w-lg p-6" style={{ boxShadow: 'var(--glow-md)', borderTop: '2px solid var(--accent)' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-1)' }}>{selectedVendor.name}</h3>
                <p className="text-xs mt-0.5 text-purple-300">{selectedVendor.category}</p>
              </div>
              <button onClick={() => setShowVendorModal(false)}><X size={18} style={{ color: 'var(--text-2)' }} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
              {[
                ['Location', selectedVendor.location],
                ['Rating', `${selectedVendor.rating} / 5`],
                ['Price Range', selectedVendor.price],
                ['Reviews', `${selectedVendor.reviews} reviews`],
                ['Status', selectedVendor.booked ? 'Booked' : 'Available'],
                ['Last Contact', selectedVendor.lastContact],
              ].map(([label, value]) => (
                <div key={label} className="p-3 rounded-md" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="text-xs mb-1" style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{label.toUpperCase()}</div>
                  <div className="font-semibold" style={{ color: 'var(--text-1)' }}>{value}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setVendors(prev => prev.map(v => v.id === selectedVendor.id ? { ...v, booked: !v.booked } : v));
                  setShowVendorModal(false);
                }}
                className="flex-1 py-2 rounded-md text-sm font-semibold text-white bg-purple-700 hover:bg-purple-600"
              >
                {selectedVendor.booked ? 'Mark Available' : 'Mark as Booked'}
              </button>
              <button onClick={() => setShowVendorModal(false)} className="px-4 py-2 rounded-md text-sm font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {showAddBudgetModal && selectedEvent && (
        <AddBudgetModal eventName={selectedEvent.name} onClose={() => setShowAddBudgetModal(false)} />
      )}

      {/* Add Guest Modal */}
      {showAddGuestModal && selectedEvent && (
        <AddGuestModal eventName={selectedEvent.name} onClose={() => setShowAddGuestModal(false)} />
      )}

      {/* Add Schedule Modal */}
      {showAddScheduleModal && selectedEvent && (
        <AddScheduleModal eventName={selectedEvent.name} onClose={() => setShowAddScheduleModal(false)} />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && selectedEvent && (
        <AddTaskModal eventName={selectedEvent.name} onClose={() => setShowAddTaskModal(false)} />
      )}

      {/* Add Client Modal */}
      {showAddClientModal && <AddClientModal onClose={() => setShowAddClientModal(false)} />}

      {/* Client Detail Modal */}
      {showClientDetailModal && selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setShowClientDetailModal(false)} />}

      {/* Pricing modal */}
      {showPricing && (
        <PricingModal
          onClose={() => setShowPricing(false)}
          onUpgrade={(planId) => {
            if (planId === 'solo' || planId === 'agency') {
              // TODO: wire to Stripe / payment — for now simulate upgrade
              setPlan('pro');
              setShowPricing(false);
            }
          }}
        />
      )}

    </div>
  );
}
