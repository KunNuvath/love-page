import React from "react";
import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | LovePage",
  description: "Privacy Policy for LovePage (lovepage.site).",
};

export default function PrivacyPolicyPage() {
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
              <Lock className="h-3.5 w-3.5" />
              <span>Data &amp; Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2d221e]">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#7e6d60] mt-1.5">
              Effective Date: November 22, 2026 • LovePage (https://lovepage.site)
            </p>
          </div>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">1. Information We Collect</h2>
            <p>
              When you use <strong>LovePage</strong> (<a href="https://lovepage.site" className="text-[#cf493e] underline">https://lovepage.site</a>), we collect only the minimum information required to provide our digital scrapbook service:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Account Details:</strong> Your email address and basic profile information when you sign in via Email or Google OAuth.
              </li>
              <li>
                <strong>Scrapbook Content:</strong> Photos, captions, notes, and music selections that you voluntarily upload to create your digital keepsake page.
              </li>
              <li>
                <strong>Billing &amp; Transaction Data:</strong> Payments for Premium templates are processed securely by our Merchant of Record, <strong>Paddle.com</strong>. We do not store your credit card numbers or full financial details on our servers.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">2. How We Use Your Information</h2>
            <p>
              We use your information strictly to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Host, render, and save your personalized scrapbook and photo album pages.</li>
              <li>Send one-time verification codes (OTPs) and customer support replies.</li>
              <li>Verify and unlock Premium templates linked to your account upon purchase.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">3. Data Sharing &amp; Third-Party Services</h2>
            <p>
              We never sell your personal information or photos to third parties. We rely on trusted infrastructure providers strictly to operate the service:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Supabase:</strong> Secure authentication and cloud storage for uploaded scrapbook media.</li>
              <li><strong>Paddle.com:</strong> Secure global payment processing, invoicing, and tax compliance.</li>
              <li><strong>Vercel:</strong> Web application hosting and delivery.</li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">4. Your Rights &amp; Data Deletion</h2>
            <p>
              You may edit or delete your scrapbook content at any time. To request complete deletion of your account and associated data, email us at{" "}
              <a href="mailto:support@lovepage.site" className="text-[#cf493e] font-semibold underline">
                support@lovepage.site
              </a>
              .
            </p>
          </section>

          <div className="pt-6 border-t border-[#efe2d3] flex flex-wrap items-center gap-5 text-xs font-semibold text-[#cf493e]">
            <Link href="/terms" className="hover:underline">
              Terms of Service
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
