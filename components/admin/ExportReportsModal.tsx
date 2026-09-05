"use client";

import React, { useState } from "react";
import { Download, FileText, Check, X, Calendar, Layers, ShieldCheck } from "lucide-react";

export function ExportReportsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [reportType, setReportType] = useState<"FINANCIAL" | "CAMPAIGNS" | "CLIENTS">("FINANCIAL");
  const [format, setFormat] = useState<"CSV" | "PDF">("CSV");
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);

      const sampleData =
        reportType === "FINANCIAL"
          ? "Event Title,Client,Budget INR,Margin INR,Status\nSunburn EDM Arena,Percept Live,8500000,100000,ACTIVE\nRoyal Rajwada Wedding,Aditi Singhania,4500000,100000,ACTIVE\nZara Fashion Runway,Inditex Group,3200000,20000,ACTIVE"
          : "Client Name,Email,Total Spend INR,Lifetime Events\nAditi Singhania,aditi@heritagegroup.in,4500000,1\nPercept Live,promotions@perceptlive.in,8500000,1";

      const blob = new Blob([sampleData], { type: format === "CSV" ? "text/csv" : "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ViralPlug_${reportType}_Report_${new Date().toISOString().split("T")[0]}.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="comic-card max-w-md w-full bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FF0055] space-y-5 rounded-3xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-comic-pink" />
            <h3 className="font-display text-2xl uppercase text-white">
              Export Platform Reports
            </h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-neutral-400 uppercase mb-1 font-bold">Report Scope</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full bg-neutral-900 border border-neutral-700 text-white rounded p-2.5 font-mono"
            >
              <option value="FINANCIAL">Executive Financial & Margin Ledger</option>
              <option value="CAMPAIGNS">Complete Event Campaigns Archive</option>
              <option value="CLIENTS">Enterprise Client Directory & Lifetime Spend</option>
            </select>
          </div>

          <div>
            <label className="block text-neutral-400 uppercase mb-1 font-bold">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("CSV")}
                className={`py-2 rounded-xl font-bold border transition-all ${
                  format === "CSV"
                    ? "bg-comic-yellow text-comic-black border-black shadow-[2px_2px_0px_#000]"
                    : "bg-neutral-900 text-neutral-400 border-neutral-700"
                }`}
              >
                CSV Spreadsheet
              </button>
              <button
                type="button"
                onClick={() => setFormat("PDF")}
                className={`py-2 rounded-xl font-bold border transition-all ${
                  format === "PDF"
                    ? "bg-comic-pink text-white border-black shadow-[2px_2px_0px_#000]"
                    : "bg-neutral-900 text-neutral-400 border-neutral-700"
                }`}
              >
                Printable PDF
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="px-6 py-2.5 bg-comic-pink text-white font-heading font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Downloaded ✓</span>
              </>
            ) : isExporting ? (
              <span>Generating Report...</span>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
