"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  RotateCcw,
  Share2,
  Check,
  X,
  Upload,
  Layers,
  ArrowLeft,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { createLovePage, uploadImage } from "@/src/lib/supabase";

// ─────────────────────────────────────────────────────────────
// COLOR TOKENS & STYLES
// ─────────────────────────────────────────────────────────────
const WASHI_COLORS = {
  mustard: "#e8a628",
  teal: "#1f7a76",
  cherry: "#c72f57",
  navy: "#26386b",
  sage: "#a3b68d",
  sky: "#8ec5e6",
};

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
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
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
}: PhotoFrameProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onToast("Please select a valid image file!");
      return;
    }
    compressImage(file, (compressed) => {
      onPhotoChange(id, compressed);
      try {
        localStorage.setItem(`little_book_photo_${id}`, compressed);
      } catch {
        onToast("Storage warning: Local storage quota almost full.");
      }
    });
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
      className={`relative interactive-photo-frame bg-white p-2.5 sm:p-3 pb-3 sm:pb-3.5 rounded-[3px] shadow-[0_6px_18px_rgba(20,45,35,0.18)] cursor-pointer group select-none ${rotation} ${className}`}
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
        {photoSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoSrc}
              alt={`Frame ${id}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
            />
            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                className="px-2.5 py-1 rounded-full bg-white/90 text-neutral-800 text-xs font-semibold shadow hover:bg-white flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-3 w-3" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                className="p-1.5 rounded-full bg-white/90 text-red-600 shadow hover:bg-white"
                onClick={handleRemove}
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-2">
            <Camera className="h-6 w-6 text-[#7d7a6e] mb-1 group-hover:scale-110 group-hover:text-washi-cherry transition-all" />
            <span className="font-gaegu text-sm font-bold text-[#4a473b] leading-tight">
              Add photo
            </span>
            <span className="font-mono text-[10px] text-[#8e8a7c] mt-0.5 font-medium">
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
        className="w-full journal-ruled-lines bg-transparent font-gaegu text-lg sm:text-xl text-[#2a2a35] focus:outline-none focus:ring-0 resize-none border-none p-0 overflow-hidden leading-[24px]"
        style={{ minHeight: `${rows * 24}px` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CENTRAL SPIRAL BINDING COMPONENT (17 Metal Ring Coils)
// ─────────────────────────────────────────────────────────────
export function CentralSpiralBinding() {
  return (
    <div className="hidden md:flex flex-col justify-between items-center w-8 z-30 py-6 select-none -mx-4 h-full pointer-events-none">
      {Array.from({ length: 17 }).map((_, i) => (
        <div key={i} className="relative flex items-center justify-center w-full h-4 my-1">
          {/* Left page hole */}
          <div className="absolute -left-1 w-2.5 h-3 rounded-full spiral-hole" />
          {/* Metal Ring Coil */}
          <div className="w-7 h-2.5 rounded-full spiral-ring transform -rotate-12 z-10" />
          {/* Right page hole */}
          <div className="absolute -right-1 w-2.5 h-3 rounded-full spiral-hole" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN "OUR LITTLE BOOK" COMPONENT
// ─────────────────────────────────────────────────────────────
export default function LittleBook() {
  const [currentSpread, setCurrentSpread] = useState(0); // 0: Hello, 1: Little Things, 2: Memories, 3: Love This
  const [photos, setPhotos] = useState<Record<number, string | null>>({});
  const [bookTitle, setBookTitle] = useState("Our Little Book");
  const [bookSubtitle, setBookSubtitle] = useState("curated by Vath");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

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
  }, []);

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

  // Bulk Fill Empty Frames
  const handleBulkFill = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Find empty frame IDs from 1 to 18
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
        localStorage.setItem(`little_book_photo_${targetId}`, compressed);
      });
      addedCount++;
    });

    showToast(`✨ Successfully added ${addedCount} photo${addedCount > 1 ? "s" : ""} to empty frames!`);
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
    localStorage.removeItem("little_book_title");
    localStorage.removeItem("little_book_subtitle");

    setPhotos({});
    setBookTitle("Our Little Book");
    setBookSubtitle("curated by Vath");
    setResetConfirm(false);
    showToast("🧹 Book reset to initial state!");
  };

  // Save & Copy Share Link
  const handleSaveAndShare = async () => {
    setIsSaving(true);
    try {
      // Upload every local photo to Supabase Storage
      const photoUrls: Record<number, string> = {};
      for (const [idStr, src] of Object.entries(photos)) {
        if (!src) continue;
        const id = Number(idStr);
        if (src.startsWith("data:image")) {
          const blob = await (await fetch(src)).blob();
          const file = new File([blob], `little-book-${id}.jpg`, { type: blob.type });
          photoUrls[id] = await uploadImage(file);
        } else {
          photoUrls[id] = src;
        }
      }

      // Notes are stored per-spread in localStorage — gather them
      const notes: Record<string, string> = {};
      for (let i = 1; i <= 8; i++) {
        const l = localStorage.getItem(`little_book_note_s${i}_l`);
        const r = localStorage.getItem(`little_book_note_s${i}_r`);
        if (l) notes[`s${i}_l`] = l;
        if (r) notes[`s${i}_r`] = r;
      }

      const page = await createLovePage({
        title: bookTitle,
        message: JSON.stringify({ type: "little-book", title: bookTitle, subtitle: bookSubtitle, photos: photoUrls, notes }),
        image_url: Object.values(photoUrls)[0] ?? null,
      });

      await navigator.clipboard.writeText(`${window.location.origin}/share/${page.slug}`);
      showToast("🔗 Saved — link copied!");
    } catch (err) {
      console.error(err);
      showToast("Couldn't save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen cutting-mat-bg text-desk-text py-8 sm:py-12 px-3 sm:px-6 relative flex flex-col items-center selection:bg-washi-cherry/30 overflow-x-hidden">
      {/* Vignette Overlay */}
      <div className="fixed inset-0 cutting-mat-vignette pointer-events-none z-0" />

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
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c3a30] text-white px-5 py-3 rounded-xl border border-white/20 shadow-2xl flex items-center gap-2 font-medium text-sm animate-fade-up">
          <Sparkles className="h-4 w-4 text-washi-mustard" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TOP BAR (Back to Landing, Templates Switcher, Share)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-30 w-full max-w-5xl flex items-center justify-between gap-3 mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium transition-all group active:scale-95"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium transition-all"
          >
            <Layers className="h-3.5 w-3.5 text-washi-sky" />
            <span>Switch Template</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveAndShare}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-washi-cherry hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Share"}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. MASTHEAD & HEADER (Tilted -1.2° Title Card)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full max-w-xl text-center mb-8 sm:mb-10">
        {/* Paper Title Card */}
        <div className="relative inline-block book-page-paper p-5 sm:p-7 rounded-sm transform -rotate-[1.2deg] shadow-xl border border-[#dcd7c3]">
          {/* Inner Dashed Border */}
          <div className="border border-dashed border-[#26386b]/40 p-4 sm:p-5">
            {/* Top-Center Washi Tape (Teal Striped) */}
            <WashiTape
              pattern="teal-stripes"
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6"
            />

            {/* Editable Title */}
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-center font-bagel text-3xl sm:text-4xl text-washi-navy bg-transparent focus:outline-none focus:ring-1 focus:ring-washi-navy/30 rounded"
              title="Click to edit book title"
            />

            {/* Editable Subtitle */}
            <input
              type="text"
              value={bookSubtitle}
              onChange={(e) => handleSubtitleChange(e.target.value)}
              className="w-full text-center font-gaegu text-xl sm:text-2xl text-washi-cherry bg-transparent focus:outline-none focus:ring-1 focus:ring-washi-cherry/30 rounded mt-0.5"
              title="Click to edit subtitle"
            />

            {/* Bottom-Right Washi Tape (Mustard Dotted) */}
            <WashiTape
              pattern="mustard-dotted"
              className="absolute -bottom-2.5 -right-3 w-28 h-6 rotate-6"
            />
          </div>
        </div>

        {/* Instructions Text on Mat */}
        <p className="mt-4 text-xs sm:text-sm text-desk-text/90 font-gaegu tracking-wide flex items-center justify-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-washi-mustard inline" />
          <span>
            Tap a frame to add a photo. Tap any words to write your own. Everything saves on this device.
          </span>
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. NAVIGATION TABS (Spread Switcher with Washi Ends)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full max-w-4xl flex items-center justify-center gap-2 sm:gap-4 mb-6 flex-wrap">
        {/* Tab 1: Hello (Mustard) */}
        <button
          type="button"
          onClick={() => setCurrentSpread(0)}
          className={`px-4 sm:px-6 py-2 rounded-sm font-bagel text-xs sm:text-sm transition-all transform -rotate-2 cursor-pointer shadow-md ${
            currentSpread === 0
              ? "bg-washi-mustard text-washi-navy scale-105 ring-2 ring-white underline decoration-2 decoration-washi-navy"
              : "bg-[#e8a628]/80 text-washi-navy/90 hover:bg-washi-mustard hover:scale-102"
          }`}
        >
          Tab 1: Hello
        </button>

        {/* Tab 2: Little Things (Sky) */}
        <button
          type="button"
          onClick={() => setCurrentSpread(1)}
          className={`px-4 sm:px-6 py-2 rounded-sm font-bagel text-xs sm:text-sm transition-all transform rotate-[1.5deg] cursor-pointer shadow-md ${
            currentSpread === 1
              ? "bg-washi-sky text-washi-navy scale-105 ring-2 ring-white underline decoration-2 decoration-washi-navy"
              : "bg-[#8ec5e6]/80 text-washi-navy/90 hover:bg-washi-sky hover:scale-102"
          }`}
        >
          Tab 2: Little Things
        </button>

        {/* Tab 3: Memories (Cherry, White Text) */}
        <button
          type="button"
          onClick={() => setCurrentSpread(2)}
          className={`px-4 sm:px-6 py-2 rounded-sm font-bagel text-xs sm:text-sm transition-all transform -rotate-[1.5deg] cursor-pointer shadow-md ${
            currentSpread === 2
              ? "bg-washi-cherry text-white scale-105 ring-2 ring-white underline decoration-2 decoration-white"
              : "bg-[#c72f57]/80 text-white hover:bg-washi-cherry hover:scale-102"
          }`}
        >
          Tab 3: Memories
        </button>

        {/* Tab 4: Love This (Sage) */}
        <button
          type="button"
          onClick={() => setCurrentSpread(3)}
          className={`px-4 sm:px-6 py-2 rounded-sm font-bagel text-xs sm:text-sm transition-all transform rotate-2 cursor-pointer shadow-md ${
            currentSpread === 3
              ? "bg-washi-sage text-washi-navy scale-105 ring-2 ring-white underline decoration-2 decoration-washi-navy"
              : "bg-[#a3b68d]/80 text-washi-navy/90 hover:bg-washi-sage hover:scale-102"
          }`}
        >
          Tab 4: Love This
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. THE BOOK SPREADS (Two 4:5 pages + Metal Spiral Coil)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full max-w-5xl flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-0 my-4">
        {/* ═══════════════════════════════════════════════════════════
            LEFT PAGE (4:5 Ratio)
        ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 book-page-paper rounded-l-md rounded-r-sm p-6 sm:p-8 md:p-10 border border-[#ded9c5] relative flex flex-col justify-between min-h-[580px] sm:min-h-[640px] overflow-hidden">
          {/* Top Washi Decor */}
          <WashiTape
            pattern="teal-stripes"
            className="absolute top-2 left-6 w-24 h-5 -rotate-2"
          />

          {/* SPREAD 1 (LEFT): Tilted 4x6 frame, 3 stacked washi strips, 5-line note, Title "Hello, You" */}
          {currentSpread === 0 && (
            <div className="flex flex-col h-full justify-between animate-fade-up">
              <div className="flex flex-col items-center">
                {/* Tilted 4x6 frame with corner washi tapes */}
                <div className="relative w-full max-w-[260px] sm:max-w-[280px]">
                  <WashiTape
                    pattern="mustard-dotted"
                    className="absolute -top-2.5 -left-3 w-16 h-5 -rotate-12 z-20"
                  />
                  <WashiTape
                    pattern="cherry-gingham"
                    className="absolute -bottom-2 -right-3 w-16 h-5 rotate-12 z-20"
                  />
                  <PhotoFrame
                    id={1}
                    dimensions="4×6″"
                    aspectRatioClass="aspect-[4/5.5]"
                    rotation="-rotate-2"
                    photoSrc={photos[1] || null}
                    onPhotoChange={handlePhotoChange}
                    onToast={showToast}
                  />
                </div>

                {/* 3 Stacked Washi Strips */}
                <div className="flex flex-col gap-1 w-36 mt-4 opacity-90">
                  <WashiTape pattern="teal-stripes" className="w-full h-3" />
                  <WashiTape pattern="sage-dashes" className="w-4/5 h-3 ml-2" />
                  <WashiTape pattern="sky-scallops" className="w-full h-3" />
                </div>
              </div>

              {/* 5-Line Ruled Journaling Note */}
              <div className="mt-4">
                <RuledJournalingArea
                  id="s1_l"
                  rows={5}
                  initialText="This is where our story begins. Every memory with you brings the warmest smile to my heart."
                />
              </div>

              {/* Title: Hello, You */}
              <div className="text-right mt-3">
                <span className="inline-block font-bagel text-2xl sm:text-3xl text-washi-navy px-3 py-0.5 bg-washi-mustard/30 rounded-sm">
                  Hello, You
                </span>
              </div>
            </div>
          )}

          {/* SPREAD 2 (LEFT): 6-photo grid (Top 3x5, 3x4, 3x4; Bottom 3x4, 3x2, 3x2) + 3-line note + Title "Little Things" */}
          {currentSpread === 1 && (
            <div className="flex flex-col h-full justify-between animate-fade-up">
              <div>
                <span className="inline-block font-bagel text-2xl sm:text-3xl text-washi-navy px-3 py-0.5 bg-washi-sky/40 rounded-sm mb-3">
                  Little Things
                </span>

                {/* 6-Photo Grid */}
                <div className="space-y-3">
                  {/* Top Row: 3 frames (3x5, 3x4, 3x4) */}
                  <div className="grid grid-cols-3 gap-2">
                    <PhotoFrame
                      id={4}
                      dimensions="3×5″"
                      aspectRatioClass="aspect-[3/5]"
                      rotation="-rotate-1"
                      photoSrc={photos[4] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                    <PhotoFrame
                      id={5}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-1"
                      photoSrc={photos[5] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                    <PhotoFrame
                      id={6}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="-rotate-2"
                      photoSrc={photos[6] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>

                  {/* Bottom Row: 3 frames (3x4, 3x2, 3x2) */}
                  <div className="grid grid-cols-3 gap-2">
                    <PhotoFrame
                      id={7}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-2"
                      photoSrc={photos[7] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                    <PhotoFrame
                      id={8}
                      dimensions="3×2″"
                      aspectRatioClass="aspect-[3/2.2]"
                      rotation="-rotate-1"
                      photoSrc={photos[8] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                    <PhotoFrame
                      id={9}
                      dimensions="3×2″"
                      aspectRatioClass="aspect-[3/2.2]"
                      rotation="rotate-1"
                      photoSrc={photos[9] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>
                </div>
              </div>

              {/* 3-line note */}
              <div className="mt-4">
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
            <div className="flex flex-col h-full justify-between animate-fade-up">
              <div>
                <span className="inline-block font-bagel text-2xl sm:text-3xl text-white px-3.5 py-0.5 bg-washi-cherry rounded-sm mb-4">
                  Memories
                </span>

                {/* Three 2x3 photos in a row taped at top */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="relative">
                    <WashiTape pattern="cherry-gingham" className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 z-20" />
                    <PhotoFrame
                      id={11}
                      dimensions="2×3″"
                      aspectRatioClass="aspect-[2/3]"
                      rotation="-rotate-2"
                      photoSrc={photos[11] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>
                  <div className="relative">
                    <WashiTape pattern="mustard-dotted" className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 z-20" />
                    <PhotoFrame
                      id={12}
                      dimensions="2×3″"
                      aspectRatioClass="aspect-[2/3]"
                      rotation="rotate-1"
                      photoSrc={photos[12] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>
                  <div className="relative">
                    <WashiTape pattern="teal-stripes" className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 z-20" />
                    <PhotoFrame
                      id={13}
                      dimensions="2×3″"
                      aspectRatioClass="aspect-[2/3]"
                      rotation="-rotate-1"
                      photoSrc={photos[13] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>
                </div>
              </div>

              {/* 5-line note */}
              <div className="mt-6">
                <RuledJournalingArea
                  id="s3_l"
                  rows={5}
                  initialText="Looking back at these moments reminds me how full of happiness our journey has been."
                />
              </div>
            </div>
          )}

          {/* SPREAD 4 (LEFT): Title "Love This" across top, 4x6 frame bottom left, 4-strip tape stack, 4-line note */}
          {currentSpread === 3 && (
            <div className="flex flex-col h-full justify-between animate-fade-up">
              <div>
                <span className="inline-block font-bagel text-3xl sm:text-4xl text-washi-navy px-4 py-1 bg-washi-sage/40 rounded-sm mb-4">
                  Love This
                </span>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative w-full max-w-[200px]">
                    <WashiTape pattern="sage-dashes" className="absolute -top-2 -left-2 w-14 h-4 -rotate-6 z-20" />
                    <PhotoFrame
                      id={15}
                      dimensions="4×6″"
                      aspectRatioClass="aspect-[4/5.5]"
                      rotation="-rotate-2"
                      photoSrc={photos[15] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>

                  {/* 4-Strip Tape Stack */}
                  <div className="flex flex-col gap-1.5 w-32 opacity-90">
                    <WashiTape pattern="mustard-dotted" className="w-full h-3.5" />
                    <WashiTape pattern="cherry-gingham" className="w-5/6 h-3.5 ml-2" />
                    <WashiTape pattern="teal-stripes" className="w-full h-3.5" />
                    <WashiTape pattern="sky-scallops" className="w-4/5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>

              {/* 4-line note */}
              <div className="mt-4">
                <RuledJournalingArea
                  id="s4_l"
                  rows={4}
                  initialText="I love everything about this day and every sweet second spent with you."
                />
              </div>
            </div>
          )}

          {/* Page Number Bottom Left */}
          <div className="text-[11px] font-mono text-[#8a8677] mt-3">
            p. {currentSpread * 2 + 1}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            CENTRAL METAL SPIRAL COIL BINDING
        ═══════════════════════════════════════════════════════════ */}
        <CentralSpiralBinding />

        {/* ═══════════════════════════════════════════════════════════
            RIGHT PAGE (4:5 Ratio)
        ═══════════════════════════════════════════════════════════ */}
        <div className="flex-1 book-page-paper rounded-r-md rounded-l-sm p-6 sm:p-8 md:p-10 border border-[#ded9c5] relative flex flex-col justify-between min-h-[580px] sm:min-h-[640px] overflow-hidden">
          {/* Top Washi Decor */}
          <WashiTape
            pattern="mustard-dotted"
            className="absolute top-2 right-6 w-24 h-5 rotate-2"
          />

          {/* SPREAD 1 (RIGHT): Two 3x4 frames side-by-side with tapes, 5-line note, small heart accent */}
          {currentSpread === 0 && (
            <div className="flex flex-col h-full justify-between animate-fade-up">
              <div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                  <div className="relative">
                    <WashiTape pattern="sky-scallops" className="absolute -top-2 left-2 w-14 h-4 rotate-3 z-20" />
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
                    <WashiTape pattern="sage-dashes" className="absolute -top-2 right-2 w-14 h-4 -rotate-3 z-20" />
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

                {/* Heart accent between photos */}
                <div className="flex justify-center my-2">
                  <Heart className="h-4 w-4 fill-washi-cherry text-washi-cherry animate-pulse" />
                </div>
              </div>

              {/* 5-Line Ruled Journaling Note */}
              <div className="mt-4">
                <RuledJournalingArea
                  id="s1_r"
                  rows={5}
                  initialText="Together is our favorite place to be. Every glance, every laugh, every quiet pause feels like magic."
                />
              </div>

              {/* Page Number Bottom Right */}
              <div className="text-right text-[11px] font-mono text-[#8a8677] mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}

          {/* SPREAD 2 (RIGHT): 4x4 photo with 4 horizontal strips (top right) & 5 fanned vertical strips (bottom) + 5-line note */}
          {currentSpread === 1 && (
            <div className="flex flex-col h-full justify-between animate-fade-up">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="relative w-40 sm:w-48">
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

                  {/* 4 Horizontal Tape Strips (Top Right) */}
                  <div className="flex flex-col gap-1.5 w-24 sm:w-28 opacity-90 pt-2">
                    <WashiTape pattern="mustard-dotted" className="w-full h-3" />
                    <WashiTape pattern="cherry-gingham" className="w-5/6 h-3 ml-2" />
                    <WashiTape pattern="teal-stripes" className="w-full h-3" />
                    <WashiTape pattern="sky-scallops" className="w-4/5 h-3 ml-1" />
                  </div>
                </div>

                {/* 5 Fanned Vertical Strips (Bottom) */}
                <div className="flex items-center gap-1.5 justify-center my-3 opacity-90">
                  <WashiTape pattern="teal-stripes" className="w-4 h-10 -rotate-12" />
                  <WashiTape pattern="mustard-dotted" className="w-4 h-12 -rotate-6" />
                  <WashiTape pattern="cherry-gingham" className="w-4 h-14 rotate-0" />
                  <WashiTape pattern="sage-dashes" className="w-4 h-12 rotate-6" />
                  <WashiTape pattern="sky-scallops" className="w-4 h-10 rotate-12" />
                </div>
              </div>

              {/* 5-Line Note */}
              <div className="mt-4">
                <RuledJournalingArea
                  id="s2_r"
                  rows={5}
                  initialText="Cherishing all these quiet little moments that make life so unimaginably sweet."
                />
              </div>

              {/* Page Number Bottom Right */}
              <div className="text-right text-[11px] font-mono text-[#8a8677] mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}

          {/* SPREAD 3 (RIGHT): Two overlapping angled 4x4 photos, 3 full-width washi strips, 3-line note, Title "So Fun" */}
          {currentSpread === 2 && (
            <div className="flex flex-col h-full justify-between animate-fade-up">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-block font-bagel text-2xl text-washi-navy px-3 py-0.5 bg-washi-mustard/40 rounded-sm">
                    So Fun
                  </span>
                  <Sparkles className="h-4 w-4 text-washi-mustard" />
                </div>

                {/* Two Overlapping Angled 4x4 Photos */}
                <div className="relative h-52 sm:h-56 my-2">
                  <div className="absolute left-2 top-0 w-36 sm:w-44 z-10">
                    <PhotoFrame
                      id={14}
                      dimensions="4×4″"
                      aspectRatioClass="aspect-square"
                      rotation="-rotate-6"
                      photoSrc={photos[14] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>
                  <div className="absolute right-2 top-6 w-36 sm:w-44 z-20">
                    <PhotoFrame
                      id={16}
                      dimensions="4×4″"
                      aspectRatioClass="aspect-square"
                      rotation="rotate-6"
                      photoSrc={photos[16] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>
                </div>

                {/* 3 Full-Width Washi Strips */}
                <div className="flex flex-col gap-1 w-full my-3 opacity-90">
                  <WashiTape pattern="cherry-gingham" className="w-full h-3" />
                  <WashiTape pattern="navy-checks" className="w-11/12 h-3 mx-auto" />
                  <WashiTape pattern="sage-dashes" className="w-full h-3" />
                </div>
              </div>

              {/* 3-line note */}
              <div className="mt-2">
                <RuledJournalingArea
                  id="s3_r"
                  rows={3}
                  initialText="So much laughter, silly jokes, and wonderful adventures."
                />
              </div>

              {/* Page Number Bottom Right */}
              <div className="text-right text-[11px] font-mono text-[#8a8677] mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}

          {/* SPREAD 4 (RIGHT): Two overlapping angled 3x4 photos, 3 fanned tape strips right, 5-line note across bottom */}
          {currentSpread === 3 && (
            <div className="flex flex-col h-full justify-between animate-fade-up">
              <div>
                <div className="relative h-56 my-2 flex items-center justify-center">
                  <div className="absolute left-2 w-32 sm:w-40 z-10">
                    <PhotoFrame
                      id={17}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="-rotate-8"
                      photoSrc={photos[17] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>

                  <div className="absolute right-6 w-32 sm:w-40 z-20">
                    <PhotoFrame
                      id={18}
                      dimensions="3×4″"
                      aspectRatioClass="aspect-[3/4]"
                      rotation="rotate-6"
                      photoSrc={photos[18] || null}
                      onPhotoChange={handlePhotoChange}
                      onToast={showToast}
                    />
                  </div>

                  {/* 3 Fanned Tape Strips Right */}
                  <div className="absolute -right-2 top-4 flex flex-col gap-1 z-30 opacity-90">
                    <WashiTape pattern="mustard-dotted" className="w-16 h-3.5 rotate-12" />
                    <WashiTape pattern="cherry-gingham" className="w-14 h-3.5 rotate-6" />
                    <WashiTape pattern="teal-stripes" className="w-16 h-3.5 -rotate-6" />
                  </div>
                </div>
              </div>

              {/* 5-line note across bottom */}
              <div className="mt-4">
                <RuledJournalingArea
                  id="s4_r"
                  rows={5}
                  initialText="Forever grateful for you and every sweet moment we share together."
                />
              </div>

              {/* Page Number Bottom Right */}
              <div className="text-right text-[11px] font-mono text-[#8a8677] mt-3">
                p. {currentSpread * 2 + 2}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. CONTROLS & FOOTER ACTION BUTTONS
      ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
        {/* Navigation Controls: Back / Next Pill Buttons + Live Indicator */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentSpread === 0}
            onClick={() => setCurrentSpread((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <span className="font-gaegu text-lg sm:text-xl text-desk-text px-3 py-1 bg-white/10 rounded-full border border-white/10">
            {SPREAD_NAMES[currentSpread]} ({currentSpread + 1} of 4)
          </span>

          <button
            type="button"
            disabled={currentSpread === 3}
            onClick={() => setCurrentSpread((prev) => Math.min(3, prev + 1))}
            className="flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons: Fill Empty Frames & Start Fresh */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => multiFileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-washi-teal hover:bg-[#186360] text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
            title="Upload multiple photos to fill all empty frames in order"
          >
            <Upload className="h-4 w-4" />
            <span>Fill empty frames</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer ${
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
      <footer className="relative z-20 mt-12 text-center text-xs text-desk-text/60 font-mono">
        <p>© {new Date().getFullYear()} Our Little Book • Designed with love</p>
      </footer>
    </div>
  );
}
