import { NextResponse } from "next/server";
import { INITIAL_LEADS } from "@/lib/db";
import { Lead } from "@/lib/types";

let currentLeads: Lead[] = [...INITIAL_LEADS];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: currentLeads,
    count: currentLeads.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Calculate dynamic Lead Score (10-100)
    let score = 50;
    if (body.budgetRange?.includes("1.5L+")) score += 35;
    else if (body.budgetRange?.includes("50k")) score += 25;
    else score += 10;

    if (body.timeline?.includes("Immediately")) score += 15;
    if (body.notes && body.notes.length > 20) score += 5;

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: body.name || "Anonymous",
      businessName: body.businessName || "Unnamed Business",
      category: body.category || "food-honey",
      phone: body.phone || "+91 00000 00000",
      email: body.email || "inquiry@brand.com",
      budgetRange: body.budgetRange || "₹50k-₹1.5L / mo",
      timeline: body.timeline || "Within 7 days",
      notes: body.notes || "",
      leadScore: Math.min(score, 100),
      status: "NEW",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: "Harshit R. (Lead Strategist)",
    };

    currentLeads.unshift(newLead);

    return NextResponse.json({
      success: true,
      data: newLead,
      message: "Lead enrolled into Viral Plug CRM successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to process lead inquiry" },
      { status: 400 }
    );
  }
}
