"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";

interface CampaignItem {
  id: string;
  title: string;
  client_id: string | null;
  client_name: string;
  category: string;
  status: string;
  budget_inr: number;
  metrics: {
    views?: number;
    clicks?: number;
    leads?: number;
    roas?: number;
  };
  created_at: string;
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CampaignItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    category: "food-honey",
    budgetINR: "50000",
    views: "0",
    clicks: "0",
    leads: "0",
    roas: "5.5",
    status: "ACTIVE",
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      let url = "/api/v1/admin/campaigns";
      if (statusFilter !== "ALL") url += `?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load campaigns" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      clientName: "",
      category: "food-honey",
      budgetINR: "50000",
      views: "0",
      clicks: "0",
      leads: "0",
      roas: "5.5",
      status: "ACTIVE",
    });
    setShowModal(true);
  };

  const openEditModal = (c: CampaignItem) => {
    setEditingItem(c);
    setFormData({
      title: c.title,
      clientName: c.client_name,
      category: c.category,
      budgetINR: String(c.budget_inr || "0"),
      views: String(c.metrics?.views || "0"),
      clicks: String(c.metrics?.clicks || "0"),
      leads: String(c.metrics?.leads || "0"),
      roas: String(c.metrics?.roas || "5.0"),
      status: c.status,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      if (editingItem) {
        const res = await fetch(`/api/v1/admin/campaigns/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            category: formData.category,
            budgetINR: parseFloat(formData.budgetINR),
            status: formData.status,
            metrics: {
              views: parseInt(formData.views, 10),
              clicks: parseInt(formData.clicks, 10),
              leads: parseInt(formData.leads, 10),
              roas: parseFloat(formData.roas),
            },
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: "success", text: "Campaign updated successfully!" });
          setShowModal(false);
          await fetchCampaigns();
        } else {
          setMessage({ type: "error", text: data.error || "Update failed" });
        }
      } else {
        const res = await fetch("/api/v1/admin/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            clientName: formData.clientName,
            category: formData.category,
            budgetINR: parseFloat(formData.budgetINR),
            metrics: {
              views: parseInt(formData.views, 10),
              clicks: parseInt(formData.clicks, 10),
              leads: parseInt(formData.leads, 10),
              roas: parseFloat(formData.roas),
            },
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: "success", text: "Campaign created successfully!" });
          setShowModal(false);
          await fetchCampaigns();
        } else {
          setMessage({ type: "error", text: data.error || "Creation failed" });
        }
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await fetch(`/api/v1/admin/campaigns/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Campaign deleted" });
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      setMessage({ type: "error", text: "Delete failed" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-comic-pink" />
            <span>CAMPAIGN ACCELERATOR PIPELINE</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Real PostgreSQL Campaign Instances • Live Telemetry Adjustments • Status Orchestration
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="text-xs font-heading font-black bg-comic-pink text-white px-4 py-2.5 rounded border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Launch New Campaign</span>
        </button>
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

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-neutral-400">Filter Status:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 text-xs text-white rounded px-2.5 py-1 font-mono"
        >
          <option value="ALL">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PROPOSAL_REVIEW">PROPOSAL_REVIEW</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PAUSED">PAUSED</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="comic-card p-12 text-center text-neutral-500 font-mono text-xs">
          Loading campaigns from database...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="comic-card p-12 text-center bg-[#111218] border-2 border-dashed border-neutral-700 space-y-3">
          <Flame className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="font-display text-xl uppercase text-white">
            No Campaigns Found in Database
          </h3>
          <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
            Create a campaign or approve an inbound lead inquiry to initiate campaign telemetry.
          </p>
          <button
            onClick={openCreateModal}
            className="text-xs font-heading font-black bg-comic-pink text-white px-4 py-2 rounded border-2 border-black shadow-[2px_2px_0px_#000]"
          >
            + Create First Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 hover:border-comic-pink transition-all flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_#000]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="comic-badge text-[10px] bg-comic-yellow text-comic-black px-2 py-0.5 uppercase font-bold">
                    {camp.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      camp.status === "ACTIVE"
                        ? "bg-comic-green/20 text-comic-green"
                        : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    ● {camp.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-xl uppercase text-white truncate">
                    {camp.title}
                  </h3>
                  <p className="text-xs font-mono text-neutral-400 mt-0.5">
                    Client: <strong className="text-white">{camp.client_name}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] uppercase block">Views</span>
                    <span className="text-comic-cyan font-bold">
                      {Number(camp.metrics?.views || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] uppercase block">ROAS</span>
                    <span className="text-comic-yellow font-bold">
                      {camp.metrics?.roas ? `${camp.metrics.roas}x` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="font-display text-base text-white">
                  ₹{Number(camp.budget_inr || 0).toLocaleString("en-IN")}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(camp)}
                    className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded border border-neutral-700"
                    title="Edit Campaign"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(camp.id)}
                    className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded border border-neutral-700"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 sm:p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FF0055] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h2 className="font-display text-2xl uppercase text-white">
                {editingItem ? "Edit Campaign Telemetry" : "Launch New Campaign"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Honey D2C Viral Video Sprint"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white"
                />
              </div>

              {!editingItem && (
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Client Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vedika Organics"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white"
                  >
                    <option value="food-honey">Food & Honey</option>
                    <option value="sports-football">Sports & Cleats</option>
                    <option value="property">Real Estate</option>
                    <option value="fashion-apparel">Fashion & Drip</option>
                    <option value="local-shop">Local Shop & Cafe</option>
                    <option value="creator-influencer">Creator Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PROPOSAL_REVIEW">PROPOSAL_REVIEW</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Budget (INR)
                  </label>
                  <input
                    type="number"
                    value={formData.budgetINR}
                    onChange={(e) => setFormData({ ...formData, budgetINR: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Views
                  </label>
                  <input
                    type="number"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: e.target.value })}
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
                    value={formData.roas}
                    onChange={(e) => setFormData({ ...formData, roas: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-comic-pink text-white font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
                >
                  {editingItem ? "Save Telemetry" : "Launch Campaign →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
