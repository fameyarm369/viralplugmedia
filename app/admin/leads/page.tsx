"use client";

import React, { useState } from "react";
import { INITIAL_LEADS } from "@/lib/db";
import { Lead, LeadStatus } from "@/lib/types";
import { getScoreBadgeColor, createWhatsAppLink } from "@/lib/utils";
import {
  Users,
  Search,
  Filter,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(INITIAL_LEADS[0]);

  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
    const matchesQuery =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    return matchesStatus && matchesQuery;
  });

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const statuses: { label: string; value: string }[] = [
    { label: "All Leads", value: "ALL" },
    { label: "New", value: "NEW" },
    { label: "Contacted", value: "CONTACTED" },
    { label: "Qualified", value: "QUALIFIED" },
    { label: "Proposal Sent", value: "PROPOSAL_SENT" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-comic-yellow" />
            <span>LEAD MANAGEMENT & SCORING</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Total Pipeline: {leads.length} Inbound Opportunities • Auto-Scoring Engine Active
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`text-xs font-heading font-bold px-3 py-1.5 rounded-lg border transition-all ${
                statusFilter === s.value
                  ? "bg-comic-yellow text-comic-black border-black font-black"
                  : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-4 bg-[#111218] rounded-xl border border-neutral-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Filter by lead name, business, or phone number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none w-full font-mono"
        />
      </div>

      {/* Main Grid: Leads Table + Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table View (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredLeads.map((lead) => {
            const badge = getScoreBadgeColor(lead.leadScore);
            const isSelected = selectedLead?.id === lead.id;
            const waLink = createWhatsAppLink(
              lead.phone,
              `Hello ${lead.name}! I am reviewing your enquiry for ${lead.businessName} at Viral Plug Media.`
            );

            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#161822] border-comic-yellow shadow-[4px_4px_0px_#FFE600]"
                    : "bg-[#111218] border-neutral-800 hover:border-neutral-600"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black text-base text-white">
                        {lead.name}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}>
                        {lead.leadScore} PTS {badge.label}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-comic-cyan font-bold">
                      {lead.businessName} • <span className="capitalize">{lead.category.replace("-", " ")}</span>
                    </p>

                    <div className="flex flex-wrap gap-3 text-[11px] font-mono text-neutral-400 pt-1">
                      <span>💰 {lead.budgetRange}</span>
                      <span>⏱️ {lead.timeline}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-[#25D366] text-black rounded border border-black shadow-[2px_2px_0px_#000] hover:scale-105"
                      title="Direct WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4 fill-black" />
                    </a>

                    <select
                      value={lead.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleStatusChange(lead.id, e.target.value as LeadStatus)
                      }
                      className="text-xs font-mono bg-neutral-900 border border-neutral-700 text-white rounded px-2 py-1 focus:border-comic-yellow focus:outline-none"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="QUALIFIED">QUALIFIED</option>
                      <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                      <option value="WON">WON</option>
                      <option value="LOST">LOST</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Lead Details & Proposal Action Drawer (5 Cols) */}
        <div className="lg:col-span-5">
          {selectedLead ? (
            <div className="p-6 rounded-xl bg-[#111218] border-2 border-neutral-800 space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                <div>
                  <span className="text-xs font-mono text-neutral-400 uppercase">
                    Selected Lead Dossier
                  </span>
                  <h2 className="font-display text-2xl uppercase text-white mt-0.5">
                    {selectedLead.name}
                  </h2>
                </div>

                <span className="text-xs font-mono text-comic-yellow font-bold">
                  {selectedLead.status}
                </span>
              </div>

              {/* Dossier Grid */}
              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Phone className="w-4 h-4 text-comic-yellow" />
                  <span>{selectedLead.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <Mail className="w-4 h-4 text-comic-yellow" />
                  <span>{selectedLead.email}</span>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <Calendar className="w-4 h-4 text-comic-yellow" />
                  <span>Assigned: {selectedLead.assignedTo || "Harshit R."}</span>
                </div>
              </div>

              {/* Requirement Notes */}
              {selectedLead.notes && (
                <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 space-y-1">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">
                    Client Goals / Notes:
                  </span>
                  <p className="text-xs text-neutral-200 font-body">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-3 pt-2">
                <a
                  href={createWhatsAppLink(
                    selectedLead.phone,
                    `Hello ${selectedLead.name}! Viral Plug Media has prepared your customized creative proposal for ${selectedLead.businessName}. Are you free for a quick 5-min walk-through?`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-black font-heading font-black text-xs uppercase py-3 rounded border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5"
                >
                  <MessageSquare className="w-4 h-4 fill-black" />
                  Dispatch WhatsApp Proposal
                </a>

                <button
                  onClick={() => alert(`Generating PDF Proposal for ${selectedLead.businessName}...`)}
                  className="w-full text-center text-xs font-heading font-bold text-white bg-neutral-800 hover:bg-neutral-700 py-2.5 rounded border border-neutral-700"
                >
                  Download Auto-Generated Proposal (PDF)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-neutral-500 font-mono text-xs">
              Select a lead from the list to inspect details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
