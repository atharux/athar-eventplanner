"""Global AI Berlin — pilot event constraint schema + domain ruleset.

Plugs into the existing deterministic engine (DeterministicTemplate) in
eventApp-research-etc/ai-ops-landing/deterministic.py WITHOUT modifying it.
Three constraint domains: budget, staffing/volunteers, AV/equipment.

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
        "event_id": "GAIB-2026-07",
        "event_name": "Global AI Berlin — July Community Meetup",
        "date": "2026-07-24",
        "expected_attendees": 120,

        # ---- BUDGET: committed spend so far, per category (EUR) ----
        "budget": {
            "committed_spend": {
                "venue": 0,        # venue sponsored / community space
                "av": 180,         # wireless mic rental + cabling
                "catering": 520,   # drinks + snacks for ~120
                "misc": 75,        # name badges, signage, tape
            }
        },

        # ---- STAFFING: volunteer roster with roles + availability ----
        "staffing": {
            "volunteer_roster": [
                {"name": "Athar",       "roles": ["registration_desk", "audio_mic"],
                 "availability": [{"start": "17:00", "end": "22:00"}]},
                {"name": "Volunteer B", "roles": ["registration_desk"],
                 "availability": [{"start": "17:30", "end": "19:30"}]},
                {"name": "Volunteer C", "roles": ["registration_desk"],
                 "availability": [{"start": "18:30", "end": "22:00"}]},
                {"name": "Volunteer D", "roles": ["audio_mic"],
                 "availability": [{"start": "18:00", "end": "20:00"}]},
            ]
        },

        # ---- AV / EQUIPMENT: item inventory + session assignments ----
        "av_equipment": {
            "items": [
                {"id": "wireless_mic",    "name": "Wireless handheld mic", "qty": 1,
                 "assignments": [
                     {"session": "opening_talk",  "start": "18:30", "end": "19:15"},
                     {"session": "panel",         "start": "19:00", "end": "20:00"},
                 ]},
                {"id": "mic_stand",       "name": "Mic stand",             "qty": 1, "assignments": []},
                {"id": "xlr_cable",       "name": "XLR cable",             "qty": 2, "assignments": []},
                {"id": "backup_battery",  "name": "AA backup battery set", "qty": 0, "assignments": []},
                {"id": "projector",       "name": "Projector",             "qty": 1,
                 "assignments": [
                     {"session": "opening_talk",  "start": "18:30", "end": "19:15"},
                 ]},
                {"id": "hdmi_cable",      "name": "HDMI cable",            "qty": 1, "assignments": []},
                {"id": "speaker_pa",      "name": "PA speaker pair",       "qty": 1,
                 "assignments": [
                     {"session": "full_event",    "start": "18:00", "end": "21:30"},
                 ]},
                {"id": "power_extension", "name": "Power extension strip", "qty": 2, "assignments": []},
            ]
        },
    },

    "constraints": {
        # ---- BUDGET RULES ----
        "budget": {
            "total_ceiling": 1500,
            "category_ceilings": {"venue": 500, "av": 300, "catering": 500, "misc": 150},
            # Block further commitments once committed spend crosses this
            # fraction of the total ceiling.
            "hard_stop_threshold": 0.90,
        },

        # ---- STAFFING RULES ----
        "staffing": {
            "roles_needed": ["registration_desk", "audio_mic"],
            # Minimum simultaneous volunteers per role across the whole window.
            "min_coverage": {"registration_desk": 2, "audio_mic": 1},
            # A volunteer counts toward a role only if one availability window
            # covers the role's full coverage window.
            "coverage_windows": {
                "registration_desk": {"start": "17:30", "end": "19:00"},
                "audio_mic":         {"start": "18:00", "end": "21:30"},
            },
        },

        # ---- AV / EQUIPMENT RULES ----
        "av": {
            # item -> required supporting items (each must exist with qty >= 1)
            "dependency_chain": {
                "wireless_mic": ["mic_stand", "xlr_cable", "backup_battery"],
                "projector":    ["hdmi_cable", "power_extension"],
                "speaker_pa":   ["xlr_cable", "power_extension"],
            },
        },
    },
}


# =============================================================================
# DOMAIN RULESET — plugs into the core engine via subclassing only
# =============================================================================

def _mins(hhmm: str) -> int:
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def _windows_overlap(a_start, a_end, b_start, b_end) -> bool:
    return _mins(a_start) < _mins(b_end) and _mins(b_start) < _mins(a_end)


def _window_covers(outer, start, end) -> bool:
    return _mins(outer["start"]) <= _mins(start) and _mins(outer["end"]) >= _mins(end)


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
        hard_stop_at = ceiling * rules.get("hard_stop_threshold", 1.0)

        budget_out["committed_total"] = committed_total
        budget_out["total_ceiling"] = ceiling
        budget_out["headroom"] = ceiling - committed_total
        budget_out["hard_stop_at"] = hard_stop_at
        budget_out["hard_stop_breached"] = committed_total >= hard_stop_at

        if committed_total > ceiling:
            violations.append(
                f"BUDGET: committed spend {committed_total} EUR exceeds total ceiling {ceiling} EUR"
            )
        elif budget_out["hard_stop_breached"]:
            violations.append(
                f"BUDGET: committed spend {committed_total} EUR crossed hard-stop threshold "
                f"({hard_stop_at:.0f} EUR = {rules.get('hard_stop_threshold'):.0%} of ceiling) — block new commitments"
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
        srules = constraints.get("staffing", {})
        for role in srules.get("roles_needed", []):
            window = srules.get("coverage_windows", {}).get(role)
            required = srules.get("min_coverage", {}).get(role, 0)
            covering = [
                v["name"] for v in roster
                if role in v.get("roles", [])
                and any(_window_covers(w, window["start"], window["end"])
                        for w in v.get("availability", []))
            ] if window else []
            staffing_out[role] = {
                "required": required,
                "available_full_window": len(covering),
                "volunteers": covering,
                "window": window,
                "met": len(covering) >= required,
            }
            if len(covering) < required:
                violations.append(
                    f"STAFFING: role '{role}' needs {required} volunteer(s) for full window "
                    f"{window['start']}-{window['end']}, only {len(covering)} available ({covering or 'none'})"
                )

        # ---------------- AV / EQUIPMENT ----------------
        av_out = {"missing_dependencies": {}, "double_booked": []}
        items = {i["id"]: i for i in data.get("av_equipment", {}).get("items", [])}
        chain = constraints.get("av", {}).get("dependency_chain", {})

        for item_id, deps in chain.items():
            if item_id not in items:
                continue
            missing = [d for d in deps if items.get(d, {}).get("qty", 0) < 1]
            if missing:
                av_out["missing_dependencies"][item_id] = missing
                violations.append(
                    f"AV: '{item_id}' dependency chain broken — missing/zero-stock: {missing}"
                )

        for item_id, item in items.items():
            assigns = item.get("assignments", [])
            qty = item.get("qty", 0)
            for i in range(len(assigns)):
                overlapping = 1 + sum(
                    1 for j in range(len(assigns)) if j != i and _windows_overlap(
                        assigns[i]["start"], assigns[i]["end"],
                        assigns[j]["start"], assigns[j]["end"])
                )
                if overlapping > qty:
                    conflict = {
                        "item": item_id,
                        "session": assigns[i]["session"],
                        "window": f"{assigns[i]['start']}-{assigns[i]['end']}",
                        "concurrent_demand": overlapping,
                        "qty_available": qty,
                    }
                    if conflict not in av_out["double_booked"]:
                        av_out["double_booked"].append(conflict)
                        violations.append(
                            f"AV: '{item_id}' double-booked — {overlapping} concurrent assignment(s) "
                            f"({assigns[i]['session']} {conflict['window']}) but qty={qty}"
                        )

        # ---------------- RESULT ----------------
        return ValidationResultSchema(
            is_valid=len(violations) == 0,
            reason="All constraints satisfied" if not violations
                   else f"{len(violations)} constraint violation(s) detected",
            validated_data={
                "event_id": data.get("event_id"),
                "event_name": data.get("event_name"),
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
    # stage in execute() is intentionally never reached from here.
    def run_deterministic(self, raw_input):
        input_schema = OperationInputSchema(**raw_input)
        input_hash = self._compute_input_hash(input_schema)
        validated = self._apply_graceful_rules(input_schema)
        result = self.apply_rules(validated)
        result.input_hash = input_hash
        return {
            "version": "1.0",
            "status": "approved" if result.is_valid else "blocked",
            "result": result.dict(),
        }


if __name__ == "__main__":
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        engine = GlobalAIBerlinConstraints(api_key="offline-deterministic-run")
        output = engine.run_deterministic(GLOBAL_AI_BERLIN_INPUT)
    print(json.dumps(output, indent=2))
