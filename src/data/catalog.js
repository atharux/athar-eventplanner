/* RT Network provider catalog — the client quote builder prices from this.
   IDs must match the provider ids seeded into D1 (scripts/seed-providers.sql):
   they are the join key from a client selection to a backstage gig request.
   Pricing models: flat | per_person | per_hour. All amounts EUR. */

export const FOUNDING_COMMISSION = 0.02; // locked 2 years for founding members
export const STANDARD_COMMISSION = 0.10;

export const VENUES = [
  {
    id: 'lilium', name: 'Lilium Berlin', kind: 'venue', founding: true,
    address: 'Pfuelstr. 5, 10997 Berlin',
    blurb: 'Waterside Art Deco space at the Oberbaum Bridge — 500 m² indoor, 250 m² terrace, in-house bar, grand piano.',
    capacity: { standing: 300, seated: 150 },
    pricing: { model: 'flat', amount: 1200 },
  },
  {
    id: 'fluxbau', name: 'Fluxbau', kind: 'venue', founding: true,
    address: 'Pfuelstr. 5, 10997 Berlin (neighboring Lilium)',
    blurb: 'Riverside venue next door to Lilium — co-rental available for combined events up to 600 guests.',
    capacity: { standing: 300, seated: 150 }, // placeholder — confirm with Fluxbau
    pricing: { model: 'flat', amount: 900 },
  },
];

export const SERVICES = [
  {
    id: 'catering-std', name: 'Catering — buffet', kind: 'catering', founding: true,
    blurb: 'Buffet menu incl. staff & equipment, per guest.',
    pricing: { model: 'per_person', amount: 28 },
  },
  {
    id: 'dj-av', name: 'DJ + AV package', kind: 'dj_av', founding: true,
    blurb: 'DJ with full sound setup — PA, wireless mics, lighting.',
    pricing: { model: 'per_hour', amount: 90 },
  },
  {
    id: 'staff', name: 'Event crew', kind: 'staff', founding: true,
    blurb: 'Door, floor, bar-back — experienced Berlin crew, per person-hour.',
    pricing: { model: 'per_hour', amount: 25 },
  },
  {
    id: 'photo', name: 'Photographer', kind: 'photo', founding: true,
    blurb: 'Event coverage with edited gallery within a week.',
    pricing: { model: 'flat', amount: 600 },
  },
];

export function lineTotal(item, { guests = 0, hours = 4, headcount = 1 } = {}) {
  const { model, amount } = item.pricing;
  if (model === 'per_person') return amount * guests;
  if (model === 'per_hour') return amount * hours * (item.kind === 'staff' ? headcount : 1);
  return amount;
}

export function priceLabel(item) {
  const { model, amount } = item.pricing;
  if (model === 'per_person') return `€${amount} / guest`;
  if (model === 'per_hour') return item.kind === 'staff' ? `€${amount} / person / hour` : `€${amount} / hour`;
  return `€${amount} flat`;
}

/* Standing capacity for parties, seated for weddings/corporate. */
export function venueCapacityFor(venue, eventType) {
  return eventType === 'party' ? venue.capacity.standing : venue.capacity.seated;
}
