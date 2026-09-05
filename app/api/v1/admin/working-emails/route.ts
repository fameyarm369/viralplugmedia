import { NextResponse } from "next/server";
import { listWorkingEmails, createWorkingEmail } from "@/lib/db/queries";

export async function GET(req: Request) {
  try {
    const list = await listWorkingEmails();
    return NextResponse.json({
      success: true,
      data: list,
      count: list.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to list working emails" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { professionalName, role, department, customPassword, createdBy } = body;

    if (!professionalName || !role || !department) {
      return NextResponse.json(
        { success: false, error: "Professional Name, Role, and Department are required" },
        { status: 400 }
      );
    }

    const credential = await createWorkingEmail({
      professionalName,
      role,
      department,
      customPassword,
      createdBy: createdBy || "Super Admin",
    });

    return NextResponse.json({
      success: true,
      data: credential,
      message: "Working email credential generated successfully!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate working email" },
      { status: 500 }
    );
  }
}
