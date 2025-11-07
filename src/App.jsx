{activeEventTab === 'schedule' && (
  (() => {
    // Helper: parse "07:00 PM" or "09:00 AM" into a numeric hour (0-23)
    const parseHour24 = (t) => {
      if (!t) return 9; // default
      const raw = t.trim();
      const m = raw.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
      if (!m) return 9;
      let h = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      const ampm = (m[3] || '').toLowerCase();
      if (ampm === 'pm' && h !== 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      // include minutes as fraction
      return h + (mm / 60);
    };

    // Timeline defs
    const TIMELINE_START_HOUR = 9; // 09:00
    const TIMELINE_END_HOUR = 24; // 00:00 as 24
    const TIMELINE_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR; // 15, treat 00 as 24 => 15? we'll keep 16 range by using 9->24 = 15 actually 9..24 = 15, to visually match earlier use we use 15-16; math below uses TIMELINE_HOURS

    // Source: either event.schedule or fallback sample
    const scheduleData = (event?.schedule && event.schedule.length) ? event.schedule : [
      { time: '09:00 AM', title: 'Venue Setup', duration: '2 hours', assigned: 'Setup Crew', category: 'Setup' },
      { time: '05:00 PM', title: 'Guest Arrival', duration: '1 hour', assigned: 'Reception Team', category: 'Reception' },
      { time: '06:00 PM', title: 'Cocktail Hour', duration: '1 hour', assigned: 'Catering Staff', category: 'Catering' },
      { time: '07:00 PM', title: 'Dinner Service', duration: '2 hours', assigned: 'Elegant Catering', category: 'Catering' },
      { time: '09:00 PM', title: 'Entertainment Begins', duration: '3 hours', assigned: 'Harmony DJ', category: 'Entertainment' },
      { time: '12:00 AM', title: 'Event Wrap-up', duration: '1 hour', assigned: 'Full Team', category: 'Wrap-up' }
    ];

    // Normalize duration string -> number of hours (fallback to 1)
    const parseDurationHours = (d) => {
      if (!d && d !== 0) return 1;
      const m = String(d).match(/(\d+(\.\d+)?)/);
      return m ? Number(m[1]) : 1;
    };

    // Colors by category
    const categoryColors = {
      'Setup': '#9333ea',
      'Reception': '#38bdf8',
      'Catering': '#22c55e',
      'Entertainment': '#a855f7',
      'Wrap-up': '#ef4444',
      'default': '#64748b'
    };

    // Pre-compute derived fields
    const normalized = scheduleData.map((it, idx) => {
      const parsedStart = parseHour24(it.time);
      // convert midnight as 0 -> 24 (so 00:00 becomes 24)
      const startHour = parsedStart === 0 ? 24 : parsedStart;
      // compute "hours since TIMELINE_START_HOUR"
      const startOffset = startHour - TIMELINE_START_HOUR;
      const durationH = parseDurationHours(it.duration);
      const endHour = startHour + durationH;
      return {
        ...it,
        _startHour: startHour,
        _startOffset: startOffset,
        _dur: durationH,
        _endHour: endHour,
        _color: categoryColors[it.category] || categoryColors['default'],
        _idx: idx
      };
    });

    // Timeline ticks (labels shown across top)
    const ticks = [];
    for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) {
      // format as "09:00", "10:00", ..., "00:00"
      let label = h;
      if (h === 24) label = 0;
      const hh = String(label).padStart(2, '0') + ':00';
      ticks.push(hh);
    }

    // Render the dual panel (left list + right timeline)
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Gantt / Run Sheet</h2>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 hidden md:block">Hover rows or bars for details</div>
            <button
              onClick={() => setShowAddScheduleModal(true)}
              className="bg-purple-700 hover:bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-2 text-sm"
              title="Add schedule item"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${classes.panelBg} ${classes.border} p-3 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
            <div className="text-sm text-slate-400">Total Activities</div>
            <div className="text-lg font-bold text-white">{normalized.length}</div>
          </div>
          <div className={`${classes.panelBg} ${classes.border} p-3 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
            <div className="text-sm text-slate-400">Start</div>
            <div className="text-lg font-bold text-emerald-400">09:00</div>
          </div>
          <div className={`${classes.panelBg} ${classes.border} p-3 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
            <div className="text-sm text-slate-400">End</div>
            <div className="text-lg font-bold text-emerald-400">00:00</div>
          </div>
          <div className={`${classes.panelBg} ${classes.border} p-3 rounded-md`} style={{ borderColor: '#2b2b2b' }}>
            <div className="text-sm text-slate-400">Visible Range</div>
            <div className="text-lg font-bold text-purple-400">{TIMELINE_HOURS} hrs</div>
          </div>
        </div>

        {/* Dual panel */}
        <div className="flex gap-4">
          {/* Left column (list) */}
          <div className={`${classes.panelBg} ${classes.border} rounded-md overflow-hidden`} style={{ borderColor: '#2b2b2b', minWidth: 320 }}>
            <div className="px-4 py-3 border-b-2" style={{ borderColor: '#2b2b2b' }}>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-300 font-semibold">Activity</div>
                <div className="text-xs text-slate-400">Assigned • Duration</div>
              </div>
            </div>

            <div className="divide-y" style={{ borderColor: '#1f2937' }}>
              {normalized.map((it) => (
                // group ties left row + right bar hover states together
                <div key={it._idx} className="group flex items-center px-4 py-3 hover:bg-slate-800 cursor-default">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-white truncate">{it.title}</div>
                      <div className="text-[11px] px-2 py-0.5 rounded text-slate-200" style={{ background: '#111827' }}>{it.category || 'General'}</div>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span title="Start time"><Calendar size={12} className="inline" /> {it.time}</span>
                      <span title="Duration">{it.duration}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 ml-3 mr-2 hidden sm:block">{it.assigned}</div>

                  <div className="ml-2">
                    <button title="Edit schedule item" className="p-1 rounded hover:bg-slate-700" onClick={() => { setSelectedTask(it); setShowTaskDetail(true); }}>
                      <Edit size={16} className="text-slate-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column (timeline) */}
          <div className="flex-1 overflow-x-auto">
            <div className={`${classes.panelBg} ${classes.border} rounded-md p-3`} style={{ borderColor: '#2b2b2b', minWidth: 900, boxShadow: neonBoxShadow }}>
              {/* timeline ruler */}
              <div className="mb-3">
                <div className="flex text-xs text-slate-400">
                  {ticks.map((t, i) => (
                    <div key={i} className="flex-1 text-center border-r" style={{ borderColor: '#1f2937', minWidth: 56 }}>{t}</div>
                  ))}
                </div>
              </div>

              {/* rows with bars (left list is separate above) */}
              <div className="space-y-3">
                {normalized.map((it) => {
                  // clamp start within visible range
                  const start = Math.max(0, it._startOffset);
                  // If item starts before visible start, clamp width and offset
                  const visibleStart = start;
                  const visibleDur = Math.max(0, Math.min(it._dur, TIMELINE_HOURS - visibleStart));
                  const leftPct = (visibleStart / TIMELINE_HOURS) * 100;
                  const widthPct = (visibleDur / TIMELINE_HOURS) * 100;
                  return (
                    <div key={it._idx} className="relative h-12 flex items-center group">
                      {/* background row guide */}
                      <div className="absolute inset-0 flex">
                        {Array.from({ length: TIMELINE_HOURS }).map((_, col) => (
                          <div key={col} className="flex-1 h-full border-r" style={{ borderColor: '#0f1724', minWidth: 56 }}></div>
                        ))}
                      </div>

                      {/* bar */}
                      <div
                        className="relative h-8 rounded-md flex items-center px-3 text-xs text-white shadow-sm cursor-pointer"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          background: it._color,
                          boxShadow: `0 6px 20px -8px ${it._color}88`,
                          transition: 'transform 150ms ease'
                        }}
                        title={`${it.title} — ${it.time} • ${it.duration}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="truncate pr-2">{it.title}</div>
                          <div className="text-[11px] opacity-90">{it._dur}h</div>
                        </div>

                        {/* floating tooltip (appears above the bar on hover) */}
                        <div className="pointer-events-none absolute -top-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <div className={`${classes.panelBg} ${classes.border} rounded-md p-3 text-xs`} style={{ boxShadow: neonBoxShadow, borderColor: '#2b2b2b', minWidth: 220 }}>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <div className="text-sm font-semibold text-white">{it.title}</div>
                                <div className="text-xs text-slate-300 mt-1">{it.time} — { (it._endHour % 24).toString().padStart(2,'0') }:00</div>
                              </div>
                              <div className="text-xs text-slate-300 text-right">
                                <div>{it.duration}</div>
                                <div className="mt-2 font-semibold text-white">{it.assigned}</div>
                              </div>
                            </div>
                            <div className="mt-2 text-[12px] text-slate-400">{it.category || 'General'}</div>
                          </div>
                        </div>

                        {/* small affordance edit icon visible on group hover */}
                        <button
                          onClick={() => { setSelectedTask(it); setShowTaskDetail(true); }}
                          className="absolute right-2 opacity-0 group-hover:opacity-100 bg-slate-800 hover:bg-slate-700 p-1 rounded transition"
                          title="Edit this schedule item"
                        >
                          <Edit size={14} className="text-slate-200" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* "Now" vertical marker (example placed at 19:30 -> compute if you want dynamic) */}
              <div
                aria-hidden
                className="absolute top-14 left-1/2 h-full hidden md:block"
                style={{
                  left: `${((new Date().getHours() + (new Date().getMinutes()/60)) - TIMELINE_START_HOUR) / TIMELINE_HOURS * 100}%`,
                  width: 2,
                  background: NEON,
                  boxShadow: `0 0 10px ${NEON}88`,
                  height: 'calc(100% - 2rem)',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-300">
          {Object.entries(categoryColors).map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
              <span className="capitalize">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  })()
)}
