import { json, bad } from '../_utils.js';

/* Provider backstage — capability-link auth: the token IS the identity.
   GET  /api/backstage/:token — provider profile + their gig requests
   POST /api/backstage/:token — { item_id, action: confirm|decline } */

async function providerByToken(env, token) {
  if (typeof token !== 'string' || token.length < 8 || token.length > 64) return null;
  return env.DB.prepare(
    `SELECT id, name, kind, founding, commission_rate FROM providers WHERE token = ?`
  ).bind(token).first();
}

function payout(amount, rate) {
  return Math.round(amount * (1 - rate) * 100) / 100;
}

export async function onRequestGet({ params, env }) {
  const provider = await providerByToken(env, params.token);
  if (!provider) return bad('Unknown token', 404);

  const { results } = await env.DB.prepare(
    `SELECT i.id, i.label, i.amount_eur, i.status, i.responded_at,
            q.ref AS quote_ref, q.event_type, q.event_date, q.guests
     FROM quote_items i
     JOIN quotes q ON q.id = i.quote_id
     WHERE i.provider_id = ?
     ORDER BY CASE i.status WHEN 'pending' THEN 0 ELSE 1 END, i.id DESC
     LIMIT 200`
  ).bind(provider.id).all();

  return json({
    provider: {
      name: provider.name, kind: provider.kind,
      founding: !!provider.founding, commission_rate: provider.commission_rate,
    },
    items: results.map(r => ({
      id: r.id, quote_ref: r.quote_ref, event_type: r.event_type,
      event_date: r.event_date, guests: r.guests, label: r.label,
      amount_eur: r.amount_eur, payout_eur: payout(r.amount_eur, provider.commission_rate),
      status: r.status, responded_at: r.responded_at,
    })),
  });
}

export async function onRequestPost({ params, request, env }) {
  const provider = await providerByToken(env, params.token);
  if (!provider) return bad('Unknown token', 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return bad('Invalid JSON');
  }
  const { item_id, action } = body || {};
  if (!Number.isInteger(item_id)) return bad('item_id required');
  if (action !== 'confirm' && action !== 'decline') return bad('action must be confirm or decline');

  const status = action === 'confirm' ? 'confirmed' : 'declined';
  const result = await env.DB.prepare(
    `UPDATE quote_items SET status = ?, responded_at = datetime('now')
     WHERE id = ? AND provider_id = ? AND status = 'pending'`
  ).bind(status, item_id, provider.id).run();

  if (result.meta.changes === 0) return bad('Already responded or not yours', 409);

  const item = await env.DB.prepare(
    `SELECT id, label, amount_eur, status, responded_at FROM quote_items WHERE id = ?`
  ).bind(item_id).first();
  return json({ ok: true, item: { ...item, payout_eur: payout(item.amount_eur, provider.commission_rate) } });
}
