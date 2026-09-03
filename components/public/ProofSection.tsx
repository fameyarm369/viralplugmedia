import React from "react";
import { CheckCircle2, XCircle, Zap, TrendingUp, Sparkles, Target } from "lucide-react";
import { ComicButton } from "../comic/ComicButton";
import Link from "next/link";

export const ProofSection = () => {
  return (
    <section className="py-24 bg-[#12131A] text-white border-b-4 border-comic-black relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="comic-badge bg-comic-cyan text-comic-black text-xs font-black">
            PERFORMANCE COMPARISON
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-none">
            WHY VIRAL PLUG MEDIA <br />
            <span className="text-comic-yellow" style={{ textShadow: "3px 3px 0px #000" }}>
              CRUSHES GENERIC AGENCIES
            </span>
          </h2>
          <p className="font-heading font-medium text-neutral-300 text-base sm:text-lg">
            Stop wasting ad spend on lifeless templates and cartoon gimmicks. Here is why the Media-Reactive Comic framework consistently outconverts.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Traditional Agency Look (Rejected) */}
          <div className="comic-card p-8 bg-neutral-900 border-2 border-red-900/50 relative">
            <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-500 text-red-400 text-xs font-mono font-bold px-3 py-1 rounded mb-6">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Generic Agencies & Flat Cartoon Sites</span>
            </div>

            <h3 className="font-display text-3xl uppercase text-neutral-300 mb-6">
              The Old, Tired Playbook
            </h3>

            <ul className="space-y-4 text-sm text-neutral-400 font-body">
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Flat cartoon characters & mascot illustrations</strong> that distract from and compete with your real products.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Generic color palettes</strong> disconnected from your actual product packaging and photoshoot assets.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Slow proposal turnaround</strong> (days of emailing PDFs back and forth instead of automated WhatsApp pipelines).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Low click-through rates (CTR &lt; 1.2%)</strong> due to banner blindness on social media feeds.
                </span>
              </li>
            </ul>
          </div>

          {/* Viral Plug Media (Approved Standard) */}
          <div className="comic-card p-8 bg-comic-black border-[3.5px] border-comic-yellow shadow-[8px_8px_0px_#FFE600] relative">
            <div className="inline-flex items-center gap-2 bg-comic-yellow text-comic-black text-xs font-heading font-black px-3 py-1 rounded mb-6 shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-4 h-4 text-comic-black" />
              <span>The Viral Plug Media Standard</span>
            </div>

            <h3 className="font-display text-3xl uppercase text-white mb-6">
              Media-Reactive Comic Engine
            </h3>

            <ul className="space-y-4 text-sm text-neutral-200 font-body">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-comic-yellow shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Real photo & video is the undisputed hero</strong> framed by bold, angled kinetic comic borders and speed-lines.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-comic-cyan shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Automated per-upload color extraction</strong> ensuring perfect tonal harmony and WCAG AA readability.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-comic-pink shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Direct Meta Cloud WhatsApp Lead Funnel</strong> for instantaneous lead qualification and booking.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-comic-yellow shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Industry-leading performance:</strong> 3.8% - 5.4% average CTR and 6.2x blended ROAS across verticals.
                </span>
              </li>
            </ul>

            <div className="pt-6 mt-6 border-t border-neutral-800">
              <Link href="/enquiry">
                <ComicButton variant="yellow" size="sm" fullWidth>
                  Get Started With Viral Plug →
                </ComicButton>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
