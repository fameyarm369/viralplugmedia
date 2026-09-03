import { NextResponse } from "next/server";
import { listUsers } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await listUsers({ search, limit, offset });

    return NextResponse.json({
      success: true,
      data: result.users,
      total: result.total,
    });
  } catch (error: any) {
    if (error.message.includes("FORBIDDEN") || error.message.includes("UNAUTHORIZED")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin privileges required." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list users" },
      { status: 500 }
    );
  }
}
