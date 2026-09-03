"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export const WhatsAppPill = () => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
      {/* Speech Bubble Promo */}
      <div className="hidden sm:flex items-center gap-2 bg-comic-black border-2 border-comic-yellow text-white text-xs font-heading font-bold px-3.5 py-2 rounded-lg shadow-[4px_4px_0px_#FFE600] animate-pulse-comic">
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
        <span>Need Instant Campaign Advice? Chat Live!</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setClosed(true);
          }}
          className="text-neutral-400 hover:text-white ml-1"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main WhatsApp Circular Button */}
      <a
        href="https://wa.me/919876543210?text=Hello%20Viral%20Plug%20Media!%20I%20want%20to%20discuss%20a%20campaign%20for%20my%20business."
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#25D366] text-black rounded-full border-[3px] border-comic-black shadow-[4px_4px_0px_#0A0A0C] flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Open WhatsApp Chat"
      >
        <MessageCircle className="w-7 h-7 text-black fill-black" />
      </a>
    </div>
  );
};
