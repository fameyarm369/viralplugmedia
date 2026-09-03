"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  ArrowLeft,
  Flame,
  FileText,
  TrendingUp,
  Sparkles,
  Edit2,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye,
  Sliders,
} from "lucide-react";

export default function AdminClientDossierPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Status edit modal state
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [newViews, setNewViews] = useState("0");
  const [newClicks, setNewClicks] = useState("0");
  const [newLeads, setNewLeads] = useState("0");
  const [newROAS, setNewROAS] = useState("5.0");

  const fetchDossier = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/clients/${clientId}`);
      const data = await res.json();
      if (data.success) {
        setDossier(data);
      } else {
        setMessage({ type: "error", text: data.error || "Client not found" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load client dossier" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) fetchDossier();
  }, [clientId]);

  const handleOpenEditCampaign = (camp: any) => {
    setEditingCampaign(camp);
    setNewStatus(camp.status);
    setNewViews(camp.metrics?.views || "0");
    setNewClicks(camp.metrics?.clicks || "0");
    setNewLeads(camp.metrics?.leads || "0");
    setNewROAS(camp.metrics?.roas || "5.0");
  };

  const handleSaveCampaignChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    try {
      const res = await fetch(`/api/v1/admin/campaigns/${editingCampaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          metrics: {
            views: parseInt(newViews, 10),
            clicks: parseInt(newClicks, 10),
            leads: parseInt(newLeads, 10),
            roas: parseFloat(newROAS),
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Campaign metrics & status updated!" });
        setEditingCampaign(null);
        await fetchDossier();
      } else {
        setMessage({ type: "error", text: data.error || "Update failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Update error" });
    }
  };

  if (loading) {
    return (
      <div className="comic-card p-12 text-center text-neutral-500 font-mono text-xs">
        Loading client mirror & database records...
      </div>
    );
  }

  const { client, campaigns = [], invoices = [] } = dossier || {};

  return (
    <div className="space-y-6">
      {/* Top Banner: Admin Mirror Notice */}
      <div className="p-4 bg-comic-black border-2 border-comic-yellow rounded-xl shadow-[4px_4px_0px_#FFE600] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-comic-yellow shrink-0" />
          <div>
            <span className="text-[10px] font-mono text-comic-yellow uppercase font-bold">
              ADMIN MIRROR ACTIVE
            </span>
            <h2 className="font-heading font-black text-sm text-white">
              Viewing exact portal layout of: <span className="text-comic-yellow">{client?.name}</span> ({client?.email})
            </h2>
          </div>
        </div>

        <Link href="/admin/clients">
          <button className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white rounded text-xs font-mono flex items-center gap-1.5 w-fit">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Client Directory</span>
          </button>
        </Link>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-3 text-xs font-mono ${
            message.type === "success"
              ? "bg-green-950/80 border-green-500 text-green-300"
              : "bg-red-950/80 border-red-500 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Client Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="comic-card p-4 bg-[#111218] border border-neutral-800">
          <span className="text-[10px] font-mono text-neutral-400 uppercase">Account Status</span>
          <p className="font-heading font-bold text-base text-comic-green mt-1">Verified Client</p>
          <span className="text-[10px] font-mono text-neutral-500">
            Registered {new Date(client?.createdAt).toLocaleDateString("en-IN")}
          </span>
        </div>

        <div className="comic-card p-4 bg-[#111218] border border-neutral-800">
          <span className="text-[10px] font-mono text-neutral-400 uppercase">Total Campaigns</span>
          <p className="font-display text-2xl text-comic-yellow mt-1">{campaigns.length}</p>
        </div>

        <div className="comic-card p-4 bg-[#111218] border border-neutral-800">
          <span className="text-[10px] font-mono text-neutral-400 uppercase">Invoiced Volume</span>
          <p className="font-display text-2xl text-white mt-1">
            ₹
            {invoices
              .reduce((acc: number, inv: any) => acc + Number(inv.total_inr || 0), 0)
              .toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Campaigns Section with Admin Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl uppercase tracking-wider text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-comic-pink" />
            <span>Client Campaigns ({campaigns.length})</span>
          </h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="comic-card p-8 text-center bg-[#111218] border-2 border-dashed border-neutral-700 text-neutral-400 font-mono text-xs">
            No campaigns found for this client.
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

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                        camp.status === "ACTIVE"
                          ? "bg-comic-green/20 text-comic-green"
                          : camp.status === "PROPOSAL_REVIEW"
                          ? "bg-comic-yellow/20 text-comic-yellow"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      ● {camp.status}
                    </span>

                    <button
                      onClick={() => handleOpenEditCampaign(camp)}
                      className="px-3 py-1 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded border border-black shadow-[2px_2px_0px_#000] flex items-center gap-1"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Admin Adjust</span>
                    </button>
                  </div>
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

      {/* Adjust Campaign Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 sm:p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h2 className="font-display text-2xl uppercase text-white">
                Admin Campaign Controls
              </h2>
              <button
                onClick={() => setEditingCampaign(null)}
                className="text-neutral-400 hover:text-white font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaignChanges} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Campaign Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-yellow focus:outline-none"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PROPOSAL_REVIEW">PROPOSAL_REVIEW</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Telemetry Views
                  </label>
                  <input
                    type="number"
                    value={newViews}
                    onChange={(e) => setNewViews(e.target.value)}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Telemetry Clicks
                  </label>
                  <input
                    type="number"
                    value={newClicks}
                    onChange={(e) => setNewClicks(e.target.value)}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Conversions / Leads
                  </label>
                  <input
                    type="number"
                    value={newLeads}
                    onChange={(e) => setNewLeads(e.target.value)}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    ROAS (Multiplier)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newROAS}
                    onChange={(e) => setNewROAS(e.target.value)}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
                >
                  Save Telemetry & Sync Portal →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
