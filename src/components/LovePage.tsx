"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createLovePage, uploadImage } from "@/src/lib/supabase";
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
  Edit3,
  RotateCcw,
  Check,
  Save,
  User,
  MessageSquare,
  Tag,
  SlidersHorizontal,
  ArrowLeft,
  Share2,
  Loader2,
  Wand2,
  Search,
  Palette,
  Scissors,
  Mail,
} from "lucide-react";
import AiLetterModal from "@/src/components/AiLetterModal";
import ShareModal from "@/src/components/ShareModal";
import SongSearchPicker from "@/src/components/SongSearchPicker";
import AudioTrimmerModal from "@/src/components/AudioTrimmerModal";
import { BACKGROUND_VIBES, BackgroundVibeId, getBackgroundVibe } from "@/src/lib/vibes";
import { useAuth } from "@/src/context/AuthContext";

/**
 * ===============================================================
 * 🎨 DEFAULT LOVE PAGE CONFIGURATION
 * ===============================================================
 * You can also edit these values live using the "Personalize" sidebar button on the page!
 */
const DEFAULT_CONFIG = {
  // Names
  recipientName: "Lina",
  senderName: "Miguel",

  // Scrapbook Header & Badges
  curatedBy: "Curated by Vath",
  stampText: "MEMORIES",
  badgeText: "VOL. 01 / ORIGINAL",

  // Background Vibe Atmosphere (Vol 1 exclusive)
  themeVibe: "vintage-rose" as BackgroundVibeId,

  // Main Love Letter / Note Topic & Message
  topic: "To the love of my life",
  message: `Every day with you feels like a gift I didn't know I needed.
Thank you for your laugh, your patience, and the way you make
ordinary moments feel extraordinary. I love you more than words
can say.`,

  // Song Details (place your audio file inside /public/music/ or upload full MP3)
  song: {
    src: "/music/miguel-sure-thing.mp3",
    title: "Miguel - Sure Thing",
    startTime: undefined as number | undefined,
    endTime: undefined as number | undefined,
  },

  // 6 Polaroid Photos (3 in a row)
  polaroids: [
    { id: 1, caption: "Us", src: "" },
    { id: 2, caption: "First Date", src: "" },
    { id: 3, caption: "Sweet Moments", src: "" },
    { id: 4, caption: "Adventures", src: "" },
    { id: 5, caption: "Laughs & Coffee", src: "" },
    { id: 6, caption: "Forever & Always", src: "" },
  ],

  // Creation Name & Copyright (Displayed at the bottom of the page — code only)
  creationName: "Love Scrapbook Memory Book",
  creator: "Vath",
  copyright: `© ${new Date().getFullYear()} Vath. All rights reserved.`,
};

// Subtle floating background hearts
function FloatingHearts({ heartColor }: { heartColor?: string }) {
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
          className={`floating-heart animate-float transition-colors duration-700 ${
            heartColor || "fill-[#e29578]/25 text-[#e29578]/40"
          }`}
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

// Retro Scrapbook Music Player with Trimmer (Best Part) Support
function ScrapbookMusicPlayer({
  song,
}: {
  song: { src: string; title: string; startTime?: number; endTime?: number };
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reload audio when source or trim points change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setPlaying(false);
      setHasError(false);
      setProgress(0);
    }
  }, [song.src, song.startTime, song.endTime]);

  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      try {
        setHasError(false);
        const start = song.startTime || 0;
        const current = audioRef.current.currentTime;
        if (current < start || (song.endTime && current >= song.endTime)) {
          audioRef.current.currentTime = start;
        }
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
    const current = audioRef.current.currentTime;
    const start = song.startTime || 0;
    const end = song.endTime && song.endTime > start ? song.endTime : audioRef.current.duration;

    // Loop within trimmed snippet
    if (song.endTime && current >= song.endTime) {
      audioRef.current.currentTime = start;
      return;
    }

    const segDur = end - start;
    if (segDur > 0) {
      const p = Math.max(0, Math.min(100, ((current - start) / segDur) * 100));
      setProgress(p);
    }
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <Music className="h-3.5 w-3.5 text-[#cf493e]" />
            <span className="font-typewriter text-xs font-bold uppercase tracking-wider text-[#3d332a]">
              {song.title}
            </span>
            {(song.startTime !== undefined || song.endTime !== undefined) && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#cf493e]/10 text-[#cf493e] border border-[#cf493e]/20">
                ✂️ Best Part
              </span>
            )}
          </div>
          <span className="font-handwriting text-sm text-[#7e6d5e]">
            {hasError
              ? "Audio format or file error — check console"
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
        src={song.src}
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
  onFileSelected?: (id: number, file: File) => void;
  onChange?: (id: number, updates: { src?: string; caption?: string }) => void;
}

function PolaroidCard({
  id,
  initialCaption,
  initialSrc,
  rotationClass,
  onOpenLightbox,
  onFileSelected,
  onChange,
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
      onChange?.(id, { src: saved });
    } else if (initialSrc) {
      setSrc(initialSrc);
    }
  }, [id, initialSrc]);

  useEffect(() => {
    setCaption(initialCaption);
  }, [initialCaption]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSrc(result);
        onChange?.(id, { src: result });
        try {
          localStorage.setItem(`polaroid_photo_${id}`, result);
        } catch {
          // localStorage quota fallback
        }
      };
      reader.readAsDataURL(file);
      // Notify parent so it can upload to Supabase on save
      onFileSelected?.(id, file);
    }
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSrc("");
    onChange?.(id, { src: "" });
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
            {/* Overlay actions on hover & mobile accessible buttons */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 sm:opacity-0 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLightbox(src, caption);
                }}
                className="p-2 sm:p-2 rounded-full bg-white/95 text-neutral-800 hover:bg-white shadow-md transition-transform hover:scale-110 active:scale-90"
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
                className="p-2 sm:p-2 rounded-full bg-white/95 text-neutral-800 hover:bg-white shadow-md transition-transform hover:scale-110 active:scale-90"
                title="Change photo"
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-2 sm:p-2 rounded-full bg-white/95 text-red-600 hover:bg-white shadow-md transition-transform hover:scale-110 active:scale-90"
                title="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Corner Quick Actions (Visible on touch devices) */}
            <div className="sm:hidden absolute bottom-1.5 right-1.5 flex items-center gap-1 z-10 bg-black/50 backdrop-blur-xs p-1 rounded-full text-white shadow-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="p-1 rounded-full hover:bg-white/20 active:scale-90"
                title="Change photo"
              >
                <Upload className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-1 rounded-full hover:bg-white/20 active:scale-90 text-rose-300"
                title="Remove"
              >
                <X className="h-3 w-3" />
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
            onChange={(e) => {
              setCaption(e.target.value);
              onChange?.(id, { caption: e.target.value });
            }}
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

// Interactive Customization Sidebar
interface EditSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: typeof DEFAULT_CONFIG;
  onChange: (updated: typeof DEFAULT_CONFIG) => void;
  onReset: () => void;
  onOpenAiModal: () => void;
}

function EditSidebar({
  isOpen,
  onClose,
  config,
  onChange,
  onReset,
  onOpenAiModal,
}: EditSidebarProps) {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSongPickerOpen, setIsSongPickerOpen] = useState(false);
  const [isTrimmerOpen, setIsTrimmerOpen] = useState(false);

  const handleFieldChange = (key: keyof typeof DEFAULT_CONFIG, value: unknown) => {
    onChange({
      ...config,
      [key]: value,
    });
  };

  const handleSongChange = (field: "title" | "src", value: string) => {
    onChange({
      ...config,
      song: {
        ...config.song,
        [field]: value,
      },
    });
  };

  const handleSave = () => {
    try {
      localStorage.setItem("custom_love_page_config", JSON.stringify(config));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (e) {
      console.error("Failed to save config:", e);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#faf7ef] border-l border-[#dfd4c5] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#dfd4c5] bg-[#f4eee1]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-[#cf493e]" />
            <h2 className="font-typewriter text-sm font-bold tracking-wider text-[#3d332a] uppercase">
              Customize Page
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#e8decb] text-[#5e5145] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-[#3d332a]">
          {/* Section: Background Vibe */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#dfd4c5] pb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#cf493e]">
                <Palette className="h-3.5 w-3.5" />
                <span>Background Vibe</span>
              </div>
              <span className="font-typewriter text-[10px] text-[#a99a8a] tracking-wider uppercase">
                Vol. 1 Mood
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {BACKGROUND_VIBES.map((vibe) => {
                const isSelected = (config.themeVibe || "vintage-rose") === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => handleFieldChange("themeVibe", vibe.id)}
                    className={`group relative p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? "border-[#cf493e] bg-white ring-2 ring-[#cf493e]/30 shadow-md"
                        : "border-[#d8ccb9] bg-white/60 hover:bg-white hover:border-[#bfae99] hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {/* Swatch circle with gradient preview */}
                      <div
                        className="h-6 w-6 rounded-full border border-black/10 shadow-xs flex items-center justify-center text-xs transition-transform group-hover:scale-105"
                        style={{ background: vibe.previewBg }}
                      >
                        <span className="text-[11px]">{vibe.emoji}</span>
                      </div>
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#cf493e] text-white">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-typewriter text-[11px] font-bold text-[#3d332a] uppercase tracking-wide leading-tight">
                        {vibe.name}
                      </p>
                      <p className="font-handwriting text-xs text-[#7e6d5e] leading-none mt-1">
                        {vibe.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Scrapbook Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#cf493e] border-b border-[#dfd4c5] pb-1">
              <Tag className="h-3.5 w-3.5" />
              <span>Scrapbook Headers</span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#6e5e50]">
                Curated By Header
              </label>
              <input
                type="text"
                value={config.curatedBy}
                onChange={(e) => handleFieldChange("curatedBy", e.target.value)}
                placeholder="e.g. Curated by Vath"
                className="w-full px-3 py-2 rounded border border-[#d8ccb9] bg-white focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 font-handwriting text-xl text-[#3d332a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#6e5e50]">
                Stamp Text
              </label>
              <input
                type="text"
                value={config.stampText}
                onChange={(e) =>
                  handleFieldChange("stampText", e.target.value)
                }
                placeholder="e.g. MEMORIES"
                className="w-full px-3 py-1.5 rounded border border-[#d8ccb9] bg-white focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 font-typewriter text-xs uppercase"
              />
            </div>
          </div>

          {/* Section: Names */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#cf493e] border-b border-[#dfd4c5] pb-1">
              <User className="h-3.5 w-3.5" />
              <span>Names</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[#6e5e50]">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={config.recipientName}
                  onChange={(e) =>
                    handleFieldChange("recipientName", e.target.value)
                  }
                  placeholder="e.g. Lina"
                  className="w-full px-3 py-1.5 rounded border border-[#d8ccb9] bg-white focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[#6e5e50]">
                  Sender Name
                </label>
                <input
                  type="text"
                  value={config.senderName}
                  onChange={(e) =>
                    handleFieldChange("senderName", e.target.value)
                  }
                  placeholder="e.g. Miguel"
                  className="w-full px-3 py-1.5 rounded border border-[#d8ccb9] bg-white focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section: Topic & Love Message */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#cf493e] border-b border-[#dfd4c5] pb-1">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Letter Topic & Message</span>
              </div>
              <button
                type="button"
                onClick={onOpenAiModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-[#a85a08] border border-amber-300/60 font-semibold text-[11px] normal-case transition-all"
              >
                <Wand2 className="h-3 w-3 text-amber-600" />
                <span>AI Writer</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#6e5e50]">
                Letter Heading / Topic
              </label>
              <input
                type="text"
                value={config.topic}
                onChange={(e) => handleFieldChange("topic", e.target.value)}
                placeholder="e.g. To the love of my life"
                className="w-full px-3 py-2 rounded border border-[#d8ccb9] bg-white focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 font-handwriting text-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#6e5e50]">
                Personal Love Message
              </label>
              <textarea
                rows={5}
                value={config.message}
                onChange={(e) => handleFieldChange("message", e.target.value)}
                placeholder="Write your heartfelt message here..."
                className="w-full px-3 py-2 rounded border border-[#d8ccb9] bg-white focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 font-handwriting text-lg leading-relaxed resize-y"
              />
            </div>
          </div>

          {/* Section: Music */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#dfd4c5] pb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#cf493e]">
                <Music className="h-3.5 w-3.5" />
                <span>Background Song</span>
              </div>
              <span className="font-typewriter text-[10px] text-[#a99a8a] tracking-wider uppercase">
                Full Song &amp; Trim
              </span>
            </div>

            {/* Current song display */}
            <div className="p-3 rounded-xl border border-[#d8ccb9] bg-white/90 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#cf493e]/10 border border-[#cf493e]/20 text-[#cf493e]">
                  <Music className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-typewriter text-xs font-bold text-[#3d332a] truncate uppercase tracking-wide">
                    {config.song.title || "No song selected"}
                  </p>
                  <p className="text-[11px] text-[#7e6d5e] truncate font-mono">
                    {config.song.startTime !== undefined || config.song.endTime !== undefined ? (
                      <span className="text-[#cf493e] font-semibold">
                        ✂️ Trimmed: {Math.floor((config.song.startTime || 0) / 60)}:{Math.floor((config.song.startTime || 0) % 60).toString().padStart(2, "0")} → {config.song.endTime ? `${Math.floor(config.song.endTime / 60)}:${Math.floor(config.song.endTime % 60).toString().padStart(2, "0")}` : "End"}
                      </span>
                    ) : (
                      "Full Song Active"
                    )}
                  </p>
                </div>
              </div>

              {/* Action buttons: Choose Song & Cut Best Part */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSongPickerOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#cf493e] to-[#e05a4f] text-white text-[11px] font-bold tracking-wider uppercase shadow-xs hover:shadow-md hover:from-[#b83b31] hover:to-[#cf493e] transition-all transform active:scale-95"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Choose Song</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsTrimmerOpen(true)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#d8ccb9] hover:border-[#cf493e] text-[#3d332a] hover:text-[#cf493e] text-[11px] font-bold tracking-wider uppercase shadow-2xs hover:shadow-xs transition-all transform active:scale-95"
                  title="Cut and trim out the best chorus of this song"
                >
                  <Scissors className="h-3.5 w-3.5 text-[#cf493e]" />
                  <span>Cut Best Part</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-center text-[#a99a8a] font-handwriting">
              Upload full MP3s, search artists, or trim to the iconic chorus!
            </p>
          </div>

          {/* Song Search & Audio Studio Picker Modal */}
          <SongSearchPicker
            isOpen={isSongPickerOpen}
            onClose={() => setIsSongPickerOpen(false)}
            onSelect={(track) => {
              onChange({
                ...config,
                song: {
                  ...config.song,
                  src: track.src,
                  title: track.title,
                  // Reset trim points on new song
                  startTime: undefined,
                  endTime: undefined,
                },
              });
            }}
            currentSongSrc={config.song.src}
            onOpenTrimmer={() => setIsTrimmerOpen(true)}
          />

          {/* Audio Trimmer Modal */}
          <AudioTrimmerModal
            isOpen={isTrimmerOpen}
            onClose={() => setIsTrimmerOpen(false)}
            song={config.song}
            onSaveTrim={(startTime, endTime) => {
              onChange({
                ...config,
                song: {
                  ...config.song,
                  startTime,
                  endTime,
                },
              });
            }}
          />
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 pb-safe border-t border-[#dfd4c5] bg-[#f4eee1] flex items-center justify-between gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold text-[#6e5e50] hover:bg-[#e8decb] transition-colors"
            title="Reset to default settings"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-[#cf493e] text-white text-xs font-bold tracking-wider uppercase hover:bg-[#b83b31] transition-all transform active:scale-98 shadow-md"
          >
            {savedSuccess ? (
              <>
                <Check className="h-4 w-4" />
                <span>Saved to Browser!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

function LovePageContent() {
  const { user, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const [revealed, setRevealed] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string>("");
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  // Keep track of polaroid images (File objects) set by PolaroidCard callbacks
  const polaroidFiles = useRef<Map<number, File>>(new Map());
  const [lightboxData, setLightboxData] = useState<{
    src: string;
    caption: string;
  } | null>(null);

  // Load user customized config from URL params or localStorage
  useEffect(() => {
    // 1. Check URL search parameters first
    const paramTo = searchParams.get("to");
    const paramFrom = searchParams.get("from");
    const paramTopic = searchParams.get("topic");
    const paramMessage = searchParams.get("message") || searchParams.get("msg");
    const paramSongTitle = searchParams.get("songTitle");
    const paramSongSrc = searchParams.get("songSrc");
    const paramCuratedBy = searchParams.get("curatedBy");
    const paramStamp = searchParams.get("stamp");
    const paramVibe = searchParams.get("vibe") || searchParams.get("theme");
    const paramStartTime = searchParams.get("startTime") ? parseFloat(searchParams.get("startTime")!) : undefined;
    const paramEndTime = searchParams.get("endTime") ? parseFloat(searchParams.get("endTime")!) : undefined;

    const hasUrlParams = Boolean(
      paramTo || paramFrom || paramTopic || paramMessage || paramSongTitle || paramSongSrc || paramCuratedBy || paramStamp || paramVibe || paramStartTime !== undefined || paramEndTime !== undefined
    );

    if (hasUrlParams) {
      setConfig((prev) => ({
        ...prev,
        ...(paramTo && { recipientName: paramTo }),
        ...(paramFrom && { senderName: paramFrom }),
        ...(paramTopic && { topic: paramTopic }),
        ...(paramMessage && { message: paramMessage }),
        ...(paramCuratedBy && { curatedBy: paramCuratedBy }),
        ...(paramStamp && { stampText: paramStamp }),
        ...(paramVibe && { themeVibe: paramVibe as BackgroundVibeId }),
        ...(paramSongTitle || paramSongSrc || paramStartTime !== undefined || paramEndTime !== undefined
          ? {
              song: {
                title: paramSongTitle || prev.song.title,
                src: paramSongSrc || prev.song.src,
                startTime: paramStartTime !== undefined ? paramStartTime : prev.song.startTime,
                endTime: paramEndTime !== undefined ? paramEndTime : prev.song.endTime,
              },
            }
          : {}),
      }));
    } else {
      // 2. Fall back to localStorage if no URL params
      const saved = localStorage.getItem("custom_love_page_config");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setConfig((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to parse saved config:", e);
        }
      }
    }

    const t = setTimeout(() => setRevealed(true), 150);
    return () => clearTimeout(t);
  }, [searchParams]);

  const handleResetConfig = () => {
    localStorage.removeItem("custom_love_page_config");
    setConfig(DEFAULT_CONFIG);
  };

  const activeVibe = getBackgroundVibe(config.themeVibe);

  const cycleVibe = () => {
    const currentIndex = BACKGROUND_VIBES.findIndex((v) => v.id === activeVibe.id);
    const nextVibe = BACKGROUND_VIBES[(currentIndex + 1) % BACKGROUND_VIBES.length];
    setConfig((prev) => ({ ...prev, themeVibe: nextVibe.id }));
  };

  const executeSaveAndShare = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      // 1. Upload any polaroid images that are File objects or base64 strings
      const updatedPolaroids = await Promise.all(
        config.polaroids.map(async (p) => {
          let file = polaroidFiles.current.get(p.id);
          
          if (!file && p.src && p.src.startsWith("data:image")) {
            try {
              const res = await fetch(p.src);
              const blob = await res.blob();
              file = new File([blob], `polaroid-${p.id}.png`, { type: blob.type });
            } catch (e) {
              console.error("Failed to convert base64 to file", e);
            }
          }

          if (file) {
            const url = await uploadImage(file);
            return { ...p, src: url };
          }
          // Keep existing src (already a URL or empty)
          return p;
        })
      );

      // 2. Build the serialised page config to store
      const pageData = {
        title: config.topic || `For ${config.recipientName}`,
        message: JSON.stringify({
          ...config,
          polaroids: updatedPolaroids,
        }),
        image_url: updatedPolaroids.find((p) => p.src)?.src ?? null,
      };

      // 3. Save to Supabase
      const page = await createLovePage(pageData);

      // 4. Open Share Modal & copy link
      setSavedSlug(page.slug);
      setIsShareModalOpen(true);
      const origin =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const shareUrl = `${origin}/p/${page.slug}`;
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      console.error("Save & Share failed:", err);
      setSaveError("Failed to save. Please try again.");
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndShare = () => {
    if (!user) {
      openAuthModal({
        title: "Sign In to Share",
        subtitle: "Log in or create a quick free account to save your memories and get your shareable link.",
        onSuccess: () => {
          executeSaveAndShare();
        },
      });
      return;
    }
    executeSaveAndShare();
  };

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
    <main
      className={`relative min-h-screen py-8 sm:py-14 px-3 sm:px-6 flex flex-col items-center justify-start overflow-x-hidden transition-colors duration-700 ease-in-out ${activeVibe.mainClass}`}
    >
      {/* Ambient Vibe Glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
        style={{ background: activeVibe.ambientGlow }}
      />

      <FloatingHearts heartColor={activeVibe.heartColor} />

      {/* Floating Top Bar (Back to Home, Vibe Switcher, Share, Edit) */}
      <div className="fixed top-2.5 sm:top-5 inset-x-2.5 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: Back to Home Link */}
        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/95 text-[#5e4b3e] shadow-md border border-[#e4d6c4] hover:bg-white hover:text-[#cf493e] hover:shadow-lg transition-all text-xs sm:text-sm font-medium backdrop-blur-sm group active:scale-95 shrink-0"
          title="Back to Landing Page"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:-translate-x-0.5 text-[#cf493e] shrink-0" />
          <span className="hidden xs:inline">Back</span>
          <span className="hidden sm:inline"> to Home</span>
        </Link>

        {/* Right: Quick Vibe Switcher, Share Link & Edit Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Quick Vibe Switcher Button */}
          <button
            onClick={cycleVibe}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/95 text-[#3d332a] shadow-md border border-[#e4d6c4] hover:bg-white hover:text-[#cf493e] hover:shadow-lg transition-all text-xs sm:text-sm font-medium backdrop-blur-sm active:scale-95 group shrink-0"
            title={`Current Vibe: ${activeVibe.name} (${activeVibe.tagline}) — Click to switch vibe`}
          >
            <span className="text-sm transition-transform group-hover:scale-125">{activeVibe.emoji}</span>
            <span className="hidden md:inline text-[11px] font-handwriting text-[#7e6d5e]">Vibe:</span>
            <span className="hidden sm:inline font-typewriter text-xs font-semibold">{activeVibe.name}</span>
          </button>

          {/* Save to Cloud & Copy Share Link Button */}
          <button
            onClick={handleSaveAndShare}
            disabled={isSaving}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/95 text-[#3d332a] shadow-md border border-[#e4d6c4] hover:bg-white hover:border-[#cf493e]/40 hover:shadow-lg transition-all text-xs sm:text-sm font-medium backdrop-blur-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            title="Save to cloud and copy shareable link"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#cf493e] animate-spin shrink-0" />
                <span className="hidden sm:inline text-[#cf493e]">Saving…</span>
              </>
            ) : copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
                <span className="text-emerald-700 font-semibold hidden xs:inline">Copied!</span>
              </>
            ) : saveError ? (
              <>
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 shrink-0" />
                <span className="text-red-600 font-semibold hidden sm:inline">{saveError}</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#cf493e] shrink-0" />
                <span className="hidden sm:inline">Save &amp; Share</span>
                <span className="sm:hidden font-semibold text-[11px]">Share</span>
              </>
            )}
          </button>

          {/* Edit Page Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#cf493e] text-white shadow-md hover:bg-[#b83b31] hover:shadow-lg transition-all text-xs sm:text-sm font-semibold tracking-wide active:scale-95 shrink-0"
            title="Customize page text and options"
          >
            <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white shrink-0" />
            <span className="hidden sm:inline">Edit Page</span>
            <span className="sm:hidden text-[11px]">Edit</span>
          </button>
        </div>
      </div>

      {/* Customization Sidebar Component */}
      <EditSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        config={config}
        onChange={setConfig}
        onReset={handleResetConfig}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

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
        className={`relative z-10 w-full max-w-4xl scrapbook-paper rounded-sm p-4 xs:p-6 sm:p-10 md:p-14 mt-12 sm:mt-14 transition-all duration-1000 overflow-hidden ${
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
              {config.stampText}
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
              {config.curatedBy}
            </h1>
            <div className="w-full border-b border-dotted border-[#b3a492] mt-1" />
          </div>

          <div className="mt-3.5 inline-block">
            <span className="font-typewriter text-[11px] sm:text-xs font-bold tracking-widest px-2.5 py-1 highlighter-badge text-[#2c475d] rounded-[2px] block">
              {DEFAULT_CONFIG.badgeText}
            </span>
            <div className="w-full border-b border-dotted border-[#9ecceb] mt-1" />
          </div>
        </div>

        {/* 6 Pictures (3 Pictures in a Row) */}
        <div className="my-8 sm:my-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
            {config.polaroids.map((item, index) => (
              <PolaroidCard
                key={item.id}
                id={item.id}
                initialCaption={item.caption}
                initialSrc={item.src}
                rotationClass={rotations[index % rotations.length]}
                onOpenLightbox={(src, caption) =>
                  setLightboxData({ src, caption })
                }
                onFileSelected={(id, file) => {
                  polaroidFiles.current.set(id, file);
                }}
                onChange={(id, updates) => {
                  setConfig((prev) => ({
                    ...prev,
                    polaroids: prev.polaroids.map((p) =>
                      p.id === id ? { ...p, ...updates } : p
                    ),
                  }));
                }}
              />
            ))}
          </div>
        </div>

        {/* Romantic Letter / Scrapbook Message */}
        <div className="my-10 p-6 sm:p-8 rounded-lg bg-[#fffefb]/80 border border-dashed border-[#d8c8b4] shadow-sm relative">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="h-5 w-5 fill-[#cf493e] text-[#cf493e]" />
            <h2 className="font-handwriting text-2xl sm:text-3xl text-[#36322d]">
              {config.topic}, {config.recipientName}
            </h2>
          </div>
          <p className="font-handwriting text-lg sm:text-xl leading-relaxed text-[#4a423a] whitespace-pre-line">
            {config.message}
          </p>
          <div className="mt-4 text-right">
            <span className="font-handwriting text-xl sm:text-2xl text-[#cf493e]">
              — with all my love, {config.senderName}
            </span>
          </div>
        </div>

        {/* Music Player */}
        <div className="mt-8">
          <ScrapbookMusicPlayer song={config.song} />
        </div>
      </div>

      {/* Footer / Copyright at bottom of the page (Code-only, not editable in sidebar) */}
      <footer className="relative z-10 mt-10 mb-4 flex flex-col items-center justify-center gap-1.5 text-center">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-typewriter text-[#7c564c]">
          <span>{DEFAULT_CONFIG.creationName}</span>
          <span>•</span>
          <span>Created by {DEFAULT_CONFIG.creator}</span>
        </div>
        <p className="text-[11px] sm:text-xs font-typewriter text-[#9b7267]">
          {DEFAULT_CONFIG.copyright}
        </p>
      </footer>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        slug={savedSlug}
        title={config.topic || `For ${config.recipientName}`}
        theme="light"
      />

      {/* AI Romantic Writer Modal */}
      <AiLetterModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        defaultRecipient={config.recipientName}
        defaultSender={config.senderName}
        onInsert={(text, title) => {
          setConfig((prev) => ({
            ...prev,
            ...(title && { topic: title }),
            message: text,
          }));
        }}
      />
    </main>
  );
}

export default function LovePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f3d5cf] text-[#6e4e42] font-handwriting text-2xl">
          Loading sweet memories... 💖
        </div>
      }
    >
      <LovePageContent />
    </Suspense>
  );
}
