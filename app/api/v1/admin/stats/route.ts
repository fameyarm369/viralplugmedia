import { NextResponse } from "next/server";
import { getDashboardKPIs, getLiveDashboardMetrics, listLeads, listCampaigns } from "@/lib/db/queries";

export async function GET() {
  try {
    const [kpis, liveMetrics, leads, campaigns] = await Promise.all([
      getDashboardKPIs(),
      getLiveDashboardMetrics(),
      listLeads(),
      listCampaigns(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...kpis,
        ...liveMetrics,
        recentLeads: leads.slice(0, 6),
        recentCampaigns: campaigns.slice(0, 6),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load dashboard KPIs" },
      { status: 500 }
    );
  }
}
