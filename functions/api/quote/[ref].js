import { json, bad } from '../_utils.js';

/* Public, read-only client status lookup by quote ref. No admin auth —
   refs are unguessable (timestamp base36 + random suffix) and expose
   nothing the client didn't already submit themselves. */

export async function onRequestGet({ params, env }) {
  const ref = params.ref;
  if (typeof ref !== 'string' || !/^RT-[A-Z0-9-]{6,40}$/.test(ref)) return bad('Invalid reference', 404);

  const quote = await env.DB.prepare(
    `SELECT ref, event_type, event_date, guests, status, created_at FROM quotes WHERE ref = ?`
  ).bind(ref).first();
  if (!quote) return bad('Quote not found', 404);

  const { results: items } = await env.DB.prepare(
    `SELECT i.label, i.status, p.name AS provider_name, p.kind AS provider_kind
     FROM quote_items i JOIN providers p ON p.id = i.provider_id
     WHERE i.quote_id = (SELECT id FROM quotes WHERE ref = ?)
     ORDER BY i.id ASC`
  ).bind(ref).all();

  return json({
    ref: quote.ref, event_type: quote.event_type, event_date: quote.event_date,
    guests: quote.guests, status: quote.status, created_at: quote.created_at,
    items: items.map(i => ({ label: i.label, provider_name: i.provider_name, kind: i.provider_kind, status: i.status })),
  });
}
