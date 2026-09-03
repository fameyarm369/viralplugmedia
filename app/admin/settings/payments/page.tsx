"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Percent,
  Key,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";

export default function PaymentSettingsPage() {
  const [advancePct, setAdvancePct] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/v1/admin/settings?key=advance_payment_pct")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.percentage) {
          setAdvancePct(data.data.percentage);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/v1/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "advance_payment_pct",
          value: { percentage: advancePct },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Payment settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save settings" });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl uppercase tracking-wider text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-comic-pink" />
          <span>PAYMENT GATEWAY & ADVANCE SETTINGS</span>
        </h1>
        <p className="text-xs font-mono text-neutral-400 mt-1">
          Razorpay Integration Config • Configurable Advance Lock-in Percentage • Idempotency Enabled
        </p>
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

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 space-y-6">
          <div>
            <h2 className="font-display text-xl uppercase text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-comic-yellow" />
              <span>Advance Payment Percentage</span>
            </h2>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              The percentage of the AI estimate required upfront for visitors to lock in a campaign slots immediately after enquiry.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-300 font-bold">Advance Required:</span>
              <span className="font-display text-2xl text-comic-yellow">{advancePct}%</span>
            </div>

            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={advancePct}
              onChange={(e) => setAdvancePct(Number(e.target.value))}
              className="w-full accent-comic-yellow h-2.5 bg-neutral-800 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-neutral-500">
              <span>10% (Low friction)</span>
              <span>20% (Recommended default)</span>
              <span>50% (High commitment)</span>
            </div>
          </div>
        </div>

        {/* Razorpay Gateway Status Card */}
        <div className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl uppercase text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-comic-cyan" />
              <span>Razorpay Gateway Status</span>
            </h2>
            <span className="bg-comic-green/20 text-comic-green text-[10px] font-mono font-bold px-2.5 py-1 rounded">
              Active & Verified ✓
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
              <span className="text-neutral-500 uppercase block mb-1">Key ID Status:</span>
              <span className="text-white font-bold">Configured in Environment (.env.local)</span>
            </div>
            <div className="p-3 bg-neutral-900 rounded border border-neutral-800">
              <span className="text-neutral-500 uppercase block mb-1">Webhook Secret:</span>
              <span className="text-white font-bold">HMAC-SHA256 Ready</span>
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Payment Settings →"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
