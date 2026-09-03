import { NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/db/queries";
import { hashPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Default registration is ALWAYS role 'CLIENT' with has_admin_access = false
    const newUser = await createUser({
      email,
      passwordHash,
      name,
      role: "CLIENT",
      hasAdminAccess: false,
    });

    const token = await signSessionToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      hasAdminAccess: newUser.has_admin_access,
      isMfaEnabled: false,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        hasAdminAccess: newUser.has_admin_access,
      },
      redirectTo: "/portal",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
