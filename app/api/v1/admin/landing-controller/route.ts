import { NextResponse } from "next/server";
import { getLandingPageConfig, updateLandingPageConfig } from "@/lib/db/queries";

export async function GET(req: Request) {
  try {
    const config = await getLandingPageConfig();
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch landing controller config" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateLandingPageConfig(body);
    return NextResponse.json({
      success: true,
      data: updated,
      message: "Landing page design configuration updated in real-time!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save landing configuration" },
      { status: 500 }
    );
  }
}
