/* Deterministic run-of-show generator — no AI. Same inputs, same schedule.
   Times derive from event type + duration; blocks derive from the selected
   package. Owners use catalog kinds so the operator can map to providers. */

const START_BY_TYPE = { wedding: 15 * 60, corporate: 18 * 60, party: 20 * 60 };

function hhmm(mins) {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function buildRunOfShow({ eventType = 'party', hours = 5, guests = 0, selections = {}, staffCount = 1, venueName = 'Venue' }) {
  const start = START_BY_TYPE[eventType] ?? 19 * 60;
  const end = start + hours * 60;
  const rows = [];
  const add = (t, title, owner) => rows.push({ t, title, owner });

  add(start - 120, `Crew call — setup & load-in at ${venueName}`, selections.staff ? `Event crew (×${staffCount})` : 'Organizer');
  if (selections.dj_av) add(start - 90, 'Sound & light check', 'DJ / AV');
  if (selections.catering) add(start - 60, 'Catering setup', 'Caterer');
  add(start, `Doors — guest arrival${guests ? ` (${guests} expected)` : ''}`, 'Registration / door');

  if (eventType === 'wedding') {
    add(start + 45, 'Ceremony / welcome moment', 'Organizer');
    if (selections.catering) add(start + 90, 'Dinner service begins', 'Caterer');
    add(start + 150, 'Speeches & toasts', 'Organizer');
    if (selections.dj_av) add(start + 195, 'First dance → DJ set opens', 'DJ / AV');
  } else if (eventType === 'corporate') {
    add(start + 30, 'Welcome address', 'Organizer');
    if (selections.catering) add(start + 60, 'Dinner / buffet service', 'Caterer');
    add(start + 120, 'Program / speeches', 'Organizer');
    if (selections.dj_av) add(start + 150, 'Music & networking', 'DJ / AV');
  } else {
    if (selections.catering) add(start + 30, 'Food service opens', 'Caterer');
    if (selections.dj_av) add(start + 60, 'DJ set opens', 'DJ / AV');
  }

  if (selections.photo) add(start + 60, 'Photo coverage window', 'Photography');
  add(end - 30, 'Last call', selections.staff ? 'Event crew' : 'Organizer');
  add(end, 'Event ends — guest farewell', 'Registration / door');
  add(end + 60, 'Breakdown & load-out complete', selections.staff ? `Event crew (×${staffCount})` : 'Organizer');

  // Sort on absolute minutes so schedules crossing midnight stay in
  // chronological order (01:00 load-out sorts after 20:00 doors).
  return rows.sort((a, b) => a.t - b.t).map(({ t, title, owner }) => ({ time: hhmm(t), title, owner }));
}
