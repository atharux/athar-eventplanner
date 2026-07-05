# RT Network — Commission Model & Unit Economics

## The model

RT Network is the booking layer of the Rising Tide Collective. The **network stays free** — introductions, listings, being found. The **platform carries the commission**: when a booking is assembled, pre-flight validated, and confirmed through RT Network, the platform takes a percentage of each provider's line.

| Tier | Rate | Terms |
|---|---|---|
| **Founding member** | **2%** | Rate-locked for 24 months from their first confirmed booking |
| Standard | 10% | All providers joining after the founding window |

- Commission applies only to **completed + confirmed** bookings — a declined or cancelled gig costs the provider nothing.
- Until payments run through the platform (Phase C, Stripe Connect), providers invoice clients directly and RT Network invoices commission monthly.
- At Phase C, payment processing fees (~1.5% + €0.25 for EU cards) are **passed through to the client**, not absorbed — the 2% founding rate stays whole.

## Why 2% founding works

At 2%, RT Network roughly breaks even per-booking once payments are in-platform — that is the point. The founding rate is **deliberate land-grab pricing**: it buys supply density (the thing marketplaces die without) and two years of relationship, priced at what providers currently pay for nothing more than an introduction. The margin lives in the standard tier and in volume.

## Worked example — €8,000 wedding, 120 guests, 6 founding providers

| Provider | Line | Gross € | RT @ 2% | Provider receives € |
|---|---|---:|---:|---:|
| Lilium Berlin | venue, flat | 1,800 | 36.00 | 1,764.00 |
| Caterer | 120 × €30 pp | 3,600 | 72.00 | 3,528.00 |
| DJ | 5h × €140 | 700 | 14.00 | 686.00 |
| AV | flat | 500 | 10.00 | 490.00 |
| Photographer | flat | 900 | 18.00 | 882.00 |
| Crew | 2 × 10h × €25 | 500 | 10.00 | 490.00 |
| **Total** | | **8,000** | **160.00** | **7,840.00** |

The same event at the standard 10% rate: **€800** RT revenue.

## Profitability framing

Fixed platform costs are ≈ **€0/month**: Cloudflare Pages + D1 free tiers cover the pilot's traffic and storage by orders of magnitude; the deterministic engine runs offline. Every euro of commission is gross margin until payment processing enters (Phase C), at which point the standard tier carries the fees comfortably.

| Scenario | Events / month | Avg package € | Blended rate | Monthly revenue € |
|---|---:|---:|---:|---:|
| Pilot (founding only) | 2 | 6,000 | 2% | 240 |
| Year 1 (mixed) | 6 | 7,000 | 5% | 2,100 |
| Year 2 (standard majority) | 12 | 7,500 | 8% | 7,200 |

The pitch to a founding provider: *"You pay nothing to be listed. When we bring you a confirmed, pre-flight-checked booking, we keep 2 cents on the euro — locked for two years."*
