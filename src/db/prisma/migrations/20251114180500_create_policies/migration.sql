CREATE TABLE policies (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  name TEXT NOT NULL,
  resource TEXT NOT NULL,       -- 'documents', 'billing', 'projects'
  action TEXT NOT NULL,         -- 'read', 'write', 'delete'
  effect TEXT NOT NULL CHECK (effect IN ('ALLOW','DENY')),
  condition JSONB NOT NULL,     -- JSON rule, see below
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
