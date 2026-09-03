import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import { ColorPalette } from "./types";

extend([a11yPlugin]);

/**
 * Calculates WCAG 2.1 contrast ratio between two colors
 */
export function getContrastRatio(fg: string, bg: string): number {
  try {
    return colord(bg).contrast(fg);
  } catch {
    return 4.5;
  }
}

/**
 * Ensures text has a minimum WCAG AA contrast ratio of 4.5:1 against background
 */
export function ensureSafeContrast(
  textColor: string,
  bgColor: string,
  targetRatio: number = 4.5
): string {
  try {
    const bg = colord(bgColor);
    let fg = colord(textColor);

    if (bg.contrast(fg) >= targetRatio) {
      return fg.toHex();
    }

    // Determine whether to shift towards black or white
    const isBgDark = bg.isDark();
    let adjusted = isBgDark ? colord("#FFFFFF") : colord("#0A0A0C");

    // If pure white/black works, return it
    if (bg.contrast(adjusted) >= targetRatio) {
      return adjusted.toHex();
    }

    // Incremental adjustment
    let step = 0;
    while (bg.contrast(adjusted) < targetRatio && step < 10) {
      adjusted = isBgDark ? adjusted.lighten(0.05) : adjusted.darken(0.05);
      step++;
    }

    return adjusted.toHex();
  } catch {
    return "#FFFFFF";
  }
}

/**
 * Derives a full 5-swatch Media-Reactive Comic Palette with guaranteed WCAG safety
 */
export function generateComicPalette(raw: {
  dominant?: string;
  vibrant?: string;
  darkVibrant?: string;
  lightVibrant?: string;
  muted?: string;
  darkMuted?: string;
}): ColorPalette {
  const vibrant = raw.vibrant || raw.dominant || "#FF0055";
  const darkVibrant = raw.darkVibrant || raw.darkMuted || colord(vibrant).darken(0.35).toHex();
  const lightVibrant = raw.lightVibrant || colord(vibrant).lighten(0.25).toHex();
  const muted = raw.muted || colord(vibrant).desaturate(0.2).toHex();
  const darkMuted = raw.darkMuted || colord(darkVibrant).desaturate(0.3).toHex();

  const isDark = colord(darkVibrant).isDark();
  const contrastText = ensureSafeContrast(
    isDark ? "#FFFFFF" : "#0A0A0C",
    darkVibrant,
    4.5
  );

  return {
    dominant: raw.dominant || vibrant,
    vibrant,
    darkVibrant,
    lightVibrant,
    muted,
    darkMuted,
    contrastText,
    accentFrame: vibrant,
    isDarkImage: isDark,
    frameAngle: "-2.5deg",
  };
}

/**
 * Extracts a palette from an HTML Image Element on client side
 */
export async function extractPaletteFromImageElement(
  img: HTMLImageElement
): Promise<ColorPalette> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      
      if (!ctx) {
        resolve(DEFAULT_FALLBACK_PALETTE);
        return;
      }

      // Sample a scaled-down 50x50 grid for fast calculation
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);

      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;
      let maxSaturation = 0;
      let vibrantColor = "#FF0055";

      for (let i = 0; i < imageData.length; i += 16) {
        const pr = imageData[i];
        const pg = imageData[i + 1];
        const pb = imageData[i + 2];
        const pa = imageData[i + 3];

        if (pa < 128) continue; // Skip transparent pixels

        r += pr;
        g += pg;
        b += pb;
        count++;

        // Calculate saturation
        const c = colord({ r: pr, g: pg, b: pb });
        const sat = c.toHsl().s;
        if (sat > maxSaturation && c.toHsl().l > 25 && c.toHsl().l < 85) {
          maxSaturation = sat;
          vibrantColor = c.toHex();
        }
      }

      if (count === 0) {
        resolve(DEFAULT_FALLBACK_PALETTE);
        return;
      }

      const avgR = Math.round(r / count);
      const avgG = Math.round(g / count);
      const avgB = Math.round(b / count);
      const dominant = colord({ r: avgR, g: avgG, b: avgB }).toHex();

      const palette = generateComicPalette({
        dominant,
        vibrant: vibrantColor,
        darkVibrant: colord(vibrantColor).darken(0.3).toHex(),
        lightVibrant: colord(vibrantColor).lighten(0.2).toHex(),
        muted: colord(dominant).desaturate(0.2).toHex(),
        darkMuted: colord(dominant).darken(0.4).toHex(),
      });

      resolve(palette);
    } catch {
      resolve(DEFAULT_FALLBACK_PALETTE);
    }
  });
}

export const DEFAULT_FALLBACK_PALETTE: ColorPalette = {
  dominant: "#FF5E00",
  vibrant: "#FFE600",
  darkVibrant: "#1D3557",
  lightVibrant: "#FFF3B0",
  muted: "#E09F3E",
  darkMuted: "#335C67",
  contrastText: "#FFFFFF",
  accentFrame: "#FFE600",
  isDarkImage: true,
  frameAngle: "-3deg",
};

/**
 * Returns dynamic CSS style object with OKLCH CSS variables for media-reactive elements
 */
export function getPaletteStyle(palette: ColorPalette): React.CSSProperties {
  return {
    // Standard variables for CSS
    ["--media-vibrant" as string]: palette.vibrant,
    ["--media-dark" as string]: palette.darkVibrant,
    ["--media-light" as string]: palette.lightVibrant,
    ["--media-muted" as string]: palette.muted,
    ["--media-dark-muted" as string]: palette.darkMuted,
    ["--media-contrast-text" as string]: palette.contrastText,
    ["--media-accent-frame" as string]: palette.accentFrame,
    ["--media-frame-angle" as string]: palette.frameAngle || "-2.5deg",
  } as React.CSSProperties;
}
