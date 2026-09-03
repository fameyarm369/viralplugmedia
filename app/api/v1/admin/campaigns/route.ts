import { NextResponse } from "next/server";
import { listCampaigns, createCampaign } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;

    const campaigns = await listCampaigns({ status, category });
    return NextResponse.json({ success: true, data: campaigns, count: campaigns.length });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { title, clientId, clientName, category, budgetINR, metrics } = body;

    if (!title || !clientName) {
      return NextResponse.json(
        { success: false, error: "Title and client name are required" },
        { status: 400 }
      );
    }

    const campaign = await createCampaign({
      title,
      clientId: clientId || null,
      clientName,
      category: category || "food-honey",
      status: "DRAFT",
      budgetINR: parseFloat(budgetINR || "0"),
      metrics: metrics || { views: 0, clicks: 0, leads: 0, roas: 0 },
    });

    return NextResponse.json({
      success: true,
      data: campaign,
      message: "Campaign created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create campaign" },
      { status: 500 }
    );
  }
}
