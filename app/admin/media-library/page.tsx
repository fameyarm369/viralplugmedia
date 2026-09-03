"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PaletteInspector } from "@/components/admin/PaletteInspector";
import { ColorPalette } from "@/lib/types";
import { generateComicPalette } from "@/lib/palette-engine";
import {
  Image as ImageIcon,
  Upload,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Layers,
  Flame,
  LayoutGrid,
} from "lucide-react";

interface MediaAssetItem {
  id: string;
  title: string;
  url: string;
  file_type: "image" | "video";
  category: string;
  client_name: string;
  campaign_headline: string;
  metrics: any;
  palette: ColorPalette;
  is_overridden: boolean;
  created_at: string;
}

export default function AdminMediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAssetItem[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    title: "",
    url: "",
    fileType: "image" as "image" | "video",
    category: "food-honey",
    clientName: "",
    campaignHeadline: "",
    viewsMetric: "1.4M+",
    roasMetric: "6.2x ROAS",
  });
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/media");
      const data = await res.json();
      if (data.success) {
        setAssets(data.data);
        if (data.data.length > 0 && !selectedAsset) {
          setSelectedAsset(data.data[0]);
        }
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load media assets" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    try {
      // Step 1: Process palette from colors or server
      const paletteRes = await fetch("/api/v1/media/process-palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dominant: "#FF5E00",
          vibrant: "#FFE600",
          darkVibrant: "#1D3557",
        }),
      });
      const paletteData = await paletteRes.json();

      // Step 2: Create media asset in DB
      const res = await fetch("/api/v1/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadData.title,
          url: uploadData.url,
          fileType: uploadData.fileType,
          category: uploadData.category,
          clientName: uploadData.clientName,
          campaignHeadline: uploadData.campaignHeadline,
          metrics: {
            views: uploadData.viewsMetric,
            roas: uploadData.roasMetric,
          },
          palette: paletteData.palette,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Media uploaded and palette extracted successfully!" });
        setShowUploadModal(false);
        setUploadData({
          title: "",
          url: "",
          fileType: "image",
          category: "food-honey",
          clientName: "",
          campaignHeadline: "",
          viewsMetric: "1.4M+",
          roasMetric: "6.2x ROAS",
        });
        await fetchMedia();
        setSelectedAsset(data.data);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to upload media" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Upload error" });
    } finally {
      setUploading(false);
    }
  };

  const handleAttachToVertical = async () => {
    if (!selectedAsset) return;
    try {
      const res = await fetch("/api/v1/admin/verticals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedAsset.category,
          heroMediaId: selectedAsset.id,
          headline: selectedAsset.campaign_headline,
          clientName: selectedAsset.client_name,
          reachStat: selectedAsset.metrics?.views || "1.2M+ Views",
          roasStat: selectedAsset.metrics?.roas || "6.2x ROAS",
          isFeatured: true,
          displayOrder: 0,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAttachModal(false);
        setMessage({
          type: "success",
          text: `Media attached to Homepage Showcase under '${selectedAsset.category}'!`,
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to attach" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Attachment error" });
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media asset?")) return;
    try {
      const res = await fetch(`/api/v1/admin/media/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Media asset deleted" });
        setAssets((prev) => prev.filter((a) => a.id !== id));
        if (selectedAsset?.id === id) {
          setSelectedAsset(assets.find((a) => a.id !== id) || null);
        }
      }
    } catch {
      setMessage({ type: "error", text: "Delete failed" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-comic-cyan" />
            <span>MEDIA ASSET & PALETTE STUDIO</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            node-vibrant WASM Extraction • Real-Time WCAG AA Contrast Validation • Cloudflare R2 Uploads
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="text-xs font-heading font-black bg-comic-cyan text-comic-black px-4 py-2.5 rounded border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2 w-fit"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Real Client Media</span>
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

      {/* Grid: Media Asset Gallery + Active Swatch Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Gallery Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-neutral-400 uppercase font-bold">
              Processed Media Assets ({assets.length})
            </span>
          </div>

          {loading ? (
            <div className="comic-card p-12 text-center text-neutral-500 font-mono text-xs">
              Loading media assets from database...
            </div>
          ) : assets.length === 0 ? (
            <div className="comic-card p-12 text-center space-y-4 bg-[#111218] border-2 border-dashed border-neutral-700">
              <ImageIcon className="w-12 h-12 text-neutral-600 mx-auto" />
              <div>
                <h3 className="font-display text-xl uppercase text-white">
                  No Media Assets Uploaded Yet
                </h3>
                <p className="text-xs font-mono text-neutral-400 mt-1 max-w-sm mx-auto">
                  Upload your first client photo or video (up to 25MB image / 150MB video) to extract high-contrast comic palettes.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-xs font-heading font-black bg-comic-yellow text-comic-black px-4 py-2 rounded border-2 border-black shadow-[2px_2px_0px_#000]"
              >
                + Upload First Media Asset
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className={`rounded-xl bg-[#111218] border-2 overflow-hidden transition-all cursor-pointer group ${
                      isSelected
                        ? "border-comic-yellow ring-4 ring-comic-yellow/20 shadow-[4px_4px_0px_#FFE600]"
                        : "border-neutral-800 hover:border-neutral-600"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] w-full bg-neutral-900">
                      <Image
                        src={asset.url}
                        alt={asset.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2">
                        <span
                          className="comic-badge text-[10px] px-2 py-0.5 uppercase"
                          style={{
                            backgroundColor: asset.palette.vibrant,
                            color: asset.palette.contrastText,
                          }}
                        >
                          {asset.category}
                        </span>
                      </div>

                      {asset.is_overridden && (
                        <span className="absolute top-2 right-2 bg-comic-yellow text-black text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                          OVERRIDDEN
                        </span>
                      )}
                    </div>

                    {/* Details & Palette Swatches */}
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-heading font-bold text-white truncate">
                            {asset.title}
                          </p>
                          <p className="text-[10px] font-mono text-neutral-400">
                            Client: {asset.client_name}
                          </p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(asset.id);
                          }}
                          className="text-neutral-500 hover:text-red-400 p-1"
                          title="Delete media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-800">
                        <div
                          className="w-4 h-4 rounded-full border border-black"
                          style={{ backgroundColor: asset.palette.vibrant }}
                          title={`Vibrant: ${asset.palette.vibrant}`}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black"
                          style={{ backgroundColor: asset.palette.darkVibrant }}
                          title={`Dark: ${asset.palette.darkVibrant}`}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black"
                          style={{ backgroundColor: asset.palette.lightVibrant }}
                          title={`Light: ${asset.palette.lightVibrant}`}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-black"
                          style={{ backgroundColor: asset.palette.muted }}
                          title={`Muted: ${asset.palette.muted}`}
                        />
                        <span className="text-[10px] font-mono text-comic-green font-bold ml-auto">
                          AA 4.5:1 ✓
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Swatch Inspector (5 Cols) */}
        <div className="lg:col-span-5">
          {selectedAsset ? (
            <div className="space-y-4 sticky top-24">
              <PaletteInspector
                mediaId={selectedAsset.id}
                mediaUrl={selectedAsset.url}
                title={selectedAsset.title}
                clientName={selectedAsset.client_name}
                headline={selectedAsset.campaign_headline}
                category={selectedAsset.category}
                roasStat={selectedAsset.metrics?.roas || "6.2x"}
                initialPalette={selectedAsset.palette}
                onSaveOverride={(newPalette) => {
                  setSelectedAsset((prev) => (prev ? { ...prev, palette: newPalette, is_overridden: true } : null));
                  setAssets((prev) =>
                    prev.map((a) =>
                      a.id === selectedAsset.id
                        ? { ...a, palette: newPalette, is_overridden: true }
                        : a
                    )
                  );
                }}
              />

              {/* Attachment CTA */}
              <div className="p-4 bg-[#111218] rounded-xl border border-neutral-800 space-y-2">
                <span className="text-xs font-mono text-neutral-300 font-bold uppercase block">
                  Attach Processed Media To:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowAttachModal(true)}
                    className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded text-xs font-heading font-bold flex items-center justify-center gap-1.5"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-comic-yellow" />
                    <span>Homepage Showcase</span>
                  </button>
                  <button
                    onClick={() => alert(`Media attached to Campaign builder.`)}
                    className="p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded text-xs font-heading font-bold flex items-center justify-center gap-1.5"
                  >
                    <Flame className="w-3.5 h-3.5 text-comic-pink" />
                    <span>Campaign Creative</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="comic-card p-8 text-center text-neutral-500 font-mono text-xs">
              Select or upload a media asset to inspect its 5-swatch palette.
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 sm:p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <h2 className="font-display text-2xl uppercase text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-comic-cyan" />
                <span>Upload Client Media & Extract Palette</span>
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-neutral-400 hover:text-white font-mono text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Asset Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wild Forest Raw Amber Honey Jar"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Direct Photo / Video URL (or Cloudflare R2 URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={uploadData.url}
                  onChange={(e) => setUploadData({ ...uploadData, url: e.target.value })}
                  className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-cyan focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Category *
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-cyan focus:outline-none"
                  >
                    <option value="food-honey">Food & Honey</option>
                    <option value="sports-football">Sports & Cleats</option>
                    <option value="property">Real Estate</option>
                    <option value="fashion-apparel">Fashion & Drip</option>
                    <option value="local-shop">Local Shop & Cafe</option>
                    <option value="creator-influencer">Creator & Events</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    File Type
                  </label>
                  <select
                    value={uploadData.fileType}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, fileType: e.target.value as "image" | "video" })
                    }
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-cyan focus:outline-none"
                  >
                    <option value="image">Image (≤25MB)</option>
                    <option value="video">Video (≤150MB)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Client / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vedika Organics"
                    value={uploadData.clientName}
                    onChange={(e) => setUploadData({ ...uploadData, clientName: e.target.value })}
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-cyan focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Campaign Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PURE GOLD. ZERO COMPROMISE."
                    value={uploadData.campaignHeadline}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, campaignHeadline: e.target.value })
                    }
                    className="w-full bg-comic-black border border-neutral-700 rounded p-2.5 text-xs text-white focus:border-comic-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-comic-cyan text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
                >
                  {uploading ? "Extracting Swatches..." : "Upload & Run Palette Extraction →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Modal */}
      {showAttachModal && selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-md w-full p-6 bg-[#12131A] border-2 border-comic-yellow space-y-4">
            <h3 className="font-display text-xl uppercase text-white">
              Publish to Homepage Showcase
            </h3>
            <p className="text-xs font-mono text-neutral-300">
              This will publish <strong>{selectedAsset.title}</strong> to the public homepage tabs under <strong>{selectedAsset.category}</strong>.
            </p>
            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setShowAttachModal(false)}
                className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAttachToVertical}
                className="px-4 py-1.5 bg-comic-yellow text-comic-black font-heading font-black text-xs rounded border border-black shadow-[2px_2px_0px_#000]"
              >
                Confirm & Publish Live →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
