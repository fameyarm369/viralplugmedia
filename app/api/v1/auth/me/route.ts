import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({
      success: false,
      user: null,
    });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role,
      hasAdminAccess: session.hasAdminAccess,
    },
  });
}
