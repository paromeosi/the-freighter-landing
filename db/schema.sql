-- Schema waitlist — eseguire UNA volta sola nel SQL editor di Vercel Postgres
-- (Dashboard → Storage → tuo DB → Data → Query)

CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT,             -- caricatore | vettore | altro
  company TEXT,
  source TEXT,           -- hero | nav | etc
  user_agent TEXT,
  ip_hash TEXT,          -- SHA256(ip + IP_HASH_SALT)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_waitlist_created ON waitlist(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS ix_waitlist_email ON waitlist((LOWER(email)));
