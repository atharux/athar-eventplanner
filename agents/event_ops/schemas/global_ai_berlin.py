"""Global AI Berlin — pilot event constraint schema.

Event instance data for the shared deterministic engine (see engine.py);
the core reference implementation is never modified.

Constraint figures supplied by the operator (pilot spec, 2026-07-04):
- budget: 3000 EUR planned ceiling, 3200 EUR absolute hard stop,
  category ceilings venue/av_equipment/catering/misc
- staffing: registration_desk x2 (17:00-19:00), audio_mic x1 (17:30-21:00)
- AV: per-instance gear with instance-level dependency lists; conflict
  check flags the same item id booked twice in overlapping windows

Roster and date confirmed 2026-07-04: corporate-party pilot on 2026-07-18,
volunteers Athar (registration + audio) and Cherry (registration).
Catering is required — commit spend under budget.committed_spend.catering
as bookings land.

Run deterministic validation (no AI layer fires):

    python3 agents/event_ops/schemas/global_ai_berlin.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from engine import EventConstraintEngine, run_and_print  # noqa: E402

# Backwards-compatible alias — earlier consumers import this name.
GlobalAIBerlinConstraints = EventConstraintEngine

GLOBAL_AI_BERLIN_INPUT = {
    "version": "1.0",
    "data": {
        "event_id": "GAIB-PILOT",
        "event_name": "Global AI Berlin — Pilot Event",
        "event_type": "corporate_party",
        "date": "2026-07-18",
        "expected_attendees": 120,

        # ---- BUDGET: committed spend so far, per category (EUR) ----
        # Update these as commitments land; checks re-run deterministically.
        "budget": {
            "committed_spend": {
                "venue": 0,
                "av_equipment": 0,
                "catering": 0,
                "misc": 0,
            }
        },

        # ---- STAFFING: volunteer roster with role(s) + availability ----
        # role may be a string or list; availability "HH:MM-HH:MM" or list.
        "staffing": {
            "volunteer_roster": [
                # Athar covers both roles (registration + audio); the
                # 17:30-19:00 overlap needs a desk handoff when the audio
                # shift starts — Cherry holds the desk solo in that window.
                {"name": "Athar",  "role": ["registration_desk", "audio_mic"], "availability": "17:00-21:30"},
                {"name": "Cherry", "role": "registration_desk", "availability": "17:00-19:00"},
            ]
        },

        # ---- AV / EQUIPMENT: per-instance gear list ----
        # Each instance is one physical unit. "requires" lists the instance
        # ids that must also be present. "assignments" (optional) books the
        # unit into time windows for conflict detection.
        "av_equipment": {
            "items": [
                {"id": "mic_01",     "type": "wireless_mic",
                 "requires": ["stand_01", "cable_01", "battery_backup_01"],
                 "assignments": []},
                {"id": "speaker_01", "type": "PA_speaker",
                 "requires": ["cable_02"],
                 "assignments": []},
                {"id": "stand_01",            "type": "mic_stand",          "requires": [], "assignments": []},
                {"id": "cable_01",            "type": "xlr_cable",          "requires": [], "assignments": []},
                {"id": "battery_backup_01",   "type": "aa_battery_set",     "requires": [], "assignments": []},
                {"id": "cable_02",            "type": "speaker_cable",      "requires": [], "assignments": []},
            ]
        },
    },

    "constraints": {
        # ---- BUDGET RULES ----
        "budget": {
            "total_ceiling": 3000,            # planned ceiling (EUR)
            "hard_stop_threshold_eur": 3200,  # absolute stop line (EUR)
            "category_ceilings": {
                "venue": 1200,
                "av_equipment": 600,
                "catering": 800,
                "misc": 400,
            },
        },

        # ---- STAFFING RULES ----
        # A volunteer counts toward a shift window only if one availability
        # window covers that entire shift window.
        "staffing": {
            "roles": [
                {"role": "registration_desk", "min_coverage": 2, "shift_windows": ["17:00-19:00"]},
                {"role": "audio_mic",         "min_coverage": 1, "shift_windows": ["17:30-21:00"]},
            ],
        },

        # ---- AV / EQUIPMENT RULES ----
        "av": {
            "conflict_check": "flag_if_same_item_id_booked_twice_same_window",
        },
    },
}


if __name__ == "__main__":
    run_and_print(GLOBAL_AI_BERLIN_INPUT)
