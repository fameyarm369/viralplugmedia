import React from "react";
import { Shield, Lock, FileText, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-comic-black text-white min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-comic-cyan text-comic-black font-display text-xs px-3 py-1 uppercase tracking-wider rounded border-2 border-black shadow-[2px_2px_0px_#000]">
            <Shield className="w-4 h-4" />
            INDIA DPDP ACT 2026 COMPLIANCE
          </div>
          <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
            DATA PROTECTION & PRIVACY POLICY
          </h1>
          <p className="text-sm font-mono text-neutral-400">
            Effective Date: September 2026 • Version 2.4
          </p>
        </div>

        {/* Content Body */}
        <div className="comic-card p-8 sm:p-12 bg-neutral-900 border-2 border-comic-black space-y-8 text-neutral-300 font-body text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-display text-2xl uppercase text-comic-yellow flex items-center gap-2">
              <Lock className="w-5 h-5 text-comic-yellow" />
              1. Commitment to India DPDP Act 2026
            </h2>
            <p>
              Viral Plug Media operates in strict adherence to the Digital Personal Data Protection (DPDP) Act, 2026 of India. We process personal data solely for the lawful purpose of delivering advertising campaigns, CRM communication, proposal generation, and performance analytics.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl uppercase text-comic-pink flex items-center gap-2">
              <FileText className="w-5 h-5 text-comic-pink" />
              2. Data Collected & Grounds for Processing
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Lead & Contact Data:</strong> Name, official phone number, business email, brand category, and planned budget submitted through enquiry forms.
              </li>
              <li>
                <strong>Uploaded Brand Media:</strong> High-resolution photos, product packshots, and video assets uploaded for the purpose of color palette extraction and creative advertising production.
              </li>
              <li>
                <strong>Communication Metadata:</strong> WhatsApp message timestamps and template delivery statuses (message content is not retained on our public servers).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl uppercase text-comic-cyan flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-comic-cyan" />
              3. Client Ownership & Rights on Uploaded Media
            </h2>
            <p>
              Clients retain 100% intellectual property ownership of their raw uploaded photos and footage. By submitting media, clients grant Viral Plug Media a non-exclusive license solely to generate advertising creatives, auto-extracted color palettes, and performance ad variants during active campaigns.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-2xl uppercase text-white flex items-center gap-2">
              4. Data Retention & Right to Erasure
            </h2>
            <p>
              Under DPDP 2026, clients may request complete data erasure or export at any time by emailing <code>privacy@viralplugmedia.com</code>. Lead records without active campaigns are automatically purged after 24 months.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
