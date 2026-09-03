import { NextResponse } from "next/server";
import { listMediaAssets } from "@/lib/db/queries";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;

    const assets = await listMediaAssets({ category, search });
    return NextResponse.json({
      success: true,
      data: assets,
      count: assets.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list media assets" },
      { status: 500 }
    );
  }
}
