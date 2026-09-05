"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Flame,
  User,
  Mail,
  LayoutGrid,
  FileText,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  category: "Campaign" | "Client" | "Working Email" | "Theme";
  subtitle: string;
  href: string;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const mockIndex: SearchResult[] = [
      {
        id: "1",
        title: "Royal Rajwada Palace Wedding & Sangeet Gala",
        category: "Campaign",
        subtitle: "Aditi Singhania • Destination Udaipur • ₹45,00,000",
        href: "/admin/campaigns",
      },
      {
        id: "2",
        title: "Sunburn EDM Arena Festival — Mumbai Edition",
        category: "Campaign",
        subtitle: "Percept Live • ₹85,00,000 • 68% Complete",
        href: "/admin/campaigns",
      },
      {
        id: "3",
        title: "Aditi Singhania & Aryan Malhotra",
        category: "Client",
        subtitle: "aditi.singhania@heritagegroup.in • Lifetime Spend: ₹45,00,000",
        href: "/admin/clients/camp-req-101",
      },
      {
        id: "4",
        title: "Vikramaditya Roy",
        category: "Working Email",
        subtitle: "vikramaditya.roy@viralplug.com • Event Director",
        href: "/admin/settings/working-emails",
      },
      {
        id: "5",
        title: "Grand Diwali Light & Sparkle Festival",
        category: "Theme",
        subtitle: "Active Festive Theme • Auto-Expires Nov 20",
        href: "/admin/homepage-showcase",
      },
      {
        id: "6",
        title: "Raksha Bandhan Sibling Blitz",
        category: "Theme",
        subtitle: "Saffron & Gold Festive Ribbons",
        href: "/admin/homepage-showcase",
      },
    ];

    const matched = mockIndex.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );

    setResults(matched);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="comic-card max-w-2xl w-full bg-[#12131A] border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] space-y-4 rounded-3xl p-6">
        {/* Search Input */}
        <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
          <Search className="w-5 h-5 text-comic-yellow shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search campaigns, clients, working emails, themes (Press Esc to close)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none w-full font-mono"
          />
          <button onClick={onClose} className="text-neutral-400 hover:text-white font-mono text-xs">
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {query.trim() && results.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-neutral-500">
              No matching records found for "{query}".
            </div>
          ) : results.length > 0 ? (
            results.map((res) => (
              <div
                key={res.id}
                onClick={() => {
                  router.push(res.href);
                  onClose();
                }}
                className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-800 hover:border-comic-yellow cursor-pointer flex items-center justify-between text-xs font-mono transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      res.category === "Campaign"
                        ? "bg-comic-yellow text-comic-black"
                        : res.category === "Client"
                        ? "bg-comic-cyan text-comic-black"
                        : res.category === "Working Email"
                        ? "bg-comic-green text-black"
                        : "bg-comic-pink text-white"
                    }`}
                  >
                    {res.category}
                  </span>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-comic-yellow transition-colors">
                      {res.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400">{res.subtitle}</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs font-mono text-neutral-500 space-y-1">
              <p>Type to search across all platform entities.</p>
              <span className="text-[10px] text-neutral-600">Quick keys: Press Cmd+K / Ctrl+K anywhere</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
