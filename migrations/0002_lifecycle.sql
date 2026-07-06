-- RT Network — booking lifecycle + commission ledger support.

-- Locks in the commission rate at confirmation time (protects historical
-- bookings if a provider's rate changes later); NULL until confirmed.
ALTER TABLE quote_items ADD COLUMN commission_eur REAL;

-- Captured on decline for future network-memory use (Cognee) — optional,
-- never required.
ALTER TABLE quote_items ADD COLUMN declined_reason TEXT;

-- Quote-level lifecycle beyond "submitted": confirmed (all items
-- confirmed), completed (operator marks after the event), cancelled.
-- No CHECK constraint change needed — quotes.status was always free text.
