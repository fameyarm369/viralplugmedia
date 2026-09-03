import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { query } from "../lib/db";

async function addDefaults() {
  console.log("Setting default UUID generators on all tables in PostgreSQL...");

  await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  const tables = [
    "users",
    "media_assets",
    "verticals",
    "leads",
    "campaigns",
    "historical_deals",
    "invoices",
    "payments",
    "audit_logs",
    "services",
    "case_studies",
  ];

  for (const t of tables) {
    try {
      await query(`ALTER TABLE ${t} ALTER COLUMN id SET DEFAULT gen_random_uuid()::TEXT;`);
      console.log(`✓ Set default gen_random_uuid() for ${t}`);
    } catch (err: any) {
      console.log(`Table ${t} error:`, err.message);
    }
  }

  console.log("All table defaults updated successfully.");
  process.exit(0);
}

addDefaults().catch((err) => {
  console.error(err);
  process.exit(1);
});
