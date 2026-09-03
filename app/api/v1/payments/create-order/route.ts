import { NextResponse } from "next/server";
import { createPayment, getPaymentByIdempotencyKey } from "@/lib/db/queries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountINR, idempotencyKey, leadId, email, businessName } = body;

    if (!amountINR || amountINR <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amountINR is required" },
        { status: 400 }
      );
    }

    // Check idempotency
    const key = idempotencyKey || `idem-${leadId || "anon"}-${Date.now()}`;
    const existing = await getPaymentByIdempotencyKey(key);
    if (existing && existing.status === "CAPTURED") {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        payment: existing,
      });
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_viralplug2026";

    // Save pending payment record in PostgreSQL
    const payment = await createPayment({
      razorpayOrderId: orderId,
      amountINR: parseFloat(amountINR),
      idempotencyKey: key,
      currency: "INR",
      status: "PENDING",
    });

    return NextResponse.json({
      success: true,
      orderId,
      amount: Math.round(parseFloat(amountINR) * 100), // Amount in paise for Razorpay
      amountINR: parseFloat(amountINR),
      currency: "INR",
      keyId,
      paymentId: payment.id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
