"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Building,
  UtensilsCrossed,
  Trophy,
  Sparkles,
  Store,
  Megaphone,
} from "lucide-react";
import { ComicButton } from "../comic/ComicButton";

const VERTICALS_COL_1 = [
  {
    num: "01",
    title: "STAY & PROPERTY",
    keywords: "Real Estate • Hotels • Room Stays",
    href: "/services?category=stay-realestate",
    icon: Building,
  },
  {
    num: "03",
    title: "SPORTS & CULTURE",
    keywords: "Football • Sports Gear • Fan Communities",
    href: "/services?category=sports-football",
    icon: Trophy,
  },
  {
    num: "05",
    title: "LOCAL COMMERCE",
    keywords: "Shops • Retail • Footfall Campaigns",
    href: "/services?category=local-shops",
    icon: Store,
  },
];

const VERTICALS_COL_2 = [
  {
    num: "02",
    title: "D2C & FOOD",
    keywords: "Food Brands • Honey • Consumer Products",
    href: "/services?category=food-honey",
    icon: UtensilsCrossed,
  },
  {
    num: "04",
    title: "FASHION & STYLE",
    keywords: "Apparel • Shoes • Lifestyle Brands",
    href: "/services?category=fashion-shoes",
    icon: Sparkles,
  },
  {
    num: "06",
    title: "CREATOR & EVENTS",
    keywords: "Celebrities • Creators • Launches • Events",
    href: "/services?category=celebrity-events",
    icon: Megaphone,
  },
];

export const Footer = () => {
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setSessionUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const hasAdminRights =
    sessionUser &&
    (sessionUser.role === "SUPER_ADMIN" ||
      sessionUser.role === "ADMIN" ||
      sessionUser.hasAdminAccess === true);

  return (
    <footer className="bg-comic-black border-t-4 border-comic-black text-white relative overflow-hidden">
      {/* Halftone pattern backdrop */}
      <div className="absolute inset-0 bg-halftone-dots opacity-35 pointer-events-none" />

      {/* Top CTA Comic Banner */}
      <div className="relative border-b-4 border-comic-black bg-comic-yellow text-comic-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div>
            <span className="comic-badge bg-comic-pink text-white text-xs mb-3">
              READY TO GO VIRAL? 🔥
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase leading-none tracking-tight">
              STOP RUNNING BORING ADS.
            </h2>
            <p className="font-heading font-bold text-lg text-neutral-900 mt-2 max-w-xl">
              Turn your real product photos & videos into unstoppable high-converting comic poster powerhouses.
            </p>
          </div>

          <Link href="/enquiry">
            <ComicButton variant="pink" size="lg" icon={<ArrowRight className="w-5 h-5 text-white" />}>
              Get Campaign Proposal
            </ComicButton>
          </Link>
        </div>
      </div>

      {/* Main Footer Composition */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
        
        {/* COLUMN 1 — BRAND */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-comic-yellow text-comic-black rounded border-2 border-black flex items-center justify-center font-display text-2xl font-black shadow-[3px_3px_0px_#FF0055] shrink-0">
              VP
            </div>
            <div>
              <span className="font-display text-2xl sm:text-3xl tracking-wider text-white block leading-none">
                VIRAL PLUG
              </span>
              <span className="font-display text-xl sm:text-2xl tracking-wider text-comic-yellow block leading-none">
                MEDIA
              </span>
            </div>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed font-body">
            Next-gen marketing engine, CRM, and media growth ecosystem powered by real client photography and the Media-Reactive Comic Poster Design Engine.
          </p>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-comic-cyan border border-comic-cyan/30 bg-comic-cyan/5 px-2.5 py-1 rounded">
            <ShieldCheck className="w-3.5 h-3.5 text-comic-cyan shrink-0" />
            <span>DPDP Act 2026 Compliant</span>
          </div>
        </div>

        {/* COLUMN 2 — CAMPAIGN VERTICALS (EDITORIAL DIRECTORY) */}
        <div className="lg:col-span-5 md:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-comic-yellow shrink-0" />
            <h4 className="font-display text-lg uppercase tracking-wider text-comic-yellow leading-none">
              Campaign Verticals
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {/* Chapters 01, 03, 05 */}
            <div className="space-y-5">
              {VERTICALS_COL_1.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.num}
                    href={item.href}
                    className="group flex items-start gap-2.5 transition-transform duration-200 hover:translate-x-1 block"
                  >
                    <span className="font-mono text-xs font-bold text-comic-yellow pt-0.5 shrink-0 tracking-wider">
                      {item.num}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-heading font-bold text-sm text-white uppercase tracking-wide group-hover:text-comic-yellow transition-colors leading-snug">
                          {item.title}
                        </h5>
                        <Icon className="w-3 h-3 text-neutral-500 group-hover:text-comic-cyan transition-colors shrink-0 opacity-70 group-hover:opacity-100" />
                      </div>
                      <p className="text-xs text-neutral-400 font-body leading-snug group-hover:text-neutral-300 transition-colors mt-0.5">
                        {item.keywords}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Chapters 02, 04, 06 */}
            <div className="space-y-5">
              {VERTICALS_COL_2.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.num}
                    href={item.href}
                    className="group flex items-start gap-2.5 transition-transform duration-200 hover:translate-x-1 block"
                  >
                    <span className="font-mono text-xs font-bold text-comic-yellow pt-0.5 shrink-0 tracking-wider">
                      {item.num}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-heading font-bold text-sm text-white uppercase tracking-wide group-hover:text-comic-yellow transition-colors leading-snug">
                          {item.title}
                        </h5>
                        <Icon className="w-3 h-3 text-neutral-500 group-hover:text-comic-cyan transition-colors shrink-0 opacity-70 group-hover:opacity-100" />
                      </div>
                      <p className="text-xs text-neutral-400 font-body leading-snug group-hover:text-neutral-300 transition-colors mt-0.5">
                        {item.keywords}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* COLUMN 3 — PLATFORM & PORTALS */}
        <div className="lg:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-comic-pink shrink-0" />
            <h4 className="font-display text-lg uppercase tracking-wider text-comic-pink leading-none">
              Platform & Portals
            </h4>
          </div>
          <ul className="space-y-3.5 text-sm font-heading font-medium">
            <li>
              <Link
                href="/case-studies"
                className="group flex items-center justify-between text-neutral-300 hover:text-comic-yellow transition-colors"
              >
                <span>Verified Case Studies</span>
                <span className="text-neutral-500 group-hover:text-comic-yellow group-hover:translate-x-1 transition-all text-xs font-mono">
                  →
                </span>
              </Link>
            </li>
            {hasAdminRights ? (
              <li>
                <Link
                  href="/admin"
                  className="group flex items-center justify-between font-bold text-comic-yellow hover:text-white transition-colors"
                >
                  <span>SaaS Admin & CRM</span>
                  <span className="group-hover:translate-x-1 transition-all text-xs font-mono">
                    →
                  </span>
                </Link>
              </li>
            ) : sessionUser ? (
              <li>
                <Link
                  href="/portal"
                  className="group flex items-center justify-between font-bold text-comic-cyan hover:text-comic-yellow transition-colors"
                >
                  <span>My Client Portal</span>
                  <span className="group-hover:translate-x-1 transition-all text-xs font-mono">
                    →
                  </span>
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  href="/login"
                  className="group flex items-center justify-between text-neutral-300 hover:text-comic-yellow transition-colors"
                >
                  <span>Account Sign In</span>
                  <span className="text-neutral-500 group-hover:text-comic-yellow group-hover:translate-x-1 transition-all text-xs font-mono">
                    →
                  </span>
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/privacy-policy"
                className="group flex items-center justify-between text-neutral-400 hover:text-comic-yellow transition-colors text-xs"
              >
                <span>Privacy Policy (India DPDP 2026)</span>
                <span className="text-neutral-500 group-hover:text-comic-yellow group-hover:translate-x-1 transition-all text-xs font-mono">
                  →
                </span>
              </Link>
            </li>
          </ul>
        </div>

        {/* COLUMN 4 — DIRECT REACH */}
        <div className="lg:col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-comic-cyan shrink-0" />
            <h4 className="font-display text-lg uppercase tracking-wider text-comic-cyan leading-none">
              Direct Reach
            </h4>
          </div>
          <div className="space-y-3.5 text-sm text-neutral-300">
            <a
              href="mailto:growth@viralplugmedia.com"
              className="flex items-center gap-2.5 text-neutral-300 hover:text-comic-cyan transition-colors group"
            >
              <Mail className="w-4 h-4 text-comic-yellow shrink-0 group-hover:text-comic-cyan transition-colors" />
              <span className="text-xs truncate">growth@viralplugmedia.com</span>
            </a>
            <a
              href="tel:+919876543210"
              className="flex items-center gap-2.5 text-neutral-300 hover:text-comic-cyan transition-colors group"
            >
              <Phone className="w-4 h-4 text-comic-yellow shrink-0 group-hover:text-comic-cyan transition-colors" />
              <span className="text-xs font-mono">+91 98765 43210</span>
            </a>
            <div className="flex items-center gap-2.5 text-neutral-400">
              <MapPin className="w-4 h-4 text-comic-yellow shrink-0" />
              <span className="text-xs">Mumbai • Bengaluru • New Delhi</span>
            </div>
            <div className="pt-2">
              <a
                href="https://wa.me/919876543210?text=Hello%20Viral%20Plug%20Media!%20I%20want%20to%20scale%20my%20business%20campaign."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-black font-heading font-black text-xs px-4 py-2.5 rounded border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-transform uppercase tracking-wider"
              >
                <MessageSquare className="w-4 h-4 fill-black text-black" />
                <span>Chat on WhatsApp</span>
                <span className="font-mono text-sm leading-none">→</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Comic Technical Production Credit Bar */}
      <div className="border-t border-neutral-800/80 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-neutral-500 text-center sm:text-left">
          <div>
            © 2026 VIRAL PLUG MEDIA PLATFORM. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-comic-green inline-block animate-pulse" />
            <span>POWERED BY NEXT.JS 16 & POSTGRESQL 17</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
