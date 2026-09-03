"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ColorPalette } from "@/lib/types";
import { ComicButton } from "@/components/comic/ComicButton";
import { StarburstBadge } from "@/components/comic/StarburstBadge";
import { TrendingUp, ArrowRight, ShieldCheck, Flame, Sparkles, Layers } from "lucide-react";

interface CaseStudyItem {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  category: string;
  category_label: string;
  hero_image: string;
  campaign_headline: string;
  sticker_text: string;
  summary: string;
  results: Array<{ metric: string; value: string; label: string }>;
  challenge: string;
  solution: string;
  palette: ColorPalette;
}

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/v1/case-studies")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setCaseStudies(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCaseStudies =
    selectedFilter === "ALL"
      ? caseStudies
      : caseStudies.filter((cs) => cs.category === selectedFilter);

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
        {loading ? (
          <div className="comic-card p-12 text-center text-neutral-500 font-mono text-xs">
            Loading case studies from database...
          </div>
        ) : filteredCaseStudies.length === 0 ? (
          <div className="comic-card p-12 text-center bg-[#111218] border-2 border-dashed border-neutral-700 space-y-3">
            <Layers className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="font-display text-2xl uppercase text-white">
              No Case Studies Published Yet
            </h3>
            <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
              Verified case studies will display here as active campaigns achieve verified performance milestones.
            </p>
            <Link href="/enquiry">
              <button className="text-xs font-heading font-black bg-comic-yellow text-comic-black px-4 py-2 rounded border border-black shadow-[2px_2px_0px_#000]">
                Launch Your Campaign →
              </button>
            </Link>
          </div>
        ) : (
          filteredCaseStudies.map((cs) => {
            const vibrant = cs.palette?.vibrant || "#FFE600";
            const contrastText = cs.palette?.contrastText || "#000000";

            return (
              <div
                key={cs.id}
                className="comic-card p-8 lg:p-12 bg-neutral-900 border-[3.5px] border-comic-black relative overflow-hidden"
                style={{
                  boxShadow: `10px 10px 0px ${vibrant}`,
                }}
              >
                {/* Top Ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <span
                      className="comic-badge text-xs px-3 py-1 font-black uppercase"
                      style={{
                        backgroundColor: vibrant,
                        color: contrastText,
                      }}
                    >
                      {cs.category_label || cs.category}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      Client: <strong className="text-white">{cs.client_name}</strong>
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
                    >
                      <Image
                        src={cs.hero_image}
                        alt={cs.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-comic-black/90 via-transparent to-transparent" />

                      {/* Top-Right Starburst Sticker */}
                      {cs.sticker_text && (
                        <div className="absolute top-4 right-4 animate-pulse-comic">
                          <StarburstBadge
                            size="md"
                            bgColor={vibrant}
                            textColor={contrastText}
                            rotate="6deg"
                          >
                            <span className="text-xs">{cs.sticker_text}</span>
                          </StarburstBadge>
                        </div>
                      )}

                      {/* Headline Overlay */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3
                          className="font-display text-3xl uppercase leading-none text-white"
                          style={{
                            textShadow: `2px 2px 0px #0A0A0C, 4px 4px 0px ${vibrant}`,
                          }}
                        >
                          {cs.campaign_headline}
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

                    {/* Metric Boxes */}
                    {cs.results && (
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
                    )}

                    {/* Challenge & Solution */}
                    <div className="space-y-3 text-sm font-body pt-2">
                      {cs.challenge && (
                        <div className="p-3.5 bg-neutral-950 rounded border-l-4 border-red-500">
                          <strong className="text-red-400 block font-heading uppercase text-xs">
                            The Challenge:
                          </strong>
                          <span className="text-neutral-300">{cs.challenge}</span>
                        </div>
                      )}

                      {cs.solution && (
                        <div className="p-3.5 bg-neutral-950 rounded border-l-4 border-comic-yellow">
                          <strong className="text-comic-yellow block font-heading uppercase text-xs">
                            The Viral Plug Solution:
                          </strong>
                          <span className="text-neutral-300">{cs.solution}</span>
                        </div>
                      )}
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
            );
          })
        )}
      </section>
    </div>
  );
}
