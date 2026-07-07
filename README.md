# RT Network

**Rising Tide Collective's event booking layer — gamified operations with a deterministic constraint engine.**

> *A rising tide lifts all boats.*

RT Network is an event-planning CRM and booking platform (events, tasks, guests, budgets, vendors, run-sheets) with one unusual property: before event day, your plan is validated by a **deterministic pre-flight engine** that catches the failures that actually ruin events — budget hard-stop breaches, understaffed shifts, and AV gear with broken dependency chains or double-bookings. Same input, same verdict, every time. No AI in the decision path.

Currently piloting with real Berlin events (Global AI Berlin) and venues (Lilium.berlin).

## The Pre-Flight engine

The differentiator lives in `agents/event_ops/schemas/`:

- **`engine.py`** — the generic constraint engine. Three domains: budget (total ceiling, per-category ceilings, absolute hard-stop line), staffing (per-shift minimum coverage from a volunteer roster with availability windows; unfilled `REPLACE` slots never count as people), and AV/equipment (per-instance dependency chains — a mic without its stand, cable, and backup battery is flagged — plus double-booking detection). Optional venue-capacity checks.
- **One data file per event/venue** — `global_ai_berlin.py`, `lilium_berlin.py`. Adding a venue means adding a data file, nothing else.
- **The app's Pre-Flight tab runs a faithful JS port of this engine live in the browser** (`src/data/preflightEngine.js`, verified byte-identical output against the Python original) — roster and committed spend are editable right on that screen and persist to localStorage; every edit recomputes violations instantly, so resolving a finding (e.g. filling a `REPLACE` roster slot) is a few clicks, not a Python re-run + redeploy.

```bash
# Cross-check the app's live result against the offline reference implementation anytime:
python3 agents/event_ops/schemas/global_ai_berlin.py
python3 agents/event_ops/schemas/lilium_berlin.py
```

Requires Python 3.10+ with `pydantic` (the engine builds on the reference implementation in `eventApp-research-etc/ai-ops-landing/deterministic.py`). Editing ceilings/coverage minimums (policy, not day-to-day data) still means editing `src/data/preflightEvents.js` — the app picks it up automatically.

## The app

React 18 + Vite + Tailwind, deployed on Cloudflare Pages. All CRM data lives in the browser's localStorage — nothing is sent to a server. Optional AI event drafting uses a user-supplied Groq or OpenRouter key (stored locally, sent only to that provider).

```bash
npm install
npm run dev     # local dev server
npm run build   # production build to dist/
```

On first run you choose **demo data** (a populated example workspace) or a **clean workspace** for real planning — switchable later in Settings → Data.

## Structure

```
src/
  App.jsx            # the CRM (events, tasks, guests, budget, vendors, messages)
  questBoard.jsx     # gamification layer — quests derived from real workspace data
  preflightPanel.jsx # renders the deterministic constraint reports
  useStorage.js      # localStorage persistence + plan limits
agents/event_ops/schemas/
  engine.py          # deterministic constraint engine
  *_berlin.py        # one schema file per event/venue
public/
  *-preflight.json   # published constraint reports (generated, committed)
docs/
  pilot-runbook.md   # instructions for pilot testers
```

## License

MIT — see [LICENSE](LICENSE).
