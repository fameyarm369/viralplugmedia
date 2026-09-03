"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  Flame,
  LayoutGrid,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  Bell,
  Search,
  UserCheck,
  LogOut,
  Sliders,
  DollarSign,
  Briefcase,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Leads & CRM", href: "/admin/leads", icon: Users },
    { label: "Media & Palette Studio", href: "/admin/media-library", icon: ImageIcon },
    { label: "Active Campaigns", href: "/admin/campaigns", icon: Flame },
    { label: "Homepage Showcase", href: "/admin/homepage-showcase", icon: LayoutGrid },
    { label: "Client Accounts", href: "/admin/clients", icon: Briefcase },
  ];

  const settingItems = [
    { label: "Team & RBAC Access", href: "/admin/settings/team", icon: ShieldCheck },
    { label: "AI Deal History", href: "/admin/settings/deal-history", icon: DollarSign },
    { label: "Payment Settings", href: "/admin/settings/payments", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#111218] border-r-2 border-neutral-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-comic-yellow text-comic-black rounded border-2 border-black flex items-center justify-center font-display text-lg font-black shadow-[2px_2px_0px_#FF0055]">
                VP
              </div>
              <div>
                <span className="font-display text-lg tracking-wider text-white">
                  VIRAL PLUG
                </span>
                <span className="block text-[9px] font-mono text-comic-cyan uppercase font-bold">
                  ADMIN COCKPIT
                </span>
              </div>
            </Link>
          </div>

          {/* Core Navigation Links */}
          <div className="p-4 space-y-4">
            <div className="space-y-1 font-heading">
              <span className="block px-3 text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">
                Operations
              </span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-comic-yellow text-comic-black font-black"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-neutral-400"}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Settings Links */}
            <div className="space-y-1 font-heading pt-2 border-t border-neutral-800/80">
              <span className="block px-3 text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">
                Control & Config
              </span>
              {settingItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-comic-cyan text-comic-black font-black"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-neutral-400"}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Info & Back Link */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-comic-yellow text-comic-black flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name?.slice(0, 2)?.toUpperCase() || "VP"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-heading font-bold text-white truncate">
                  {currentUser?.name || "Admin User"}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-comic-yellow font-bold">
                  <UserCheck className="w-3 h-3" />
                  <span>{currentUser?.role || "ADMIN"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-neutral-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white p-2 rounded hover:bg-neutral-800/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Public Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operational Bar */}
        <header className="h-16 bg-[#111218] border-b border-neutral-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 w-72">
            <Search className="w-4 h-4 text-neutral-500" />
            <span className="text-xs font-mono text-neutral-400">
              Viral Plug Master Control Center
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-comic-green animate-pulse" />
              <span className="text-neutral-300">Database: PostgreSQL 17 Live</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
