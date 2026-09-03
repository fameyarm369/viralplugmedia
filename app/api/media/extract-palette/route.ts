import { NextResponse } from "next/server";
import { generateComicPalette } from "@/lib/palette-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dominant, vibrant, darkVibrant, lightVibrant, muted } = body;

    const palette = generateComicPalette({
      dominant,
      vibrant,
      darkVibrant,
      lightVibrant,
      muted,
    });

    return NextResponse.json({
      success: true,
      palette,
      timestamp: new Date().toISOString(),
      engine: "node-vibrant-wasm-v2",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Palette extraction failed" },
      { status: 500 }
    );
  }
}
