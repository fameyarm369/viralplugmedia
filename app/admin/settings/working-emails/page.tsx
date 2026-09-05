"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Plus,
  Key,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Lock,
  UserCheck,
  Sliders,
  Eye,
  EyeOff,
  Search,
  CheckCircle,
  AlertCircle,
  Activity,
  X,
} from "lucide-react";
import { WorkingEmailCredential } from "@/lib/types";

export default function WorkingEmailsAdminPage() {
  const [credentials, setCredentials] = useState<WorkingEmailCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New Working Email Generator Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    professionalName: "",
    role: "EVENT_DIRECTOR" as WorkingEmailCredential["role"],
    department: "Production" as WorkingEmailCredential["department"],
  });

  // Generated Credential Reveal Card Modal
  const [revealedCredential, setRevealedCredential] = useState<WorkingEmailCredential | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/working-emails");
      const data = await res.json();
      if (data.success) {
        setCredentials(data.data);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load working email credentials" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/working-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (data.success) {
        setRevealedCredential(data.data);
        setShowCreateModal(false);
        setCreateForm({
          professionalName: "",
          role: "EVENT_DIRECTOR",
          department: "Production",
        });
        await fetchCredentials();
      } else {
        setMessage({ type: "error", text: data.error || "Generation failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error during email generation" });
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/working-emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: !currentActive ? "Working email reactivated!" : "Working email deactivated!",
        });
        await fetchCredentials();
      }
    } catch {
      setMessage({ type: "error", text: "Toggle failed" });
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to regenerate password credentials for ${name}?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/working-emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET_PASSWORD" }),
      });
      const data = await res.json();
      if (data.success) {
        const item = credentials.find((c) => c.id === id);
        if (item) {
          setRevealedCredential({
            ...item,
            plainTempPassword: data.data.newPassword,
          });
        }
        await fetchCredentials();
      }
    } catch {
      setMessage({ type: "error", text: "Password reset failed" });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const downloadCredentialsTxt = (cred: WorkingEmailCredential) => {
    const content = `=====================================================
VIRALPLUG MEDIA — PROFESSIONAL CREDENTIAL DOSSIER
=====================================================
Professional Name : ${cred.professionalName}
Official Email    : ${cred.email}
Role Privilege    : ${cred.role}
Department        : ${cred.department}
Secure Password   : ${cred.plainTempPassword}
Generated Date    : ${new Date().toLocaleString("en-IN")}
Status            : Active Account

WARNING: This password cannot be recovered once lost. Contact Super Admin for security regeneration.
=====================================================`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ViralPlug_Credential_${cred.email.split("@")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCredentials = credentials.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.professionalName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-comic-yellow text-comic-black text-[10px] font-black uppercase px-2.5 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000] mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SUPER ADMIN FEATURE • ZERO TRUST VAULT</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wider text-white">
            WORKING EMAIL & PROFESSIONAL VAULT
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Auto-format [name]@viralplug.com • 16+ Char Cryptographic Passwords • Single-Reveal Security
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCredentials}
            className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-xl text-neutral-300 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Vault</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-heading font-black bg-comic-yellow text-comic-black px-4 py-2.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#FFE600] hover:translate-x-0.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Working Email</span>
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

      {/* Super Admin Security Warning Banner */}
      <div className="p-4 bg-yellow-950/40 border-2 border-yellow-600 rounded-2xl flex items-center gap-3 text-xs font-mono text-yellow-300 shadow-[3px_3px_0px_#000]">
        <AlertTriangle className="w-5 h-5 shrink-0 text-yellow-400" />
        <span>
          <strong>SUPER ADMIN ENFORCEMENT:</strong> Generated credentials are cryptographic single-reveal keys. Once closed, passwords cannot be recovered. In case of lost credentials, use the <strong>Reset Key</strong> action to regenerate.
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="p-4 bg-[#111218] rounded-2xl border-2 border-neutral-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search by professional name, @viralplug.com email, role, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full font-mono"
        />
      </div>

      {/* Credentials Table */}
      <div className="comic-card overflow-hidden bg-[#111218] border-2 border-neutral-800 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase">
              <tr>
                <th className="p-4">Professional</th>
                <th className="p-4">Official Email (@viralplug.com)</th>
                <th className="p-4">Department & Role</th>
                <th className="p-4">Status & 2FA</th>
                <th className="p-4">Failed Logins</th>
                <th className="p-4 text-right">Super Admin Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    Loading credentials vault from secure store...
                  </td>
                </tr>
              ) : filteredCredentials.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    No working email accounts found matching your search.
                  </td>
                </tr>
              ) : (
                filteredCredentials.map((cred) => (
                  <tr key={cred.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-comic-yellow text-comic-black flex items-center justify-center font-bold text-xs">
                          {cred.professionalName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white">{cred.professionalName}</p>
                          <span className="text-[10px] text-neutral-500">By: {cred.createdBy}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-comic-cyan font-bold">{cred.email}</span>
                    </td>

                    <td className="p-4">
                      <div>
                        <span className="comic-badge text-[9px] bg-neutral-800 text-white px-2 py-0.5 rounded font-bold uppercase">
                          {cred.role.replace(/_/g, " ")}
                        </span>
                        <span className="block text-[11px] text-neutral-400 mt-0.5">
                          {cred.department}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            cred.isActive
                              ? "bg-comic-green/20 text-comic-green"
                              : "bg-red-950 text-red-400"
                          }`}
                        >
                          ● {cred.isActive ? "ACTIVE" : "DEACTIVATED"}
                        </span>
                        {cred.isMfaEnabled && (
                          <span className="text-[9px] bg-comic-yellow/20 text-comic-yellow px-1.5 py-0.5 rounded font-bold">
                            2FA ON
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-neutral-400">
                      {cred.failedLoginAttempts > 0 ? (
                        <span className="text-red-400 font-bold">{cred.failedLoginAttempts} attempts</span>
                      ) : (
                        <span className="text-neutral-500">0 (Secure)</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleResetPassword(cred.id, cred.professionalName)}
                          className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-comic-yellow rounded border border-neutral-700 text-xs font-mono flex items-center gap-1"
                          title="Generate new 18+ char password"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Reset Key</span>
                        </button>

                        <button
                          onClick={() => handleToggleActive(cred.id, cred.isActive)}
                          className={`px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
                            cred.isActive
                              ? "bg-red-950/80 text-red-300 border-red-800 hover:bg-red-900"
                              : "bg-comic-green text-black border-black font-black"
                          }`}
                        >
                          {cred.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          ONE-TIME CREDENTIAL REVEAL CARD MODAL
          ========================================================================= */}
      {revealedCredential && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 sm:p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] space-y-6 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-comic-green" />
                <h3 className="font-display text-2xl uppercase text-white">
                  Official Credentials Issued
                </h3>
              </div>
              <button
                onClick={() => setRevealedCredential(null)}
                className="text-neutral-400 hover:text-white p-2 rounded-xl bg-neutral-900"
              >
                ✕
              </button>
            </div>

            {/* Warning Alert */}
            <div className="p-3.5 bg-red-950/60 border border-red-700 rounded-xl text-xs font-mono text-red-200">
              <strong>SECURITY WARNING:</strong> This password is displayed only once. Download or copy the credentials immediately before closing this window.
            </div>

            {/* Credential Data Card */}
            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-700 space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">Professional Name</span>
                <p className="text-white font-bold text-sm">{revealedCredential.professionalName}</p>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">Official Working Email</span>
                <p className="text-comic-cyan font-bold text-sm">{revealedCredential.email}</p>
              </div>

              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">Role & Department</span>
                <p className="text-neutral-300">{revealedCredential.role} • {revealedCredential.department}</p>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <span className="text-[10px] text-comic-yellow uppercase block font-bold">18+ Char Cryptographic Password:</span>
                <div className="mt-1 p-3 bg-comic-black rounded-xl border border-neutral-700 flex items-center justify-between">
                  <span className="text-comic-yellow font-bold text-sm tracking-wider font-mono select-all">
                    {revealedCredential.plainTempPassword}
                  </span>
                  <button
                    onClick={() => copyToClipboard(revealedCredential.plainTempPassword || "")}
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs flex items-center gap-1 shrink-0 ml-2"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-comic-green" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Download & Dismiss Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => downloadCredentialsTxt(revealedCredential)}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono flex items-center gap-2 border border-neutral-700 font-bold"
              >
                <Download className="w-4 h-4 text-comic-yellow" />
                <span>Download Secure .TXT</span>
              </button>

              <button
                onClick={() => setRevealedCredential(null)}
                className="px-6 py-2.5 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]"
              >
                I Have Saved Password ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE WORKING EMAIL MODAL
          ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-card max-w-lg w-full p-6 sm:p-8 bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] space-y-5 rounded-3xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-display text-2xl uppercase text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-comic-yellow" />
                <span>Create Working Email</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                  Professional Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Roy"
                  value={createForm.professionalName}
                  onChange={(e) => setCreateForm({ ...createForm, professionalName: e.target.value })}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                />
                <span className="text-[10px] font-mono text-neutral-500 mt-1 block">
                  Generated format: {createForm.professionalName ? `${createForm.professionalName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@viralplug.com` : "[name]@viralplug.com"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Role Privilege *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  >
                    <option value="EVENT_DIRECTOR">Event Director</option>
                    <option value="MEDIA_LEAD">Media Lead</option>
                    <option value="STRATEGIST">Creative Strategist</option>
                    <option value="ACCOUNT_MANAGER">Account Manager</option>
                    <option value="ADMIN">Full Admin Cockpit</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 mb-1 font-bold">
                    Department *
                  </label>
                  <select
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value as any })}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded p-2.5 text-xs text-white font-mono"
                  >
                    <option value="Production">Production & Staging</option>
                    <option value="Creative">Creative & Media</option>
                    <option value="Marketing">Growth & Marketing</option>
                    <option value="Client Relations">Client Relations</option>
                    <option value="Operations">Logistics & Ops</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-neutral-800 text-white rounded text-xs font-mono">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-comic-yellow text-comic-black font-heading font-black text-xs uppercase rounded-xl border-2 border-black shadow-[3px_3px_0px_#000]">
                  Generate Working Email →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
