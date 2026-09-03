"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  Flame,
  CreditCard,
  ShieldAlert,
  ArrowLeft,
  Bell,
  Search,
  UserCheck,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState("SUPER_ADMIN");

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Leads & CRM", href: "/admin/leads", icon: Users, badge: "4 New" },
    { label: "Media & Palettes", href: "/admin/media-library", icon: ImageIcon },
    { label: "Campaigns", href: "/admin/campaigns", icon: Flame },
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

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 font-heading">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-comic-yellow text-comic-black font-black"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-neutral-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-comic-pink text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Back Link */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-comic-cyan text-comic-black flex items-center justify-center font-bold text-xs">
              HR
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-heading font-bold text-white truncate">
                Harshit Ranjan
              </p>
              <div className="flex items-center gap-1 text-[10px] font-mono text-comic-yellow">
                <UserCheck className="w-3 h-3" />
                <span>{activeRole}</span>
              </div>
            </div>
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
            <input
              type="text"
              placeholder="Search leads, campaigns, media..."
              className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-comic-green animate-pulse" />
              <span className="text-neutral-300">Palette Engine: WASM Online</span>
            </div>

            <button className="relative p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-comic-pink" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
