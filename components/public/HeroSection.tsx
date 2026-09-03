"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SAMPLE_MEDIA_ASSETS } from "@/lib/db";
import { ComicPosterCard } from "@/components/comic/ComicPosterCard";
import { ComicButton } from "@/components/comic/ComicButton";
import { StarburstBadge } from "@/components/comic/StarburstBadge";
import { Flame, ArrowRight, Zap, Play, CheckCircle2, Sparkles } from "lucide-react";

export const HeroSection = () => {
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  const currentAsset = SAMPLE_MEDIA_ASSETS[selectedAssetIndex];

  return (
    <section className="relative overflow-hidden bg-comic-black text-white pt-10 pb-20 border-b-4 border-comic-black">
      {/* Background Halftone & Speed Lines */}
      <div className="absolute inset-0 bg-halftone-dots opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-speedlines opacity-30 pointer-events-none" />

      {/* Floating Accent Badges */}
      <div className="hidden xl:block absolute top-12 left-10 z-10 animate-pulse-comic">
        <StarburstBadge size="md" bgColor="#FFE600" textColor="#0A0A0C" rotate="-8deg">
          <span className="text-xs">NO BORING</span>
          <span className="text-sm font-black">STOCK ADS 🚫</span>
        </StarburstBadge>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Explosive Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline Ribbon */}
            <div className="inline-flex items-center gap-2 bg-neutral-900 border-2 border-comic-yellow px-4 py-1.5 rounded-full shadow-[3px_3px_0px_#FFE600]">
              <Zap className="w-4 h-4 text-comic-yellow fill-comic-yellow" />
              <span className="text-xs font-mono font-bold tracking-wider text-comic-yellow uppercase">
                MEDIA-REACTIVE COMIC POSTER ENGINE
              </span>
            </div>

            {/* Massive Extruded Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl uppercase tracking-tight leading-[0.92] text-white">
              REAL MEDIA. <br />
              <span
                className="text-comic-yellow inline-block"
                style={{
                  textShadow: "4px 4px 0px #0A0A0C, 8px 8px 0px #FF0055",
                }}
              >
                UNSTOPPABLE
              </span>{" "}
              <br />
              VIRAL REACH.
            </h1>

            {/* Subheading */}
            <p className="font-heading text-lg sm:text-xl text-neutral-300 max-w-2xl font-medium leading-relaxed">
              We turn real photos & videos of your <strong className="text-white">Properties, Food & Honey brands, Sports gear, Apparel, and Local shops</strong> into high-voltage comic-poster ad creatives with auto-extracted color palettes that crush ROAS.
            </p>

            {/* Quick Interactive Niche Switcher */}
            <div className="pt-2">
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold mb-2.5">
                Preview Real Client Verticals:
              </p>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {SAMPLE_MEDIA_ASSETS.map((asset, idx) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetIndex(idx)}
                    className={`text-xs font-heading font-black px-3 py-1.5 rounded border-2 transition-all ${
                      selectedAssetIndex === idx
                        ? "bg-comic-yellow text-comic-black border-black shadow-[3px_3px_0px_#FF0055] scale-105"
                        : "bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    {asset.category.replace("-", " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/enquiry">
                <ComicButton
                  variant="yellow"
                  size="lg"
                  icon={<Flame className="w-5 h-5 text-comic-black" />}
                >
                  Promote My Business
                </ComicButton>
              </Link>

              <Link href="/case-studies">
                <ComicButton
                  variant="white"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5 text-comic-black" />}
                >
                  View Live Case Studies
                </ComicButton>
              </Link>
            </div>

            {/* Trust Proof Checklist */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-neutral-800 text-xs font-heading font-bold text-neutral-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-comic-yellow shrink-0" />
                <span>Zero Cartoon Mascots</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-comic-cyan shrink-0" />
                <span>WCAG Contrast Safe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-comic-pink shrink-0" />
                <span>6.2x Average ROAS</span>
              </div>
            </div>
          </div>

          {/* Right Column: Active Interactive Media Poster Preview */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Dynamic Comic Poster Card with Real Photo/Video */}
              <ComicPosterCard
                asset={currentAsset}
                priority
                className="w-full"
              />

              {/* Floating Prompt Annotation */}
              <div className="absolute -bottom-6 -left-6 bg-comic-black border-2 border-comic-yellow text-white text-xs font-heading font-black p-2.5 rounded-lg shadow-[4px_4px_0px_#FFE600] flex items-center gap-2 z-20">
                <Sparkles className="w-4 h-4 text-comic-yellow animate-spin" />
                <span>Colors dynamically extracted from photo!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
