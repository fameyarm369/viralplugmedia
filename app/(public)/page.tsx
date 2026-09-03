import React from "react";
import { HeroSection } from "@/components/public/HeroSection";
import { MarqueeBanner } from "@/components/comic/MarqueeBanner";
import { CategoryGrid } from "@/components/public/CategoryGrid";
import { ProofSection } from "@/components/public/ProofSection";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <MarqueeBanner />
      <CategoryGrid />
      <ProofSection />
    </div>
  );
}
