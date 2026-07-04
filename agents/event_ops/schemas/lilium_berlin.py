"""Lilium.berlin — pilot event constraint schema (TEMPLATE + real venue facts).

Event instance data for the shared deterministic engine (see engine.py).

Venue facts from lilium.berlin/info (fetched 2026-07-04):
- Capacity: 300 standing / 150 seated
- Space: 500 m2 indoor + 250 m2 outdoor, 3.10 m ceiling
- Services: full-service Art Deco bar (in-house), catering partnerships,
  high-current power, storage/fridges/wardrobe/restrooms, grand piano,
  boat rental & docking, custom flora arrangements
- Location: Pfuelstr. 5, 10997 Berlin (waterside, Oberbaum Bridge views)
- Co-rental with neighboring Fluxbau available for events up to 600 guests
  -> one relationship covers both pitch targets

STATUS: awaiting Lilium's confirmation. Budget ceilings mirror the standard
pilot spec; roster names and the event date are REPLACE placeholders, so
validation honestly reports BLOCKED until real people are confirmed. The
site lists power but no PA/mic inventory — confirm venue-provided AV vs
bring-your-own before locking the gear list.

Run deterministic validation (no AI layer fires):

    python3 agents/event_ops/schemas/lilium_berlin.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from engine import run_and_print  # noqa: E402

LILIUM_BERLIN_INPUT = {
    "version": "1.0",
    "data": {
        "event_id": "LILIUM-PILOT",
        "event_name": "Lilium Berlin — Pilot Event",
        "event_type": "venue_event",
        "date": "REPLACE_WITH_ACTUAL_DATE",
        "expected_attendees": 150,

        # ---- VENUE FACTS (lilium.berlin/info, 2026-07-04) ----
        # Carried for reference; the capacity constraint below enforces them.
        "venue": {
            "address": "Pfuelstr. 5, 10997 Berlin",
            "capacity_standing": 300,
            "capacity_seated": 150,
            "indoor_sqm": 500,
            "outdoor_sqm": 250,
            "ceiling_m": 3.10,
            "in_house": ["full_service_bar", "storage", "fridges", "wardrobe",
                         "restrooms", "grand_piano", "heating", "high_current_power"],
            "partnerships": ["catering"],
            "co_rental": "Fluxbau (neighboring) — combined events up to 600 guests",
        },

        # ---- BUDGET: committed spend so far, per category (EUR) ----
        "budget": {
            "committed_spend": {
                "venue": 0,
                "av_equipment": 0,
                "catering": 0,
                "misc": 0,
            }
        },

        # ---- STAFFING: roster with role(s) + availability ----
        # REPLACE entries are unfilled slots; they never count as coverage.
        # Bar is venue-run (in-house), so no bar role here.
        "staffing": {
            "volunteer_roster": [
                {"name": "REPLACE", "role": "door_registration", "availability": "18:00-20:00"},
                {"name": "REPLACE", "role": "door_registration", "availability": "18:00-20:00"},
                {"name": "REPLACE", "role": "audio_mic",         "availability": "18:30-22:00"},
            ]
        },

        # ---- AV / EQUIPMENT: per-instance gear list ----
        # Site lists high-current power but no PA/mic inventory — this is the
        # bring-your-own list; confirm what Lilium provides before the event.
        "av_equipment": {
            "items": [
                {"id": "mic_01",     "type": "wireless_mic",
                 "requires": ["stand_01", "cable_01", "battery_backup_01"],
                 "assignments": []},
                {"id": "speaker_01", "type": "PA_speaker",
                 "requires": ["cable_02"],
                 "assignments": []},
                {"id": "stand_01",          "type": "mic_stand",      "requires": [], "assignments": []},
                {"id": "cable_01",          "type": "xlr_cable",      "requires": [], "assignments": []},
                {"id": "battery_backup_01", "type": "aa_battery_set", "requires": [], "assignments": []},
                {"id": "cable_02",          "type": "speaker_cable",  "requires": [], "assignments": []},
            ]
        },
    },

    "constraints": {
        # ---- CAPACITY RULES (from lilium.berlin) ----
        # 300 standing / 150 seated — set max_attendees per event format.
        # Co-rental with Fluxbau lifts the ceiling to 600 if needed.
        "capacity": {
            "max_attendees": 150,  # seated format assumed for the pilot
        },

        # ---- BUDGET RULES (standard pilot spec — confirm with Lilium) ----
        "budget": {
            "total_ceiling": 3000,
            "hard_stop_threshold_eur": 3200,
            "category_ceilings": {
                "venue": 1200,
                "av_equipment": 600,
                "catering": 800,
                "misc": 400,
            },
        },

        # ---- STAFFING RULES ----
        "staffing": {
            "roles": [
                {"role": "door_registration", "min_coverage": 2, "shift_windows": ["18:00-20:00"]},
                {"role": "audio_mic",         "min_coverage": 1, "shift_windows": ["18:30-22:00"]},
            ],
        },

        # ---- AV / EQUIPMENT RULES ----
        "av": {
            "conflict_check": "flag_if_same_item_id_booked_twice_same_window",
        },
    },
}


if __name__ == "__main__":
    run_and_print(LILIUM_BERLIN_INPUT)
