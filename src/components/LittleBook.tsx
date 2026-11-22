"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  RotateCcw,
  Share2,
  X,
  Upload,
  Layers,
  ArrowLeft,
  Info,
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  Loader2,
} from "lucide-react";
import { createLovePage, uploadImage } from "@/src/lib/supabase";
import ShareModal from "@/src/components/ShareModal";
import SongSearchPicker from "@/src/components/SongSearchPicker";
import AudioTrimmerModal from "@/src/components/AudioTrimmerModal";
import { useAuth } from "@/src/context/AuthContext";

// ─────────────────────────────────────────────────────────────
// COLOR TOKENS & STYLES
// ─────────────────────────────────────────────────────────────
export type WashiPattern =
  | "mustard-dotted"
  | "teal-stripes"
  | "navy-checks"
  | "cherry-gingham"
  | "sage-dashes"
  | "sky-scallops";

// ─────────────────────────────────────────────────────────────
// WASHI TAPE COMPONENT WITH ZIGZAG CUT EDGES & PATTERNS
// ─────────────────────────────────────────────────────────────
export function WashiTape({
  pattern = "teal-stripes",
  className = "",
  style = {},
}: {
  pattern?: WashiPattern;
  className?: string;
  style?: React.CSSProperties;
}) {
  const getPatternBg = () => {
    switch (pattern) {
      case "mustard-dotted":
        return {
          backgroundColor: "rgba(232, 166, 40, 0.85)",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1.5px, transparent 1.5px)",
          backgroundSize: "8px 8px",
        };
      case "teal-stripes":
        return {
          backgroundColor: "rgba(31, 122, 118, 0.85)",
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.22), rgba(255,255,255,0.22) 4px, transparent 4px, transparent 8px)",
        };
      case "navy-checks":
        return {
          backgroundColor: "rgba(38, 56, 107, 0.88)",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        };
      case "cherry-gingham":
        return {
          backgroundColor: "rgba(199, 47, 87, 0.85)",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.18), rgba(255,255,255,0.18) 5px, transparent 5px, transparent 10px), repeating-linear-gradient(90deg, rgba(255,255,255,0.18), rgba(255,255,255,0.18) 5px, transparent 5px, transparent 10px)",
        };
      case "sage-dashes":
        return {
          backgroundColor: "rgba(163, 182, 141, 0.85)",
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0, rgba(255,255,255,0.3) 6px, transparent 6px, transparent 12px)",
        };
      case "sky-scallops":
        return {
          backgroundColor: "rgba(142, 197, 230, 0.85)",
          backgroundImage:
            "radial-gradient(circle at 50% 0, rgba(255,255,255,0.35) 4px, transparent 4px)",
          backgroundSize: "12px 12px",
        };
      default:
        return { backgroundColor: "rgba(31, 122, 118, 0.85)" };
    }
  };

  return (
    <div
      className={`pointer-events-none z-10 shadow-xs transition-transform ${className}`}
      style={{
        ...getPatternBg(),
        clipPath:
          "polygon(0% 4%, 2% 0%, 5% 4%, 8% 0%, 11% 4%, 14% 0%, 98% 0%, 100% 4%, 98% 8%, 100% 12%, 98% 96%, 100% 100%, 97% 96%, 94% 100%, 91% 96%, 88% 100%, 2% 100%, 0% 96%, 2% 92%, 0% 88%)",
        boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
        ...style,
      }}
    />
  );
}

function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(parts[1]);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

// ─────────────────────────────────────────────────────────────
// CLIENT-SIDE CANVAS IMAGE DOWNSCALING
// ─────────────────────────────────────────────────────────────
function compressImage(file: File, callback: (base64: string) => void) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      const MAX_DIM = 900;
      if (width > height) {
        if (width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        }
      } else {
        if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        callback(dataUrl);
      }
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

// ─────────────────────────────────────────────────────────────
// INTERACTIVE PHOTO FRAME COMPONENT
// ─────────────────────────────────────────────────────────────
export interface PhotoFrameProps {
  id: number;
  dimensions: string; // e.g., "4×6″", "3×4″", "4×4″", "3×5″", "3×2″", "2×3″"
  aspectRatioClass?: string; // e.g. "aspect-[4/6]", "aspect-[3/4]"
  className?: string;
  rotation?: string; // Tailwind rotate or inline
  photoSrc: string | null;
  onPhotoChange: (id: number, src: string | null) => void;
  onToast: (msg: string) => void;
  compact?: boolean;
}

export function PhotoFrame({
  id,
  dimensions,
  aspectRatioClass = "aspect-[4/5]",
  className = "",
  rotation = "rotate-0",
  photoSrc,
  onPhotoChange,
  onToast,
  compact = false,
}: PhotoFrameProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      onToast("Please select a valid image file!");
      return;
    }

    // 1. Instant compressed preview
    compressImage(file, (compressed) => {
      onPhotoChange(id, compressed);
      try {
        localStorage.setItem(`little_book_photo_${id}`, compressed);
      } catch {
        // Ignore quota warning since background upload will replace with short URL
      }
    });

    // 2. Immediate background upload to Supabase for permanent URL
    setIsUploading(true);
    try {
      const publicUrl = await uploadImage(file);
      if (publicUrl) {
        onPhotoChange(id, publicUrl);
        try {
          localStorage.setItem(`little_book_photo_${id}`, publicUrl);
        } catch {}
      }
    } catch (err) {
      console.warn(`Background upload failed for frame ${id}:`, err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPhotoChange(id, null);
    localStorage.removeItem(`little_book_photo_${id}`);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onToast(`Photo #${id} removed`);
  };

  return (
    <div
      className={`relative interactive-photo-frame bg-white ${
        compact
          ? "p-1.5 xs:p-2 sm:p-2.5 pb-2 xs:pb-2.5 sm:pb-3"
          : "p-2 xs:p-2.5 sm:p-3 pb-2.5 xs:pb-3 sm:pb-3.5"
      } rounded-[3px] shadow-[0_6px_18px_rgba(20,45,35,0.18)] cursor-pointer group select-none ${rotation} ${className}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Frame Container */}
      <div
        className={`relative w-full ${aspectRatioClass} rounded-[2px] overflow-hidden flex flex-col items-center justify-center border transition-colors ${
          isDragOver
            ? "border-washi-teal bg-teal-50"
            : photoSrc
            ? "border-neutral-300"
            : "border-dashed border-[#b8b3a0] photo-placeholder-stripes"
        }`}
      >
        {isUploading && (
          <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center text-white pointer-events-none">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-white" />
          </div>
        )}

        {photoSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc}
              alt={`Frame ${id}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
            />
            {/* Desktop Hover Actions */}
            <div className="hidden sm:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-1.5">
              <button
                type="button"
                className="px-2 py-1 rounded-full bg-white/95 text-neutral-800 text-[11px] font-semibold shadow hover:bg-white flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-3 w-3" />
                <span>Change</span>
              </button>
              <button
                type="button"
                className="p-1.5 rounded-full bg-white/95 text-red-600 shadow hover:bg-white"
                onClick={handleRemove}
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile Corner Touch Action */}
            <button
              type="button"
              onClick={handleRemove}
              className="sm:hidden absolute top-1 right-1 z-10 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors shadow-xs"
              title="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-1 sm:p-2">
            <Camera
              className={`${
                compact
                  ? "h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5"
                  : "h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6"
              } text-[#7d7a6e] mb-0.5 group-hover:scale-110 group-hover:text-washi-cherry transition-all shrink-0`}
            />
            <span
              className={`font-gaegu ${
                compact ? "text-[10px] xs:text-xs sm:text-sm" : "text-xs xs:text-sm"
              } font-bold text-[#4a473b] leading-tight truncate max-w-full`}
            >
              Add photo
            </span>
            <span className="font-mono text-[8px] xs:text-[9px] sm:text-[10px] text-[#8e8a7c] mt-0.5 font-medium">
              {dimensions}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RULED JOURNALING AREA COMPONENT
// ─────────────────────────────────────────────────────────────
export function RuledJournalingArea({
  id,
  initialText,
  rows = 5,
  className = "",
  placeholder = "Write your heartfelt memories here...",
}: {
  id: string;
  initialText: string;
  rows?: number;
  className?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState(initialText);

  useEffect(() => {
    const saved = localStorage.getItem(`little_book_note_${id}`);
    if (saved !== null) {
      setText(saved);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    localStorage.setItem(`little_book_note_${id}`, e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const plain = e.clipboardData.getData("text/plain");
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const nextText = text.substring(0, start) + plain + text.substring(end);
    setText(nextText);
    localStorage.setItem(`little_book_note_${id}`, nextText);
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        rows={rows}
        value={text}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder={placeholder}
        className="w-full journal-ruled-lines bg-transparent font-gaegu text-base xs:text-lg sm:text-xl text-[#2a2a35] focus:outline-none focus:ring-0 resize-none border-none p-0 overflow-hidden leading-[24px]"
        style={{ minHeight: `${rows * 24}px` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EDITABLE TEXT COMPONENT
// ─────────────────────────────────────────────────────────────
export function EditableText({
  id,
  initialText,
  className = "",
}: {
  id: string;
  initialText: string;
  className?: string;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`little_book_title_${id}`);
    if (saved !== null) {
      if (spanRef.current && spanRef.current.innerText !== saved) {
        spanRef.current.innerText = saved;
      }
    } else {
      if (spanRef.current) spanRef.current.innerText = initialText;
    }
  }, [id, initialText]);

  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const val = e.target.innerText.trim();
    localStorage.setItem(`little_book_title_${id}`, val);
  };

  return (
    <span
      ref={spanRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      className={`inline-block focus:outline-none focus:ring-2 focus:ring-washi-cherry/40 cursor-text rounded px-1 -mx-1 ${className}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// CENTRAL SPIRAL BINDING COMPONENT (Desktop & Mobile Horizontal Divider)
// ─────────────────────────────────────────────────────────────
export function CentralSpiralBinding() {
  return (
    <>
      {/* Desktop Vertical Spiral */}
      <div className="hidden md:flex flex-col justify-between items-center w-8 z-30 py-6 select-none -mx-4 h-full pointer-events-none">
        {Array.from({ length: 17 }).map((_, i) => (
          <div key={i} className="relative flex items-center justify-center w-full h-4 my-1">
            <div className="absolute -left-1 w-2.5 h-3 rounded-full spiral-hole" />
            <div className="w-7 h-2.5 rounded-full spiral-ring transform -rotate-12 z-10" />
            <div className="absolute -right-1 w-2.5 h-3 rounded-full spiral-hole" />
          </div>
        ))}
      </div>

      {/* Mobile Horizontal Spiral Binding between Top & Bottom Page */}
      <div className="flex md:hidden items-center justify-around w-full px-4 h-6 -my-2.5 z-30 select-none pointer-events-none">
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} className="relative flex flex-col items-center justify-center">
            <div className="w-2.5 h-2 rounded-full spiral-hole -mb-1" />
            <div className="w-2 h-5 rounded-full spiral-ring z-10" />
            <div className="w-2.5 h-2 rounded-full spiral-hole -mt-1" />
          </div>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN "OUR LITTLE BOOK" COMPONENT
// ─────────────────────────────────────────────────────────────
export default function LittleBook() {
  const { user, openAuthModal } = useAuth();
  const [currentSpread, setCurrentSpread] = useState(0); // 0: Hello, 1: Little Things, 2: Memories, 3: Love This
  const [photos, setPhotos] = useState<Record<number, string | null>>({});
  const [bookTitle, setBookTitle] = useState("Our Little Book");
  const [bookSubtitle, setBookSubtitle] = useState("curated by Vath");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string>("");
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Song & Audio Trimmer State
  const [song, setSong] = useState<{
    src: string;
    title: string;
    startTime?: number;
    endTime?: number;
  }>({
    src: "/music/miguel-sure-thing.mp3",
    title: "Miguel - Sure Thing",
  });
  const [isSongPickerOpen, setIsSongPickerOpen] = useState(false);
  const [isTrimmerOpen, setIsTrimmerOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [tabLabels, setTabLabels] = useState<string[]>([
    "Hello",
    "Little Things",
    "Memories",
    "Love This",
  ]);
  const [editingTab, setEditingTab] = useState<number | null>(null);

  const SPREAD_NAMES = ["Hello", "Little Things", "Memories", "Love This"];

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Saved Data on Mount
  useEffect(() => {
    const loadedPhotos: Record<number, string | null> = {};
    for (let i = 1; i <= 18; i++) {
      const saved = localStorage.getItem(`little_book_photo_${i}`);
      if (saved) loadedPhotos[i] = saved;
    }
    setPhotos(loadedPhotos);

    const savedTitle = localStorage.getItem("little_book_title");
    if (savedTitle) setBookTitle(savedTitle);
    const savedSubtitle = localStorage.getItem("little_book_subtitle");
    if (savedSubtitle) setBookSubtitle(savedSubtitle);
    const savedTabLabels = localStorage.getItem("little_book_tab_labels");
    if (savedTabLabels) {
      try {
        const parsed = JSON.parse(savedTabLabels);
        if (Array.isArray(parsed) && parsed.length === 4) setTabLabels(parsed);
      } catch {}
    }
    const savedSong = localStorage.getItem("little_book_song");
    if (savedSong) {
      try {
        const parsedSong = JSON.parse(savedSong);
        if (parsedSong?.src && parsedSong?.title) {
          setSong(parsedSong);
        }
      } catch {}
    }
  }, []);

  // Reload audio when song changes
  useEffect(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [song.src, song.startTime, song.endTime]);

  const togglePlayMusic = async () => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
    } else {
      try {
        const start = song.startTime || 0;
        await a.play();
        setIsPlaying(true);
        if (start > 0 && (a.currentTime < start || (song.endTime && a.currentTime >= song.endTime))) {
          a.currentTime = start;
        }
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const toggleMuteMusic = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    const start = song.startTime || 0;
    if (song.endTime && a.currentTime >= song.endTime) {
      a.currentTime = start;
    }
  };

  const updateSong = (newSong: {
    src: string;
    title: string;
    startTime?: number;
    endTime?: number;
  }) => {
    setSong(newSong);
    try {
      localStorage.setItem("little_book_song", JSON.stringify(newSong));
    } catch {}
  };

  const handlePhotoChange = (id: number, src: string | null) => {
    setPhotos((prev) => ({ ...prev, [id]: src }));
  };

  const handleTitleChange = (val: string) => {
    setBookTitle(val);
    localStorage.setItem("little_book_title", val);
  };

  const handleSubtitleChange = (val: string) => {
    setBookSubtitle(val);
    localStorage.setItem("little_book_subtitle", val);
  };

  const handleTabLabelChange = (index: number, val: string) => {
    setTabLabels((prev) => {
      const updated = [...prev];
      updated[index] = val;
      localStorage.setItem("little_book_tab_labels", JSON.stringify(updated));
      return updated;
    });
  };

  // Bulk Fill Empty Frames
  const handleBulkFill = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const emptyIds: number[] = [];
    for (let i = 1; i <= 18; i++) {
      if (!photos[i]) emptyIds.push(i);
    }

    if (!emptyIds.length) {
      showToast("All 18 frames already have photos!");
      return;
    }

    let addedCount = 0;
    files.slice(0, emptyIds.length).forEach((file, index) => {
      const targetId = emptyIds[index];
      compressImage(file, (compressed) => {
        handlePhotoChange(targetId, compressed);
        try {
          localStorage.setItem(`little_book_photo_${targetId}`, compressed);
        } catch {}
      });
      // Also upload to Supabase in the background
      uploadImage(file)
        .then((url) => {
          if (url) {
            handlePhotoChange(targetId, url);
            try {
              localStorage.setItem(`little_book_photo_${targetId}`, url);
            } catch {}
          }
        })
        .catch(() => {});
      addedCount++;
    });

    showToast(`✨ Added ${addedCount} photo${addedCount > 1 ? "s" : ""} to empty frames!`);
    if (multiFileInputRef.current) multiFileInputRef.current.value = "";
  };

  // Reset / Start Fresh
  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 4000);
      showToast("⚠️ Tap 'Confirm Reset' again to clear all photos & notes.");
      return;
    }

    for (let i = 1; i <= 18; i++) {
      localStorage.removeItem(`little_book_photo_${i}`);
    }
    for (let i = 1; i <= 8; i++) {
      localStorage.removeItem(`little_book_note_s${i}_l`);
      localStorage.removeItem(`little_book_note_s${i}_r`);
    }
    const titleIds = ["s1_l", "s2_l", "s3_l", "s3_r", "s4_l", "s4_r", "tab1", "tab2", "tab3", "tab4"];
    for (const tId of titleIds) {
      localStorage.removeItem(`little_book_title_${tId}`);
    }
    localStorage.removeItem("little_book_title");
    localStorage.removeItem("little_book_subtitle");
    localStorage.removeItem("little_book_tab_labels");
    localStorage.removeItem("little_book_song");

    setPhotos({});
    setBookTitle("Our Little Book");
    setBookSubtitle("curated by Vath");
    setTabLabels(["Hello", "Little Things", "Memories", "Love This"]);
    setResetConfirm(false);
    showToast("🧹 Book reset to initial state!");
  };

  // Save & Copy Share Link (Gated by Auth)
  const executeSaveAndShare = async () => {
    setIsSaving(true);
    try {
      // Upload any remaining local photos to Supabase Storage
      const photoUrls: Record<number, string> = {};
      for (const [idStr, src] of Object.entries(photos)) {
        if (!src) continue;
        const id = Number(idStr);
        if (src.startsWith("https://")) {
          photoUrls[id] = src;
        } else if (src.startsWith("data:image")) {
          try {
            const blob = dataUrlToBlob(src);
            const file = new File([blob], `little-book-${id}.jpg`, { type: blob.type || "image/jpeg" });
            photoUrls[id] = await uploadImage(file);
          } catch (e) {
            console.error(`Failed to upload LittleBook photo ${id}:`, e);
            photoUrls[id] = src;
          }
        } else {
          photoUrls[id] = src;
        }
      }

      // Notes are stored per-spread in localStorage — gather them
      const notes: Record<string, string> = {};
      for (let i = 1; i <= 4; i++) {
        const l = localStorage.getItem(`little_book_note_s${i}_l`);
        const r = localStorage.getItem(`little_book_note_s${i}_r`);
        if (l) notes[`s${i}_l`] = l;
        if (r) notes[`s${i}_r`] = r;
      }

      // Gather custom titles
      const titles: Record<string, string> = {};
      const titleIds = ["s1_l", "s2_l", "s3_l", "s3_r", "s4_l", "s4_r", "tab1", "tab2", "tab3", "tab4"];
      for (const tId of titleIds) {
        const val = localStorage.getItem(`little_book_title_${tId}`);
        if (val) titles[tId] = val;
      }

      const page = await createLovePage({
        title: bookTitle,
        message: JSON.stringify({
          type: "little-book",
          title: bookTitle,
          subtitle: bookSubtitle,
          photos: photoUrls,
          notes,
          titles,
          tabLabels,
          song,
        }),
        image_url: Object.values(photoUrls)[0] ?? null,
      });

      setSavedSlug(page.slug);
      setIsShareModalOpen(true);
      showToast("💖 Saved! Link ready to share.");
    } catch (err) {
      console.error(err);
      showToast("Couldn't save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndShare = () => {
    if (!user) {
      openAuthModal({
        title: "Sign In to Share",
        subtitle: "Log in or create a quick free account to save your book and get your shareable link.",
        onSuccess: () => {
          executeSaveAndShare();
        },
      });
      return;
    }
    executeSaveAndShare();
  };

  return (
    <div className="min-h-screen min-h-[100dvh] cutting-mat-bg text-desk-text pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2.25rem,env(safe-area-inset-bottom))] pl-[max(0.875rem,env(safe-area-inset-left))] pr-[max(0.875rem,env(safe-area-inset-right))] sm:py-10 sm:px-6 relative flex flex-col items-center selection:bg-washi-cherry/30 overflow-x-clip">
      {/* Vignette Overlay */}
      <div className="fixed inset-0 cutting-mat-vignette pointer-events-none z-0" />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={song.src}
        loop={!song.endTime}
        preload="metadata"
        playsInline
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Hidden Multi-file input for bulk fill */}
      <input
        ref={multiFileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleBulkFill}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-5 right-4 left-4 sm:left-auto sm:right-6 z-50 bg-[#1c3a30] text-white px-4 py-3 rounded-xl border border-white/20 shadow-2xl flex items-center justify-center sm:justify-start gap-2 font-medium text-xs sm:text-sm animate-fade-up">
          <Sparkles className="h-4 w-4 text-washi-mustard shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TOP BAR (Back to Landing, Song Picker, AI, Templates, Share)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-30 w-full max-w-5xl flex items-center justify-between gap-1.5 sm:gap-2 mb-4 sm:mb-6">
        <Link
          href="/"
          className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium transition-all group active:scale-95 shrink-0"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
          <span className="hidden xs:inline">Back</span>
          <span className="hidden sm:inline"> to Home</span>
        </Link>

        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => setIsSongPickerOpen(true)}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-rose-500/25 hover:bg-rose-500/35 text-rose-100 border border-rose-300/30 backdrop-blur-md text-xs sm:text-sm font-semibold transition-all active:scale-95 shrink-0 cursor-pointer"
            title="Choose or upload a background song"
          >
            <Music className="h-3.5 w-3.5 text-rose-300 shrink-0" />
            <span className="hidden md:inline">Choose Song</span>
            <span className="md:hidden">Song</span>
          </button>

          <Link
            href="/templates"
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium transition-all shrink-0"
          >
            <Layers className="h-3.5 w-3.5 text-washi-sky shrink-0" />
            <span className="hidden sm:inline">Switch Template</span>
            <span className="sm:hidden">Templates</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveAndShare}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-washi-cherry hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Share2 className="h-3.5 w-3.5 shrink-0" />
            <span>{isSaving ? "Saving..." : "Share"}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. MASTHEAD & HEADER (Tilted -1.2° Title Card)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full max-w-md sm:max-w-xl text-center mb-4 sm:mb-7">
        {/* Paper Title Card */}
        <div className="relative inline-block w-full max-w-md book-page-paper p-3 xs:p-4 sm:p-6 rounded-sm transform -rotate-[1deg] shadow-xl border border-[#dcd7c3]">
          {/* Inner Dashed Border */}
          <div className="border border-dashed border-[#26386b]/40 p-2.5 xs:p-3.5 sm:p-5">
            {/* Top-Center Washi Tape (Teal Striped) */}
            <WashiTape
              pattern="teal-stripes"
              className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-4 sm:h-6"
            />

            {/* Editable Title */}
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-center font-bagel text-xl xs:text-2xl sm:text-4xl text-washi-navy bg-transparent focus:outline-none focus:ring-1 focus:ring-washi-navy/30 rounded"
              title="Click to edit book title"
            />

            {/* Editable Subtitle */}
            <input
              type="text"
              value={bookSubtitle}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              className="w-full text-center font-gaegu text-base xs:text-lg sm:text-2xl text-washi-cherry bg-transparent focus:outline-none focus:ring-1 focus:ring-washi-cherry/30 rounded mt-0.5"
              title="Click to edit subtitle"
            />

            {/* Bottom-Right Washi Tape (Mustard Dotted) */}
            <WashiTape
              pattern="mustard-dotted"
              className="absolute -bottom-2 -right-1.5 sm:-right-3 w-20 sm:w-28 h-4 sm:h-6 rotate-6"
            />
          </div>
        </div>

        {/* Interactive Soundtrack Pill Bar */}
        <div className="mt-4 mx-auto max-w-md flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 text-white shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={togglePlayMusic}
              className="h-8 w-8 rounded-full bg-washi-cherry hover:bg-rose-700 text-white flex items-center justify-center shadow transition-transform active:scale-95 shrink-0 cursor-pointer"
              title={isPlaying ? "Pause song" : "Play song"}
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-white" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-white translate-x-0.5" />
              )}
            </button>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1">
                <Music className="h-3 w-3 text-washi-mustard shrink-0" />
                <span className="font-mono text-[11px] sm:text-xs font-bold truncate block">
                  {song.title}
                </span>
              </div>
              <span className="text-[10px] text-white/70 font-gaegu block truncate">
                {song.startTime !== undefined || song.endTime !== undefined
                  ? `✂️ Trimmed ${Math.floor((song.startTime || 0) / 60)}:${String(
                      Math.floor((song.startTime || 0) % 60)
                    ).padStart(2, "0")} – ${
                      song.endTime
                        ? `${Math.floor(song.endTime / 60)}:${String(
                            Math.floor(song.endTime % 60)
                          ).padStart(2, "0")}`
                        : "End"
                    }`
                  : "Tap 'Song' to change or 'Cut 30s' to trim chorus"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsSongPickerOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[11px] font-semibold transition-all cursor-pointer"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => setIsTrimmerOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-washi-mustard/90 hover:bg-washi-mustard text-washi-navy text-[11px] font-bold transition-all cursor-pointer"
              title="Cut 30-second best part"
            >
              <Scissors className="h-3 w-3" />
              <span className="hidden xs:inline">Cut 30s</span>
            </button>
            <button
              type="button"
              onClick={toggleMuteMusic}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="h-3.5 w-3.5 text-rose-300" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Instructions Text on Mat */}
        <p className="mt-3 text-[11px] sm:text-sm text-desk-text/90 font-gaegu tracking-wide flex items-center justify-center gap-1">
          <Info className="h-3.5 w-3.5 text-washi-mustard shrink-0" />
          <span>
            Tap any frame to add a photo. Tap any title or note to edit.
          </span>
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. NAVIGATION TABS (Spread Switcher with Washi Ends)
      ───────────────────────────────────────────────────────────── */}
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
          <div
            key={index}
            className={`relative px-3 xs:px-4 sm:px-6 py-1.5 sm:py-2 rounded-sm font-bagel text-[11px] xs:text-xs sm:text-sm transition-all transform ${rotate} shadow-md ${
              currentSpread === index
                ? `${activeColor} scale-105`
                : `${inactiveColor} hover:scale-102`
            }`}
          >
            {editingTab === index ? (
              <input
                type="text"
                autoFocus
                value={tabLabels[index]}
                onChange={(e) => handleTabLabelChange(index, e.target.value)}
                onBlur={() => setEditingTab(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") {
                    setEditingTab(null);
                    if (e.key === "Enter") setCurrentSpread(index);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-b border-current focus:outline-none w-full min-w-[50px] max-w-[120px] text-center"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (currentSpread === index) {
                    setEditingTab(index);
                  } else {
                    setCurrentSpread(index);
                  }
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  setEditingTab(index);
                }}
                className="cursor-pointer bg-transparent border-none p-0 font-bagel text-[11px] xs:text-xs sm:text-sm"
                title="Click to switch • Click again to rename"
              >
                {tabLabels[index]}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. THE BOOK SPREADS (Fits Mobile Phones & Desktop Seamlessly)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full max-w-[92vw] xs:max-w-[90vw] sm:max-w-5xl flex flex-col md:flex-row items-stretch justify-center gap-0 my-2 sm:my-4 mx-auto">
        {/* ═══════════════════════════════════════════════════════════
            LEFT PAGE (Top Page on Mobile, Left Page on Desktop)
        ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 book-page-paper rounded-t-lg md:rounded-l-lg md:rounded-tr-none p-3.5 xs:p-5 sm:p-8 md:p-10 border border-[#ded9c5] relative flex flex-col justify-between min-h-[380px] sm:min-h-[580px] overflow-hidden">
          {/* Top Washi Decor */}
          <WashiTape
            pattern="teal-stripes"
            className="absolute top-2 left-5 w-20 sm:w-24 h-4 sm:h-5 -rotate-2"
          />

          {/* SPREAD 1 (LEFT): Tilted 4x6 frame, 3 stacked washi strips, 5-line note, Title "Hello, You" */}
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
                  <PhotoFrame
                    id={1}
                    dimensions="4×6″"
                    aspectRatioClass="aspect-[4/5.2]"
                    rotation="-rotate-2"
                    photoSrc={photos[1] || null}
                    onPhotoChange={handlePhotoChange}
                    onToast={showToast}
                  />
                </div>

                {/* 3 Stacked Washi Strips */}
                <div className="flex flex-col gap-1 w-28 sm:w-36 mt-3 sm:mt-4 opacity-90">
                  <WashiTape pattern="teal-stripes" className="w-full h-2.5 sm:h-3" />
                  <WashiTape pattern="sage-dashes" className="w-4/5 h-2.5 sm:h-3 ml-2" />
                  <WashiTape pattern="sky-scallops" className="w-full h-2.5 sm:h-3" />
                </div>
              </div>

              {/* 5-Line Ruled Journaling Note */}
              <div className="mt-3 sm:mt-4">
                <RuledJournalingArea
                  id="s1_l"
                  rows={4}
                  initialText="This is where our story begins. Every memory with you brings the warmest smile to my heart."
                />
              </div>

              {/* Title: Hello, You */}
              <div className="text-right mt-2 sm:mt-3">
                <EditableText
                  id="s1_l"
                  initialText="Hello, You"
                  className="font-bagel text-xl xs:text-2xl sm:text-3xl text-washi-navy px-3 py-0.5 bg-washi-mustard/30 rounded-sm"
                />
              </div>
            </div>
          )}

          {/* SPREAD 2 (LEFT): 6-photo grid + 3-line note + Title "Little Things" */}
          {currentSpread === 1 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="mb-2.5 sm:mb-3">
                  <EditableText
                    id="s2_l"
                    initialText="Little Things"
                    className="font-bagel text-xl xs:text-2xl sm:text-3xl text-washi-navy px-3 py-0.5 bg-washi-sky/40 rounded-sm"
                  />
                </div>

                {/* 6-Photo Grid */}
                <div className="space-y-2 sm:space-y-3">
                  {/* Top Row: 3 frames */}
                  <div className="grid grid-cols-3 gap-1.5 xs:gap-2">
                    <PhotoFrame
                      id={4}
                      dimensions="3×5″"
                      aspectRatioClass="aspect-[3/4.5]"
                      rotation="-rotate-1"
                      photoSrc={photos[4] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                      compact
                    />
                    <PhotoFrame
                      id={5}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-1"
                      photoSrc={photos[5] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                      compact
                    />
                    <PhotoFrame
                      id={6}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="-rotate-1"
                      photoSrc={photos[6] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                      compact
                    />
                  </div>

                  {/* Bottom Row: 3 frames */}
                  <div className="grid grid-cols-3 gap-1.5 xs:gap-2">
                    <PhotoFrame
                      id={7}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-1"
                      photoSrc={photos[7] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                      compact
                    />
                    <PhotoFrame
                      id={8}
                      dimensions="3×2″"
                      aspectRatioClass="aspect-[3/2.4]"
                      rotation="-rotate-1"
                      photoSrc={photos[8] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                      compact
                    />
                    <PhotoFrame
                      id={9}
                      dimensions="3×2″"
                      aspectRatioClass="aspect-[3/2.4]"
                      rotation="rotate-1"
                      photoSrc={photos[9] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                      compact
                    />
                  </div>
                </div>
              </div>

              {/* 3-line note */}
              <div className="mt-3 sm:mt-4">
                <RuledJournalingArea
                  id="s2_l"
                  rows={3}
                  initialText="It's always the little conversations and coffee sips that mean the most."
                />
              </div>
            </div>
          )}

          {/* SPREAD 3 (LEFT): Three 2x3 photos in a row taped at top, Title "Memories", 5-line note */}
          {currentSpread === 2 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="mb-3 sm:mb-4">
                  <EditableText
                    id="s3_l"
                    initialText="Memories"
                    className="font-bagel text-xl xs:text-2xl sm:text-3xl text-white px-3.5 py-0.5 bg-washi-cherry rounded-sm"
                  />
                </div>

                {/* Three 2x3 photos in a row taped at top */}
                <div className="grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-3">
                  <div className="relative">
                    <WashiTape
                      pattern="cherry-gingham"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3.5 sm:h-4 z-20"
                    />
                    <PhotoFrame
                      id={11}
                      dimensions="2×3″"
                      aspectRatioClass="aspect-[2/3]"
                      rotation="-rotate-1"
                      photoSrc={photos[11] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                      compact
                    />
                  </div>
                  <div className="relative">
                    <WashiTape
                      pattern="mustard-dotted"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3.5 sm:h-4 z-20"
                    />
                    <PhotoFrame
                      id={12}
                      dimensions="2×3″"
                      aspectRatioClass="aspect-[2/3]"
                      rotation="rotate-1"
                      photoSrc={photos[12] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                      compact
                    />
                  </div>
                  <div className="relative">
                    <WashiTape
                      pattern="teal-stripes"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3.5 sm:h-4 z-20"
                    />
                    <PhotoFrame
                      id={13}
                      dimensions="2×3″"
                      aspectRatioClass="aspect-[2/3]"
                      rotation="-rotate-1"
                      photoSrc={photos[13] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                      compact
                    />
                  </div>
                </div>
              </div>

              {/* 5-line note */}
              <div className="mt-4 sm:mt-6">
                <RuledJournalingArea
                  id="s3_l"
                  rows={4}
                  initialText="Looking back at these moments reminds me how full of happiness our journey has been."
                />
              </div>
            </div>
          )}

          {/* SPREAD 4 (LEFT): Title "Love This" across top, 4x6 frame, 4-strip tape stack, 4-line note */}
          {currentSpread === 3 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <EditableText
                  id="s4_l"
                  initialText="Love This"
                  className="font-bagel text-2xl xs:text-3xl sm:text-4xl text-washi-navy px-3.5 py-1 bg-washi-sage/40 rounded-sm mb-3 sm:mb-4"
                />

                <div className="flex flex-row gap-3 sm:gap-4 items-center justify-center sm:justify-start">
                  <div className="relative w-36 xs:w-44 sm:w-[200px] shrink-0">
                    <WashiTape
                      pattern="sage-dashes"
                      className="absolute -top-2 -left-2 w-12 sm:w-14 h-3.5 sm:h-4 -rotate-6 z-20"
                    />
                    <PhotoFrame
                      id={15}
                      dimensions="4×6″"
                      aspectRatioClass="aspect-[4/5.2]"
                      rotation="-rotate-2"
                      photoSrc={photos[15] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>

                  {/* 4-Strip Tape Stack */}
                  <div className="flex flex-col gap-1.5 w-20 xs:w-24 sm:w-32 opacity-90">
                    <WashiTape pattern="mustard-dotted" className="w-full h-3 sm:h-3.5" />
                    <WashiTape pattern="cherry-gingham" className="w-5/6 h-3 sm:h-3.5 ml-1.5" />
                    <WashiTape pattern="teal-stripes" className="w-full h-3 sm:h-3.5" />
                    <WashiTape pattern="sky-scallops" className="w-4/5 h-3 sm:h-3.5 ml-1" />
                  </div>
                </div>
              </div>

              {/* 4-line note */}
              <div className="mt-3 sm:mt-4">
                <RuledJournalingArea
                  id="s4_l"
                  rows={4}
                  initialText="I love everything about this day and every sweet second spent with you."
                />
              </div>
            </div>
          )}

          {/* Page Number Bottom Left */}
          <div className="text-[10px] sm:text-[11px] font-mono text-[#8a8677] mt-2 sm:mt-3">
            p. {currentSpread * 2 + 1}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CENTRAL METAL SPIRAL COIL BINDING
        ═══════════════════════════════════════════════════════════ */}
        <CentralSpiralBinding />

        {/* ═══════════════════════════════════════════════════════════
            RIGHT PAGE (Bottom Page on Mobile, Right Page on Desktop)
        ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 book-page-paper rounded-b-lg md:rounded-r-lg md:rounded-bl-none p-3.5 xs:p-5 sm:p-8 md:p-10 border border-[#ded9c5] relative flex flex-col justify-between min-h-[380px] sm:min-h-[580px] overflow-hidden">
          {/* Top Washi Decor */}
          <WashiTape
            pattern="mustard-dotted"
            className="absolute top-2 right-5 w-20 sm:w-24 h-4 sm:h-5 rotate-2"
          />

          {/* SPREAD 1 (RIGHT): Two 3x4 frames side-by-side with tapes, 5-line note */}
          {currentSpread === 0 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4 mb-2 sm:mb-3">
                  <div className="relative">
                    <WashiTape
                      pattern="sky-scallops"
                      className="absolute -top-2 left-2 w-12 sm:w-14 h-3.5 sm:h-4 rotate-3 z-20"
                    />
                    <PhotoFrame
                      id={2}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-1"
                      photoSrc={photos[2] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>

                  <div className="relative">
                    <WashiTape
                      pattern="sage-dashes"
                      className="absolute -top-2 right-2 w-12 sm:w-14 h-3.5 sm:h-4 -rotate-3 z-20"
                    />
                    <PhotoFrame
                      id={3}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="-rotate-2"
                      photoSrc={photos[3] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>
                </div>

                <div className="flex justify-center my-1.5 sm:my-2">
                  <Heart className="h-4 w-4 fill-washi-cherry text-washi-cherry animate-pulse" />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <RuledJournalingArea
                  id="s1_r"
                  rows={4}
                  initialText="Together is our favorite place to be. Every glance, every laugh, every quiet pause feels like magic."
                />
              </div>

              <div className="text-right text-[10px] sm:text-[11px] font-mono text-[#8a8677] mt-2 sm:mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}

          {/* SPREAD 2 (RIGHT): 4x4 photo with horizontal & fanned strips + note */}
          {currentSpread === 1 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="flex items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4">
                  <div className="relative w-36 xs:w-40 sm:w-48 shrink-0">
                    <PhotoFrame
                      id={10}
                      dimensions="4×4″"
                      aspectRatioClass="aspect-square"
                      rotation="rotate-1"
                      photoSrc={photos[10] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 w-20 xs:w-24 sm:w-28 opacity-90">
                    <WashiTape pattern="mustard-dotted" className="w-full h-2.5 sm:h-3" />
                    <WashiTape pattern="cherry-gingham" className="w-5/6 h-2.5 sm:h-3 ml-1.5" />
                    <WashiTape pattern="teal-stripes" className="w-full h-2.5 sm:h-3" />
                    <WashiTape pattern="sky-scallops" className="w-4/5 h-2.5 sm:h-3 ml-1" />
                  </div>
                </div>

                {/* 5 Fanned Vertical Strips */}
                <div className="flex items-center gap-1.5 justify-center my-2 sm:my-3 opacity-90">
                  <WashiTape pattern="teal-stripes" className="w-3.5 sm:w-4 h-8 sm:h-10 -rotate-12" />
                  <WashiTape pattern="mustard-dotted" className="w-3.5 sm:w-4 h-10 sm:h-12 -rotate-6" />
                  <WashiTape pattern="cherry-gingham" className="w-3.5 sm:w-4 h-11 sm:h-14 rotate-0" />
                  <WashiTape pattern="sage-dashes" className="w-3.5 sm:w-4 h-10 sm:h-12 rotate-6" />
                  <WashiTape pattern="sky-scallops" className="w-3.5 sm:w-4 h-8 sm:h-10 rotate-12" />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <RuledJournalingArea
                  id="s2_r"
                  rows={4}
                  initialText="Cherishing all these quiet little moments that make life so unimaginably sweet."
                />
              </div>

              <div className="text-right text-[10px] sm:text-[11px] font-mono text-[#8a8677] mt-2 sm:mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}

          {/* SPREAD 3 (RIGHT): Two angled 4x4 photos (side-by-side on mobile so neither is covered!) */}
          {currentSpread === 2 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <EditableText
                    id="s3_r"
                    initialText="So Fun"
                    className="font-bagel text-xl xs:text-2xl text-washi-navy px-3 py-0.5 bg-washi-mustard/40 rounded-sm"
                  />
                  <Sparkles className="h-4 w-4 text-washi-mustard" />
                </div>

                {/* Responsive Two Angled 4x4 Photos — clean grid on mobile, gentle overlap on desktop */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-center my-2 sm:my-3 px-1">
                  <div className="w-full">
                    <PhotoFrame
                      id={14}
                      dimensions="4×4″"
                      aspectRatioClass="aspect-square"
                      rotation="-rotate-3 sm:-rotate-6"
                      photoSrc={photos[14] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>
                  <div className="w-full sm:mt-4">
                    <PhotoFrame
                      id={16}
                      dimensions="4×4″"
                      aspectRatioClass="aspect-square"
                      rotation="rotate-3 sm:rotate-6"
                      photoSrc={photos[16] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>
                </div>

                {/* 3 Full-Width Washi Strips */}
                <div className="flex flex-col gap-1 w-full my-2.5 sm:my-3 opacity-90">
                  <WashiTape pattern="cherry-gingham" className="w-full h-2.5 sm:h-3" />
                  <WashiTape pattern="navy-checks" className="w-11/12 h-2.5 sm:h-3 mx-auto" />
                  <WashiTape pattern="sage-dashes" className="w-full h-2.5 sm:h-3" />
                </div>
              </div>

              <div className="mt-2">
                <RuledJournalingArea
                  id="s3_r"
                  rows={3}
                  initialText="So much laughter, silly jokes, and wonderful adventures."
                />
              </div>

              <div className="text-right text-[10px] sm:text-[11px] font-mono text-[#8a8677] mt-2 sm:mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}

          {/* SPREAD 4 (RIGHT): Two angled 3x4 photos + fanned tape strips + note */}
          {currentSpread === 3 && (
            <div className="flex flex-col h-full justify-between animate-fade-up pt-3 sm:pt-0">
              <div>
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-center my-2 px-1">
                  <div className="w-full">
                    <PhotoFrame
                      id={17}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="-rotate-3 sm:-rotate-6"
                      photoSrc={photos[17] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>

                  <div className="w-full sm:mt-3 relative">
                    <PhotoFrame
                      id={18}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-3 sm:rotate-6"
                      photoSrc={photos[18] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>
                </div>

                {/* 3 Fanned Tape Strips */}
                <div className="flex items-center justify-end gap-2 mt-2 opacity-90">
                  <WashiTape pattern="mustard-dotted" className="w-12 sm:w-16 h-3 rotate-6" />
                  <WashiTape pattern="cherry-gingham" className="w-12 sm:w-14 h-3 -rotate-3" />
                  <WashiTape pattern="teal-stripes" className="w-12 sm:w-16 h-3 rotate-3" />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <RuledJournalingArea
                  id="s4_r"
                  rows={4}
                  initialText="Forever grateful for you and every sweet moment we share together."
                />
              </div>

              <div className="text-right text-[10px] sm:text-[11px] font-mono text-[#8a8677] mt-2 sm:mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CONTROLS & FOOTER ACTION BUTTONS
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 pt-5 border-t border-white/10">
        {/* Navigation Controls: Back / Next Pill Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={currentSpread === 0}
            onClick={() => setCurrentSpread((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <span className="font-gaegu text-sm xs:text-base sm:text-xl text-desk-text px-3 py-1 bg-white/10 rounded-full border border-white/10">
            {tabLabels[currentSpread] || SPREAD_NAMES[currentSpread]} ({currentSpread + 1}/4)
          </span>

          <button
            type="button"
            disabled={currentSpread === 3}
            onClick={() => setCurrentSpread((prev) => Math.min(3, prev + 1))}
            className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons: Fill Empty Frames & Start Fresh */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => multiFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-washi-teal hover:bg-[#186360] text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            title="Upload multiple photos to fill all empty frames in order"
          >
            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Fill empty frames</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer ${
              resetConfirm
                ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                : "bg-white/10 hover:bg-white/20 text-desk-text border border-white/20"
            }`}
            title="Clear all photos and notes to start fresh"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{resetConfirm ? "Confirm Reset" : "Start fresh"}</span>
          </button>
        </div>
      </div>

      {/* Footer credits */}
      <footer className="relative z-20 mt-8 sm:mt-12 text-center text-xs text-desk-text/60 font-mono">
        <p>© {new Date().getFullYear()} Our Little Book • Designed with love</p>
      </footer>

      {/* Song Search & Upload Modal */}
      <SongSearchPicker
        isOpen={isSongPickerOpen}
        onClose={() => setIsSongPickerOpen(false)}
        currentSongSrc={song.src}
        onSelect={(track) => {
          updateSong({
            src: track.src,
            title: track.title,
            startTime: undefined,
            endTime: undefined,
          });
          showToast(`🎵 Selected "${track.title}"`);
        }}
        onOpenTrimmer={() => {
          setIsSongPickerOpen(false);
          setIsTrimmerOpen(true);
        }}
      />

      {/* Instagram-style 30-Second Audio Trimmer Modal */}
      <AudioTrimmerModal
        isOpen={isTrimmerOpen}
        onClose={() => setIsTrimmerOpen(false)}
        song={song}
        onSaveTrim={(startTime, endTime) => {
          updateSong({
            ...song,
            startTime,
            endTime,
          });
          showToast("✂️ Saved 30-second song clip!");
        }}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        slug={savedSlug}
        title={bookTitle}
        theme="cutting-mat"
      />
    </div>
  );
}
