import { NextResponse } from "next/server";
import { getUserById, listCampaigns, listInvoices } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const campaigns = await listCampaigns({ clientId: id });
    const invoices = await listInvoices({ clientId: id });

    return NextResponse.json({
      success: true,
      client: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasAdminAccess: user.has_admin_access,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
      campaigns,
      invoices,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch client dossier" },
      { status: 500 }
    );
  }
}
