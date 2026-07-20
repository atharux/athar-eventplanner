-- RT Network — backfills pricing/capacity/blurb for the 10 already-seeded
-- providers, matching src/data/catalog.js exactly, so the new dynamic
-- catalog (GET /api/catalog) agrees with the static fallback on day one.
-- No secrets in this file — safe to commit and re-run (idempotent UPDATEs).

UPDATE providers SET pricing_model='flat', pricing_amount=1200,
  blurb='Waterside Art Deco loft at the Oberbaum Bridge — 500 m² indoor + terrace on the Spree, in-house bar, grand piano.',
  capacity_standing=250, capacity_seated=150, address='Pfuelstr. 5, 10997 Berlin'
  WHERE id='lilium';

UPDATE providers SET pricing_model='flat', pricing_amount=900,
  blurb='Riverside venue on the Spree next to Lilium — 550 m² over two floors + terrace; co-rental with Lilium for combined events up to 600 guests.',
  capacity_standing=250, capacity_seated=150, address='Pfuelstr. 5, 10997 Berlin (neighboring Lilium)'
  WHERE id='fluxbau';

UPDATE providers SET pricing_model='per_person', pricing_amount=18,
  blurb='Casual street-food stations — filling, fun, zero fuss.'
  WHERE id='catering-street';

UPDATE providers SET pricing_model='per_person', pricing_amount=28,
  blurb='Buffet menu incl. staff & equipment, per guest.'
  WHERE id='catering-std';

UPDATE providers SET pricing_model='per_person', pricing_amount=45,
  blurb='Plated three-course menu with service staff — wedding-grade.'
  WHERE id='catering-premium';

UPDATE providers SET pricing_model='per_hour', pricing_amount=90,
  blurb='DJ with full sound setup — PA, wireless mics, lighting.'
  WHERE id='dj-av';

UPDATE providers SET pricing_model='per_hour', pricing_amount=140,
  blurb='Headline DJ with full production — light rig, sound engineer on site.'
  WHERE id='dj-live';

UPDATE providers SET pricing_model='per_hour', pricing_amount=25,
  blurb='Door, floor, bar-back — experienced Berlin crew, per person-hour.'
  WHERE id='staff';

UPDATE providers SET pricing_model='flat', pricing_amount=600,
  blurb='Event coverage with edited gallery within a week.'
  WHERE id='photo';

UPDATE providers SET pricing_model='flat', pricing_amount=1100,
  blurb='Two-person team — full gallery plus a 3-minute highlight film.'
  WHERE id='photo-video';

-- Berlin specialty catering (placeholder per-guest estimates — confirm real event rates)
UPDATE providers SET pricing_model='per_person', pricing_amount=5,
  blurb='Gourmet popcorn Manufaktur — event popcorn bar & branded gifting stations.',
  address='Raumerstr. 32, 10437 Berlin'
  WHERE id='knalle';

UPDATE providers SET pricing_model='per_person', pricing_amount=6,
  blurb='Ice-cream patisserie — event ice-cream cart with rotating flavours.',
  address='Stargarder Str. 72, 10437 Berlin'
  WHERE id='hokey-pokey';

UPDATE providers SET pricing_model='per_person', pricing_amount=5,
  blurb='Vegan donuts — donut catering, custom letter donuts & branded boxes.',
  address='Maybachufer 8, 12047 Berlin'
  WHERE id='brammibals';
