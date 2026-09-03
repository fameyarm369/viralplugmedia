import { NextResponse } from "next/server";
import { getDashboardKPIs } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const kpis = await getDashboardKPIs();
    return NextResponse.json({
      success: true,
      data: kpis,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load dashboard KPIs" },
      { status: 500 }
    );
  }
}
