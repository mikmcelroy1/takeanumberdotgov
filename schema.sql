-- Scoreboard table for the Cloudflare D1 database.
-- Apply locally:  npm run db:local
-- Apply online:   npm run db:remote
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL CHECK (length(name) = 3),       -- 3 capital letters
  ms INTEGER NOT NULL,                                -- total run time in milliseconds
  levels TEXT NOT NULL,                               -- level names played, in order, e.g. "intro,pin,human,sticker"
  ip_hash TEXT NOT NULL,                              -- one-way scrambled IP address, only used to limit posts per minute
  created_at TEXT NOT NULL DEFAULT (datetime('now'))  -- UTC
);
CREATE INDEX IF NOT EXISTS scores_by_time ON scores (ms);
CREATE INDEX IF NOT EXISTS scores_by_ip ON scores (ip_hash, created_at);
