"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CASE_STUDIES_DATA } from "@/lib/db";
import { BusinessCategory } from "@/lib/types";
import { ComicButton } from "@/components/comic/ComicButton";
import { StarburstBadge } from "@/components/comic/StarburstBadge";
import { TrendingUp, ArrowRight, ShieldCheck, Flame, Sparkles } from "lucide-react";

export default function CaseStudiesPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const filteredCaseStudies =
    selectedFilter === "ALL"
      ? CASE_STUDIES_DATA
      : CASE_STUDIES_DATA.filter((cs) => cs.category === selectedFilter);

  const categories = [
    { label: "ALL CAMPAIGNS", value: "ALL" },
    { label: "FOOD & HONEY", value: "food-honey" },
    { label: "SPORTS & CLEATS", value: "sports-football" },
    { label: "REAL ESTATE", value: "property" },
  ];

  return (
    <div className="bg-comic-black text-white min-h-screen">
      {/* Header */}
      <section className="py-20 bg-[#12131A] border-b-4 border-comic-black relative overflow-hidden">
        <div className="absolute inset-0 bg-halftone-dots opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-comic-cyan text-comic-black font-display text-xs px-3 py-1 uppercase tracking-wider rounded border-2 border-black shadow-[2px_2px_0px_#000] mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            PROVEN RESULTS WITH REAL CLIENT MEDIA
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white leading-none">
            VERIFIED CAMPAIGN <br />
            <span className="text-comic-pink" style={{ textShadow: "4px 4px 0px #000, 8px 8px 0px #FFE600" }}>
              CASE STUDIES
            </span>
          </h1>
          <p className="font-heading font-medium text-neutral-300 text-lg sm:text-xl max-w-2xl mx-auto mt-4">
            Real photos. Real videos. Verified revenue delivered across D2C brands, properties, and sports apparel.
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-3 justify-center pt-8">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedFilter(cat.value)}
                className={`text-xs font-heading font-black px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedFilter === cat.value
                    ? "bg-comic-yellow text-comic-black border-black shadow-[3px_3px_0px_#FF0055] scale-105"
                    : "bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-400"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Stream */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {filteredCaseStudies.map((cs) => (
          <div
            key={cs.id}
            className="comic-card p-8 lg:p-12 bg-neutral-900 border-[3.5px] border-comic-black relative overflow-hidden"
            style={{
              boxShadow: `10px 10px 0px ${cs.palette.vibrant}`,
            }}
          >
            {/* Top Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <span
                  className="comic-badge text-xs px-3 py-1 font-black uppercase"
                  style={{
                    backgroundColor: cs.palette.vibrant,
                    color: cs.palette.contrastText,
                  }}
                >
                  {cs.categoryLabel}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Client: <strong className="text-white">{cs.clientName}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-comic-green font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Analytics Report</span>
              </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-8">
              {/* Image Hero with Sticker */}
              <div className="lg:col-span-5">
                <div
                  className="relative aspect-[4/5] rounded-xl overflow-hidden border-[3px] border-comic-black shadow-[6px_6px_0px_#0A0A0C]"
                  style={{ transform: `rotate(${cs.palette.frameAngle || "-2deg"})` }}
                >
                  <Image
                    src={cs.heroImage}
                    alt={cs.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-comic-black/90 via-transparent to-transparent" />

                  {/* Top-Right Starburst Sticker */}
                  <div className="absolute top-4 right-4 animate-pulse-comic">
                    <StarburstBadge
                      size="md"
                      bgColor={cs.palette.vibrant}
                      textColor={cs.palette.contrastText}
                      rotate="6deg"
                    >
                      <span className="text-xs">{cs.stickerText}</span>
                    </StarburstBadge>
                  </div>

                  {/* Headline Overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3
                      className="font-display text-3xl uppercase leading-none text-white"
                      style={{
                        textShadow: `2px 2px 0px #0A0A0C, 4px 4px 0px ${cs.palette.vibrant}`,
                      }}
                    >
                      {cs.campaignHeadline}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Case Details & Metric Blocks */}
              <div className="lg:col-span-7 space-y-6">
                <h2 className="font-display text-3xl sm:text-4xl uppercase text-white leading-tight">
                  {cs.title}
                </h2>
                <p className="text-base text-neutral-300 font-body leading-relaxed">
                  {cs.summary}
                </p>

                {/* 4 Metric Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                  {cs.results.map((r, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-comic-black rounded-lg border-2 border-neutral-800 text-center space-y-0.5"
                    >
                      <p className="font-display text-2xl text-comic-yellow">{r.metric}</p>
                      <p className="text-xs font-heading font-black text-white">{r.value}</p>
                      <p className="text-[10px] font-mono text-neutral-400">{r.label}</p>
                    </div>
                  ))}
                </div>

                {/* Challenge & Solution */}
                <div className="space-y-3 text-sm font-body pt-2">
                  <div className="p-3.5 bg-neutral-950 rounded border-l-4 border-red-500">
                    <strong className="text-red-400 block font-heading uppercase text-xs">
                      The Challenge:
                    </strong>
                    <span className="text-neutral-300">{cs.challenge}</span>
                  </div>

                  <div className="p-3.5 bg-neutral-950 rounded border-l-4 border-comic-yellow">
                    <strong className="text-comic-yellow block font-heading uppercase text-xs">
                      The Viral Plug Solution:
                    </strong>
                    <span className="text-neutral-300">{cs.solution}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-4 flex items-center justify-between">
                  <Link href={`/enquiry?case=${cs.slug}`}>
                    <ComicButton
                      variant="yellow"
                      size="md"
                      icon={<Flame className="w-4 h-4 text-comic-black" />}
                    >
                      Replicate This Campaign
                    </ComicButton>
                  </Link>

                  <span className="text-xs font-mono text-neutral-500">
                    ID: {cs.id.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
