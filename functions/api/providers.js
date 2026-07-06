import { json, bad, safeEqual } from './_utils.js';

/* GET  /api/providers — admin: full roster with pricing (Bearer ADMIN_TOKEN).
   POST /api/providers — admin: onboard a new provider. Generates its
   capability token and returns the ready-to-send backstage link — no code
   change, no deploy, no manual SQL. */

const KINDS = new Set(['venue', 'catering', 'dj_av', 'staff', 'photo']);
const MODELS = new Set(['flat', 'per_person', 'per_hour']);
const FOUNDING_RATE = 0.02;
const STANDARD_RATE = 0.10;

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function requireAdmin(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return safeEqual(token, env.ADMIN_TOKEN);
}

export async function onRequestGet({ request, env }) {
  if (!requireAdmin(request, env)) return bad('Unauthorized', 401);
  const { results } = await env.DB.prepare(
    `SELECT id, name, kind, contact, founding, commission_rate, pricing_model,
            pricing_amount, blurb, capacity_standing, capacity_seated, address, active
     FROM providers ORDER BY kind, name`
  ).all();
  return json({ providers: results });
}

export async function onRequestPost({ request, env }) {
  if (!requireAdmin(request, env)) return bad('Unauthorized', 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return bad('Invalid JSON');
  }
  const { name, kind, pricing_model, pricing_amount, blurb, contact, founding,
    capacity_standing, capacity_seated, address } = body || {};

  if (typeof name !== 'string' || !name.trim()) return bad('name required');
  if (!KINDS.has(kind)) return bad(`kind must be one of: ${[...KINDS].join(', ')}`);
  if (!MODELS.has(pricing_model)) return bad(`pricing_model must be one of: ${[...MODELS].join(', ')}`);
  if (!Number.isFinite(pricing_amount) || pricing_amount <= 0) return bad('pricing_amount must be a positive number');
  if (contact != null && typeof contact !== 'string') return bad('Invalid contact');
  if (kind === 'venue' && (!Number.isInteger(capacity_standing) || !Number.isInteger(capacity_seated))) {
    return bad('capacity_standing and capacity_seated are required for venues');
  }

  const id = `${slugify(name)}-${crypto.randomUUID().slice(0, 4)}`;
  const token = randomToken();
  const isFounding = founding !== false; // default true — onboarding is founding-era for now
  const rate = isFounding ? FOUNDING_RATE : STANDARD_RATE;

  await env.DB.prepare(
    `INSERT INTO providers (id, name, kind, contact, token, founding, commission_rate,
      pricing_model, pricing_amount, blurb, capacity_standing, capacity_seated, address, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).bind(
    id, name.trim(), kind, contact || null, token, isFounding ? 1 : 0, rate,
    pricing_model, pricing_amount, blurb || null,
    kind === 'venue' ? capacity_standing : null, kind === 'venue' ? capacity_seated : null,
    kind === 'venue' ? (address || null) : null
  ).run();

  const origin = new URL(request.url).origin;
  return json({ ok: true, id, backstage_url: `${origin}/#backstage/${token}` }, 201);
}
