"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ComicButton } from "../comic/ComicButton";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import { ColorPalette } from "@/lib/types";

interface VerticalItem {
  id: string;
  category: string;
  headline: string;
  client_name: string;
  reach_stat: string;
  roas_stat: string;
  media_url?: string;
  media_title?: string;
  palette?: ColorPalette;
}

export const CategoryGrid = () => {
  const [verticals, setVerticals] = useState<VerticalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/verticals?featured=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setVerticals(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && verticals.length === 0) {
    return null; // Cleanly hide if no verticals published yet
  }

  return (
    <section className="py-24 bg-comic-black text-white border-b-4 border-comic-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <span className="comic-badge bg-comic-yellow text-comic-black text-xs font-black mb-3">
              TAILORED CAMPAIGN ECOSYSTEMS
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-none text-white">
              WHAT ARE WE PROMOTING <br />
              <span className="text-comic-pink">FOR YOUR BRAND?</span>
            </h2>
          </div>

          <Link href="/services">
            <ComicButton variant="white" size="sm" icon={<ArrowUpRight className="w-4 h-4" />}>
              Explore All Services
            </ComicButton>
          </Link>
        </div>

        {/* Dynamic Category Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {verticals.map((vert) => {
            const vibrant = vert.palette?.vibrant || "#FFE600";
            const contrastText = vert.palette?.contrastText || "#0A0A0C";

            return (
              <div
                key={vert.id}
                className="comic-card group relative overflow-hidden flex flex-col justify-between hover:-translate-y-1.5 transition-transform bg-[#12131A] border-2 border-comic-black"
                style={{
                  boxShadow: `6px 6px 0px ${vibrant}`,
                }}
              >
                {/* Image Preview Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 border-b-2 border-comic-black">
                  {vert.media_url ? (
                    <Image
                      src={vert.media_url}
                      alt={vert.headline}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 font-mono text-xs">
                      No Media Linked
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-comic-black via-black/20 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className="comic-badge text-xs px-2.5 py-0.5 uppercase"
                      style={{
                        backgroundColor: vibrant,
                        color: contrastText,
                      }}
                    >
                      {vert.category.replace("-", " ")}
                    </span>
                  </div>

                  {/* Verified ROI Badge */}
                  {vert.roas_stat && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-comic-black/90 text-comic-yellow border border-comic-yellow text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-[2px_2px_0px_#000]">
                        {vert.roas_stat}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">
                      Client: {vert.client_name}
                    </p>
                    <h3 className="font-display text-2xl uppercase text-white mt-1 group-hover:text-comic-yellow transition-colors">
                      {vert.headline}
                    </h3>
                    <p className="text-sm text-neutral-300 font-body mt-2 leading-relaxed">
                      Custom comic-poster video hooks, automated lead funnels, and high-impact UGC seeding designed to dominate market share.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-xs font-mono text-comic-cyan font-bold">
                      {vert.reach_stat}
                    </span>

                    <Link href={`/enquiry?category=${vert.category}`}>
                      <span className="inline-flex items-center gap-1 font-heading text-xs font-black uppercase text-white hover:text-comic-yellow group-hover:translate-x-1 transition-all">
                        Launch Niche Campaign →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
