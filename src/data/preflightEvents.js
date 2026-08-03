/* JS mirror of the two pilot event schemas — kept in lockstep with
   agents/event_ops/schemas/global_ai_berlin.py and lilium_berlin.py.
   `constraints` are fixed policy (ceilings, coverage minimums) edited by
   changing this file; `data` (roster, committed spend) is what the
   Pre-Flight tab lets the operator edit live, seeded from BASE_DATA below
   and persisted per-event in localStorage from there. */

export const GAIB_BASE_DATA = {
  event_id: 'GAIB-PILOT',
  event_name: 'Global AI Berlin — Pilot Event',
  event_type: 'corporate_party',
  date: '2026-07-18',
  expected_attendees: 120,
  budget: { committed_spend: { venue: 0, av_equipment: 0, catering: 0, misc: 0 } },
  staffing: {
    volunteer_roster: [
      { name: 'Athar', role: ['registration_desk', 'audio_mic'], availability: '17:00-21:30' },
      { name: 'Cherry', role: 'registration_desk', availability: '17:00-19:00' },
    ],
  },
  av_equipment: {
    items: [
      { id: 'mic_01', type: 'wireless_mic', requires: ['stand_01', 'cable_01', 'battery_backup_01'], assignments: [] },
      { id: 'speaker_01', type: 'PA_speaker', requires: ['cable_02'], assignments: [] },
      { id: 'stand_01', type: 'mic_stand', requires: [], assignments: [] },
      { id: 'cable_01', type: 'xlr_cable', requires: [], assignments: [] },
      { id: 'battery_backup_01', type: 'aa_battery_set', requires: [], assignments: [] },
      { id: 'cable_02', type: 'speaker_cable', requires: [], assignments: [] },
    ],
  },
};

export const GAIB_CONSTRAINTS = {
  budget: {
    total_ceiling: 3000,
    hard_stop_threshold_eur: 3200,
    category_ceilings: { venue: 1200, av_equipment: 600, catering: 800, misc: 400 },
  },
  staffing: {
    roles: [
      { role: 'registration_desk', min_coverage: 2, shift_windows: ['17:00-19:00'] },
      { role: 'audio_mic', min_coverage: 1, shift_windows: ['17:30-21:00'] },
    ],
  },
  av: { conflict_check: 'flag_if_same_item_id_booked_twice_same_window' },
};

export const LILIUM_BASE_DATA = {
  event_id: 'LILIUM-PILOT',
  event_name: 'Lilium Berlin — Pilot Event',
  event_type: 'venue_event',
  date: 'REPLACE_WITH_ACTUAL_DATE',
  expected_attendees: 150,
  venue: {
    address: 'Pfuelstr. 5, 10997 Berlin', capacity_standing: 300, capacity_seated: 150,
    indoor_sqm: 500, outdoor_sqm: 250, ceiling_m: 3.10,
    in_house: ['full_service_bar', 'storage', 'fridges', 'wardrobe', 'restrooms', 'grand_piano', 'heating', 'high_current_power'],
    partnerships: ['catering'],
    // FluxBau confirmed via its own booking PDF (2026-07-07): same address,
    // separate 550sqm/2-floor venue + 120sqm terrace. That PDF's only hard
    // number is a 90-guest seated wedding layout — no combined-event cap
    // is confirmed with either venue.
    co_rental: 'FluxBau — same address (Pfuelstr. 5), separate 550sqm venue + 120sqm Spree terrace; combined-event guest cap not yet confirmed',
  },
  budget: { committed_spend: { venue: 0, av_equipment: 0, catering: 0, misc: 0 } },
  staffing: {
    volunteer_roster: [
      { name: 'REPLACE', role: 'door_registration', availability: '18:00-20:00' },
      { name: 'REPLACE', role: 'door_registration', availability: '18:00-20:00' },
      { name: 'REPLACE', role: 'audio_mic', availability: '18:30-22:00' },
    ],
  },
  av_equipment: {
    items: [
      { id: 'mic_01', type: 'wireless_mic', requires: ['stand_01', 'cable_01', 'battery_backup_01'], assignments: [] },
      { id: 'speaker_01', type: 'PA_speaker', requires: ['cable_02'], assignments: [] },
      { id: 'stand_01', type: 'mic_stand', requires: [], assignments: [] },
      { id: 'cable_01', type: 'xlr_cable', requires: [], assignments: [] },
      { id: 'battery_backup_01', type: 'aa_battery_set', requires: [], assignments: [] },
      { id: 'cable_02', type: 'speaker_cable', requires: [], assignments: [] },
    ],
  },
};

export const LILIUM_CONSTRAINTS = {
  capacity: { max_attendees: 150 },
  budget: {
    total_ceiling: 3000,
    hard_stop_threshold_eur: 3200,
    category_ceilings: { venue: 1200, av_equipment: 600, catering: 800, misc: 400 },
  },
  staffing: {
    roles: [
      { role: 'door_registration', min_coverage: 2, shift_windows: ['18:00-20:00'] },
      { role: 'audio_mic', min_coverage: 1, shift_windows: ['18:30-22:00'] },
    ],
  },
  av: { conflict_check: 'flag_if_same_item_id_booked_twice_same_window' },
};

export const PREFLIGHT_EVENTS = [
  { id: 'gaib', label: 'Global AI Berlin', storageKey: 'ef_preflight_gaib_data', baseData: GAIB_BASE_DATA, constraints: GAIB_CONSTRAINTS },
  { id: 'lilium', label: 'Lilium Berlin', storageKey: 'ef_preflight_lilium_data', baseData: LILIUM_BASE_DATA, constraints: LILIUM_CONSTRAINTS },
];
