import { NextResponse } from "next/server";
import { getUserByEmail, updateUserLastLogin } from "@/lib/db/queries";
import { verifyPassword, signSessionToken, setSessionCookie, hashPassword } from "@/lib/auth";

// A pre-computed dummy hash so a "user not found" path still runs a bcrypt
// compare of the same cost — keeps response time roughly constant whether
// or not the email exists, so timing can't be used to enumerate accounts.
const DUMMY_HASH = "$2a$12$CwTycUXWue0Thq9StjUM0uJ8x1uJ1i2i8Ue1a5b0/G7T3wq1x1q1O";

export async function POST(req: Request) {
  let email: string | undefined;
  let password: string | undefined;

  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const user = await getUserByEmail(email);

    // Always run a bcrypt compare, even for a non-existent user, so the
    // response timing doesn't reveal whether the email is registered.
    const isMatch = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);

    if (!user || !isMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await updateUserLastLogin(user.id);

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
    // Log the real error server-side for debugging...
    console.error("Login route error:", error);

    // ...but never forward raw DB/internal error text to the client.
    const isDbIssue =
      error?.message?.includes("Connection terminated") ||
      error?.code === "ECONNRESET" ||
      error?.code === "57P01";

    return NextResponse.json(
      {
        success: false,
        error: isDbIssue
          ? "We're having trouble reaching the database. Please try again in a moment."
          : "Something went wrong while signing you in. Please try again.",
      },
      { status: isDbIssue ? 503 : 500 }
    );
  }
}