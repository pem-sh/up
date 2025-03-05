CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT 'user_' || replace(cast(gen_random_uuid() as text), '-', ''),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT NOT NULL
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS health_checks (
  id TEXT PRIMARY KEY DEFAULT 'hc_' || replace(cast(gen_random_uuid() as text), '-', ''),
  user_id TEXT NOT NULL REFERENCES users(id),
  url TEXT NOT NULL,
  http_method TEXT NOT NULL,
  request_body TEXT,
  request_headers JSONB,
  content_type TEXT,
  follow_redirects BOOLEAN NOT NULL DEFAULT true,
  accepted_status_codes TEXT[] NOT NULL,
  auth_type TEXT,
  auth JSONB,

  alarm_state TEXT NOT NULL CHECK (alarm_state IN ('ok', 'alarm')) DEFAULT 'ok',

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT NOT NULL
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON health_checks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS health_check_results (
  id TEXT PRIMARY KEY DEFAULT 'hcr_' || replace(cast(gen_random_uuid() as text), '-', ''),
  health_check_id TEXT NOT NULL REFERENCES health_checks(id),
  status TEXT,
  status_code INTEGER,
  response_time_ms INTEGER,
  response_body TEXT,
  response_headers JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
