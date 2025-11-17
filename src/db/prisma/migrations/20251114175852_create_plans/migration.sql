CREATE TABLE plans (
  code TEXT PRIMARY KEY,                    -- 'STARTUP', 'GROWTH'
  name TEXT NOT NULL,
  api_limit INT NOT NULL,                   -- monthly
  event_limit INT NOT NULL,                 -- monthly
  webhook_limit INT NOT NULL,               -- monthly
  max_users INT NOT NULL,
  overage_per_1000_minor BIGINT NOT NULL,   -- e.g. 10 = ₹0.10 per 1000 events
  soft_limit_ratio NUMERIC(4,3) NOT NULL DEFAULT 0.800, -- 0.800 = 80%
  created_at TIMESTAMPTZ DEFAULT NOW()
);
