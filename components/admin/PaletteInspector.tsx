"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ColorPalette } from "@/lib/types";
import { getContrastRatio, getPaletteStyle } from "@/lib/palette-engine";
import { StarburstBadge } from "@/components/comic/StarburstBadge";
import { ShieldCheck, ShieldAlert, Sparkles, Sliders, RefreshCw, Check } from "lucide-react";

interface PaletteInspectorProps {
  mediaId: string;
  mediaUrl: string;
  title: string;
  clientName: string;
  headline: string;
  category: string;
  roasStat?: string;
  initialPalette: ColorPalette;
  onSaveOverride?: (palette: ColorPalette) => void;
}

export const PaletteInspector: React.FC<PaletteInspectorProps> = ({
  mediaId,
  mediaUrl,
  title,
  clientName,
  headline,
  category,
  roasStat = "6.2x",
  initialPalette,
  onSaveOverride,
}) => {
  const [activePalette, setActivePalette] = useState<ColorPalette>(initialPalette);
  const [selectedSwatch, setSelectedSwatch] = useState<keyof ColorPalette>("vibrant");
  const [customColor, setCustomColor] = useState(initialPalette.vibrant);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setActivePalette(initialPalette);
    setCustomColor(initialPalette.vibrant);
  }, [initialPalette]);

  const handleSwatchColorChange = (newHex: string) => {
    setCustomColor(newHex);
    setActivePalette((prev) => {
      const updated = { ...prev, [selectedSwatch]: newHex };
      if (selectedSwatch === "vibrant") {
        updated.accentFrame = newHex;
      }
      return updated;
    });
  };

  const handleSaveToDatabase = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/v1/admin/media/${mediaId}/palette`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ palette: activePalette, isOverridden: true }),
      });

      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        if (onSaveOverride) onSaveOverride(activePalette);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      alert("Failed to save palette override");
    } finally {
      setSaving(false);
    }
  };

  const contrast = getContrastRatio(activePalette.contrastText, activePalette.darkVibrant);
  const isPass = contrast >= 4.5;

  const swatches: { key: keyof ColorPalette; label: string; desc: string }[] = [
    { key: "vibrant", label: "Vibrant (Accent)", desc: "Primary CTA & Starbursts" },
    { key: "darkVibrant", label: "Dark Vibrant", desc: "Comic Structure & Borders" },
    { key: "lightVibrant", label: "Light Vibrant", desc: "Drop Highlight Tints" },
    { key: "muted", label: "Muted Base", desc: "Subtle Shadows" },
    { key: "darkMuted", label: "Dark Muted", desc: "Background Contrast" },
  ];

  return (
    <div className="space-y-6">
      <div className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <span className="text-xs font-mono text-comic-cyan uppercase font-bold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>Palette Inspector & WCAG Studio</span>
            </span>
            <h3 className="font-display text-xl uppercase text-white mt-0.5 truncate">
              {title}
            </h3>
          </div>

          <span className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-2.5 py-1 rounded text-neutral-300">
            {mediaId.slice(0, 12)}...
          </span>
        </div>

        {/* 5 Swatches Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {swatches.map((swatch) => {
            const hex = activePalette[swatch.key] as string;
            const isSelected = selectedSwatch === swatch.key;

            return (
              <div
                key={swatch.key}
                onClick={() => {
                  setSelectedSwatch(swatch.key);
                  setCustomColor(hex);
                }}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-neutral-800 border-comic-yellow shadow-[3px_3px_0px_#FFE600]"
                    : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-neutral-300 font-bold">
                    {swatch.label}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">
                    {hex}
                  </span>
                </div>

                <div
                  className="h-10 w-full rounded border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-mono text-xs font-bold"
                  style={{
                    backgroundColor: hex,
                    color: swatch.key === "lightVibrant" ? "#0A0A0C" : "#FFFFFF",
                  }}
                >
                  {swatch.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Color Override Control */}
        <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300 font-bold uppercase">
              Manual Override ({selectedSwatch}):
            </span>
            <span className="text-comic-yellow font-bold uppercase">{customColor}</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleSwatchColorChange(e.target.value)}
              className="w-10 h-10 rounded border-2 border-black bg-transparent cursor-pointer"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleSwatchColorChange(e.target.value)}
              className="bg-comic-black border border-neutral-700 text-xs font-mono text-white p-2.5 rounded w-full focus:border-comic-yellow focus:outline-none"
            />
          </div>
        </div>

        {/* WCAG AA Compliance Gauge */}
        <div className="p-4 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isPass ? (
              <ShieldCheck className="w-6 h-6 text-comic-green shrink-0" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-comic-pink shrink-0" />
            )}
            <div>
              <p className="text-xs font-heading font-bold text-white">
                WCAG 2.1 Contrast: <span className="text-comic-yellow font-mono">{contrast.toFixed(2)}:1</span>
              </p>
              <p className="text-[11px] text-neutral-400">
                {isPass
                  ? "Passed AA Compliance (>= 4.5:1 text readability ratio)"
                  : "Contrast low — consider brightening contrast text"}
              </p>
            </div>
          </div>

          <span
            className={`comic-badge text-xs px-2.5 py-0.5 font-bold ${
              isPass ? "bg-comic-green text-black" : "bg-comic-pink text-white"
            }`}
          >
            {isPass ? "WCAG AA ✓" : "FAIL ✕"}
          </span>
        </div>

        {/* Save Override Button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => setActivePalette(initialPalette)}
            className="text-xs font-mono text-neutral-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Swatches</span>
          </button>

          <button
            onClick={handleSaveToDatabase}
            disabled={saving}
            className="text-xs font-heading font-black bg-comic-yellow text-comic-black px-4 py-2 rounded border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Saved & Synced ✓</span>
              </>
            ) : (
              <span>{saving ? "Saving..." : "Save Palette Override →"}</span>
            )}
          </button>
        </div>
      </div>

      {/* Live Comic Card Preview */}
      <div className="space-y-2">
        <span className="block text-xs font-mono uppercase tracking-widest text-neutral-400 font-bold text-center">
          Live Render with Extracted Swatches:
        </span>

        <div
          style={getPaletteStyle(activePalette)}
          className="relative rounded-xl bg-comic-black border-[3.5px] border-comic-black overflow-hidden shadow-[8px_8px_0px_var(--media-vibrant)] max-w-sm mx-auto transition-all"
        >
          <div className="relative aspect-[4/5] w-full bg-neutral-900">
            <Image src={mediaUrl} alt={title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-comic-black/90 via-transparent to-transparent" />

            <div className="absolute top-3 left-3">
              <span
                className="comic-badge text-[10px] font-black px-2 py-0.5 uppercase"
                style={{
                  backgroundColor: activePalette.vibrant,
                  color: activePalette.contrastText,
                }}
              >
                {category}
              </span>
            </div>

            <div className="absolute top-3 right-3">
              <StarburstBadge
                size="sm"
                bgColor={activePalette.vibrant}
                textColor={activePalette.contrastText}
                rotate="5deg"
              >
                <span className="text-[9px]">ROAS</span>
                <span className="text-xs font-black">{roasStat}</span>
              </StarburstBadge>
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                {clientName}
              </p>
              <h4
                className="font-display text-xl uppercase leading-none tracking-wide text-white mt-0.5"
                style={{
                  textShadow: `2px 2px 0px #0A0A0C, 4px 4px 0px ${activePalette.vibrant}`,
                }}
              >
                {headline}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
