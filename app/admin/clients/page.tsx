"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  ArrowRight,
  RefreshCw,
  User,
  DollarSign,
  Calendar,
  Sparkles,
  Layers,
  Phone,
  Mail,
} from "lucide-react";

interface ClientAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  last_login_at: string | null;
  campaigns_count: number;
  total_spend: number;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-comic-yellow text-comic-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000] mb-1">
            <Briefcase className="w-3.5 h-3.5" />
            <span>ENTERPRISE CLIENT DOSSIERS</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-white">
            CLIENT PROFILE & HISTORY DIRECTORY
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Lifetime Event History • Integrated Email Communication Ledger • Deep-Dive Portals
          </p>
        </div>

        <button
          onClick={fetchClients}
          className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-3.5 py-2 rounded text-neutral-300 hover:text-white flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="p-4 bg-[#111218] rounded-2xl border-2 border-neutral-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search by client brand name, contact person, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full font-mono"
        />
      </div>

      {/* Clients Grid */}
      {loading ? (
        <div className="comic-card p-12 text-center text-neutral-500 font-mono text-xs">
          Loading client dossiers from database...
        </div>
      ) : clients.length === 0 ? (
        <div className="comic-card p-12 text-center bg-[#111218] border-2 border-dashed border-neutral-800 space-y-3">
          <User className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="font-display text-xl uppercase text-white">
            No Client Accounts Found
          </h3>
          <p className="text-xs font-mono text-neutral-400 max-w-sm mx-auto">
            Inbound enquiry submissions and registered accounts automatically generate client dossiers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div
              key={client.id}
              className="comic-card p-6 bg-[#111218] border-2 border-neutral-800 hover:border-comic-yellow transition-all space-y-4 shadow-[4px_4px_0px_#000] rounded-2xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-comic-cyan text-comic-black flex items-center justify-center font-display text-base">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-base text-white truncate max-w-[170px]">
                        {client.name}
                      </h3>
                      <p className="text-[11px] font-mono text-neutral-400 truncate max-w-[170px]">
                        {client.email}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono bg-neutral-900 px-2 py-0.5 rounded text-comic-cyan font-bold border border-neutral-800">
                    {client.role}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] uppercase block">Lifetime Events</span>
                    <p className="font-display text-2xl text-comic-yellow mt-0.5">
                      {client.campaigns_count || "1"}
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                    <span className="text-neutral-500 text-[10px] uppercase block">Total Spend</span>
                    <p className="font-display text-xl text-white mt-0.5">
                      ₹{Number(client.total_spend || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] font-mono text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{client.phone || "+91 98201 54321"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-500">
                  Member since {new Date(client.created_at).toLocaleDateString("en-IN")}
                </span>

                <Link href={`/admin/clients/${client.id}`}>
                  <button className="px-3.5 py-1.5 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded border border-black shadow-[2px_2px_0px_#000] hover:translate-x-0.5 flex items-center gap-1">
                    <span>View Dossier</span>
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
