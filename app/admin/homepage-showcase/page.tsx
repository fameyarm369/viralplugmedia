"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ColorPalette } from "@/lib/types";
import { getPaletteStyle } from "@/lib/palette-engine";
import { StarburstBadge } from "@/components/comic/StarburstBadge";
import {
  LayoutGrid,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";

interface VerticalItem {
  id: string;
  category: string;
  hero_media_id: string | null;
  headline: string;
  client_name: string;
  reach_stat: string;
  roas_stat: string;
  is_featured: boolean;
  display_order: number;
  media_url?: string;
  media_title?: string;
  palette?: ColorPalette;
}

export default function HomepageShowcaseAdminPage() {
  const [verticals, setVerticals] = useState<VerticalItem[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VerticalItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    category: "food-honey",
    heroMediaId: "",
    headline: "",
    clientName: "",
    reachStat: "1.4M+ Reach",
    roasStat: "6.2x ROAS",
    isFeatured: true,
    displayOrder: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, mRes] = await Promise.all([
        fetch("/api/v1/admin/verticals"),
        fetch("/api/v1/media"),
      ]);
      const vData = await vRes.json();
      const mData = await mRes.json();

      if (vData.success) setVerticals(vData.data);
      if (mData.success) setMediaList(mData.data);
    } catch {
      setMessage({ type: "error", text: "Failed to fetch showcase data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      category: "food-honey",
      heroMediaId: mediaList[0]?.id || "",
      headline: "",
      clientName: "",
      reachStat: "1.4M+ Reach",
      roasStat: "6.2x ROAS",
      isFeatured: true,
      displayOrder: verticals.length,
    });
    setShowModal(true);
  };

  const openEditModal = (item: VerticalItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      heroMediaId: item.hero_media_id || "",
      headline: item.headline,
      clientName: item.client_name,
      reachStat: item.reach_stat,
      roasStat: item.roas_stat,
      isFeatured: item.is_featured,
      displayOrder: item.display_order,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      if (editingItem) {
        // Edit existing
        const res = await fetch(`/api/v1/admin/verticals/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: formData.category,
            hero_media_id: formData.heroMediaId,
            headline: formData.headline,
            client_name: formData.clientName,
            reach_stat: formData.reachStat,
            roas_stat: formData.roasStat,
            is_featured: formData.isFeatured,
            display_order: formData.displayOrder,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: "success", text: "Vertical updated successfully!" });
          setShowModal(false);
          await fetchData();
        } else {
          setMessage({ type: "error", text: data.error || "Update failed" });
        }
      } else {
        // Create new
        const res = await fetch("/api/v1/admin/verticals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setMessage({ type: "success", text: "Vertical published to homepage!" });
          setShowModal(false);
          await fetchData();
        } else {
          setMessage({ type: "error", text: data.error || "Creation failed" });
        }
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred" });
    }
  };

  const handleToggleFeatured = async (item: VerticalItem) => {
    try {
      const res = await fetch(`/api/v1/admin/verticals/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !item.is_featured }),
      });
      const data = await res.json();
      if (data.success) {
        setVerticals((prev) =>
          prev.map((v) => (v.id === item.id ? { ...v, is_featured: !v.is_featured } : v))
        );
      }
    } catch {
      alert("Failed to toggle publish status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this vertical showcase?")) return;
    try {
      const res = await fetch(`/api/v1/admin/verticals/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Vertical removed from showcase" });
        setVerticals((prev) => prev.filter((v) => v.id !== id));
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
            <LayoutGrid className="w-6 h-6 text-comic-yellow" />
            <span>HOMEPAGE SHOWCASE VERTICALS</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Real-Time Database Control • Changes Appear Immediately on Public Homepage Without Redeploy
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="text-xs font-heading font-black bg-comic-yellow text-comic-black px-4 py-2.5 rounded border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vertical Card</span>
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

      {/* Verticals List */}
      {loading ? (
        <div className="comic-card p-12 text-center text-neutral-500 font-mono text-xs">
          Loading showcase verticals from database...
        </div>
      ) : verticals.length === 0 ? (
        <div className="comic-card p-12 text-center space-y-4 bg-[#111218] border-2 border-dashed border-neutral-700">
          <LayoutGrid className="w-12 h-12 text-neutral-600 mx-auto" />
          <div>
            <h3 className="font-display text-xl uppercase text-white">
              No Homepage Showcase Verticals Published
            </h3>
            <p className="text-xs font-mono text-neutral-400 mt-1 max-w-sm mx-auto">
              Create your first vertical card to feature it in the public homepage tabs and showcase real client media.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="text-xs font-heading font-black bg-comic-yellow text-comic-black px-4 py-2 rounded border-2 border-black shadow-[2px_2px_0px_#000]"
          >
            + Create First Vertical
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verticals.map((vert) => {
            const vibrant = vert.palette?.vibrant || "#FFE600";
            const darkVibrant = vert.palette?.darkVibrant || "#0A0A0C";
            const contrastText = vert.palette?.contrastText || "#FFFFFF";

            return (
              <div
                key={vert.id}
                className={`comic-card p-5 bg-[#111218] border-2 flex flex-col justify-between space-y-4 ${
                  vert.is_featured
                    ? "border-comic-yellow shadow-[4px_4px_0px_#FFE600]"
                    : "border-neutral-800 opacity-60"
                }`}
              >
                {/* Media Image Banner */}
                <div className="relative aspect-[16/10] w-full bg-neutral-900 rounded-lg overflow-hidden border border-neutral-700">
                  {vert.media_url ? (
                    <Image src={vert.media_url} alt={vert.headline} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 font-mono text-xs">
                      No Media Linked
                    </div>
                  )}

                  <div className="absolute top-2 left-2">
                    <span
                      className="comic-badge text-[10px] px-2 py-0.5 uppercase"
                      style={{ backgroundColor: vibrant, color: contrastText }}
                    >
                      {vert.category}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2">
                    <span className="bg-comic-black text-white text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-700">
                      Order: #{vert.display_order}
                    </span>
                  </div>
                </div>

                {/* Information */}
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-neutral-400 uppercase">
                    Client: <strong className="text-white">{vert.client_name}</strong>
                  </p>
                  <h3 className="font-display text-lg uppercase text-white truncate">
                    {vert.headline}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono pt-1">
                    <span className="text-comic-cyan font-bold">{vert.reach_stat}</span>
                    <span className="text-comic-pink font-bold">{vert.roas_stat}</span>
                  </div>
                </div>

                {/* Control Actions */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleFeatured(vert)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded flex items-center gap-1.5 ${
                      vert.is_featured
                        ? "bg-comic-green/20 text-comic-green font-bold"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {vert.is_featured ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Live on Homepage</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Unpublished</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(vert)}
                      className="p-1.5 text-neutral-400 hover:text-white bg-neutral-900 rounded border border-neutral-700"
                      title="Edit vertical"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(vert.id)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 bg-neutral-900 rounded border border-neutral-700"
                      title="Delete vertical"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 sm:p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h2 className="font-display text-2xl uppercase text-white">
                {editingItem ? "Edit Vertical Card" : "Add Vertical to Homepage"}
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
                  Target Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-yellow focus:outline-none"
                >
                  <option value="food-honey">Food & Honey</option>
                  <option value="sports-football">Sports & Football Cleats</option>
                  <option value="property">Luxury Real Estate</option>
                  <option value="fashion-apparel">Fashion & Apparel</option>
                  <option value="local-shop">Local Shop & Cafe</option>
                  <option value="creator-influencer">Creator & Concert Events</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Select Media Asset (with Extracted Palette) *
                </label>
                <select
                  value={formData.heroMediaId}
                  onChange={(e) => setFormData({ ...formData, heroMediaId: e.target.value })}
                  className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-yellow focus:outline-none"
                >
                  <option value="">-- Choose from Media Assets --</option>
                  {mediaList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.client_name} - {m.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vedika Organics"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: parseInt(e.target.value || "0", 10) })
                    }
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-yellow focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Campaign Poster Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PURE GOLD. ZERO COMPROMISE."
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-yellow focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Reach Stat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1.4M+ Views"
                    value={formData.reachStat}
                    onChange={(e) => setFormData({ ...formData, reachStat: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-yellow focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    ROAS Stat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6.2x ROAS"
                    value={formData.roasStat}
                    onChange={(e) => setFormData({ ...formData, roasStat: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-yellow focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeaturedCheck"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-comic-yellow focus:ring-comic-yellow bg-neutral-900 border-neutral-700"
                />
                <label htmlFor="isFeaturedCheck" className="text-xs font-mono text-neutral-300 font-bold">
                  Publish immediately to Homepage tabs
                </label>
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
                  className="px-6 py-2 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
                >
                  {editingItem ? "Save Changes" : "Publish to Homepage →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
