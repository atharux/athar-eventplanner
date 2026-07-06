import { json } from './_utils.js';

/* GET /api/catalog — public: the live, bookable provider list. D1 is the
   source of truth; the client (src/planEvent.jsx) falls back to the static
   src/data/catalog.js list if this is unreachable (offline/local dev without
   wrangler), so onboarding a provider here never risks breaking the builder. */

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    `SELECT id, name, kind, founding, blurb, pricing_model, pricing_amount,
            capacity_standing, capacity_seated, address
     FROM providers
     WHERE active = 1 AND pricing_model IS NOT NULL
     ORDER BY kind, name`
  ).all();

  const venues = [];
  const services = [];
  for (const r of results) {
    const base = {
      id: r.id, name: r.name, kind: r.kind, founding: !!r.founding,
      blurb: r.blurb || '', pricing: { model: r.pricing_model, amount: r.pricing_amount },
    };
    if (r.kind === 'venue') {
      venues.push({ ...base, address: r.address || '', capacity: { standing: r.capacity_standing || 0, seated: r.capacity_seated || 0 } });
    } else {
      services.push(base);
    }
  }
  return json({ venues, services });
}
