import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "viral_plug_media_jwt_secret_super_secure_key_2026_production"
);

const SESSION_COOKIE_NAME = "vp_session";
const INACTIVITY_TIMEOUT_MS = (parseInt(process.env.SESSION_INACTIVITY_MINUTES || "15", 10)) * 60 * 1000;

interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CLIENT";
  hasAdminAccess: boolean;
  lastActivity: number;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/portal");
  const isAdminApiRoute = pathname.startsWith("/api/v1/admin");

  if (!isAdminRoute && !isPortalRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    if (isAdminApiRoute) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = payload as unknown as SessionPayload;

    if (!session || !session.id || !session.role) {
      throw new Error("Invalid session payload");
    }

    // 15-minute Inactivity Timeout Check
    const now = Date.now();
    const lastActivity = session.lastActivity || 0;
    if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
      // Session has expired due to inactivity
      if (isAdminApiRoute) {
        return NextResponse.json(
          { success: false, error: "Session expired due to inactivity (15m limit)" },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "session_expired");
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    // Role-based Access Control for Admin
    if (isAdminRoute || isAdminApiRoute) {
      const hasAdminRights =
        session.role === "SUPER_ADMIN" ||
        session.role === "ADMIN" ||
        session.hasAdminAccess === true;

      if (!hasAdminRights) {
        if (isAdminApiRoute) {
          return NextResponse.json(
            { success: false, error: "Access Denied: Admin privileges required" },
            { status: 403 }
          );
        }
        // Redirect non-admin user to their portal
        return NextResponse.redirect(new URL("/portal", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    if (isAdminApiRoute) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/api/v1/admin/:path*",
  ],
};
