import { NextResponse } from "next/server";
import { listFestivalThemes, setActiveFestivalTheme, createFestivalTheme } from "@/lib/db/queries";

export async function GET(req: Request) {
  try {
    const themes = await listFestivalThemes();
    return NextResponse.json({
      success: true,
      data: themes,
      activeTheme: themes.find((t) => t.isActive) || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch festival themes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.action === "ACTIVATE_THEME") {
      const active = await setActiveFestivalTheme(body.themeId);
      return NextResponse.json({
        success: true,
        data: active,
        message: "Festival theme successfully applied to landing page!",
      });
    }

    const { name, festivalType, description, colorScheme, elements, autoExpiryDate, mediaAssets } = body;

    if (!name || !colorScheme) {
      return NextResponse.json(
        { success: false, error: "Theme name and color scheme are required" },
        { status: 400 }
      );
    }

    const created = await createFestivalTheme({
      name,
      festivalType: festivalType || "CUSTOM",
      description: description || "",
      colorScheme,
      elements: elements || { bannerHeadline: name, tagline: "", stickerEmoji: "🎉", badgeText: "FESTIVAL SPECIAL" },
      autoExpiryDate,
      mediaAssets,
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: "Custom festival theme created successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process festival theme request" },
      { status: 500 }
    );
  }
}
