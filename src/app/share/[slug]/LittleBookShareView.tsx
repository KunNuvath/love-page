"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import type { LovePage } from "@/src/lib/supabase";
import { useRealtimeLovePage } from "@/src/lib/realtime";
import RealtimeReactionBurst from "@/src/components/RealtimeReactionBurst";
import RealtimeLiveBar from "@/src/components/RealtimeLiveBar";
import GuestbookDrawer from "@/src/components/GuestbookDrawer";
import ShareModal from "@/src/components/ShareModal";
import { WashiTape, CentralSpiralBinding } from "@/src/components/LittleBook";

interface Props {
  page: LovePage;
  config: any;
}

function ReadOnlyPhotoFrame({
  id,
  dimensions,
  aspectRatioClass = "aspect-[4/5]",
  rotation = "rotate-0",
  photoSrc,
  onZoom,
  compact = false,
}: {
  id: number;
  dimensions: string;
  aspectRatioClass?: string;
  rotation?: string;
  photoSrc?: string | null;
  onZoom: (src: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative interactive-photo-frame bg-white ${
        compact
          ? "p-1.5 xs:p-2 sm:p-2.5 pb-2 xs:pb-2.5 sm:pb-3"
          : "p-2 xs:p-2.5 sm:p-3 pb-2.5 xs:pb-3 sm:pb-3.5"
      } rounded-[3px] shadow-[0_6px_18px_rgba(20,45,35,0.18)] ${
        photoSrc ? "cursor-pointer" : ""
      } group select-none ${rotation}`}
      onClick={() => {
        if (photoSrc) onZoom(photoSrc);
      }}
    >
      <div
        className={`relative w-full ${aspectRatioClass} rounded-[2px] overflow-hidden flex flex-col items-center justify-center border ${
          photoSrc
            ? "border-neutral-300"
            : "border-dashed border-[#b8b3a0] photo-placeholder-stripes"
        }`}
      >
        {photoSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc}
              alt={`Memory ${id}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ZoomIn className="h-5 w-5 text-white drop-shadow-md" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-1 sm:p-2 text-[#8e8a7c]">
            <Heart
              className={`${
                compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4 sm:h-5 sm:w-5"
              } fill-rose-100 text-rose-300 mb-0.5 shrink-0`}
            />
            <span className="font-mono text-[8px] xs:text-[9px] sm:text-[10px] opacity-75">
              {dimensions}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadOnlyRuledNote({ text }: { text: string }) {
  return (
    <div className="w-full journal-ruled-lines font-gaegu text-base xs:text-lg sm:text-xl text-[#2a2a35] whitespace-pre-wrap leading-[24px] min-h-[72px] py-0.5">
      {text}
    </div>
  );
}

export default function LittleBookShareView({ page, config }: Props) {
  const [currentSpread, setCurrentSpread] = useState<number>(0); // 0..3 matching creator spreads
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
  const songStartTime = config?.song?.startTime || 0;
  const songEndTime = config?.song?.endTime;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    if (songEndTime && a.currentTime >= songEndTime) {
      a.currentTime = songStartTime;
    }
  };

  const toggleMusic = useCallback(async () => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      try {
        await a.play();
        setPlaying(true);
        if (
          songStartTime > 0 &&
          Math.abs(a.currentTime - songStartTime) > 1 &&
          a.currentTime < songStartTime
        ) {
          a.currentTime = songStartTime;
        }
      } catch (err) {
        console.warn("Audio play blocked or failed:", err);
        setPlaying(false);
      }
    }
  }, [playing, songStartTime]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  // Start music on first touch anywhere
  useEffect(() => {
    const handleFirstTouch = async () => {
      if (!audioRef.current || playing) return;
      try {
        const a = audioRef.current;
        await a.play();
        setPlaying(true);
        if (songStartTime > 0 && a.currentTime < songStartTime) {
          a.currentTime = songStartTime;
        }
      } catch {}
    };

    window.addEventListener("pointerdown", handleFirstTouch, { once: true });
    window.addEventListener("touchstart", handleFirstTouch, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstTouch);
      window.removeEventListener("touchstart", handleFirstTouch);
    };
  }, [playing, songStartTime]);

  // Extract photos, notes, titles, tabLabels
  const photos: Record<number, string> = config?.photos ?? {};
  const notes: Record<string, string> = config?.notes ?? {};
  const titles: Record<string, string> = config?.titles ?? {};
  const savedTabLabels: string[] = Array.isArray(config?.tabLabels)
    ? config.tabLabels
    : [];
  const bookTitle = config?.title || page.title || "Our Little Book";
  const bookSubtitle = config?.subtitle || "curated with love";

  const getNote = (key: string, defaultText: string) => {
    return notes[key] || defaultText;
  };

  const getTitle = (key: string, defaultText: string) => {
    return titles[key] || defaultText;
  };

  const tabLabels = [
    savedTabLabels[0] || getTitle("tab1", "Hello"),
    savedTabLabels[1] || getTitle("tab2", "Little Things"),
    savedTabLabels[2] || getTitle("tab3", "Memories"),
    savedTabLabels[3] || getTitle("tab4", "Love This"),
  ];

  return (
    <div className="min-h-screen cutting-mat-bg text-desk-text py-5 sm:py-10 px-4 xs:px-5 sm:px-6 pb-28 relative flex flex-col items-center selection:bg-washi-cherry/30 overflow-x-hidden">
      {/* Vignette Overlay */}
      <div className="fixed inset-0 cutting-mat-vignette pointer-events-none z-0" />

      {/* Real Audio Element */}
      <audio
        ref={audioRef}
        src={songSrc}
        loop={!songEndTime}
        preload="auto"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
      />

      {/* Realtime Reaction Bursts */}
      <RealtimeReactionBurst particles={particles} />

      {/* Top Bar */}
      <div className="relative z-30 w-full max-w-5xl flex items-center justify-between gap-2 mb-4 sm:mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium transition-all group active:scale-95 shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Home</span>
        </Link>

        {/* Music Player + Share Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleMusic}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full backdrop-blur-md border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              playing
                ? "bg-washi-cherry text-white border-washi-cherry shadow-md"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
            }`}
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5 fill-white shrink-0" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-white shrink-0" />
            )}
            <Music className="h-3.5 w-3.5 text-washi-mustard shrink-0" />
            <span className="hidden xs:inline max-w-[120px] sm:max-w-[180px] truncate font-mono text-[11px]">
              {songTitle}
            </span>
            <span className="xs:hidden font-mono text-[11px]">
              {playing ? "Playing" : "Play"}
            </span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-300" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Share</span>
          </button>
        </div>
      </div>

      {/* 1. Masthead Title Card (Matching Creator View) */}
      <div className="relative z-20 w-full max-w-[92vw] xs:max-w-md sm:max-w-xl text-center mb-4 sm:mb-7">
        <div className="relative inline-block w-full max-w-md book-page-paper p-3 xs:p-4 sm:p-6 rounded-sm transform -rotate-[1deg] shadow-xl border border-[#dcd7c3]">
          <div className="border border-dashed border-[#26386b]/40 p-2.5 xs:p-3.5 sm:p-5">
            <WashiTape
              pattern="teal-stripes"
              className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-4 sm:h-6"
            />
            <h1 className="font-bagel text-xl xs:text-2xl sm:text-4xl text-washi-navy">
              {bookTitle}
            </h1>
            {bookSubtitle && (
              <p className="font-gaegu text-base xs:text-lg sm:text-2xl text-washi-cherry mt-0.5">
                {bookSubtitle}
              </p>
            )}
            <WashiTape
              pattern="mustard-dotted"
              className="absolute -bottom-2 -right-1.5 sm:-right-3 w-20 sm:w-28 h-4 sm:h-6 rotate-6"
            />
          </div>
        </div>
      </div>

      {/* 2. Spread Tabs */}
      <div className="relative z-20 w-full max-w-4xl flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap px-1">
        {([
          {
            index: 0,
            rotate: "-rotate-1 sm:-rotate-2",
            activeColor:
              "bg-washi-mustard text-washi-navy ring-2 ring-white underline decoration-2 decoration-washi-navy",
            inactiveColor:
              "bg-[#e8a628]/80 text-washi-navy/90 hover:bg-washi-mustard",
          },
          {
            index: 1,
            rotate: "rotate-1 sm:rotate-[1.5deg]",
            activeColor:
              "bg-washi-sky text-washi-navy ring-2 ring-white underline decoration-2 decoration-washi-navy",
            inactiveColor:
              "bg-[#8ec5e6]/80 text-washi-navy/90 hover:bg-washi-sky",
          },
          {
            index: 2,
            rotate: "-rotate-1 sm:-rotate-[1.5deg]",
            activeColor:
              "bg-washi-cherry text-white ring-2 ring-white underline decoration-2 decoration-white",
            inactiveColor:
              "bg-[#c72f57]/80 text-white hover:bg-washi-cherry",
          },
          {
            index: 3,
            rotate: "rotate-1 sm:rotate-2",
            activeColor:
              "bg-washi-sage text-washi-navy ring-2 ring-white underline decoration-2 decoration-washi-navy",
            inactiveColor:
              "bg-[#a3b68d]/80 text-washi-navy/90 hover:bg-washi-sage",
          },
        ] as const).map(({ index, rotate, activeColor, inactiveColor }) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentSpread(index)}
            className={`relative px-3 xs:px-4 sm:px-6 py-1.5 sm:py-2 rounded-sm font-bagel text-[11px] xs:text-xs sm:text-sm transition-all transform ${rotate} shadow-md cursor-pointer ${
              currentSpread === index
                ? `${activeColor} scale-105`
                : `${inactiveColor} hover:scale-102`
            }`}
          >
            {tabLabels[index]}
          </button>
        ))}
      </div>

      {/* 3. Open Book Spreads (Identical 18-frame structure to Creator View) */}
      <div className="relative z-20 w-full max-w-[92vw] xs:max-w-[90vw] sm:max-w-5xl flex flex-col md:flex-row items-stretch justify-center gap-0 my-2 sm:my-4 mx-auto">
        {/* LEFT PAGE */}
        <div className="flex-1 book-page-paper rounded-t-lg md:rounded-l-lg md:rounded-tr-none p-3.5 xs:p-5 sm:p-8 md:p-10 border border-[#ded9c5] relative flex flex-col justify-between min-h-[360px] sm:min-h-[560px] overflow-hidden">
          <WashiTape
            pattern="teal-stripes"
            className="absolute top-2 left-5 w-20 sm:w-24 h-4 sm:h-5 -rotate-2"
          />

          {/* SPREAD 1 (LEFT) */}
          {currentSpread === 0 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-[200px] xs:max-w-[230px] sm:max-w-[270px]">
                  <WashiTape
                    pattern="mustard-dotted"
                    className="absolute -top-2 -left-2.5 w-14 sm:w-16 h-4 sm:h-5 -rotate-12 z-20"
                  />
                  <WashiTape
                    pattern="cherry-gingham"
                    className="absolute -bottom-2 -right-2.5 w-14 sm:w-16 h-4 sm:h-5 rotate-12 z-20"
                  />
                  <ReadOnlyPhotoFrame
                    id={1}
                    dimensions="4×6″"
                    aspectRatioClass="aspect-[4/5.2]"
                    rotation="-rotate-2"
                    photoSrc={photos[1]}
                    onZoom={(src) => setLightbox({ src })}
                  />
                </div>

                <div className="flex flex-col gap-1 w-28 sm:w-36 mt-3 sm:mt-4 opacity-90">
                  <WashiTape pattern="teal-stripes" className="w-full h-2.5 sm:h-3" />
                  <WashiTape pattern="sage-dashes" className="w-4/5 h-2.5 sm:h-3 ml-2" />
                  <WashiTape pattern="sky-scallops" className="w-full h-2.5 sm:h-3" />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <ReadOnlyRuledNote
                  text={getNote(
                    "s1_l",
                    "This is where our story begins. Every memory with you brings the warmest smile to my heart."
                  )}
                />
              </div>

              <div className="text-right mt-2 sm:mt-3">
                <span className="inline-block font-bagel text-xl xs:text-2xl sm:text-3xl text-washi-navy px-3 py-0.5 bg-washi-mustard/30 rounded-sm">
                  {getTitle("s1_l", "Hello, You")}
                </span>
              </div>
            </div>
          )}

          {/* SPREAD 2 (LEFT) */}
          {currentSpread === 1 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="mb-2.5 sm:mb-3">
                  <span className="inline-block font-bagel text-xl xs:text-2xl sm:text-3xl text-washi-navy px-3 py-0.5 bg-washi-sky/40 rounded-sm">
                    {getTitle("s2_l", "Little Things")}
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-3 gap-1.5 xs:gap-2">
                    <ReadOnlyPhotoFrame
                      id={4}
                      dimensions="3×5″"
                      aspectRatioClass="aspect-[3/4.5]"
                      rotation="-rotate-1"
                      photoSrc={photos[4]}
                      onZoom={(src) => setLightbox({ src })}
                      compact
                    />
                    <ReadOnlyPhotoFrame
                      id={5}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-1"
                      photoSrc={photos[5]}
                      onZoom={(src) => setLightbox({ src })}
                      compact
                    />
                    <ReadOnlyPhotoFrame
                      id={6}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="-rotate-1"
                      photoSrc={photos[6]}
                      onZoom={(src) => setLightbox({ src })}
                      compact
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 xs:gap-2">
                    <ReadOnlyPhotoFrame
                      id={7}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-1"
                      photoSrc={photos[7]}
                      onZoom={(src) => setLightbox({ src })}
                      compact
                    />
                    <ReadOnlyPhotoFrame
                      id={8}
                      dimensions="3×2″"
                      aspectRatioClass="aspect-[3/2.4]"
                      rotation="-rotate-1"
                      photoSrc={photos[8]}
                      onZoom={(src) => setLightbox({ src })}
                      compact
                    />
                    <ReadOnlyPhotoFrame
                      id={9}
                      dimensions="3×2″"
                      aspectRatioClass="aspect-[3/2.4]"
                      rotation="rotate-1"
                      photoSrc={photos[9]}
                      onZoom={(src) => setLightbox({ src })}
                      compact
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <ReadOnlyRuledNote
                  text={getNote(
                    "s2_l",
                    "It's always the little conversations and coffee sips that mean the most."
                  )}
                />
              </div>
            </div>
          )}

          {/* SPREAD 3 (LEFT) */}
          {currentSpread === 2 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="mb-3 sm:mb-4">
                  <span className="inline-block font-bagel text-xl xs:text-2xl sm:text-3xl text-white px-3.5 py-0.5 bg-washi-cherry rounded-sm">
                    {getTitle("s3_l", "Memories")}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-3">
                  <div className="relative">
                    <WashiTape
                      pattern="cherry-gingham"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3.5 sm:h-4 z-20"
                    />
                    <ReadOnlyPhotoFrame
                      id={11}
                      dimensions="2×3″"
                      aspectRatioClass="aspect-[2/3]"
                      rotation="-rotate-1"
                      photoSrc={photos[11]}
                      onZoom={(src) => setLightbox({ src })}
                      compact
                    />
                  </div>
                  <div className="relative">
                    <WashiTape
                      pattern="mustard-dotted"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3.5 sm:h-4 z-20"
                    />
                    <ReadOnlyPhotoFrame
                      id={12}
                      dimensions="2×3″"
                      aspectRatioClass="aspect-[2/3]"
                      rotation="rotate-1"
                      photoSrc={photos[12]}
                      onZoom={(src) => setLightbox({ src })}
                      compact
                    />
                  </div>
                  <div className="relative">
                    <WashiTape
                      pattern="teal-stripes"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3.5 sm:h-4 z-20"
                    />
                    <ReadOnlyPhotoFrame
                      id={13}
                      dimensions="2×3″"
                      aspectRatioClass="aspect-[2/3]"
                      rotation="-rotate-1"
                      photoSrc={photos[13]}
                      onZoom={(src) => setLightbox({ src })}
                      compact
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 sm:mt-6">
                <ReadOnlyRuledNote
                  text={getNote(
                    "s3_l",
                    "Looking back at these moments reminds me how full of happiness our journey has been."
                  )}
                />
              </div>
            </div>
          )}

          {/* SPREAD 4 (LEFT) */}
          {currentSpread === 3 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <span className="inline-block font-bagel text-2xl xs:text-3xl sm:text-4xl text-washi-navy px-3.5 py-1 bg-washi-sage/40 rounded-sm mb-3 sm:mb-4">
                  {getTitle("s4_l", "Love This")}
                </span>

                <div className="flex flex-row gap-3 sm:gap-4 items-center justify-center sm:justify-start">
                  <div className="relative w-36 xs:w-44 sm:w-[200px] shrink-0">
                    <WashiTape
                      pattern="sage-dashes"
                      className="absolute -top-2 -left-2 w-12 sm:w-14 h-3.5 sm:h-4 -rotate-6 z-20"
                    />
                    <ReadOnlyPhotoFrame
                      id={15}
                      dimensions="4×6″"
                      aspectRatioClass="aspect-[4/5.2]"
                      rotation="-rotate-2"
                      photoSrc={photos[15]}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 w-20 xs:w-24 sm:w-32 opacity-90">
                    <WashiTape pattern="mustard-dotted" className="w-full h-3 sm:h-3.5" />
                    <WashiTape pattern="cherry-gingham" className="w-5/6 h-3 sm:h-3.5 ml-1.5" />
                    <WashiTape pattern="teal-stripes" className="w-full h-3 sm:h-3.5" />
                    <WashiTape pattern="sky-scallops" className="w-4/5 h-3 sm:h-3.5 ml-1" />
                  </div>
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <ReadOnlyRuledNote
                  text={getNote(
                    "s4_l",
                    "I love everything about this day and every sweet second spent with you."
                  )}
                />
              </div>
            </div>
          )}

          <div className="text-[10px] sm:text-[11px] font-mono text-[#8a8677] mt-2 sm:mt-3">
            p. {currentSpread * 2 + 1}
          </div>
        </div>

        {/* CENTRAL SPIRAL BINDING */}
        <CentralSpiralBinding />

        {/* RIGHT PAGE */}
        <div className="flex-1 book-page-paper rounded-b-lg md:rounded-r-lg md:rounded-bl-none p-3.5 xs:p-5 sm:p-8 md:p-10 border border-[#ded9c5] relative flex flex-col justify-between min-h-[360px] sm:min-h-[560px] overflow-hidden">
          <WashiTape
            pattern="mustard-dotted"
            className="absolute top-2 right-5 w-20 sm:w-24 h-4 sm:h-5 rotate-2"
          />

          {/* SPREAD 1 (RIGHT) */}
          {currentSpread === 0 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4 mb-2 sm:mb-3">
                  <div className="relative">
                    <WashiTape
                      pattern="sky-scallops"
                      className="absolute -top-2 left-2 w-12 sm:w-14 h-3.5 sm:h-4 rotate-3 z-20"
                    />
                    <ReadOnlyPhotoFrame
                      id={2}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-1"
                      photoSrc={photos[2]}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  </div>

                  <div className="relative">
                    <WashiTape
                      pattern="sage-dashes"
                      className="absolute -top-2 right-2 w-12 sm:w-14 h-3.5 sm:h-4 -rotate-3 z-20"
                    />
                    <ReadOnlyPhotoFrame
                      id={3}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="-rotate-2"
                      photoSrc={photos[3]}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  </div>
                </div>

                <div className="flex justify-center my-1.5 sm:my-2">
                  <Heart className="h-4 w-4 fill-washi-cherry text-washi-cherry animate-pulse" />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <ReadOnlyRuledNote
                  text={getNote(
                    "s1_r",
                    "Together is our favorite place to be. Every glance, every laugh, every quiet pause feels like magic."
                  )}
                />
              </div>

              <div className="text-right text-[10px] sm:text-[11px] font-mono text-[#8a8677] mt-2 sm:mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}

          {/* SPREAD 2 (RIGHT) */}
          {currentSpread === 1 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="flex items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  <div className="relative w-36 xs:w-40 sm:w-48 shrink-0">
                    <ReadOnlyPhotoFrame
                      id={10}
                      dimensions="4×4″"
                      aspectRatioClass="aspect-square"
                      rotation="rotate-1"
                      photoSrc={photos[10]}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 w-20 xs:w-24 sm:w-28 opacity-90">
                    <WashiTape pattern="mustard-dotted" className="w-full h-2.5 sm:h-3" />
                    <WashiTape pattern="cherry-gingham" className="w-5/6 h-2.5 sm:h-3 ml-1.5" />
                    <WashiTape pattern="teal-stripes" className="w-full h-2.5 sm:h-3" />
                    <WashiTape pattern="sky-scallops" className="w-4/5 h-2.5 sm:h-3 ml-1" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-center my-2 sm:my-3 opacity-90">
                  <WashiTape pattern="teal-stripes" className="w-3.5 sm:w-4 h-8 sm:h-10 -rotate-12" />
                  <WashiTape pattern="mustard-dotted" className="w-3.5 sm:w-4 h-10 sm:h-12 -rotate-6" />
                  <WashiTape pattern="cherry-gingham" className="w-3.5 sm:w-4 h-11 sm:h-14 rotate-0" />
                  <WashiTape pattern="sage-dashes" className="w-3.5 sm:w-4 h-10 sm:h-12 rotate-6" />
                  <WashiTape pattern="sky-scallops" className="w-3.5 sm:w-4 h-8 sm:h-10 rotate-12" />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <ReadOnlyRuledNote
                  text={getNote(
                    "s2_r",
                    "Cherishing all these quiet little moments that make life so unimaginably sweet."
                  )}
                />
              </div>

              <div className="text-right text-[10px] sm:text-[11px] font-mono text-[#8a8677] mt-2 sm:mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}

          {/* SPREAD 3 (RIGHT) */}
          {currentSpread === 2 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="inline-block font-bagel text-xl xs:text-2xl text-washi-navy px-3 py-0.5 bg-washi-mustard/40 rounded-sm">
                    {getTitle("s3_r", "So Fun")}
                  </span>
                  <Sparkles className="h-4 w-4 text-washi-mustard" />
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-center my-2 sm:my-3 px-1">
                  <div className="w-full">
                    <ReadOnlyPhotoFrame
                      id={14}
                      dimensions="4×4″"
                      aspectRatioClass="aspect-square"
                      rotation="-rotate-3 sm:-rotate-6"
                      photoSrc={photos[14]}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  </div>
                  <div className="w-full sm:mt-4">
                    <ReadOnlyPhotoFrame
                      id={16}
                      dimensions="4×4″"
                      aspectRatioClass="aspect-square"
                      rotation="rotate-3 sm:rotate-6"
                      photoSrc={photos[16]}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-full my-2.5 sm:my-3 opacity-90">
                  <WashiTape pattern="cherry-gingham" className="w-full h-2.5 sm:h-3" />
                  <WashiTape pattern="navy-checks" className="w-11/12 h-2.5 sm:h-3 mx-auto" />
                  <WashiTape pattern="sage-dashes" className="w-full h-2.5 sm:h-3" />
                </div>
              </div>

              <div className="mt-2">
                <ReadOnlyRuledNote
                  text={getNote(
                    "s3_r",
                    "So much laughter, silly jokes, and wonderful adventures."
                  )}
                />
              </div>

              <div className="text-right text-[10px] sm:text-[11px] font-mono text-[#8a8677] mt-2 sm:mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}

          {/* SPREAD 4 (RIGHT) */}
          {currentSpread === 3 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-center my-2 px-1">
                  <div className="w-full">
                    <ReadOnlyPhotoFrame
                      id={17}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="-rotate-3 sm:-rotate-6"
                      photoSrc={photos[17]}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  </div>
                  <div className="w-full sm:mt-3">
                    <ReadOnlyPhotoFrame
                      id={18}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-3 sm:rotate-6"
                      photoSrc={photos[18]}
                      onZoom={(src) => setLightbox({ src })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-2 opacity-90">
                  <WashiTape pattern="mustard-dotted" className="w-12 sm:w-16 h-3 rotate-6" />
                  <WashiTape pattern="cherry-gingham" className="w-12 sm:w-14 h-3 -rotate-3" />
                  <WashiTape pattern="teal-stripes" className="w-12 sm:w-16 h-3 rotate-3" />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <ReadOnlyRuledNote
                  text={getNote(
                    "s4_r",
                    "Forever grateful for you and every sweet moment we share together."
                  )}
                />
              </div>

              <div className="text-right text-[10px] sm:text-[11px] font-mono text-[#8a8677] mt-2 sm:mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Spread Navigation Arrows */}
      <div className="relative z-20 w-full max-w-[92vw] xs:max-w-[90vw] sm:max-w-4xl flex items-center justify-between mt-4 px-1 gap-2">
        <button
          type="button"
          disabled={currentSpread === 0}
          onClick={() => setCurrentSpread((p) => Math.max(0, p - 1))}
          className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold disabled:opacity-30 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden xs:inline">Previous Spread</span>
          <span className="xs:hidden">Back</span>
        </button>

        <div className="text-white/90 font-gaegu text-sm xs:text-base sm:text-lg px-3 py-1 rounded-full bg-black/20 border border-white/10">
          {tabLabels[currentSpread]} ({currentSpread + 1} / 4)
        </div>

        <button
          type="button"
          disabled={currentSpread === 3}
          onClick={() => setCurrentSpread((p) => Math.min(3, p + 1))}
          className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold disabled:opacity-30 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        >
          <span className="hidden xs:inline">Next Spread</span>
          <span className="xs:hidden">Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Lightbox for Zooming Photos */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-[#faf6ee] p-3 sm:p-4 pb-5 rounded-2xl shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-[#cf493e] text-white flex items-center justify-center shadow-lg hover:bg-[#b83b31] cursor-pointer"
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
