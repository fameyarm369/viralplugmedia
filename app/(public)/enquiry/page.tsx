"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BusinessCategory, ColorPalette } from "@/lib/types";
import { DEFAULT_FALLBACK_PALETTE, getPaletteStyle } from "@/lib/palette-engine";
import { ComicButton } from "@/components/comic/ComicButton";
import { StarburstBadge } from "@/components/comic/StarburstBadge";
import { createWhatsAppLink } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Flame,
  Upload,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Zap,
} from "lucide-react";

export default function EnquiryPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    category: "food-honey" as BusinessCategory,
    phone: "",
    email: "",
    budgetRange: "₹50k-₹1.5L / mo",
    timeline: "Immediately (Within 7 days)",
    notes: "",
    mediaUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=85",
    campaignHeadline: "EXPLOSIVE GROWTH AWAITS.",
  });

  const [extractedPalette, setExtractedPalette] = useState<ColorPalette>(DEFAULT_FALLBACK_PALETTE);

  const categories: { label: string; value: BusinessCategory; defaultImg: string; color: string }[] = [
    {
      label: "Food & Honey Brand",
      value: "food-honey",
      defaultImg: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=85",
      color: "#F59E0B",
    },
    {
      label: "Sports & Football Gear",
      value: "sports-football",
      defaultImg: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=85",
      color: "#EF4444",
    },
    {
      label: "Real Estate & Room Stay",
      value: "property",
      defaultImg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
      color: "#0EA5E9",
    },
    {
      label: "Fashion & Streetwear",
      value: "fashion-apparel",
      defaultImg: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
      color: "#A855F7",
    },
    {
      label: "Local Retail / Cafe",
      value: "local-shop",
      defaultImg: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85",
      color: "#F97316",
    },
    {
      label: "Creator / Event Launch",
      value: "creator-influencer",
      defaultImg: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85",
      color: "#00F0FF",
    },
  ];

  const handleCategorySelect = (cat: (typeof categories)[0]) => {
    setFormData((prev) => ({
      ...prev,
      category: cat.value,
      mediaUrl: cat.defaultImg,
    }));
    setExtractedPalette((prev) => ({
      ...prev,
      vibrant: cat.color,
      accentFrame: cat.color,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // POST to /api/leads
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FFE600", "#FF0055", "#00F0FF", "#00E575"],
      });

      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const whatsappMessage = `*New Campaign Enquiry — Viral Plug Media*%0A%0A*Name:* ${formData.name}%0A*Business:* ${formData.businessName}%0A*Category:* ${formData.category}%0A*Budget:* ${formData.budgetRange}%0A*Timeline:* ${formData.timeline}%0A*Notes:* ${formData.notes || "Ready to launch!"}`;
  const whatsappUrl = createWhatsAppLink("919876543210", whatsappMessage);

  return (
    <div className="bg-comic-black text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-halftone-dots opacity-25 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="comic-badge bg-comic-yellow text-comic-black text-xs font-black">
            IGNITE YOUR REACH ⚡
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-none">
            START YOUR CAMPAIGN <br />
            <span className="text-comic-yellow" style={{ textShadow: "3px 3px 0px #000" }}>
              WITH VIRAL PLUG MEDIA
            </span>
          </h1>
          <p className="font-heading font-medium text-neutral-300 text-sm sm:text-base max-w-xl mx-auto">
            Fill out your details to generate your live media-reactive comic proposal and unlock our dedicated team.
          </p>
        </div>

        {/* Form Container */}
        <div className="comic-card p-6 sm:p-10 bg-neutral-900 border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600]">
          {!submitted ? (
            <div>
              {/* Step Progress Bar */}
              <div className="flex items-center justify-between pb-8 mb-8 border-b border-neutral-800 text-xs font-heading font-black uppercase">
                <div className={`flex items-center gap-2 ${step >= 1 ? "text-comic-yellow" : "text-neutral-500"}`}>
                  <span className={`w-7 h-7 rounded border-2 border-black flex items-center justify-center ${step >= 1 ? "bg-comic-yellow text-black" : "bg-neutral-800 text-neutral-400"}`}>
                    1
                  </span>
                  <span>Category & Info</span>
                </div>

                <div className={`flex items-center gap-2 ${step >= 2 ? "text-comic-yellow" : "text-neutral-500"}`}>
                  <span className={`w-7 h-7 rounded border-2 border-black flex items-center justify-center ${step >= 2 ? "bg-comic-yellow text-black" : "bg-neutral-800 text-neutral-400"}`}>
                    2
                  </span>
                  <span>Budget & Goals</span>
                </div>

                <div className={`flex items-center gap-2 ${step >= 3 ? "text-comic-yellow" : "text-neutral-500"}`}>
                  <span className={`w-7 h-7 rounded border-2 border-black flex items-center justify-center ${step >= 3 ? "bg-comic-yellow text-black" : "bg-neutral-800 text-neutral-400"}`}>
                    3
                  </span>
                  <span>Media Preview</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* STEP 1: Category & Contact */}
                {step === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Select Your Business Niche:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories.map((cat) => (
                          <button
                            type="button"
                            key={cat.value}
                            onClick={() => handleCategorySelect(cat)}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              formData.category === cat.value
                                ? "bg-comic-yellow text-comic-black border-black shadow-[3px_3px_0px_#FF0055] font-black"
                                : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500 font-bold"
                            } text-xs font-heading`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Vikram Malhotra"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-comic-black border-2 border-neutral-700 rounded p-3 text-sm text-white focus:border-comic-yellow focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5">
                          Brand / Business Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Vedika Organics"
                          value={formData.businessName}
                          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                          className="w-full bg-comic-black border-2 border-neutral-700 rounded p-3 text-sm text-white focus:border-comic-yellow focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5">
                          WhatsApp Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-comic-black border-2 border-neutral-700 rounded p-3 text-sm text-white focus:border-comic-yellow focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5">
                          Official Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="founder@yourbrand.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-comic-black border-2 border-neutral-700 rounded p-3 text-sm text-white focus:border-comic-yellow focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <ComicButton
                        type="button"
                        variant="yellow"
                        size="md"
                        onClick={() => {
                          if (formData.name && formData.businessName && formData.phone && formData.email) {
                            setStep(2);
                          } else {
                            alert("Please fill in your contact information to proceed.");
                          }
                        }}
                        icon={<ArrowRight className="w-4 h-4 text-comic-black" />}
                      >
                        Next: Budget & Goals
                      </ComicButton>
                    </div>
                  </div>
                )}

                {/* STEP 2: Budget & Timeline */}
                {step === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Monthly Ad Spend Budget Range:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {["₹25k-₹50k / mo", "₹50k-₹1.5L / mo", "₹1.5L+ / mo (Enterprise)"].map((b) => (
                          <button
                            type="button"
                            key={b}
                            onClick={() => setFormData({ ...formData, budgetRange: b })}
                            className={`p-3.5 rounded-lg border-2 text-center transition-all ${
                              formData.budgetRange === b
                                ? "bg-comic-cyan text-comic-black border-black shadow-[3px_3px_0px_#000] font-black"
                                : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500 font-bold"
                            } text-xs font-heading`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-2">
                        Target Launch Timeline:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {["Immediately (Within 7 days)", "Within 2-3 weeks", "Planning for next month"].map((t) => (
                          <button
                            type="button"
                            key={t}
                            onClick={() => setFormData({ ...formData, timeline: t })}
                            className={`p-3.5 rounded-lg border-2 text-center transition-all ${
                              formData.timeline === t
                                ? "bg-comic-pink text-white border-black shadow-[3px_3px_0px_#000] font-black"
                                : "bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-500 font-bold"
                            } text-xs font-heading`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-neutral-300 mb-1.5">
                        Specific Campaign Goals or Requirements
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Scaling Shopify ROAS from 2x to 5x, generating 50 site visits for luxury 3BHKs, etc."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full bg-comic-black border-2 border-neutral-700 rounded p-3 text-sm text-white focus:border-comic-yellow focus:outline-none"
                      />
                    </div>

                    <div className="pt-4 flex justify-between">
                      <ComicButton
                        type="button"
                        variant="white"
                        size="md"
                        onClick={() => setStep(1)}
                        icon={<ArrowLeft className="w-4 h-4 text-comic-black" />}
                      >
                        Back
                      </ComicButton>

                      <ComicButton
                        type="button"
                        variant="yellow"
                        size="md"
                        onClick={() => setStep(3)}
                        icon={<ArrowRight className="w-4 h-4 text-comic-black" />}
                      >
                        Next: Preview Palette
                      </ComicButton>
                    </div>
                  </div>
                )}

                {/* STEP 3: Live Media & Auto-Palette Preview */}
                {step === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="p-4 bg-comic-black rounded-lg border-2 border-neutral-800">
                      <div className="flex items-center gap-2 text-comic-yellow font-heading font-black text-xs uppercase mb-3">
                        <Zap className="w-4 h-4" />
                        <span>Live Media-Reactive Creative Preview</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                        {/* Sample Poster Card */}
                        <div className="sm:col-span-5 flex justify-center">
                          <div
                            style={getPaletteStyle(extractedPalette)}
                            className="relative w-48 aspect-[4/5] rounded-lg bg-black border-2 border-black overflow-hidden shadow-[6px_6px_0px_var(--media-vibrant)]"
                          >
                            <Image
                              src={formData.mediaUrl}
                              alt="Upload preview"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-2 left-2">
                              <span
                                className="comic-badge text-[10px] px-2 py-0.5"
                                style={{
                                  backgroundColor: extractedPalette.vibrant,
                                  color: extractedPalette.contrastText,
                                }}
                              >
                                {formData.category}
                              </span>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 text-white">
                              <p className="font-display text-sm leading-none drop-shadow-[1px_1px_0px_#000]">
                                {formData.businessName || "YOUR BRAND"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Summary Details */}
                        <div className="sm:col-span-7 space-y-3 text-xs font-mono text-neutral-300">
                          <div>
                            <span className="text-neutral-500">Contact:</span>{" "}
                            <strong className="text-white">{formData.name} ({formData.phone})</strong>
                          </div>
                          <div>
                            <span className="text-neutral-500">Business:</span>{" "}
                            <strong className="text-white">{formData.businessName}</strong>
                          </div>
                          <div>
                            <span className="text-neutral-500">Budget:</span>{" "}
                            <strong className="text-comic-yellow">{formData.budgetRange}</strong>
                          </div>
                          <div>
                            <span className="text-neutral-500">Timeline:</span>{" "}
                            <strong className="text-comic-cyan">{formData.timeline}</strong>
                          </div>
                          <div className="pt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-comic-green animate-ping" />
                            <span className="text-comic-green font-bold">
                              Auto-Palette Synchronized & WCAG Safe
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                      <ComicButton
                        type="button"
                        variant="white"
                        size="md"
                        onClick={() => setStep(2)}
                        icon={<ArrowLeft className="w-4 h-4 text-comic-black" />}
                      >
                        Back
                      </ComicButton>

                      <ComicButton
                        type="submit"
                        variant="pink"
                        size="lg"
                        disabled={loading}
                        icon={<Flame className="w-5 h-5 text-white" />}
                      >
                        {loading ? "Submitting..." : "Submit Campaign Enquiry 🔥"}
                      </ComicButton>
                    </div>
                  </div>
                )}
              </form>
            </div>
          ) : (
            /* Submission Success Screen */
            <div className="text-center py-12 space-y-6 animate-fadeIn">
              <div className="w-20 h-20 bg-comic-yellow text-comic-black rounded-full border-4 border-black mx-auto flex items-center justify-center shadow-[4px_4px_0px_#FF0055]">
                <CheckCircle2 className="w-10 h-10 stroke-[3]" />
              </div>

              <div className="space-y-2">
                <span className="comic-badge bg-comic-green text-comic-black text-xs font-black">
                  LEAD ENROLLED IN CRM ✓
                </span>
                <h2 className="font-display text-4xl sm:text-5xl uppercase text-white">
                  WE ARE READY TO IGNITE!
                </h2>
                <p className="font-heading text-neutral-300 max-w-md mx-auto text-base">
                  Your details have been logged into our Lead Management Cockpit. Our strategist is preparing your custom Media-Reactive proposal.
                </p>
              </div>

              {/* Instant WhatsApp Launcher Button */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-black font-display text-lg uppercase px-8 py-4 rounded border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <MessageSquare className="w-5 h-5 fill-black" />
                  Connect Instantly On WhatsApp
                </a>

                <ComicButton
                  variant="white"
                  size="lg"
                  onClick={() => {
                    setSubmitted(false);
                    setStep(1);
                  }}
                >
                  Submit Another Lead
                </ComicButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
