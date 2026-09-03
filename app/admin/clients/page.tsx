"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  ExternalLink,
  Flame,
  DollarSign,
  Calendar,
  User,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface ClientAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  last_login_at: string | null;
  campaigns_count: string;
  total_spend: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/clients?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setClients(data.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-comic-yellow" />
            <span>CLIENT DIRECTORY & ACCOUNT MIRRORS</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Browse All Registered Clients • Inspect 'View As Client' Portal Mirrors • Manage Campaigns
          </p>
        </div>

        <button
          onClick={fetchClients}
          className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-3 py-1.5 rounded text-neutral-300 hover:text-white flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-[#111218] rounded-xl border border-neutral-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search clients by brand name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none w-full font-mono"
        />
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="comic-card p-12 text-center text-neutral-500 font-mono text-xs">
          Loading client accounts...
        </div>
      ) : clients.length === 0 ? (
        <div className="comic-card p-12 text-center bg-[#111218] border-2 border-dashed border-neutral-700 space-y-3">
          <User className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="font-display text-xl uppercase text-white">
            No Client Accounts Found
          </h3>
          <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
            When visitors register or convert through the enquiry intake, their account dossiers appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div
              key={client.id}
              className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 hover:border-comic-yellow transition-all space-y-4 shadow-[4px_4px_0px_#000]"
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-comic-cyan text-comic-black flex items-center justify-center font-bold text-xs">
                    {client.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-white truncate max-w-[180px]">
                      {client.name}
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-400 truncate max-w-[180px]">
                      {client.email}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono bg-neutral-900 px-2 py-0.5 rounded text-neutral-400">
                  {client.role}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800">
                  <span className="text-neutral-500 text-[10px] uppercase block">Campaigns</span>
                  <p className="font-display text-lg text-comic-yellow mt-0.5">
                    {client.campaigns_count || "0"}
                  </p>
                </div>

                <div className="p-2.5 bg-neutral-900 rounded border border-neutral-800">
                  <span className="text-neutral-500 text-[10px] uppercase block">Total Spend</span>
                  <p className="font-display text-lg text-white mt-0.5">
                    ₹{Number(client.total_spend || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-500">
                  Joined: {new Date(client.created_at).toLocaleDateString("en-IN")}
                </span>

                <Link href={`/admin/clients/${client.id}`}>
                  <button className="px-3 py-1.5 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded border border-black shadow-[2px_2px_0px_#000] hover:translate-x-0.5 flex items-center gap-1">
                    <span>View As Client</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
