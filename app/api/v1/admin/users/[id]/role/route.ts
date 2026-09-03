import { NextResponse } from "next/server";
import { updateUserRoleAndAccess } from "@/lib/db/queries";
import { requireSuperAdmin } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();
    const { role, hasAdminAccess } = body;

    if (!role || !["SUPER_ADMIN", "ADMIN", "CLIENT"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role specified" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserRoleAndAccess({
      userId: id,
      newRole: role,
      hasAdminAccess: typeof hasAdminAccess === "boolean" ? hasAdminAccess : (role === "SUPER_ADMIN" || role === "ADMIN"),
      actorId: session.id,
      actorEmail: session.email,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        hasAdminAccess: updatedUser.has_admin_access,
      },
      message: `Permissions updated successfully for ${updatedUser.name}`,
    });
  } catch (error: any) {
    if (error.message.includes("FORBIDDEN_SUPER_ADMIN_REQUIRED")) {
      return NextResponse.json(
        { success: false, error: "Forbidden. Only Super Admin can change user roles and permissions." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}
