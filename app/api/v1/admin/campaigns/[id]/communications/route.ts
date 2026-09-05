import { NextResponse } from "next/server";
import { addCommunicationLog, getCampaignById } from "@/lib/db/queries";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await getCampaignById(id);
    return NextResponse.json({
      success: true,
      data: campaign?.communications || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch communications" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type, sender, recipient, subject, content, metadata } = body;

    if (!sender || !content) {
      return NextResponse.json(
        { success: false, error: "Sender and content are required" },
        { status: 400 }
      );
    }

    const comm = await addCommunicationLog({
      campaignId: id,
      type: type || "EMAIL",
      sender,
      recipient: recipient || "client@viralplug.com",
      subject,
      content,
      metadata,
    });

    return NextResponse.json({
      success: true,
      data: comm,
      message: "Communication recorded and dispatched",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to log communication" },
      { status: 500 }
    );
  }
}
