#!/usr/bin/env node
/*
 * Bulk vendor onboarding — the efficient, repeatable way to add providers.
 *
 * Adding vendors = append rows to data/vendors.seed.json, then re-run this.
 * It POSTs each vendor through /api/providers (the same endpoint the admin UI
 * uses), so token generation, founding commission, slug ids and validation all
 * stay consistent — no hand-written SQL, no deploy.
 *
 * Idempotent: it fetches the current roster first and skips any vendor whose
 * name already exists, so re-running after adding rows only inserts the new
 * ones (a raw POST would duplicate, since ids are slug+random).
 *
 * Usage:
 *   ADMIN_TOKEN=… node scripts/onboard-vendors.mjs                 # localhost:8788
 *   ADMIN_TOKEN=… API_URL=https://<pages-domain> node scripts/onboard-vendors.mjs
 *   ADMIN_TOKEN=… node scripts/onboard-vendors.mjs path/to/other.json
 *
 * Pricing note: amounts in the manifest are best-effort placeholders. Replace
 * with real quotes before treating a vendor as bookable.
 */
import { readFile } from 'node:fs/promises';

const API = (process.env.API_URL || 'http://localhost:8788').replace(/\/$/, '');
const TOKEN = process.env.ADMIN_TOKEN;
const manifestPath = process.argv[2] || new URL('../data/vendors.seed.json', import.meta.url).pathname;

if (!TOKEN) {
  console.error('ADMIN_TOKEN env var is required (the /api/providers bearer secret).');
  process.exit(2);
}

const auth = { Authorization: `Bearer ${TOKEN}` };
const vendors = JSON.parse(await readFile(manifestPath, 'utf8'));
if (!Array.isArray(vendors)) {
  console.error(`Manifest must be a JSON array of provider payloads: ${manifestPath}`);
  process.exit(2);
}

// Idempotency: skip names already onboarded.
const rosterRes = await fetch(`${API}/api/providers`, { headers: auth });
if (!rosterRes.ok) {
  console.error(`Could not read roster (${rosterRes.status}) from ${API}/api/providers — check API_URL / ADMIN_TOKEN.`);
  process.exit(1);
}
const existing = new Set((await rosterRes.json()).providers.map((p) => p.name));

let added = 0, skipped = 0, failed = 0;
for (const v of vendors) {
  if (!v?.name) { console.error('SKIP (no name):', JSON.stringify(v)); failed++; continue; }
  if (existing.has(v.name)) { console.log('skip  ', v.name, '(already onboarded)'); skipped++; continue; }

  const res = await fetch(`${API}/api/providers`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(v),
  });
  if (res.ok) {
    const { backstage_url } = await res.json();
    console.log('added ', v.name, '→', backstage_url);
    existing.add(v.name);
    added++;
  } else {
    console.error('FAIL  ', v.name, `(${res.status})`, await res.text());
    failed++;
  }
}

console.log(`\nDone: ${added} added, ${skipped} skipped, ${failed} failed.`);
process.exit(failed ? 1 : 0);
