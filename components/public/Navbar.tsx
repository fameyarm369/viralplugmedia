"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ComicButton } from "@/components/comic/ComicButton";
import { EntryChoiceModal } from "@/components/public/EntryChoiceModal";
import { Zap, Shield, Flame, User, LogOut, LayoutDashboard } from "lucide-react";

export const Navbar = () => {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [showChoice, setShowChoice] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setSessionUser(data.user);
        } else {
          setSessionUser(null);
        }
      })
      .catch(() => setSessionUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    setSessionUser(null);
    router.push("/");
    router.refresh();
  };

  const hasAdminRights =
    sessionUser &&
    (sessionUser.role === "SUPER_ADMIN" ||
      sessionUser.role === "ADMIN" ||
      sessionUser.hasAdminAccess === true);

  return (
    <header className="sticky top-0 z-50 bg-comic-black/95 backdrop-blur-md border-b-[3.5px] border-comic-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0" aria-label="Viral Plug Home">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-comic-yellow text-comic-black rounded-lg border-2 border-comic-black flex items-center justify-center font-display text-xl sm:text-2xl font-black shadow-[3px_3px_0px_#FF0055] transition-transform group-hover:rotate-6">
            VP
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl sm:text-2xl tracking-wider leading-none text-white group-hover:text-comic-yellow transition-colors">
              VIRAL PLUG<span className="text-comic-pink">.</span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-comic-cyan uppercase font-bold">
              MEDIA PLATFORM
            </span>
          </div>
        </Link>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* SaaS Admin Cockpit — STRICTLY role-gated */}
          {hasAdminRights && (
            <Link href="/admin">
              <span className="text-xs font-mono font-bold text-comic-yellow hover:text-white flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 border-2 border-comic-yellow/50 hover:border-comic-yellow rounded-md bg-neutral-900/90 shadow-[2px_2px_0px_#FFE600] transition-all hover:-translate-y-0.5">
                <Shield className="w-3.5 h-3.5 text-comic-yellow" />
                <span className="hidden sm:inline">Admin Cockpit</span>
              </span>
            </Link>
          )}

          {/* Client Portal Button (if logged in as CLIENT) */}
          {sessionUser && !hasAdminRights && (
            <Link href="/portal">
              <span className="text-xs font-mono font-bold text-comic-cyan hover:text-white flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 border border-comic-cyan/50 hover:border-comic-cyan rounded-md bg-neutral-900/90 shadow-[2px_2px_0px_#00F0FF] transition-all hover:-translate-y-0.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-comic-cyan" />
                <span className="hidden sm:inline">Client Portal</span>
              </span>
            </Link>
          )}

          {/* Bespoke Viral Plug Sign In Control / User Session */}
          {sessionUser ? (
            <button
              onClick={handleLogout}
              className="group inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md bg-neutral-900/90 hover:bg-neutral-800 border-2 border-neutral-700/80 hover:border-comic-pink text-xs font-mono font-bold text-neutral-300 hover:text-comic-pink shadow-[2px_2px_0px_#0A0A0C] hover:shadow-[2px_2px_0px_#FF0055] transition-all hover:-translate-y-0.5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-md bg-neutral-900/90 hover:bg-neutral-850 border-2 border-neutral-700/80 hover:border-comic-yellow text-neutral-200 hover:text-white transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_#0A0A0C] hover:shadow-[3px_3px_0px_#FFE600]"
              title="Sign In to Platform"
            >
              {/* Custom Comic User Avatar with Hot Pink Energy Dot */}
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded bg-neutral-800 border border-neutral-600/90 flex items-center justify-center text-comic-yellow group-hover:bg-comic-yellow group-hover:text-comic-black group-hover:border-comic-black transition-all duration-150 shrink-0">
                <User className="w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-comic-pink ring-1.5 ring-comic-black shadow-[0_0_5px_#FF0055]" />
              </div>

              {/* Sign In Label */}
              <span className="font-heading font-bold text-xs sm:text-sm tracking-wider uppercase group-hover:text-comic-yellow transition-colors">
                Sign In
              </span>

              {/* Micro Lightning Accent */}
              <Zap className="w-3 h-3 text-comic-yellow opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-150 hidden sm:inline-block" />
            </Link>
          )}

          {/* Primary Campaign CTA Button */}
          <ComicButton
            variant="yellow"
            size="sm"
            icon={<Flame className="w-4 h-4 text-comic-black" />}
            onClick={() => setShowChoice(true)}
            className="shadow-[3px_3px_0px_#FF0055] hover:shadow-[5px_5px_0px_#FF0055] whitespace-nowrap text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4"
          >
            <span className="hidden sm:inline">START MY CAMPAIGN ⚡</span>
            <span className="sm:hidden">START ⚡</span>
          </ComicButton>
        </div>
      </div>

      {/* Entry Choice Modal — opens on "Start My Campaign" click */}
      <EntryChoiceModal open={showChoice} onClose={() => setShowChoice(false)} />
    </header>
  );
};