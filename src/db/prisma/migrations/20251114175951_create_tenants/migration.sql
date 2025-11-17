CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  plan_code TEXT NOT NULL REFERENCES plans(code),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
