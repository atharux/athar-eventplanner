# EventFlow

**Gamified event operations with a deterministic constraint engine.**

EventFlow is an event-planning CRM (events, tasks, guests, budgets, vendors, run-sheets) with one unusual property: before event day, your plan is validated by a **deterministic pre-flight engine** that catches the failures that actually ruin events — budget hard-stop breaches, understaffed shifts, and AV gear with broken dependency chains or double-bookings. Same input, same verdict, every time. No AI in the decision path.

Currently piloting with real Berlin events (Global AI Berlin) and venues (Lilium.berlin).

## The Pre-Flight engine

The differentiator lives in `agents/event_ops/schemas/`:

- **`engine.py`** — the generic constraint engine. Three domains: budget (total ceiling, per-category ceilings, absolute hard-stop line), staffing (per-shift minimum coverage from a volunteer roster with availability windows; unfilled `REPLACE` slots never count as people), and AV/equipment (per-instance dependency chains — a mic without its stand, cable, and backup battery is flagged — plus double-booking detection). Optional venue-capacity checks.
- **One data file per event/venue** — `global_ai_berlin.py`, `lilium_berlin.py`. Adding a venue means adding a data file, nothing else.
- Output is **idempotent and audited**: identical input hashes to identical reports.

```bash
# Run a validation (no AI, no network):
python3 agents/event_ops/schemas/global_ai_berlin.py

# Publish the report the app renders in its Pre-Flight tab:
python3 agents/event_ops/schemas/global_ai_berlin.py > public/gaib-preflight.json
python3 agents/event_ops/schemas/lilium_berlin.py   > public/lilium-preflight.json
```

Requires Python 3.10+ with `pydantic` (the engine builds on the reference implementation in `eventApp-research-etc/ai-ops-landing/deterministic.py`).

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
