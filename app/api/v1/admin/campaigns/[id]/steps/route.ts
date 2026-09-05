import { NextResponse } from "next/server";
import { addCampaignStep, updateCampaignStep, deleteCampaignStep, getCampaignById } from "@/lib/db/queries";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await getCampaignById(id);
    return NextResponse.json({
      success: true,
      data: campaign?.steps || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch steps" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, taskType, deadline } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Step title is required" },
        { status: 400 }
      );
    }

    const step = await addCampaignStep(id, {
      title,
      description: description || "",
      taskType: taskType || "PHOTO_UPLOAD",
      deadline,
    });

    return NextResponse.json({
      success: true,
      data: step,
      message: "Step added dynamically",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add step" },
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
    const { stepId, ...updates } = body;

    if (!stepId) {
      return NextResponse.json({ success: false, error: "stepId is required" }, { status: 400 });
    }

    const updated = await updateCampaignStep(id, stepId, updates);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Step updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update step" },
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
    const { searchParams } = new URL(req.url);
    const stepId = searchParams.get("stepId");

    if (!stepId) {
      return NextResponse.json({ success: false, error: "stepId query param is required" }, { status: 400 });
    }

    await deleteCampaignStep(id, stepId);
    return NextResponse.json({
      success: true,
      message: "Step deleted",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete step" },
      { status: 500 }
    );
  }
}
