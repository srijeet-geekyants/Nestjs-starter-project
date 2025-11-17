CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,   -- 'documents.read', 'documents.write', 'billing.read'
  description TEXT
);
