import { NextResponse } from "next/server";
import { deleteHistoricalDeal } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await deleteHistoricalDeal(id);
    return NextResponse.json({
      success: true,
      message: "Historical deal removed from context",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete historical deal" },
      { status: 500 }
    );
  }
}
