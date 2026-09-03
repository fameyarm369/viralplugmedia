import React from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { WhatsAppPill } from "@/components/public/WhatsAppPill";
import { MarqueeBanner } from "@/components/comic/MarqueeBanner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-comic-black text-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <MarqueeBanner />
      <Footer />
      <WhatsAppPill />
    </div>
  );
}
