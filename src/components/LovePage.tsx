"use client";

import { useEffect, useRef, useState } from "react";
import {
  Heart,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  X,
  Sparkles,
  Music,
} from "lucide-react";

/**
 * ---------------------------------------------------------------
 * EDIT EVERYTHING BELOW THIS LINE TO PERSONALIZE THE PAGE
 * ---------------------------------------------------------------
 */
const CONFIG = {
  name: "Lina",
  from: "Miguel",
  curatedBy: "Curated by Vath",
  stamp: "MEMORIES",
  volume: "VOL. 01 / ORIGINAL",
  heading: "To the love of my life",
  message: `Every day with you feels like a gift I didn't know I needed.
Thank you for your laugh, your patience, and the way you make
ordinary moments feel extraordinary. I love you more than words
can say.`,
  // Song configuration
  song: {
    src: "/music/miguel-sure-thing.mp3",
    title: "Miguel - Sure Thing",
  },
  // Default captions for the 6 polaroids (3 in a row)
  defaultPolaroids: [
    { id: 1, caption: "Us", src: "" },
    { id: 2, caption: "First Date", src: "" },
    { id: 3, caption: "Sweet Moments", src: "" },
    { id: 4, caption: "Adventures", src: "" },
    { id: 5, caption: "Laughs & Coffee", src: "" },
    { id: 6, caption: "Forever & Always", src: "" },
  ],
};
/**
 * ---------------------------------------------------------------
 * END OF EDITABLE CONTENT
 * ---------------------------------------------------------------
 */

// Subtle floating background hearts
function FloatingHearts() {
  const [hearts, setHearts] = useState<
    Array<{ id: number; left: number; duration: number; delay: number; size: number }>
  >([]);

  useEffect(() => {
    const list = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 10 + Math.random() * 12,
      delay: Math.random() * 8,
      size: 14 + Math.random() * 16,
    }));
    setHearts(list);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {hearts.map((h) => (
        <Heart
          key={h.id}
          className="floating-heart animate-float fill-[#e29578]/25 text-[#e29578]/40"
          style={{
            left: `${h.left}%`,
            width: h.size,
            height: h.size,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Retro Scrapbook Music Player
function ScrapbookMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      try {
        setHasError(false);
        await audioRef.current.play();
      } catch (err) {
        console.error("Audio playback error:", err);
        setHasError(true);
        setPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    setProgress(
      (audioRef.current.currentTime / audioRef.current.duration) * 100
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#fffdf9]/90 border border-[#e4d6c4] shadow-[0_4px_16px_rgba(100,50,40,0.06)]">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause music" : "Play music"}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#cf493e] text-white shadow-md hover:bg-[#b83b31] transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40"
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
              {CONFIG.song.title}
            </span>
          </div>
          <span className="font-handwriting text-sm text-[#7e6d5e]">
            {hasError
              ? "Audio playback issue — check console"
              : playing
              ? "Now Playing ~ sweet melody"
              : "Click play to listen"}
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
          aria-label={isMuted ? "Unmute" : "Mute"}
          className="text-[#7e6d5e] hover:text-[#3d332a] p-1 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-red-500" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>
      </div>

      <audio
        ref={audioRef}
        src={CONFIG.song.src}
        loop
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={(e) => {
          console.error("Audio error:", e);
          setHasError(true);
          setPlaying(false);
        }}
      />
    </div>
  );
}

// Single Polaroid Item with Image Upload & Lightbox
interface PolaroidProps {
  id: number;
  initialCaption: string;
  initialSrc: string;
  rotationClass: string;
  onOpenLightbox: (src: string, caption: string) => void;
}

function PolaroidCard({
  id,
  initialCaption,
  initialSrc,
  rotationClass,
  onOpenLightbox,
}: PolaroidProps) {
  const [src, setSrc] = useState(initialSrc);
  const [caption, setCaption] = useState(initialCaption);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved photos from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem(`polaroid_photo_${id}`);
    if (saved) {
      setSrc(saved);
    }
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSrc(result);
        try {
          localStorage.setItem(`polaroid_photo_${id}`, result);
        } catch {
          // localStorage quota fallback
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSrc("");
    localStorage.removeItem(`polaroid_photo_${id}`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      className={`polaroid-card p-3 sm:p-3.5 pb-4 sm:pb-5 rounded-[3px] cursor-pointer group flex flex-col justify-between ${rotationClass}`}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Photo Container */}
      <div
        className="relative aspect-[4/3.8] w-full rounded-[2px] overflow-hidden bg-[#e8ebeb] border border-[#d8dcdd] flex flex-col items-center justify-center transition-all group-hover:border-[#c5cbcc]"
        onClick={() => {
          if (src) {
            onOpenLightbox(src, caption);
          } else {
            fileInputRef.current?.click();
          }
        }}
      >
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={caption}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay actions on hover */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox(src, caption);
                }}
                className="p-2 rounded-full bg-white/90 text-neutral-800 hover:bg-white shadow-sm transition-transform hover:scale-110"
                title="Zoom view"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="p-2 rounded-full bg-white/90 text-neutral-800 hover:bg-white shadow-sm transition-transform hover:scale-110"
                title="Change photo"
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-2 rounded-full bg-white/90 text-red-600 hover:bg-white shadow-sm transition-transform hover:scale-110"
                title="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          /* Empty / Upload Placeholder matching screenshot */
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-500 mb-2 transition-transform group-hover:scale-110">
              <ImageIcon className="h-6 w-6 text-neutral-400" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-neutral-600">
              Add Photo
            </span>
            <span className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
              Click to upload
            </span>
          </div>
        )}
      </div>

      {/* Caption Section */}
      <div className="mt-3 text-center flex flex-col items-center">
        {isEditingCaption ? (
          <input
            type="text"
            value={caption}
            autoFocus
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => setIsEditingCaption(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setIsEditingCaption(false);
            }}
            className="w-full text-center font-handwriting text-xl sm:text-2xl text-[#2d2822] bg-transparent border-b border-[#cf493e] focus:outline-none"
          />
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingCaption(true);
            }}
            className="inline-flex flex-col items-center group/cap cursor-text"
            title="Click to edit caption"
          >
            <span className="font-handwriting text-xl sm:text-2xl text-[#2d2822] tracking-wide">
              {caption}
            </span>
            <div className="w-12 border-b border-dashed border-[#b8ab9a] mt-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function LovePage() {
  const [revealed, setRevealed] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ src: string; caption: string } | null>(
    null
  );

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(t);
  }, []);

  // Rotations for 6 polaroid cards (3 in a row)
  const rotations = [
    "-rotate-[1.5deg]",
    "rotate-[1.8deg]",
    "-rotate-[1.0deg]",
    "rotate-[1.5deg]",
    "-rotate-[2.0deg]",
    "rotate-[0.8deg]",
  ];

  return (
    <main className="relative min-h-screen py-8 sm:py-14 px-3 sm:px-6 flex flex-col items-center justify-start overflow-x-hidden">
      <FloatingHearts />

      {/* Lightbox Modal */}
      {lightboxData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-up"
          onClick={() => setLightboxData(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-white p-4 pb-6 rounded-lg shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxData(null)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-[#cf493e] text-white flex items-center justify-center shadow-lg hover:bg-[#b83b31]"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxData.src}
              alt={lightboxData.caption}
              className="max-h-[65vh] w-auto object-contain rounded"
            />
            <p className="mt-4 font-handwriting text-2xl sm:text-3xl text-neutral-800">
              {lightboxData.caption}
            </p>
          </div>
        </div>
      )}

      {/* Main Scrapbook Paper */}
      <div
        className={`relative z-10 w-full max-w-4xl scrapbook-paper rounded-sm p-6 sm:p-10 md:p-14 transition-all duration-1000 ${
          revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Washi Tape - Top Center (Green) */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-7 sm:h-8 washi-tape-green -rotate-1 z-20 pointer-events-none" />

        {/* Washi Tape - Top Right Corner (Mauve / Burgundy) */}
        <div className="absolute -top-3 -right-3 w-28 sm:w-32 h-7 sm:h-8 washi-tape-mauve rotate-[38deg] z-20 pointer-events-none" />

        {/* Header: MEMORIES Stamp (Top Left) */}
        <div className="flex items-start justify-between">
          <div className="inline-block -rotate-6 px-3 py-1.5 stamp-memories">
            <span className="font-typewriter text-xs sm:text-sm font-bold tracking-[0.25em] block">
              {CONFIG.stamp}
            </span>
            <div className="w-full border-b border-dashed border-[#cf493e]/60 mt-0.5" />
          </div>
        </div>

        {/* Divider with Dried Pressed Rose Sticker */}
        <div className="relative my-8 sm:my-10">
          <div className="w-full border-b border-dashed border-[#cbbeaa]" />

          {/* Pressed Rose Sticker */}
          <div className="absolute -top-10 sm:-top-12 right-6 sm:right-16 z-20 pointer-events-auto group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/rose-sticker.jpg"
              alt="Vintage dried pressed rose sticker"
              className="w-16 sm:w-20 md:w-24 object-contain mix-blend-multiply drop-shadow-[0_4px_8px_rgba(80,30,30,0.18)] -rotate-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-0"
            />
          </div>
        </div>

        {/* Curated By & Badge Header */}
        <div className="mb-8">
          <div className="inline-block">
            <h1 className="font-handwriting text-3xl sm:text-4xl text-[#36322d] tracking-wide">
              {CONFIG.curatedBy}
            </h1>
            <div className="w-full border-b border-dotted border-[#b3a492] mt-1" />
          </div>

          <div className="mt-3.5 inline-block">
            <span className="font-typewriter text-[11px] sm:text-xs font-bold tracking-widest px-2.5 py-1 highlighter-badge text-[#2c475d] rounded-[2px] block">
              {CONFIG.volume}
            </span>
            <div className="w-full border-b border-dotted border-[#9ecceb] mt-1" />
          </div>
        </div>

        {/* 6 Pictures (3 Pictures in a Row) */}
        <div className="my-8 sm:my-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
            {CONFIG.defaultPolaroids.map((item, index) => (
              <PolaroidCard
                key={item.id}
                id={item.id}
                initialCaption={item.caption}
                initialSrc={item.src}
                rotationClass={rotations[index % rotations.length]}
                onOpenLightbox={(src, caption) =>
                  setLightboxData({ src, caption })
                }
              />
            ))}
          </div>
        </div>

        {/* Romantic Letter / Scrapbook Message */}
        <div className="my-10 p-6 sm:p-8 rounded-lg bg-[#fffefb]/80 border border-dashed border-[#d8c8b4] shadow-sm relative">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 fill-[#cf493e] text-[#cf493e]" />
            <h2 className="font-handwriting text-2xl sm:text-3xl text-[#36322d]">
              {CONFIG.heading}, {CONFIG.name}
            </h2>
          </div>
          <p className="font-handwriting text-lg sm:text-xl leading-relaxed text-[#4a423a] whitespace-pre-line">
            {CONFIG.message}
          </p>
          <div className="mt-4 text-right">
            <span className="font-handwriting text-xl sm:text-2xl text-[#cf493e]">
              — with all my love, {CONFIG.from}
            </span>
          </div>
        </div>

        {/* Music Player */}
        <div className="mt-8">
          <ScrapbookMusicPlayer />
        </div>
      </div>
    </main>
  );
}
