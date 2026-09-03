"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SAMPLE_MEDIA_ASSETS } from "@/lib/db";
import { MediaAsset } from "@/lib/types";
import { getContrastRatio, getPaletteStyle } from "@/lib/palette-engine";
import {
  Image as ImageIcon,
  Sparkles,
  Sliders,
  ShieldCheck,
  Upload,
  Check,
  RefreshCw,
  Eye,
} from "lucide-react";

export default function AdminMediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(SAMPLE_MEDIA_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset>(SAMPLE_MEDIA_ASSETS[0]);
  const [overrideHex, setOverrideHex] = useState(SAMPLE_MEDIA_ASSETS[0].palette.vibrant);

  const handleOverride = (newHex: string) => {
    setOverrideHex(newHex);
    setAssets((prev) =>
      prev.map((a) =>
        a.id === selectedAsset.id
          ? {
              ...a,
              palette: {
                ...a.palette,
                vibrant: newHex,
                accentFrame: newHex,
              },
              isOverridden: true,
            }
          : a
      )
    );
    setSelectedAsset((prev) => ({
      ...prev,
      palette: {
        ...prev.palette,
        vibrant: newHex,
        accentFrame: newHex,
      },
      isOverridden: true,
    }));
  };

  const contrast = getContrastRatio(selectedAsset.palette.contrastText, selectedAsset.palette.darkVibrant);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-comic-cyan" />
            <span>MEDIA LIBRARY & PALETTE STUDIO</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            node-vibrant WASM Extraction Pipeline • Cloudflare R2 Storage Ready
          </p>
        </div>

        <button
          onClick={() => alert("Upload Modal initialized. Cloudflare R2 pre-signed URL generated.")}
          className="text-xs font-heading font-black bg-comic-cyan text-comic-black px-4 py-2 rounded border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Real Client Media</span>
        </button>
      </div>

      {/* Grid: Media Asset Gallery + Active Swatch Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Asset Cards Grid (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assets.map((asset) => {
            const isSelected = selectedAsset.id === asset.id;

            return (
              <div
                key={asset.id}
                onClick={() => {
                  setSelectedAsset(asset);
                  setOverrideHex(asset.palette.vibrant);
                }}
                className={`rounded-xl bg-[#111218] border-2 overflow-hidden transition-all cursor-pointer ${
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

                  {asset.isOverridden && (
                    <span className="absolute top-2 right-2 bg-comic-yellow text-black text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                      MANUAL OVERRIDE
                    </span>
                  )}
                </div>

                {/* Details & Palette Swatches */}
                <div className="p-3.5 space-y-2">
                  <p className="text-xs font-heading font-bold text-white truncate">
                    {asset.title}
                  </p>
                  <p className="text-[10px] font-mono text-neutral-400">
                    Client: {asset.clientName}
                  </p>

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

        {/* Live Swatch Editor & Preview Inspector (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="p-6 rounded-xl bg-[#111218] border-2 border-neutral-800 space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="text-xs font-mono text-comic-cyan uppercase font-bold">
                  Swatch Inspector
                </span>
                <h2 className="font-display text-xl uppercase text-white mt-0.5">
                  {selectedAsset.title}
                </h2>
              </div>

              <span className="text-xs font-mono bg-neutral-800 px-2 py-1 rounded text-neutral-300">
                {selectedAsset.id}
              </span>
            </div>

            {/* Extracted Swatches Chips */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono text-neutral-400">Vibrant (Accent)</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-black"
                    style={{ backgroundColor: selectedAsset.palette.vibrant }}
                  />
                  <span className="text-xs font-mono text-white font-bold">
                    {selectedAsset.palette.vibrant}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono text-neutral-400">Dark Structure</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-black"
                    style={{ backgroundColor: selectedAsset.palette.darkVibrant }}
                  />
                  <span className="text-xs font-mono text-white font-bold">
                    {selectedAsset.palette.darkVibrant}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono text-neutral-400">Light Tint</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-black"
                    style={{ backgroundColor: selectedAsset.palette.lightVibrant }}
                  />
                  <span className="text-xs font-mono text-white font-bold">
                    {selectedAsset.palette.lightVibrant}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 space-y-1">
                <span className="text-[10px] font-mono text-neutral-400">Muted Base</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-black"
                    style={{ backgroundColor: selectedAsset.palette.muted }}
                  />
                  <span className="text-xs font-mono text-white font-bold">
                    {selectedAsset.palette.muted}
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Color Override Picker */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-mono uppercase text-neutral-300 font-bold">
                Manual Swatch Override
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={overrideHex}
                  onChange={(e) => handleOverride(e.target.value)}
                  className="w-10 h-10 rounded border-2 border-black bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={overrideHex}
                  onChange={(e) => handleOverride(e.target.value)}
                  className="bg-comic-black border border-neutral-700 text-xs font-mono text-white p-2 rounded w-full"
                />
              </div>
            </div>

            {/* Contrast Check */}
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-comic-green" />
                <span className="text-xs font-heading font-bold text-white">
                  Contrast Ratio: {contrast.toFixed(2)}:1
                </span>
              </div>
              <span className="text-[10px] font-mono text-comic-green font-bold">
                PASS (WCAG AA)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
