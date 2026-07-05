# RT Network Pilot Runbook — Wedding, 100 guests

*Companion: [rt-network-sales-kit.md](rt-network-sales-kit.md) · [rt-network-pricing.md](rt-network-pricing.md)*

## Event snapshot

| | |
|---|---|
| Event type | Wedding (seated) |
| Guests | 100 — fits Lilium Berlin seated capacity (150) with headroom |
| Suggested venue | Lilium Berlin (waterside Art Deco, in-house bar, grand piano) |
| Suggested budget guardrail | €8,000 |
| Duration | 6 hours (doors 15:00 — ends 21:00) |

## Suggested package (live catalog prices)

| Line | € |
|---|---:|
| Lilium Berlin — venue | 1,200 |
| Seated 3-course dinner (100 × €45) | 4,500 |
| DJ + AV package (6h × €90) | 540 |
| Event crew (2 × 6h × €25) | 300 |
| Photo + video team | 1,100 |
| **Total** | **7,640** |

€360 under the €8,000 guardrail. At the 2% founding rate, RT Network's commission on the full package is **€152.80**; providers receive €7,487.20 combined. Cheaper variant: classic buffet (€28pp) instead of 3-course saves €1,700.

## Client flow (run this on a phone)

1. Open `…pages.dev/#plan`. The concierge greets you — type: *"We're planning a wedding for 100 guests, thinking about €8,000."* Watch it fill type/guests/budget; answer its date question.
2. When it hands over (or tap **Review quote**): pick **Lilium Berlin** — note the capacity pill reads *"Up to 150 seated"*.
3. Services: on **Catering**, drag the *budget per guest* slider to €45 — all three tiers stay available; drag to €30 and watch the 3-course grey out with "above your per-guest budget" (this is the money demo). Select 3-course, DJ + AV (set 6 hours), crew (2), photo + video.
4. Review the quote + **draft run of show** (below), enter contact details, **Submit for confirmation** → note your `RT-…` reference.

## Draft run of show (deterministic — regenerates identically from this package)

| Time | Item | Owner |
|---|---|---|
| 13:00 | Crew call — setup & load-in at Lilium Berlin | Event crew (×2) |
| 13:30 | Sound & light check | DJ / AV |
| 14:00 | Catering setup | Caterer |
| 15:00 | Doors — guest arrival (100 expected) | Registration / door |
| 15:45 | Ceremony / welcome moment | Organizer |
| 16:00 | Photo coverage window | Photography |
| 16:30 | Dinner service begins | Caterer |
| 17:30 | Speeches & toasts | Organizer |
| 18:15 | First dance → DJ set opens | DJ / AV |
| 20:30 | Last call | Event crew |
| 21:00 | Event ends — guest farewell | Registration / door |
| 22:00 | Breakdown & load-out complete | Event crew (×2) |

## Backstage flow (operator)

1. The submission creates 5 pending gig requests (venue, caterer, DJ, crew, photo).
2. Open each provider's backstage link (`backstage-links.local.txt`): the card shows the wedding, date, 100 guests, gross, and **"You receive"** (e.g. venue: €1,200 gross → **€1,176**).
3. Confirm each — the operator Quotes tab flips chips pending→confirmed live.
4. In the Quotes tab: **Export engine JSON** → run the deterministic pre-flight; expect capacity 100/150 clear and committed-spend tracking as confirmations land.

## What we're testing

1. Does the concierge correctly capture type/guests/budget/date from one natural sentence?
2. Does the per-guest slider change what the client picks (watch for the €30 → classic-buffet moment)?
3. Do providers understand the backstage card with zero explanation?
4. Is the auto run-of-show close enough that the organizer edits rather than rewrites?

Report issues: screenshot + one line to **hello@risingtide.store**.
