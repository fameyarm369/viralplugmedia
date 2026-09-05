import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { listCampaigns } from "@/lib/db/queries";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const campaigns = await listCampaigns();
    const clientMap = new Map<string, any>();

    // Aggregate from campaigns
    campaigns.forEach((c) => {
      const key = c.client_email || c.client_name;
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          id: c.client_id || `client-${key.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          name: c.client_name,
          email: c.client_email || `${c.client_name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
          phone: c.client_phone || "+91 98765 00000",
          role: "CLIENT",
          created_at: c.created_at,
          last_login_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          campaigns_count: 1,
          total_spend: c.budget_inr || 0,
        });
      } else {
        const existing = clientMap.get(key);
        existing.campaigns_count += 1;
        existing.total_spend += c.budget_inr || 0;
      }
    });

    let clients = Array.from(clientMap.values());

    if (search) {
      const q = search.toLowerCase();
      clients = clients.filter((cl) => cl.name.toLowerCase().includes(q) || cl.email.toLowerCase().includes(q));
    }

    return NextResponse.json({
      success: true,
      data: clients,
      count: clients.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list clients" },
      { status: 500 }
    );
  }
}
