import React from "react";
import Link from "next/link";
import Navbar from "@/src/components/Navbar";
import { ArrowLeft, RotateCcw } from "lucide-react";

export const metadata = {
  title: "Refund Policy | LovePage",
  description: "14-Day Refund Policy for LovePage (lovepage.site).",
};

export default function RefundPolicyPage() {
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
              <RotateCcw className="h-3.5 w-3.5" />
              <span>14-Day Money-Back Guarantee</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2d221e]">
              Refund Policy
            </h1>
            <p className="text-xs text-[#7e6d60] mt-1.5">
              Effective Date: November 22, 2026 • LovePage (https://lovepage.site)
            </p>
          </div>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">1. 14-Day Full Refund Right</h2>
            <p>
              At <strong>LovePage</strong> (<a href="https://lovepage.site" className="text-[#cf493e] underline">https://lovepage.site</a>), we want you to be delighted with your digital keepsake or scrapbook album. If you purchase any Premium template (such as Vol. 03 &ldquo;Our Little Adventure&rdquo; or Vol. 04 &ldquo;Scrapbook Album&rdquo;), you have the right to cancel your order and request a <strong>full refund within 14 days</strong> of the transaction date, without giving any reason.
            </p>
          </section>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">2. How to Request a Refund</h2>
            <p>
              Our order process is conducted by our online reseller and Merchant of Record, <strong>Paddle.com</strong>, which handles all billing inquiries and returns. To request a refund within 14 days of purchase, you can either:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Email us directly at{" "}
                <a href="mailto:hello@lovepage.site" className="text-[#cf493e] font-semibold underline">
                  hello@lovepage.site
                </a>{" "}
                with the email address used at checkout or your Paddle receipt number, or
              </li>
              <li>
                Use the buyer support link included in your email receipt from <strong>Paddle.com</strong> (<a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-[#cf493e] underline">https://paddle.net</a>).
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-[#4a3f38] leading-relaxed">
            <h2 className="text-lg font-bold text-[#2d221e]">3. Processing Time</h2>
            <p>
              Once approved, refunds are issued back to your original payment method (Visa, Mastercard, Apple Pay, Google Pay, or PayPal) and typically appear on your statement within 3 to 5 business days.
            </p>
          </section>

          <div className="pt-6 border-t border-[#efe2d3] flex flex-wrap items-center gap-5 text-xs font-semibold text-[#cf493e]">
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
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
