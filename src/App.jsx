{/* -------------------- Gantt / Run Sheet View -------------------- */}
{activeEventTab === 'schedule' && selectedEvent != null && (
  (() => {
    try {
      // Local schedule state
      const [localSchedule, setLocalSchedule] = React.useState([]);
      const [showGanttEditModal, setShowGanttEditModal] = React.useState(false);
      const [editingItem, setEditingItem] = React.useState(null);

      // Initialize from selectedEvent safely
      React.useEffect(() => {
        if (selectedEvent?.schedule?.length) {
          setLocalSchedule(selectedEvent.schedule);
        } else {
          setLocalSchedule([]);
        }
      }, [selectedEvent]);

      // Neon helpers (already declared in parent scope)
      const NEON = '#A020F0';
      const neonBoxShadow = `0 6px 30px -6px ${NEON}, 0 0 20px 2px ${NEON}55`;

      // Sample data fallback
      const data = localSchedule?.length
        ? localSchedule
        : [
            { time: '09:00 AM', title: 'Venue Setup', duration: '2 hours', assigned: 'Setup Crew', category: 'Setup' },
            { time: '05:00 PM', title: 'Guest Arrival', duration: '1 hour', assigned: 'Reception Team', category: 'Reception' },
            { time: '06:00 PM', title: 'Cocktail Hour', duration: '1 hour', assigned: 'Catering Staff', category: 'Catering' },
            { time: '07:00 PM', title: 'Dinner Service', duration: '2 hours', assigned: 'Elegant Catering', category: 'Catering' },
            { time: '09:00 PM', title: 'Entertainment Begins', duration: '3 hours', assigned: 'Harmony DJ', category: 'Entertainment' },
            { time: '12:00 AM', title: 'Event Wrap-up', duration: '1 hour', assigned: 'Full Team', category: 'Wrap-up' }
          ];

      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Gantt Chart / Run Sheet</h2>
            <button
              onClick={() => setShowAddScheduleModal(true)}
              className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm"
              title="Add new schedule item"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>

          {/* Dual-panel layout */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left list */}
            <div className="w-full md:w-1/3 space-y-2">
              {data.map((it, idx) => (
                <div
                  key={idx}
                  className={`${classes.panelBg} ${classes.border} p-3 rounded-md transition-all hover:shadow-lg`}
                  style={{ borderColor: '#2b2b2b' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-purple-300 font-bold">{it.time}</div>
                      <div className="text-white font-semibold">{it.title}</div>
                      <div className="text-slate-400 text-xs">
                        {it.duration} • {it.assigned}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingItem(it);
                        setShowGanttEditModal(true);
                      }}
                      className="p-1 hover:bg-slate-700 rounded"
                      title="Edit this item"
                    >
                      <Edit size={14} className="text-slate-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right time-based chart */}
            <div className="flex-1 overflow-x-auto relative h-64 bg-slate-800 rounded-lg border border-slate-700">
              {/* Time ruler */}
              <div className="absolute top-0 left-0 w-full flex justify-between text-xs text-slate-400 p-2">
                {['09 AM', '12 PM', '03 PM', '06 PM', '09 PM', '12 AM'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>

              {/* Activity bars */}
              <div className="absolute inset-0 mt-5 space-y-3 p-4">
                {data.map((it, idx) => (
                  <div
                    key={idx}
                    className="relative group"
                    title={`${it.title} — ${it.duration}`}
                  >
                    <div
                      className="h-6 rounded-md cursor-pointer transition-all duration-200"
                      style={{
                        width: `${Math.min(parseInt(it.duration) * 20 || 40, 100)}%`,
                        backgroundColor: '#A020F0aa',
                        boxShadow: neonBoxShadow
                      }}
                    />
                    <div className="absolute hidden group-hover:flex top-7 left-0 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg border border-slate-700 z-10 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold">{it.title}</span>
                        <span>{it.time} • {it.duration}</span>
                        <span className="text-slate-400">{it.assigned}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          {showGanttEditModal && editingItem && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
              <div
                className={`${classes.panelBg} ${classes.border} rounded-xl p-6 w-[95%] max-w-md`}
                style={{ boxShadow: neonBoxShadow, borderColor: '#2b2b2b' }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Edit Schedule Item</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingItem) return;
                    setLocalSchedule((prev) =>
                      prev.map((s) =>
                        s.title === editingItem.title ? { ...editingItem } : s
                      )
                    );
                    // Optional sync to global event
                    if (selectedEvent) {
                      setEvents((prev) =>
                        prev.map((ev) =>
                          ev.id === selectedEvent.id
                            ? { ...ev, schedule: localSchedule }
                            : ev
                        )
                      );
                    }
                    setShowGanttEditModal(false);
                  }}
                  className="space-y-4"
                >
                  {/* Title */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={editingItem.title || ''}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Assigned */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Assigned To</label>
                    <input
                      type="text"
                      value={editingItem.assigned || ''}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, assigned: e.target.value }))
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Start Time</label>
                    <input
                      type="text"
                      value={editingItem.time || ''}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, time: e.target.value }))
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Duration</label>
                    <input
                      type="text"
                      value={editingItem.duration || ''}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, duration: e.target.value }))
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Category</label>
                    <select
                      value={editingItem.category || 'Setup'}
                      onChange={(e) =>
                        setEditingItem((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option>Setup</option>
                      <option>Reception</option>
                      <option>Catering</option>
                      <option>Entertainment</option>
                      <option>Wrap-up</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowGanttEditModal(false)}
                      className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-purple-700 hover:bg-purple-600 text-white text-sm shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    } catch (err) {
      console.error('Schedule render error:', err);
      return (
        <div className="text-red-400 text-sm p-6">
          Error rendering schedule. Check console for details.
        </div>
      );
    }
  })()
)}
