-- Viral Plug Media — PostgreSQL 17 Master Schema Migration

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table (Role-based authentication & permissions)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'CLIENT', 'EVENT_DIRECTOR', 'MEDIA_LEAD', 'STRATEGIST', 'ACCOUNT_MANAGER')),
  has_admin_access BOOLEAN NOT NULL DEFAULT FALSE,
  is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  service_type VARCHAR(100),
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

-- 5. Campaigns Table (Passive, Active, Completed & Cancelled Event Campaigns)
CREATE TABLE IF NOT EXISTS campaigns (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(50),
  category VARCHAR(50) NOT NULL,
  event_type VARCHAR(100),
  request_type VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'PASSIVE_REQUEST',
  cancellation_reason TEXT,
  start_date DATE,
  end_date DATE,
  event_date DATE,
  location VARCHAR(255),
  thumbnail_url TEXT,
  budget_inr NUMERIC(12, 2) NOT NULL DEFAULT 0,
  progress_pct INTEGER NOT NULL DEFAULT 0,
  current_step_name VARCHAR(255),
  custom_criteria JSONB DEFAULT '[]'::jsonb,
  team_members JSONB DEFAULT '[]'::jsonb,
  budget_breakdown JSONB DEFAULT '{}'::jsonb,
  metrics JSONB NOT NULL DEFAULT '{"views": 0, "clicks": 0, "leads": 0, "roas": 0}'::jsonb,
  hero_media_id VARCHAR(100) REFERENCES media_assets(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_event_date ON campaigns(event_date);

-- 6. Dynamic Campaign Steps Table
CREATE TABLE IF NOT EXISTS campaign_steps (
  id VARCHAR(100) PRIMARY KEY,
  campaign_id VARCHAR(100) REFERENCES campaigns(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL DEFAULT 'PHOTO_UPLOAD' CHECK (task_type IN ('PHOTO_UPLOAD', 'VIDEO_UPLOAD', 'FILE_SUBMISSION', 'FORM_FILL', 'APPROVAL', 'MILESTONE')),
  deadline TIMESTAMPTZ,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED')),
  client_submission JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_steps_camp_id ON campaign_steps(campaign_id, step_number);

-- 7. Communications & Integrated Message Logs Table
CREATE TABLE IF NOT EXISTS communications (
  id VARCHAR(100) PRIMARY KEY,
  campaign_id VARCHAR(100) REFERENCES campaigns(id) ON DELETE SET NULL,
  client_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('EMAIL', 'WHATSAPP', 'SYSTEM_LOG', 'NOTE')),
  sender VARCHAR(255) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comms_campaign_id ON communications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_comms_client_id ON communications(client_id);
CREATE INDEX IF NOT EXISTS idx_comms_type ON communications(type);

-- 8. Working Email Credentials Table (Super Admin System)
CREATE TABLE IF NOT EXISTS working_emails (
  id VARCHAR(100) PRIMARY KEY,
  professional_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  department VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plain_temp_password VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  created_by VARCHAR(255) NOT NULL DEFAULT 'Super Admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_working_emails_email ON working_emails(email);

-- 9. Festival Themes Extension Table
CREATE TABLE IF NOT EXISTS festival_themes (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  festival_type VARCHAR(50) NOT NULL CHECK (festival_type IN ('RAKHI', 'DIWALI', 'EID', 'CHRISTMAS', 'CUSTOM')),
  description TEXT,
  color_scheme JSONB NOT NULL,
  elements JSONB NOT NULL,
  media_assets JSONB NOT NULL DEFAULT '[]'::jsonb,
  auto_expiry_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  is_custom BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Real-time Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id VARCHAR(100) PRIMARY KEY,
  actor_name VARCHAR(255) NOT NULL,
  actor_role VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target VARCHAR(255) NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_time ON activity_logs(timestamp DESC);

-- 11. Historical Deals Table (Grounding context for AI Deal Estimator)
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

-- 12. Invoices Table
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

-- 13. Payments Table
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

-- 14. Audit Logs Table
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

-- 15. Services Table
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

-- 16. Case Studies Table
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

-- 17. App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. Landing Page Versions Table (draft/publish CMS store)
CREATE TABLE IF NOT EXISTS landing_page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  config JSONB NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  published_by UUID REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_landing_one_published ON landing_page_versions ((status = 'published')) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_landing_version_status ON landing_page_versions(status, version_number DESC);

-- Idempotent column alterations for pre-existing tables
ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS client_email VARCHAR(255);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS event_type VARCHAR(100);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS request_type VARCHAR(100);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS event_date DATE;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS progress_pct INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS current_step_name VARCHAR(255);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS custom_criteria JSONB DEFAULT '[]'::jsonb;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS budget_breakdown JSONB DEFAULT '{}'::jsonb;

-- Landing Page CMS columns on verticals (cards)
ALTER TABLE verticals ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE verticals ADD COLUMN IF NOT EXISTS cta_text VARCHAR(100) DEFAULT 'Launch Niche Campaign';
ALTER TABLE verticals ADD COLUMN IF NOT EXISTS cta_url TEXT;
ALTER TABLE verticals ADD COLUMN IF NOT EXISTS accent_color VARCHAR(20);
ALTER TABLE verticals ADD COLUMN IF NOT EXISTS card_bg_color VARCHAR(20);
ALTER TABLE verticals ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Landing Page CMS columns on media_assets (real upload metadata)
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS alt_text VARCHAR(255);
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS storage_key TEXT;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS original_filename VARCHAR(255);