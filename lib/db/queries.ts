import { query, transaction } from "./index";
import { ColorPalette, BusinessCategory, LeadStatus } from "../types";

export interface DBUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CLIENT";
  has_admin_access: boolean;
  is_mfa_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBMediaAsset {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  file_type: "image" | "video";
  category: string;
  client_name: string;
  campaign_headline: string;
  metrics: {
    views?: string;
    roas?: string;
    conversions?: string;
    impressions?: string;
    leads?: string;
  };
  palette: ColorPalette;
  is_overridden: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBVertical {
  id: string;
  category: string;
  hero_media_id: string | null;
  headline: string;
  client_name: string;
  reach_stat: string;
  roas_stat: string;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  // Joined media asset properties
  media_url?: string;
  media_title?: string;
  palette?: ColorPalette;
  file_type?: "image" | "video";
}

export interface DBLead {
  id: string;
  name: string;
  business_name: string;
  category: string;
  phone: string;
  email: string;
  budget_range: string;
  timeline: string;
  notes: string | null;
  lead_score: number;
  status: LeadStatus;
  primary_media_id: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  media?: DBMediaAsset;
}

export interface DBCampaign {
  id: string;
  title: string;
  client_id: string;
  client_name: string;
  category: string;
  status: "DRAFT" | "PROPOSAL_REVIEW" | "PAYMENT_PENDING" | "ACTIVE" | "COMPLETED";
  start_date: string | null;
  end_date: string | null;
  budget_inr: number;
  metrics: {
    views: number;
    clicks: number;
    leads: number;
    roas: number;
  };
  hero_media_id: string | null;
  created_at: string;
  updated_at: string;
  hero_media?: DBMediaAsset;
}

export interface DBHistoricalDeal {
  id: string;
  category: string;
  budget_inr: number;
  deliverables: string[];
  final_price_inr: number;
  roas_achieved: number;
  client_type: string;
  notes: string | null;
  created_at: string;
}

export interface DBInvoice {
  id: string;
  campaign_id: string;
  client_id: string;
  amount_inr: number;
  tax_inr: number;
  total_inr: number;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  campaign_title?: string;
}

export interface DBPayment {
  id: string;
  invoice_id: string | null;
  client_id: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  idempotency_key: string | null;
  amount_inr: number;
  currency: string;
  status: "PENDING" | "CAPTURED" | "FAILED" | "REFUNDED";
  method: string | null;
  created_at: string;
}

export interface DBAuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_id: string | null;
  old_state: any;
  new_state: any;
  ip_address: string | null;
  created_at: string;
}

/* ==========================================================================
   USERS & RBAC
   ========================================================================== */

export async function getUserByEmail(email: string): Promise<DBUser | null> {
  const res = await query<DBUser>("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
  return res.rows[0] || null;
}

export async function getUserById(id: string): Promise<DBUser | null> {
  const res = await query<DBUser>("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0] || null;
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  role?: "SUPER_ADMIN" | "ADMIN" | "CLIENT";
  hasAdminAccess?: boolean;
}): Promise<DBUser> {
  const res = await query<DBUser>(
    `INSERT INTO users (email, password_hash, name, role, has_admin_access, is_mfa_enabled, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, FALSE, NOW(), NOW())
     RETURNING *`,
    [
      data.email.toLowerCase().trim(),
      data.passwordHash,
      data.name.trim(),
      data.role || "CLIENT",
      data.hasAdminAccess ?? (data.role === "SUPER_ADMIN" || data.role === "ADMIN"),
    ]
  );
  return res.rows[0];
}

export async function listUsers(params?: { search?: string; limit?: number; offset?: number }): Promise<{
  users: DBUser[];
  total: number;
}> {
  let where = "";
  const values: any[] = [];

  if (params?.search) {
    values.push(`%${params.search.toLowerCase()}%`);
    where = `WHERE LOWER(name) LIKE $${values.length} OR LOWER(email) LIKE $${values.length}`;
  }

  const countRes = await query(`SELECT COUNT(*) as count FROM users ${where}`, values);
  const total = parseInt(countRes.rows[0].count, 10);

  const limit = params?.limit || 50;
  const offset = params?.offset || 0;
  values.push(limit, offset);

  const res = await query<DBUser>(
    `SELECT id, email, name, role, has_admin_access, is_mfa_enabled, last_login_at, created_at, updated_at
     FROM users
     ${where}
     ORDER BY created_at DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values
  );

  return { users: res.rows, total };
}

export async function updateUserRoleAndAccess(data: {
  userId: string;
  newRole: "SUPER_ADMIN" | "ADMIN" | "CLIENT";
  hasAdminAccess: boolean;
  actorId: string;
  actorEmail: string;
  ipAddress?: string;
}): Promise<DBUser> {
  const existing = await getUserById(data.userId);
  if (!existing) throw new Error("User not found");

  const oldState = { role: existing.role, has_admin_access: existing.has_admin_access };
  const newState = { role: data.newRole, has_admin_access: data.hasAdminAccess };

  const res = await query<DBUser>(
    `UPDATE users 
     SET role = $1, has_admin_access = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [data.newRole, data.hasAdminAccess, data.userId]
  );

  // Write audit log
  await createAuditLog({
    actorId: data.actorId,
    actorEmail: data.actorEmail,
    action: "ROLE_GRANTED",
    targetId: data.userId,
    oldState,
    newState,
    ipAddress: data.ipAddress,
  });

  return res.rows[0];
}

export async function updateUserLastLogin(id: string): Promise<void> {
  await query("UPDATE users SET last_login_at = NOW() WHERE id = $1", [id]);
}

/* ==========================================================================
   AUDIT LOGS
   ========================================================================== */

export async function createAuditLog(data: {
  actorId?: string;
  actorEmail?: string;
  action: string;
  targetId?: string;
  oldState?: any;
  newState?: any;
  ipAddress?: string;
}): Promise<void> {
  const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await query(
    `INSERT INTO audit_logs (id, actor_id, actor_email, action, target_id, old_state, new_state, ip_address, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
    [
      id,
      data.actorId || null,
      data.actorEmail || null,
      data.action,
      data.targetId || null,
      data.oldState ? JSON.stringify(data.oldState) : null,
      data.newState ? JSON.stringify(data.newState) : null,
      data.ipAddress || null,
    ]
  );
}

export async function listAuditLogs(limit: number = 20): Promise<DBAuditLog[]> {
  const res = await query<DBAuditLog>(
    "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return res.rows;
}

/* ==========================================================================
   MEDIA ASSETS
   ========================================================================== */

export async function getMediaAssetById(id: string): Promise<DBMediaAsset | null> {
  const res = await query<DBMediaAsset>("SELECT * FROM media_assets WHERE id = $1", [id]);
  return res.rows[0] || null;
}

export async function listMediaAssets(params?: { category?: string; search?: string; limit?: number }): Promise<DBMediaAsset[]> {
  const conditions: string[] = [];
  const values: any[] = [];

  if (params?.category && params.category !== "ALL") {
    values.push(params.category);
    conditions.push(`category = $${values.length}`);
  }

  if (params?.search) {
    values.push(`%${params.search.toLowerCase()}%`);
    conditions.push(`(LOWER(title) LIKE $${values.length} OR LOWER(client_name) LIKE $${values.length})`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = params?.limit || 100;
  values.push(limit);

  const res = await query<DBMediaAsset>(
    `SELECT * FROM media_assets ${where} ORDER BY created_at DESC LIMIT $${values.length}`,
    values
  );
  return res.rows;
}

export async function createMediaAsset(data: {
  id?: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  fileType: "image" | "video";
  category: string;
  clientName: string;
  campaignHeadline: string;
  metrics?: any;
  palette: ColorPalette;
  isOverridden?: boolean;
  createdBy?: string;
}): Promise<DBMediaAsset> {
  const id = data.id || `media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const res = await query<DBMediaAsset>(
    `INSERT INTO media_assets 
     (id, title, url, thumbnail_url, file_type, category, client_name, campaign_headline, metrics, palette, is_overridden, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
     RETURNING *`,
    [
      id,
      data.title,
      data.url,
      data.thumbnailUrl || null,
      data.fileType,
      data.category,
      data.clientName,
      data.campaignHeadline,
      JSON.stringify(data.metrics || {}),
      JSON.stringify(data.palette),
      data.isOverridden || false,
      data.createdBy || null,
    ]
  );
  return res.rows[0];
}

export async function updateMediaAssetPalette(
  id: string,
  palette: ColorPalette,
  isOverridden: boolean = true
): Promise<DBMediaAsset> {
  const res = await query<DBMediaAsset>(
    `UPDATE media_assets 
     SET palette = $1, is_overridden = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [JSON.stringify(palette), isOverridden, id]
  );
  return res.rows[0];
}

export async function deleteMediaAsset(id: string): Promise<void> {
  await query("DELETE FROM media_assets WHERE id = $1", [id]);
}

/* ==========================================================================
   HOMEPAGE VERTICALS / SHOWCASE
   ========================================================================== */

export async function getFeaturedVerticals(): Promise<DBVertical[]> {
  const res = await query<DBVertical>(
    `SELECT v.*, m.url as media_url, m.title as media_title, m.palette, m.file_type
     FROM verticals v
     LEFT JOIN media_assets m ON v.hero_media_id = m.id
     WHERE v.is_featured = TRUE
     ORDER BY v.display_order ASC, v.created_at DESC`
  );
  return res.rows;
}

export async function listAllVerticals(): Promise<DBVertical[]> {
  const res = await query<DBVertical>(
    `SELECT v.*, m.url as media_url, m.title as media_title, m.palette, m.file_type
     FROM verticals v
     LEFT JOIN media_assets m ON v.hero_media_id = m.id
     ORDER BY v.display_order ASC, v.created_at DESC`
  );
  return res.rows;
}

export async function createVertical(data: {
  category: string;
  heroMediaId?: string;
  headline: string;
  clientName: string;
  reachStat: string;
  roasStat: string;
  isFeatured?: boolean;
  displayOrder?: number;
}): Promise<DBVertical> {
  const id = `vert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const res = await query<DBVertical>(
    `INSERT INTO verticals 
     (id, category, hero_media_id, headline, client_name, reach_stat, roas_stat, is_featured, display_order, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
     RETURNING *`,
    [
      id,
      data.category,
      data.heroMediaId || null,
      data.headline,
      data.clientName,
      data.reachStat,
      data.roasStat,
      data.isFeatured ?? true,
      data.displayOrder || 0,
    ]
  );
  return res.rows[0];
}

export async function updateVertical(
  id: string,
  data: Partial<DBVertical>
): Promise<DBVertical> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.category !== undefined) {
    values.push(data.category);
    fields.push(`category = $${values.length}`);
  }
  if (data.hero_media_id !== undefined) {
    values.push(data.hero_media_id);
    fields.push(`hero_media_id = $${values.length}`);
  }
  if (data.headline !== undefined) {
    values.push(data.headline);
    fields.push(`headline = $${values.length}`);
  }
  if (data.client_name !== undefined) {
    values.push(data.client_name);
    fields.push(`client_name = $${values.length}`);
  }
  if (data.reach_stat !== undefined) {
    values.push(data.reach_stat);
    fields.push(`reach_stat = $${values.length}`);
  }
  if (data.roas_stat !== undefined) {
    values.push(data.roas_stat);
    fields.push(`roas_stat = $${values.length}`);
  }
  if (data.is_featured !== undefined) {
    values.push(data.is_featured);
    fields.push(`is_featured = $${values.length}`);
  }
  if (data.display_order !== undefined) {
    values.push(data.display_order);
    fields.push(`display_order = $${values.length}`);
  }

  values.push(id);
  const res = await query<DBVertical>(
    `UPDATE verticals 
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  return res.rows[0];
}

export async function deleteVertical(id: string): Promise<void> {
  await query("DELETE FROM verticals WHERE id = $1", [id]);
}

/* ==========================================================================
   LEADS & CRM
   ========================================================================== */

export async function createLead(data: {
  name: string;
  businessName: string;
  category: string;
  phone: string;
  email: string;
  budgetRange: string;
  timeline: string;
  notes?: string;
  leadScore?: number;
  primaryMediaId?: string;
  assignedTo?: string;
}): Promise<DBLead> {
  const id = `lead-${Date.now()}`;
  const res = await query<DBLead>(
    `INSERT INTO leads 
     (id, name, business_name, category, phone, email, budget_range, timeline, notes, lead_score, status, primary_media_id, assigned_to, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'NEW', $11, $12, NOW(), NOW())
     RETURNING *`,
    [
      id,
      data.name,
      data.businessName,
      data.category,
      data.phone,
      data.email,
      data.budgetRange,
      data.timeline,
      data.notes || null,
      data.leadScore || 50,
      data.primaryMediaId || null,
      data.assignedTo || "Lead Strategist",
    ]
  );
  return res.rows[0];
}

export async function listLeads(params?: { status?: string; search?: string; limit?: number }): Promise<DBLead[]> {
  const conditions: string[] = [];
  const values: any[] = [];

  if (params?.status && params.status !== "ALL") {
    values.push(params.status);
    conditions.push(`l.status = $${values.length}`);
  }

  if (params?.search) {
    values.push(`%${params.search.toLowerCase()}%`);
    conditions.push(
      `(LOWER(l.name) LIKE $${values.length} OR LOWER(l.business_name) LIKE $${values.length} OR l.phone LIKE $${values.length})`
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = params?.limit || 100;
  values.push(limit);

  const res = await query<any>(
    `SELECT l.*, row_to_json(m.*) as media
     FROM leads l
     LEFT JOIN media_assets m ON l.primary_media_id = m.id
     ${where}
     ORDER BY l.created_at DESC
     LIMIT $${values.length}`,
    values
  );

  return res.rows;
}

export async function getLeadById(id: string): Promise<DBLead | null> {
  const res = await query<any>(
    `SELECT l.*, row_to_json(m.*) as media
     FROM leads l
     LEFT JOIN media_assets m ON l.primary_media_id = m.id
     WHERE l.id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<DBLead> {
  const res = await query<DBLead>(
    `UPDATE leads 
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  return res.rows[0];
}

/* ==========================================================================
   CAMPAIGNS
   ========================================================================== */

export async function listCampaigns(params?: { clientId?: string; status?: string; category?: string }): Promise<DBCampaign[]> {
  const conditions: string[] = [];
  const values: any[] = [];

  if (params?.clientId) {
    values.push(params.clientId);
    conditions.push(`c.client_id = $${values.length}`);
  }

  if (params?.status && params.status !== "ALL") {
    values.push(params.status);
    conditions.push(`c.status = $${values.length}`);
  }

  if (params?.category && params.category !== "ALL") {
    values.push(params.category);
    conditions.push(`c.category = $${values.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const res = await query<any>(
    `SELECT c.*, row_to_json(m.*) as hero_media
     FROM campaigns c
     LEFT JOIN media_assets m ON c.hero_media_id = m.id
     ${where}
     ORDER BY c.created_at DESC`,
    values
  );
  return res.rows;
}

export async function getCampaignById(id: string): Promise<DBCampaign | null> {
  const res = await query<any>(
    `SELECT c.*, row_to_json(m.*) as hero_media
     FROM campaigns c
     LEFT JOIN media_assets m ON c.hero_media_id = m.id
     WHERE c.id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

export async function createCampaign(data: {
  title: string;
  clientId: string;
  clientName: string;
  category: string;
  status?: "DRAFT" | "PROPOSAL_REVIEW" | "PAYMENT_PENDING" | "ACTIVE" | "COMPLETED";
  startDate?: string;
  endDate?: string;
  budgetINR: number;
  metrics?: any;
  heroMediaId?: string;
}): Promise<DBCampaign> {
  const id = `camp-${Date.now()}`;
  const res = await query<DBCampaign>(
    `INSERT INTO campaigns 
     (id, title, client_id, client_name, category, status, start_date, end_date, budget_inr, metrics, hero_media_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
     RETURNING *`,
    [
      id,
      data.title,
      data.clientId,
      data.clientName,
      data.category,
      data.status || "PROPOSAL_REVIEW",
      data.startDate || null,
      data.endDate || null,
      data.budgetINR,
      JSON.stringify(data.metrics || { views: 0, clicks: 0, leads: 0, roas: 0 }),
      data.heroMediaId || null,
    ]
  );
  return res.rows[0];
}

export async function updateCampaignStatus(
  id: string,
  status: "DRAFT" | "PROPOSAL_REVIEW" | "PAYMENT_PENDING" | "ACTIVE" | "COMPLETED"
): Promise<DBCampaign> {
  const res = await query<DBCampaign>(
    `UPDATE campaigns 
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  return res.rows[0];
}

export async function updateCampaignMetrics(
  id: string,
  metrics: { views: number; clicks: number; leads: number; roas: number }
): Promise<DBCampaign> {
  const res = await query<DBCampaign>(
    `UPDATE campaigns 
     SET metrics = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [JSON.stringify(metrics), id]
  );
  return res.rows[0];
}

/* ==========================================================================
   HISTORICAL DEALS (AI Grounding)
   ========================================================================== */

export async function listHistoricalDeals(params?: { category?: string }): Promise<DBHistoricalDeal[]> {
  if (params?.category) {
    const res = await query<DBHistoricalDeal>(
      "SELECT * FROM historical_deals WHERE category = $1 ORDER BY created_at DESC",
      [params.category]
    );
    return res.rows;
  }
  const res = await query<DBHistoricalDeal>(
    "SELECT * FROM historical_deals ORDER BY created_at DESC"
  );
  return res.rows;
}

export async function createHistoricalDeal(data: {
  category: string;
  budgetINR: number;
  deliverables: string[];
  finalPriceINR: number;
  roasAchieved: number;
  clientType?: string;
  notes?: string;
}): Promise<DBHistoricalDeal> {
  const id = `deal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const res = await query<DBHistoricalDeal>(
    `INSERT INTO historical_deals 
     (id, category, budget_inr, deliverables, final_price_inr, roas_achieved, client_type, notes, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING *`,
    [
      id,
      data.category,
      data.budgetINR,
      JSON.stringify(data.deliverables),
      data.finalPriceINR,
      data.roasAchieved,
      data.clientType || "D2C",
      data.notes || null,
    ]
  );
  return res.rows[0];
}

export async function deleteHistoricalDeal(id: string): Promise<void> {
  await query("DELETE FROM historical_deals WHERE id = $1", [id]);
}

/* ==========================================================================
   INVOICES & PAYMENTS
   ========================================================================== */

export async function listInvoices(params?: { clientId?: string }): Promise<DBInvoice[]> {
  let where = "";
  const values: any[] = [];

  if (params?.clientId) {
    values.push(params.clientId);
    where = `WHERE i.client_id = $${values.length}`;
  }

  const res = await query<DBInvoice>(
    `SELECT i.*, c.title as campaign_title
     FROM invoices i
     LEFT JOIN campaigns c ON i.campaign_id = c.id
     ${where}
     ORDER BY i.created_at DESC`,
    values
  );
  return res.rows;
}

export async function createInvoice(data: {
  campaignId: string;
  clientId: string;
  amountINR: number;
  taxINR?: number;
  totalINR: number;
  status?: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate?: string;
}): Promise<DBInvoice> {
  const id = `inv-${Date.now()}`;
  const res = await query<DBInvoice>(
    `INSERT INTO invoices 
     (id, campaign_id, client_id, amount_inr, tax_inr, total_inr, status, due_date, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING *`,
    [
      id,
      data.campaignId,
      data.clientId,
      data.amountINR,
      data.taxINR || 0,
      data.totalINR,
      data.status || "PENDING",
      data.dueDate || null,
    ]
  );
  return res.rows[0];
}

export async function updateInvoiceStatus(
  id: string,
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED",
  paidAt?: Date
): Promise<DBInvoice> {
  const res = await query<DBInvoice>(
    `UPDATE invoices 
     SET status = $1, paid_at = $2
     WHERE id = $3
     RETURNING *`,
    [status, paidAt ? paidAt.toISOString() : null, id]
  );
  return res.rows[0];
}

export async function createPayment(data: {
  invoiceId?: string;
  clientId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  idempotencyKey?: string;
  amountINR: number;
  currency?: string;
  status?: "PENDING" | "CAPTURED" | "FAILED" | "REFUNDED";
  method?: string;
}): Promise<DBPayment> {
  const id = `pay-${Date.now()}`;
  const res = await query<DBPayment>(
    `INSERT INTO payments 
     (id, invoice_id, client_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, idempotency_key, amount_inr, currency, status, method, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
     RETURNING *`,
    [
      id,
      data.invoiceId || null,
      data.clientId || null,
      data.razorpayOrderId || null,
      data.razorpayPaymentId || null,
      data.razorpaySignature || null,
      data.idempotencyKey || null,
      data.amountINR,
      data.currency || "INR",
      data.status || "PENDING",
      data.method || null,
    ]
  );
  return res.rows[0];
}

export async function getPaymentByIdempotencyKey(key: string): Promise<DBPayment | null> {
  const res = await query<DBPayment>(
    "SELECT * FROM payments WHERE idempotency_key = $1",
    [key]
  );
  return res.rows[0] || null;
}

export async function updateCampaign(
  id: string,
  data: Partial<DBCampaign>
): Promise<DBCampaign> {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) {
    values.push(data.title);
    fields.push(`title = $${values.length}`);
  }
  if (data.category !== undefined) {
    values.push(data.category);
    fields.push(`category = $${values.length}`);
  }
  if (data.status !== undefined) {
    values.push(data.status);
    fields.push(`status = $${values.length}`);
  }
  if (data.budget_inr !== undefined || (data as any).budgetINR !== undefined) {
    values.push(data.budget_inr ?? (data as any).budgetINR);
    fields.push(`budget_inr = $${values.length}`);
  }
  if (data.metrics !== undefined) {
    values.push(JSON.stringify(data.metrics));
    fields.push(`metrics = $${values.length}`);
  }

  values.push(id);
  const res = await query<DBCampaign>(
    `UPDATE campaigns 
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  return res.rows[0];
}

export async function deleteCampaign(id: string): Promise<void> {
  await query("DELETE FROM campaigns WHERE id = $1", [id]);
}

/* ==========================================================================
   LIVE DASHBOARD TELEMETRY & KPIS
   ========================================================================== */

export async function getDashboardKPIs(): Promise<{
  totalLeads: number;
  newLeadsCount: number;
  activeCampaigns: number;
  totalCampaigns: number;
  totalRevenueINR: number;
  totalUsers: number;
  recentLeads: any[];
  recentCampaigns: any[];
}> {
  const leadsRes = await query(`
    SELECT 
      COUNT(*) as total_leads,
      COUNT(CASE WHEN status = 'NEW' THEN 1 END) as new_leads
    FROM leads
  `);

  const campRes = await query(`
    SELECT 
      COUNT(*) as total_campaigns,
      COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_campaigns
    FROM campaigns
  `);

  const payRes = await query(`
    SELECT COALESCE(SUM(amount_inr), 0) as total_revenue
    FROM payments
    WHERE status = 'CAPTURED'
  `);

  const userRes = await query(`SELECT COUNT(*) as total_users FROM users`);

  const recentLeadsRes = await query(`
    SELECT id, name, business_name, category, lead_score, status, created_at
    FROM leads
    ORDER BY created_at DESC
    LIMIT 6
  `);

  const recentCampRes = await query(`
    SELECT id, title, client_name, status, budget_inr
    FROM campaigns
    ORDER BY created_at DESC
    LIMIT 6
  `);

  return {
    totalLeads: parseInt(leadsRes.rows[0]?.total_leads || "0", 10),
    newLeadsCount: parseInt(leadsRes.rows[0]?.new_leads || "0", 10),
    activeCampaigns: parseInt(campRes.rows[0]?.active_campaigns || "0", 10),
    totalCampaigns: parseInt(campRes.rows[0]?.total_campaigns || "0", 10),
    totalRevenueINR: parseFloat(payRes.rows[0]?.total_revenue || "0"),
    totalUsers: parseInt(userRes.rows[0]?.total_users || "0", 10),
    recentLeads: recentLeadsRes.rows,
    recentCampaigns: recentCampRes.rows,
  };
}

/* ==========================================================================
   APP SETTINGS
   ========================================================================== */

export async function getSetting<T = any>(key: string, defaultValue?: T): Promise<T> {
  const res = await query("SELECT value FROM app_settings WHERE key = $1", [key]);
  if (res.rows.length === 0) return defaultValue as T;
  return res.rows[0].value as T;
}

export async function setSetting(key: string, value: any): Promise<void> {
  await query(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
    [key, JSON.stringify(value)]
  );
}

