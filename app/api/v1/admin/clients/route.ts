import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    let whereClause = "WHERE role = 'CLIENT'";
    const values: any[] = [];

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      whereClause += ` AND (LOWER(name) LIKE $${values.length} OR LOWER(email) LIKE $${values.length})`;
    }

    const res = await query(
      `SELECT 
        u.id, u.name, u.email, u.role, u.created_at, u.last_login_at,
        COUNT(c.id) as campaigns_count,
        COALESCE(SUM(c.budget_inr), 0) as total_spend
       FROM users u
       LEFT JOIN campaigns c ON u.id = c.client_id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
      values
    );

    return NextResponse.json({
      success: true,
      data: res.rows,
      count: res.rows.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list clients" },
      { status: 500 }
    );
  }
}
