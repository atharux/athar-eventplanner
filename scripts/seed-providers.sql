-- RT Network founding providers — TEMPLATE.
-- REPLACE_TOKEN_* placeholders are substituted with real random tokens at
-- apply time (openssl rand -hex 16); the substituted file is never committed.
-- Provider ids MUST match src/data/catalog.js ids (the client→backstage join key).

INSERT OR IGNORE INTO providers (id, name, kind, contact, token, founding, commission_rate) VALUES
 ('lilium',       'Lilium Berlin',      'venue',    'hello@risingtide.store', 'REPLACE_TOKEN_LILIUM',   1, 0.02),
 ('fluxbau',      'Fluxbau',            'venue',    'hello@risingtide.store', 'REPLACE_TOKEN_FLUXBAU',  1, 0.02),
 ('catering-std', 'Catering — buffet',  'catering', NULL,                     'REPLACE_TOKEN_CATERING', 1, 0.02),
 ('dj-av',        'DJ + AV package',    'dj_av',    NULL,                     'REPLACE_TOKEN_DJAV',     1, 0.02),
 ('staff',        'Event crew',         'staff',    NULL,                     'REPLACE_TOKEN_STAFF',    1, 0.02),
 ('photo',        'Photographer',       'photo',    NULL,                     'REPLACE_TOKEN_PHOTO',    1, 0.02);
