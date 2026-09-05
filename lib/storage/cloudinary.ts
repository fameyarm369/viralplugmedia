import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary storage layer.
 *
 * Credentials come from env vars only — never hardcode them here.
 * Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export const ALLOWED_VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
]);

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024; // 25MB
export const MAX_VIDEO_BYTES = 150 * 1024 * 1024; // 150MB

export interface UploadValidationInput {
  mimeType: string;
  fileSizeBytes: number;
  fileType: "image" | "video";
}

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Server-side allowlist check — run this BEFORE issuing an upload signature
 * AND again in /confirm against what Cloudinary actually stored, so a
 * tampered client request can't bypass either check alone.
 */
export function validateUpload({
  mimeType,
  fileSizeBytes,
  fileType,
}: UploadValidationInput): UploadValidationResult {
  const allowedMimes = fileType === "image" ? ALLOWED_IMAGE_MIME : ALLOWED_VIDEO_MIME;
  const maxBytes = fileType === "image" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

  if (!allowedMimes.has(mimeType)) {
    return {
      valid: false,
      error: `File type "${mimeType}" is not allowed for ${fileType} uploads. Allowed: ${Array.from(allowedMimes).join(", ")}`,
    };
  }

  if (fileSizeBytes > maxBytes) {
    return {
      valid: false,
      error: `File is ${(fileSizeBytes / (1024 * 1024)).toFixed(1)}MB, exceeds the ${maxBytes / (1024 * 1024)}MB limit for ${fileType}s.`,
    };
  }

  return { valid: true };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export interface SignedUploadParams {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  resourceType: "image" | "video";
}

/**
 * Generates a signed upload payload for a direct browser -> Cloudinary
 * upload. The API secret never leaves the server — only the signature does.
 */
export function generateUploadSignature(params: {
  fileType: "image" | "video";
  category?: string;
  originalFilename?: string;
}): SignedUploadParams {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment."
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `landing/${slugify(params.category || "general")}`;
  const publicId = `${Date.now()}-${slugify(params.originalFilename || "asset")}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, public_id: publicId },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    publicId,
    resourceType: params.fileType,
  };
}

export interface CloudinaryResourceDetails {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number | null;
  height: number | null;
  bytes: number;
  format: string;
  resourceType: "image" | "video";
  colors?: [string, number][]; // [hexColor, percentageCoverage]
}

/**
 * Fetches the resource directly from Cloudinary's Admin API by public_id.
 * Never trust width/height/bytes/format supplied by the client — always
 * re-derive them from what Cloudinary actually stored.
 */
export async function fetchResourceDetails(
  publicId: string,
  resourceType: "image" | "video"
): Promise<CloudinaryResourceDetails> {
  const res = await cloudinary.api.resource(publicId, {
    resource_type: resourceType,
    colors: resourceType === "image",
  });

  return {
    publicId: res.public_id,
    url: res.url,
    secureUrl: res.secure_url,
    width: res.width ?? null,
    height: res.height ?? null,
    bytes: res.bytes,
    format: res.format,
    resourceType,
    colors: res.colors,
  };
}

export async function deleteResource(publicId: string, resourceType: "image" | "video"): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
