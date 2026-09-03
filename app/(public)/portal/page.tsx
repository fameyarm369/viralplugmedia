"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Flame,
  FileText,
  TrendingUp,
  Eye,
  CheckCircle2,
  Clock,
  LogOut,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function ClientPortalPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/portal/data")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          router.push("/login?redirect=/portal");
        }
      })
      .catch(() => router.push("/login?redirect=/portal"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-comic-black text-white flex items-center justify-center font-mono text-xs">
        Connecting to your private growth ledger...
      </div>
    );
  }

  const { user, campaigns = [], invoices = [], summary = {} } = data || {};

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-halftone-dots opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <span className="comic-badge bg-comic-cyan text-comic-black text-xs font-black mb-2">
              CLIENT GROWTH COCKPIT
            </span>
            <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight leading-none mt-1">
              WELCOME BACK, <span className="text-comic-yellow">{user?.name}</span>
            </h1>
            <p className="text-xs font-mono text-neutral-400 mt-1">
              Account: {user?.email} • Verified Campaign Client
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/919876543210?text=Hello%20Viral%20Plug!%20I%20am%20reviewing%20my%20campaign%20portal."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] text-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>Dedicated Strategist</span>
            </a>

            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-neutral-900 border border-neutral-700 hover:border-red-500 text-neutral-400 hover:text-red-400 rounded text-xs font-mono flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* AI Performance Narrative Banner */}
        <div className="p-5 bg-[#12131A] border-2 border-comic-cyan rounded-xl shadow-[4px_4px_0px_#00F0FF] flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-comic-cyan shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <span className="text-xs font-mono text-comic-cyan uppercase font-bold">
              Campaign Progress Brief:
            </span>
            <p className="text-sm font-heading text-neutral-200 leading-relaxed">
              {summary.narrative}
            </p>
          </div>
        </div>

        {/* Aggregate KPI Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="comic-card p-5 bg-[#111218] border-2 border-comic-yellow shadow-[4px_4px_0px_#FFE600] space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
              Active Campaigns
            </span>
            <p className="font-display text-3xl text-comic-yellow">
              {summary.activeCampaignsCount || campaigns.length}
            </p>
            <span className="text-[10px] font-mono text-neutral-500">Total Enrolled</span>
          </div>

          <div className="comic-card p-5 bg-[#111218] border-2 border-comic-cyan shadow-[4px_4px_0px_#00F0FF] space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
              Verified Views
            </span>
            <p className="font-display text-3xl text-comic-cyan">
              {summary.totalViews > 0 ? `${(summary.totalViews / 1000).toFixed(1)}k+` : "Awaiting Run"}
            </p>
            <span className="text-[10px] font-mono text-neutral-500">Impressions</span>
          </div>

          <div className="comic-card p-5 bg-[#111218] border-2 border-comic-pink shadow-[4px_4px_0px_#FF0055] space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
              Customer Conversions
            </span>
            <p className="font-display text-3xl text-comic-pink">
              {summary.totalLeads > 0 ? summary.totalLeads.toLocaleString("en-IN") : "Pending Data"}
            </p>
            <span className="text-[10px] font-mono text-neutral-500">Direct Actions</span>
          </div>

          <div className="comic-card p-5 bg-[#111218] border-2 border-comic-green shadow-[4px_4px_0px_#00E575] space-y-1">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
              Total Contract Budget
            </span>
            <p className="font-display text-3xl text-white">
              ₹{Number(summary.totalSpend || 0).toLocaleString("en-IN")}
            </p>
            <span className="text-[10px] font-mono text-comic-green font-bold">Secured</span>
          </div>
        </div>

        {/* Two Columns: Campaigns Stream + Invoices & Billing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Campaigns Stream (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wider text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-comic-pink" />
              <span>Your Campaigns</span>
            </h2>

            {campaigns.length === 0 ? (
              <div className="comic-card p-8 text-center bg-[#111218] border-2 border-dashed border-neutral-700 space-y-3">
                <Clock className="w-10 h-10 text-neutral-500 mx-auto" />
                <p className="font-display text-lg uppercase text-white">
                  No Active Campaigns Yet
                </p>
                <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
                  Your enquiry has been received. Our strategy team is building your campaign blueprint.
                </p>
                <Link href="/enquiry">
                  <button className="text-xs font-heading font-black bg-comic-yellow text-comic-black px-4 py-2 rounded border border-black shadow-[2px_2px_0px_#000]">
                    Launch New Campaign →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((camp: any) => (
                  <div
                    key={camp.id}
                    className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 space-y-4 shadow-[4px_4px_0px_#000]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
                      <div>
                        <span className="comic-badge text-[10px] bg-comic-yellow text-comic-black px-2 py-0.5 uppercase font-bold">
                          {camp.category}
                        </span>
                        <h3 className="font-display text-xl uppercase text-white mt-1">
                          {camp.title}
                        </h3>
                      </div>

                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded w-fit ${
                          camp.status === "ACTIVE"
                            ? "bg-comic-green/20 text-comic-green"
                            : camp.status === "PROPOSAL_REVIEW"
                            ? "bg-comic-yellow/20 text-comic-yellow"
                            : "bg-neutral-800 text-neutral-400"
                        }`}
                      >
                        ● {camp.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
                      <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800">
                        <span className="text-neutral-500 text-[10px] uppercase">Views</span>
                        <p className="font-bold text-comic-cyan text-sm">
                          {Number(camp.metrics?.views || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800">
                        <span className="text-neutral-500 text-[10px] uppercase">Clicks</span>
                        <p className="font-bold text-white text-sm">
                          {Number(camp.metrics?.clicks || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800">
                        <span className="text-neutral-500 text-[10px] uppercase">Conversions</span>
                        <p className="font-bold text-comic-pink text-sm">
                          {Number(camp.metrics?.leads || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800">
                        <span className="text-neutral-500 text-[10px] uppercase">ROAS</span>
                        <p className="font-bold text-comic-yellow text-sm">
                          {camp.metrics?.roas ? `${camp.metrics.roas}x` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices & Receipts (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wider text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-comic-yellow" />
              <span>Invoices & Receipts</span>
            </h2>

            {invoices.length === 0 ? (
              <div className="comic-card p-6 text-center bg-[#111218] border-2 border-neutral-800 text-xs font-mono text-neutral-500">
                No invoices issued yet.
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl bg-[#111218] border border-neutral-800 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-heading font-bold text-white">
                        {inv.campaign_title || "Campaign Package Invoice"}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-400">
                        Invoice ID: {inv.id}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="font-display text-base text-white">
                        ₹{Number(inv.total_inr).toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          inv.status === "PAID"
                            ? "bg-comic-green/20 text-comic-green"
                            : "bg-comic-yellow/20 text-comic-yellow"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
