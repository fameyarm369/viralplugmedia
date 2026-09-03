import dotenv from "dotenv";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_opPRBT8Nj2ug@ep-long-pine-a58a9jt4-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function resetPassword() {
  const email = "admin@viralplugmedia.com";
  const newPassword = "SuperAdminSecret2026!";

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      `UPDATE users 
       SET password_hash = $1, role = 'SUPER_ADMIN', has_admin_access = TRUE, updated_at = NOW() 
       WHERE email = $2`,
      [passwordHash, email]
    );

    console.log(`✅ Super Admin (${email}) password successfully updated to: ${newPassword}`);
  } catch (err) {
    console.error("❌ Reset error:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

resetPassword();
