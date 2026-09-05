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
  Search,
  UserCheck,
  LogOut,
  DollarSign,
  Briefcase,
  Mail,
  Download,
  ExternalLink,
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { GlobalSearchModal } from "@/components/admin/GlobalSearchModal";
import { ExportReportsModal } from "@/components/admin/ExportReportsModal";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lang, setLang] = useState<"EN" | "HI">("EN");

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    // Cmd+K or Ctrl+K shortcut listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
    { label: "Live Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Campaigns Central", href: "/admin/campaigns", icon: Flame },
    { label: "Client Accounts", href: "/admin/clients", icon: Briefcase },
    { label: "Landing Controller", href: "/admin/homepage-showcase", icon: LayoutGrid },
    { label: "Leads & CRM", href: "/admin/leads", icon: Users },
    { label: "Media & Palette Studio", href: "/admin/media-library", icon: ImageIcon },
  ];

  const settingItems = [
    { label: "Super Admin Working Emails", href: "/admin/settings/working-emails", icon: Mail },
    { label: "Team & RBAC Access", href: "/admin/settings/team", icon: ShieldCheck },
    { label: "AI Deal History", href: "/admin/settings/deal-history", icon: DollarSign },
    { label: "Payment Settings", href: "/admin/settings/payments", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col lg:flex-row">
      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Export Reports Modal */}
      <ExportReportsModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 bg-[#111218] border-r-2 border-neutral-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header */}
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-comic-yellow text-comic-black rounded-lg border-2 border-black flex items-center justify-center font-display text-lg font-black shadow-[2px_2px_0px_#FF0055]">
                VP
              </div>
              <div>
                <span className="font-display text-base tracking-wider text-white">
                  VIRAL PLUG
                </span>
                <span className="block text-[9px] font-mono text-comic-cyan uppercase font-bold tracking-widest">
                  EVENT ADMIN COCKPIT
                </span>
              </div>
            </Link>
          </div>

          {/* Core Navigation Links */}
          <div className="p-3 space-y-4">
            <div className="space-y-1 font-heading">
              <span className="block px-3 py-1 text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">
                Operations
              </span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-comic-yellow text-comic-black font-black shadow-[2px_2px_0px_#000]"
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

            {/* Settings & Admin Vault Links */}
            <div className="space-y-1 font-heading pt-2 border-t border-neutral-800/80">
              <span className="block px-3 py-1 text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">
                Control & Config
              </span>
              {settingItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-comic-cyan text-comic-black font-black shadow-[2px_2px_0px_#000]"
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

            {/* Client Portal Link */}
            <div className="pt-2 border-t border-neutral-800/80">
              <Link
                href="/portal"
                target="_blank"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono font-bold bg-comic-green/10 text-comic-green border border-comic-green/30 hover:bg-comic-green/20 transition-all"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Client Live Portal</span>
                </div>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-comic-green text-black font-bold">
                  Client View
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* User Info & Back Link */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-comic-yellow text-comic-black flex items-center justify-center font-bold text-xs shrink-0 border border-black">
                {currentUser?.name?.slice(0, 2)?.toUpperCase() || "VP"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-heading font-bold text-white truncate">
                  {currentUser?.name || "Admin Executive"}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-mono text-comic-yellow font-bold">
                  <UserCheck className="w-3 h-3" />
                  <span>{currentUser?.role || "SUPER ADMIN"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800/50 transition-colors"
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
          {/* Global Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800/80 px-3.5 py-1.5 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-400 transition-all hover:border-comic-yellow/50 group"
          >
            <Search className="w-3.5 h-3.5 text-comic-yellow group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Search campaigns, clients, emails...</span>
            <span className="sm:hidden">Search</span>
            <kbd className="text-[10px] bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700 text-neutral-300">
              ⌘K
            </kbd>
          </button>

          {/* Top Actions & System Telemetry */}
          <div className="flex items-center gap-3">
            {/* Export Reports Button */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-800 text-xs font-mono font-bold text-comic-cyan hover:text-white transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export Reports</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "EN" ? "HI" : "EN")}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-comic-yellow" />
              <span>{lang}</span>
            </button>

            {/* Light / Dark Mode Mock */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-300 hover:text-comic-yellow transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-comic-yellow" />}
            </button>

            {/* Database Live Telemetry */}
            <div className="hidden lg:flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-comic-green animate-pulse" />
              <span className="text-neutral-300">PostgreSQL 17 Live</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

