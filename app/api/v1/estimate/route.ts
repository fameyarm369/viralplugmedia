import { NextResponse } from "next/server";
import { calculateGroundedEstimate } from "@/lib/estimator";
import { getSetting } from "@/lib/db/queries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, serviceType, budgetRange, timeline, notes } = body;

    if (!category || !budgetRange) {
      return NextResponse.json(
        { success: false, error: "Category and budgetRange are required" },
        { status: 400 }
      );
    }

    const advanceSetting = await getSetting<{ percentage: number }>("advance_payment_pct", { percentage: 20 });
    const advancePercentage = advanceSetting?.percentage || 20;

    const estimate = await calculateGroundedEstimate({
      category,
      serviceType,
      budgetRange,
      timeline,
      notes,
      advancePercentage,
    });

    return NextResponse.json({
      success: true,
      data: estimate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to calculate estimate" },
      { status: 500 }
    );
  }
}