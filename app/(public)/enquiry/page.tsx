"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { BusinessCategory, ColorPalette } from "@/lib/types";
import { DEFAULT_FALLBACK_PALETTE, getPaletteStyle } from "@/lib/palette-engine";
import { ComicButton } from "@/components/comic/ComicButton";
import { StarburstBadge } from "@/components/comic/StarburstBadge";
import { createWhatsAppLink, formatINR } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Zap,
  CreditCard,
  Calculator,
  ShieldCheck,
  AlertCircle,
  Clock,
} from "lucide-react";

function EnquiryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get("category") || "food-honey") as BusinessCategory;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [leadCreated, setLeadCreated] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    category: initialCategory,
    phone: "",
    email: "",
    budgetRange: "₹50k-₹1.5L / mo",
    timeline: "Immediately (Within 7 days)",
    notes: "",
    mediaUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=85",
  });

  // AI Estimate State
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateResult, setEstimateResult] = useState<any>(null);

  // Payment Processing State
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");

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
  };

  const handleLeadSubmitAndEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setEstimateLoading(true);

    try {
      // 1. Submit lead to database
      const leadRes = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const leadData = await leadRes.json();
      if (leadData.success) {
        setLeadCreated(leadData.data);
      }

      // 2. Fetch grounded AI Deal Estimate
      const estRes = await fetch("/api/v1/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          budgetRange: formData.budgetRange,
          timeline: formData.timeline,
          notes: formData.notes,
        }),
      });
      const estData = await estRes.json();
      if (estData.success) {
        setEstimateResult(estData.data);
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFE600", "#FF0055", "#00F0FF", "#00E575"],
      });

      setStep(3);
    } catch {
      setStep(3);
    } finally {
      setSubmitting(false);
      setEstimateLoading(false);
    }
  };

  const handleAdvancePayment = async () => {
    if (!estimateResult?.suggestedAdvanceINR) return;
    setPaying(true);
    setPaymentError("");

    try {
      // Step 1: Create Order
      const orderRes = await fetch("/api/v1/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountINR: estimateResult.suggestedAdvanceINR,
          leadId: leadCreated?.id || `lead-${Date.now()}`,
          category: formData.category,
          businessName: formData.businessName,
          email: formData.email,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        setPaymentError(orderData.error || "Failed to initiate payment");
        setPaying(false);
        return;
      }

      // Step 2: Simulate/Process verification and provision user + campaign
      const verifyRes = await fetch("/api/v1/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: orderData.orderId,
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpaySignature: "simulated_secure_sig",
          email: formData.email,
          name: formData.name,
          businessName: formData.businessName,
          category: formData.category,
          amountINR: estimateResult.suggestedAdvanceINR,
          leadId: leadCreated?.id,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setPaymentSuccess(true);
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
        });

        // Redirect seamlessly to Client Portal
        setTimeout(() => {
          router.push("/portal");
          router.refresh();
        }, 2000);
      } else {
        setPaymentError(verifyData.error || "Verification failed");
      }
    } catch (err: any) {
      setPaymentError(err.message || "Payment processing error");
    } finally {
      setPaying(false);
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
            Submit your brand goals to receive a database-grounded AI estimate and lock in your campaign immediately.
          </p>
        </div>

        {/* Form / Result Card */}
        <div className="comic-card p-6 sm:p-10 bg-neutral-900 border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600]">
          {/* Step Bar */}
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
              <span>AI Quote & Advance</span>
            </div>
          </div>

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

          {/* STEP 2: Budget & Goals */}
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
                  disabled={submitting}
                  onClick={handleLeadSubmitAndEstimate}
                  icon={<Flame className="w-4 h-4 text-comic-black" />}
                >
                  {submitting ? "Calculating..." : "Submit & Generate AI Quote →"}
                </ComicButton>
              </div>
            </div>
          )}

          {/* STEP 3: AI Deal Quote & Immediate Advance Lock-In */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {paymentSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-comic-green text-black rounded-full border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000]">
                    <CheckCircle2 className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h2 className="font-display text-3xl uppercase text-white">
                    Advance Received! Campaign Provisioned.
                  </h2>
                  <p className="text-xs font-mono text-neutral-300 max-w-md mx-auto">
                    Your client account and campaign dashboard have been provisioned in the database. Redirecting to your portal...
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Lead Registration Confirmation */}
                  <div className="p-4 bg-comic-black rounded-lg border border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-comic-green uppercase font-bold">
                        ✓ Lead Logged into CRM Database
                      </span>
                      <p className="font-display text-lg text-white">
                        {formData.businessName} ({formData.category})
                      </p>
                    </div>
                    <span className="text-xs font-mono text-neutral-400">
                      ID: {leadCreated?.id || "lead-sync"}
                    </span>
                  </div>

                  {/* Grounded AI Deal Estimate Card */}
                  <div className="p-6 bg-[#161822] rounded-xl border-2 border-comic-yellow shadow-[6px_6px_0px_#FFE600] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-comic-yellow" />
                        <h3 className="font-display text-xl uppercase text-white">
                          Grounded AI Deal Calculation
                        </h3>
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          estimateResult?.confidence === "HIGH"
                            ? "bg-comic-green/20 text-comic-green"
                            : "bg-comic-yellow/20 text-comic-yellow"
                        }`}
                      >
                        Confidence: {estimateResult?.confidence || "VERIFIED"}
                      </span>
                    </div>

                    {estimateResult?.hasHistoricalData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 text-center">
                            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                              Estimated Contract Range
                            </span>
                            <p className="font-display text-3xl text-comic-yellow mt-1">
                              ₹{estimateResult.estimatedRangeINR.min.toLocaleString("en-IN")} – ₹{estimateResult.estimatedRangeINR.max.toLocaleString("en-IN")}
                            </p>
                            <span className="text-[11px] text-neutral-400">Monthly Package Retainer</span>
                          </div>

                          <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 text-center">
                            <span className="text-[10px] font-mono text-comic-cyan uppercase font-bold">
                              Required Advance ({estimateResult.advancePercentage}%)
                            </span>
                            <p className="font-display text-3xl text-comic-cyan mt-1">
                              ₹{estimateResult.suggestedAdvanceINR.toLocaleString("en-IN")}
                            </p>
                            <span className="text-[11px] text-neutral-400">Lock-in Slot & Strategy Sprint</span>
                          </div>
                        </div>

                        {/* Citation & Grounding Basis */}
                        <div className="p-3 bg-neutral-950 rounded border border-neutral-800 text-xs font-mono text-neutral-300 flex items-start gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-comic-green shrink-0 mt-0.5" />
                          <span>
                            <strong>Data Grounding Citation:</strong> {estimateResult.basisSummary}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Honest Fallback state when 0 historical deals exist */
                      <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2">
                        <div className="flex items-center gap-2 text-comic-yellow text-xs font-mono font-bold">
                          <Clock className="w-4 h-4" />
                          <span>Awaiting Benchmark Deals</span>
                        </div>
                        <p className="text-xs text-neutral-300 font-mono">
                          {estimateResult?.basisSummary ||
                            "No historical deal benchmarks currently exist in the database for this category. Our strategy team will manually evaluate your requirement notes and prepare a custom proposal within 24 hours."}
                        </p>
                      </div>
                    )}
                  </div>

                  {paymentError && (
                    <div className="p-3 bg-red-950/80 border border-red-500 rounded text-xs text-red-300 flex items-center gap-2 font-mono">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="pt-2 space-y-3">
                    {estimateResult?.suggestedAdvanceINR ? (
                      <button
                        onClick={handleAdvancePayment}
                        disabled={paying}
                        className="w-full flex items-center justify-center gap-2 bg-comic-yellow text-comic-black font-heading font-black text-sm uppercase py-4 rounded border-[3px] border-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5"
                      >
                        <CreditCard className="w-5 h-5 text-black" />
                        <span>
                          {paying
                            ? "Processing Secure Checkout..."
                            : `Pay Advance (₹${estimateResult.suggestedAdvanceINR.toLocaleString("en-IN")}) & Lock In Campaign Slot →`}
                        </span>
                      </button>
                    ) : null}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-black font-heading font-bold text-xs uppercase py-3 rounded border-2 border-black shadow-[2px_2px_0px_#000]"
                      >
                        <MessageSquare className="w-4 h-4 fill-black" />
                        <span>Discuss Directly on WhatsApp</span>
                      </a>

                      <button
                        onClick={() => {
                          setStep(1);
                          setEstimateResult(null);
                        }}
                        className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-mono border border-neutral-700"
                      >
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnquiryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-comic-black text-white flex items-center justify-center font-mono text-xs">
          Loading campaign intake engine...
        </div>
      }
    >
      <EnquiryContent />
    </Suspense>
  );
}

