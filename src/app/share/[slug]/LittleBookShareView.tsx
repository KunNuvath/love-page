"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ZoomIn,
  X,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import type { LovePage } from "@/src/lib/supabase";
import { useRealtimeLovePage } from "@/src/lib/realtime";
import RealtimeReactionBurst from "@/src/components/RealtimeReactionBurst";
import RealtimeLiveBar from "@/src/components/RealtimeLiveBar";
import GuestbookDrawer from "@/src/components/GuestbookDrawer";
import ShareModal from "@/src/components/ShareModal";

interface Props {
  page: LovePage;
  config: any;
}

// 6 Washi tape styles matching creator view
const WASHI_PATTERNS = [
  "washi-tape-cherry",
  "washi-tape-mustard",
  "washi-tape-sky",
  "washi-tape-navy",
  "washi-tape-grid",
  "washi-tape-stripes",
];

export default function LittleBookShareView({ page, config }: Props) {
  const [currentSpread, setCurrentSpread] = useState<number>(1);
  const [lightbox, setLightbox] = useState<{ src: string; caption?: string } | null>(null);
  const [isGuestbookOpen, setIsGuestbookOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Realtime hook
  const {
    viewerCount,
    reactions,
    particles,
    guestbook,
    triggerReaction,
    postGuestbookNote,
  } = useRealtimeLovePage(page.slug);

  // Audio state
  const songSrc = config?.song?.src || "/music/miguel-sure-thing.mp3";
  const songTitle = config?.song?.title || "Miguel - Sure Thing";
  const [audio] = useState(() => (typeof window !== "undefined" ? new Audio(songSrc) : null));
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!audio) return;
    audio.loop = true;
    return () => {
      audio.pause();
    };
  }, [audio]);

  const toggleMusic = async () => {
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {}
    }
  };

  const toggleMute = () => {
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  // Extract photos, notes, titles
  const photos: Record<number, string> = config?.photos ?? {};
  const notes: Record<string, string> = config?.notes ?? {};
  const titles: Record<string, string> = config?.titles ?? {};
  const bookTitle = config?.title || page.title || "Our Little Book";
  const bookSubtitle = config?.subtitle || "a tiny collection of favorite moments";

  const getNote = (key: string, defaultText: string) => {
    return notes[key] || defaultText;
  };

  const getTitle = (key: string, defaultText: string) => {
    return titles[key] || defaultText;
  };

  const tabNames = [
    { id: 1, label: getTitle("tab1", "hello"), color: "bg-washi-mustard text-washi-navy" },
    { id: 2, label: getTitle("tab2", "little things"), color: "bg-washi-sky text-washi-navy" },
    { id: 3, label: getTitle("tab3", "memories"), color: "bg-washi-cherry text-white" },
    { id: 4, label: getTitle("tab4", "love this"), color: "bg-washi-navy text-washi-mustard" },
  ];

  return (
    <div className="min-h-screen cutting-mat-bg text-desk-text py-8 sm:py-12 px-3 sm:px-6 relative flex flex-col items-center selection:bg-washi-cherry/30 overflow-x-hidden">
      {/* Vignette Overlay */}
      <div className="fixed inset-0 cutting-mat-vignette pointer-events-none z-0" />

      {/* Realtime Reaction Bursts */}
      <RealtimeReactionBurst particles={particles} />

      {/* Top Bar */}
      <div className="relative z-30 w-full max-w-5xl flex items-center justify-between gap-3 mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium transition-all group active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Home</span>
        </Link>

        {/* Music Player Header Control */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMusic}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition-all active:scale-95"
          >
            {playing ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
            <span className="hidden sm:inline font-mono">{songTitle}</span>
            <span className="sm:hidden font-mono">Music</span>
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            {muted ? <VolumeX className="h-4 w-4 text-rose-300" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Notebook Title Bar */}
      <div className="relative z-20 text-center mb-6 max-w-xl">
        <div className="inline-block px-4 py-1 rounded-full bg-black/30 border border-white/10 text-washi-mustard text-xs font-typewriter tracking-widest uppercase mb-1">
          ✦ Spiral Keepsake Journal ✦
        </div>
        <h1 className="font-bagel text-3xl sm:text-4xl text-white drop-shadow-md">
          {bookTitle}
        </h1>
        {bookSubtitle && (
          <p className="font-gaegu text-xl sm:text-2xl text-washi-mustard drop-shadow-sm">
            {bookSubtitle}
          </p>
        )}
      </div>

      {/* Main Open Notebook Container */}
      <div className="relative z-10 w-full max-w-5xl my-4">
        {/* Spiral Notebook Tabs */}
        <div className="flex items-center justify-end gap-1.5 pr-6 -mb-1 relative z-20">
          {tabNames.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCurrentSpread(tab.id)}
              className={`px-4 py-1.5 rounded-t-xl text-xs font-bagel transition-all shadow-xs border-t border-x border-black/20 ${
                currentSpread === tab.id
                  ? `${tab.color} scale-105 shadow-md -translate-y-1`
                  : "bg-white/30 text-white/80 hover:bg-white/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Open Book Spreads */}
        <div className="relative bg-[#fbfaf4] rounded-2xl shadow-2xl border-4 border-[#ded8c4] p-4 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 min-h-[560px]">
          {/* Central 17 Metal Spiral Rings */}
          <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 flex-col justify-between py-6 z-30 pointer-events-none">
            {Array.from({ length: 17 }).map((_, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full spiral-hole" />
                <div className="w-7 h-2 rounded-full spiral-ring -mx-1" />
                <div className="w-2.5 h-2.5 rounded-full spiral-hole" />
              </div>
            ))}
          </div>

          {/* SPREAD 1 */}
          {currentSpread === 1 && (
            <>
              {/* Left Page */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block px-3 py-1 rounded bg-washi-mustard/30 text-washi-navy font-bagel text-lg mb-3">
                    {getTitle("s1_l", "hello, you")}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[1, 2].map((id) => (
                      <PhotoCard
                        key={id}
                        id={id}
                        src={photos[id]}
                        tapeIndex={id}
                        onZoom={(src) => setLightbox({ src })}
                      />
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-white/70 rounded-xl border border-dashed border-[#cbbeaa]">
                  <p className="font-gaegu text-xl text-[#3d332a] leading-relaxed whitespace-pre-wrap">
                    {getNote("s1_l", "A little piece of us, bound with love and golden memories.")}
                  </p>
                </div>
              </div>

              {/* Right Page */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[3, 4].map((id) => (
                    <PhotoCard
                      key={id}
                      id={id}
                      src={photos[id]}
                      tapeIndex={id + 2}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  ))}
                </div>
                <div className="p-4 bg-white/80 rounded-xl border border-[#cbbeaa] shadow-xs">
                  <div className="flex items-center gap-1.5 text-washi-cherry mb-1 font-bagel">
                    <Heart className="h-4 w-4 fill-washi-cherry" />
                    <span>Forever & Always</span>
                  </div>
                  <p className="font-gaegu text-xl text-[#3d332a] leading-relaxed whitespace-pre-wrap">
                    {getNote("s1_r", "Thank you for being my favorite part of every single day.")}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* SPREAD 2 */}
          {currentSpread === 2 && (
            <>
              {/* Left Page */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block px-3 py-1 rounded bg-washi-sky/30 text-washi-navy font-bagel text-lg mb-3">
                    {getTitle("s2_l", "little things")}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[5, 6].map((id) => (
                      <PhotoCard
                        key={id}
                        id={id}
                        src={photos[id]}
                        tapeIndex={id}
                        onZoom={(src) => setLightbox({ src })}
                      />
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-white/70 rounded-xl border border-dashed border-[#cbbeaa]">
                  <p className="font-gaegu text-xl text-[#3d332a] leading-relaxed whitespace-pre-wrap">
                    {getNote("s2_l", "The morning coffees, the warm hugs, the inside jokes.")}
                  </p>
                </div>
              </div>

              {/* Right Page */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[7, 8].map((id) => (
                    <PhotoCard
                      key={id}
                      id={id}
                      src={photos[id]}
                      tapeIndex={id + 1}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  ))}
                </div>
                <div className="p-4 bg-white/80 rounded-xl border border-[#cbbeaa] shadow-xs">
                  <p className="font-gaegu text-xl text-[#3d332a] leading-relaxed whitespace-pre-wrap">
                    {getNote("s2_r", "All the little moments that turned into a great big love.")}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* SPREAD 3 */}
          {currentSpread === 3 && (
            <>
              {/* Left Page */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block px-3 py-1 rounded bg-washi-cherry/20 text-washi-cherry font-bagel text-lg mb-3">
                    {getTitle("s3_l", "sweet memories")}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[9, 10].map((id) => (
                      <PhotoCard
                        key={id}
                        id={id}
                        src={photos[id]}
                        tapeIndex={id}
                        onZoom={(src) => setLightbox({ src })}
                      />
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-white/70 rounded-xl border border-dashed border-[#cbbeaa]">
                  <p className="font-gaegu text-xl text-[#3d332a] leading-relaxed whitespace-pre-wrap">
                    {getNote("s3_l", "Moments we will tell our future selves about.")}
                  </p>
                </div>
              </div>

              {/* Right Page */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[11, 12, 13].map((id) => (
                    <PhotoCard
                      key={id}
                      id={id}
                      src={photos[id]}
                      tapeIndex={id + 3}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  ))}
                </div>
                <div className="p-4 bg-white/80 rounded-xl border border-[#cbbeaa] shadow-xs">
                  <p className="font-gaegu text-xl text-[#3d332a] leading-relaxed whitespace-pre-wrap">
                    {getNote("s3_r", "Every adventure with you is my absolute favorite.")}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* SPREAD 4 */}
          {currentSpread === 4 && (
            <>
              {/* Left Page */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="inline-block px-3 py-1 rounded bg-washi-navy/20 text-washi-navy font-bagel text-lg mb-3">
                    {getTitle("s4_l", "love this")}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[14, 15].map((id) => (
                      <PhotoCard
                        key={id}
                        id={id}
                        src={photos[id]}
                        tapeIndex={id}
                        onZoom={(src) => setLightbox({ src })}
                      />
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-white/70 rounded-xl border border-dashed border-[#cbbeaa]">
                  <p className="font-gaegu text-xl text-[#3d332a] leading-relaxed whitespace-pre-wrap">
                    {getNote("s4_l", "To many more chapters, roadtrips, and warm memories.")}
                  </p>
                </div>
              </div>

              {/* Right Page */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[16, 17, 18].map((id) => (
                    <PhotoCard
                      key={id}
                      id={id}
                      src={photos[id]}
                      tapeIndex={id + 1}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  ))}
                </div>
                <div className="p-4 bg-[#fffdf0] rounded-xl border-2 border-dashed border-washi-cherry/40 shadow-xs">
                  <div className="flex items-center gap-1.5 text-washi-cherry font-bagel text-lg mb-1">
                    <Sparkles className="h-4 w-4" />
                    <span>My Vow to You</span>
                  </div>
                  <p className="font-gaegu text-xl text-[#3d332a] leading-relaxed whitespace-pre-wrap">
                    {getNote("s4_r", "I will love you today, tomorrow, and every chapter to follow.")}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Spread Navigation Arrows */}
        <div className="flex items-center justify-between mt-4 px-2">
          <button
            type="button"
            disabled={currentSpread === 1}
            onClick={() => setCurrentSpread((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold disabled:opacity-30 backdrop-blur-md transition-all active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Spread</span>
          </button>
          <div className="text-white/80 font-typewriter text-xs">
            Spread {currentSpread} of 4
          </div>
          <button
            type="button"
            disabled={currentSpread === 4}
            onClick={() => setCurrentSpread((p) => Math.min(4, p + 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold disabled:opacity-30 backdrop-blur-md transition-all active:scale-95"
          >
            <span>Next Spread</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lightbox for Zooming Photos */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-[#faf6ee] p-4 pb-6 rounded-2xl shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-[#cf493e] text-white flex items-center justify-center shadow-lg hover:bg-[#b83b31]"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.src}
              alt="Memory zoom"
              className="max-h-[70vh] w-auto object-contain rounded-lg border-2 border-white shadow-md"
            />
          </div>
        </div>
      )}

      {/* Realtime Interaction Bar */}
      <RealtimeLiveBar
        viewerCount={viewerCount}
        reactions={reactions}
        onReact={triggerReaction}
        onOpenGuestbook={() => setIsGuestbookOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        guestbookCount={guestbook.length}
        theme="cutting-mat"
      />

      {/* Guestbook Drawer */}
      <GuestbookDrawer
        isOpen={isGuestbookOpen}
        onClose={() => setIsGuestbookOpen(false)}
        entries={guestbook}
        onAddNote={postGuestbookNote}
        theme="cutting-mat"
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        slug={page.slug}
        title={bookTitle}
        theme="cutting-mat"
      />
    </div>
  );
}

function PhotoCard({
  id,
  src,
  tapeIndex,
  onZoom,
}: {
  id: number;
  src?: string;
  tapeIndex: number;
  onZoom: (src: string) => void;
}) {
  const tape = WASHI_PATTERNS[tapeIndex % WASHI_PATTERNS.length];
  return (
    <div className="relative group aspect-[4/3] bg-white p-2 rounded-lg shadow-sm border border-[#e4decb] flex items-center justify-center overflow-hidden interactive-photo-frame">
      {/* Decorative Washi Tape */}
      <div
        className={`absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-4 ${tape} -rotate-3 z-10 pointer-events-none opacity-80`}
      />

      {src ? (
        <div
          className="relative w-full h-full rounded cursor-pointer overflow-hidden"
          onClick={() => onZoom(src)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`Memory ${id}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ZoomIn className="h-6 w-6 text-white drop-shadow-md" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-neutral-400">
          <Heart className="h-6 w-6 fill-rose-100 text-rose-300 mb-1" />
          <span className="font-gaegu text-sm">Moment {id}</span>
        </div>
      )}
    </div>
  );
}
