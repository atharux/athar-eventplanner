"""Global AI Berlin — pilot event constraint schema + domain ruleset.

Plugs into the existing deterministic engine (DeterministicTemplate) in
eventApp-research-etc/ai-ops-landing/deterministic.py WITHOUT modifying it.
Three constraint domains: budget, staffing/volunteers, AV/equipment.

Constraint figures supplied by the operator (pilot spec, 2026-07-04):
- budget: 3000 EUR planned ceiling, 3200 EUR absolute hard stop,
  category ceilings venue/av_equipment/catering/misc
- staffing: registration_desk x2 (17:00-19:00), audio_mic x1 (17:30-21:00)
- AV: per-instance gear with instance-level dependency lists; conflict
  check flags the same item id booked twice in overlapping windows

Roster and date confirmed 2026-07-04: corporate-party pilot on 2026-07-18,
volunteers Athar (registration + audio) and Cheryl (registration).
Catering is required — commit spend under budget.committed_spend.catering
as bookings land.

Run deterministic validation (no AI layer fires):

    python3 agents/event_ops/schemas/global_ai_berlin.py
"""

import json
import sys
import warnings
from pathlib import Path

# The core engine lives in the research directory (untracked in git).
# Resolve it relative to the repo root so this module runs from anywhere.
_REPO_ROOT = Path(__file__).resolve().parents[3]
_CORE_DIR = _REPO_ROOT / "eventApp-research-etc" / "ai-ops-landing"
if not (_CORE_DIR / "deterministic.py").exists():
    sys.exit(
        f"Core engine not found at {_CORE_DIR}/deterministic.py — "
        "this module requires the eventApp-research-etc/ai-ops-landing "
        "reference implementation to be present."
    )
sys.path.insert(0, str(_CORE_DIR))

with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    from deterministic import (  # noqa: E402
        DeterministicTemplate,
        OperationInputSchema,
        ValidationResultSchema,
        log_stage,
    )

# =============================================================================
# GLOBAL AI BERLIN — EVENT INSTANCE SCHEMA
# Shaped as OperationInputSchema: {version, data, constraints}
# data        = current operational state (spend so far, roster, gear)
# constraints = the rules this state is checked against
# =============================================================================

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
                # shift starts — Cheryl holds the desk solo in that window.
                {"name": "Athar",  "role": ["registration_desk", "audio_mic"], "availability": "17:00-21:30"},
                {"name": "Cheryl", "role": "registration_desk", "availability": "17:00-19:00"},
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


# =============================================================================
# DOMAIN RULESET — plugs into the core engine via subclassing only
# =============================================================================

def _mins(hhmm: str) -> int:
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def _parse_window(w):
    """Accept 'HH:MM-HH:MM' strings or {'start','end'} dicts."""
    if isinstance(w, str):
        start, end = w.split("-")
        return start.strip(), end.strip()
    return w["start"], w["end"]


def _windows_overlap(a, b) -> bool:
    a_start, a_end = _parse_window(a)
    b_start, b_end = _parse_window(b)
    return _mins(a_start) < _mins(b_end) and _mins(b_start) < _mins(a_end)


def _window_covers(outer, inner) -> bool:
    o_start, o_end = _parse_window(outer)
    i_start, i_end = _parse_window(inner)
    return _mins(o_start) <= _mins(i_start) and _mins(o_end) >= _mins(i_end)


def _is_placeholder(name) -> bool:
    """Roster slots that still need a real person (name left as REPLACE)."""
    return str(name).strip().upper().startswith("REPLACE")


def _roles_of(volunteer):
    r = volunteer.get("roles", volunteer.get("role", []))
    return r if isinstance(r, list) else [r]


def _availability_of(volunteer):
    a = volunteer.get("availability", [])
    return a if isinstance(a, list) else [a]


class GlobalAIBerlinConstraints(DeterministicTemplate):
    """Deterministic constraint checks for the Global AI Berlin pilot event."""

    def apply_rules(self, input_data):
        data = input_data["data"]
        constraints = input_data["constraints"]
        violations = []
        risks = []

        # ---------------- BUDGET ----------------
        budget_out = {}
        spend = data.get("budget", {}).get("committed_spend", {})
        rules = constraints.get("budget", {})
        committed_total = sum(spend.values())
        ceiling = rules.get("total_ceiling", 0)
        # Absolute hard stop (EUR). Falls back to a fraction-of-ceiling
        # threshold if only 'hard_stop_threshold' is given.
        hard_stop_at = rules.get(
            "hard_stop_threshold_eur",
            ceiling * rules.get("hard_stop_threshold", 1.0),
        )

        budget_out["committed_total"] = committed_total
        budget_out["total_ceiling"] = ceiling
        budget_out["headroom"] = ceiling - committed_total
        budget_out["hard_stop_at"] = hard_stop_at
        # Reaching the stop line counts as breached; a zero/unset threshold
        # means no hard stop is configured.
        budget_out["hard_stop_breached"] = hard_stop_at > 0 and committed_total >= hard_stop_at

        if budget_out["hard_stop_breached"]:
            violations.append(
                f"BUDGET: committed spend {committed_total} EUR breached the absolute "
                f"hard stop of {hard_stop_at} EUR — block all further commitments"
            )
        elif committed_total > ceiling:
            violations.append(
                f"BUDGET: committed spend {committed_total} EUR exceeds planned ceiling "
                f"{ceiling} EUR (hard stop at {hard_stop_at} EUR)"
            )
        elif ceiling > 0 and committed_total >= 0.8 * ceiling:
            risks.append(
                f"BUDGET: committed spend {committed_total} EUR at >=80% of planned ceiling {ceiling} EUR"
            )

        category_status = {}
        for cat, cap in rules.get("category_ceilings", {}).items():
            spent = spend.get(cat, 0)
            category_status[cat] = {"committed": spent, "ceiling": cap, "over": spent > cap}
            if spent > cap:
                violations.append(
                    f"BUDGET: category '{cat}' committed {spent} EUR exceeds category ceiling {cap} EUR"
                )
            elif cap > 0 and spent >= 0.8 * cap:
                risks.append(
                    f"BUDGET: category '{cat}' at {spent}/{cap} EUR (>=80% of category ceiling)"
                )
        budget_out["categories"] = category_status

        # ---------------- STAFFING ----------------
        staffing_out = {}
        roster = data.get("staffing", {}).get("volunteer_roster", [])
        for role_spec in constraints.get("staffing", {}).get("roles", []):
            role = role_spec["role"]
            required = role_spec.get("min_coverage", 0)
            windows_out = []
            for shift in role_spec.get("shift_windows", []):
                available = [
                    v["name"] for v in roster
                    if role in _roles_of(v)
                    and any(_window_covers(a, shift) for a in _availability_of(v))
                ]
                # Placeholder (REPLACE) slots are unfilled positions, not
                # people — they never count toward confirmed coverage.
                covering = [n for n in available if not _is_placeholder(n)]
                unfilled = len(available) - len(covering)
                windows_out.append({
                    "window": shift,
                    "required": required,
                    "confirmed_full_window": len(covering),
                    "volunteers": covering,
                    "unfilled_placeholder_slots": unfilled,
                    "met": len(covering) >= required,
                })
                if len(covering) < required:
                    violations.append(
                        f"STAFFING: role '{role}' needs {required} confirmed volunteer(s) for full "
                        f"window {shift}, only {len(covering)} confirmed ({covering or 'none'})"
                        + (f"; {unfilled} unfilled REPLACE slot(s) on the roster" if unfilled else "")
                    )
                elif unfilled:
                    risks.append(
                        f"STAFFING: role '{role}' window {shift} coverage met, but roster still "
                        f"carries {unfilled} unfilled REPLACE slot(s)"
                    )
            staffing_out[role] = windows_out

        # ---------------- AV / EQUIPMENT ----------------
        av_out = {"missing_dependencies": {}, "double_booked": []}
        items = {i["id"]: i for i in data.get("av_equipment", {}).get("items", [])}

        # Instance-level dependency chains: every required instance id must
        # itself be present in the item list (with qty >= 1 if qty is used).
        for item_id, item in items.items():
            missing = [
                d for d in item.get("requires", [])
                if d not in items or items[d].get("qty", 1) < 1
            ]
            if missing:
                av_out["missing_dependencies"][item_id] = missing
                violations.append(
                    f"AV: '{item_id}' ({item.get('type', 'unknown')}) dependency chain broken — "
                    f"missing from item list: {missing}"
                )

        # Conflict detection: same item id booked twice in overlapping windows.
        for item_id, item in items.items():
            assigns = item.get("assignments", [])
            qty = item.get("qty", 1)
            for i in range(len(assigns)):
                overlapping = 1 + sum(
                    1 for j in range(len(assigns))
                    if j != i and _windows_overlap(assigns[i], assigns[j])
                )
                if overlapping > qty:
                    booking = assigns[i]
                    w_start, w_end = _parse_window(booking)
                    session = booking.get("session", "unnamed") if isinstance(booking, dict) else "unnamed"
                    conflict = {
                        "item": item_id,
                        "session": session,
                        "window": f"{w_start}-{w_end}",
                        "concurrent_demand": overlapping,
                        "qty_available": qty,
                    }
                    if conflict not in av_out["double_booked"]:
                        av_out["double_booked"].append(conflict)
                        violations.append(
                            f"AV: '{item_id}' double-booked — {overlapping} concurrent assignment(s) "
                            f"({conflict['session']} {conflict['window']}) but qty={qty}"
                        )

        # ---------------- RESULT ----------------
        return ValidationResultSchema(
            is_valid=len(violations) == 0,
            reason="All constraints satisfied" if not violations
                   else f"{len(violations)} constraint violation(s) detected",
            validated_data={
                "event_id": data.get("event_id"),
                "event_name": data.get("event_name"),
                "date": data.get("date"),
                "budget": budget_out,
                "staffing": staffing_out,
                "av_equipment": av_out,
                "violations": violations,
                "risk_flags": risks,
            },
            input_hash="",  # set by caller for idempotency audit
        )

    def get_ai_prompt(self, validated_data):
        # Advisory layer only — never fires in deterministic runs.
        return (
            f"Validated event constraint data: {json.dumps(validated_data)}. "
            "Suggest risk mitigations only. You must not change budgets, "
            "coverage minimums, or constraints. Respond as JSON matching AISuggestionSchema."
        )

    # Deterministic stages only (schema validation -> rules). The AI advisory
    # stage in execute() is intentionally never reached from here, but the
    # framework's stage logging and idempotency cache still apply.
    def run_deterministic(self, raw_input):
        input_schema = OperationInputSchema(**raw_input)
        input_hash = self._compute_input_hash(input_schema)
        # Namespaced so cached deterministic results never collide with
        # full execute() results sharing the same input.
        cache_key = f"deterministic:{input_hash}"
        if cache_key in self._input_cache:
            return self._input_cache[cache_key]

        log_stage("INPUT_SCHEMA", raw_input, input_schema.dict())
        validated = self._apply_graceful_rules(input_schema)
        result = self.apply_rules(validated)
        result.input_hash = input_hash
        log_stage("RULES_ENGINE", input_schema.dict(), result.dict())

        output = {
            "version": "1.0",
            "status": "approved" if result.is_valid else "blocked",
            "result": result.dict(),
        }
        self._input_cache[cache_key] = output
        return output


if __name__ == "__main__":
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        engine = GlobalAIBerlinConstraints(api_key="offline-deterministic-run")
        output = engine.run_deterministic(GLOBAL_AI_BERLIN_INPUT)
    print(json.dumps(output, indent=2))
