"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ShieldCheck, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { ComicButton } from "../comic/ComicButton";

const VERTICALS_COL_1 = [
  {
    num: "01",
    title: "STAY & PROPERTY",
    keywords: "Real Estate • Hotels • Room Stays",
    href: "/services?category=stay-realestate",
  },
  {
    num: "03",
    title: "SPORTS & CULTURE",
    keywords: "Football • Sports Gear • Fan Communities",
    href: "/services?category=sports-football",
  },
  {
    num: "05",
    title: "LOCAL COMMERCE",
    keywords: "Shops • Retail • Footfall Campaigns",
    href: "/services?category=local-shops",
  },
];

const VERTICALS_COL_2 = [
  {
    num: "02",
    title: "D2C & FOOD",
    keywords: "Food Brands • Honey • Consumer Products",
    href: "/services?category=food-honey",
  },
  {
    num: "04",
    title: "FASHION & STYLE",
    keywords: "Apparel • Shoes • Lifestyle Brands",
    href: "/services?category=fashion-shoes",
  },
  {
    num: "06",
    title: "CREATOR & EVENTS",
    keywords: "Celebrities • Creators • Launches • Events",
    href: "/services?category=celebrity-events",
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
      <div className="absolute inset-0 bg-halftone-dots opacity-40 pointer-events-none" />

      {/* Top CTA Banner */}
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

      {/* Main Footer Links */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
        {/* Col 1: Brand Info */}
        <div className="space-y-4 lg:col-span-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-comic-yellow text-comic-black rounded border-2 border-black flex items-center justify-center font-display text-xl font-black shadow-[2px_2px_0px_#FF0055]">
              VP
            </div>
            <span className="font-display text-2xl tracking-wider text-white">
              VIRAL PLUG MEDIA
            </span>
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed font-body">
            Next-gen marketing engine, CRM, and media growth ecosystem powered by real client photography and the Media-Reactive Comic Poster Design Engine.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-comic-cyan">
            <ShieldCheck className="w-4 h-4" />
            <span>DPDP Act 2026 Compliant</span>
          </div>
        </div>

        {/* Col 2: Services / Campaign Verticals */}
        <div className="lg:col-span-5 md:col-span-2">
          <h4 className="font-display text-lg uppercase tracking-wider text-comic-yellow mb-5">
            Campaign Verticals
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {/* Column 1: 01, 03, 05 */}
            <div className="space-y-4 sm:space-y-5">
              {VERTICALS_COL_1.map((item) => (
                <Link
                  key={item.num}
                  href={item.href}
                  className="group flex items-start gap-2.5 transition-transform duration-200 hover:translate-x-0.5"
                >
                  <span className="font-mono text-xs font-semibold text-comic-yellow pt-0.5 shrink-0 tracking-wider">
                    {item.num}
                  </span>
                  <div>
                    <h5 className="font-heading font-bold text-sm text-white uppercase tracking-wide group-hover:text-comic-yellow transition-colors leading-snug">
                      {item.title}
                    </h5>
                    <p className="text-xs text-neutral-400 font-body leading-relaxed group-hover:text-neutral-300 transition-colors mt-0.5">
                      {item.keywords}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Column 2: 02, 04, 06 */}
            <div className="space-y-4 sm:space-y-5">
              {VERTICALS_COL_2.map((item) => (
                <Link
                  key={item.num}
                  href={item.href}
                  className="group flex items-start gap-2.5 transition-transform duration-200 hover:translate-x-0.5"
                >
                  <span className="font-mono text-xs font-semibold text-comic-yellow pt-0.5 shrink-0 tracking-wider">
                    {item.num}
                  </span>
                  <div>
                    <h5 className="font-heading font-bold text-sm text-white uppercase tracking-wide group-hover:text-comic-yellow transition-colors leading-snug">
                      {item.title}
                    </h5>
                    <p className="text-xs text-neutral-400 font-body leading-relaxed group-hover:text-neutral-300 transition-colors mt-0.5">
                      {item.keywords}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Platform & Legal */}
        <div className="lg:col-span-2 md:col-span-1">
          <h4 className="font-display text-lg uppercase tracking-wider text-comic-pink mb-4">
            Platform & Portals
          </h4>
          <ul className="space-y-2.5 text-sm text-neutral-300 font-heading font-medium">
            <li>
              <Link href="/case-studies" className="hover:text-comic-yellow transition-colors">
                Verified Case Studies
              </Link>
            </li>
            {hasAdminRights ? (
              <li>
                <Link href="/admin" className="hover:text-comic-yellow transition-colors font-bold text-comic-yellow">
                  SaaS Admin & CRM Cockpit →
                </Link>
              </li>
            ) : sessionUser ? (
              <li>
                <Link href="/portal" className="hover:text-comic-yellow transition-colors font-bold text-comic-cyan">
                  My Client Portal →
                </Link>
              </li>
            ) : (
              <li>
                <Link href="/login" className="hover:text-comic-yellow transition-colors">
                  Account Sign In
                </Link>
              </li>
            )}
            <li>
              <Link href="/privacy-policy" className="hover:text-comic-yellow transition-colors">
                Privacy Policy (India DPDP 2026)
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & WhatsApp */}
        <div className="lg:col-span-2 md:col-span-1">
          <h4 className="font-display text-lg uppercase tracking-wider text-comic-cyan mb-4">
            Direct Reach
          </h4>
          <div className="space-y-3 text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-comic-yellow" />
              <span>growth@viralplugmedia.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-comic-yellow" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-comic-yellow" />
              <span>Mumbai • Bengaluru • New Delhi</span>
            </div>
            <div className="pt-2">
              <a
                href="https://wa.me/919876543210?text=Hello%20Viral%20Plug%20Media!%20I%20want%20to%20scale%20my%20business%20campaign."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-black font-heading font-black text-xs px-4 py-2 rounded border-2 border-black shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5"
              >
                <MessageSquare className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-neutral-800 py-6 px-4 text-center text-xs font-mono text-neutral-500">
        © 2026 VIRAL PLUG MEDIA PLATFORM. ALL RIGHTS RESERVED. POWERED BY NEXT.JS 16 & POSTGRESQL 17.
      </div>
    </footer>
  );
};
