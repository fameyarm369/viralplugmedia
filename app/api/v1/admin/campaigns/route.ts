import { NextResponse } from "next/server";
import { listCampaigns, createCampaign } from "@/lib/db/queries";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const eventType = searchParams.get("eventType") || undefined;
    const search = searchParams.get("search") || undefined;
    const minBudget = searchParams.get("minBudget") ? parseFloat(searchParams.get("minBudget")!) : undefined;
    const maxBudget = searchParams.get("maxBudget") ? parseFloat(searchParams.get("maxBudget")!) : undefined;
    const location = searchParams.get("location") || undefined;

    const campaigns = await listCampaigns({
      status,
      category,
      eventType,
      search,
      minBudget,
      maxBudget,
      location,
    });
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
    const body = await req.json();
    const {
      title,
      clientId,
      clientName,
      clientEmail,
      clientPhone,
      category,
      eventType,
      requestType,
      status,
      eventDate,
      startDate,
      endDate,
      location,
      thumbnailUrl,
      budgetINR,
      customCriteria,
      teamMembers,
      budgetBreakdown,
      metrics,
    } = body;

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
      clientEmail,
      clientPhone,
      category: category || "Weddings",
      eventType: eventType || "Destination Event",
      requestType: requestType || "Inbound Elite Enquiry",
      status: status || "PASSIVE_REQUEST",
      eventDate,
      startDate,
      endDate,
      location,
      thumbnailUrl,
      budgetINR: parseFloat(budgetINR || "500000"),
      customCriteria,
      teamMembers,
      budgetBreakdown,
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
