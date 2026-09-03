"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface HistoricalDealItem {
  id: string;
  category: string;
  budget_inr: number;
  deliverables: string[];
  final_price_inr: number;
  roas_achieved: number;
  client_type: string;
  notes: string | null;
  created_at: string;
}

export default function DealHistoryAdminPage() {
  const [deals, setDeals] = useState<HistoricalDealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: "food-honey",
    budgetINR: "50000",
    finalPriceINR: "65000",
    roasAchieved: "6.2",
    clientType: "D2C Brand",
    deliverables: "15 Video Cuts, 40 Posters, WhatsApp Bot",
    notes: "",
  });

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/historical-deals");
      const data = await res.json();
      if (data.success) {
        setDeals(data.data);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load deal history" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch("/api/v1/admin/historical-deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formData.category,
          budgetINR: formData.budgetINR,
          finalPriceINR: formData.finalPriceINR,
          roasAchieved: formData.roasAchieved,
          clientType: formData.clientType,
          deliverables: formData.deliverables.split(",").map((d) => d.trim()),
          notes: formData.notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Historical deal added to grounding context database!" });
        setShowModal(false);
        setFormData({
          category: "food-honey",
          budgetINR: "50000",
          finalPriceINR: "65000",
          roasAchieved: "6.2",
          clientType: "D2C Brand",
          deliverables: "15 Video Cuts, 40 Posters, WhatsApp Bot",
          notes: "",
        });
        await fetchDeals();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to add deal" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this historical deal record?")) return;
    try {
      const res = await fetch(`/api/v1/admin/historical-deals/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Deal removed from database" });
        setDeals((prev) => prev.filter((d) => d.id !== id));
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
            <DollarSign className="w-6 h-6 text-comic-green" />
            <span>AI DEAL ESTIMATOR GROUNDING CONTEXT</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Real Past Deal Benchmarks • Zero Hallucinations Policy • Database-Grounded Quote Generation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDeals}
            className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-3 py-2 rounded text-neutral-300 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-heading font-black bg-comic-green text-comic-black px-4 py-2.5 rounded border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Historical Deal</span>
          </button>
        </div>
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

      {/* Grounding Info Callout */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-comic-yellow shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-neutral-300 space-y-1">
          <p className="text-white font-bold">How Grounded Deal Estimation Works:</p>
          <p>
            When a visitor requests an estimate on the enquiry flow, the system queries this table for matching categories. If no historical deals exist for a category, the engine strictly informs the visitor rather than hallucinating prices.
          </p>
        </div>
      </div>

      {/* Table of Historical Deals */}
      <div className="comic-card overflow-hidden bg-[#111218] border-2 border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase">
              <tr>
                <th className="p-4">Category</th>
                <th className="p-4">Ad Budget</th>
                <th className="p-4">Final Price</th>
                <th className="p-4">ROAS Achieved</th>
                <th className="p-4">Deliverables</th>
                <th className="p-4">Client Type</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    Loading historical deals from database...
                  </td>
                </tr>
              ) : deals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-neutral-500 space-y-2">
                    <p className="font-bold text-neutral-400">No historical deals recorded in the database yet.</p>
                    <p className="text-[11px]">
                      Add verified past deals so the AI Deal Calculator can calculate accurate estimates for incoming leads.
                    </p>
                  </td>
                </tr>
              ) : (
                deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="p-4">
                      <span className="comic-badge text-[10px] bg-comic-yellow text-comic-black px-2 py-0.5 uppercase font-bold">
                        {deal.category}
                      </span>
                    </td>
                    <td className="p-4 text-white font-bold">
                      ₹{Number(deal.budget_inr).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-comic-green font-bold text-sm">
                      ₹{Number(deal.final_price_inr).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-comic-pink font-bold">
                      {deal.roas_achieved}x ROAS
                    </td>
                    <td className="p-4 text-neutral-300 max-w-xs truncate">
                      {Array.isArray(deal.deliverables)
                        ? deal.deliverables.join(", ")
                        : JSON.stringify(deal.deliverables)}
                    </td>
                    <td className="p-4 text-neutral-400">{deal.client_type}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-900"
                        title="Delete deal record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 sm:p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#00E575] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h2 className="font-display text-2xl uppercase text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-comic-green" />
                <span>Add Historical Deal Record</span>
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-green focus:outline-none"
                  >
                    <option value="food-honey">Food & Honey</option>
                    <option value="sports-football">Sports & Cleats</option>
                    <option value="property">Real Estate & Stays</option>
                    <option value="fashion-apparel">Fashion & Drip</option>
                    <option value="local-shop">Local Shop & Cafe</option>
                    <option value="creator-influencer">Creator Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Client Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. D2C Organic Brand"
                    value={formData.clientType}
                    onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-green focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Ad Budget (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.budgetINR}
                    onChange={(e) => setFormData({ ...formData, budgetINR: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Final Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.finalPriceINR}
                    onChange={(e) => setFormData({ ...formData, finalPriceINR: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-green focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    ROAS (Multiplier)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.roasAchieved}
                    onChange={(e) => setFormData({ ...formData, roasAchieved: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-green focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Deliverables (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15 Video Cuts, 40 Posters, WhatsApp Bot"
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Case Notes / Key Learnings
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Scaled raw amber honey from 2.1x to 6.2x ROAS in 45 days."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-green focus:outline-none"
                />
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
                  className="px-6 py-2 bg-comic-green text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
                >
                  Save Deal to Grounding Database →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
