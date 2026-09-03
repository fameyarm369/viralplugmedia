"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ComicButton } from "@/components/comic/ComicButton";
import { StarburstBadge } from "@/components/comic/StarburstBadge";
import { Check, Flame, ArrowRight, Calculator, Sparkles, Layers } from "lucide-react";
import { ColorPalette } from "@/lib/types";

interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  badge: string;
  description: string;
  key_features: string[];
  deliverables: string[];
  hero_image: string;
  palette: ColorPalette;
  starting_price: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetSlider, setBudgetSlider] = useState(50000);
  const [estimatedROAS, setEstimatedROAS] = useState(5.8);

  const estimatedRevenue = Math.round(budgetSlider * estimatedROAS);
  const estimatedReach = Math.round((budgetSlider / 50000) * 850000);

  useEffect(() => {
    fetch("/api/v1/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setServices(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-comic-black text-white min-h-screen">
      {/* Page Header */}
      <section className="py-20 border-b-4 border-comic-black bg-[#12131A] relative overflow-hidden">
        <div className="absolute inset-0 bg-halftone-dots opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-comic-yellow text-comic-black font-display text-xs px-3 py-1 uppercase tracking-wider rounded border-2 border-black shadow-[2px_2px_0px_#FF0055] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            HIGH-CONVERTING CAMPAIGN PACKAGES
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white leading-none">
            ENGINEERED FOR <br />
            <span className="text-comic-yellow" style={{ textShadow: "4px 4px 0px #000, 8px 8px 0px #FF0055" }}>
              MAXIMUM REVENUE
            </span>
          </h1>
          <p className="font-heading font-medium text-neutral-300 text-lg sm:text-xl max-w-2xl mx-auto mt-4">
            Explore our specialized vertical solutions powered by high-octane comic poster ad creatives, WhatsApp lead bots, and precision targeting.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {loading ? (
          <div className="comic-card p-12 text-center text-neutral-500 font-mono text-xs">
            Loading service packages from database...
          </div>
        ) : services.length === 0 ? (
          <div className="comic-card p-12 text-center bg-[#111218] border-2 border-dashed border-neutral-700 space-y-3">
            <Layers className="w-12 h-12 text-neutral-600 mx-auto" />
            <h3 className="font-display text-2xl uppercase text-white">
              No Service Packages Published
            </h3>
            <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
              Custom campaign packages will appear here once published to the database.
            </p>
            <Link href="/enquiry">
              <button className="text-xs font-heading font-black bg-comic-yellow text-comic-black px-4 py-2 rounded border border-black shadow-[2px_2px_0px_#000]">
                Request Custom Strategy Sprint →
              </button>
            </Link>
          </div>
        ) : (
          services.map((service, index) => {
            const isEven = index % 2 === 0;
            const vibrant = service.palette?.vibrant || "#FFE600";
            const contrastText = service.palette?.contrastText || "#000000";

            return (
              <div
                key={service.id}
                className="comic-card p-8 lg:p-12 bg-neutral-900 border-[3.5px] border-comic-black relative overflow-hidden"
                style={{
                  boxShadow: `8px 8px 0px ${vibrant}`,
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  {/* Media Image Column */}
                  <div className={`lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                    <div
                      className="relative aspect-[4/3] rounded-lg overflow-hidden border-[3px] border-comic-black shadow-[6px_6px_0px_#0A0A0C]"
                    >
                      <Image
                        src={service.hero_image}
                        alt={service.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className="comic-badge text-xs font-black uppercase"
                          style={{
                            backgroundColor: vibrant,
                            color: contrastText,
                          }}
                        >
                          {service.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className={`lg:col-span-7 space-y-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                    <div>
                      <span className="text-xs font-mono font-bold tracking-widest text-comic-cyan uppercase">
                        Vertical Solution
                      </span>
                      <h2 className="font-display text-3xl sm:text-4xl uppercase text-white mt-1">
                        {service.title}
                      </h2>
                      <p className="font-heading font-bold text-comic-yellow text-base mt-1">
                        {service.tagline}
                      </p>
                    </div>

                    <p className="text-sm sm:text-base text-neutral-300 font-body leading-relaxed">
                      {service.description}
                    </p>

                    {/* Deliverables Checklist */}
                    {service.deliverables && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs font-mono font-bold uppercase text-neutral-400">
                          Included Package Deliverables:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm font-heading font-bold text-neutral-200">
                          {service.deliverables.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-comic-yellow shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing & CTA */}
                    <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono text-neutral-400">Starting Investment</span>
                        <p className="font-display text-2xl text-white">{service.starting_price}</p>
                      </div>

                      <Link href={`/enquiry?service=${service.slug}`}>
                        <ComicButton
                          variant="yellow"
                          size="md"
                          icon={<Flame className="w-4 h-4 text-comic-black" />}
                        >
                          Book Vertical Campaign
                        </ComicButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* Interactive Campaign ROI Estimator */}
      <section id="pricing" className="py-20 bg-[#0E1017] border-t-4 border-comic-black relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="comic-card p-8 sm:p-12 bg-comic-black border-[3.5px] border-comic-yellow shadow-[10px_10px_0px_#FFE600] space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-comic-pink text-white text-xs font-heading font-black px-3 py-1 rounded">
                <Calculator className="w-4 h-4" />
                <span>INTERACTIVE ROI SIMULATOR</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl uppercase text-white">
                ESTIMATE YOUR CAMPAIGN RETURNS
              </h2>
              <p className="text-sm font-heading text-neutral-300">
                Slide your planned monthly ad budget to see projected reach, orders, and gross returns.
              </p>
            </div>

            {/* Slider Controls */}
            <div className="space-y-6 pt-4">
              <div>
                <div className="flex justify-between items-center text-sm font-mono mb-2">
                  <span className="text-neutral-300 font-bold">Planned Monthly Budget:</span>
                  <span className="font-display text-2xl text-comic-yellow">
                    ₹{budgetSlider.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="500000"
                  step="5000"
                  value={budgetSlider}
                  onChange={(e) => setBudgetSlider(Number(e.target.value))}
                  className="w-full accent-comic-yellow h-3 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Projected Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-neutral-900 rounded border-2 border-neutral-800 text-center space-y-1">
                <span className="text-xs font-mono text-neutral-400 uppercase font-bold">
                  Estimated Ad Reach
                </span>
                <p className="font-display text-3xl text-comic-cyan">
                  {estimatedReach.toLocaleString("en-IN")}+
                </p>
                <span className="text-[11px] text-neutral-500">Impressions</span>
              </div>

              <div className="p-4 bg-neutral-900 rounded border-2 border-neutral-800 text-center space-y-1">
                <span className="text-xs font-mono text-neutral-400 uppercase font-bold">
                  Target ROAS
                </span>
                <p className="font-display text-3xl text-comic-pink">
                  {estimatedROAS}x
                </p>
                <span className="text-[11px] text-neutral-500">Blended Efficiency</span>
              </div>

              <div className="p-4 bg-neutral-900 rounded border-2 border-neutral-800 text-center space-y-1">
                <span className="text-xs font-mono text-comic-yellow uppercase font-bold">
                  Projected Revenue
                </span>
                <p className="font-display text-3xl text-white">
                  ₹{estimatedRevenue.toLocaleString("en-IN")}
                </p>
                <span className="text-[11px] text-comic-yellow">Estimated Gross</span>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link href={`/enquiry?budget=${budgetSlider}`}>
                <ComicButton variant="yellow" size="lg">
                  Lock In This Campaign Strategy →
                </ComicButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
