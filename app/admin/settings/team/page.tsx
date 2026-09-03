"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Lock,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CLIENT";
  has_admin_access: boolean;
  is_mfa_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
}

export default function TeamSettingsPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/admin/users?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to fetch users list" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch {}
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, [search]);

  const handleRoleChange = async (userId: string, newRole: "SUPER_ADMIN" | "ADMIN" | "CLIENT", hasAdminAccess: boolean) => {
    setMessage(null);
    setActionLoadingId(userId);

    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole, hasAdminAccess }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message || "Role updated successfully" });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, role: newRole, has_admin_access: hasAdminAccess } : u
          )
        );
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update role" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wider text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-comic-yellow" />
            <span>TEAM ROLES & ACCESS GRANTS</span>
          </h1>
          <p className="text-xs font-mono text-neutral-400 mt-1">
            Role-Based Access Control (RBAC) • Real-time Session Enforcement • Audit Logged
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="text-xs font-mono bg-neutral-900 border border-neutral-700 px-3 py-1.5 rounded text-neutral-300 hover:text-white flex items-center gap-1.5 w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg border flex items-center gap-3 text-xs font-mono ${
            message.type === "success"
              ? "bg-green-950/80 border-green-500 text-green-300"
              : "bg-red-950/80 border-red-500 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Super Admin Notice */}
      {!isSuperAdmin && (
        <div className="p-4 bg-yellow-950/40 border border-yellow-600 rounded-lg flex items-center gap-3 text-xs font-mono text-yellow-300">
          <ShieldAlert className="w-5 h-5 shrink-0 text-yellow-400" />
          <span>
            You are viewing this list as <strong>{currentUser?.role || "ADMIN"}</strong>. Only <strong>SUPER_ADMIN</strong> accounts can grant or revoke admin privileges.
          </span>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 bg-[#111218] rounded-xl border border-neutral-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search by registered user name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none w-full font-mono"
        />
      </div>

      {/* Users Table */}
      <div className="comic-card overflow-hidden bg-[#111218] border-2 border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 uppercase">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Current Role</th>
                <th className="p-4">Admin Access</th>
                <th className="p-4">Last Active</th>
                <th className="p-4 text-right">Super Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    Loading users from PostgreSQL database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isUserSuperAdmin = user.role === "SUPER_ADMIN";
                  const isAdmin = user.role === "ADMIN" || user.has_admin_access;

                  return (
                    <tr key={user.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="p-4 font-bold text-white flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isUserSuperAdmin
                              ? "bg-comic-yellow text-comic-black"
                              : isAdmin
                              ? "bg-comic-cyan text-comic-black"
                              : "bg-neutral-800 text-neutral-300"
                          }`}
                        >
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span>{user.name}</span>
                          <span className="block text-[10px] text-neutral-500 font-normal">
                            ID: {user.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-neutral-300">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            user.role === "SUPER_ADMIN"
                              ? "bg-comic-yellow text-comic-black"
                              : user.role === "ADMIN"
                              ? "bg-comic-cyan text-comic-black"
                              : "bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        {user.has_admin_access ? (
                          <span className="inline-flex items-center gap-1 text-comic-green font-bold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Granted</span>
                          </span>
                        ) : (
                          <span className="text-neutral-500 text-[11px]">Client Only</span>
                        )}
                      </td>
                      <td className="p-4 text-neutral-400">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Never"}
                      </td>
                      <td className="p-4 text-right">
                        {isSuperAdmin && user.id !== currentUser?.id ? (
                          <div className="inline-flex items-center gap-2">
                            <select
                              value={user.role}
                              disabled={actionLoadingId === user.id}
                              onChange={(e) => {
                                const newRole = e.target.value as "SUPER_ADMIN" | "ADMIN" | "CLIENT";
                                const grantAdmin = newRole === "SUPER_ADMIN" || newRole === "ADMIN";
                                handleRoleChange(user.id, newRole, grantAdmin);
                              }}
                              className="bg-neutral-900 border border-neutral-700 text-white rounded px-2.5 py-1 text-xs focus:border-comic-yellow focus:outline-none"
                            >
                              <option value="CLIENT">Role: CLIENT (No Cockpit)</option>
                              <option value="ADMIN">Role: ADMIN (Full Cockpit)</option>
                              <option value="SUPER_ADMIN">Role: SUPER_ADMIN (Owner)</option>
                            </select>

                            <button
                              disabled={actionLoadingId === user.id}
                              onClick={() => {
                                const toggle = !user.has_admin_access;
                                const newRole = toggle ? "ADMIN" : "CLIENT";
                                handleRoleChange(user.id, newRole, toggle);
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-heading font-black border transition-all ${
                                user.has_admin_access
                                  ? "bg-red-950/80 text-red-300 border-red-700 hover:bg-red-900"
                                  : "bg-comic-yellow text-comic-black border-black font-black hover:bg-yellow-300"
                              }`}
                            >
                              {user.has_admin_access ? "Revoke Admin" : "Grant Admin"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-neutral-600 text-[11px] italic">
                            {user.id === currentUser?.id ? "Current Session" : "Protected"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
