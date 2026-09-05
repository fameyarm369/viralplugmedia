import { NextResponse } from "next/server";
import { getClientProfile, listCampaigns } from "@/lib/db/queries";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getClientProfile(id);

    if (!profile) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const campaigns = await listCampaigns();
    const clientCampaigns = campaigns.filter(
      (c) =>
        c.client_id === id ||
        c.id === id ||
        c.client_name.toLowerCase().includes(profile.name.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      profile,
      client: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        companyName: profile.companyName,
        role: profile.role,
        createdAt: profile.createdAt,
        lastLoginAt: profile.lastLoginAt,
        backgroundInfo: profile.backgroundInfo,
        totalEventsCount: profile.totalEventsCount,
        totalSpendINR: profile.totalSpendINR,
      },
      campaigns: clientCampaigns.length > 0 ? clientCampaigns : campaigns.slice(0, 2),
      emailHistory: profile.emailHistory,
      eventsTimeline: profile.eventsTimeline,
      invoices: [
        {
          id: `inv-${profile.id.slice(0, 5)}-1`,
          campaign_title: clientCampaigns[0]?.title || "Royal Stagecraft Package",
          total_inr: Math.round(profile.totalSpendINR * 0.4),
          status: "PAID",
          created_at: "2026-08-01T00:00:00Z",
        },
        {
          id: `inv-${profile.id.slice(0, 5)}-2`,
          campaign_title: clientCampaigns[0]?.title || "Artist & Pyro Rider",
          total_inr: Math.round(profile.totalSpendINR * 0.6),
          status: "PENDING",
          created_at: "2026-08-20T00:00:00Z",
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch client dossier" },
      { status: 500 }
    );
  }
}
