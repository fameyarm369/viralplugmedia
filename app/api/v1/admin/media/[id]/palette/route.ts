import { NextResponse } from "next/server";
import { updateMediaAssetPalette, getMediaAssetById } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { palette, isOverridden = true } = body;

    if (!palette) {
      return NextResponse.json(
        { success: false, error: "Palette object is required" },
        { status: 400 }
      );
    }

    const updated = await updateMediaAssetPalette(id, palette, isOverridden);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Media palette updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update media palette" },
      { status: 500 }
    );
  }
}
