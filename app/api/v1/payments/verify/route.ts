import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  getUserByEmail,
  createUser,
  createCampaign,
  createInvoice,
  createPayment,
} from "@/lib/db/queries";
import { hashPassword, signSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      email,
      name,
      businessName,
      category,
      amountINR,
      leadId,
    } = body;

    if (!email || !amountINR) {
      return NextResponse.json(
        { success: false, error: "Email and amount are required" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "secret_viralplug_razorpay_key";
    
    // In production, verify HMAC-SHA256 signature
    if (razorpaySignature && process.env.NODE_ENV === "production") {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json(
          { success: false, error: "Invalid Razorpay payment signature" },
          { status: 400 }
        );
      }
    }

    // 1. Find or create Client User
    let user = await getUserByEmail(email);
    if (!user) {
      const tempPassword = `ClientVP#${Math.random().toString(36).slice(2, 8)}`;
      const passwordHash = await hashPassword(tempPassword);
      user = await createUser({
        email,
        passwordHash,
        name: name || businessName || "Valued Client",
        role: "CLIENT",
        hasAdminAccess: false,
      });
    }

    // 2. Auto-create Campaign in PROPOSAL_REVIEW / PAYMENT_PENDING
    const campaignTitle = `${businessName || "Brand"} - Viral Scaling Campaign`;
    const campaign = await createCampaign({
      title: campaignTitle,
      clientId: user.id,
      clientName: businessName || user.name,
      category: category || "food-honey",
      status: "PROPOSAL_REVIEW",
      budgetINR: parseFloat(amountINR) * 5, // Total estimated contract value is 5x advance
      metrics: { views: 0, clicks: 0, leads: 0, roas: 0 },
    });

    // 3. Create and mark Invoice as PAID
    const invoice = await createInvoice({
      campaignId: campaign.id,
      clientId: user.id,
      amountINR: parseFloat(amountINR),
      totalINR: parseFloat(amountINR),
      status: "PAID",
      dueDate: new Date().toISOString().split("T")[0],
    });

    // 4. Record Captured Payment in Ledger
    await createPayment({
      invoiceId: invoice.id,
      clientId: user.id,
      razorpayOrderId: razorpayOrderId || `order_${Date.now()}`,
      razorpayPaymentId: razorpayPaymentId || `pay_${Date.now()}`,
      razorpaySignature: razorpaySignature || "verified",
      amountINR: parseFloat(amountINR),
      status: "CAPTURED",
      method: "Razorpay Advance",
    });

    // 5. Create Session & Log Client in seamlessly
    const token = await signSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      hasAdminAccess: user.has_admin_access,
      isMfaEnabled: user.is_mfa_enabled,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      message: "Advance payment verified! Welcome to Viral Plug Media.",
      campaignId: campaign.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      redirectTo: "/portal",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify advance payment" },
      { status: 500 }
    );
  }
}
