import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getScoreBadgeColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 90) return { bg: "bg-comic-yellow", text: "text-comic-black", label: "HOT 🔥" };
  if (score >= 75) return { bg: "bg-comic-cyan", text: "text-comic-black", label: "WARM ⚡" };
  return { bg: "bg-gray-200", text: "text-gray-800", label: "COLD ❄️" };
}

export function createWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
