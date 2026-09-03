import { NextResponse } from "next/server";
import { updateLeadStatus } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const updated = await updateLeadStatus(id, status);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Lead status updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update lead status" },
      { status: 500 }
    );
  }
}
