import dotenv from "dotenv";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://neondb_owner:npg_opPRBT8Nj2ug@ep-long-pine-a58a9jt4-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function seedSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL || "admin@viralplugmedia.com";
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD || "SuperSecretAdmin2026!";
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";

  console.log("🔐 Starting Super Admin Bootstrap...");
  console.log(`Target Email: ${email}`);

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Check if super admin already exists
    const existing = await pool.query(
      "SELECT id, email, role, has_admin_access FROM users WHERE role = 'SUPER_ADMIN' OR email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      console.log(`ℹ️ Super Admin account already exists (ID: ${existing.rows[0].id}, Email: ${existing.rows[0].email})`);
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, has_admin_access, is_mfa_enabled, created_at, updated_at)
       VALUES ($1, $2, $3, 'SUPER_ADMIN', TRUE, FALSE, NOW(), NOW())
       RETURNING id, email, name, role, has_admin_access`,
      [email, passwordHash, name]
    );

    const user = result.rows[0];
    console.log("✅ Super Admin created successfully!");
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Admin Access: ${user.has_admin_access}`);
  } catch (err) {
    console.error("❌ Failed to seed Super Admin:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedSuperAdmin();
