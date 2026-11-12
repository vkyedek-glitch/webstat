-- PostgreSQL 13+ (gen_random_uuid yerleşik)

CREATE TABLE IF NOT EXISTS websites (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),       -- herkese açık Site ID
  name             text        NOT NULL,
  domain_name      text        NOT NULL UNIQUE CHECK (domain_name = lower(domain_name)),
  allow_subdomains boolean     NOT NULL DEFAULT true,
  enforce_origin   boolean     NOT NULL DEFAULT true,                -- Origin başlığı domain ile eşleşmeli
  is_active        boolean     NOT NULL DEFAULT true,
  read_token_hash  text        NOT NULL,                             -- rapor API token'ının SHA-256'sı
  retention_days   integer     CHECK (retention_days IS NULL OR retention_days > 0),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Günlük dönen tuz: ziyaretçi hash'i gün değişince geri izlenemez hale gelir
CREATE TABLE IF NOT EXISTS daily_salts (
  day  date PRIMARY KEY,
  salt text NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id      uuid        NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  visitor_hash    text        NOT NULL,
  started_at      timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz NOT NULL DEFAULT now(),
  entry_path      text,
  exit_path       text,
  referrer_domain text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_term        text,
  utm_content     text,
  device_type     text        NOT NULL DEFAULT 'desktop',  -- mobile | tablet | desktop
  os              text,
  browser         text,
  country         char(2),
  city            text,
  screen_width    integer,
  pageviews       integer     NOT NULL DEFAULT 0,
  events          integer     NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sessions_site_started_idx  ON sessions (website_id, started_at DESC);
CREATE INDEX IF NOT EXISTS sessions_lookup_idx        ON sessions (website_id, visitor_hash, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS sessions_site_lastseen_idx ON sessions (website_id, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS sessions_retention_idx     ON sessions (last_seen_at);

CREATE TABLE IF NOT EXISTS pageviews (
  id           bigserial PRIMARY KEY,
  website_id   uuid        NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  session_id   uuid        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  pid          uuid        NOT NULL,        -- istemcinin ürettiği sayfa görüntüleme kimliği (ping eşleme)
  visitor_hash text        NOT NULL,
  hostname     text,
  path         text        NOT NULL,
  title        text,
  duration_s   integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS pageviews_site_pid_uq   ON pageviews (website_id, pid);
CREATE INDEX        IF NOT EXISTS pageviews_site_time_idx ON pageviews (website_id, created_at DESC);
CREATE INDEX        IF NOT EXISTS pageviews_site_path_idx ON pageviews (website_id, path, created_at DESC);
CREATE INDEX        IF NOT EXISTS pageviews_session_idx   ON pageviews (session_id);

CREATE TABLE IF NOT EXISTS events (
  id         bigserial PRIMARY KEY,
  website_id uuid        NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  session_id uuid        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name       text        NOT NULL,
  props      jsonb,
  path       text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_site_name_idx ON events (website_id, name, created_at DESC);
CREATE INDEX IF NOT EXISTS events_session_idx   ON events (session_id);
CREATE INDEX IF NOT EXISTS events_props_gin     ON events USING gin (props jsonb_path_ops);
