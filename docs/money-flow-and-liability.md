# RT Network — Money Flow, Two-Sided Fees & Liability Structure

**Status:** Decision doc / working draft · 2026-07-11
**Author context:** operator wants (a) a clear picture of how money moves, (b) a move to **planner 2% + venue 2%**, and (c) to carry **no staffing-company liability**.
**⚠️ The ToS section is a DRAFT for a German lawyer to review — not legal advice.**

---

## 1. How money moves today (verified in code)

RT Network is currently an **introducer with a commission ledger — not a payment processor.** No money passes through the app.

| Fact | Where in code |
|---|---|
| No payment rail is wired | `src/App.jsx:3031` → `// TODO: wire to Stripe / payment` |
| Commission is **tracked, not collected** | `functions/api/backstage/[token].js:70` locks `commission_eur` at confirm |
| Operator sees an A/R ledger of fees owed | `src/quotesPanel.jsx:271–285` "Total commission owed to RT Network" |
| Fee is **provider-side only**, taken from payout | `payout = amount × (1 − rate)` at `backstage/[token].js:15` |
| Rate is per-provider: 2% founding / 10% standard | `src/data/catalog.js:8-9`; `providers.commission_rate` (`migrations/0001`) |
| **Client pays no fee**; pays providers directly, off-platform | `src/legalPages.jsx:67,72`; `quotes.js:70` total = sum of item amounts, no fee added |

**Implications**
- **Good for liability:** never touching client funds = not a merchant of record, not a money transmitter. Keep it that way.
- **Weakness:** collection is manual (invoice providers) and leak-prone — a provider can confirm on-platform then settle off-platform and dodge the fee.
- **Mismatch:** the built model is *one-sided, provider-pays*. "Planner 2% + venue 2%" is a **new two-sided model** that doesn't exist yet.

---

## 2. Target model: planner 2% + venue 2%

**Locked model (decided 2026-07-11): flat 2% on every angle, staff exempt.**
1. **Planner** (demand-side client who submits the package) pays a **2% service fee**.
2. **Every fee-bearing provider** — venue, catering, DJ/AV, photo — pays **2%**. (The old 10% standard tier is retired; it's a flat 2% across the board.)
3. **Staff/crew are exempt (0%)** on **both** sides — the provider fee *and* the planner's fee base exclude staff items — so RT never takes a cut tied to labor. This is the liability shield (see §4).

**Total RT take on a booking = 2% (planner, ex-staff) + 2% × each fee-bearing provider.** Nothing is charged on the staff line.

---

## 3. Code-change map (recommended: minimal, keeps the ledger model)

### 3a. Schema — new migration `migrations/0004_two_sided_fees.sql`
```sql
-- Planner-side service fee, locked when the quote is confirmed.
ALTER TABLE quotes ADD COLUMN client_fee_rate REAL NOT NULL DEFAULT 0.02;
ALTER TABLE quotes ADD COLUMN client_fee_eur  REAL;   -- NULL until confirmed
```
The venue's 2% reuses the existing `providers.commission_rate` — no new column. Just set venue rows to `0.02` and (per decision 2) non-venue rows to `0.0`.

### 3b. Venue = 2%, others = 0% (data, not logic)
- Update seed / provider rows so `kind='venue'` → `commission_rate = 0.02`; `kind IN (catering,dj_av,photo,staff)` → `0.0`.
- Files: `scripts/seed-providers.sql`, `src/data/catalog.js:8-9` (constants), and the onboarding default in `functions/api/providers.js:65` (INSERT) + `src/providersPanel.jsx:187` (the "2% / 10%" toggle copy).

### 3c. Compute + lock the planner fee
- **`functions/api/quotes.js`** (POST): after `total` is computed (line 70), the fee is *displayed* at submit but should **lock at confirmation** to match how provider commission locks. Two touch points:
  - At submit: return `service_fee_eur = round(total × 0.02, 2)` in the response so the client sees it.
  - At confirm: when a quote flips to `confirmed` (currently in `backstage/[token].js:88-89`), also set `quotes.client_fee_eur = round(confirmed_total × 0.02, 2)`. Put this write next to the `UPDATE quotes SET status='confirmed'` so both lock atomically.
- **`backstage/[token].js:84-101`**: extend the "all confirmed" block to also stamp `client_fee_eur`.

### 3d. Ledger shows both sides
- **`src/quotesPanel.jsx:212–285`**: the ledger currently sums only `commission_eur` (venue/provider side). Add a second line for `client_fee_eur` and a combined total:
  - `Venue booking fees` = Σ `commission_eur`
  - `Planner service fees` = Σ `client_fee_eur`
  - `Total RT take` = both.

### 3e. What the client sees + Terms (⚠️ correctness)
- **`src/planEvent.jsx`** (totals, ~line 130–200 / 380–430): add a visible **"RT service fee (2%)"** line under the package total so the client isn't surprised.
- **`src/legalPages.jsx:70-73` — MUST change.** It currently promises the client the fee "does not change the price shown to you" and is charged to *providers*. Once the planner pays 2%, that sentence is **false**. Rewrite to disclose the planner service fee explicitly (see §5 draft).
- **`src/PricingModal.jsx`**: reconcile "Secure payment / 7-day free trial" copy — that's SaaS-subscription language that doesn't match a per-booking fee model. Decide which billing story is true and make the copy match.

### 3f. Do **not** wire Stripe yet
Wiring Stripe Connect to auto-collect the 4% would make RT a **payment facilitator** (KYC, merchant obligations, more liability) — directly against the "no liabilities" goal. Stay on the **invoice-the-fee ledger**. Revisit only when leakage actually hurts.

---

## 4. Staffing liability — the real exposure (Germany-specific)

**Where it lives in code:** the `staff` provider `kind` (`functions/api/providers.js:8`, `assist.js:37-45`, priced crew in `planEvent.jsx`) and the internal 7-person roster (`src/data/team.js`).

**The risk:** in Germany, supplying workers to a client's event can trigger
- **AÜG (Arbeitnehmerüberlassung)** — labor leasing needs a licence; and
- **Scheinselbstständigkeit** — "freelance" crew who are really employed → back-taxes, social-insurance liability, personal exposure for the operator.

**Structure to stay a neutral marketplace (no staffing liability):**
1. **Introducer, not employer** — RT connects; it does not hire, schedule, direct, or pay wages to crew.
2. **Staffing = independent third party** — either genuinely independent contractors invoicing the client directly, or a **separate staffing company** that is the employer and carries the liability. RT only *lists* them.
3. **Take no fee on labor** — exclude `staff` from the fee chain (§2 decision 3). Not profiting from placement weakens the "you're really the staffing agent" argument.
4. **ToS says it in words** — providers independent, RT not a party to the service contract, not employer/agent, no wage handling (see §5).
5. **Wall off the internal roster** (`team.js`) — used for ops task assignment only. If those people work client events for pay, that's *your own* staffing operation and a genuine employment relationship — keep it a separate legal/contractual track, never surfaced as bookable client-facing crew.

**Flag:** items 1–5 are structuring logic. The **AÜG / Scheinselbstständigkeit determination needs a German Arbeitsrecht lawyer** before real crew + real money — it is strict and personally liable. Bundle it with the already-pending "founding-member terms need lawyer review."

---

## 5. ToS / marketplace-disclaimer — DRAFT for lawyer review

> **NOT LEGAL ADVICE.** German B2C terms (AGB) and §5 DDG / DSGVO have strict form requirements. A lawyer must review before use. Replace the current `src/legalPages.jsx` ClientTerms body with a reviewed version of the below.

**Nature of the service.** RT Network (Rising Tide Collective) is an **introduction and booking-facilitation platform**. It connects event organizers with independent providers (venues, catering, DJ/AV, crew, photography) so each can confirm availability and price. **RT Network is not a party to any contract for services** between an organizer and a provider.

**Independence of providers.** All providers are **independent businesses**, solely responsible for their own services, personnel, employment obligations, social-insurance and tax compliance, insurance, and any required licences (including, where applicable, under the Arbeitnehmerüberlassungsgesetz). **RT Network is not the employer, agent, or supplier of any provider or of any provider's staff, does not supervise or direct their personnel, and does not collect or disburse wages.**

**Staffing/crew.** Where crew or staffing is listed, it is provided by an **independent provider that is the employer of, and solely responsible for, its personnel**. RT Network neither employs nor leases out labor.

**Fees.** RT Network charges facilitation fees: a **2% service fee** to the organizer and a **2% booking fee** to the venue on a confirmed booking. These fees are for introduction/facilitation only and **create no employment, agency, partnership, or joint-venture relationship**. Final contracts, deposits, and payment for services are agreed and settled **directly between the organizer and each confirmed provider**.

**Limitation & indemnity.** RT Network is not liable for the acts, omissions, or employment obligations of any provider. Each provider indemnifies RT Network against claims arising from its personnel or staffing obligations. [Lawyer: liability cap, consumer-law carve-outs, governing law = Germany.]

---

## 6. Immediate to-dos
- [ ] Lock the three §2 product decisions (planner = client; venue-only 2%; staffing excluded).
- [ ] Migration `0004_two_sided_fees.sql` + set venue rate 0.02 / others 0.0.
- [ ] Compute+lock `client_fee_eur` at confirm; show it to the client; extend the ledger.
- [ ] Rewrite `ClientTerms` (the "doesn't change your price" line is now false) — then lawyer review.
- [ ] German Arbeitsrecht lawyer on AÜG / Scheinselbstständigkeit + AGB, before real crew/money.
- [ ] Reconcile `PricingModal` subscription copy vs per-booking fee reality.
