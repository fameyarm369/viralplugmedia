"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  ArrowLeft,
  Flame,
  FileText,
  TrendingUp,
  Sparkles,
  Edit2,
  CheckCircle,
  AlertCircle,
  Eye,
  Sliders,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Building,
  User,
  Clock,
  MessageSquare,
  Paperclip,
  X,
  Layers,
  Users,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Campaign, CommunicationLog } from "@/lib/types";

export default function AdminClientDossierPage() {
  const params = useParams();
  const clientId = params?.id as string;

  const [dossier, setDossier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Single Campaign Deep Dive State
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Comms Composer Modal
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");

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

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject || !emailContent) return;

    try {
      const campId = dossier?.campaigns?.[0]?.id || "camp-req-101";
      await fetch(`/api/v1/admin/campaigns/${campId}/communications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "EMAIL",
          sender: "growth@viralplugmedia.com",
          recipient: dossier?.client?.email,
          subject: emailSubject,
          content: emailContent,
        }),
      });

      setMessage({ type: "success", text: "Official email sent and recorded in communication ledger!" });
      setShowEmailComposer(false);
      setEmailSubject("");
      setEmailContent("");
      await fetchDossier();
    } catch {
      setMessage({ type: "error", text: "Failed to send email" });
    }
  };

  if (loading) {
    return (
      <div className="comic-card p-12 text-center text-neutral-500 font-mono text-xs">
        Loading client profile dossier & communication history...
      </div>
    );
  }

  const { client, campaigns = [], emailHistory = [], eventsTimeline = [] } = dossier || {};
  const background = client?.backgroundInfo || {};

  return (
    <div className="space-y-8">
      {/* Top Banner & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Link href="/admin/clients">
            <button className="p-2 bg-neutral-900 border border-neutral-700 hover:border-white text-neutral-300 hover:text-white rounded-xl text-xs font-mono flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Directory</span>
            </button>
          </Link>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl uppercase text-white">
              {client?.name}
            </h1>
            <p className="text-xs font-mono text-comic-yellow font-bold mt-0.5">
              Enterprise Client Account • Lifetime Spend: ₹{Number(client?.totalSpendINR || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowEmailComposer(true)}
          className="px-4 py-2.5 bg-comic-cyan text-comic-black font-heading font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#00F0FF] hover:translate-x-0.5 flex items-center gap-2 w-fit"
        >
          <Mail className="w-4 h-4" />
          <span>Send Official Email</span>
        </button>
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

      {/* 4-Stat Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="comic-card p-5 bg-[#111218] border-2 border-comic-yellow shadow-[4px_4px_0px_#FFE600] space-y-1 rounded-2xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Lifetime Events</span>
          <p className="font-display text-3xl text-comic-yellow">{client?.totalEventsCount || campaigns.length}</p>
          <span className="text-[10px] font-mono text-neutral-500">Organized with ViralPlug</span>
        </div>

        <div className="comic-card p-5 bg-[#111218] border-2 border-comic-green shadow-[4px_4px_0px_#00E575] space-y-1 rounded-2xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Total Budget Spent</span>
          <p className="font-display text-3xl text-white">₹{Number(client?.totalSpendINR || 0).toLocaleString("en-IN")}</p>
          <span className="text-[10px] font-mono text-comic-green font-bold">Across All Events</span>
        </div>

        <div className="comic-card p-5 bg-[#111218] border-2 border-comic-cyan shadow-[4px_4px_0px_#00F0FF] space-y-1 rounded-2xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Communications</span>
          <p className="font-display text-3xl text-comic-cyan">{emailHistory.length} Emails</p>
          <span className="text-[10px] font-mono text-neutral-500">Exchanged in ledger</span>
        </div>

        <div className="comic-card p-5 bg-[#111218] border-2 border-comic-pink shadow-[4px_4px_0px_#FF0055] space-y-1 rounded-2xl">
          <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Account Status</span>
          <p className="font-display text-2xl text-comic-pink">Verified VIP</p>
          <span className="text-[10px] font-mono text-neutral-500">Member since {new Date(client?.createdAt).toLocaleDateString("en-IN")}</span>
        </div>
      </div>

      {/* Two Column Section: Client Background & Dossier + Complete Event History Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Client Background & Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-5">
            <h2 className="font-display text-xl uppercase tracking-wider text-white flex items-center gap-2 pb-3 border-b border-neutral-800">
              <User className="w-5 h-5 text-comic-cyan" />
              <span>Client Background & Dossier</span>
            </h2>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-neutral-500 text-[10px] uppercase block">Primary Contact Person</span>
                <p className="font-bold text-white text-sm">{client?.name}</p>
              </div>

              <div>
                <span className="text-neutral-500 text-[10px] uppercase block">Official Email</span>
                <p className="text-comic-cyan">{client?.email}</p>
              </div>

              <div>
                <span className="text-neutral-500 text-[10px] uppercase block">Direct Phone</span>
                <p className="text-neutral-200">{client?.phone || "+91 98201 54321"}</p>
              </div>

              <div>
                <span className="text-neutral-500 text-[10px] uppercase block">Company / Estate Entity</span>
                <p className="text-white font-bold">{client?.companyName || "Heritage Living & Entertainment"}</p>
              </div>

              <div>
                <span className="text-neutral-500 text-[10px] uppercase block">Industry Sector</span>
                <p className="text-neutral-300">{background.industry || "Luxury Hospitality & Private Estates"}</p>
              </div>

              <div>
                <span className="text-neutral-500 text-[10px] uppercase block">Client Preferences</span>
                <p className="text-neutral-300 leading-relaxed bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                  {background.preferences || "Prefers VIP WhatsApp updates and consolidated weekly executive email digests."}
                </p>
              </div>
            </div>
          </div>

          {/* Email Communication History */}
          <div className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="font-display text-xl uppercase tracking-wider text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-comic-yellow" />
                <span>Email Communication Ledger ({emailHistory.length})</span>
              </h2>
            </div>

            <div className="space-y-3">
              {emailHistory.map((em: CommunicationLog) => (
                <div key={em.id} className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-comic-cyan truncate max-w-[200px]">{em.subject || "Message Record"}</span>
                    <span className="text-[10px] text-neutral-500">{new Date(em.timestamp).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed line-clamp-2">{em.content}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500">
                    <span>From: {em.sender}</span>
                    {em.metadata?.attachments && <span className="text-comic-yellow font-bold">📎 Attachment Attached</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Complete Event History Timeline (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h2 className="font-display text-xl uppercase tracking-wider text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-comic-pink" />
                <span>Complete Event History Timeline ({campaigns.length})</span>
              </h2>
              <span className="text-xs font-mono text-neutral-400">Click card for Deep Dive</span>
            </div>

            <div className="space-y-4">
              {campaigns.map((camp: Campaign) => (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaign(camp)}
                  className="p-5 bg-neutral-900/90 rounded-2xl border-2 border-neutral-800 hover:border-comic-pink transition-all cursor-pointer space-y-3 shadow-[3px_3px_0px_#000]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="comic-badge text-[10px] bg-comic-yellow text-comic-black px-2 py-0.5 uppercase font-bold">
                          {camp.category}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            camp.status === "ACTIVE"
                              ? "bg-comic-green/20 text-comic-green"
                              : camp.status === "COMPLETED"
                              ? "bg-comic-cyan/20 text-comic-cyan"
                              : "bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          ● {camp.status}
                        </span>
                      </div>
                      <h3 className="font-display text-xl uppercase text-white hover:text-comic-pink transition-colors">
                        {camp.title}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="font-display text-xl text-white block">
                        ₹{Number(camp.budget_inr || 0).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] font-mono text-comic-pink font-bold">Click for Deep Dive →</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-[#111218] p-2.5 rounded-xl border border-neutral-800">
                    <div>
                      <span className="text-neutral-500 text-[10px] uppercase block">Event Date</span>
                      <span className="text-neutral-200 font-bold">{camp.event_date || camp.start_date || "2026-11-17"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] uppercase block">Location</span>
                      <span className="text-neutral-200 truncate block">{camp.location || "Udaipur"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 text-[10px] uppercase block">Steps / Progress</span>
                      <span className="text-comic-yellow font-bold">{camp.progress_pct || 0}% Complete</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SINGLE CAMPAIGN DEEP DIVE MODAL / VIEW
          ========================================================================= */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="comic-card max-w-4xl w-full p-6 sm:p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FF0055] space-y-6 rounded-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="comic-badge text-xs bg-comic-pink text-white px-2 py-0.5 uppercase font-bold">
                  CAMPAIGN DEEP DIVE DOSSIER
                </span>
                <h2 className="font-display text-3xl uppercase text-white mt-1">
                  {selectedCampaign.title}
                </h2>
                <p className="text-xs font-mono text-neutral-400">
                  Client: {selectedCampaign.client_name} • Total Budget: ₹{Number(selectedCampaign.budget_inr).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-neutral-400 hover:text-white p-2 rounded-lg bg-neutral-900 border border-neutral-700"
              >
                ✕
              </button>
            </div>

            {/* 1. Step-by-Step Progress & Completion Timeline */}
            <div className="space-y-3">
              <h3 className="font-display text-xl uppercase text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-comic-yellow" />
                <span>Step-by-Step Progress Timeline</span>
              </h3>

              {(!selectedCampaign.steps || selectedCampaign.steps.length === 0) ? (
                <p className="text-xs font-mono text-neutral-500 bg-neutral-900 p-4 rounded-xl">
                  No dynamic steps registered for this campaign yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {selectedCampaign.steps.map((st, idx) => (
                    <div key={st.id} className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${st.status === "COMPLETED" ? "bg-comic-green text-black" : "bg-neutral-800 text-neutral-400"}`}>
                          {st.status === "COMPLETED" ? "✓" : idx + 1}
                        </span>
                        <div>
                          <p className="font-heading font-bold text-white text-sm">{st.title}</p>
                          <p className="text-neutral-400 text-[11px]">{st.description}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${st.status === "COMPLETED" ? "bg-green-950 text-green-300" : "bg-yellow-950 text-yellow-300"}`}>
                          {st.status}
                        </span>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          Deadline: {st.deadline ? new Date(st.deadline).toLocaleDateString("en-IN") : "TBD"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Budget Breakdown for Specific Event */}
            {(() => {
              const eventBudget = Number(selectedCampaign.budgetINR || selectedCampaign.budget_inr || 0);
              return (
                <div className="space-y-3">
                  <h3 className="font-display text-xl uppercase text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-comic-green" />
                    <span>Event Financial & Budget Breakdown</span>
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs font-mono">
                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                      <span className="text-neutral-500 text-[10px] uppercase block">Venue & Staging</span>
                      <p className="font-display text-base text-white mt-1">₹{Number(selectedCampaign.budget_breakdown?.venueINR || eventBudget * 0.4).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                      <span className="text-neutral-500 text-[10px] uppercase block">Creative & Media</span>
                      <p className="font-display text-base text-comic-cyan mt-1">₹{Number(selectedCampaign.budget_breakdown?.creativeProductionINR || eventBudget * 0.3).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                      <span className="text-neutral-500 text-[10px] uppercase block">Talent & Artists</span>
                      <p className="font-display text-base text-comic-yellow mt-1">₹{Number(selectedCampaign.budget_breakdown?.talentAndArtistINR || eventBudget * 0.15).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                      <span className="text-neutral-500 text-[10px] uppercase block">Tech & Pyro</span>
                      <p className="font-display text-base text-comic-pink mt-1">₹{Number(selectedCampaign.budget_breakdown?.techAndLogisticsINR || eventBudget * 0.1).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                      <span className="text-neutral-500 text-[10px] uppercase block">Staff & Ops</span>
                      <p className="font-display text-base text-neutral-300 mt-1">₹{Number(selectedCampaign.budget_breakdown?.operationsAndStaffINR || eventBudget * 0.03).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                      <span className="text-neutral-500 text-[10px] uppercase block">Agency Margin</span>
                      <p className="font-display text-base text-comic-green mt-1">₹{Number(selectedCampaign.budget_breakdown?.marginINR || eventBudget * 0.02).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3. Assigned Team Members */}
            <div className="space-y-3">
              <h3 className="font-display text-xl uppercase text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-comic-cyan" />
                <span>Assigned Event Production Team</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(selectedCampaign.team_members || [
                  { id: "t1", name: "Vikramaditya Roy", role: "Event Director", email: "vikram@viralplug.com" },
                  { id: "t2", name: "Ananya Sharma", role: "Creative Lead", email: "ananya@viralplug.com" },
                ]).map((tm: any, idx: number) => (
                  <div key={idx} className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center gap-3 text-xs font-mono">
                    <div className="w-8 h-8 rounded-full bg-comic-yellow text-comic-black flex items-center justify-center font-bold">
                      {tm.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">{tm.name}</p>
                      <p className="text-[11px] text-neutral-400">{tm.role} • {tm.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-6 py-2 bg-comic-pink text-white font-heading font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]"
              >
                Close Deep Dive Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      {showEmailComposer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#00F0FF] space-y-5 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-comic-cyan" />
                <span>Send Official Client Email</span>
              </h3>
              <button onClick={() => setShowEmailComposer(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1">To</label>
                <input
                  type="text"
                  readOnly
                  value={`${client?.name} <${client?.email}>`}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded p-2 text-xs text-neutral-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 uppercase mb-1 font-bold">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stagecraft Milestone 2 Sign-off & Audio Riders"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-neutral-300 mb-1 font-bold uppercase">Email Content *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Type your official communication message to the client..."
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailComposer(false)}
                  className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-comic-cyan text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
                >
                  Dispatch Email →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
