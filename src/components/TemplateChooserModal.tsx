"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  ArrowRight,
  X,
  Layers,
  CheckCircle2,
  Crown,
  Compass,
} from "lucide-react";

interface TemplateChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateChooserModal({
  isOpen,
  onClose,
}: TemplateChooserModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm">
      {/* Click outside backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-3xl bg-[#fbf8f3] rounded-t-3xl sm:rounded-3xl border-t sm:border border-[#e2d2c1] shadow-2xl flex flex-col modal-viewport-height overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[#e8dccf] bg-[#f4ebe1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#cf493e] text-white flex items-center justify-center shadow-xs shrink-0">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3
                id="template-modal-title"
                className="font-extrabold text-base sm:text-lg text-[#2d221e]"
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
            className="p-1.5 rounded-full hover:bg-black/10 text-[#6e5e50] transition-colors cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-8"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
          }}
        >
          {/* Link to full templates page */}
          <Link
            href="/templates"
            onClick={onClose}
            className="flex items-center justify-between p-3 sm:p-3.5 mb-4 sm:mb-5 rounded-xl bg-[#cf493e]/10 border border-[#cf493e]/30 text-[#cf493e] hover:bg-[#cf493e]/15 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="text-xs font-bold">Open Full Screen Templates Showcase</span>
            </div>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch pb-10 sm:pb-2">
            {/* TEMPLATE 1: Retro Polaroid Scrapbook */}
            <div className="flex flex-col justify-between p-4 sm:p-6 rounded-2xl bg-white border border-[#e5d6c5] shadow-sm hover:shadow-lg hover:border-[#cf493e]/40 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#cf493e]/10 text-[#cf493e]">
                    Vol. 01 • Classic
                  </span>
                  <Heart className="h-4 w-4 text-[#cf493e]" />
                </div>

                <h4 className="font-extrabold text-lg sm:text-xl text-[#2d221e] mb-1">
                  Retro Polaroid Scrapbook
                </h4>
                <p className="text-xs text-[#7d6c60] mb-3 sm:mb-4 leading-relaxed">
                  Warm vintage craft paper with floating hearts, romantic love letter, and background song melody.
                </p>

                <div className="h-28 sm:h-auto sm:aspect-[16/10] bg-[#faf6ee] rounded-xl border border-dashed border-[#cbbeaa] p-2.5 sm:p-3 mb-3 sm:mb-4 flex flex-col justify-between relative overflow-hidden group-hover:scale-[1.02] transition-transform pointer-events-none select-none">
                  <div className="w-16 h-3.5 sm:h-4 bg-[#5b6d5c]/70 mx-auto -mt-3.5 sm:-mt-4 mb-1 rounded-xs" />
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

                <ul className="space-y-1.5 text-xs text-[#6e5e52] mb-4 sm:mb-6">
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

              <Link
                href="/scrapbook"
                onClick={onClose}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-[#cf493e] hover:bg-[#b83b31] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg active:scale-98 cursor-pointer"
              >
                <span>Open Polaroid Scrapbook</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* TEMPLATE 2: Our Little Book (Spiral Journal) */}
            <div className="flex flex-col justify-between p-4 sm:p-6 rounded-2xl bg-white border-2 border-emerald-600/30 shadow-sm hover:shadow-lg hover:border-emerald-600/60 transition-all group relative overflow-hidden">
              {/* NEW badge */}
              <div className="absolute -top-3 -right-3 w-16 h-16 overflow-hidden pointer-events-none">
                <div className="bg-[#cf493e] text-white text-[9px] font-bold uppercase tracking-wider text-center py-1 rotate-45 translate-y-3 w-24 -translate-x-3 shadow-xs">
                  NEW ✨
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700">
                    Vol. 02 • 18 Photos
                  </span>
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                </div>

                <h4 className="font-extrabold text-lg sm:text-xl text-[#2d221e] mb-1">
                  Our Little Book (Spiral Journal)
                </h4>
                <p className="text-xs text-[#7d6c60] mb-3 sm:mb-4 leading-relaxed">
                  Cutting-mat desk environment, 4 interactive tab spreads, 17-hole metal spiral binding, and washi tapes.
                </p>

                <div className="h-28 sm:h-auto sm:aspect-[16/10] bg-[#2f6b58] rounded-xl p-2.5 mb-3 sm:mb-4 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-transform pointer-events-none select-none">
                  <div className="flex items-center w-full h-full bg-[#fbfaf4] rounded-sm p-2 shadow-md relative">
                    <div className="flex-1 text-[8px] text-[#2d2a3e] text-center border-r border-dashed border-neutral-300 pr-1">
                      <span className="bg-yellow-200/40 px-1 rounded">Hello, You</span>
                      <div className="h-6 sm:h-7 bg-amber-100/70 rounded-xs mt-1" />
                    </div>
                    <div className="flex-1 text-[8px] text-[#cf493e] text-center pl-1">
                      <div className="h-6 sm:h-7 bg-teal-100/70 rounded-xs mb-1" />
                      <span>Little Things</span>
                    </div>
                  </div>
                </div>

                <ul className="space-y-1.5 text-xs text-[#6e5e52] mb-4 sm:mb-6">
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
                    <span>Bulk photo upload &amp; client-side canvas compression</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/book"
                onClick={onClose}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg active:scale-98 cursor-pointer"
              >
                <span>Open Spiral Little Book</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* PREMIUM CATEGORY BANNER: Vol. 03 — Our Little Adventure */}
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#24395f] text-[#fbf6ea] border-2 border-[#1d2742] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f7d56a] text-[#1d2742] text-[10px] font-extrabold uppercase tracking-wider">
                <Crown className="h-3 w-3 text-[#e5533d] fill-[#e5533d]" />
                <span>Vol. 03 • Premium Category • $4.99</span>
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-[#fbf6ea] flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#f7d56a]" />
                <span>Our Little Adventure (Torn-Paper Travel Collage)</span>
              </h4>
              <p className="text-xs text-[#fbf6ea]/80 leading-relaxed max-w-xl">
                Handmade kraft-paper sheet on a deep navy desk, ransom-note cutout title, 6 unique photo shapes (Torn, Circle, Ticket, Film, Arch, Heart), &ldquo;THE DAILY US&rdquo; newspaper clipping, and scroll-following heart path.
              </p>
            </div>

            <Link
              href="/adventure"
              onClick={onClose}
              className="w-full sm:w-auto shrink-0 py-3 px-5 rounded-xl bg-[#f7d56a] hover:bg-[#efc74c] text-[#1d2742] font-extrabold text-xs sm:text-sm border-2 border-[#1d2742] shadow-[3px_3px_0_#1d2742] flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Open Travel Collage</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* PREMIUM CATEGORY BANNER 2: Vol. 04 — Scrapbook Album (9-Page Flip Book) */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-[#faf6ef] text-[#4a3f38] border-2 border-[#8aa67c] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#8aa67c] text-white text-[10px] font-extrabold uppercase tracking-wider">
                <Crown className="h-3 w-3 text-[#e9c46a] fill-[#e9c46a]" />
                <span>Vol. 04 • Premium Category • $4.99</span>
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-[#4a3f38] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#8aa67c]" />
                <span>Scrapbook Album (9-Page Flip Photo Album)</span>
              </h4>
              <p className="text-xs text-[#4a3f38]/80 leading-relaxed max-w-xl">
                9-page family &amp; couple flip album with 3D page-flip animation, clothesline polaroids with pegs, photo-filled &ldquo;FAMILY&rdquo; letters, cut-paper heart &amp; star sticker spread, and secret owner edit link.
              </p>
            </div>

            <Link
              href="/album"
              onClick={onClose}
              className="w-full sm:w-auto shrink-0 py-3 px-5 rounded-xl bg-[#e9c46a] hover:bg-[#dfb54e] text-[#4a3f38] font-extrabold text-xs sm:text-sm border-2 border-[#4a3f38] shadow-[3px_3px_0_#4a3f38] flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Open 9-Page Album</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* PREMIUM CATEGORY BANNER 3: Vol. 05 — Love Flipbook (16-Page Leather Scrapbook • $9.99) */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-[#2a1209] text-[#f4e9dc] border-2 border-[#e6c26a] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e6c26a] text-[#2a1209] text-[10px] font-extrabold uppercase tracking-wider">
                <Crown className="h-3 w-3 text-[#2a1209] fill-[#2a1209]" />
                <span>Vol. 05 • Deluxe Edition • $9.99</span>
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-[#f4e9dc] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#e6c26a]" />
                <span>Love Flipbook (16-Page Leather Scrapbook)</span>
              </h4>
              <p className="text-xs text-[#f4e9dc]/80 leading-relaxed max-w-xl">
                16-page open leather-bound scrapbook with 3D dual-page flip physics, paper-rustle sound, 37 photo slots, photobooth strip, lace frames, heart cutouts, and 9-polaroid couple wishlist.
              </p>
            </div>

            <Link
              href="/flipbook"
              onClick={onClose}
              className="w-full sm:w-auto shrink-0 py-3 px-5 rounded-xl bg-[#e6c26a] hover:bg-[#d9b255] text-[#2a1209] font-extrabold text-xs sm:text-sm border-2 border-[#1b0b06] shadow-[3px_3px_0_#1b0b06] flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Open 16-Page Flipbook</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* PREMIUM CATEGORY BANNER 4: Vol. 06 — Love Story (12-Page Vintage Scrapbook • $5.99) */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-[#3a0c13] text-[#f2e7d0] border-2 border-[#c9a24a] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#c9a24a] text-[#2a070c] text-[10px] font-extrabold uppercase tracking-wider">
                <Crown className="h-3 w-3 text-[#4a0f17] fill-[#4a0f17]" />
                <span>Vol. 06 • Premium • $5.99</span>
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-[#f2e7d0] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#c9a24a]" />
                <span>Love Story (12-Page Vintage Scrapbook)</span>
              </h4>
              <p className="text-xs text-[#f2e7d0]/80 leading-relaxed max-w-xl">
                12-page 9:16 portrait 3D flipbook on burgundy plaid, wine corduroy, film strip &amp; parchment with 18 photo slots, cassette playlist, milestone stars, and 18 vintage stickers.
              </p>
            </div>

            <Link
              href="/love-story"
              onClick={onClose}
              className="w-full sm:w-auto shrink-0 py-3 px-5 rounded-xl bg-[#c9a24a] hover:bg-[#d8b35b] text-[#2a070c] font-extrabold text-xs sm:text-sm border-2 border-[#1a0508] shadow-[3px_3px_0_#1a0508] flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Open Love Story</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* PREMIUM CATEGORY BANNER 5: Vol. 07 — 1 Year With You (Velvet Flipbook • $7.99) */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-[#54121b] text-[#f4ecdc] border-2 border-[#e5c678] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e5c678] text-[#2a0a0f] text-[10px] font-extrabold uppercase tracking-wider">
                <Crown className="h-3 w-3 text-[#54121b] fill-[#54121b]" />
                <span>Vol. 07 • Velvet Edition • $7.99</span>
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-[#f4ecdc] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#e5c678]" />
                <span>1 Year With You (Velvet Anniversary Flipbook)</span>
              </h4>
              <p className="text-xs text-[#f4ecdc]/80 leading-relaxed max-w-xl">
                Closed wine-velvet cover opening into 8 bespoke spreads (16 pages) on a stone-plaster surface with 38 photo slots, lace-edged heart, ring binder, 8-photo slate collage &amp; olive star-map.
              </p>
            </div>

            <Link
              href="/anniversary"
              onClick={onClose}
              className="w-full sm:w-auto shrink-0 py-3 px-5 rounded-xl bg-[#e5c678] hover:bg-[#edd38e] text-[#2a0a0f] font-extrabold text-xs sm:text-sm border-2 border-[#2a0a0f] shadow-[3px_3px_0_#2a0a0f] flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Open Velvet Flipbook</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* PREMIUM CATEGORY BANNER 6: Vol. 08 — 10 Things I Love About You ($6.00) */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-[#5a0d12] text-[#f7efe0] border-2 border-[#f6e9a6] shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f6e9a6] text-[#4a0c10] text-[10px] font-extrabold uppercase tracking-wider">
                <Crown className="h-3 w-3 text-[#5a0d12] fill-[#5a0d12]" />
                <span>Vol. 08 • Romantic Flipbook • $6.00</span>
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-[#f7efe0] flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#f6e9a6] fill-[#f6e9a6]" />
                <span>10 Things I Love About You (3D Flipbook)</span>
              </h4>
              <p className="text-xs text-[#f7efe0]/80 leading-relaxed max-w-xl">
                Double-heart locket cover opening into 10 dedicated chapters (#1 Your Smile to #10 Simply You) with 28 photo slots, envelope polaroids, iMessage assurance bubbles, retro phone frame &amp; film strip.
              </p>
            </div>

            <Link
              href="/ten-things"
              onClick={onClose}
              className="w-full sm:w-auto shrink-0 py-3 px-5 rounded-xl bg-[#f6e9a6] hover:bg-[#faefba] text-[#4a0c10] font-extrabold text-xs sm:text-sm border-2 border-[#36080c] shadow-[3px_3px_0_#36080c] flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Open 10 Things Book</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div
          className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 bg-[#f4ebe1] border-t border-[#e8dccf] flex flex-col xs:flex-row items-center justify-between gap-2 text-xs text-[#7e6d60]"
          style={{
            paddingBottom: "max(1rem, calc(0.75rem + env(safe-area-inset-bottom, 0px)))",
          }}
        >
          <span className="text-center xs:text-left">Everything saves automatically to your device</span>
          <Link
            href="/templates"
            onClick={onClose}
            className="font-bold text-[#cf493e] hover:underline shrink-0"
          >
            View full templates page →
          </Link>
        </div>
      </div>
    </div>
  );
}
