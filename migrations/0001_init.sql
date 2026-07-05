-- RT Network — initial schema (providers, quotes, quote_items)

CREATE TABLE providers (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  kind            TEXT NOT NULL,               -- venue|catering|dj_av|staff|photo
  contact         TEXT,
  token           TEXT NOT NULL UNIQUE,        -- capability-link secret
  founding        INTEGER NOT NULL DEFAULT 0,  -- 0|1
  commission_rate REAL NOT NULL DEFAULT 0.10
);

CREATE TABLE quotes (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  ref          TEXT NOT NULL UNIQUE,
  event_type   TEXT NOT NULL CHECK (event_type IN ('wedding','corporate','party')),
  event_date   TEXT,
  guests       INTEGER NOT NULL,
  budget       REAL,
  client_name  TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  status       TEXT NOT NULL DEFAULT 'submitted',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  payload_json TEXT NOT NULL
);

CREATE TABLE quote_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id     INTEGER NOT NULL REFERENCES quotes(id),
  provider_id  TEXT NOT NULL REFERENCES providers(id),
  label        TEXT NOT NULL,
  amount_eur   REAL NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','confirmed','declined')),
  responded_at TEXT
);

CREATE INDEX idx_items_provider ON quote_items(provider_id, status);
CREATE INDEX idx_items_quote    ON quote_items(quote_id);
