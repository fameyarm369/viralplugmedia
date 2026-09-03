import { NextResponse } from "next/server";
import { generateComicPalette, getContrastRatio } from "@/lib/palette-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dominant, vibrant, darkVibrant, lightVibrant, muted, darkMuted } = body;

    const palette = generateComicPalette({
      dominant,
      vibrant,
      darkVibrant,
      lightVibrant,
      muted,
      darkMuted,
    });

    const contrast = getContrastRatio(palette.contrastText, palette.darkVibrant);

    return NextResponse.json({
      success: true,
      palette,
      contrast: {
        ratio: contrast,
        isPass: contrast >= 4.5,
        rating: contrast >= 7.0 ? "AAA" : contrast >= 4.5 ? "AA" : "FAIL",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Palette processing failed" },
      { status: 500 }
    );
  }
}
