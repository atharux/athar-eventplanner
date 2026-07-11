import { json, bad } from '../_utils.js';
import { sendEmail, clientAllConfirmedEmail } from '../_email.js';

/* Provider backstage — capability-link auth: the token IS the identity.
   GET  /api/backstage/:token — provider profile + their gig requests
   POST /api/backstage/:token — { item_id, action: confirm|decline, reason? } */

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
  const { item_id, action, reason } = body || {};
  if (!Number.isInteger(item_id)) return bad('item_id required');
  if (action !== 'confirm' && action !== 'decline') return bad('action must be confirm or decline');

  const status = action === 'confirm' ? 'confirmed' : 'declined';
  const declinedReason = action === 'decline' && typeof reason === 'string' ? reason.slice(0, 300) : null;

  // Fetch the item first so we can compute commission_eur atomically with the update.
  const existing = await env.DB.prepare(
    `SELECT amount_eur, quote_id FROM quote_items WHERE id = ? AND provider_id = ? AND status = 'pending'`
  ).bind(item_id, provider.id).first();
  if (!existing) return bad('Already responded or not yours', 409);

  const commission = action === 'confirm' ? Math.round(existing.amount_eur * provider.commission_rate * 100) / 100 : null;

  const result = await env.DB.prepare(
    `UPDATE quote_items SET status = ?, responded_at = datetime('now'), commission_eur = ?, declined_reason = ?
     WHERE id = ? AND provider_id = ? AND status = 'pending'`
  ).bind(status, commission, declinedReason, item_id, provider.id).run();
  if (result.meta.changes === 0) return bad('Already responded or not yours', 409);

  const item = await env.DB.prepare(
    `SELECT id, label, amount_eur, status, responded_at, commission_eur FROM quote_items WHERE id = ?`
  ).bind(item_id).first();

  // If every item on this quote is now confirmed, flip the quote to
  // 'confirmed' and let the client know they're fully booked.
  if (action === 'confirm') {
    const { results: siblings } = await env.DB.prepare(
      `SELECT status FROM quote_items WHERE quote_id = ?`
    ).bind(existing.quote_id).all();
    if (siblings.length > 0 && siblings.every(s => s.status === 'confirmed')) {
      // Lock the planner service fee on the confirmed total, mirroring how each
      // provider's commission_eur locks per item. Uses the rate stored on the
      // quote (defaults to 0.02) so historical fees don't shift if the rate changes.
      const feeRow = await env.DB.prepare(
        `SELECT q.client_fee_rate AS rate,
                COALESCE(SUM(i.amount_eur), 0) AS confirmed_total
         FROM quotes q
         JOIN quote_items i ON i.quote_id = q.id AND i.status = 'confirmed'
         WHERE q.id = ?`
      ).bind(existing.quote_id).first();
      const clientFee = Math.round(feeRow.confirmed_total * (feeRow.rate ?? 0.02) * 100) / 100;

      await env.DB.prepare(
        `UPDATE quotes SET status = 'confirmed', client_fee_eur = ? WHERE id = ?`
      ).bind(clientFee, existing.quote_id).run();
      const quote = await env.DB.prepare(
        `SELECT ref, event_type, guests, client_email FROM quotes WHERE id = ?`
      ).bind(existing.quote_id).first();
      if (quote) {
        await sendEmail(env, {
          to: quote.client_email,
          subject: `RT Network — you're fully booked! (${quote.ref})`,
          html: clientAllConfirmedEmail({ ref: quote.ref, eventType: quote.event_type, guests: quote.guests }),
        });
      }
    }
  }

  return json({ ok: true, item: { ...item, payout_eur: payout(item.amount_eur, provider.commission_rate) } });
}
