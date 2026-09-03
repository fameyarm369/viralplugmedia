import { NextResponse } from "next/server";
import { createMediaAsset, listMediaAssets } from "@/lib/db/queries";
import { generateComicPalette } from "@/lib/palette-engine";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const assets = await listMediaAssets();
    return NextResponse.json({ success: true, data: assets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list media assets" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const {
      title,
      url,
      thumbnailUrl,
      fileType = "image",
      category,
      clientName,
      campaignHeadline,
      metrics,
      palette: inputPalette,
    } = body;

    if (!title || !url || !category || !clientName || !campaignHeadline) {
      return NextResponse.json(
        { success: false, error: "Title, url, category, clientName, and campaignHeadline are required" },
        { status: 400 }
      );
    }

    // Auto-generate or refine palette if not fully provided
    const palette = inputPalette || generateComicPalette({
      dominant: "#FF5E00",
      vibrant: "#FFE600",
      darkVibrant: "#1D3557",
    });

    const newAsset = await createMediaAsset({
      title,
      url,
      thumbnailUrl,
      fileType,
      category,
      clientName,
      campaignHeadline,
      metrics,
      palette,
      createdBy: session.id,
    });

    return NextResponse.json({
      success: true,
      data: newAsset,
      message: "Media asset uploaded and palette processed successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create media asset" },
      { status: 500 }
    );
  }
}
