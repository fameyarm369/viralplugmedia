"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  LayoutGrid,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Eye,
  Sparkles,
  RefreshCw,
  UploadCloud,
  Sliders,
  Palette,
  Calendar,
  Layers,
  Clock,
  Check,
  X,
  Play,
  Share2,
  Flame,
  ArrowRight,
} from "lucide-react";
import { FestivalTheme, LandingPageConfig, ColorPalette } from "@/lib/types";

export default function LandingPageControllerPage() {
  const [activeTab, setActiveTab] = useState<"MEDIA" | "COLORS" | "FESTIVALS">("MEDIA");
  const [mediaSection, setMediaSection] = useState<"HERO" | "FEATURES" | "TESTIMONIALS" | "GALLERY">("HERO");
  const [landingConfig, setLandingConfig] = useState<LandingPageConfig | null>(null);
  const [festivalThemes, setFestivalThemes] = useState<FestivalTheme[]>([]);
  const [activeTheme, setActiveTheme] = useState<FestivalTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Live Preview Modal
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  // Color Gradient & Palette Engine State
  const [selectedGradient, setSelectedGradient] = useState("linear-gradient(135deg, #FFE600 0%, #FF0055 50%, #00F0FF 100%)");
  const [gradientAngle, setGradientAngle] = useState(135);
  const [colorStop1, setColorStop1] = useState("#FFE600");
  const [colorStop2, setColorStop2] = useState("#FF0055");
  const [colorStop3, setColorStop3] = useState("#00F0FF");
  const [activeHex, setActiveHex] = useState("#FFE600");
  const [activeRgb, setActiveRgb] = useState("rgb(255, 230, 0)");
  const [activeHsl, setActiveHsl] = useState("hsl(54, 100%, 50%)");

  // Custom Festival Theme Modal
  const [showCustomFestivalModal, setShowCustomFestivalModal] = useState(false);
  const [customFestivalForm, setCustomFestivalForm] = useState({
    name: "",
    festivalType: "CUSTOM" as FestivalTheme["festivalType"],
    description: "",
    primaryColor: "#FF5E00",
    secondaryColor: "#7928CA",
    bannerHeadline: "SPECIAL FESTIVAL EVENT CELEBRATION",
    tagline: "High-voltage stagecraft and exclusive creator campaigns.",
    stickerEmoji: "🎉",
    badgeText: "FESTIVAL SPECIAL",
    autoExpiryDate: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0],
  });

  // Media Upload State
  const [dragOver, setDragOver] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, themesRes] = await Promise.all([
        fetch("/api/v1/admin/landing-controller"),
        fetch("/api/v1/admin/festival-themes"),
      ]);
      const configData = await configRes.json();
      const themesData = await themesRes.json();

      if (configData.success) setLandingConfig(configData.data);
      if (themesData.success) {
        setFestivalThemes(themesData.data);
        setActiveTheme(themesData.activeTheme || themesData.data.find((t: any) => t.isActive));
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load landing page configuration" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update gradient dynamically when stops or angle change
  useEffect(() => {
    const grad = `linear-gradient(${gradientAngle}deg, ${colorStop1} 0%, ${colorStop2} 50%, ${colorStop3} 100%)`;
    setSelectedGradient(grad);
  }, [gradientAngle, colorStop1, colorStop2, colorStop3]);

  // Activate Festival Theme
  const handleActivateTheme = async (theme: FestivalTheme) => {
    try {
      const res = await fetch("/api/v1/admin/festival-themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ACTIVATE_THEME", themeId: theme.id }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Theme "${theme.name}" is now LIVE on public landing page!` });
        setActiveTheme(theme);
        await fetchData();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to activate theme" });
    }
  };

  // Create Custom Festival Theme
  const handleCreateCustomFestival = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/festival-themes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customFestivalForm.name,
          festivalType: customFestivalForm.festivalType,
          description: customFestivalForm.description,
          colorScheme: {
            gradient: `linear-gradient(135deg, ${customFestivalForm.primaryColor} 0%, ${customFestivalForm.secondaryColor} 100%)`,
            primary: customFestivalForm.primaryColor,
            secondary: customFestivalForm.secondaryColor,
            accent: customFestivalForm.primaryColor,
            textContrast: "#FFFFFF",
          },
          elements: {
            bannerHeadline: customFestivalForm.bannerHeadline,
            tagline: customFestivalForm.tagline,
            stickerEmoji: customFestivalForm.stickerEmoji,
            badgeText: customFestivalForm.badgeText,
          },
          autoExpiryDate: customFestivalForm.autoExpiryDate ? `${customFestivalForm.autoExpiryDate}T23:59:59Z` : null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Custom theme "${customFestivalForm.name}" created successfully!` });
        setShowCustomFestivalModal(false);
        await fetchData();
      }
    } catch {
      setMessage({ type: "error", text: "Creation failed" });
    }
  };

  // Add Media Item to Landing Section
  const handleAddMediaItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landingConfig || !uploadUrl) return;

    const newConfig = { ...landingConfig };
    if (mediaSection === "HERO") {
      newConfig.hero.mediaUrls.unshift(uploadUrl);
    } else if (mediaSection === "GALLERY") {
      newConfig.gallery.unshift({
        title: uploadTitle || "Concert Stage Highlight",
        category: "Festivals",
        mediaUrl: uploadUrl,
        reachStat: "2.5M+ Views",
      });
    }

    try {
      const res = await fetch("/api/v1/admin/landing-controller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (data.success) {
        setLandingConfig(newConfig);
        setShowAddMediaModal(false);
        setUploadTitle("");
        setUploadUrl("");
        setMessage({ type: "success", text: `Media asset published to ${mediaSection} section!` });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to upload media asset" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-comic-cyan text-comic-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000] mb-1">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>HOMEPAGE MASTER CONTROLLER</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-white">
            LANDING PAGE CONTROLLER & THEME STUDIO
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Drag & Drop Media Management • Full-Spectrum Gradient Engine • Festival Theme Extensions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLivePreviewModal(true)}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl border border-neutral-700 text-xs font-mono flex items-center gap-2 font-bold shadow-[2px_2px_0px_#000]"
          >
            <Eye className="w-4 h-4 text-comic-cyan" />
            <span>Open Public Site Live Preview</span>
          </button>

          <button
            onClick={fetchData}
            className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-xl text-neutral-300 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center justify-between text-xs font-mono ${
            message.type === "success"
              ? "bg-green-950/80 border-green-500 text-green-300"
              : "bg-red-950/80 border-red-500 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Studio Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tab 1: Media Management */}
        <button
          onClick={() => setActiveTab("MEDIA")}
          className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
            activeTab === "MEDIA"
              ? "bg-[#16131F] border-comic-cyan shadow-[5px_5px_0px_#00F0FF]"
              : "bg-[#111218] border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <div className="space-y-1">
            <span className="font-heading font-black text-xs uppercase tracking-wider text-comic-cyan block">
              Section 1
            </span>
            <h3 className="font-display text-2xl uppercase text-white">Media Management</h3>
            <p className="text-[11px] font-mono text-neutral-400">Hero, Features, Testimonials, Gallery</p>
          </div>
          <UploadCloud className="w-8 h-8 text-comic-cyan/40 shrink-0" />
        </button>

        {/* Tab 2: Color & Design Control */}
        <button
          onClick={() => setActiveTab("COLORS")}
          className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
            activeTab === "COLORS"
              ? "bg-[#1B1812] border-comic-yellow shadow-[5px_5px_0px_#FFE600]"
              : "bg-[#111218] border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <div className="space-y-1">
            <span className="font-heading font-black text-xs uppercase tracking-wider text-comic-yellow block">
              Section 2
            </span>
            <h3 className="font-display text-2xl uppercase text-white">Color & Gradient Engine</h3>
            <p className="text-[11px] font-mono text-neutral-400">Full-spectrum HEX/RGB/HSL picker</p>
          </div>
          <Palette className="w-8 h-8 text-comic-yellow/40 shrink-0" />
        </button>

        {/* Tab 3: Festival Themes Extension */}
        <button
          onClick={() => setActiveTab("FESTIVALS")}
          className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
            activeTab === "FESTIVALS"
              ? "bg-[#1E1118] border-comic-pink shadow-[5px_5px_0px_#FF0055]"
              : "bg-[#111218] border-neutral-800 hover:border-neutral-700"
          }`}
        >
          <div className="space-y-1">
            <span className="font-heading font-black text-xs uppercase tracking-wider text-comic-pink block">
              Section 3
            </span>
            <h3 className="font-display text-2xl uppercase text-white">Festival Extensions</h3>
            <p className="text-[11px] font-mono text-neutral-400">Rakhi, Diwali, Eid, Christmas & Auto-Expiry</p>
          </div>
          <Sparkles className="w-8 h-8 text-comic-pink/40 shrink-0" />
        </button>
      </div>

      {/* =========================================================================
          TAB 1: MEDIA MANAGEMENT (HERO, FEATURES, TESTIMONIALS, GALLERY)
          ========================================================================= */}
      {activeTab === "MEDIA" && (
        <div className="space-y-6">
          {/* Section Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 p-2 bg-[#111218] rounded-2xl border border-neutral-800">
            {(["HERO", "FEATURES", "TESTIMONIALS", "GALLERY"] as const).map((sec) => (
              <button
                key={sec}
                onClick={() => setMediaSection(sec)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  mediaSection === sec
                    ? "bg-comic-cyan text-comic-black"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {sec} Section
              </button>
            ))}
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              setShowAddMediaModal(true);
            }}
            className={`comic-card p-8 text-center rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
              dragOver ? "border-comic-cyan bg-comic-cyan/10" : "border-neutral-700 bg-[#111218] hover:border-neutral-500"
            }`}
            onClick={() => setShowAddMediaModal(true)}
          >
            <UploadCloud className="w-12 h-12 text-comic-cyan mx-auto mb-2 animate-bounce" />
            <h3 className="font-display text-xl uppercase text-white">
              Drag & Drop Videos or Photos to {mediaSection} Section
            </h3>
            <p className="text-xs font-mono text-neutral-400 mt-1 max-w-md mx-auto">
              Drop 4K videos (.mp4), high-res photographs (.png, .jpg), or click to open file chooser dialog.
            </p>
            <button className="mt-4 px-4 py-2 bg-comic-cyan text-comic-black font-heading font-black text-xs uppercase rounded-xl border border-black shadow-[2px_2px_0px_#000]">
              + Choose Media File
            </button>
          </div>

          {/* Section Content Grid */}
          <div className="space-y-4">
            <h3 className="font-display text-xl uppercase tracking-wider text-white">
              Current {mediaSection} Assets Live on Public Site:
            </h3>

            {mediaSection === "HERO" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(landingConfig?.hero.mediaUrls || []).map((url, idx) => (
                  <div key={idx} className="comic-card p-4 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-3">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900">
                      <img src={url} alt="Hero Asset" className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 bg-comic-black text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        Hero Slot #{idx + 1}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400 truncate max-w-[200px]">{url}</span>
                      <span className="text-comic-green font-bold">Active in Hero</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mediaSection === "GALLERY" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(landingConfig?.gallery || []).map((item, idx) => (
                  <div key={idx} className="comic-card p-4 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-2">
                    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-neutral-700 bg-neutral-900">
                      <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                      <span className="comic-badge text-[10px] bg-comic-yellow text-comic-black px-2 py-0.5 uppercase absolute top-2 left-2">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-white truncate">{item.title}</h4>
                    <span className="text-xs font-mono text-comic-cyan font-bold block">{item.reachStat}</span>
                  </div>
                ))}
              </div>
            )}

            {mediaSection === "FEATURES" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(landingConfig?.features || []).map((feat, idx) => (
                  <div key={idx} className="comic-card p-5 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-2">
                    <span className="comic-badge text-[10px] bg-comic-pink text-white px-2 py-0.5 uppercase">
                      Feature #{idx + 1}
                    </span>
                    <h4 className="font-display text-lg uppercase text-white">{feat.title}</h4>
                    <p className="text-xs font-mono text-neutral-400">{feat.description}</p>
                  </div>
                ))}
              </div>
            )}

            {mediaSection === "TESTIMONIALS" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(landingConfig?.testimonials || []).map((t, idx) => (
                  <div key={idx} className="comic-card p-5 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-3">
                    <p className="text-xs font-mono text-neutral-300 italic">"{t.quote}"</p>
                    <div className="flex items-center justify-between text-xs font-mono border-t border-neutral-800 pt-2">
                      <span className="font-bold text-white">{t.author}</span>
                      <span className="text-comic-yellow">{t.company}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: COLOR & DESIGN CONTROL (FULL-SPECTRUM GRADIENTS & PALETTES)
          ========================================================================= */}
      {activeTab === "COLORS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Color Gradient & Spectrum Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-5">
                <h3 className="font-display text-xl uppercase text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-comic-yellow" />
                  <span>Full-Spectrum Gradient Studio</span>
                </h3>

                {/* Gradient Live Banner Preview */}
                <div
                  className="h-32 rounded-2xl border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center p-6 text-center transition-all"
                  style={{ background: selectedGradient }}
                >
                  <span className="font-display text-2xl sm:text-3xl uppercase text-black bg-white/90 px-4 py-1.5 rounded-xl border border-black shadow-[2px_2px_0px_#000]">
                    LIVE SPECTRUM PREVIEW
                  </span>
                </div>

                {/* Angle Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400 font-bold">Gradient Angle:</span>
                    <span className="text-comic-yellow font-bold">{gradientAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradientAngle}
                    onChange={(e) => setGradientAngle(parseInt(e.target.value, 10))}
                    className="w-full accent-comic-yellow cursor-pointer"
                  />
                </div>

                {/* 3 Color Stop Pickers */}
                <div className="grid grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                    <span className="text-[10px] text-neutral-400 uppercase block">Color Stop 1</span>
                    <input
                      type="color"
                      value={colorStop1}
                      onChange={(e) => { setColorStop1(e.target.value); setActiveHex(e.target.value); }}
                      className="w-full h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={colorStop1}
                      onChange={(e) => setColorStop1(e.target.value)}
                      className="w-full bg-neutral-800 text-center text-white rounded p-1 text-xs uppercase"
                    />
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                    <span className="text-[10px] text-neutral-400 uppercase block">Color Stop 2</span>
                    <input
                      type="color"
                      value={colorStop2}
                      onChange={(e) => { setColorStop2(e.target.value); setActiveHex(e.target.value); }}
                      className="w-full h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={colorStop2}
                      onChange={(e) => setColorStop2(e.target.value)}
                      className="w-full bg-neutral-800 text-center text-white rounded p-1 text-xs uppercase"
                    />
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                    <span className="text-[10px] text-neutral-400 uppercase block">Color Stop 3</span>
                    <input
                      type="color"
                      value={colorStop3}
                      onChange={(e) => { setColorStop3(e.target.value); setActiveHex(e.target.value); }}
                      className="w-full h-10 rounded cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={colorStop3}
                      onChange={(e) => setColorStop3(e.target.value)}
                      className="w-full bg-neutral-800 text-center text-white rounded p-1 text-xs uppercase"
                    />
                  </div>
                </div>

                {/* HEX / RGB / HSL Readout Card */}
                <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-neutral-900 p-3 rounded-xl border border-neutral-800">
                  <div>
                    <span className="text-neutral-500 text-[10px] block">HEX</span>
                    <span className="text-comic-yellow font-bold">{activeHex}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">RGB</span>
                    <span className="text-comic-cyan font-bold">{activeRgb}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">HSL</span>
                    <span className="text-comic-pink font-bold">{activeHsl}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Presets & Theme Switcher (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-4">
                <h3 className="font-display text-xl uppercase text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-comic-cyan" />
                  <span>Theme Style Presets</span>
                </h3>

                <div className="space-y-3">
                  {[
                    { name: "Electric Cyberpunk", s1: "#00F0FF", s2: "#FF0055", s3: "#FFE600", angle: 135 },
                    { name: "Royal Saffron Gold", s1: "#FFE600", s2: "#FF7700", s3: "#7928CA", angle: 135 },
                    { name: "Emerald Banquet", s1: "#059669", s2: "#10B981", s3: "#F59E0B", angle: 135 },
                    { name: "Midnight Crimson", s1: "#DC2626", s2: "#111218", s3: "#7928CA", angle: 180 },
                  ].map((pre, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setColorStop1(pre.s1);
                        setColorStop2(pre.s2);
                        setColorStop3(pre.s3);
                        setGradientAngle(pre.angle);
                      }}
                      className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 hover:border-comic-yellow cursor-pointer flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full border border-black shrink-0"
                          style={{ background: `linear-gradient(135deg, ${pre.s1}, ${pre.s2}, ${pre.s3})` }}
                        />
                        <span className="font-bold text-white">{pre.name}</span>
                      </div>
                      <span className="text-comic-yellow text-[11px] font-bold">Apply Preset →</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: FESTIVAL / EVENT THEME EXTENSION
          ========================================================================= */}
      {activeTab === "FESTIVALS" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-comic-pink" />
                <span>FESTIVAL & CELEBRATION THEME EXTENSIONS</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                One-click seasonal skins with auto-expiry timers, festive badges, meme graphics, and custom creator.
              </p>
            </div>

            <button
              onClick={() => setShowCustomFestivalModal(true)}
              className="px-4 py-2.5 bg-comic-pink text-white font-heading font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-2 w-fit"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Custom Festival Skin</span>
            </button>
          </div>

          {/* Active Theme Notice Banner */}
          {activeTheme && (
            <div className="p-5 bg-gradient-to-r from-purple-950/60 to-pink-950/60 border-2 border-comic-pink rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_#FF0055]">
              <div className="flex items-center gap-3.5">
                <div className="text-3xl">{activeTheme.elements?.stickerEmoji || "🎉"}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-comic-pink text-white px-2 py-0.5 rounded font-bold uppercase">
                      ACTIVE ON PUBLIC LANDING PAGE
                    </span>
                    <span className="text-xs font-mono text-comic-yellow font-bold">
                      {activeTheme.autoExpiryDate ? `Auto-Expires: ${new Date(activeTheme.autoExpiryDate).toLocaleDateString("en-IN")}` : "No Expiry"}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl uppercase text-white mt-0.5">
                    {activeTheme.name}
                  </h3>
                  <p className="text-xs font-mono text-neutral-300">
                    {activeTheme.elements?.bannerHeadline}
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono bg-comic-green/20 text-comic-green font-bold px-3 py-1 rounded-full border border-comic-green/40">
                ● Live Streaming
              </span>
            </div>
          )}

          {/* Festival Themes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {festivalThemes.map((theme) => {
              const isCurrent = activeTheme?.id === theme.id;

              return (
                <div
                  key={theme.id}
                  className={`comic-card p-5 bg-[#111218] border-2 rounded-2xl flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_#000] ${
                    isCurrent ? "border-comic-pink shadow-[5px_5px_0px_#FF0055]" : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Visual Banner Header */}
                    <div
                      className="h-24 rounded-xl border border-black flex items-center justify-center p-3 text-center relative overflow-hidden"
                      style={{ background: theme.colorScheme?.gradient || "linear-gradient(135deg, #FF0055, #FFE600)" }}
                    >
                      <span className="text-3xl">{theme.elements?.stickerEmoji || "🎉"}</span>
                      <span className="comic-badge text-[9px] bg-comic-black text-white px-2 py-0.5 uppercase absolute top-2 right-2">
                        {theme.festivalType}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-display text-xl uppercase text-white truncate">{theme.name}</h4>
                      <p className="text-xs font-mono text-neutral-400 mt-1 line-clamp-2">{theme.description}</p>
                    </div>

                    <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Badge Text:</span>
                        <span className="text-comic-yellow font-bold">{theme.elements?.badgeText}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Auto-Expiry:</span>
                        <span className="text-neutral-300">{theme.autoExpiryDate ? new Date(theme.autoExpiryDate).toLocaleDateString("en-IN") : "Permanent"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800">
                    <button
                      disabled={isCurrent}
                      onClick={() => handleActivateTheme(theme)}
                      className={`w-full py-2 rounded-xl text-xs font-heading font-black uppercase border transition-all ${
                        isCurrent
                          ? "bg-comic-pink text-white border-black"
                          : "bg-neutral-800 text-white border-neutral-700 hover:bg-comic-pink hover:text-white"
                      }`}
                    >
                      {isCurrent ? "Active Theme ✓" : "Apply to Landing Page →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          LIVE PREVIEW MODAL (PUBLIC SITE SIMULATOR)
          ========================================================================= */}
      {showLivePreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
          <div className="comic-card max-w-5xl w-full p-6 bg-[#0A0A0C] border-[4px] border-comic-black shadow-[12px_12px_0px_#00F0FF] space-y-6 rounded-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-comic-green animate-pulse" />
                <span className="font-mono text-xs text-comic-cyan font-bold uppercase">
                  PUBLIC SITE LIVE PREVIEW SIMULATOR
                </span>
              </div>
              <button
                onClick={() => setShowLivePreviewModal(false)}
                className="text-neutral-400 hover:text-white font-mono text-lg bg-neutral-900 p-2 rounded-xl border border-neutral-700"
              >
                ✕
              </button>
            </div>

            {/* Active Festival Banner in Preview */}
            {activeTheme && (
              <div
                className="p-4 rounded-2xl border-2 border-black flex items-center justify-between text-black font-heading font-black text-sm uppercase shadow-[3px_3px_0px_#000]"
                style={{ background: activeTheme.colorScheme?.gradient }}
              >
                <span>{activeTheme.elements?.stickerEmoji} {activeTheme.elements?.bannerHeadline}</span>
                <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-mono font-bold">
                  {activeTheme.elements?.badgeText}
                </span>
              </div>
            )}

            {/* Hero Preview */}
            <div className="p-8 rounded-3xl bg-[#111218] border-2 border-neutral-800 space-y-4 text-center">
              <span className="comic-badge text-xs bg-comic-yellow text-comic-black px-3 py-1 font-black uppercase">
                {landingConfig?.hero.badgeText || "VIRAL PLUG MEDIA"}
              </span>
              <h1 className="font-display text-4xl sm:text-5xl uppercase text-white max-w-2xl mx-auto">
                {landingConfig?.hero.headline || "WE TURN EVENTS INTO VIRAL CULTURAL PHENOMENONS"}
              </h1>
              <p className="text-xs font-mono text-neutral-400 max-w-lg mx-auto">
                {landingConfig?.hero.subheadline || "India's #1 Event Stagecraft, Celebrity Experience & D2C Viral Media Accelerator"}
              </p>

              <div className="pt-4 flex justify-center gap-3">
                <button className="px-6 py-2.5 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]">
                  Explore Services →
                </button>
                <button className="px-6 py-2.5 bg-neutral-900 text-white font-mono text-xs rounded-xl border border-neutral-700">
                  Book VIP Consultation
                </button>
              </div>
            </div>

            {/* Close Preview */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowLivePreviewModal(false)}
                className="px-6 py-2 bg-comic-cyan text-comic-black font-heading font-black text-xs uppercase rounded-xl border-2 border-black"
              >
                Exit Simulator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {showAddMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#00F0FF] space-y-5 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white">
                Add Asset to {mediaSection} Section
              </h3>
              <button onClick={() => setShowAddMediaModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddMediaItem} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">Asset Title</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Palace 4K Stage Setup"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">Media URL (Photo / Video MP4) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/... or https://assets.viralplugmedia.com/..."
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddMediaModal(false)} className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-comic-cyan text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black">
                  Publish to {mediaSection} →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Festival Creator Modal */}
      {showCustomFestivalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FF0055] space-y-5 rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-comic-pink" />
                <span>Create Custom Festival Skin</span>
              </h3>
              <button onClick={() => setShowCustomFestivalModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCustomFestival} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">Festival Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navratri Dandiya Night Blitz"
                  value={customFestivalForm.name}
                  onChange={(e) => setCustomFestivalForm({ ...customFestivalForm, name: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">Primary Color</label>
                  <input
                    type="color"
                    value={customFestivalForm.primaryColor}
                    onChange={(e) => setCustomFestivalForm({ ...customFestivalForm, primaryColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">Secondary Color</label>
                  <input
                    type="color"
                    value={customFestivalForm.secondaryColor}
                    onChange={(e) => setCustomFestivalForm({ ...customFestivalForm, secondaryColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer bg-transparent border-0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">Banner Headline *</label>
                <input
                  type="text"
                  required
                  value={customFestivalForm.bannerHeadline}
                  onChange={(e) => setCustomFestivalForm({ ...customFestivalForm, bannerHeadline: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">Sticker Emoji</label>
                  <input
                    type="text"
                    value={customFestivalForm.stickerEmoji}
                    onChange={(e) => setCustomFestivalForm({ ...customFestivalForm, stickerEmoji: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono text-center text-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">Auto-Expiry Date</label>
                  <input
                    type="date"
                    value={customFestivalForm.autoExpiryDate}
                    onChange={(e) => setCustomFestivalForm({ ...customFestivalForm, autoExpiryDate: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCustomFestivalModal(false)} className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-comic-pink text-white font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]">
                  Create Theme →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
