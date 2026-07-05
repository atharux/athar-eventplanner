import { json, bad, safeEqual } from './_utils.js';

/* POST /api/quotes — public: client submits an assembled package.
   GET  /api/quotes — admin: operator lists quotes (Bearer ADMIN_TOKEN). */

const EVENT_TYPES = new Set(['wedding', 'corporate', 'party']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BODY = 32 * 1024;

export async function onRequestPost({ request, env }) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) return bad('Request too large', 413);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return bad('Invalid JSON');
  }

  const { event_type, event_date, guests, budget, client_name, client_email, client_phone, items, payload } = body;

  if (!EVENT_TYPES.has(event_type)) return bad('Invalid event_type');
  if (!Number.isInteger(guests) || guests < 1 || guests > 600) return bad('guests must be an integer 1-600');
  if (budget != null && (!Number.isFinite(budget) || budget < 0)) return bad('Invalid budget');
  if (typeof client_name !== 'string' || !client_name.trim()) return bad('client_name required');
  if (typeof client_email !== 'string' || !EMAIL_RE.test(client_email)) return bad('Valid client_email required');
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) return bad('items must contain 1-20 entries');
  for (const it of items) {
    if (typeof it?.provider_id !== 'string' || typeof it?.label !== 'string') return bad('Invalid item');
    if (!Number.isFinite(it?.amount_eur) || it.amount_eur <= 0) return bad('Invalid item amount');
  }

  // Every provider_id must exist.
  const ids = [...new Set(items.map(i => i.provider_id))];
  const marks = ids.map(() => '?').join(',');
  const { results: known } = await env.DB.prepare(
    `SELECT id FROM providers WHERE id IN (${marks})`
  ).bind(...ids).all();
  if (known.length !== ids.length) {
    const knownSet = new Set(known.map(r => r.id));
    return bad(`Unknown provider: ${ids.find(i => !knownSet.has(i))}`);
  }

  const ref = `RT-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
  const quoteResult = await env.DB.prepare(
    `INSERT INTO quotes (ref, event_type, event_date, guests, budget, client_name, client_email, client_phone, payload_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    ref, event_type, event_date ?? null, guests, budget ?? null,
    client_name.trim(), client_email.trim(), client_phone ?? null,
    JSON.stringify({ ...body, payload: payload ?? null })
  ).run();
  const quoteId = quoteResult.meta.last_row_id;

  await env.DB.batch(items.map(it =>
    env.DB.prepare(
      `INSERT INTO quote_items (quote_id, provider_id, label, amount_eur) VALUES (?, ?, ?, ?)`
    ).bind(quoteId, it.provider_id, it.label, it.amount_eur)
  ));

  return json({ ok: true, ref }, 201);
}

export async function onRequestGet({ request, env }) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!safeEqual(token, env.ADMIN_TOKEN)) return bad('Unauthorized', 401);

  const { results: rows } = await env.DB.prepare(
    `SELECT q.id AS quote_id, q.ref, q.event_type, q.event_date, q.guests, q.budget,
            q.client_name, q.client_email, q.client_phone, q.status AS quote_status,
            q.created_at, q.payload_json,
            i.id AS item_id, i.provider_id, i.label, i.amount_eur, i.status AS item_status, i.responded_at,
            p.name AS provider_name, p.kind AS provider_kind
     FROM quotes q
     LEFT JOIN quote_items i ON i.quote_id = q.id
     LEFT JOIN providers p ON p.id = i.provider_id
     ORDER BY q.id DESC, i.id ASC
     LIMIT 1000`
  ).all();

  const byId = new Map();
  for (const r of rows) {
    if (!byId.has(r.quote_id)) {
      byId.set(r.quote_id, {
        id: r.quote_id, ref: r.ref, event_type: r.event_type, event_date: r.event_date,
        guests: r.guests, budget: r.budget, client_name: r.client_name,
        client_email: r.client_email, client_phone: r.client_phone,
        status: r.quote_status, created_at: r.created_at, payload_json: r.payload_json,
        items: [],
      });
    }
    if (r.item_id != null) {
      byId.get(r.quote_id).items.push({
        id: r.item_id, provider_id: r.provider_id, provider_name: r.provider_name,
        kind: r.provider_kind, label: r.label, amount_eur: r.amount_eur,
        status: r.item_status, responded_at: r.responded_at,
      });
    }
  }
  return json({ quotes: [...byId.values()].slice(0, 200) });
}
