import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeBannerProps {
  items?: string[];
  bgClassName?: string;
  textClassName?: string;
  reverse?: boolean;
}

export const MarqueeBanner: React.FC<MarqueeBannerProps> = ({
  items = [
    "🔥 SCALING D2C BRANDS",
    "⚡ REAL ESTATE LEAD BLITZ",
    "🏆 SPORTS & FOOTWEAR DROPS",
    "💥 VIRAL CREATOR CAMPAIGNS",
    "🎯 HYPER-LOCAL RETAIL FOOTFALLS",
    "🚀 MEDIA-REACTIVE COMIC ENGINE",
  ],
  bgClassName = "bg-comic-yellow text-comic-black border-y-4 border-comic-black",
  textClassName = "font-display text-xl md:text-2xl uppercase tracking-wider",
  reverse = false,
}) => {
  return (
    <div className={cn("overflow-hidden py-3 select-none flex", bgClassName)}>
      <div
        className={cn(
          "flex whitespace-nowrap gap-8 animate-marquee shrink-0 items-center",
          reverse && "direction-reverse"
        )}
      >
        {items.concat(items).map((item, index) => (
          <div key={index} className={cn("flex items-center gap-8", textClassName)}>
            <span>{item}</span>
            <span className="text-comic-pink text-lg">★</span>
          </div>
        ))}
      </div>
    </div>
  );
};
