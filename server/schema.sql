CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY,
  idempotency_key uuid NOT NULL UNIQUE,
  payload_hash text NOT NULL,
  payload_cipher text NOT NULL,
  trace_id text NOT NULL,
  span_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);
CREATE INDEX IF NOT EXISTS leads_delivery ON leads(next_attempt_at) WHERE status='queued';
CREATE TABLE IF NOT EXISTS analytics_visits (
  id uuid PRIMARY KEY, visitor_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), last_seen timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS visits_recent ON analytics_visits(visitor_hash,last_seen);
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id uuid PRIMARY KEY,
  visitor_hash text NOT NULL,
  visit_id uuid NOT NULL REFERENCES analytics_visits(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  visible_ms bigint NOT NULL DEFAULT 0,
  ended boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS sessions_visitor ON analytics_sessions(visitor_hash);
CREATE INDEX IF NOT EXISTS sessions_recent ON analytics_sessions(last_seen);
CREATE TABLE IF NOT EXISTS analytics_events (
  event_id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK(kind IN ('page','section','click','error')),
  target varchar(80) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_by_session ON analytics_events(session_id);
-- Vistas agregadas: Grafana no necesita acceso a identificadores ni a leads.
CREATE OR REPLACE VIEW analytics_daily AS
 SELECT date_trunc('day',v.created_at) AS time, count(DISTINCT v.id) AS visits,
 count(DISTINCT v.visitor_hash) AS browsers, COALESCE(sum(s.visible_ms),0)/1000.0 AS visible_seconds
 FROM analytics_visits v LEFT JOIN analytics_sessions s ON s.visit_id=v.id GROUP BY 1;
CREATE OR REPLACE VIEW analytics_interests AS
 SELECT date_trunc('day',created_at) AS time, kind, target, count(*) AS events
 FROM analytics_events GROUP BY 1,2,3;
CREATE OR REPLACE VIEW analytics_returning AS
 SELECT count(*) AS browsers, count(*) FILTER(WHERE visits>1) AS returning_browsers
 FROM (SELECT visitor_hash,count(*) AS visits FROM analytics_visits GROUP BY 1) AS v;
INSERT INTO schema_migrations(version) VALUES(1) ON CONFLICT DO NOTHING;
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='jjti_reader') THEN
  GRANT SELECT ON analytics_daily,analytics_interests,analytics_returning TO jjti_reader;
 END IF;
END $$;
