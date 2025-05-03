-- First, insert a health check
INSERT INTO "public"."health_checks" (
  "id",
  "user_id",
  "name",
  "url",
  "http_method",
  "request_headers",
  "follow_redirects",
  "accepted_status_codes",
  "created_at",
  "created_by",
  "updated_at",
  "updated_by"
) VALUES (
  'hc_9cc7204cf2b746a39bf701f3b46aa447',
  (SELECT id FROM users ORDER BY created_at ASC LIMIT 1),
  'Lorcast Homepage Check',
  'https://lorcast.com',
  'GET',
  '{"User-Agent": "HealthCheck/1.0"}',
  true,
  ARRAY['200'],
  '2025-05-02 17:00:00+00',
  'system',
  '2025-05-02 17:00:00+00',
  'system'
);

-- Function to generate random response time between 100-300ms
CREATE OR REPLACE FUNCTION random_response_time() RETURNS INTEGER AS $$
BEGIN
  RETURN 100 + floor(random() * 200);
END;
$$ LANGUAGE plpgsql;

-- Insert 1000 results over 10 minutes (600 seconds)
-- We'll generate results every 0.6 seconds on average
-- We'll simulate a 2-minute outage from 17:05:00 to 17:07:00
DO $$
DECLARE
  start_time TIMESTAMP WITH TIME ZONE := '2025-05-02 17:00:00+00';
  outage_start TIMESTAMP WITH TIME ZONE := '2025-05-02 17:05:00+00';
  outage_end TIMESTAMP WITH TIME ZONE := '2025-05-02 17:07:00+00';
  check_time TIMESTAMP WITH TIME ZONE;
  i INTEGER;
  status TEXT;
  status_code INTEGER;
  response_body TEXT;
  error TEXT;
BEGIN
  FOR i IN 1..1000 LOOP
    check_time := start_time + (i * 0.6 * interval '1 second');
    
    IF check_time >= outage_start AND check_time <= outage_end THEN
      -- During outage period
      status := 'ERROR';
      status_code := 500;
      response_body := NULL;
      error := 'Connection timeout';
    ELSE
      -- Normal operation
      status := 'OK';
      status_code := 200;
      response_body := '<!DOCTYPE html><html><head><title>Lorcast</title></head><body>OK</body></html>';
      error := NULL;
    END IF;
    
    INSERT INTO "public"."health_check_results" (
      "id",
      "health_check_id",
      "status",
      "status_code",
      "response_time_ms",
      "response_body",
      "response_headers",
      "error",
      "created_at"
    ) VALUES (
      'hcr_' || replace(cast(gen_random_uuid() as text), '-', ''),
      'hc_9cc7204cf2b746a39bf701f3b46aa447',
      status,
      status_code,
      random_response_time(),
      response_body,
      '{"content-type": "text/html; charset=utf-8", "server": "cloudflare"}',
      error,
      check_time
    );
  END LOOP;
END $$;