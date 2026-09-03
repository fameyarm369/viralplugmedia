import { NextResponse } from "next/server";
import { getSetting, setSetting } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ success: false, error: "Key required" }, { status: 400 });
    }

    const value = await getSetting(key);
    return NextResponse.json({ success: true, data: value });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get setting" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: "Key and value are required" },
        { status: 400 }
      );
    }

    await setSetting(key, value);
    return NextResponse.json({
      success: true,
      message: `Setting '${key}' updated successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update setting" },
      { status: 500 }
    );
  }
}
