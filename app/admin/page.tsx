"use client";

import React from "react";
import Link from "next/link";
import { INITIAL_LEADS, SAMPLE_MEDIA_ASSETS } from "@/lib/db";
import { getScoreBadgeColor, createWhatsAppLink } from "@/lib/utils";
import {
  Users,
  Flame,
  TrendingUp,
  DollarSign,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Eye,
} from "lucide-react";

export default function AdminDashboardPage() {
  const kpis = [
    {
      title: "Total Inbound Leads",
      value: "148",
      delta: "+24% this week",
      icon: Users,
      color: "text-comic-yellow",
      borderColor: "border-comic-yellow",
    },
    {
      title: "Active Campaigns",
      value: "18",
      delta: "6 high priority",
      icon: Flame,
      color: "text-comic-pink",
      borderColor: "border-comic-pink",
    },
    {
      title: "MTD Gross Pipeline",
      value: "₹64.2L",
      delta: "14.2x overall ROI",
      icon: DollarSign,
      color: "text-comic-green",
      borderColor: "border-comic-green",
    },
    {
      title: "Blended Conversion Rate",
      value: "32.4%",
      delta: "Lead to Proposal",
      icon: TrendingUp,
      color: "text-comic-cyan",
      borderColor: "border-comic-cyan",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white">
            EXECUTIVE CONTROL CENTER
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Real-time telemetry • Media-Reactive Engine v2.4 • PostgreSQL 17 Connected
          </p>
        </div>

        <Link href="/admin/leads">
          <button className="text-xs font-heading font-black bg-comic-yellow text-comic-black px-4 py-2 rounded border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5">
            Manage All Inbound Leads →
          </button>
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;

          return (
            <div
              key={idx}
              className={`p-5 rounded-xl bg-[#12131A] border-2 ${kpi.borderColor} shadow-[4px_4px_0px_#000] flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400 font-bold uppercase">
                  {kpi.title}
                </span>
                <Icon className={`w-5 h-5 ${kpi.color}`} />
              </div>

              <div className="pt-4">
                <p className="font-display text-3xl text-white">{kpi.value}</p>
                <p className="text-[11px] font-mono text-neutral-400 mt-0.5">{kpi.delta}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Inbound Leads + Media Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Hot Leads (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-comic-yellow" />
              <span>Priority Inbound Leads</span>
            </h2>
            <Link href="/admin/leads" className="text-xs font-mono text-comic-yellow hover:underline">
              View All (148)
            </Link>
          </div>

          <div className="space-y-3">
            {INITIAL_LEADS.map((lead) => {
              const badge = getScoreBadgeColor(lead.leadScore);
              const waLink = createWhatsAppLink(
                lead.phone,
                `Hello ${lead.name}! I am reviewing your enquiry for ${lead.businessName} at Viral Plug Media.`
              );

              return (
                <div
                  key={lead.id}
                  className="p-4 rounded-lg bg-[#12131A] border-2 border-neutral-800 hover:border-neutral-600 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-white">
                        {lead.name}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                        {lead.leadScore} PTS {badge.label}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-neutral-300">
                      <strong>{lead.businessName}</strong> • {lead.category}
                    </p>

                    <p className="text-[11px] text-neutral-400 font-mono">
                      Budget: <span className="text-comic-yellow">{lead.budgetRange}</span> • {lead.timeline}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-[#25D366] text-black rounded border border-black shadow-[2px_2px_0px_#000] text-xs font-bold hover:scale-105"
                      title="Open WhatsApp Chat"
                    >
                      <MessageSquare className="w-4 h-4 fill-black" />
                    </a>

                    <Link href={`/admin/leads?id=${lead.id}`}>
                      <button className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-heading font-bold border border-neutral-700">
                        Details
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Media Palette Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-comic-cyan" />
              <span>Extracted Media Assets</span>
            </h2>
            <Link href="/admin/media-library" className="text-xs font-mono text-comic-cyan hover:underline">
              Library ({SAMPLE_MEDIA_ASSETS.length})
            </Link>
          </div>

          <div className="space-y-3">
            {SAMPLE_MEDIA_ASSETS.slice(0, 3).map((asset) => (
              <div
                key={asset.id}
                className="p-3.5 rounded-lg bg-[#12131A] border-2 border-neutral-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-heading font-bold text-white">
                      {asset.title}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      Client: {asset.clientName}
                    </p>
                  </div>

                  <span className="text-[10px] font-mono bg-comic-green/20 text-comic-green px-2 py-0.5 rounded font-bold">
                    WCAG AA ✓
                  </span>
                </div>

                {/* Swatch Chips */}
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <div
                    className="w-5 h-5 rounded border border-black"
                    style={{ backgroundColor: asset.palette.vibrant }}
                    title={`Vibrant: ${asset.palette.vibrant}`}
                  />
                  <div
                    className="w-5 h-5 rounded border border-black"
                    style={{ backgroundColor: asset.palette.darkVibrant }}
                    title={`Dark: ${asset.palette.darkVibrant}`}
                  />
                  <div
                    className="w-5 h-5 rounded border border-black"
                    style={{ backgroundColor: asset.palette.lightVibrant }}
                    title={`Light: ${asset.palette.lightVibrant}`}
                  />
                  <div
                    className="w-5 h-5 rounded border border-black"
                    style={{ backgroundColor: asset.palette.muted }}
                    title={`Muted: ${asset.palette.muted}`}
                  />
                  <span className="text-neutral-400 ml-auto">
                    {asset.metrics?.roas || "6.2x ROAS"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
