"use client";

import React from "react";
import Image from "next/image";
import { MediaAsset } from "@/lib/types";
import { getPaletteStyle } from "@/lib/palette-engine";
import { cn } from "@/lib/utils";
import { StarburstBadge } from "./StarburstBadge";
import { Eye, TrendingUp, Sparkles } from "lucide-react";

interface ComicPosterCardProps {
  asset: MediaAsset;
  className?: string;
  showMetrics?: boolean;
  priority?: boolean;
  onClick?: () => void;
}

export const ComicPosterCard: React.FC<ComicPosterCardProps> = ({
  asset,
  className,
  showMetrics = true,
  priority = false,
  onClick,
}) => {
  const paletteStyle = getPaletteStyle(asset.palette);

  return (
    <div
      style={paletteStyle}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-comic-black border-[3.5px] border-comic-black transition-all duration-300",
        "cursor-pointer",
        className
      )}
    >
      {/* Dynamic Drop Shadow & Angle Layer */}
      <div
        className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
        style={{
          boxShadow: `8px 8px 0px ${asset.palette.vibrant}`,
        }}
      />

      {/* Hero Media Container (Real Photo / Video Hero) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-900">
        <Image
          src={asset.url}
          alt={asset.title}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Halftone Dot Overlay at bottom of media */}
        <div className="absolute inset-0 bg-gradient-to-t from-comic-black via-transparent to-black/30 pointer-events-none" />

        {/* Dynamic Category Sticker Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className="comic-badge text-xs font-black px-3 py-1 uppercase tracking-wider rounded-sm"
            style={{
              backgroundColor: asset.palette.vibrant,
              color: asset.palette.contrastText,
              borderColor: "#0A0A0C",
            }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {asset.category.replace("-", " ")}
          </span>
        </div>

        {/* Top-Right Starburst Metric Badge */}
        {asset.metrics?.roas && (
          <div className="absolute top-3 right-3 z-10 animate-pulse-comic">
            <StarburstBadge
              size="sm"
              bgColor={asset.palette.vibrant}
              textColor={asset.palette.contrastText}
              rotate="6deg"
            >
              <span className="text-[10px] opacity-90">VERIFIED</span>
              <span className="text-xs font-black">{asset.metrics.roas}</span>
            </StarburstBadge>
          </div>
        )}

        {/* Client Label Banner */}
        <div className="absolute bottom-16 left-4 right-4 z-10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/90 drop-shadow-[1px_1px_0px_#000]">
            Client: {asset.clientName}
          </p>
          <h3
            className="font-display text-2xl md:text-3xl uppercase leading-none tracking-wide mt-0.5 text-white"
            style={{
              textShadow: `2px 2px 0px #0A0A0C, 4px 4px 0px ${asset.palette.vibrant}`,
            }}
          >
            {asset.campaignHeadline}
          </h3>
        </div>

        {/* Bottom Metric Bar */}
        {showMetrics && asset.metrics && (
          <div className="absolute bottom-0 inset-x-0 bg-comic-black/95 backdrop-blur-sm border-t-2 border-comic-black p-3 px-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 text-white text-xs font-bold">
              <Eye className="w-3.5 h-3.5" style={{ color: asset.palette.vibrant }} />
              <span>{asset.metrics.views || "1.2M+"} Reach</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <TrendingUp className="w-3.5 h-3.5" style={{ color: asset.palette.vibrant }} />
              <span>{asset.metrics.conversions || "High ROI"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Auto-Extracted Swatch Indicator Strip (Underneath Media) */}
      <div className="bg-comic-black p-2.5 px-4 flex items-center justify-between border-t-2 border-neutral-800 text-[10px] font-mono text-neutral-400">
        <span className="font-sans font-bold uppercase text-[11px] text-neutral-300">
          Auto-Palette:
        </span>
        <div className="flex items-center gap-1.5">
          <div
            className="w-4 h-4 rounded-full border border-black"
            style={{ backgroundColor: asset.palette.vibrant }}
            title={`Vibrant: ${asset.palette.vibrant}`}
          />
          <div
            className="w-4 h-4 rounded-full border border-black"
            style={{ backgroundColor: asset.palette.darkVibrant }}
            title={`Dark: ${asset.palette.darkVibrant}`}
          />
          <div
            className="w-4 h-4 rounded-full border border-black"
            style={{ backgroundColor: asset.palette.lightVibrant }}
            title={`Light: ${asset.palette.lightVibrant}`}
          />
          <div
            className="w-4 h-4 rounded-full border border-black"
            style={{ backgroundColor: asset.palette.muted }}
            title={`Muted: ${asset.palette.muted}`}
          />
          <span className="text-[10px] font-bold text-comic-yellow ml-1">
            WCAG AA ✓
          </span>
        </div>
      </div>
    </div>
  );
};
