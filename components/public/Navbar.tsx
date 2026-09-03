"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComicButton } from "@/components/comic/ComicButton";
import { Zap, Menu, X, Shield, Sparkles, Flame } from "lucide-react";

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Services", href: "/services" },
    { label: "Case Studies", href: "/case-studies" },
    { label: "Palette Engine", href: "/#palette-demo" },
    { label: "Pricing", href: "/services#pricing" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-comic-black/95 backdrop-blur-md border-b-[3.5px] border-comic-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-11 h-11 bg-comic-yellow text-comic-black rounded-lg border-2 border-comic-black flex items-center justify-center font-display text-2xl font-black shadow-[3px_3px_0px_#FF0055] transition-transform group-hover:rotate-6">
            VP
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl tracking-wider leading-none text-white group-hover:text-comic-yellow transition-colors">
              VIRAL PLUG<span className="text-comic-pink">.</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-comic-cyan uppercase font-bold">
              MEDIA PLATFORM
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-heading text-sm uppercase tracking-wider font-bold transition-colors hover:text-comic-yellow ${
                pathname === link.href ? "text-comic-yellow" : "text-neutral-300"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/admin">
            <span className="text-xs font-mono font-bold text-neutral-400 hover:text-white flex items-center gap-1 px-3 py-1.5 border border-neutral-800 rounded bg-neutral-900/80">
              <Shield className="w-3.5 h-3.5 text-comic-cyan" />
              SaaS Admin Cockpit
            </span>
          </Link>

          <Link href="/enquiry">
            <ComicButton variant="yellow" size="sm" icon={<Flame className="w-4 h-4 text-comic-black" />}>
              Promote My Brand
            </ComicButton>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/enquiry">
            <ComicButton variant="yellow" size="sm">
              Enquire
            </ComicButton>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border-2 border-comic-black rounded bg-neutral-800 text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-comic-black border-b-4 border-comic-yellow p-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-heading text-lg font-bold text-neutral-200 hover:text-comic-yellow"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="font-mono text-sm text-comic-cyan flex items-center gap-2 pt-2 border-t border-neutral-800"
            >
              <Shield className="w-4 h-4" />
              Access Admin & CRM Cockpit
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
