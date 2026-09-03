import { NextResponse } from "next/server";
import { getFeaturedVerticals, listAllVerticals } from "@/lib/db/queries";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get("featured") === "true";

    const data = featuredOnly
      ? await getFeaturedVerticals()
      : await listAllVerticals();

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch verticals" },
      { status: 500 }
    );
  }
}
