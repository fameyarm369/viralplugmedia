import { NextResponse } from "next/server";
import { deleteMediaAsset, getMediaAssetById } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const asset = await getMediaAssetById(id);
    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Media asset not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: asset });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch media asset" },
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
    await deleteMediaAsset(id);
    return NextResponse.json({
      success: true,
      message: "Media asset deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete media asset" },
      { status: 500 }
    );
  }
}
