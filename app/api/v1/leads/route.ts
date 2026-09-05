import { NextResponse } from "next/server";
import { createLead, listLeads } from "@/lib/db/queries";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const leads = await listLeads({ status, search });
    return NextResponse.json({
      success: true,
      data: leads,
      count: leads.length,
    });
  } catch (error: any) {
    if (error.message.includes("UNAUTHORIZED") || error.message.includes("FORBIDDEN")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      businessName,
      category,
      serviceType,
      phone,
      email,
      budgetRange,
      timeline,
      notes,
      primaryMediaId,
    } = body;

    if (!name || !businessName || !phone || !email) {
      return NextResponse.json(
        { success: false, error: "Name, business name, phone, and email are required" },
        { status: 400 }
      );
    }

    // Dynamic Lead Scoring Algorithm (10-100)
    let score = 50;
    if (budgetRange?.includes("1.5L+")) score += 35;
    else if (budgetRange?.includes("50k")) score += 25;
    else if (budgetRange?.includes("Abhi Decide")) score += 5; // undecided budget = lower urgency signal
    else score += 10;

    if (timeline?.includes("Immediately")) score += 15;
    if (notes && notes.length > 20) score += 5;

    // "Not sure" service selections are genuine leads too, just less qualified yet
    if (serviceType && serviceType !== "not-sure") score += 5;

    const newLead = await createLead({
      name,
      businessName,
      category: category || "food-honey",
      serviceType: serviceType || "not-sure",
      phone,
      email,
      budgetRange: budgetRange || "₹50k-₹1.5L / mo",
      timeline: timeline || "Within 7 days",
      notes: notes || "",
      leadScore: Math.min(score, 100),
      primaryMediaId: primaryMediaId || null,
      assignedTo: "Harshit R. (Lead Strategist)",
    });

    return NextResponse.json({
      success: true,
      data: newLead,
      message: "Lead enrolled into Viral Plug CRM database successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process lead" },
      { status: 500 }
    );
  }
}