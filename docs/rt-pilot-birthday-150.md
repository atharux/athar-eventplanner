# RT Network Pilot Runbook — Birthday Party, 150 guests

*Companion: [rt-network-sales-kit.md](rt-network-sales-kit.md) · [rt-network-pricing.md](rt-network-pricing.md)*

## Event snapshot

| | |
|---|---|
| Event type | Party (standing) |
| Guests | 150 — parties use **standing** capacity: fits Lilium (300); over capacity at FluxBau (confirmed max 90 — see below) |
| Suggested venue | Lilium (waterside Art Deco, actually accommodates 150) |
| Suggested budget guardrail | €5,000 |
| Duration | 5 hours (doors 20:00 — ends 01:00, load-out 02:00) |

> FluxBau's real capacity was confirmed from its own booking PDF on 2026-07-07: 550 m² over two floors + 120 m² terrace, but the only guest-count figure it documents is a 90-person **seated** wedding layout — no standing/seated max is stated. Catalog capacity is floored to 90 for both formats until FluxBau confirms a real number, which rules it out for 150 guests. This pilot now uses Lilium instead.

## Suggested package (live catalog prices)

| Line | € |
|---|---:|
| Lilium — venue | 1,200 |
| Street-food buffet (150 × €18) | 2,700 |
| DJ + AV package (5h × €90) | 450 |
| Event crew (2 × 5h × €25) | 250 |
| Photographer | 600 |
| **Total** | **5,200** |

€200 **over** the €5,000 guardrail. RT commission at 2% founding: **€104**; providers receive €5,096 combined. This is actually a useful demo point on its own: the app's budget check is a non-blocking warning, not a hard stop — the client sees it and can adjust (e.g. drop to street-food-only sizing they already have, or trim crew hours) rather than being blocked outright.

## Client flow (run this on a phone)

1. Open `…pages.dev/#plan`. Tell the concierge: *"Big birthday party, about 150 people, evening, budget around 5k."*
2. Venue step: **FluxBau greys out immediately** — "Over capacity — max 90 standing." Lilium stays selectable — "Up to 300 standing." Switch event type to *Wedding* and watch the boundary case: FluxBau still greys out (150 > 90), but Lilium sits exactly *at* its 150-seated max and stays selectable (over-capacity is `guests > cap`, not `>=`) — a nice edge-case demo of the capacity engine.
3. Services: **Catering** slider to €18–20 → only street-food stays available (the budget-party sweet spot). DJ + AV at 5 hours, crew 2, photographer.
4. Review quote + run of show (note it correctly crosses midnight) — the total will show as €200 over guardrail, non-blocking. Submit → `RT-…` reference.

## Draft run of show (deterministic — regenerates identically from this package)

| Time | Item | Owner |
|---|---|---|
| 18:00 | Crew call — setup & load-in at Lilium | Event crew (×2) |
| 18:30 | Sound & light check | DJ / AV |
| 19:00 | Catering setup | Caterer |
| 20:00 | Doors — guest arrival (150 expected) | Registration / door |
| 20:30 | Food service opens | Caterer |
| 21:00 | DJ set opens | DJ / AV |
| 21:00 | Photo coverage window | Photography |
| 00:30 | Last call | Event crew |
| 01:00 | Event ends — guest farewell | Registration / door |
| 02:00 | Breakdown & load-out complete | Event crew (×2) |

## Backstage flow (operator)

1. Submission creates 5 pending gig requests.
2. Confirm from each backstage link — e.g. caterer sees €2,700 gross → **€2,646 payout** at the founding rate.
3. Quotes tab: watch confirmations land, then **Export engine JSON** → pre-flight shows capacity 150/300 clear and committed spend building toward the €5,200 quoted total (above the €5,000 ceiling — the exported engine JSON will flag this as a BUDGET risk/violation, which is correct and worth showing live).

## What we're testing (beyond the wedding pilot)

1. Late-night schedule handling — the run of show must read correctly across midnight (20:00 doors → 02:00 load-out).
2. Standing-vs-seated capacity logic when the client flips event type mid-flow, including the FluxBau-always-over / Lilium-at-the-edge boundary case above.
3. The €18/guest slider position as a natural budget-party filter.
4. The non-blocking over-budget warning path (this package sits €200 over guardrail by design now — a real, not contrived, example).
5. Whether a party client uses the concierge or jumps straight to classic steps (watch the mode switch).

Report issues: screenshot + one line to **hello@risingtide.store**.
