"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  Inbox,
  Clock,
  Archive,
  ChevronDown,
  ChevronUp,
  FileText,
  UploadCloud,
  FileCheck,
  MessageSquare,
  Sparkles,
  Sliders,
  DollarSign,
  Calendar,
  MapPin,
  X,
  Share2,
  Download,
  Check,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Campaign, CampaignStatus, CampaignStep, TaskType } from "@/lib/types";

export default function AdminCampaignsPage() {
  const [activeTab, setActiveTab] = useState<"PASSIVE" | "ACTIVE" | "COMPLETED">("ACTIVE");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Search & Filters for Completed Archive
  const [archiveCategory, setArchiveCategory] = useState("ALL");
  const [archiveStatus, setArchiveStatus] = useState("ALL");
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveLocation, setArchiveLocation] = useState("");
  const [archiveMinBudget, setArchiveMinBudget] = useState("");
  const [archiveMaxBudget, setArchiveMaxBudget] = useState("");
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAcceptRejectModal, setShowAcceptRejectModal] = useState<{
    campaign: Campaign;
    action: "ACCEPT" | "REJECT";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Schedule fully booked on target date");

  // Sub-option Modals for Passive Requests
  const [showFileRequestModal, setShowFileRequestModal] = useState<Campaign | null>(null);
  const [fileRequestNotes, setFileRequestNotes] = useState("Please upload the high-resolution event venue layout and government permission certificates.");

  const [showInfoRequestModal, setShowInfoRequestModal] = useState<Campaign | null>(null);
  const [infoRequestText, setInfoRequestText] = useState("Please confirm estimated guest count, preferred stage dimension, and artist genre preferences.");

  const [showCriteriaModal, setShowCriteriaModal] = useState<Campaign | null>(null);
  const [newCriteriaLabel, setNewCriteriaLabel] = useState("");
  const [newCriteriaValue, setNewCriteriaValue] = useState("");

  // Dynamic Step Modals for Active Campaigns
  const [showAddStepModal, setShowAddStepModal] = useState<Campaign | null>(null);
  const [newStepForm, setNewStepForm] = useState<{
    title: string;
    description: string;
    taskType: TaskType;
    deadline: string;
  }>({
    title: "",
    description: "",
    taskType: "PHOTO_UPLOAD",
    deadline: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
  });

  // Create Campaign Form
  const [createForm, setCreateForm] = useState({
    title: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    category: "Weddings",
    eventType: "Grand Wedding Gala",
    requestType: "Inbound Elite Request",
    status: "PASSIVE_REQUEST" as CampaignStatus,
    budgetINR: "3500000",
    eventDate: new Date(Date.now() + 86400000 * 45).toISOString().split("T")[0],
    location: "Udaipur, Rajasthan",
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/campaigns");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load campaigns from database" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Split into categories
  const passiveRequests = campaigns.filter(
    (c) => c.status === "PASSIVE_REQUEST" || c.status === "PROPOSAL_REVIEW" || c.status === "DRAFT"
  );
  const activeCampaigns = campaigns.filter((c) => c.status === "ACTIVE");
  const completedCampaigns = campaigns.filter(
    (c) => c.status === "COMPLETED" || c.status === "CANCELLED" || c.status === "REJECTED"
  );

  // Filtered Archive
  const filteredArchive = completedCampaigns.filter((c) => {
    if (archiveCategory !== "ALL" && c.category?.toLowerCase() !== archiveCategory.toLowerCase()) return false;
    if (archiveStatus !== "ALL" && c.status !== archiveStatus) return false;
    if (archiveSearch) {
      const q = archiveSearch.toLowerCase();
      const clientName = (c.client_name || c.clientName || "").toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !clientName.includes(q)) return false;
    }
    if (archiveLocation && !c.location?.toLowerCase().includes(archiveLocation.toLowerCase())) return false;
    const budget = c.budget_inr ?? c.budgetINR ?? 0;
    if (archiveMinBudget && budget < parseFloat(archiveMinBudget)) return false;
    if (archiveMaxBudget && budget > parseFloat(archiveMaxBudget)) return false;
    return true;
  });

  // Action Handlers
  const handleAcceptReject = async () => {
    if (!showAcceptRejectModal) return;
    const { campaign, action } = showAcceptRejectModal;
    const newStatus = action === "ACCEPT" ? "ACTIVE" : "REJECTED";

    try {
      const res = await fetch(`/api/v1/admin/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          cancellation_reason: action === "REJECT" ? rejectionReason : null,
          progress_pct: action === "ACCEPT" ? 15 : 0,
          current_step_name: action === "ACCEPT" ? "Stage 1: Production Blueprint" : "Request Rejected",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `Campaign ${action === "ACCEPT" ? "accepted and promoted to Active Ongoing" : "rejected"} successfully.`,
        });
        setShowAcceptRejectModal(null);
        await fetchCampaigns();
      }
    } catch {
      setMessage({ type: "error", text: "Action failed. Please try again." });
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "New campaign created and entered into pipeline!" });
        setShowCreateModal(false);
        await fetchCampaigns();
      } else {
        setMessage({ type: "error", text: data.error || "Creation failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error during campaign launch" });
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddStepModal) return;

    try {
      const res = await fetch(`/api/v1/admin/campaigns/${showAddStepModal.id}/steps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStepForm),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Step '${newStepForm.title}' added to campaign!` });
        setShowAddStepModal(null);
        setNewStepForm({
          title: "",
          description: "",
          taskType: "PHOTO_UPLOAD",
          deadline: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
        });
        await fetchCampaigns();
      }
    } catch {
      setMessage({ type: "error", text: "Failed to add step" });
    }
  };

  const handleToggleStepStatus = async (campaignId: string, stepId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    try {
      const res = await fetch(`/api/v1/admin/campaigns/${campaignId}/steps`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchCampaigns();
      }
    } catch {}
  };

  const handleDeleteStep = async (campaignId: string, stepId: string) => {
    if (!confirm("Are you sure you want to remove this step?")) return;
    try {
      await fetch(`/api/v1/admin/campaigns/${campaignId}/steps?stepId=${stepId}`, {
        method: "DELETE",
      });
      await fetchCampaigns();
    } catch {}
  };

  const handleAddCustomCriteria = async () => {
    if (!showCriteriaModal || !newCriteriaLabel) return;
    const currentCriteria = showCriteriaModal.custom_criteria || [];
    const updated = [
      ...currentCriteria,
      {
        id: `crit-${Date.now()}`,
        label: newCriteriaLabel,
        value: newCriteriaValue || "Custom Requirement Specified",
        isRequired: true,
        isFulfilled: false,
      },
    ];

    try {
      await fetch(`/api/v1/admin/campaigns/${showCriteriaModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custom_criteria: updated }),
      });
      setMessage({ type: "success", text: "Custom criteria added to request!" });
      setNewCriteriaLabel("");
      setNewCriteriaValue("");
      setShowCriteriaModal(null);
      await fetchCampaigns();
    } catch {}
  };

  const openWhatsApp = (camp: Campaign, customMsg?: string) => {
    const phone = (camp.client_phone || camp.clientPhone || "").replace(/[^0-9]/g, "") || "919876543210";
    const clientName = camp.client_name || camp.clientName || "Valued Client";
    const msg = encodeURIComponent(
      customMsg ||
        `Hello ${clientName}! This is ViralPlug Media Event Operations regarding your "${camp.title}" campaign request.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const exportArchiveCSV = () => {
    const headers = ["Campaign Title", "Client Name", "Category", "Event Date", "Budget (INR)", "Status", "Location"];
    const rows = filteredArchive.map((c) => [
      `"${c.title.replace(/"/g, '""')}"`,
      `"${(c.client_name || c.clientName || "").replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.eventDate || c.event_date || c.startDate || c.start_date || ""}"`,
      c.budgetINR ?? c.budget_inr ?? 0,
      `"${c.status}"`,
      `"${c.location || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ViralPlug_Campaigns_Archive_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-comic-pink text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000] mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>VIRALPLUG EVENT ENGINE 2.0</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-white">
            CAMPAIGNS & REQUEST ORCHESTRATOR
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Dynamic Step Allocation • Passive Request Triage • Real-Time Client Task Assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCampaigns}
            className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-3 py-2 rounded text-neutral-300 hover:text-white flex items-center gap-1.5"
            title="Refresh database records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-heading font-black bg-comic-yellow text-comic-black px-4 py-2.5 rounded border-2 border-black shadow-[3px_3px_0px_#FFE600] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Launch New Event Campaign</span>
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
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main 3 Categories Navigation Tab (Circular / Pill Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tab 1: Passive Campaigns */}
        <button
          onClick={() => setActiveTab("PASSIVE")}
          className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex items-center justify-between ${
            activeTab === "PASSIVE"
              ? "bg-[#16131F] border-comic-cyan shadow-[5px_5px_0px_#00F0FF]"
              : "bg-[#111218] border-neutral-800 hover:border-neutral-600"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-comic-cyan text-comic-black flex items-center justify-center font-bold text-xs">
                A
              </div>
              <span className="font-heading font-black text-xs uppercase tracking-wider text-comic-cyan">
                Request Management
              </span>
            </div>
            <h3 className="font-display text-2xl uppercase text-white">
              Passive Campaigns
            </h3>
            <p className="text-[11px] font-mono text-neutral-400">
              Inbound proposals awaiting triage
            </p>
          </div>

          <div className="w-12 h-12 rounded-full bg-comic-cyan/10 border-2 border-comic-cyan flex items-center justify-center font-display text-xl text-comic-cyan shrink-0">
            {passiveRequests.length}
          </div>
        </button>

        {/* Tab 2: Active Campaigns */}
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex items-center justify-between ${
            activeTab === "ACTIVE"
              ? "bg-[#1B1812] border-comic-yellow shadow-[5px_5px_0px_#FFE600]"
              : "bg-[#111218] border-neutral-800 hover:border-neutral-600"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-comic-yellow text-comic-black flex items-center justify-center font-bold text-xs">
                B
              </div>
              <span className="font-heading font-black text-xs uppercase tracking-wider text-comic-yellow">
                Ongoing Events
              </span>
            </div>
            <h3 className="font-display text-2xl uppercase text-white">
              Active Campaigns
            </h3>
            <p className="text-[11px] font-mono text-neutral-400">
              Live step orchestration & tasks
            </p>
          </div>

          <div className="w-12 h-12 rounded-full bg-comic-yellow/10 border-2 border-comic-yellow flex items-center justify-center font-display text-xl text-comic-yellow shrink-0">
            {activeCampaigns.length}
          </div>
        </button>

        {/* Tab 3: Completed Archive */}
        <button
          onClick={() => setActiveTab("COMPLETED")}
          className={`p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex items-center justify-between ${
            activeTab === "COMPLETED"
              ? "bg-[#1E1118] border-comic-pink shadow-[5px_5px_0px_#FF0055]"
              : "bg-[#111218] border-neutral-800 hover:border-neutral-600"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-comic-pink text-white flex items-center justify-center font-bold text-xs">
                C
              </div>
              <span className="font-heading font-black text-xs uppercase tracking-wider text-comic-pink">
                Historical Archive
              </span>
            </div>
            <h3 className="font-display text-2xl uppercase text-white">
              Completed Campaigns
            </h3>
            <p className="text-[11px] font-mono text-neutral-400">
              Finished, cancelled & past events
            </p>
          </div>

          <div className="w-12 h-12 rounded-full bg-comic-pink/10 border-2 border-comic-pink flex items-center justify-center font-display text-xl text-comic-pink shrink-0">
            {completedCampaigns.length}
          </div>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: PASSIVE CAMPAIGNS (REQUEST MANAGEMENT)
          ========================================================================= */}
      {activeTab === "PASSIVE" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider text-white flex items-center gap-2">
                <Inbox className="w-5 h-5 text-comic-cyan" />
                <span>INCOMING CLIENT CAMPAIGN REQUESTS ({passiveRequests.length})</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Review client requests, attach custom criteria, request files/info, or accept directly to launch active steps.
              </p>
            </div>
          </div>

          {passiveRequests.length === 0 ? (
            <div className="comic-card p-12 text-center bg-[#111218] border-2 border-dashed border-neutral-800 space-y-3">
              <Inbox className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="font-display text-xl uppercase text-white">No Pending Campaign Requests</h3>
              <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
                Inbound requests submitted via public enquiries or enterprise RFPs will appear in this triage deck.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs font-heading font-black bg-comic-cyan text-comic-black px-4 py-2 rounded border border-black shadow-[2px_2px_0px_#000]"
              >
                + Create Simulated Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {passiveRequests.map((camp) => (
                <div
                  key={camp.id}
                  className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 hover:border-comic-cyan transition-all space-y-5 shadow-[4px_4px_0px_#00F0FF] rounded-2xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="comic-badge text-[10px] bg-comic-cyan text-comic-black px-2 py-0.5 uppercase font-bold">
                            {camp.category}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">
                            {camp.request_type || "Direct Inbound"}
                          </span>
                        </div>
                        <h3 className="font-display text-xl uppercase text-white">
                          {camp.title}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="font-display text-xl text-comic-yellow block">
                          ₹{Number(camp.budget_inr || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500">Allocated Budget</span>
                      </div>
                    </div>

                    {/* Client & Date Specs */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-neutral-900/70 p-3 rounded-xl border border-neutral-800">
                      <div>
                        <span className="text-neutral-500 text-[10px] uppercase block">Client Name</span>
                        <Link href={`/admin/clients/${camp.client_id || camp.id}`}>
                          <span className="font-bold text-white hover:text-comic-cyan hover:underline truncate block">
                            {camp.client_name}
                          </span>
                        </Link>
                        <span className="text-[11px] text-neutral-400 block truncate">
                          {camp.client_email || "No email logged"}
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-500 text-[10px] uppercase block">Event Date & Venue</span>
                        <span className="font-bold text-comic-cyan block">
                          {camp.event_date || camp.start_date || "Date Pending"}
                        </span>
                        <span className="text-[11px] text-neutral-400 block truncate">
                          {camp.location || "Location TBD"}
                        </span>
                      </div>
                    </div>

                    {/* Custom Criteria Tags */}
                    {camp.custom_criteria && camp.custom_criteria.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">
                          Custom Requirements & Criteria Checklist:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {camp.custom_criteria.map((cr: any, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded border border-neutral-700 flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-comic-yellow" />
                              <strong>{cr.label}:</strong> {cr.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sub-Options Toolbar */}
                    <div className="pt-2 border-t border-neutral-800/80">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-2 font-bold">
                        Client Ingestion & Triage Actions:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {/* File Request */}
                        <button
                          onClick={() => setShowFileRequestModal(camp)}
                          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-700 text-[11px] font-mono flex items-center justify-center gap-1"
                          title="Request specific files from client"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-comic-cyan" />
                          <span>File Request</span>
                        </button>

                        {/* Information Request */}
                        <button
                          onClick={() => setShowInfoRequestModal(camp)}
                          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-700 text-[11px] font-mono flex items-center justify-center gap-1"
                          title="Ask client for more details"
                        >
                          <FileText className="w-3.5 h-3.5 text-comic-yellow" />
                          <span>Info Request</span>
                        </button>

                        {/* Criteria Check */}
                        <button
                          onClick={() => setShowCriteriaModal(camp)}
                          className="px-2.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-700 text-[11px] font-mono flex items-center justify-center gap-1"
                          title="Add / Check custom criteria requirements"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-comic-pink" />
                          <span>Criteria Check</span>
                        </button>

                        {/* WhatsApp Communication */}
                        <button
                          onClick={() => openWhatsApp(camp)}
                          className="px-2.5 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] rounded border border-[#25D366]/50 text-[11px] font-mono flex items-center justify-center gap-1 font-bold"
                          title="Open WhatsApp chat integration"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Accept / Reject Main Buttons */}
                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setShowAcceptRejectModal({ campaign: camp, action: "REJECT" })}
                      className="px-4 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded font-heading font-black text-xs uppercase transition-all"
                    >
                      Reject Request ✕
                    </button>

                    <button
                      onClick={() => setShowAcceptRejectModal({ campaign: camp, action: "ACCEPT" })}
                      className="px-6 py-2 bg-comic-green text-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#00E575] hover:translate-x-0.5 hover:translate-y-0.5 flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept & Launch Campaign →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: ACTIVE CAMPAIGNS (ONGOING EVENTS)
          ========================================================================= */}
      {activeTab === "ACTIVE" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-comic-yellow" />
                <span>ACTIVE ONGOING CAMPAIGNS & LIVE STEP PIPELINE ({activeCampaigns.length})</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Click any campaign to expand dynamic steps, assign client uploads (photos, videos, files, forms), and track real-time completion.
              </p>
            </div>
          </div>

          {activeCampaigns.length === 0 ? (
            <div className="comic-card p-12 text-center bg-[#111218] border-2 border-dashed border-neutral-800 space-y-3">
              <Flame className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="font-display text-xl uppercase text-white">No Active Campaigns Running</h3>
              <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
                Accept a passive request from Tab A or launch a new campaign to begin live step tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeCampaigns.map((camp) => {
                const isExpanded = expandedCampaignId === camp.id;
                const steps = camp.steps || [];
                const completedStepsCount = steps.filter((s) => s.status === "COMPLETED").length;
                const calculatedProgress =
                  steps.length > 0 ? Math.round((completedStepsCount / steps.length) * 100) : camp.progress_pct || 0;

                return (
                  <div
                    key={camp.id}
                    className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 hover:border-comic-yellow transition-all rounded-2xl shadow-[5px_5px_0px_#FFE600] space-y-5"
                  >
                    {/* Primary Overview Card Bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="comic-badge text-[10px] bg-comic-yellow text-comic-black px-2 py-0.5 uppercase font-bold">
                            {camp.category}
                          </span>
                          <span className="text-xs font-mono text-comic-green font-bold bg-comic-green/10 border border-comic-green/30 px-2 py-0.5 rounded">
                            ● ACTIVE ONGOING
                          </span>
                          <span className="text-xs font-mono text-neutral-400">
                            Target Date: <strong>{camp.event_date || camp.start_date || "2026-10-15"}</strong>
                          </span>
                        </div>

                        <h3 className="font-display text-2xl uppercase text-white">
                          {camp.title}
                        </h3>

                        <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                          <span>
                            Client:{" "}
                            <Link href={`/admin/clients/${camp.client_id || camp.id}`} className="text-white font-bold hover:underline">
                              {camp.client_name}
                            </Link>
                          </span>
                          <span>•</span>
                          <span>Budget: <strong className="text-white">₹{Number(camp.budget_inr).toLocaleString("en-IN")}</strong></span>
                          <span>•</span>
                          <span>Venue: <strong className="text-neutral-300">{camp.location || "Mumbai"}</strong></span>
                        </div>
                      </div>

                      {/* Progress Visual + Expand Button */}
                      <div className="flex items-center gap-4">
                        <div className="w-48 space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-neutral-400">Progress:</span>
                            <span className="font-bold text-comic-yellow">{calculatedProgress}%</span>
                          </div>
                          <div className="w-full bg-neutral-900 rounded-full h-3 overflow-hidden border border-neutral-800">
                            <div
                              className="bg-gradient-to-r from-comic-yellow to-comic-green h-full transition-all duration-500"
                              style={{ width: `${calculatedProgress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500 block truncate">
                            Step: {camp.current_step_name || steps[0]?.title || "Active Work"}
                          </span>
                        </div>

                        <button
                          onClick={() => setExpandedCampaignId(isExpanded ? null : camp.id)}
                          className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl border border-neutral-700 text-xs font-mono flex items-center gap-2 shrink-0 font-bold"
                        >
                          <span>{isExpanded ? "Collapse Steps" : "Manage Steps"}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Step-by-Step Expanded Accordion */}
                    {isExpanded && (
                      <div className="pt-4 border-t border-neutral-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/60 p-3.5 rounded-xl border border-neutral-800">
                          <div>
                            <span className="text-xs font-mono text-comic-yellow font-bold uppercase block">
                              Dynamic Step & Task Orchestrator
                            </span>
                            <p className="text-[11px] font-mono text-neutral-400">
                              {steps.length} dynamic steps assigned • No fixed step limits • Real-time client synchronization
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openWhatsApp(camp)}
                              className="px-3 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-xs font-mono rounded border border-[#25D366]/50 flex items-center gap-1 font-bold"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp Client</span>
                            </button>

                            <button
                              onClick={() => setShowAddStepModal(camp)}
                              className="px-3 py-1.5 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded border border-black shadow-[2px_2px_0px_#000] flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add Dynamic Step</span>
                            </button>
                          </div>
                        </div>

                        {/* Steps List */}
                        {steps.length === 0 ? (
                          <div className="p-6 text-center text-xs font-mono text-neutral-500 bg-neutral-900 rounded-xl border border-dashed border-neutral-800">
                            No steps defined yet. Click "+ Add Dynamic Step" above to assign milestones or upload tasks.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {steps.map((st, idx) => {
                              const isCompleted = st.status === "COMPLETED";

                              return (
                                <div
                                  key={st.id}
                                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                    isCompleted
                                      ? "bg-green-950/20 border-green-800/60"
                                      : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <button
                                      onClick={() => handleToggleStepStatus(camp.id, st.id, st.status)}
                                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs mt-0.5 border transition-all ${
                                        isCompleted
                                          ? "bg-comic-green text-black border-black"
                                          : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:border-white"
                                      }`}
                                      title={isCompleted ? "Mark Incomplete" : "Mark Step Complete"}
                                    >
                                      {isCompleted ? "✓" : idx + 1}
                                    </button>

                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-heading font-bold text-sm text-white">
                                          {st.title}
                                        </span>
                                        <span className="text-[10px] font-mono uppercase bg-neutral-800 text-comic-cyan px-2 py-0.5 rounded border border-neutral-700 font-bold">
                                          {st.taskType.replace(/_/g, " ")}
                                        </span>
                                      </div>
                                      <p className="text-xs font-mono text-neutral-400">
                                        {st.description}
                                      </p>

                                      {st.clientSubmission?.files && st.clientSubmission.files.length > 0 && (
                                        <div className="pt-1 flex items-center gap-2">
                                          <span className="text-[10px] font-mono text-comic-green font-bold">
                                            Client Uploaded:
                                          </span>
                                          {st.clientSubmission.files.map((f: any, fidx: number) => (
                                            <a
                                              key={fidx}
                                              href={f.url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-[10px] font-mono text-comic-cyan underline hover:text-white"
                                            >
                                              {f.name} ({f.size || "File"})
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right text-xs font-mono">
                                      <span className="text-[10px] text-neutral-500 block">Deadline:</span>
                                      <span className="text-neutral-300 font-bold">
                                        {st.deadline ? new Date(st.deadline).toLocaleDateString("en-IN") : "Flexible"}
                                      </span>
                                    </div>

                                    <button
                                      onClick={() => handleToggleStepStatus(camp.id, st.id, st.status)}
                                      className={`px-3 py-1 rounded text-xs font-mono font-bold border transition-all ${
                                        isCompleted
                                          ? "bg-comic-green/20 text-comic-green border-comic-green/40"
                                          : "bg-comic-yellow/20 text-comic-yellow border-comic-yellow/40 hover:bg-comic-yellow hover:text-black"
                                      }`}
                                    >
                                      {isCompleted ? "Completed ✓" : "Mark Done"}
                                    </button>

                                    <button
                                      onClick={() => handleDeleteStep(camp.id, st.id)}
                                      className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-neutral-800"
                                      title="Delete step"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: COMPLETED CAMPAIGNS (ARCHIVE & ADVANCED FILTERS)
          ========================================================================= */}
      {activeTab === "COMPLETED" && (
        <div className="space-y-6">
          {/* Header & Export Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
            <div>
              <h2 className="font-display text-xl uppercase tracking-wider text-white flex items-center gap-2">
                <Archive className="w-5 h-5 text-comic-pink" />
                <span>COMPLETED & HISTORICAL CAMPAIGN ARCHIVE ({filteredArchive.length})</span>
              </h2>
              <p className="text-xs font-mono text-neutral-400">
                Organized by category with multi-dimensional filters, location indexing, and report export.
              </p>
            </div>

            <button
              onClick={exportArchiveCSV}
              className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-3.5 py-2 rounded text-neutral-200 hover:text-white flex items-center gap-2 w-fit"
            >
              <Download className="w-4 h-4 text-comic-pink" />
              <span>Export Filtered CSV</span>
            </button>
          </div>

          {/* Advanced Multi-Filter Control Bar */}
          <div className="comic-card p-5 bg-[#111218] border-2 border-neutral-800 space-y-4 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-comic-pink font-bold uppercase">
              <Filter className="w-4 h-4" />
              <span>Multi-Dimensional Search & Filtering:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Category Filter */}
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Category</label>
                <select
                  value={archiveCategory}
                  onChange={(e) => setArchiveCategory(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-xs text-white rounded p-2 font-mono"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Weddings">Weddings</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Festivals">Festivals</option>
                  <option value="Private Events">Private Events</option>
                  <option value="food-honey">Food & Honey</option>
                  <option value="sports-football">Sports</option>
                  <option value="property">Luxury Real Estate</option>
                  <option value="fashion-apparel">Fashion</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Status</label>
                <select
                  value={archiveStatus}
                  onChange={(e) => setArchiveStatus(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-xs text-white rounded p-2 font-mono"
                >
                  <option value="ALL">All Historical</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Client / Title Search */}
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Search Client / Event</label>
                <input
                  type="text"
                  placeholder="e.g. Vedika, Altura..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-xs text-white rounded p-2 font-mono"
                />
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Udaipur..."
                  value={archiveLocation}
                  onChange={(e) => setArchiveLocation(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-xs text-white rounded p-2 font-mono"
                />
              </div>

              {/* Budget Range */}
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Min ₹</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={archiveMinBudget}
                    onChange={(e) => setArchiveMinBudget(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-xs text-white rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-neutral-400 uppercase mb-1">Max ₹</label>
                  <input
                    type="number"
                    placeholder="Max"
                    value={archiveMaxBudget}
                    onChange={(e) => setArchiveMaxBudget(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-xs text-white rounded p-2 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Completed Cards Grid */}
          {filteredArchive.length === 0 ? (
            <div className="comic-card p-12 text-center bg-[#111218] border-2 border-dashed border-neutral-800 text-neutral-500 font-mono text-xs">
              No historical campaigns matched the active filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArchive.map((camp) => {
                const isCancelled = camp.status === "CANCELLED" || camp.status === "REJECTED";

                return (
                  <div
                    key={camp.id}
                    className={`comic-card p-5 bg-[#111218] border-2 rounded-2xl flex flex-col justify-between space-y-4 shadow-[4px_4px_0px_#000] ${
                      isCancelled ? "border-red-900/60 opacity-80" : "border-neutral-800 hover:border-comic-pink"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Image Thumbnail Preview */}
                      <div className="relative aspect-[16/9] w-full bg-neutral-900 rounded-xl overflow-hidden border border-neutral-700">
                        <img
                          src={camp.thumbnail_url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"}
                          alt={camp.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="comic-badge text-[10px] bg-comic-yellow text-comic-black px-2 py-0.5 uppercase font-bold">
                            {camp.category}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              camp.status === "COMPLETED"
                                ? "bg-comic-green text-black"
                                : "bg-red-600 text-white"
                            }`}
                          >
                            ● {camp.status}
                          </span>
                        </div>
                      </div>

                      {/* Information */}
                      <div>
                        <h3 className="font-display text-lg uppercase text-white truncate">
                          {camp.title}
                        </h3>
                        <p className="text-xs font-mono text-neutral-400 mt-0.5">
                          Client:{" "}
                          <Link href={`/admin/clients/${camp.client_id || camp.id}`} className="text-white font-bold hover:underline">
                            {camp.client_name}
                          </Link>
                        </p>
                      </div>

                      {/* Cancellation reason popover info if cancelled */}
                      {camp.cancellation_reason && (
                        <div className="p-2.5 bg-red-950/50 border border-red-800/80 rounded text-[11px] font-mono text-red-300">
                          <strong>Cancellation Reason:</strong> {camp.cancellation_reason}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-neutral-900/60 p-2.5 rounded-lg">
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase block">Event Date</span>
                          <span className="text-neutral-300 font-bold">
                            {camp.event_date || camp.start_date || "2026-07-15"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-500 uppercase block">Location</span>
                          <span className="text-neutral-300 font-bold truncate block">
                            {camp.location || "Mumbai"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                      <span className="font-display text-lg text-white">
                        ₹{Number(camp.budget_inr).toLocaleString("en-IN")}
                      </span>

                      <Link href={`/admin/clients/${camp.client_id || camp.id}`}>
                        <button className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded border border-neutral-700 text-xs font-mono flex items-center gap-1">
                          <span>Deep Dive</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* 1. Accept / Reject Confirmation Modal */}
      {showAcceptRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-md w-full p-6 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#00E575] space-y-5 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white">
                {showAcceptRejectModal.action === "ACCEPT" ? "Confirm Campaign Acceptance" : "Reject Campaign Request"}
              </h3>
              <button onClick={() => setShowAcceptRejectModal(null)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs font-mono text-neutral-300 leading-relaxed">
              {showAcceptRejectModal.action === "ACCEPT"
                ? `You are about to accept "${showAcceptRejectModal.campaign.title}" for ${showAcceptRejectModal.campaign.client_name}. This will initialize production steps and notify the client.`
                : `Please provide a reason for rejecting the request from ${showAcceptRejectModal.campaign.client_name}.`}
            </p>

            {showAcceptRejectModal.action === "REJECT" && (
              <div>
                <label className="block text-xs font-mono text-neutral-400 uppercase mb-1 font-bold">
                  Rejection Reason *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-xs text-white rounded p-2.5 font-mono"
                >
                  <option value="Schedule fully booked on target date">Schedule fully booked on target date</option>
                  <option value="Budget outside minimum viable production threshold">Budget outside minimum threshold</option>
                  <option value="Venue clearance unavailable">Venue clearance unavailable</option>
                  <option value="Client requirement outside core capability">Requirement outside core capability</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAcceptRejectModal(null)}
                className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAcceptReject}
                className={`px-5 py-2 font-heading font-black text-xs uppercase rounded border-2 border-black ${
                  showAcceptRejectModal.action === "ACCEPT"
                    ? "bg-comic-green text-black shadow-[3px_3px_0px_#00E575]"
                    : "bg-red-600 text-white shadow-[3px_3px_0px_#FF0055]"
                }`}
              >
                {showAcceptRejectModal.action === "ACCEPT" ? "Confirm & Activate →" : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. File Request Modal */}
      {showFileRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#00F0FF] space-y-5 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-comic-cyan" />
                <span>Send Document / File Request</span>
              </h3>
              <button onClick={() => setShowFileRequestModal(null)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs font-mono text-neutral-400">
              Target Client: <strong>{showFileRequestModal.client_name}</strong> ({showFileRequestModal.client_email})
            </p>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                Requested Files & Instructions *
              </label>
              <textarea
                rows={4}
                value={fileRequestNotes}
                onChange={(e) => setFileRequestNotes(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-xs text-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFileRequestModal(null)}
                className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  openWhatsApp(showFileRequestModal, `ViralPlug File Request: ${fileRequestNotes}`);
                  setShowFileRequestModal(null);
                  setMessage({ type: "success", text: "File request dispatched to client portal & WhatsApp!" });
                }}
                className="px-5 py-2 bg-comic-cyan text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
              >
                Send Request to Client →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Information Request Modal */}
      {showInfoRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] space-y-5 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-comic-yellow" />
                <span>Request Detailed Information</span>
              </h3>
              <button onClick={() => setShowInfoRequestModal(null)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs font-mono text-neutral-400">
              Target Client: <strong>{showInfoRequestModal.client_name}</strong>
            </p>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                Information Questionnaire Prompt *
              </label>
              <textarea
                rows={4}
                value={infoRequestText}
                onChange={(e) => setInfoRequestText(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-xs text-white font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInfoRequestModal(null)}
                className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  openWhatsApp(showInfoRequestModal, `ViralPlug Information Request: ${infoRequestText}`);
                  setShowInfoRequestModal(null);
                  setMessage({ type: "success", text: "Information request sent to client!" });
                }}
                className="px-5 py-2 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
              >
                Send Info Questionnaire →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Criteria Check & Custom Criteria Builder */}
      {showCriteriaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FF0055] space-y-5 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-comic-pink" />
                <span>Criteria Check & Custom Fields</span>
              </h3>
              <button onClick={() => setShowCriteriaModal(null)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Existing criteria */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                Current Criteria Checklist:
              </span>
              {(showCriteriaModal.custom_criteria || []).map((cr: any, idx: number) => (
                <div key={idx} className="p-2.5 bg-neutral-900 rounded-lg text-xs font-mono flex items-center justify-between border border-neutral-800">
                  <div>
                    <strong className="text-white">{cr.label}:</strong> <span className="text-neutral-300">{cr.value}</span>
                  </div>
                  <span className="text-[10px] bg-comic-green/20 text-comic-green px-1.5 py-0.5 rounded font-bold">
                    Required
                  </span>
                </div>
              ))}
            </div>

            {/* Add New Criterion Field */}
            <div className="space-y-3 pt-2 border-t border-neutral-800">
              <span className="text-xs font-mono uppercase text-comic-pink font-bold block">
                + Add Specific Custom Criterion
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Requirement Label (e.g. Pyro Permit)"
                  value={newCriteriaLabel}
                  onChange={(e) => setNewCriteriaLabel(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 rounded p-2 text-xs text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Specification (e.g. DGCA Class 3)"
                  value={newCriteriaValue}
                  onChange={(e) => setNewCriteriaValue(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 rounded p-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCriteriaModal(null)}
                className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleAddCustomCriteria}
                className="px-5 py-2 bg-comic-pink text-white font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
              >
                Save Criteria →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Dynamic Step Modal */}
      {showAddStepModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] space-y-5 rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white">
                Add Dynamic Step & Task
              </h3>
              <button onClick={() => setShowAddStepModal(null)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStep} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Step Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Stage 4K Video Reel Upload"
                  value={newStepForm.title}
                  onChange={(e) => setNewStepForm({ ...newStepForm, title: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Assign Task Type to Client *
                  </label>
                  <select
                    value={newStepForm.taskType}
                    onChange={(e) => setNewStepForm({ ...newStepForm, taskType: e.target.value as TaskType })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  >
                    <option value="PHOTO_UPLOAD">Photo Upload</option>
                    <option value="VIDEO_UPLOAD">Video Upload</option>
                    <option value="FILE_SUBMISSION">File / Doc Submission</option>
                    <option value="FORM_FILL">Form Fill / Survey</option>
                    <option value="APPROVAL">Client Approval / Signoff</option>
                    <option value="MILESTONE">Production Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Step Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={newStepForm.deadline}
                    onChange={(e) => setNewStepForm({ ...newStepForm, deadline: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Task Instructions for Client
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what the client needs to submit or approve..."
                  value={newStepForm.description}
                  onChange={(e) => setNewStepForm({ ...newStepForm, description: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStepModal(null)}
                  className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
                >
                  Save & Assign Step →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Launch / Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 sm:p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] space-y-5 rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-comic-pink" />
                <span>Launch New Event Campaign</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Rajwada Palace Wedding & Sangeet"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi Singhania"
                    value={createForm.clientName}
                    onChange={(e) => setCreateForm({ ...createForm, clientName: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Client Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={createForm.clientPhone}
                    onChange={(e) => setCreateForm({ ...createForm, clientPhone: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Event Category *
                  </label>
                  <select
                    value={createForm.category}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  >
                    <option value="Weddings">Weddings</option>
                    <option value="Corporate">Corporate Summit</option>
                    <option value="Festivals">Music & Cultural Festival</option>
                    <option value="Private Events">Private VIP Event</option>
                    <option value="fashion-apparel">Fashion Runway</option>
                    <option value="property">Luxury Real Estate</option>
                    <option value="food-honey">D2C Brand Launch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Initial Status
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as CampaignStatus })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  >
                    <option value="PASSIVE_REQUEST">Passive Request (Triage)</option>
                    <option value="ACTIVE">Active (Immediate Execution)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Allocated Budget (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={createForm.budgetINR}
                    onChange={(e) => setCreateForm({ ...createForm, budgetINR: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Target Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.eventDate}
                    onChange={(e) => setCreateForm({ ...createForm, eventDate: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Location / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. Udaivilas Palace, Udaipur"
                  value={createForm.location}
                  onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded border-2 border-black shadow-[3px_3px_0px_#000]"
                >
                  Launch Event Blueprint →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
