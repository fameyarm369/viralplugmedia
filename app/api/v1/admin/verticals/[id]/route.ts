import { NextResponse } from "next/server";
import { updateVertical, deleteVertical } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const updated = await updateVertical(id, body);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Vertical updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update vertical" },
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

    await deleteVertical(id);
    return NextResponse.json({
      success: true,
      message: "Vertical removed successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete vertical" },
      { status: 500 }
    );
  }
}
