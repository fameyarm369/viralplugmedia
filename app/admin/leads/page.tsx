"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Building,
  Flame,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Sliders,
} from "lucide-react";

interface LeadItem {
  id: string;
  name: string;
  business_name: string;
  category: string;
  phone: string;
  email: string;
  budget_range: string;
  timeline: string;
  notes: string | null;
  lead_score: number;
  status: string;
  assigned_to: string | null;
  created_at: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let url = "/api/v1/leads";
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (search) params.append("search", search);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLeads(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/admin/leads/${leadId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        if (selectedLead?.id === leadId) {
          setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-comic-cyan" />
            <span>INBOUND LEADS & CLIENT CRM</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Real Inbound Database Inquiries • Dynamic Lead Scoring (10-100) • Status Transitions
          </p>
        </div>

        <button
          onClick={fetchLeads}
          className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-3 py-1.5 rounded text-neutral-300 hover:text-white flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 p-3 bg-[#111218] rounded-xl border border-neutral-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by brand name, founder, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full font-mono"
          />
        </div>

        <div className="sm:col-span-4 p-2 bg-[#111218] rounded-xl border border-neutral-800 flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-500 ml-1" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-white font-mono focus:outline-none w-full"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="QUALIFIED">QUALIFIED</option>
            <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
            <option value="WON">WON</option>
            <option value="LOST">LOST</option>
          </select>
        </div>
      </div>

      {/* Leads Table & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Leads Table (7/8 Cols) */}
        <div className="lg:col-span-8 comic-card overflow-hidden bg-[#111218] border-2 border-neutral-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase">
                <tr>
                  <th className="p-3.5">Brand / Lead</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Budget</th>
                  <th className="p-3.5">Score</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-neutral-500">
                      Loading leads from database...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-neutral-500">
                      No leads match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className={`hover:bg-neutral-900/60 cursor-pointer transition-colors ${
                        selectedLead?.id === lead.id ? "bg-neutral-900/80 ring-1 ring-comic-cyan" : ""
                      }`}
                    >
                      <td className="p-3.5">
                        <p className="font-heading font-bold text-white text-xs">
                          {lead.business_name}
                        </p>
                        <p className="text-[10px] text-neutral-400">{lead.name}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="comic-badge text-[9px] bg-comic-yellow text-comic-black px-1.5 py-0.5 uppercase font-bold">
                          {lead.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-white">{lead.budget_range}</td>
                      <td className="p-3.5 font-bold">
                        <span
                          className={
                            lead.lead_score >= 80
                              ? "text-comic-green"
                              : lead.lead_score >= 50
                              ? "text-comic-yellow"
                              : "text-neutral-400"
                          }
                        >
                          {lead.lead_score}/100
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-[11px] text-white focus:outline-none"
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                          <option value="WON">WON</option>
                          <option value="LOST">LOST</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-comic-cyan hover:underline text-[11px]"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Dossier Sidebar (4 Cols) */}
        <div className="lg:col-span-4">
          {selectedLead ? (
            <div className="comic-card p-6 bg-[#111218] border-2 border-comic-cyan shadow-[4px_4px_0px_#00F0FF] space-y-4">
              <div className="pb-3 border-b border-neutral-800">
                <span className="comic-badge text-[10px] bg-comic-yellow text-comic-black px-2 py-0.5 uppercase font-bold mb-1">
                  {selectedLead.category}
                </span>
                <h3 className="font-display text-2xl uppercase text-white mt-1">
                  {selectedLead.business_name}
                </h3>
                <p className="text-xs font-mono text-neutral-400">Founder: {selectedLead.name}</p>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Phone className="w-4 h-4 text-comic-yellow shrink-0" />
                  <a href={`tel:${selectedLead.phone}`} className="hover:underline text-white">
                    {selectedLead.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <Mail className="w-4 h-4 text-comic-cyan shrink-0" />
                  <a href={`mailto:${selectedLead.email}`} className="hover:underline text-white">
                    {selectedLead.email}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <DollarSign className="w-4 h-4 text-comic-green shrink-0" />
                  <span>Budget: {selectedLead.budget_range}</span>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <Clock className="w-4 h-4 text-comic-pink shrink-0" />
                  <span>Timeline: {selectedLead.timeline}</span>
                </div>
              </div>

              {selectedLead.notes && (
                <div className="p-3 bg-neutral-900 rounded border border-neutral-800 text-xs font-mono text-neutral-300">
                  <span className="text-neutral-500 text-[10px] uppercase block mb-1">Client Notes:</span>
                  <p>{selectedLead.notes}</p>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800 flex gap-2">
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(selectedLead.name)},%20I%20am%20reaching%20out%20from%20Viral%20Plug%20Media%20regarding%20your%20campaign.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center py-2 bg-[#25D366] text-black font-heading font-black text-xs uppercase rounded border border-black shadow-[2px_2px_0px_#000]"
                >
                  WhatsApp Lead
                </a>
              </div>
            </div>
          ) : (
            <div className="comic-card p-8 text-center bg-[#111218] border-2 border-dashed border-neutral-700 text-xs font-mono text-neutral-500">
              Select a lead from the CRM table to view detailed contact notes and launch direct WhatsApp engagement.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
