CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY DEFAULT 'site_' || replace(cast(gen_random_uuid() as text), '-', ''),

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT NOT NULL
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON sites
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

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
