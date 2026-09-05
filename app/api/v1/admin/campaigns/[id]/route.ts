import { NextResponse } from "next/server";
import { getCampaignById, updateCampaign, deleteCampaign } from "@/lib/db/queries";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await getCampaignById(id);

    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: campaign });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateCampaign(id, {
      title: body.title,
      status: body.status,
      category: body.category,
      budget_inr: body.budgetINR ?? body.budget_inr,
      progress_pct: body.progress_pct ?? body.progressPct,
      current_step_name: body.current_step_name ?? body.currentStepName,
      cancellation_reason: body.cancellation_reason ?? body.cancellationReason,
      custom_criteria: body.custom_criteria ?? body.customCriteria,
      team_members: body.team_members ?? body.teamMembers,
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
