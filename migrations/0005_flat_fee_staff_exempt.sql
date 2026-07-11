-- RT Network — flat 2% marketplace fee, staff/crew exempt.
--
-- Fee model: planner 2% (quotes.client_fee_eur) + every fee-bearing provider 2%
-- (venue, catering, dj_av, photo). Staff/crew pay 0% so RT takes no cut tied to
-- labor — see docs/money-flow-and-liability.md. Normalises any legacy rows
-- (e.g. the old 10% standard tier) to the flat model.

UPDATE providers SET commission_rate = 0.02 WHERE kind != 'staff';
UPDATE providers SET commission_rate = 0.0  WHERE kind =  'staff';
