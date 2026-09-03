import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SAMPLE_MEDIA_ASSETS } from "@/lib/db";
import { ComicButton } from "../comic/ComicButton";
import { StarburstBadge } from "../comic/StarburstBadge";
import { ArrowUpRight, Flame } from "lucide-react";

export const CategoryGrid = () => {
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

        {/* 6 Category Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SAMPLE_MEDIA_ASSETS.map((asset) => (
            <div
              key={asset.id}
              className="comic-card group relative overflow-hidden flex flex-col justify-between hover:-translate-y-1.5 transition-transform"
              style={{
                boxShadow: `6px 6px 0px ${asset.palette.vibrant}`,
              }}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 border-b-2 border-comic-black">
                <Image
                  src={asset.url}
                  alt={asset.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-comic-black via-black/20 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className="comic-badge text-xs px-2.5 py-0.5"
                    style={{
                      backgroundColor: asset.palette.vibrant,
                      color: asset.palette.contrastText,
                    }}
                  >
                    {asset.category.replace("-", " ").toUpperCase()}
                  </span>
                </div>

                {/* Verified ROI Badge */}
                {asset.metrics?.roas && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-comic-black/90 text-comic-yellow border border-comic-yellow text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow-[2px_2px_0px_#000]">
                      {asset.metrics.roas}
                    </span>
                  </div>
                )}
              </div>

              {/* Content Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold">
                    Target Niche
                  </p>
                  <h3 className="font-display text-2xl uppercase text-white mt-1 group-hover:text-comic-yellow transition-colors">
                    {asset.title}
                  </h3>
                  <p className="text-sm text-neutral-300 font-body mt-2 leading-relaxed">
                    Custom comic-poster video hooks, automated lead funnels, and high-impact UGC seeding designed to dominate market share.
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-comic-cyan font-bold">
                    {asset.metrics?.views || "1.2M+"} Target Reach
                  </span>

                  <Link href={`/enquiry?category=${asset.category}`}>
                    <span className="inline-flex items-center gap-1 font-heading text-xs font-black uppercase text-white hover:text-comic-yellow group-hover:translate-x-1 transition-all">
                      Launch Niche Campaign →
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
