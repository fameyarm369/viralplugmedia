import { NextResponse } from "next/server";
import { createVertical, listAllVerticals } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const data = await listAllVerticals();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list verticals" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { category, heroMediaId, headline, clientName, reachStat, roasStat, isFeatured, displayOrder } = body;

    if (!category || !headline || !clientName || !reachStat || !roasStat) {
      return NextResponse.json(
        { success: false, error: "Category, headline, client name, reach stat, and ROAS stat are required" },
        { status: 400 }
      );
    }

    const vertical = await createVertical({
      category,
      heroMediaId,
      headline,
      clientName,
      reachStat,
      roasStat,
      isFeatured: isFeatured ?? true,
      displayOrder: displayOrder || 0,
    });

    return NextResponse.json({
      success: true,
      data: vertical,
      message: "Vertical created and published successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create vertical" },
      { status: 500 }
    );
  }
}
