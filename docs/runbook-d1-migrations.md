# Runbook — apply D1 migrations 0004 + 0005 (two-sided fees)

Applies the two new migrations from PR #29 to the `rt-network` D1 database.
`0001`–`0003` are already live in production; wrangler tracks applied migrations,
so only `0004` and `0005` will run.

| | |
|---|---|
| Database name | `rt-network` |
| Binding | `DB` |
| Database id | `55f7dc75-09c5-4116-9a9c-fb53e97a4c88` |
| Migrations dir | `./migrations` |
| Wrangler | 4.x (`npx wrangler`) |

**What they do**
- `0004_two_sided_fees.sql` — **additive**: adds `quotes.client_fee_rate` (default `0.02`) + `quotes.client_fee_eur`. Safe.
- `0005_flat_fee_staff_exempt.sql` — **data update**: sets `providers.commission_rate` to `0.02` for non-staff and `0.0` for staff. Idempotent (fixed target values), but it overwrites existing rates.

> ⚠️ **Ordering:** apply these to remote **before** the new code serves traffic. The updated `quotes.js` GET selects `q.client_fee_eur`; if the column doesn't exist yet, that query errors. Apply migrations → then deploy/merge.

---

## 0. Prereqs (once)

```bash
cd /Users/a1/code/athar-eventplanner
npx wrangler login                 # if not already; opens browser
npx wrangler whoami                # confirm the correct Cloudflare account
```

## 1. Preview what will run

```bash
npx wrangler d1 migrations list rt-network --local     # against local state
npx wrangler d1 migrations list rt-network --remote    # against production
```
Expect both to show `0004_two_sided_fees.sql` and `0005_flat_fee_staff_exempt.sql` as unapplied.

## 2. Apply LOCAL first and test

```bash
npx wrangler d1 migrations apply rt-network --local
```
Then run the app against local D1 and exercise a quote → confirm flow:
```bash
npx wrangler pages dev            # serves functions + local D1
```
Sanity-check the local DB:
```bash
npx wrangler d1 execute rt-network --local \
  --command "SELECT name FROM pragma_table_info('quotes') WHERE name IN ('client_fee_rate','client_fee_eur');"
npx wrangler d1 execute rt-network --local \
  --command "SELECT kind, commission_rate FROM providers ORDER BY kind;"
```
Expect: both `client_fee_*` columns present; every non-staff `commission_rate = 0.02`, staff `= 0.0`.

## 3. Back up production, then apply REMOTE

**Snapshot first** (0005 overwrites rates — keep a restore point):
```bash
npx wrangler d1 export rt-network --remote --output "backup-rt-network-$(date +%Y%m%d-%H%M).sql"
```
Apply:
```bash
npx wrangler d1 migrations apply rt-network --remote
```
(wrangler prompts for confirmation on remote — review the file list, then yes.)

## 4. Verify production

```bash
# New columns exist
npx wrangler d1 execute rt-network --remote \
  --command "SELECT name FROM pragma_table_info('quotes') WHERE name IN ('client_fee_rate','client_fee_eur');"

# Flat 2% / staff-exempt applied
npx wrangler d1 execute rt-network --remote \
  --command "SELECT kind, commission_rate, COUNT(*) FROM providers GROUP BY kind, commission_rate ORDER BY kind;"

# Confirm no fee-bearing provider is still on a legacy rate
npx wrangler d1 execute rt-network --remote \
  --command "SELECT id, kind, commission_rate FROM providers WHERE (kind != 'staff' AND commission_rate != 0.02) OR (kind = 'staff' AND commission_rate != 0.0);"
```
The last query should return **zero rows**.

## 5. Deploy the code
Merge PR #29 → Cloudflare Pages builds and deploys `athareventplanner-crm` from the pushed branch. The Functions now read `client_fee_eur` and lock the planner fee at confirmation.

---

## Rollback notes
- **0004** is additive — nothing reads the columns until the new code deploys, so leaving them in place is harmless even if you revert the code.
- **0005** overwrote rates. To restore prior rates, re-import from the `backup-rt-network-*.sql` snapshot from step 3, or set specific rows back manually:
  ```bash
  npx wrangler d1 execute rt-network --remote \
    --command "UPDATE providers SET commission_rate = 0.10 WHERE id = '<id>';"
  ```
- There is no destructive column drop; a full rollback is code-revert + (optionally) rate restore.

## Gotchas
- `d1 migrations apply` requires an explicit `--local` or `--remote` — there is no default target.
- Run from the repo root so wrangler finds `./migrations` and `wrangler.toml`.
- This is a **Pages** project — migrations are applied with `wrangler d1` independently of the Pages deploy; they are not run automatically on deploy.
