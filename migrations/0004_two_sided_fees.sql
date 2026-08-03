-- RT Network — two-sided fee model (planner 2% service fee + venue 2% booking fee).
--
-- The VENUE side reuses the existing providers.commission_rate (set venue rows
-- to 0.02, and — per the money-flow decision doc — non-venue providers to 0.0).
-- This migration adds only the PLANNER (client) side: a service fee that locks
-- at confirmation, mirroring how quote_items.commission_eur locks per provider.

ALTER TABLE quotes ADD COLUMN client_fee_rate REAL NOT NULL DEFAULT 0.02;  -- planner service fee rate
ALTER TABLE quotes ADD COLUMN client_fee_eur  REAL;                        -- locked amount; NULL until fully confirmed
