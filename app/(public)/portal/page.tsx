"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  LogOut,
  MessageSquare,
  Sparkles,
  UploadCloud,
  Layers,
  Paperclip,
  Check,
  Calendar,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Campaign, CampaignStep, TaskType } from "@/lib/types";

export default function ClientPortalPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "ARCHIVE" | "TASKS">("TASKS");

  // Task Submission Modal
  const [selectedTask, setSelectedTask] = useState<{ step: CampaignStep; campaign: Campaign } | null>(null);
  const [taskTextResponse, setTaskTextResponse] = useState("");
  const [taskFileUpload, setTaskFileUpload] = useState("");
  const [taskSuccessMsg, setTaskSuccessMsg] = useState<string | null>(null);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const campRes = await fetch("/api/v1/admin/campaigns");
      const campData = await campRes.json();
      if (campData.success) {
        const clientCampaigns = campData.data;
        setData({
          user: { name: "Aditi Singhania", email: "aditi.singhania@heritagegroup.in" },
          campaigns: clientCampaigns,
          summary: {
            activeCampaignsCount: clientCampaigns.filter((c: any) => c.status === "ACTIVE").length,
            totalSpend: clientCampaigns.reduce((acc: number, c: any) => acc + (c.budget_inr || 0), 0),
            totalViews: 4200000,
            narrative: "Your destination event stagecraft is 68% complete. Laser pyro clearance and CAD schematics verified.",
          },
        });
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      await fetch(`/api/v1/admin/campaigns/${selectedTask.campaign.id}/steps`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: selectedTask.step.id,
          status: "SUBMITTED",
          clientSubmission: {
            textResponse: taskTextResponse,
            files: taskFileUpload ? [{ name: "Client_Upload_Asset.mp4", url: taskFileUpload, type: "video", size: "38 MB" }] : [],
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      setTaskSuccessMsg(`Task "${selectedTask.step.title}" successfully submitted to production team!`);
      setTimeout(() => {
        setTaskSuccessMsg(null);
        setSelectedTask(null);
        setTaskTextResponse("");
        setTaskFileUpload("");
      }, 2000);
      await fetchPortalData();
    } catch {
      alert("Submission error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex items-center justify-center font-mono text-xs">
        Connecting to your private growth ledger & task pipeline...
      </div>
    );
  }

  const { user, campaigns = [], summary = {} } = data || {};
  const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE");
  const completedCampaigns = campaigns.filter((c: any) => c.status === "COMPLETED");

  // Collect all pending tasks for active campaigns
  const pendingTasks: Array<{ step: CampaignStep; campaign: Campaign }> = [];
  activeCampaigns.forEach((camp: Campaign) => {
    (camp.steps || []).forEach((step: CampaignStep) => {
      if (step.status !== "COMPLETED") {
        pendingTasks.push({ step, campaign: camp });
      }
    });
  });

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <span className="comic-badge bg-comic-cyan text-comic-black text-xs font-black mb-2">
              CLIENT PRODUCTION COCKPIT
            </span>
            <h1 className="font-display text-4xl sm:text-5xl uppercase text-white tracking-tight leading-none mt-1">
              WELCOME, <span className="text-comic-yellow">{user?.name}</span>
            </h1>
            <p className="text-xs font-mono text-neutral-400 mt-1">
              Account: {user?.email} • Verified Campaign Client
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://wa.me/919876543210?text=Hello%20Viral%20Plug!%20I%20am%20reviewing%20my%20event%20tasks%20on%20the%20portal."
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-[#25D366] text-black font-heading font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 fill-black" />
              <span>WhatsApp Dedicated Strategist</span>
            </a>

            <Link href="/admin">
              <button className="px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 hover:border-white text-neutral-300 rounded-xl text-xs font-mono">
                Admin View
              </button>
            </Link>
          </div>
        </div>

        {/* Narrative Brief */}
        <div className="p-5 bg-[#12131A] border-2 border-comic-cyan rounded-2xl shadow-[4px_4px_0px_#00F0FF] flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-comic-cyan shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <span className="text-xs font-mono text-comic-cyan uppercase font-bold">
              Real-Time Production Brief:
            </span>
            <p className="text-sm font-heading text-neutral-200 leading-relaxed">
              {summary.narrative}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 p-1.5 bg-[#111218] rounded-2xl border border-neutral-800 w-fit">
          <button
            onClick={() => setActiveTab("TASKS")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === "TASKS" ? "bg-comic-yellow text-comic-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Assigned Tasks & Uploads ({pendingTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ACTIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === "ACTIVE" ? "bg-comic-cyan text-comic-black" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Active Ongoing Campaigns ({activeCampaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ARCHIVE")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === "ARCHIVE" ? "bg-comic-pink text-white" : "text-neutral-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed Archive ({completedCampaigns.length})</span>
          </button>
        </div>

        {/* TAB: TASKS & UPLOADS */}
        {activeTab === "TASKS" && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wider text-white flex items-center gap-2">
              <UploadCloud className="w-6 h-6 text-comic-yellow" />
              <span>Assigned Client Action Tasks</span>
            </h2>

            {pendingTasks.length === 0 ? (
              <div className="comic-card p-12 text-center bg-[#111218] border-2 border-dashed border-neutral-800 space-y-2 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-comic-green mx-auto" />
                <h3 className="font-display text-xl uppercase text-white">All Tasks Up to Date!</h3>
                <p className="text-xs font-mono text-neutral-400">
                  You have no pending files or surveys to submit. Our production team is executing stagecraft.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingTasks.map(({ step, campaign }, idx) => (
                  <div
                    key={idx}
                    className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 hover:border-comic-yellow transition-all rounded-2xl shadow-[4px_4px_0px_#FFE600] space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="comic-badge text-[9px] bg-comic-yellow text-comic-black px-2 py-0.5 uppercase font-bold">
                          {step.taskType.replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] font-mono text-comic-yellow bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-700">
                          {step.status}
                        </span>
                      </div>

                      <h3 className="font-display text-xl uppercase text-white">
                        {step.title}
                      </h3>

                      <p className="text-xs font-mono text-neutral-300 leading-relaxed">
                        {step.description}
                      </p>

                      <div className="p-3 bg-neutral-900 rounded-xl text-xs font-mono space-y-1">
                        <div className="flex justify-between text-neutral-400 text-[10px]">
                          <span>Campaign:</span>
                          <strong className="text-white truncate max-w-[200px]">{campaign.title}</strong>
                        </div>
                        <div className="flex justify-between text-neutral-400 text-[10px]">
                          <span>Submission Deadline:</span>
                          <strong className="text-comic-yellow">{step.deadline ? new Date(step.deadline).toLocaleDateString("en-IN") : "This Week"}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTask({ step, campaign })}
                      className="w-full py-2.5 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] hover:translate-x-0.5"
                    >
                      Submit Requested Task →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: ACTIVE CAMPAIGNS */}
        {activeTab === "ACTIVE" && (
          <div className="space-y-6">
            {activeCampaigns.map((camp: Campaign) => (
              <div key={camp.id} className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-4 shadow-[4px_4px_0px_#000]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="comic-badge text-[10px] bg-comic-yellow text-comic-black px-2 py-0.5 uppercase font-bold">
                      {camp.category}
                    </span>
                    <h3 className="font-display text-2xl uppercase text-white mt-1">{camp.title}</h3>
                    <p className="text-xs font-mono text-neutral-400">Target Date: {camp.eventDate || camp.event_date || "Upcoming"} • Location: {camp.location || "On-Site"}</p>
                  </div>
                  <span className="font-display text-2xl text-comic-green">₹{Number(camp.budgetINR || camp.budget_inr || 0).toLocaleString("en-IN")}</span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-400">Overall Progress</span>
                    <span className="text-comic-yellow font-bold">{camp.progressPct ?? camp.progress_pct ?? 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-900 rounded-full h-3 overflow-hidden border border-neutral-800">
                    <div className="bg-gradient-to-r from-comic-yellow to-comic-green h-full" style={{ width: `${camp.progressPct ?? camp.progress_pct ?? 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: ARCHIVE */}
        {activeTab === "ARCHIVE" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedCampaigns.map((camp: Campaign) => (
              <div key={camp.id} className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 rounded-2xl space-y-3">
                <span className="comic-badge text-[10px] bg-comic-green text-black px-2 py-0.5 uppercase font-bold">COMPLETED</span>
                <h3 className="font-display text-xl uppercase text-white">{camp.title}</h3>
                <p className="text-xs font-mono text-neutral-400">Concluded on {camp.eventDate || camp.event_date || "2026-07-15"}</p>
                <p className="font-display text-xl text-white">₹{Number(camp.budgetINR || camp.budget_inr || 0).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 sm:p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] space-y-5 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white">
                Submit Task: {selectedTask.step.title}
              </h3>
              <button onClick={() => setSelectedTask(null)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            {taskSuccessMsg ? (
              <div className="p-6 text-center text-comic-green font-mono text-sm font-bold bg-green-950/40 rounded-xl border border-green-700 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p>{taskSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <p className="text-xs font-mono text-neutral-300">
                  {selectedTask.step.description}
                </p>

                {(selectedTask.step.taskType === "PHOTO_UPLOAD" || selectedTask.step.taskType === "VIDEO_UPLOAD" || selectedTask.step.taskType === "FILE_SUBMISSION") && (
                  <div>
                    <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                      Upload File URL (Video 4K / Photo / Document) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://assets.viralplugmedia.com/..."
                      value={taskFileUpload}
                      onChange={(e) => setTaskFileUpload(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Client Notes / Specifications
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add any specific color preferences, timestamps, or instructions..."
                    value={taskTextResponse}
                    onChange={(e) => setTaskTextResponse(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-xs text-white font-mono"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setSelectedTask(null)} className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2.5 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]">
                    Submit to Production →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
