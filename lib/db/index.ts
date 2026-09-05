import { Pool, neonConfig, QueryResultRow, PoolClient } from "@neondatabase/serverless";
import ws from "ws";

// The network this app is running behind blocks raw TCP port 5432
// (confirmed via Test-NetConnection). Neon's serverless driver tunnels
// the full Postgres protocol over a WebSocket connection on port 443
// instead — the same port normal HTTPS browsing uses — so it passes
// straight through firewalls that only allow 80/443.
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;
const globalForPool = global as unknown as { pgPool?: Pool };

export const pool =
  globalForPool.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,                        // don't open unlimited connections
    idleTimeoutMillis: 30_000,      // close idle clients after 30s
    connectionTimeoutMillis: 10_000, // Neon free-tier cold-start can take a few seconds
  });

// Reuse the same pool across Next.js dev hot-reloads. Without this, every
// file save can spawn a NEW Pool -> old pool's connections get orphaned ->
// mid-query "Connection terminated unexpectedly" errors.
if (process.env.NODE_ENV !== "production") {
  globalForPool.pgPool = pool;
}

pool.on("error", (err: any) => {
  // Without this handler, a dropped idle client can crash the whole process.
  console.error("Unexpected PG pool error", err);
});

/**
 * Wrapped query helper — keeps your existing call signature
 * (query<T>(text, params)) so nothing else in the codebase needs to change.
 */
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_SQL === "true") {
      console.log("Executed query", { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error("Query failed", { text, params, error });
    throw error;
  }
}

/**
 * Transaction helper — runs multiple queries atomically on a single client.
 * Usage:
 *   await transaction(async (client) => {
 *     await client.query("UPDATE ...");
 *     await client.query("INSERT ...");
 *   });
 * Automatically COMMITs on success, ROLLBACKs on any thrown error.
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Transaction failed, rolled back", error);
    throw error;
  } finally {
    client.release();
  }
}