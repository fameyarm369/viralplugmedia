import { NextResponse } from "next/server";
import { createLead, listLeads } from "@/lib/db/queries";

export async function GET() {
  try {
    const leads = await listLeads();
    return NextResponse.json({
      success: true,
      data: leads,
      count: leads.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list leads" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, businessName, category, phone, email, budgetRange, timeline, notes, primaryMediaId } = body;

    let score = 50;
    if (budgetRange?.includes("1.5L+")) score += 35;
    else if (budgetRange?.includes("50k")) score += 25;
    else score += 10;

    if (timeline?.includes("Immediately")) score += 15;
    if (notes && notes.length > 20) score += 5;

    const newLead = await createLead({
      name: name || "Anonymous",
      businessName: businessName || "Unnamed Brand",
      category: category || "food-honey",
      phone: phone || "+91 00000 00000",
      email: email || "inquiry@brand.com",
      budgetRange: budgetRange || "₹50k-₹1.5L / mo",
      timeline: timeline || "Within 7 days",
      notes: notes || "",
      leadScore: Math.min(score, 100),
      primaryMediaId: primaryMediaId || null,
    });

    return NextResponse.json({
      success: true,
      data: newLead,
      message: "Lead enrolled into Viral Plug CRM successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process lead inquiry" },
      { status: 400 }
    );
  }
}
