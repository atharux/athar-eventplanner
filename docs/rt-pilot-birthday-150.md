# RT Network Pilot Runbook — Birthday Party, 150 guests

*Companion: [rt-network-sales-kit.md](rt-network-sales-kit.md) · [rt-network-pricing.md](rt-network-pricing.md)*

## Event snapshot

| | |
|---|---|
| Event type | Party (standing) |
| Guests | 150 — parties use **standing** capacity: fits Fluxbau (300) or Lilium (300) with room to spare |
| Suggested venue | Fluxbau (riverside, party-friendly, €300 cheaper than Lilium) |
| Suggested budget guardrail | €5,000 |
| Duration | 5 hours (doors 20:00 — ends 01:00, load-out 02:00) |

## Suggested package (live catalog prices)

| Line | € |
|---|---:|
| Fluxbau — venue | 900 |
| Street-food buffet (150 × €18) | 2,700 |
| DJ + AV package (5h × €90) | 450 |
| Event crew (2 × 5h × €25) | 250 |
| Photographer | 600 |
| **Total** | **4,900** |

€100 under the €5,000 guardrail. RT commission at 2% founding: **€98**; providers receive €4,802 combined. Upgrade path: premium DJ + light rig (€140/h) adds €250 — still worth showing the client via the slider.

## Client flow (run this on a phone)

1. Open `…pages.dev/#plan`. Tell the concierge: *"Big birthday party, about 150 people, evening, budget around 5k."*
2. Venue step: both venues show *"Up to 300 standing"* — the same 150 guests would grey out **both** venues if you switch event type to *Wedding* (seated max 150 exactly at Lilium, over at Fluxbau placeholder) — a nice capacity-engine demo.
3. Services: **Catering** slider to €18–20 → only street-food stays available (the budget-party sweet spot). DJ + AV at 5 hours, crew 2, photographer.
4. Review quote + run of show (note it correctly crosses midnight), submit → `RT-…` reference.

## Draft run of show (deterministic — regenerates identically from this package)

| Time | Item | Owner |
|---|---|---|
| 18:00 | Crew call — setup & load-in at Fluxbau | Event crew (×2) |
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
3. Quotes tab: watch confirmations land, then **Export engine JSON** → pre-flight shows capacity 150/300 clear and committed spend building toward the €4,900 quoted ceiling.

## What we're testing (beyond the wedding pilot)

1. Late-night schedule handling — the run of show must read correctly across midnight (20:00 doors → 02:00 load-out).
2. Standing-vs-seated capacity logic when the client flips event type mid-flow.
3. The €18/guest slider position as a natural budget-party filter.
4. Whether a party client uses the concierge or jumps straight to classic steps (watch the mode switch).

Report issues: screenshot + one line to **hello@risingtide.store**.
