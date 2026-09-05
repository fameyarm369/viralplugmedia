import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { generateUploadSignature, validateUpload } from "@/lib/storage/cloudinary";

/**
 * Step 1 of the real upload flow: the browser tells us what it's about to
 * upload (name/mime/size), we validate against the allowlist and hand back
 * a signed payload it can POST straight to Cloudinary. The API secret never
 * reaches the browser.
 */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { fileName, mimeType, fileSizeBytes, fileType, category } = body;

    if (!fileName || !mimeType || !fileSizeBytes || !fileType) {
      return NextResponse.json(
        { success: false, error: "fileName, mimeType, fileSizeBytes, and fileType are required" },
        { status: 400 }
      );
    }

    if (fileType !== "image" && fileType !== "video") {
      return NextResponse.json(
        { success: false, error: "fileType must be 'image' or 'video'" },
        { status: 400 }
      );
    }

    const validation = validateUpload({ mimeType, fileSizeBytes, fileType });
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const signed = generateUploadSignature({
      fileType,
      category,
      originalFilename: fileName,
    });

    return NextResponse.json({ success: true, data: signed });
  } catch (error: any) {
    const status = error.message === "FORBIDDEN_ADMIN_REQUIRED" ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate upload signature" },
      { status }
    );
  }
}
