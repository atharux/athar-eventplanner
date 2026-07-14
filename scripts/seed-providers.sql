-- RT Network founding providers — TEMPLATE.
-- REPLACE_TOKEN_* placeholders are substituted with real random tokens at
-- apply time (openssl rand -hex 16); the substituted file is never committed.
-- Provider ids MUST match src/data/catalog.js ids (the client→backstage join key).

INSERT OR IGNORE INTO providers (id, name, kind, contact, token, founding, commission_rate) VALUES
 ('lilium',       'Lilium Berlin',      'venue',    'hello@risingtide.store', 'REPLACE_TOKEN_LILIUM',   1, 0.02),
 ('fluxbau',      'Fluxbau',            'venue',    'hello@risingtide.store', 'REPLACE_TOKEN_FLUXBAU',  1, 0.02),
 ('catering-std', 'Classic buffet',  'catering', NULL,                     'REPLACE_TOKEN_CATERING', 1, 0.02),
 ('catering-street','Street-food buffet','catering',NULL,'REPLACE_TOKEN_CATSTREET',1,0.02),
 ('catering-premium','Seated 3-course dinner','catering',NULL,'REPLACE_TOKEN_CATPREM',1,0.02),
 ('dj-live','Premium DJ + light rig','dj_av',NULL,'REPLACE_TOKEN_DJLIVE',1,0.02),
 ('photo-video','Photo + video team','photo',NULL,'REPLACE_TOKEN_PHOTOVIDEO',1,0.02),
 ('dj-av',        'DJ + AV package',    'dj_av',    NULL,                     'REPLACE_TOKEN_DJAV',     1, 0.02),
 ('staff',        'Event crew',         'staff',    NULL,                     'REPLACE_TOKEN_STAFF',    1, 0.02),
 ('photo',        'Photographer',       'photo',    NULL,                     'REPLACE_TOKEN_PHOTO',    1, 0.02),
 ('knalle',       'Knalle',             'catering', 'hello@knalle.berlin',    'REPLACE_TOKEN_KNALLE',   1, 0.02),
 ('hokey-pokey',  'Hokey Pokey',        'catering', NULL,                     'REPLACE_TOKEN_HOKEY',    1, 0.02),
 ('brammibals',   'Brammibal''s',       'catering', NULL,                     'REPLACE_TOKEN_BRAMMI',   1, 0.02);
