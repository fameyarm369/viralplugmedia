"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface KPIData {
  totalLeads: number;
  newLeadsCount: number;
  activeCampaigns: number;
  totalCampaigns: number;
  totalRevenueINR: number;
  totalUsers: number;
  recentLeads: Array<{
    id: string;
    name: string;
    business_name: string;
    category: string;
    lead_score: number;
    status: string;
    created_at: string;
  }>;
  recentCampaigns: Array<{
    id: string;
    title: string;
    client_name: string;
    status: string;
    budget_inr: number;
  }>;
}

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/stats");
      const data = await res.json();
      if (data.success) {
        setKpis(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-comic-yellow text-comic-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000] mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>LIVE DATABASE TELEMETRY • POSTGRESQL 17</span>
          </div>
          <h1 className="font-display text-4xl uppercase tracking-wider text-white">
            EXECUTIVE GROWTH COCKPIT
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Real-Time KPI Aggregates • Zero Hardcoded Dummies • Role-Gated Admin View
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-3 py-2 rounded text-neutral-300 hover:text-white flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Stats</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Captured Revenue */}
        <div className="comic-card p-6 bg-[#111218] border-2 border-comic-green shadow-[4px_4px_0px_#00E575] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
              Captured Revenue
            </span>
            <DollarSign className="w-4 h-4 text-comic-green" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-white">
            ₹{Number(kpis?.totalRevenueINR || 0).toLocaleString("en-IN")}
          </p>
          <span className="text-[10px] font-mono text-comic-green font-bold block">
            Verified Payments Ledger
          </span>
        </div>

        {/* Active Campaigns */}
        <div className="comic-card p-6 bg-[#111218] border-2 border-comic-yellow shadow-[4px_4px_0px_#FFE600] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
              Active Campaigns
            </span>
            <Flame className="w-4 h-4 text-comic-yellow" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-comic-yellow">
            {kpis?.activeCampaigns || 0}
          </p>
          <span className="text-[10px] font-mono text-neutral-400 block">
            Out of {kpis?.totalCampaigns || 0} total in DB
          </span>
        </div>

        {/* Total Verified Leads */}
        <div className="comic-card p-6 bg-[#111218] border-2 border-comic-cyan shadow-[4px_4px_0px_#00F0FF] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
              Total Inbound Leads
            </span>
            <Users className="w-4 h-4 text-comic-cyan" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-comic-cyan">
            {kpis?.totalLeads || 0}
          </p>
          <span className="text-[10px] font-mono text-comic-cyan font-bold block">
            {kpis?.newLeadsCount || 0} Awaiting Action
          </span>
        </div>

        {/* Registered Users */}
        <div className="comic-card p-6 bg-[#111218] border-2 border-comic-pink shadow-[4px_4px_0px_#FF0055] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
              Registered Users
            </span>
            <Sparkles className="w-4 h-4 text-comic-pink" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-white">
            {kpis?.totalUsers || 0}
          </p>
          <span className="text-[10px] font-mono text-neutral-400 block">
            RBAC Protected Accounts
          </span>
        </div>
      </div>

      {/* Two Column Section: Live Inbound Leads Stream + Active Campaigns Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Recent Inbound Leads (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-comic-cyan" />
              <span>Real Inbound Leads</span>
            </h2>
            <Link href="/admin/leads">
              <span className="text-xs font-mono text-comic-cyan hover:underline flex items-center gap-1">
                <span>View Full CRM Table</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="comic-card p-8 text-center text-neutral-500 font-mono text-xs">
              Loading live leads stream...
            </div>
          ) : !kpis?.recentLeads || kpis.recentLeads.length === 0 ? (
            <div className="comic-card p-8 text-center bg-[#111218] border-2 border-dashed border-neutral-700 text-neutral-400 font-mono text-xs space-y-2">
              <p className="font-bold text-white">No Inbound Leads in Database</p>
              <p className="text-neutral-500">
                Incoming inquiries from the public /enquiry funnel will stream here in real time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {kpis.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-xl bg-[#111218] border border-neutral-800 hover:border-comic-cyan transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="comic-badge text-[9px] bg-comic-yellow text-comic-black px-1.5 py-0.5 uppercase font-bold">
                        {lead.category}
                      </span>
                      <span className="text-xs font-heading font-bold text-white">
                        {lead.business_name}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-400">
                      Contact: {lead.name} • Score: {lead.lead_score}/100
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        lead.status === "NEW"
                          ? "bg-comic-cyan/20 text-comic-cyan"
                          : lead.status === "WON"
                          ? "bg-comic-green/20 text-comic-green"
                          : "bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      {lead.status}
                    </span>
                    <p className="text-[10px] font-mono text-neutral-500">
                      {new Date(lead.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Campaigns Pipeline (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase tracking-wider text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-comic-pink" />
              <span>Active Campaigns</span>
            </h2>
            <Link href="/admin/campaigns">
              <span className="text-xs font-mono text-comic-pink hover:underline flex items-center gap-1">
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="comic-card p-8 text-center text-neutral-500 font-mono text-xs">
              Loading campaigns from database...
            </div>
          ) : !kpis?.recentCampaigns || kpis.recentCampaigns.length === 0 ? (
            <div className="comic-card p-8 text-center bg-[#111218] border-2 border-dashed border-neutral-700 text-neutral-400 font-mono text-xs space-y-2">
              <p className="font-bold text-white">No Campaigns in Database</p>
              <p className="text-neutral-500">
                Campaigns created upon advance payment checkout or manually by admins will display here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {kpis.recentCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="p-4 rounded-xl bg-[#111218] border border-neutral-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-heading font-bold text-white truncate max-w-[200px]">
                      {camp.title}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-400">
                      Client: {camp.client_name}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-display text-sm text-white">
                      ₹{Number(camp.budget_inr || 0).toLocaleString("en-IN")}
                    </p>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        camp.status === "ACTIVE"
                          ? "bg-comic-green/20 text-comic-green"
                          : "bg-comic-yellow/20 text-comic-yellow"
                      }`}
                    >
                      {camp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
