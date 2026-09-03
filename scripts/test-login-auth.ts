import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { verifyPassword, signSessionToken } from "../lib/auth";
import { getUserByEmail } from "../lib/db/queries";

async function testAuth() {
  const user = await getUserByEmail("admin@viralplugmedia.com");
  console.log("User retrieved from DB:", {
    id: user?.id,
    email: user?.email,
    role: user?.role,
    has_admin_access: user?.has_admin_access,
  });

  if (!user) {
    console.error("User not found!");
    process.exit(1);
  }

  const isValid = await verifyPassword("SuperAdminSecret2026!", user.password_hash);
  console.log("Password verification result for 'SuperAdminSecret2026!':", isValid);

  if (isValid) {
    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasAdminAccess: user.has_admin_access,
      isMfaEnabled: user.is_mfa_enabled,
    });
    console.log("JWT token successfully signed:", token.slice(0, 30) + "...");
  }
  process.exit(0);
}

testAuth();
