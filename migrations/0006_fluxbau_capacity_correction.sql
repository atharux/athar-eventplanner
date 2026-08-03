-- RT Network — correct FluxBau's D1 row to match the real booking PDF.
--
-- 0004_confirm_venue_capacity.sql set FluxBau to 250/150 standing/seated
-- and a "co-rental up to 600 guests" claim, sourced from a berlin-cuisine.com
-- listing. PR #28 (2026-08-03) found FluxBau's own booking PDF instead: the
-- only hard guest-count figure it documents is a 90-guest SEATED wedding
-- layout on the terrace, no standing/seated max stated anywhere. That fix
-- landed in src/data/catalog.js (the static fallback) but this migration —
-- the actual source /api/catalog serves from — was never written, so the
-- live database kept serving the old, wrong figures. This corrects it.
--
-- Both capacity keys are floored to the one confirmed number rather than
-- guessing higher; confirm the real max with FluxBau directly before
-- quoting anything larger. Idempotent — safe to re-run.

UPDATE providers SET
  capacity_standing = 90,
  capacity_seated = 90,
  address = 'Pfuelstr. 5, 10997 Berlin — 2nd Hofeingang (courtyard entrance), directly on the Spree. U1 Schlesisches Tor.',
  blurb = '550 m² over two floors (ground-floor dining hall + basement dance floor & stage) plus a 120 m² Spree-side terrace with Fernsehturm and Oberbaumbrücke views. Same address as Lilium — the two share a building.'
  WHERE id = 'fluxbau';
