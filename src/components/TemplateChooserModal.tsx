"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  ArrowRight,
  X,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface TemplateChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateChooserModal({
  isOpen,
  onClose,
}: TemplateChooserModalProps) {
  // Background scroll lock: lock body scroll on open, restore previous value on close & unmount
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-up">
      {/* Click outside backdrop */}
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container: Flex column with dvh max height and overflow-hidden */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-modal-title"
        className="relative w-full max-w-3xl bg-[#fbf8f3] rounded-2xl sm:rounded-3xl border border-[#e2d2c1] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] max-h-[85dvh]"
      >
        {/* Header: shrink-0 so it stays fixed and never collapses */}
        <div className="shrink-0 px-6 py-5 border-b border-[#e8dccf] bg-[#f4ebe1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#cf493e] text-white flex items-center justify-center shadow-xs">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3
                id="template-modal-title"
                className="font-extrabold text-lg text-[#2d221e]"
              >
                Choose Your Love Template
              </h3>
              <p className="text-xs text-[#7e6d60]">
                Select the aesthetic format that fits your special story best
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-full hover:bg-black/10 text-[#6e5e50] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body: min-h-0 flex-1 overflow-y-auto overscroll-contain with touch-action: pan-y */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch touch-pan-y"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          {/* ═══════════════════════════════════════════════════════════
              TEMPLATE 1: Retro Polaroid Scrapbook (Vol. 01)
          ═══════════════════════════════════════════════════════════ */}
          <div className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border border-[#e5d6c5] shadow-sm hover:shadow-lg hover:border-[#cf493e]/40 transition-all group">
            <div>
              {/* Badge & Version */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#cf493e]/10 text-[#cf493e]">
                  Vol. 01 • Classic
                </span>
                <Heart className="h-4 w-4 text-[#cf493e]" />
              </div>

              {/* Title & Preview Image/Card Mockup */}
              <h4 className="font-extrabold text-xl text-[#2d221e] mb-1">
                Retro Polaroid Scrapbook
              </h4>
              <p className="text-xs text-[#7d6c60] mb-4">
                Warm vintage craft paper with floating hearts, romantic love letter, and background song melody.
              </p>

              {/* Visual Mini Mockup */}
              <div className="aspect-[16/10] bg-[#faf6ee] rounded-xl border border-dashed border-[#cbbeaa] p-3 mb-4 flex flex-col justify-between relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                <div className="w-16 h-4 bg-[#5b6d5c]/70 mx-auto -mt-4 mb-1 rounded-xs" />
                <div className="grid grid-cols-3 gap-1.5">
                  <div className="bg-white p-1 rounded shadow-2xs text-[8px] text-center -rotate-2">
                    <div className="aspect-square bg-rose-100 rounded-2xs mb-0.5" />
                    <span className="font-handwriting">Us</span>
                  </div>
                  <div className="bg-white p-1 rounded shadow-2xs text-[8px] text-center rotate-2">
                    <div className="aspect-square bg-pink-100 rounded-2xs mb-0.5" />
                    <span className="font-handwriting">Love</span>
                  </div>
                  <div className="bg-white p-1 rounded shadow-2xs text-[8px] text-center -rotate-1">
                    <div className="aspect-square bg-amber-100 rounded-2xs mb-0.5" />
                    <span className="font-handwriting">Always</span>
                  </div>
                </div>
                <div className="text-[10px] font-handwriting text-[#cf493e] text-center font-bold">
                  ♫ Miguel - Sure Thing
                </div>
              </div>

              {/* Key Features List */}
              <ul className="space-y-1.5 text-xs text-[#6e5e52] mb-6">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>6 rotatable polaroid photo frames with zoom</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Integrated background music audio player</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Handwritten vintage cursive love letter note</span>
                </li>
              </ul>
            </div>

            {/* Launch CTA */}
            <Link
              href="/scrapbook"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#cf493e] hover:bg-[#b83b31] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
            >
              <span>Open Polaroid Scrapbook</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              TEMPLATE 2: "Our Little Book" Spiral Journal (Vol. 02)
          ═══════════════════════════════════════════════════════════ */}
          <div className="flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border-2 border-emerald-600/30 shadow-sm hover:shadow-lg hover:border-emerald-600/60 transition-all group relative overflow-hidden">
            {/* NEW Glow Badge */}
            <div className="absolute -top-3 -right-3 w-16 h-16 overflow-hidden pointer-events-none">
              <div className="bg-washi-cherry text-white text-[9px] font-bold uppercase tracking-wider text-center py-1 rotate-45 translate-y-3 w-24 -translate-x-3 shadow-xs">
                NEW ✨
              </div>
            </div>

            <div>
              {/* Badge & Version */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700">
                  Vol. 02 • 18 Photos
                </span>
                <Sparkles className="h-4 w-4 text-emerald-600" />
              </div>

              {/* Title & Preview Image/Card Mockup */}
              <h4 className="font-extrabold text-xl text-[#2d221e] mb-1">
                Our Little Book (Spiral Journal)
              </h4>
              <p className="text-xs text-[#7d6c60] mb-4">
                Cutting-mat desk environment, 4 interactive tab spreads, 17-hole metal spiral binding, and washi tapes.
              </p>

              {/* Visual Mini Mockup */}
              <div className="aspect-[16/10] bg-[#2f6b58] rounded-xl p-2.5 mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                <div className="flex items-center w-full h-full bg-[#fbfaf4] rounded-sm p-2 shadow-md relative">
                  <div className="flex-1 text-[8px] font-bagel text-washi-navy text-center border-r border-dashed border-neutral-300 pr-1">
                    <span className="bg-washi-mustard/40 px-1 rounded">Hello, You</span>
                    <div className="h-7 bg-amber-100/70 rounded-xs mt-1" />
                  </div>
                  <div className="flex-1 text-[8px] font-gaegu text-washi-cherry text-center pl-1">
                    <div className="h-7 bg-teal-100/70 rounded-xs mb-1" />
                    <span>Little Things</span>
                  </div>
                </div>
              </div>

              {/* Key Features List */}
              <ul className="space-y-1.5 text-xs text-[#6e5e52] mb-6">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>18 interactive photo frames across 4 tab spreads</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Cutting-mat desk with 6 authentic washi tapes</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Bulk photo upload & client-side canvas compression</span>
                </li>
              </ul>
            </div>

            {/* Launch CTA */}
            <Link
              href="/book"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
            >
              <span>Open Spiral Little Book</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Footer: shrink-0 with safe-area padding for mobile browsers */}
        <div
          className="shrink-0 px-6 py-4 bg-[#f4ebe1] border-t border-[#e8dccf] flex items-center justify-between text-xs text-[#7e6d60]"
          style={{
            paddingBottom: "max(1rem, calc(1rem + env(safe-area-inset-bottom, 0px)))",
          }}
        >
          <span>Everything saves automatically to your device</span>
          <Link
            href="/templates"
            onClick={onClose}
            className="font-bold text-[#cf493e] hover:underline"
          >
            View full templates page →
          </Link>
        </div>
      </div>
    </div>
  );
}
