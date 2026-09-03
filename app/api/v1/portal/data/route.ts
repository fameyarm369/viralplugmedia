import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listCampaigns, listInvoices } from "@/lib/db/queries";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // STRICT SCOPING: only queries rows where client_id = session.id
    const campaigns = await listCampaigns({ clientId: session.id });
    const invoices = await listInvoices({ clientId: session.id });

    // Aggregate metrics across all campaigns of this client
    let totalViews = 0;
    let totalClicks = 0;
    let totalLeads = 0;
    let totalSpend = 0;

    campaigns.forEach((c) => {
      totalViews += Number(c.metrics?.views || 0);
      totalClicks += Number(c.metrics?.clicks || 0);
      totalLeads += Number(c.metrics?.leads || 0);
      totalSpend += Number(c.budget_inr || 0);
    });

    // AI Narrative generation based ONLY on real client rows
    let narrative = "Awaiting first performance data. Your creative media assets are currently under strategic review by our campaign team.";
    if (totalViews > 0 || totalLeads > 0) {
      narrative = `Campaign Telemetry Live: Delivering ${totalViews.toLocaleString("en-IN")} verified views and ${totalLeads.toLocaleString("en-IN")} direct customer conversions across active funnels.`;
    }

    return NextResponse.json({
      success: true,
      user: session,
      campaigns,
      invoices,
      summary: {
        totalViews,
        totalClicks,
        totalLeads,
        totalSpend,
        activeCampaignsCount: campaigns.filter((c) => c.status === "ACTIVE").length,
        narrative,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch portal data" },
      { status: 500 }
    );
  }
}
