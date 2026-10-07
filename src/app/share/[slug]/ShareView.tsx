"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  ArrowLeft,
  ZoomIn,
  X,
  Share2,
  Sparkles,
} from "lucide-react";
import type { LovePage } from "@/src/lib/supabase";
import { useRealtimeLovePage } from "@/src/lib/realtime";
import RealtimeReactionBurst from "@/src/components/RealtimeReactionBurst";
import RealtimeLiveBar from "@/src/components/RealtimeLiveBar";
import GuestbookDrawer from "@/src/components/GuestbookDrawer";
import ShareModal from "@/src/components/ShareModal";

interface Polaroid {
  id: number;
  caption: string;
  src: string;
}

interface PageConfig {
  recipientName?: string;
  senderName?: string;
  curatedBy?: string;
  stampText?: string;
  badgeText?: string;
  topic?: string;
  message?: string;
  song?: { src: string; title: string };
  polaroids?: Polaroid[];
}

interface Props {
  page: LovePage;
  config: Record<string, any> | null;
}

const ROTATIONS = [
  "-rotate-[1.5deg]",
  "rotate-[1.8deg]",
  "-rotate-[1.0deg]",
  "rotate-[1.5deg]",
  "-rotate-[2.0deg]",
  "rotate-[0.8deg]",
];

// ── Mini music player ────────────────────────────────────────────────────────
function MiniPlayer({ song }: { song: { src: string; title: string } }) {
  const [audio] = useState(() =>
    typeof window !== "undefined" ? new Audio(song.src) : null
  );
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!audio) return;
    audio.loop = true;
    const onTime = () => {
      if (audio.duration)
        setProgress((audio.currentTime / audio.duration) * 100);
    };
    audio.addEventListener("timeupdate", onTime);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.pause();
    };
  }, [audio]);

  const toggle = async () => {
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

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#fffdf9]/90 border border-[#e4d6c4] shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#cf493e] text-white shadow-md hover:bg-[#b83b31] transition-all active:scale-95"
        >
          {playing ? (
            <Pause className="h-5 w-5 fill-white" />
          ) : (
            <Play className="h-5 w-5 fill-white translate-x-0.5" />
          )}
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Music className="h-3.5 w-3.5 text-[#cf493e]" />
            <span className="font-typewriter text-xs font-bold uppercase tracking-wider text-[#3d332a]">
              {song.title}
            </span>
          </div>
          <span className="font-handwriting text-sm text-[#7e6d5e]">
            {playing ? "Now Playing ~ melody of love" : "Click play to listen"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="h-1.5 w-full sm:w-36 bg-[#ead8c4] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#cf493e] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={toggleMute}
          className="text-[#7e6d5e] hover:text-[#3d332a] p-1 transition-colors"
        >
          {muted ? (
            <VolumeX className="h-4 w-4 text-red-500" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// ── Polaroid card (read-only) ────────────────────────────────────────────────
function ReadOnlyPolaroid({
  polaroid,
  rotationClass,
  onZoom,
}: {
  polaroid: Polaroid;
  rotationClass: string;
  onZoom: (src: string, caption: string) => void;
}) {
  return (
    <div
      className={`polaroid-card p-3 sm:p-3.5 pb-4 sm:pb-5 rounded-[3px] flex flex-col justify-between group ${rotationClass}`}
    >
      <div
        className="relative aspect-[4/3.8] w-full rounded-[2px] overflow-hidden bg-[#e8ebeb] border border-[#d8dcdd] flex items-center justify-center cursor-pointer"
        onClick={() => polaroid.src && onZoom(polaroid.src, polaroid.caption)}
      >
        {polaroid.src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={polaroid.src}
              alt={polaroid.caption}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="h-7 w-7 text-white drop-shadow" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-neutral-400">
            <Heart className="h-8 w-8 mb-1 fill-rose-100 text-rose-200" />
            <span className="text-xs">No photo</span>
          </div>
        )}
      </div>
      <div className="mt-3 text-center">
        <span className="font-handwriting text-xl sm:text-2xl text-[#2d2822] tracking-wide">
          {polaroid.caption}
        </span>
        <div className="w-12 border-b border-dashed border-[#b8ab9a] mt-0.5 mx-auto" />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ShareView({ page, config: rawConfig }: Props) {
  const cfg = (rawConfig ?? {}) as PageConfig;
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);
  const [revealed, setRevealed] = useState(false);
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

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(t);
  }, []);

  const polaroids: Polaroid[] = cfg.polaroids ?? [];
  const song = cfg.song ?? { src: "/music/miguel-sure-thing.mp3", title: "Miguel - Sure Thing" };
  const hasSong = Boolean(song.src);

  return (
    <main className="relative min-h-screen py-8 sm:py-14 px-3 sm:px-6 flex flex-col items-center justify-start overflow-x-hidden pb-28">
      {/* Realtime Reaction Bursts */}
      <RealtimeReactionBurst particles={particles} />

      {/* Floating hearts bg */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <Heart
            key={i}
            className="floating-heart animate-float fill-[#e29578]/25 text-[#e29578]/40 absolute"
            style={{
              left: `${(i * 11) % 100}%`,
              width: 14 + (i % 5) * 4,
              height: 14 + (i % 5) * 4,
              animationDuration: `${10 + i * 1.2}s`,
              animationDelay: `${i * 0.9}s`,
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="fixed top-3 sm:top-5 inset-x-3 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 text-[#5e4b3e] shadow-md border border-[#e4d6c4] hover:bg-white hover:text-[#cf493e] hover:shadow-lg transition-all text-xs sm:text-sm font-medium backdrop-blur-sm group active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5 text-[#cf493e]" />
          <span>Back to Home</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsShareOpen(true)}
          className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#e4d6c4] shadow-sm text-xs font-semibold text-[#9b7267] hover:text-[#cf493e] backdrop-blur-sm transition-all active:scale-95"
        >
          <Share2 className="h-3.5 w-3.5 text-[#cf493e]" />
          <span>Share</span>
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-white p-4 pb-6 rounded-2xl shadow-2xl flex flex-col items-center"
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
              alt={lightbox.caption}
              className="max-h-[65vh] w-auto object-contain rounded"
            />
            <p className="mt-4 font-handwriting text-2xl sm:text-3xl text-neutral-800">
              {lightbox.caption}
            </p>
          </div>
        </div>
      )}

      {/* Scrapbook Paper */}
      <div
        className={`relative z-10 w-full max-w-4xl scrapbook-paper rounded-sm p-6 sm:p-10 md:p-14 transition-all duration-1000 ${
          revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Washi tape top */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-7 sm:h-8 washi-tape-green -rotate-1 z-20 pointer-events-none" />
        <div className="absolute -top-3 -right-3 w-28 sm:w-32 h-7 sm:h-8 washi-tape-mauve rotate-[38deg] z-20 pointer-events-none" />

        {/* Stamp */}
        <div className="flex items-start justify-between">
          <div className="inline-block -rotate-6 px-3 py-1.5 stamp-memories">
            <span className="font-typewriter text-xs sm:text-sm font-bold tracking-[0.25em] block">
              {cfg.stampText ?? "MEMORIES"}
            </span>
            <div className="w-full border-b border-dashed border-[#cf493e]/60 mt-0.5" />
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-8 sm:my-10">
          <div className="w-full border-b border-dashed border-[#cbbeaa]" />
          <div className="absolute -top-10 sm:-top-12 right-6 sm:right-16 z-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/rose-sticker.jpg"
              alt="Pressed rose sticker"
              className="w-16 sm:w-20 md:w-24 object-contain mix-blend-multiply drop-shadow-[0_4px_8px_rgba(80,30,30,0.18)] -rotate-3"
            />
          </div>
        </div>

        {/* Curated By */}
        <div className="mb-8">
          <div className="inline-block">
            <h1 className="font-handwriting text-3xl sm:text-4xl text-[#36322d] tracking-wide">
              {cfg.curatedBy ?? "Curated with love"}
            </h1>
            <div className="w-full border-b border-dotted border-[#b3a492] mt-1" />
          </div>
          {cfg.badgeText && (
            <div className="mt-3.5 inline-block">
              <span className="font-typewriter text-[11px] sm:text-xs font-bold tracking-widest px-2.5 py-1 highlighter-badge text-[#2c475d] rounded-[2px] block">
                {cfg.badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Polaroid grid */}
        {polaroids.length > 0 && (
          <div className="my-8 sm:my-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
              {polaroids.map((p, i) => (
                <ReadOnlyPolaroid
                  key={p.id}
                  polaroid={p}
                  rotationClass={ROTATIONS[i % ROTATIONS.length]}
                  onZoom={(src, caption) => setLightbox({ src, caption })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Love letter */}
        <div className="my-10 p-6 sm:p-8 rounded-lg bg-[#fffefb]/80 border border-dashed border-[#d8c8b4] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 fill-[#cf493e] text-[#cf493e]" />
            <h2 className="font-handwriting text-2xl sm:text-3xl text-[#36322d]">
              {cfg.topic ?? page.title}, {cfg.recipientName ?? ""}
            </h2>
          </div>
          <p className="font-handwriting text-lg sm:text-xl leading-relaxed text-[#4a423a] whitespace-pre-line">
            {cfg.message ?? ""}
          </p>
          <div className="mt-4 text-right">
            <span className="font-handwriting text-xl sm:text-2xl text-[#cf493e]">
              — with all my love, {cfg.senderName ?? ""}
            </span>
          </div>
        </div>

        {/* Music player */}
        {hasSong && (
          <div className="mt-8">
            <MiniPlayer song={song} />
          </div>
        )}
      </div>

      <footer className="relative z-10 mt-10 mb-4 text-center">
        <p className="text-[11px] sm:text-xs font-typewriter text-[#9b7267]">
          Made with 💖 · LovePage Studio
        </p>
      </footer>

      {/* Realtime Live Bar */}
      <RealtimeLiveBar
        viewerCount={viewerCount}
        reactions={reactions}
        onReact={triggerReaction}
        onOpenGuestbook={() => setIsGuestbookOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        guestbookCount={guestbook.length}
        theme="light"
      />

      {/* Guestbook Drawer */}
      <GuestbookDrawer
        isOpen={isGuestbookOpen}
        onClose={() => setIsGuestbookOpen(false)}
        entries={guestbook}
        onAddNote={postGuestbookNote}
        theme="light"
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        slug={page.slug}
        title={page.title}
        theme="light"
      />
    </main>
  );
}
