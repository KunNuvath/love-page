import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Heart,
  Sparkles,
  ArrowRight,
  Camera,
  Music,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Layers,
  Wand2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "LovePage Templates — Choose Your Memory Keepsake",
  description:
    "Explore our collection of romantic scrapbook and memory journal templates. Handcrafted for couples.",
};

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-[#f7ebe6] text-[#362e2b] selection:bg-[#cf493e]/20 font-sans py-10 px-4 sm:px-6 flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-10">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-[#5a483e] hover:text-[#cf493e] border border-[#e4d6c4] shadow-xs text-xs sm:text-sm font-semibold transition-all group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform text-[#cf493e]" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#cf493e] text-white flex items-center justify-center shadow-xs">
            <Heart className="h-4 w-4 fill-white" />
          </div>
          <span className="font-handwriting text-2xl font-bold text-[#2d221e]">
            LovePage Studio
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#cf493e]/10 text-[#cf493e] text-xs font-bold tracking-wider uppercase mb-3">
          <Layers className="h-3.5 w-3.5" />
          <span>Template Collection</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#2d221e] tracking-tight mb-4">
          Choose Your Perfect Love Template
        </h1>
        <p className="text-[#68584f] text-sm sm:text-base leading-relaxed">
          Every love story is unique. Pick the keepsake format that matches your memories and surprise your favorite person.
        </p>
      </div>

      {/* Templates Showcase Grid */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* ═══════════════════════════════════════════════════════════
            TEMPLATE 1: Retro Polaroid Scrapbook (Vol. 01)
        ═══════════════════════════════════════════════════════════ */}
        <div className="glass-panel rounded-3xl p-7 sm:p-9 border border-[#e2d2c1] shadow-md flex flex-col justify-between group hover:shadow-xl transition-all">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#cf493e]/15 text-[#cf493e]">
                Vol. 01 • Classic Scrapbook
              </span>
              <Heart className="h-5 w-5 text-[#cf493e]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2d221e] mb-2">
              Retro Polaroid Scrapbook
            </h2>
            <p className="text-xs sm:text-sm text-[#68584f] mb-6 leading-relaxed">
              A classic nostalgic craft paper aesthetic with 6 rotatable polaroid photo snaps, a custom romantic love note, and background couple song player.
            </p>

            {/* Visual Teaser Mockup */}
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

            {/* Specifications */}
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
                <span><strong>Cursive Love Letter:</strong> Editable topic & love message</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Aesthetic Accents:</strong> Washi tapes, pressed rose, floating hearts</span>
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

        {/* ═══════════════════════════════════════════════════════════
            TEMPLATE 2: "Our Little Book" Spiral Journal (Vol. 02)
        ═══════════════════════════════════════════════════════════ */}
        <div className="glass-panel rounded-3xl p-7 sm:p-9 border-2 border-emerald-600/40 shadow-md flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
          {/* Ribbon */}
          <div className="absolute top-0 right-0 bg-washi-cherry text-white text-[10px] font-bold uppercase tracking-widest px-6 py-1 rounded-bl-xl shadow-xs">
            NEW ✨ 18 Photos
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-600/15 text-emerald-700">
                Vol. 02 • Spiral Bound Journal
              </span>
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2d221e] mb-2">
              Our Little Book (Spiral Journal)
            </h2>
            <p className="text-xs sm:text-sm text-[#68584f] mb-6 leading-relaxed">
              A rich craft cutting-mat desk environment with two 4:5 pages, a 17-hole central spiral coil, and 4 interactive spread tabs (18 photo frames total).
            </p>

            {/* Visual Teaser Mockup */}
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

            {/* Specifications */}
            <div className="space-y-2.5 text-xs sm:text-sm text-[#5a4b41] mb-8">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>18 Photo Frames:</strong> 4 interactive tabs (Hello, Little Things, Memories, Love This)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Bulk Photo Fill:</strong> Auto-populates all empty frames with 1 file selection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span><strong>Canvas Compression:</strong> Auto-downscales images client-side for smooth performance</span>
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
  );
}
