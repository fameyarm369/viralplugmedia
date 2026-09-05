import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CLIENT"
  | "EVENT_DIRECTOR"
  | "MEDIA_LEAD"
  | "STRATEGIST"
  | "ACCOUNT_MANAGER";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  hasAdminAccess: boolean;
  isMfaEnabled?: boolean;
  lastActivity: number;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "viral_plug_media_jwt_secret_super_secure_key_2026_production"
);

export const SESSION_COOKIE_NAME = "vp_session";
export const INACTIVITY_TIMEOUT_MS = (parseInt(process.env.SESSION_INACTIVITY_MINUTES || "15", 10)) * 60 * 1000;

/**
 * Hash plain-text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verify plain-text password against bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT session token
 */
export async function signSessionToken(payload: Omit<SessionUser, "lastActivity">): Promise<string> {
  const sessionUser: SessionUser = {
    ...payload,
    lastActivity: Date.now(),
  };

  return new SignJWT({ ...sessionUser })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT session token and check 15-minute inactivity timeout
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = payload as unknown as SessionUser;

    if (!session || !session.id || !session.role) {
      return null;
    }

    // 15-minute Inactivity Timeout Check
    const now = Date.now();
    const lastActivity = session.lastActivity || 0;
    if (now - lastActivity > INACTIVITY_TIMEOUT_MS) {
      // Session has expired due to inactivity
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Get current session from Next.js cookie store in RSC or Route Handler
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    return session;
  } catch {
    return null;
  }
}

/**
 * Set session cookie in Server Action / Route Handler
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours max lifetime, but strictly inactive after 15 mins
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Require an authenticated user, throws or returns null
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Require ADMIN or SUPER_ADMIN role (or hasAdminAccess flag)
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  const isAdmin =
    session.role === "SUPER_ADMIN" ||
    session.role === "ADMIN" ||
    session.hasAdminAccess === true;

  if (!isAdmin) {
    throw new Error("FORBIDDEN_ADMIN_REQUIRED");
  }
  return session;
}

/**
 * Require SUPER_ADMIN role specifically (for granting roles)
 */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireAuth();
  if (session.role !== "SUPER_ADMIN") {
    throw new Error("FORBIDDEN_SUPER_ADMIN_REQUIRED");
  }
  return session;
}
