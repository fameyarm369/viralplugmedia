import { NextResponse } from "next/server";
import { colord } from "colord";
import { requireAdmin } from "@/lib/auth";
import { createMediaAsset } from "@/lib/db/queries";
import { fetchResourceDetails, validateUpload, deleteResource } from "@/lib/storage/cloudinary";
import { generateComicPalette } from "@/lib/palette-engine";
import type { ColorPalette } from "@/lib/types";

const FORMAT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

/**
 * Builds a real ColorPalette from Cloudinary's extracted dominant colors
 * instead of the hardcoded #FF5E00/#FFE600/#1D3557 the old upload flow
 * always sent regardless of the actual image.
 */
function paletteFromCloudinaryColors(colors: [string, number][] | undefined): ColorPalette {
  if (!colors || colors.length === 0) {
    return generateComicPalette({});
  }

  const sorted = [...colors].sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0][0];

  // Pick the most saturated color among the top swatches as the "vibrant" accent —
  // the raw dominant color is often a muted background tone, not a good accent.
  const candidates = sorted.slice(0, Math.min(6, sorted.length));
  let vibrant = dominant;
  let maxSat = -1;
  for (const [hex] of candidates) {
    try {
      const hsl = colord(hex).toHsl();
      if (hsl.l > 15 && hsl.l < 90 && hsl.s > maxSat) {
        maxSat = hsl.s;
        vibrant = hex;
      }
    } catch {
      // skip unparsable swatches
    }
  }

  return generateComicPalette({ dominant, vibrant });
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const {
      publicId,
      resourceType,
      title,
      category,
      clientName,
      campaignHeadline,
      altText,
      caption,
      metrics,
      originalFilename,
      posterUrl,
    } = body;

    if (!publicId || !resourceType || !title || !category || !clientName || !campaignHeadline) {
      return NextResponse.json(
        {
          success: false,
          error: "publicId, resourceType, title, category, clientName, and campaignHeadline are required",
        },
        { status: 400 }
      );
    }
    if (resourceType !== "image" && resourceType !== "video") {
      return NextResponse.json({ success: false, error: "resourceType must be 'image' or 'video'" }, { status: 400 });
    }

    // Never trust client-supplied width/height/bytes — pull the real thing from Cloudinary.
    let resource;
    try {
      resource = await fetchResourceDetails(publicId, resourceType);
    } catch (e: any) {
      return NextResponse.json(
        { success: false, error: `Could not verify upload with Cloudinary: ${e.message || "not found"}` },
        { status: 400 }
      );
    }

    const derivedMime = FORMAT_TO_MIME[resource.format?.toLowerCase()] || `${resourceType}/${resource.format}`;
    const validation = validateUpload({
      mimeType: derivedMime,
      fileSizeBytes: resource.bytes,
      fileType: resourceType,
    });
    if (!validation.valid) {
      // The file that actually landed in Cloudinary fails our own rules
      // (e.g. someone bypassed the client check) — remove it, don't persist a record.
      await deleteResource(publicId, resourceType).catch(() => {});
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }

    const palette =
      resourceType === "image" ? paletteFromCloudinaryColors(resource.colors) : generateComicPalette({});

    const asset = await createMediaAsset({
      title,
      url: resource.secureUrl,
      thumbnail_url: resourceType === "video" ? posterUrl || null : resource.secureUrl,
      file_type: resourceType,
      category,
      client_name: clientName,
      campaign_headline: campaignHeadline,
      metrics: metrics || {},
      palette,
      created_by: session.id,
      alt_text: altText || null,
      caption: caption || null,
      width: resource.width,
      height: resource.height,
      file_size_bytes: resource.bytes,
      mime_type: derivedMime,
      storage_key: publicId,
      original_filename: originalFilename || null,
    } as any);

    return NextResponse.json({
      success: true,
      data: asset,
      message: "Media uploaded, verified, and palette extracted from the real image",
    });
  } catch (error: any) {
    const status = error.message === "FORBIDDEN_ADMIN_REQUIRED" ? 403 : 500;
    return NextResponse.json(
      { success: false, error: error.message || "Failed to confirm upload" },
      { status }
    );
  }
}
