import { NextResponse } from "next/server";
import { updateCampaign, deleteCampaign } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const updated = await updateCampaign(id, {
      title: body.title,
      status: body.status,
      category: body.category,
      budget_inr: body.budgetINR ?? body.budget_inr,
      metrics: body.metrics,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Campaign updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await deleteCampaign(id);
    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
