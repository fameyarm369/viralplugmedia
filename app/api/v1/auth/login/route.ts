import { NextResponse } from "next/server";
import { getUserByEmail, updateUserLastLogin } from "@/lib/db/queries";
import { verifyPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Update last login
    await updateUserLastLogin(user.id);

    // Create session token
    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasAdminAccess: user.has_admin_access,
      isMfaEnabled: user.is_mfa_enabled,
    });

    await setSessionCookie(token);

    const isAdmin =
      user.role === "SUPER_ADMIN" ||
      user.role === "ADMIN" ||
      user.has_admin_access === true;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasAdminAccess: user.has_admin_access,
      },
      redirectTo: isAdmin ? "/admin" : "/portal",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
