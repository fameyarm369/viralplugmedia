-- Viral Plug Media — PostgreSQL 17 Master Schema Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table (Role-based authentication & permissions)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'CLIENT')),
  has_admin_access BOOLEAN NOT NULL DEFAULT FALSE,
  is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user search by email and role
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Media Assets Table (R2 storage references + auto-extracted palettes)
CREATE TABLE IF NOT EXISTS media_assets (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (file_type IN ('image', 'video')),
  category VARCHAR(50) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  campaign_headline VARCHAR(255) NOT NULL,
  metrics JSONB DEFAULT '{}'::jsonb,
  palette JSONB NOT NULL,
  is_overridden BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_category ON media_assets(category);

-- 3. Homepage Showcase Verticals Table
CREATE TABLE IF NOT EXISTS verticals (
  id VARCHAR(100) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  hero_media_id VARCHAR(100) REFERENCES media_assets(id) ON DELETE SET NULL,
  headline VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  reach_stat VARCHAR(100) NOT NULL,
  roas_stat VARCHAR(100) NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verticals_featured ON verticals(is_featured, display_order);

-- 4. Leads Table (Public intake + CRM scoring)
CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  budget_range VARCHAR(100) NOT NULL,
  timeline VARCHAR(100) NOT NULL,
  notes TEXT,
  lead_score INTEGER NOT NULL DEFAULT 50,
  status VARCHAR(50) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'WON', 'LOST')),
  primary_media_id VARCHAR(100) REFERENCES media_assets(id) ON DELETE SET NULL,
  assigned_to VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- 5. Campaigns Table (Active & client campaigns)
CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PROPOSAL_REVIEW' CHECK (status IN ('DRAFT', 'PROPOSAL_REVIEW', 'PAYMENT_PENDING', 'ACTIVE', 'COMPLETED')),
  start_date DATE,
  end_date DATE,
  budget_inr NUMERIC(12, 2) NOT NULL DEFAULT 0,
  metrics JSONB NOT NULL DEFAULT '{"views": 0, "clicks": 0, "leads": 0, "roas": 0}'::jsonb,
  hero_media_id VARCHAR(100) REFERENCES media_assets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- 6. Historical Deals Table (Grounding context for AI Deal Estimator)
CREATE TABLE IF NOT EXISTS historical_deals (
  id VARCHAR(100) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  budget_inr NUMERIC(12, 2) NOT NULL,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  final_price_inr NUMERIC(12, 2) NOT NULL,
  roas_achieved NUMERIC(5, 2) NOT NULL DEFAULT 0,
  client_type VARCHAR(100) NOT NULL DEFAULT 'D2C',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historical_deals_category ON historical_deals(category);

-- 7. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(100) PRIMARY KEY,
  campaign_id VARCHAR(100) REFERENCES campaigns(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_inr NUMERIC(12, 2) NOT NULL,
  tax_inr NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_inr NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);

-- 8. Payments Table (Razorpay advance & milestone ledger)
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(100) PRIMARY KEY,
  invoice_id VARCHAR(100) REFERENCES invoices(id) ON DELETE SET NULL,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature TEXT,
  idempotency_key VARCHAR(255) UNIQUE,
  amount_inr NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CAPTURED', 'FAILED', 'REFUNDED')),
  method VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key);

-- 9. Audit Logs Table (Tracks security & RBAC changes)
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  actor_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  target_id VARCHAR(100),
  old_state JSONB,
  new_state JSONB,
  ip_address VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- 10. Services Table (Dynamic database-backed offerings)
CREATE TABLE IF NOT EXISTS services (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  tagline VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  badge VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  key_features JSONB NOT NULL DEFAULT '[]'::jsonb,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  hero_image TEXT NOT NULL,
  palette JSONB NOT NULL,
  starting_price VARCHAR(100) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Case Studies Table (Dynamic database-backed proof)
CREATE TABLE IF NOT EXISTS case_studies (
  id VARCHAR(100) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  category_label VARCHAR(100) NOT NULL,
  hero_image TEXT NOT NULL,
  campaign_headline VARCHAR(255) NOT NULL,
  sticker_text VARCHAR(100) NOT NULL,
  summary TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '[]'::jsonb,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  palette JSONB NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default Settings Insert
INSERT INTO app_settings (key, value)
VALUES 
  ('advance_payment_pct', '{"percentage": 20}'::jsonb),
  ('contact_info', '{"email": "growth@viralplugmedia.com", "phone": "+91 98765 43210", "whatsapp": "919876543210"}'::jsonb)
ON CONFLICT (key) DO NOTHING;
