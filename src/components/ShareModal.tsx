"use client";

import React, { useState } from "react";
import { X, Copy, Check, ExternalLink, Share2, Heart, Sparkles, Download } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  title?: string;
  theme?: "light" | "cutting-mat";
}

export default function ShareModal({
  isOpen,
  onClose,
  slug,
  title = "Our Love Keepsake",
  theme = "light",
}: Props) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // NEXT_PUBLIC_SITE_URL must be set in Vercel → Settings → Environment Variables.
  // It falls back to window.location.origin locally so dev always works.
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  // /p/<slug> is the canonical public URL — served by src/app/p/[id]/page.tsx
  const shareUrl = `${origin}/p/${slug}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    shareUrl
  )}&bgcolor=faf6ee&color=2d221e`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `I made a special love page keepsake for you! 💖`,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  const isDark = theme === "cutting-mat";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div
        className={`relative w-full max-w-md rounded-3xl p-4.5 xs:p-6 sm:p-8 shadow-2xl border text-center transition-all max-h-[92dvh] overflow-y-auto ${
          isDark
            ? "bg-[#183d31] text-white border-white/20"
            : "bg-[#faf6ee] text-[#362e2b] border-[#e4d6c4]"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full hover:bg-black/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-3 h-11 w-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
          <Heart className="h-5 w-5 fill-white" />
        </div>

        <h3 className="font-handwriting text-2xl xs:text-3xl font-bold mb-1">
          Share Your Keepsake
        </h3>
        <p className="text-[11px] xs:text-xs opacity-75 mb-4 sm:mb-6">
          Anyone with this link can view the interactive memories &amp; send live love reactions!
        </p>

        {/* QR Code */}
        <div className="p-3 xs:p-4 bg-white rounded-2xl shadow-inner inline-block mx-auto mb-4 border border-black/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="Scan QR to open love page"
            className="w-36 h-36 xs:w-44 xs:h-44 rounded-lg object-contain mx-auto"
          />
          <span className="text-[9px] xs:text-[10px] font-mono opacity-60 block mt-1.5">
            Scan with smartphone camera
          </span>
        </div>

        {/* Link Copy Box */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-black/5 border border-black/10 mb-5 text-left">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-2 text-xs font-mono truncate focus:outline-hidden"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs transition-all active:scale-95"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>

        {/* Native share button if available */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Send to Partner</span>
          </button>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 border border-white/20 transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open</span>
          </a>
        </div>
      </div>
    </div>
  );
}
