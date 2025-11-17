CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  endpoint_id UUID NOT NULL REFERENCES webhook_endpoints(id),
  event_type TEXT NOT NULL,         -- 'role.updated', 'policy.updated', 'user.role_assigned'
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING','SUCCESS','FAILED')),
  attempt_count INT NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
