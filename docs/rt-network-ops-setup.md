# RT Network — Production Setup Checklist

## Already done (as of this doc)
- [x] D1 database `rt-network` created (EU region, EEUR) and bound in `wrangler.toml`
- [x] `providers`, `quotes`, `quote_items` schema migrated; 10 founding providers seeded
- [x] `ADMIN_TOKEN` Pages secret set (paste into CRM → Settings → RT Admin API Token)
- [x] Root URL (`/`) serves the client quote builder; operator CRM moved to `/#ops`

## Before real clients/providers touch this — required

1. **Fill the Impressum** (`src/legalPages.jsx`, `Impressum` component) — legal entity name, address, and (if applicable) USt-ID / Handelsregister. Required under §5 DDG.
2. **Fill the Datenschutzerklärung** (`src/legalPages.jsx`, `Datenschutz` component) — confirm the email-provider subprocessor line once Resend is live, and set a real data-retention period.
3. **Review `docs/rt-network-terms.md`** with a lawyer before founding providers sign — it's a plain-language starting point, not a contract.
4. **Clean the production database** of any test/smoke quotes:
   ```
   npx wrangler d1 execute rt-network --remote --command "DELETE FROM quotes WHERE client_email LIKE '%@example.com' OR client_email = 'smoke@risingtide.store'"
   npx wrangler d1 execute rt-network --remote --command "DELETE FROM quote_items WHERE quote_id NOT IN (SELECT id FROM quotes)"
   ```

## Recommended before first real booking

5. **Email notifications (Resend)** — without these, clients and providers only find out about a request by checking the app manually.
   ```
   npx wrangler pages secret put RESEND_API_KEY --project-name athareventplanner-crm
   npx wrangler pages secret put RESEND_FROM --project-name athareventplanner-crm
   # RESEND_FROM value example: "RT Network <hello@risingtide.store>"
   # The domain in RESEND_FROM must be verified in the Resend dashboard first.
   ```
6. **Turnstile (spam protection on public quote submission)** — optional but recommended once the link is shared publicly:
   ```
   # Create a Turnstile widget in the Cloudflare dashboard, then:
   npx wrangler pages secret put TURNSTILE_SECRET_KEY --project-name athareventplanner-crm
   ```
   Also set `VITE_TURNSTILE_SITE_KEY` as a **build-time environment variable** in the Pages project settings (Settings → Environment variables — not a secret, this one is public by design).
7. **Custom domain** — replace `athareventplanner-crm.pages.dev` in Pages project settings with e.g. `app.risingtide.store`. The scraper Worker's CORS allowlist already includes `events.atharux.com` and `athareventplanner-crm.pages.dev`; add the final domain there too if different (`venue-outreach-db/worker/wrangler.toml`).

## Concierge chat (still optional, from the prior build)
```
npx wrangler pages secret put GROQ_API_KEY --project-name athareventplanner-crm
npx wrangler pages secret put OPENROUTER_API_KEY --project-name athareventplanner-crm
```
Without these, the concierge chat automatically falls back to a deterministic scripted Q&A — the feature never breaks either way.

## Full secret/env inventory

| Name | Type | Required? | Purpose |
|---|---|---|---|
| `ADMIN_TOKEN` | Pages secret | Yes (set) | Operator Quotes tab auth |
| `RESEND_API_KEY` | Pages secret | Recommended | Email notifications |
| `RESEND_FROM` | Pages secret | Recommended | Verified sending address |
| `TURNSTILE_SECRET_KEY` | Pages secret | Optional | Server-side spam check |
| `VITE_TURNSTILE_SITE_KEY` | Build-time env var (public) | Optional | Client-side widget |
| `GROQ_API_KEY` | Pages secret | Optional | Concierge chat, tier 1 |
| `OPENROUTER_API_KEY` | Pages secret | Optional | Concierge chat, fallback tiers |
| `VITE_SCRAPER_URL` | Build-time env var | Optional | Overrides the default venue-scraper Worker |
