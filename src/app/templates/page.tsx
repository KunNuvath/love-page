"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Layers,
  Crown,
  Lock,
  Compass,
  Newspaper,
} from "lucide-react";
import BrandLogo from "@/src/components/BrandLogo";
import { useAuth } from "@/src/context/AuthContext";
import { hasTemplateAccess } from "@/src/lib/premium";
import { ADVENTURE_TEMPLATE_ID } from "@/src/lib/adventure";
import { ALBUM_TEMPLATE_ID } from "@/src/lib/album";
import { FLIPBOOK_TEMPLATE_ID } from "@/src/lib/flipbook";
import PremiumUnlockModal from "@/src/components/adventure/PremiumUnlockModal";

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<"all" | "free" | "premium">("all");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isAlbumUnlocked, setIsAlbumUnlocked] = useState(false);
  const [isFlipbookUnlocked, setIsFlipbookUnlocked] = useState(false);
  const [modalTemplate, setModalTemplate] = useState<string | null>(null);

  useEffect(() => {
    setIsUnlocked(hasTemplateAccess(user, ADVENTURE_TEMPLATE_ID));
    setIsAlbumUnlocked(hasTemplateAccess(user, ALBUM_TEMPLATE_ID));
    setIsFlipbookUnlocked(hasTemplateAccess(user, FLIPBOOK_TEMPLATE_ID));
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f7ebe6] text-[#362e2b] selection:bg-[#cf493e]/20 font-sans py-10 px-4 sm:px-6 flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between gap-3 mb-8 sm:mb-10">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-white/80 hover:bg-white text-[#5a483e] hover:text-[#cf493e] border border-[#e4d6c4] shadow-xs text-xs sm:text-sm font-semibold transition-all group shrink-0 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform text-[#cf493e] shrink-0" />
          <span className="hidden xs:inline">Back</span>
          <span className="hidden sm:inline"> to Home</span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <BrandLogo size="md" />
          <span className="font-handwriting text-xl sm:text-2xl font-bold text-[#2d221e]">
            LovePage Studio
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-xs font-bold tracking-wider uppercase mb-3">
          <Layers className="h-3.5 w-3.5" />
          <span>Template Collection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2d221e] tracking-tight mb-4">
          Choose Your Perfect Love Template
        </h1>
        <p className="text-[#68584f] text-xs sm:text-sm md:text-base leading-relaxed">
          Every love story is unique. Pick a free keepsake or unlock our handmade Premium Travel Collage to surprise your favorite person.
        </p>

        {/* Category Filter Tabs */}
        <div className="mt-6 inline-flex items-center p-1.5 rounded-2xl bg-white/80 border border-[#e2d2c1] shadow-xs gap-1 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeCategory === "all"
                ? "bg-[#2d221e] text-white shadow-xs"
                : "text-[#68584f] hover:text-[#2d221e]"
            }`}
          >
            All Templates (5)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("free")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeCategory === "free"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-[#68584f] hover:text-emerald-700"
            }`}
          >
            Free Collection (2)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory("premium")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeCategory === "premium"
                ? "bg-[#1d2742] text-[#f7d56a] shadow-xs"
                : "text-[#1d2742] hover:bg-[#f7d56a]/25"
            }`}
          >
            <Crown className="h-3.5 w-3.5 text-[#e5533d] fill-[#f7d56a]" />
            <span>Premium Category (3)</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          1. FREE COLLECTION (Vol. 01 & Vol. 02)
      ═══════════════════════════════════════════════════════════ */}
      {(activeCategory === "all" || activeCategory === "free") && (
        <div className="w-full max-w-5xl mb-12">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2d221e]">
              Free Keepsake Templates
            </h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-600/10 px-3 py-1 rounded-full">
              100% Free
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* TEMPLATE 1: Retro Polaroid Scrapbook (Vol. 01) */}
            <div className="glass-panel rounded-3xl p-4.5 xs:p-6 sm:p-9 border border-[#e2d2c1] shadow-md flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#cf493e]/15 text-[#cf493e]">
                    Vol. 01 • Free • Classic Scrapbook
                  </span>
                  <Heart className="h-5 w-5 text-[#cf493e]" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2d221e] mb-2">
                  Retro Polaroid Scrapbook
                </h3>
                <p className="text-xs sm:text-sm text-[#68584f] mb-6 leading-relaxed">
                  A classic nostalgic craft paper aesthetic with 6 rotatable polaroid photo snaps, a custom romantic love note, and background couple song player.
                </p>

                <div className="aspect-[16/9] bg-[#faf6ee] rounded-2xl border border-dashed border-[#cbbeaa] p-4 mb-6 relative overflow-hidden flex flex-col justify-between group-hover:scale-[1.01] transition-transform shadow-inner">
                  <div className="w-24 h-5 washi-tape-green mx-auto -mt-5 -rotate-2" />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-1.5 rounded shadow-xs text-center -rotate-2">
                      <div className="aspect-square bg-rose-100 rounded-xs mb-1" />
                      <span className="font-handwriting text-xs">First Date</span>
                    </div>
                    <div className="bg-white p-1.5 rounded shadow-xs text-center rotate-2">
                      <div className="aspect-square bg-pink-100 rounded-xs mb-1" />
                      <span className="font-handwriting text-xs">Sweet Us</span>
                    </div>
                    <div className="bg-white p-1.5 rounded shadow-xs text-center -rotate-1">
                      <div className="aspect-square bg-amber-100 rounded-xs mb-1" />
                      <span className="font-handwriting text-xs">Forever</span>
                    </div>
                  </div>
                  <div className="text-xs font-typewriter text-[#cf493e] font-bold text-center">
                    ♫ Miguel - Sure Thing
                  </div>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-[#5a4b41] mb-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>6 Polaroid Cards:</strong> Upload, tilt physics, and zoom lightbox</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>Melody Player:</strong> Plays your couple song on repeat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>Cursive Love Letter:</strong> Editable topic &amp; love message</span>
                  </div>
                </div>
              </div>

              <Link
                href="/scrapbook"
                className="w-full py-4 rounded-2xl bg-[#cf493e] hover:bg-[#b83b31] text-white font-bold text-sm sm:text-base shadow-[0_6px_20px_rgba(207,73,62,0.35)] flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch Polaroid Scrapbook</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* TEMPLATE 2: "Our Little Book" Spiral Journal (Vol. 02) */}
            <div className="glass-panel rounded-3xl p-4.5 xs:p-6 sm:p-9 border-2 border-emerald-600/40 shadow-md flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-washi-cherry text-white text-[10px] font-bold uppercase tracking-widest px-6 py-1 rounded-bl-xl shadow-xs">
                18 Photos
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-600/15 text-emerald-700">
                    Vol. 02 • Free • Spiral Journal
                  </span>
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2d221e] mb-2">
                  Our Little Book (Spiral Journal)
                </h3>
                <p className="text-xs sm:text-sm text-[#68584f] mb-6 leading-relaxed">
                  A rich craft cutting-mat desk environment with two 4:5 pages, a 17-hole central spiral coil, and 4 interactive spread tabs (18 photo frames total).
                </p>

                <div className="aspect-[16/9] bg-[#2f6b58] rounded-2xl p-3 mb-6 relative overflow-hidden flex items-center justify-center group-hover:scale-[1.01] transition-transform shadow-inner">
                  <div className="flex items-center w-full h-full bg-[#fbfaf4] rounded-sm p-3 shadow-md relative">
                    <div className="flex-1 text-[10px] font-bagel text-washi-navy text-center border-r border-dashed border-neutral-300 pr-2">
                      <span className="bg-washi-mustard/40 px-1.5 py-0.5 rounded">Hello, You</span>
                      <div className="h-10 bg-amber-100 rounded-xs mt-1.5" />
                    </div>
                    <div className="flex-1 text-[10px] font-gaegu text-washi-cherry text-center pl-2">
                      <div className="h-10 bg-teal-100 rounded-xs mb-1.5" />
                      <span>Little Things</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs sm:text-sm text-[#5a4b41] mb-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>18 Photo Frames:</strong> 4 interactive tabs (Hello, Little Things, Memories, Love This)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>Song &amp; 30s Trimmer:</strong> Custom background soundtrack</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>Authentic Washi Tapes:</strong> 6 custom patterns with zigzag cut edges</span>
                  </div>
                </div>
              </div>

              <Link
                href="/book"
                className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-[0_6px_20px_rgba(20,90,70,0.35)] flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <BookOpen className="h-4 w-4" />
                <span>Launch Spiral Little Book</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          2. PREMIUM CATEGORY (Vol. 03 — "Our Little Adventure")
      ═══════════════════════════════════════════════════════════ */}
      {(activeCategory === "all" || activeCategory === "premium") && (
        <div className="w-full max-w-5xl mb-16">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#1d2742] text-[#f7d56a] flex items-center justify-center shadow-xs">
                <Crown className="h-5 w-5 fill-[#f7d56a]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e5533d] block">
                  Premium Category • Handmade Travel Collage
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#2d221e]">
                  Artisanal Torn-Paper Keepsake
                </h2>
              </div>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-[#1d2742] text-[#f7d56a] text-xs font-extrabold border border-[#1d2742]">
              {isUnlocked ? "👑 Unlocked" : "$4.99 One-Time"}
            </span>
          </div>

          <div className="rounded-3xl p-5 xs:p-6 sm:p-9 bg-[#24395f] text-[#fbf6ea] border-2 border-[#1d2742] shadow-[0_22px_50px_rgba(20,29,51,0.35)] relative overflow-hidden">
            {/* Corner Badge */}
            <div className="absolute top-0 right-0 bg-[#f7d56a] text-[#1d2742] text-[10px] font-extrabold uppercase tracking-widest px-5 py-1.5 rounded-bl-2xl border-l-2 border-b-2 border-[#1d2742] flex items-center gap-1">
              <Crown className="h-3 w-3 text-[#e5533d] fill-[#e5533d]" />
              <span>{isUnlocked ? "PREMIUM UNLOCKED" : "VOL. 03 • PREMIUM"}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Left: Mini Visual Mockup of the Kraft Sheet & 6 Shapes */}
              <div className="lg:col-span-6 bg-[#d3b088] text-[#1d2742] p-4 sm:p-5 rounded-2xl border-2 border-[#1d2742] shadow-[5px_5px_0_#1d2742]">
                {/* Mini Ransom Header */}
                <div className="flex flex-wrap items-center justify-center gap-1 mb-3">
                  {["O", "U", "R", " ", "A", "D", "V", "E", "N", "T", "U", "R", "E"].map((ch, i) =>
                    ch === " " ? (
                      <span key={i} className="w-2" />
                    ) : (
                      <span
                        key={i}
                        style={{
                          backgroundColor: ["#fbf6ea", "#f7d56a", "#e5533d", "#a6d9c0", "#9cc9ee"][i % 5],
                          color: i % 5 === 2 ? "#fbf6ea" : "#1d2742",
                          transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)`,
                        }}
                        className="px-1.5 py-0.5 text-xs font-extrabold border border-[#1d2742] shadow-[1.5px_1.5px_0_#1d2742]"
                      >
                        {ch}
                      </span>
                    )
                  )}
                </div>

                {/* 6 Custom Shape Previews + Daily Us Newspaper */}
                <div className="grid grid-cols-3 gap-2.5 text-[10px] font-bold text-center">
                  <div className="bg-[#fbf6ea] p-2 rounded border border-[#1d2742] -rotate-2">
                    <div className="aspect-[4/3] bg-[#e5533d]/25 rounded-xs mb-1" />
                    <span>1. Torn Paper</span>
                  </div>
                  <div className="bg-[#fbf6ea] p-2 rounded-full border-2 border-[#1d2742] aspect-square flex flex-col items-center justify-center rotate-2">
                    <span>2. Circle</span>
                  </div>
                  <div className="bg-[#f7d56a] p-2 rounded border border-[#1d2742] -rotate-1">
                    <div className="aspect-[4/3] bg-white/70 rounded-xs mb-1" />
                    <span>3. Ticket Stub</span>
                  </div>
                  <div className="bg-[#15161b] text-[#fbf6ea] p-2 rounded border border-[#1d2742] rotate-1">
                    <div className="aspect-[16/9] bg-[#9cc9ee]/35 rounded-xs mb-1" />
                    <span>4. Film Strip</span>
                  </div>
                  <div className="bg-[#9cc9ee] p-2 rounded-t-full border border-[#1d2742] -rotate-2">
                    <div className="aspect-[4/3] bg-white/70 rounded-t-full mb-1" />
                    <span>5. Sky Arch</span>
                  </div>
                  <div className="bg-[#e5533d] text-[#fbf6ea] p-2 rounded-xl border border-[#1d2742] rotate-2 flex flex-col items-center justify-center">
                    <Heart className="h-5 w-5 fill-[#fbf6ea] mb-0.5" />
                    <span>6. Heart Cutout</span>
                  </div>
                </div>

                <div className="mt-2.5 bg-[#f3ecda] border border-[#1d2742] px-3 py-1.5 text-[10px] font-mono flex items-center justify-between">
                  <span className="font-bold">📰 THE DAILY US — EXTRA, EXTRA!</span>
                  <span className="text-[#e5533d] font-bold">♥ Journey Path</span>
                </div>
              </div>

              {/* Right: Description & Unlock / Launch Buttons */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7d56a]/15 border border-[#f7d56a]/40 text-[#f7d56a] text-xs font-bold uppercase tracking-wider mb-3">
                    <Compass className="h-3.5 w-3.5" />
                    <span>Vol. 03 • Torn-Paper Travel Collage</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#fbf6ea] mb-2">
                    Our Little Adventure
                  </h3>
                  <p className="text-xs sm:text-sm text-[#fbf6ea]/80 mb-5 leading-relaxed">
                    A handmade travel-journal collage on a deep navy desk with a torn kraft-paper sheet, ransom-note cutout title letters, 6 uniquely shaped photo slots, a &ldquo;THE DAILY US&rdquo; newspaper clipping, doodle stickers, and a scroll-following red heart sticker.
                  </p>

                  <div className="space-y-2 text-xs sm:text-sm text-[#fbf6ea]/90 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#a6d9c0] shrink-0" />
                      <span><strong>6 Shaped Photo Cutouts:</strong> Torn rectangle, Circle, Ticket stub, Film strip, Arch &amp; Heart</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#a6d9c0] shrink-0" />
                      <span><strong>Ransom-Note Header &amp; Newspaper:</strong> Editable paper-chip title + 2-column &ldquo;THE DAILY US&rdquo; story</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#a6d9c0] shrink-0" />
                      <span><strong>Scroll Journey Path:</strong> Wavy dotted route with a red heart sticker that travels as you scroll</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {isUnlocked ? (
                    <Link
                      href="/adventure"
                      className="flex-1 py-4 px-6 rounded-2xl bg-[#e5533d] hover:bg-[#cc442f] text-[#fbf6ea] font-bold text-sm sm:text-base border-2 border-[#1d2742] shadow-[4px_4px_0_#1d2742] flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Open Our Little Adventure</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setModalTemplate(ADVENTURE_TEMPLATE_ID)}
                        className="flex-1 py-4 px-6 rounded-2xl bg-[#f7d56a] hover:bg-[#efc74c] text-[#1d2742] font-extrabold text-sm sm:text-base border-2 border-[#1d2742] shadow-[4px_4px_0_#1d2742] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Lock className="h-4 w-4 text-[#e5533d]" />
                        <span>Unlock Premium • $4.99</span>
                      </button>

                      <Link
                        href="/adventure"
                        className="py-4 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#fbf6ea] border border-white/25 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Newspaper className="h-4 w-4 text-[#f7d56a]" />
                        <span>Preview</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── VOL. 04 PREMIUM: Scrapbook Album (9-Page Flip Photo Album) ── */}
          <div className="mt-8 rounded-3xl p-5 xs:p-6 sm:p-9 bg-[#faf6ef] text-[#4a3f38] border-2 border-[#8aa67c] shadow-[0_20px_50px_rgba(74,63,56,0.16)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#8aa67c] text-white text-[10px] font-extrabold uppercase tracking-widest px-5 py-1.5 rounded-bl-2xl flex items-center gap-1">
              <Crown className="h-3 w-3 text-[#e9c46a] fill-[#e9c46a]" />
              <span>{isAlbumUnlocked ? "PREMIUM UNLOCKED" : "VOL. 04 • PREMIUM"}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Left: Mini 9-Page Flip Album Preview */}
              <div className="lg:col-span-6 bg-[#efe6d8] p-4 sm:p-5 rounded-2xl border border-[#4a3f38]/15 shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#4a3f38]/75 mb-3">
                  <span>9-PAGE 3D FLIP PHOTO ALBUM</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#8aa67c]">1 / 9 → 9 / 9</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                  {[
                    { p: "1. Our Family", bg: "#faf6ef", badge: "3×2 Polaroids" },
                    { p: "2. Story Begins", bg: "#faf6ef", badge: "Sand Circle" },
                    { p: "3. Memories", bg: "#e9c46a", badge: "5 Photos + Tile" },
                    { p: "4. FAMILY", bg: "#faf6ef", badge: "Photo Letters" },
                    { p: "5. Clothesline", bg: "#faf6ef", badge: "5 Pegged Snaps" },
                    { p: "6. Just Us", bg: "#8aa67c", badge: "Sage Circles" },
                    { p: "7. Tall Center", bg: "#faf6ef", badge: "5-Photo Bento" },
                    { p: "8. Sticker Cut", bg: "#f5d0c8", badge: "Heart & Star" },
                    { p: "9. Forever", bg: "#faf6ef", badge: "Closing Note" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{ backgroundColor: item.bg }}
                      className="p-2 rounded-xl border border-[#4a3f38]/20 shadow-2xs flex flex-col justify-between"
                    >
                      <span className="text-[#4a3f38] truncate">{item.p}</span>
                      <span className="mt-1 text-[9px] font-normal text-[#4a3f38]/75 bg-white/70 rounded px-1 py-0.5 truncate">
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Description & Unlock / Launch CTA */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8aa67c]/15 text-[#4a3f38] text-xs font-bold uppercase tracking-wider mb-3">
                    <BookOpen className="h-3.5 w-3.5 text-[#8aa67c]" />
                    <span>Vol. 04 • 9-Page Flip Photo Album</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#4a3f38] mb-2">
                    Scrapbook Album (9-Page Flip Book)
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4a3f38]/80 mb-5 leading-relaxed">
                    A soft, airy 9-page family &amp; couple collage album with 3D page-flip animation, scalloped paper borders, clothesline polaroids with pegs, photo-clipped &ldquo;FAMILY&rdquo; letters, a cut-paper heart &amp; star sticker page, and a secret owner edit token link.
                  </p>

                  <div className="space-y-2 text-xs sm:text-sm text-[#4a3f38]/90 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#8aa67c] shrink-0" />
                      <span><strong>9 Unique Collage Pages:</strong> 3×2 polaroids, clothesline pegs, FAMILY photo-letters &amp; heart cutouts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#8aa67c] shrink-0" />
                      <span><strong>3D Page-Flip &amp; Decorations:</strong> Scalloped borders, zigzag strips, corner washi &amp; floating emoji stickers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#8aa67c] shrink-0" />
                      <span><strong>Public Share + Secret Edit Link:</strong> Read-only `/album/[slug]` + secret owner edit token URL</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {isAlbumUnlocked ? (
                    <Link
                      href="/album"
                      className="flex-1 py-4 px-6 rounded-2xl bg-[#4a3f38] hover:bg-[#382f29] text-[#faf6ef] font-bold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="h-4 w-4 text-[#e9c46a]" />
                      <span>Open 9-Page Scrapbook Album</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setModalTemplate(ALBUM_TEMPLATE_ID)}
                        className="flex-1 py-4 px-6 rounded-2xl bg-[#e9c46a] hover:bg-[#dfb54e] text-[#4a3f38] font-extrabold text-sm sm:text-base border-2 border-[#4a3f38] shadow-[4px_4px_0_#4a3f38] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Lock className="h-4 w-4 text-[#c94a3e]" />
                        <span>Unlock Album • $4.99</span>
                      </button>

                      <Link
                        href="/album"
                        className="py-4 px-5 rounded-2xl bg-white hover:bg-[#efe6d8] text-[#4a3f38] border border-[#4a3f38]/25 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <BookOpen className="h-4 w-4 text-[#8aa67c]" />
                        <span>Preview</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── VOL. 05 PREMIUM: Love Flipbook (16-Page Leather Scrapbook • $9.99) ── */}
          <div className="mt-8 rounded-3xl p-5 xs:p-6 sm:p-9 bg-[#2a1209] text-[#f4e9dc] border-2 border-[#e6c26a]/60 shadow-[0_24px_60px_rgba(42,18,9,0.45)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#e6c26a] text-[#2a1209] text-[10px] font-extrabold uppercase tracking-widest px-5 py-1.5 rounded-bl-2xl flex items-center gap-1">
              <Crown className="h-3 w-3 text-[#2a1209] fill-[#2a1209]" />
              <span>{isFlipbookUnlocked ? "PREMIUM UNLOCKED" : "VOL. 05 • $9.99 DELUXE"}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Left: Mini 16-Page Leather Spread Preview */}
              <div className="lg:col-span-6 bg-[#1b0b06] p-4 sm:p-5 rounded-2xl border border-[#e6c26a]/30 shadow-inner">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#e6c26a] mb-3">
                  <span>16-PAGE 3D LEATHER SPREAD FLIPBOOK</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#e6c26a]/20 text-[#e6c26a]">
                    37 PHOTOS • 8 SPREADS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-[10px] font-bold">
                  <div className="bg-[#2a1209] border border-dashed border-[#f4e9dc]/35 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[#e6c26a] text-xs">Page 1 &amp; 2 • Lace &amp; Strip</span>
                    <span className="text-[#f4e9dc]/75 font-normal mt-1">
                      4-photo B&amp;W photobooth strip + vintage lace &amp; polka dots
                    </span>
                  </div>
                  <div className="bg-[#f2ebd9] text-[#2a1209] border border-[#2a1209]/30 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[#2a1209] text-xs">Page 5 &amp; 6 • Meet Boy &amp; Girl</span>
                    <span className="text-[#2a1209]/75 font-normal mt-1">
                      Dual dotted heart photo cutouts + handwritten story notes
                    </span>
                  </div>
                  <div className="bg-[#3d2417] border border-[#e6c26a]/30 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[#e6c26a] text-xs">Page 11 &amp; 12 • 9-Photo Wishlist</span>
                    <span className="text-[#f4e9dc]/75 font-normal mt-1">
                      &ldquo;Make a wish&rdquo; + 9 captioned polaroids (Roadtrip, Picnic...)
                    </span>
                  </div>
                  <div className="bg-[#e6dac3] text-[#2a1209] border border-[#2a1209]/30 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[#2a1209] text-xs">Page 13–16 • Plaid &amp; Finale</span>
                    <span className="text-[#2a1209]/75 font-normal mt-1">
                      Plaid spreads, &ldquo;I love this man/girl&rdquo; &amp; &ldquo;Love actually is all around&rdquo;
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Description & Unlock / Launch CTA */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6c26a]/15 border border-[#e6c26a]/40 text-[#e6c26a] text-xs font-bold uppercase tracking-wider mb-3">
                    <BookOpen className="h-3.5 w-3.5 text-[#e6c26a]" />
                    <span>Vol. 05 • 16-Page Leather Book • $9.99</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#f4e9dc] mb-2">
                    Love Flipbook (16-Page Leather Scrapbook)
                  </h3>
                  <p className="text-xs sm:text-sm text-[#f4e9dc]/80 mb-5 leading-relaxed">
                    An heirloom 16-page open leather-bound scrapbook with realistic 3D dual-page turn physics, paper-rustle sound effect, scalloped lace borders, photobooth strips, heart photo cutouts, wood &amp; plaid textures, and a 9-polaroid couple wishlist.
                  </p>

                  <div className="space-y-2 text-xs sm:text-sm text-[#f4e9dc]/90 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#e6c26a] shrink-0" />
                      <span>
                        <strong>16 Pages (8 Open Spreads) &amp; 37 Photos:</strong> Photobooth strip, heart cutouts, lace &amp; 9-polaroid Wishlist
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#e6c26a] shrink-0" />
                      <span>
                        <strong>Realistic 3D Leather Book &amp; Sound:</strong> Stitched cover, shadow sweep &amp; paper-flip audio
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#e6c26a] shrink-0" />
                      <span>
                        <strong>Batch Photo Upload + Share Links:</strong> Fill 37 photos in one click + public &amp; secret owner edit URL
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {isFlipbookUnlocked ? (
                    <Link
                      href="/flipbook"
                      className="flex-1 py-4 px-6 rounded-2xl bg-[#e6c26a] hover:bg-[#d9b255] text-[#2a1209] font-extrabold text-sm sm:text-base shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Open 16-Page Love Flipbook</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setModalTemplate(FLIPBOOK_TEMPLATE_ID)}
                        className="flex-1 py-4 px-6 rounded-2xl bg-[#e6c26a] hover:bg-[#d9b255] text-[#2a1209] font-extrabold text-sm sm:text-base border-2 border-[#1b0b06] shadow-[4px_4px_0_#1b0b06] flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Lock className="h-4 w-4 text-[#2a1209]" />
                        <span>Unlock Flipbook • $9.99</span>
                      </button>

                      <Link
                        href="/flipbook"
                        className="py-4 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#f4e9dc] border border-white/25 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <BookOpen className="h-4 w-4 text-[#e6c26a]" />
                        <span>Preview</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Legal Links for Paddle Compliance */}
      <div className="w-full max-w-5xl mt-4 pt-6 border-t border-[#e2d0bf] flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-[#7e6d60]">
        <Link href="/terms" className="hover:text-[#cf493e] transition-colors">
          Terms of Service
        </Link>
        <Link href="/privacy" className="hover:text-[#cf493e] transition-colors">
          Privacy Policy
        </Link>
        <Link href="/refund" className="hover:text-[#cf493e] transition-colors">
          14-Day Refund Policy
        </Link>
        <a href="mailto:hello@lovepage.site" className="hover:text-[#cf493e] transition-colors">
          hello@lovepage.site
        </a>
      </div>

      <PremiumUnlockModal
        isOpen={modalTemplate !== null}
        onClose={() => setModalTemplate(null)}
        price={modalTemplate === FLIPBOOK_TEMPLATE_ID ? "$9.99" : "$4.99"}
        templateId={modalTemplate || ADVENTURE_TEMPLATE_ID}
        templateTitle={
          modalTemplate === FLIPBOOK_TEMPLATE_ID
            ? "Love Flipbook (16-Page Leather Scrapbook)"
            : modalTemplate === ALBUM_TEMPLATE_ID
              ? "Scrapbook Album (9-Page Flip Album)"
              : "Our Little Adventure"
        }
        onUnlocked={() => {
          const target = modalTemplate;
          setModalTemplate(null);
          if (target === FLIPBOOK_TEMPLATE_ID) {
            setIsFlipbookUnlocked(true);
            router.push("/flipbook");
          } else if (target === ALBUM_TEMPLATE_ID) {
            setIsAlbumUnlocked(true);
            router.push("/album");
          } else {
            setIsUnlocked(true);
            router.push("/adventure");
          }
        }}
      />
    </div>
  );
}
