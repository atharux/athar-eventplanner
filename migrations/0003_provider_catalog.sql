-- RT Network — provider catalog fields, so D1 becomes the single source of
-- truth for what's bookable (previously the client catalog was static,
-- baked into the deployed bundle — a provider row alone couldn't be booked).

ALTER TABLE providers ADD COLUMN pricing_model TEXT;      -- 'flat' | 'per_person' | 'per_hour'
ALTER TABLE providers ADD COLUMN pricing_amount REAL;
ALTER TABLE providers ADD COLUMN blurb TEXT;
ALTER TABLE providers ADD COLUMN capacity_standing INTEGER; -- venues only
ALTER TABLE providers ADD COLUMN capacity_seated INTEGER;   -- venues only
ALTER TABLE providers ADD COLUMN address TEXT;              -- venues only
ALTER TABLE providers ADD COLUMN active INTEGER NOT NULL DEFAULT 1; -- soft-disable, never delete history
