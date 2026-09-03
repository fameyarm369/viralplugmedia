"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SAMPLE_MEDIA_ASSETS } from "@/lib/db";
import { Campaign } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import {
  Flame,
  TrendingUp,
  Eye,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
} from "lucide-react";

export default function AdminCampaignsPage() {
  const initialCampaigns: Campaign[] = [
    {
      id: "camp-01",
      title: "Vedika Forest Raw Honey Scaling Blitz",
      clientName: "Vedika Organics",
      category: "food-honey",
      status: "ACTIVE",
      startDate: "2026-08-15",
      endDate: "2026-09-30",
      budgetINR: 150000,
      metrics: {
        views: 1420000,
        clicks: 48500,
        leads: 8400,
        roas: 6.2,
      },
      heroMedia: SAMPLE_MEDIA_ASSETS[0],
    },
    {
      id: "camp-02",
      title: "Veebro HyperSpeed Pro Cleat Nationwide Drop",
      clientName: "Veebro Athletics",
      category: "sports-football",
      status: "ACTIVE",
      startDate: "2026-08-20",
      endDate: "2026-09-10",
      budgetINR: 200000,
      metrics: {
        views: 2850000,
        clicks: 94000,
        leads: 12200,
        roas: 7.8,
      },
      heroMedia: SAMPLE_MEDIA_ASSETS[1],
    },
    {
      id: "camp-03",
      title: "Altura Skyline Luxury Penthouses HNI Target",
      clientName: "Altura Living",
      category: "property",
      status: "ACTIVE",
      startDate: "2026-08-01",
      endDate: "2026-10-31",
      budgetINR: 350000,
      metrics: {
        views: 890000,
        clicks: 22400,
        leads: 420,
        roas: 14.5,
      },
      heroMedia: SAMPLE_MEDIA_ASSETS[2],
    },
  ];

  const [campaigns] = useState<Campaign[]>(initialCampaigns);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-comic-pink" />
            <span>CAMPAIGN PERFORMANCE TRACKER</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Tracking Active Media-Reactive Campaigns • Live ROAS Reconciliation
          </p>
        </div>

        <button
          onClick={() => alert("Campaign Builder initialized. Template ready.")}
          className="text-xs font-heading font-black bg-comic-pink text-white px-4 py-2 rounded border-2 border-black shadow-[3px_3px_0px_#000]"
        >
          + Create New Campaign
        </button>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 space-y-6"
            style={{
              boxShadow: `6px 6px 0px ${camp.heroMedia.palette.vibrant}`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <span
                  className="comic-badge text-xs font-black uppercase"
                  style={{
                    backgroundColor: camp.heroMedia.palette.vibrant,
                    color: camp.heroMedia.palette.contrastText,
                  }}
                >
                  {camp.category}
                </span>
                <h2 className="font-display text-xl uppercase text-white">
                  {camp.title}
                </h2>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-neutral-400">
                  Client: <strong className="text-white">{camp.clientName}</strong>
                </span>
                <span className="bg-comic-green/20 text-comic-green px-2.5 py-1 rounded font-bold">
                  ● {camp.status}
                </span>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 text-center">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                  Verified Views
                </span>
                <p className="font-display text-2xl text-comic-cyan">
                  {(camp.metrics.views / 1000000).toFixed(1)}M+
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 text-center">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                  Total Conversions
                </span>
                <p className="font-display text-2xl text-comic-yellow">
                  {camp.metrics.leads.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 text-center">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                  Blended ROAS
                </span>
                <p className="font-display text-2xl text-comic-pink">
                  {camp.metrics.roas}x
                </p>
              </div>

              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 text-center">
                <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                  Total Ad Budget
                </span>
                <p className="font-display text-2xl text-white">
                  {formatINR(camp.budgetINR)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
