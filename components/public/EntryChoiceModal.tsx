"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { X, MessageSquare, ClipboardList, ArrowRight } from "lucide-react";
import { createWhatsAppLink } from "@/lib/utils";

interface EntryChoiceModalProps {
  open: boolean;
  onClose: () => void;
}

export function EntryChoiceModal({ open, onClose }: EntryChoiceModalProps) {
  const router = useRouter();

  if (!open) return null;

  const whatsappUrl = createWhatsAppLink(
    "919876543210",
    "Hi, mujhe apne brand/event ke liye production enquiry discuss karni hai."
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-choice-title"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg comic-card bg-neutral-900 border-[3.5px] border-comic-black shadow-[10px_10px_0px_#FFE600] p-7 sm:p-9 animate-fadeIn">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2
          id="entry-choice-title"
          className="font-display text-2xl sm:text-3xl uppercase text-white text-center mb-2"
        >
          Aap Kya Create Karna Chahte Hain?
        </h2>
        <p className="text-xs font-mono text-neutral-400 text-center mb-8 max-w-sm mx-auto">
          Dono tareeke se aapko turant response milega — jo bhi comfortable lage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* WhatsApp path */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="group flex flex-col items-center text-center gap-3 p-5 rounded-lg border-2 border-neutral-700 bg-comic-black hover:border-[#25D366] transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[#25D366] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
              <MessageSquare className="w-6 h-6 text-black fill-black" />
            </div>
            <span className="font-heading font-black text-sm uppercase text-white">
              WhatsApp Pe Turant Baat Karein
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              1 minute mein reply milega, seedha team se
            </span>
          </a>

          {/* Form path */}
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push("/enquiry");
            }}
            className="group flex flex-col items-center text-center gap-3 p-5 rounded-lg border-2 border-neutral-700 bg-comic-black hover:border-comic-yellow transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-comic-yellow border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000]">
              <ClipboardList className="w-6 h-6 text-comic-black" />
            </div>
            <span className="font-heading font-black text-sm uppercase text-white">
              Apna Project Brief Bhariye
            </span>
            <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1">
              2-3 min · custom AI estimate milega <ArrowRight className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}