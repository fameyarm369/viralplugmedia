import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

async function runMigration() {
  if (!connectionString) {
    console.error(
      "❌ No database connection string found. Set DATABASE_URL or POSTGRES_URL in your .env.local file."
    );
    process.exit(1);
  }

  console.log("🚀 Starting PostgreSQL schema migration...");
  console.log(`Connecting to: ${connectionString.split("@")[1] || "Database"}`);

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const schemaPath = path.join(process.cwd(), "lib", "db", "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");

    console.log("Executing SQL migration script...");
    await pool.query(sql);

    console.log("✅ All tables created/verified successfully in PostgreSQL!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();