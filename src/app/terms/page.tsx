import React from "react";
import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Terms of Service | LovePage",
  description: "Terms of Service and User Agreement for LovePage (lovepage.site).",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#fbf4ec] text-[#2d221e]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#cf493e] hover:underline mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to LovePage</span>
        </Link>

        <div className="bg-white rounded-3xl border border-[#e2d2c1] shadow-sm p-6 sm:p-10 space-y-6">
          <div className="border-b border-[#efe2d3] pb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Legal Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2d221e]">
              Terms of Service
            </h1>
            <p className="text-xs text-[#7e6d60] mt-1.5">
              Effective Date: November 22, 2026 • Applicable to LovePage (https://lovepage.site)
            </p>
          </div>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">1. Overview &amp; Acceptance of Terms</h2>
            <p>
              Welcome to <strong>LovePage</strong> (&ldquo;LovePage&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), operated at{" "}
              <a href="https://lovepage.site" className="text-[#cf493e] underline">
                https://lovepage.site
              </a>
              . LovePage provides interactive digital scrapbook, keepsake, and photo album templates that allow users to curate photos, notes, and music and share them via personalized web links. By accessing or using LovePage, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">2. Products, Pricing &amp; Payment Processing</h2>
            <p>
              LovePage offers free digital keepsake templates (Vol. 01 Polaroid Scrapbook and Vol. 02 Little Book of Us) as well as optional one-time paid Premium templates (Vol. 03 &ldquo;Our Little Adventure&rdquo; and Vol. 04 &ldquo;Scrapbook Album&rdquo;), each priced at a one-time payment of <strong>$4.99 USD</strong> (plus applicable local taxes).
            </p>
            <p>
              Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">3. Refund Policy</h2>
            <p>
              We stand behind our digital templates. In accordance with Paddle&apos;s consumer protection standards, you are entitled to request a full refund within <strong>14 days</strong> of your purchase date without giving any reason. Please review our dedicated{" "}
              <Link href="/refund" className="text-[#cf493e] font-semibold underline">
                Refund Policy
              </Link>{" "}
              for full details on how to request a refund.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">4. User Content &amp; Responsibilities</h2>
            <p>
              You retain full ownership of all photographs, text, audio clips, and personal content that you upload to LovePage. By uploading content and generating a shareable link, you grant LovePage a non-exclusive, revocable license solely to store, host, and display that content to visitors with whom you share your page link.
            </p>
            <p>
              You agree not to upload unlawful, infringing, hateful, or harmful material. We reserve the right to remove content that violates applicable laws or third-party rights.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">5. Limitation of Liability</h2>
            <p>
              LovePage is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To the fullest extent permitted by applicable law, LovePage shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the service.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">6. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service or need support with your LovePage account, please contact us at{" "}
              <a href="mailto:hello@lovepage.site" className="text-[#cf493e] font-semibold underline">
                hello@lovepage.site
              </a>
              .
            </p>
          </section>

          <div className="pt-6 border-t border-[#efe2d3] flex flex-wrap items-center gap-5 text-xs font-semibold text-[#cf493e]">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/refund" className="hover:underline">
              Refund Policy
            </Link>
            <Link href="/templates" className="hover:underline">
              Templates &amp; Pricing
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
