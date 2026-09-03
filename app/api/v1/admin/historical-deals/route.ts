import { NextResponse } from "next/server";
import { listHistoricalDeals, createHistoricalDeal } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;

    const deals = await listHistoricalDeals({ category });
    return NextResponse.json({ success: true, data: deals, count: deals.length });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list historical deals" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { category, budgetINR, deliverables, finalPriceINR, roasAchieved, clientType, notes } = body;

    if (!category || !budgetINR || !finalPriceINR) {
      return NextResponse.json(
        { success: false, error: "Category, budgetINR, and finalPriceINR are required" },
        { status: 400 }
      );
    }

    const deal = await createHistoricalDeal({
      category,
      budgetINR: parseFloat(budgetINR),
      deliverables: Array.isArray(deliverables) ? deliverables : [deliverables || "Standard Package"],
      finalPriceINR: parseFloat(finalPriceINR),
      roasAchieved: parseFloat(roasAchieved || "0"),
      clientType: clientType || "D2C",
      notes: notes || null,
    });

    return NextResponse.json({
      success: true,
      data: deal,
      message: "Historical deal saved to grounding context database",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create historical deal" },
      { status: 500 }
    );
  }
}
