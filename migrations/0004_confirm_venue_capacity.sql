-- RT Network — confirm Fluxbau + Lilium venue details against their public
-- berlin-cuisine.com listings, replacing the earlier placeholder capacities
-- (both were seeded at 300 standing in scripts/backfill-provider-pricing.sql).
-- Lilium: 500 m² indoor + Spree terrace, Loft config 250 standing / 150 seated.
-- Fluxbau: 550 m² over two floors + Spree terrace, up to ~250 guests.
-- Idempotent — safe to re-run.

UPDATE providers SET
  capacity_standing=250, capacity_seated=150,
  blurb='Waterside Art Deco loft at the Oberbaum Bridge — 500 m² indoor + terrace on the Spree, in-house bar, grand piano.'
  WHERE id='lilium';

UPDATE providers SET
  capacity_standing=250, capacity_seated=150,
  blurb='Riverside venue on the Spree next to Lilium — 550 m² over two floors + terrace; co-rental with Lilium for combined events up to 600 guests.'
  WHERE id='fluxbau';
