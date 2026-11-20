"use client";

import React, { useRef } from "react";
import { Loader2, ImagePlus } from "lucide-react";
import styles from "./album.module.css";
import { TEXT_LIMIT } from "@/src/lib/album";

export interface AlbumRenderCtx {
  canEdit: boolean;
  readOnly: boolean;
  texts: Record<string, string>;
  photos: Record<string, string>;
  uploadingSlot: string | null;
  onTextChange: (key: string, val: string) => void;
  onPickPhoto: (slotId: string, file: File) => void;
}

export const AlbumContext = React.createContext<AlbumRenderCtx | null>(null);

function useAlbum() {
  const ctx = React.useContext(AlbumContext);
  if (!ctx) throw new Error("AlbumContext missing");
  return ctx;
}

/** Editable text element — contentEditable when unlocked, static in read-only mode. */
export function AlbumText({
  id,
  as: Tag = "p",
  className = "",
  style,
}: {
  id: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  style?: React.CSSProperties;
}) {
  const { canEdit, texts, onTextChange } = useAlbum();
  const value = texts[id] ?? "";

  if (!canEdit) {
    return (
      <Tag style={style} className={`${className} break-words`}>
        {value}
      </Tag>
    );
  }

  return (
    <Tag
      role="textbox"
      aria-label={`Edit ${id}`}
      tabIndex={0}
      contentEditable
      suppressContentEditableWarning
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const cleaned =
          e.currentTarget.innerText.replace(/\s+/g, " ").trim().slice(0, TEXT_LIMIT) || value;
        e.currentTarget.innerText = cleaned;
        onTextChange(id, cleaned);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      style={style}
      className={`${className} ${styles.editableText} ${styles.editableActive} break-words`}
    >
      {value}
    </Tag>
  );
}

/** Individual photo slot with background-size: cover and "＋" empty state. */
export function AlbumSlot({
  slotId,
  alt,
  className = "",
  style,
  children,
}: {
  slotId: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) {
  const { canEdit, readOnly, photos, uploadingSlot, onPickPhoto } = useAlbum();
  const inputRef = useRef<HTMLInputElement>(null);
  const url = photos[slotId];
  const isUploading = uploadingSlot === slotId;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPickPhoto(slotId, file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const bgStyle: React.CSSProperties = {
    ...style,
    backgroundImage: url ? `url("${url}")` : undefined,
  };

  return (
    <div className={`relative ${className}`}>
      {canEdit && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="sr-only"
          tabIndex={-1}
          aria-label={`Choose photo for ${alt}`}
        />
      )}

      {/* Lazy-loaded hidden img so browser preloads & caches the slot image accessibly */}
      {url && <img src={url} alt={alt} loading="lazy" className="sr-only" />}

      {canEdit ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label={url ? `Change photo: ${alt}` : `Add photo: ${alt}`}
          style={bgStyle}
          className={`${styles.slotBtn} group/slot cursor-pointer overflow-hidden`}
        >
          {!url && !isUploading && (
            <span className="flex flex-col items-center justify-center w-full h-full text-[#4a3f38]/65 group-hover/slot:text-[#4a3f38] transition-colors">
              <span className="text-2xl sm:text-3xl font-light leading-none">＋</span>
            </span>
          )}
          {url && !isUploading && (
            <span className="absolute bottom-1.5 right-1.5 opacity-0 group-hover/slot:opacity-100 transition-opacity px-2 py-0.5 rounded-full bg-white/90 text-[#4a3f38] text-[10px] font-semibold shadow">
              Change
            </span>
          )}
          {isUploading && (
            <span className="absolute inset-0 bg-[#4a3f38]/55 flex items-center justify-center text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
            </span>
          )}
        </button>
      ) : (
        <div
          role="img"
          aria-label={alt}
          style={bgStyle}
          className={`${styles.slotBtn} overflow-hidden`}
        >
          {!url && !readOnly && (
            <span className="flex items-center justify-center w-full h-full text-[#4a3f38]/40 text-2xl font-light">
              ＋
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/** Per-page decoration for Pages 1–7 and 9 (Page 8 uses its own cut-paper design). */
const PAGE_DECOR: Record<
  number,
  {
    topColor: string;
    bottomColor: string;
    tapeTL: string;
    tapeBR: string;
    emojis: [string, string, string, string];
  }
> = {
  1: {
    topColor: "#8aa67c",
    bottomColor: "#eab7aa",
    tapeTL: "rgba(233, 196, 106, 0.72)",
    tapeBR: "rgba(138, 166, 124, 0.72)",
    emojis: ["🌿", "🤍", "✨", "🏡"],
  },
  2: {
    topColor: "#eab7aa",
    bottomColor: "#e9c46a",
    tapeTL: "rgba(138, 166, 124, 0.72)",
    tapeBR: "rgba(234, 183, 170, 0.75)",
    emojis: ["🌻", "🧸", "💫", "🕊️"],
  },
  3: {
    topColor: "#e9c46a",
    bottomColor: "#8aa67c",
    tapeTL: "rgba(234, 183, 170, 0.75)",
    tapeBR: "rgba(233, 196, 106, 0.75)",
    emojis: ["🥞", "☀️", "🌷", "💛"],
  },
  4: {
    topColor: "#8aa67c",
    bottomColor: "#e9c46a",
    tapeTL: "rgba(233, 196, 106, 0.72)",
    tapeBR: "rgba(234, 183, 170, 0.72)",
    emojis: ["📸", "🌼", "🫶", "⭐"],
  },
  5: {
    topColor: "#eab7aa",
    bottomColor: "#8aa67c",
    tapeTL: "rgba(138, 166, 124, 0.72)",
    tapeBR: "rgba(233, 196, 106, 0.72)",
    emojis: ["🧺", "🌤️", "🍃", "🧡"],
  },
  6: {
    topColor: "#e9c46a",
    bottomColor: "#eab7aa",
    tapeTL: "rgba(234, 183, 170, 0.75)",
    tapeBR: "rgba(138, 166, 124, 0.72)",
    emojis: ["😊", "🌸", "☕", "✨"],
  },
  7: {
    topColor: "#8aa67c",
    bottomColor: "#eab7aa",
    tapeTL: "rgba(233, 196, 106, 0.72)",
    tapeBR: "rgba(234, 183, 170, 0.75)",
    emojis: ["🌿", "🌞", "🎈", "💫"],
  },
  9: {
    topColor: "#eab7aa",
    bottomColor: "#8aa67c",
    tapeTL: "rgba(138, 166, 124, 0.75)",
    tapeBR: "rgba(233, 196, 106, 0.75)",
    emojis: ["💌", "🌷", "🤍", "✨"],
  },
};

function PageDecorations({ pageNumber }: { pageNumber: number }) {
  const spec = PAGE_DECOR[pageNumber];
  if (!spec) return null;

  const positions = [
    { top: "24px", right: "14px", rot: "8deg", delay: "0s" },
    { top: "52%", left: "10px", rot: "-10deg", delay: "0.7s" },
    { bottom: "26px", left: "16px", rot: "6deg", delay: "1.3s" },
    { top: "48%", right: "10px", rot: "-8deg", delay: "1.9s" },
  ];

  return (
    <>
      <div
        aria-hidden="true"
        className={styles.scallopTop}
        style={{ "--border-tint": spec.topColor } as React.CSSProperties}
      />
      <div
        aria-hidden="true"
        className={styles.zigzagBottom}
        style={{ "--border-tint": spec.bottomColor } as React.CSSProperties}
      />
      <div
        aria-hidden="true"
        className={styles.washiCornerTL}
        style={{ backgroundColor: spec.tapeTL }}
      />
      <div
        aria-hidden="true"
        className={styles.washiCornerBR}
        style={{ backgroundColor: spec.tapeBR }}
      />
      {spec.emojis.map((em, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={
            {
              top: positions[i].top,
              bottom: positions[i].bottom,
              left: positions[i].left,
              right: positions[i].right,
              "--st-rot": positions[i].rot,
              animationDelay: positions[i].delay,
            } as React.CSSProperties
          }
          className={styles.emojiSticker}
        >
          {em}
        </span>
      ))}
    </>
  );
}

/** Renders the active page (1..9) inside the album sheet. */
export function AlbumPageContent({ page }: { page: number }) {
  const { canEdit, photos, onPickPhoto } = useAlbum();
  const wordFileRef = useRef<HTMLInputElement>(null);

  const renderBody = () => {
    switch (page) {
      /* ═══════════════════════════════════════════════════════════
         PAGE 1: "Our Family" — 6 tilted polaroids in a 3x2 grid + leaf line-doodle
      ═══════════════════════════════════════════════════════════ */
      case 1: {
        const tilts = ["-2.5deg", "2deg", "-1.8deg", "2.4deg", "-2deg", "1.6deg"];
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="text-center relative">
              <AlbumText
                id="p1-title"
                as="h1"
                className={`${styles.serif} italic text-3xl xs:text-4xl sm:text-5xl font-bold text-[#4a3f38] tracking-tight`}
              />
              <AlbumText
                id="p1-sub"
                className={`${styles.hand} text-lg sm:text-2xl text-[#8aa67c] -mt-0.5`}
              />
              {/* Leaf line-doodle SVG */}
              <svg
                aria-hidden="true"
                viewBox="0 0 180 28"
                className="w-36 sm:w-44 h-6 mx-auto text-[#8aa67c] mt-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M12 18 Q 90 6, 168 16" />
                <path d="M55 13 C 48 5, 62 4, 64 12" fill="rgba(138,166,124,0.22)" />
                <path d="M95 11 C 92 3, 106 3, 104 11" fill="rgba(138,166,124,0.22)" />
                <path d="M132 13 C 130 5, 143 6, 140 14" fill="rgba(138,166,124,0.22)" />
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-auto py-2 px-1">
              {["p1-1", "p1-2", "p1-3", "p1-4", "p1-5", "p1-6"].map((id, idx) => (
                <div
                  key={id}
                  style={{ transform: `rotate(${tilts[idx]})` }}
                  className={styles.polaroid}
                >
                  <AlbumSlot
                    slotId={id}
                    alt={`Family memory ${idx + 1}`}
                    className="w-full aspect-square overflow-hidden rounded-[2px]"
                  />
                </div>
              ))}
            </div>

            <div className="text-center">
              <AlbumText
                id="p1-foot"
                as="span"
                className={`${styles.hand} text-base sm:text-xl text-[#4a3f38]/80`}
              />
            </div>
          </div>
        );
      }

      /* ═══════════════════════════════════════════════════════════
         PAGE 2: "Family Is Where Our Story Begins" — 3 overlapping tilted photos + sand circle
      ═══════════════════════════════════════════════════════════ */
      case 2:
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="text-center px-2">
              <AlbumText
                id="p2-title"
                as="h2"
                className={`${styles.serif} italic text-2xl xs:text-3xl sm:text-4xl font-bold text-[#4a3f38] leading-snug`}
              />
            </div>

            {/* Sand circle + 3 overlapping tilted white-bordered photos */}
            <div className="relative flex-1 my-2 sm:my-3 flex items-center justify-center min-h-[240px] xs:min-h-[280px] sm:min-h-[340px]">
              <div
                aria-hidden="true"
                className="w-48 h-48 xs:w-56 xs:h-56 sm:w-68 sm:h-68 rounded-full bg-[#e6d7c3] opacity-75"
              />

              {/* Photo 1: Top-Left (-6deg) */}
              <div
                style={{ transform: "rotate(-6deg)" }}
                className={`${styles.whiteBorder} absolute top-3 left-3 sm:left-7 w-[50%] z-10`}
              >
                <AlbumSlot
                  slotId="p2-1"
                  alt="Story begins photo 1"
                  className="w-full aspect-[4/3] rounded-[3px] overflow-hidden"
                />
              </div>

              {/* Photo 2: Top-Right (+5deg) */}
              <div
                style={{ transform: "rotate(5deg)" }}
                className={`${styles.whiteBorder} absolute top-8 right-3 sm:right-7 w-[50%] z-20`}
              >
                <AlbumSlot
                  slotId="p2-2"
                  alt="Story begins photo 2"
                  className="w-full aspect-[4/3] rounded-[3px] overflow-hidden"
                />
              </div>

              {/* Photo 3: Bottom-Center (-2deg) */}
              <div
                style={{ transform: "rotate(-2deg)" }}
                className={`${styles.whiteBorder} absolute bottom-2 left-1/2 -translate-x-1/2 w-[56%] z-30`}
              >
                <AlbumSlot
                  slotId="p2-3"
                  alt="Story begins photo 3"
                  className="w-full aspect-[4/3] rounded-[3px] overflow-hidden"
                />
              </div>
            </div>

            <div className="text-center">
              <AlbumText
                id="p2-note"
                className={`${styles.hand} text-xl sm:text-2xl text-[#4a3f38]`}
              />
            </div>
          </div>
        );

      /* ═══════════════════════════════════════════════════════════
         PAGE 3: "Together We Make Beautiful Memories" — mixed grid of 5 photos + text tile
      ═══════════════════════════════════════════════════════════ */
      case 3:
        return (
          <div className="flex flex-col justify-between h-full gap-3">
            <div className="text-center px-2">
              <AlbumText
                id="p3-title"
                as="h2"
                className={`${styles.serif} italic text-2xl xs:text-3xl sm:text-4xl font-bold text-[#4a3f38] leading-snug`}
              />
            </div>

            <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 flex-1 min-h-[250px] xs:min-h-[290px] sm:min-h-[340px]">
              {/* Big feature photo (2x2) */}
              <div className={`${styles.whiteBorder} col-span-2 row-span-2`}>
                <AlbumSlot
                  slotId="p3-1"
                  alt="Memories main photo"
                  className="w-full h-full min-h-[135px] xs:min-h-[160px] rounded-[3px] overflow-hidden"
                />
              </div>

              {/* Top-right photo */}
              <div className={styles.whiteBorder}>
                <AlbumSlot
                  slotId="p3-2"
                  alt="Memories photo 2"
                  className="w-full h-full min-h-[64px] xs:min-h-[75px] rounded-[3px] overflow-hidden"
                />
              </div>

              {/* Middle-right Warm Text Tile */}
              <div className="rounded-lg bg-[#e9c46a]/45 border-2 border-dashed border-[#4a3f38]/30 p-1.5 sm:p-2 flex items-center justify-center text-center shadow-xs overflow-hidden">
                <AlbumText
                  id="p3-tile"
                  className={`${styles.hand} text-xs xs:text-sm sm:text-lg font-bold text-[#4a3f38] leading-tight`}
                />
              </div>

              {/* Bottom row: 3 photos */}
              <div className={styles.whiteBorder}>
                <AlbumSlot
                  slotId="p3-3"
                  alt="Memories photo 3"
                  className="w-full h-full min-h-[64px] xs:min-h-[75px] rounded-[3px] overflow-hidden"
                />
              </div>
              <div className={styles.whiteBorder}>
                <AlbumSlot
                  slotId="p3-4"
                  alt="Memories photo 4"
                  className="w-full h-full min-h-[64px] xs:min-h-[75px] rounded-[3px] overflow-hidden"
                />
              </div>
              <div className={styles.whiteBorder}>
                <AlbumSlot
                  slotId="p3-5"
                  alt="Memories photo 5"
                  className="w-full h-full min-h-[64px] xs:min-h-[75px] rounded-[3px] overflow-hidden"
                />
              </div>
            </div>
          </div>
        );

      /* ═══════════════════════════════════════════════════════════
         PAGE 4: FAMILY — huge letters filled with a photo (background-clip:text) + 3 photos below
      ═══════════════════════════════════════════════════════════ */
      case 4: {
        const wordPhoto =
          photos["p4-word"] ||
          photos["p4-1"] ||
          "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1000&q=80";

        return (
          <div className="flex flex-col justify-between h-full gap-3">
            <div className="text-center">
              <AlbumText
                id="p4-kicker"
                className={`${styles.hand} text-xl sm:text-2xl text-[#8aa67c]`}
              />

              {/* Huge Photo-Clipped FAMILY Word */}
              <div className="relative inline-block my-1">
                {canEdit && (
                  <input
                    ref={wordFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onPickPhoto("p4-word", f);
                      if (wordFileRef.current) wordFileRef.current.value = "";
                    }}
                    className="sr-only"
                    tabIndex={-1}
                    aria-label="Choose photo inside FAMILY letters"
                  />
                )}
                <AlbumText
                  id="p4-word"
                  as="h2"
                  style={{ backgroundImage: `url("${wordPhoto}")` }}
                  className={`${styles.serif} ${styles.photoWord} text-4xl xs:text-5xl sm:text-7xl select-none max-w-full`}
                />
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => wordFileRef.current?.click()}
                    className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e9c46a]/60 hover:bg-[#e9c46a] text-[#4a3f38] text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    <ImagePlus className="h-3 w-3" />
                    <span>Photo inside letters</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3 Photos Below */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 my-auto">
              {["p4-1", "p4-2", "p4-3"].map((id, i) => (
                <div
                  key={id}
                  style={{ transform: `rotate(${i === 1 ? "1.5deg" : "-1.5deg"})` }}
                  className={styles.polaroid}
                >
                  <AlbumSlot
                    slotId={id}
                    alt={`Family portrait ${i + 1}`}
                    className="w-full aspect-[3/4] rounded-[2px] overflow-hidden"
                  />
                </div>
              ))}
            </div>

            <div className="text-center">
              <AlbumText
                id="p4-note"
                className={`${styles.hand} text-xl sm:text-2xl text-[#4a3f38]`}
              />
            </div>
          </div>
        );
      }

      /* ═══════════════════════════════════════════════════════════
         PAGE 5: Clothesline — curved string, 5 hanging polaroids with pegs, 2 big photos below
      ═══════════════════════════════════════════════════════════ */
      case 5: {
        const hangTilts = ["-4deg", "3deg", "-2deg", "4deg", "-3deg"];
        const hangOffsets = ["mt-0", "mt-2", "mt-3", "mt-2", "mt-0"];
        return (
          <div className="flex flex-col justify-between h-full gap-2">
            <div className="text-center">
              <AlbumText
                id="p5-title"
                as="h2"
                className={`${styles.serif} italic text-2xl sm:text-3xl font-bold text-[#4a3f38]`}
              />
            </div>

            {/* Curved Clothesline + 5 Hanging Polaroids with Wooden Pegs */}
            <div className="relative pt-4 pb-2">
              <svg
                aria-hidden="true"
                viewBox="0 0 400 36"
                preserveAspectRatio="none"
                className="absolute top-2 left-0 right-0 w-full h-8 text-[#4a3f38]/65 pointer-events-none"
              >
                <path
                  d="M 4 6 Q 200 34, 396 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>

              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 relative z-10 pt-2">
                {["p5-1", "p5-2", "p5-3", "p5-4", "p5-5"].map((id, i) => (
                  <div
                    key={id}
                    style={{ transform: `rotate(${hangTilts[i]})` }}
                    className={`relative bg-white p-1 pb-3 rounded-[3px] shadow-md ${hangOffsets[i]}`}
                  >
                    {/* Wooden Peg */}
                    <span
                      aria-hidden="true"
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-2 h-4 rounded-[2px] bg-[#c89d66] border border-[#4a3f38]/40 shadow-2xs z-20"
                    />
                    <AlbumSlot
                      slotId={id}
                      alt={`Clothesline photo ${i + 1}`}
                      className="w-full aspect-square rounded-[2px] overflow-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 2 Big Photos Below */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 my-auto">
              <div style={{ transform: "rotate(-1.8deg)" }} className={styles.whiteBorder}>
                <AlbumSlot
                  slotId="p5-6"
                  alt="Featured clothesline memory 1"
                  className="w-full aspect-[4/3] rounded-[3px] overflow-hidden"
                />
              </div>
              <div style={{ transform: "rotate(1.8deg)" }} className={styles.whiteBorder}>
                <AlbumSlot
                  slotId="p5-7"
                  alt="Featured clothesline memory 2"
                  className="w-full aspect-[4/3] rounded-[3px] overflow-hidden"
                />
              </div>
            </div>

            <div className="text-center">
              <AlbumText
                id="p5-note"
                className={`${styles.hand} text-lg sm:text-xl text-[#4a3f38]`}
              />
            </div>
          </div>
        );
      }

      /* ═══════════════════════════════════════════════════════════
         PAGE 6: "Just Us, Being Us" — 5 scattered polaroids over sage/pink circles
      ═══════════════════════════════════════════════════════════ */
      case 6:
        return (
          <div className="flex flex-col justify-between h-full">
            <div className="text-center">
              <AlbumText
                id="p6-title"
                as="h2"
                className={`${styles.serif} italic text-3xl sm:text-4xl font-bold text-[#4a3f38]`}
              />
              <AlbumText
                id="p6-note"
                className={`${styles.hand} text-lg sm:text-xl text-[#8aa67c]`}
              />
            </div>

            {/* Decorative Sage & Blush Circles + 5 Scattered Polaroids */}
            <div className="relative my-auto py-3">
              <div
                aria-hidden="true"
                className="absolute top-3 left-6 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[#8aa67c]/30 pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-3 right-6 w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#eab7aa]/40 pointer-events-none"
              />

              <div className="relative z-10 grid grid-cols-6 gap-2.5 sm:gap-3 items-center">
                <div
                  style={{ transform: "rotate(-4deg)" }}
                  className={`${styles.polaroid} col-span-3`}
                >
                  <AlbumSlot
                    slotId="p6-1"
                    alt="Candid moment 1"
                    className="w-full aspect-[4/3] rounded-[2px] overflow-hidden"
                  />
                </div>
                <div
                  style={{ transform: "rotate(3.5deg)" }}
                  className={`${styles.polaroid} col-span-3`}
                >
                  <AlbumSlot
                    slotId="p6-2"
                    alt="Candid moment 2"
                    className="w-full aspect-[4/3] rounded-[2px] overflow-hidden"
                  />
                </div>
                <div
                  style={{ transform: "rotate(2.5deg)" }}
                  className={`${styles.polaroid} col-span-2`}
                >
                  <AlbumSlot
                    slotId="p6-3"
                    alt="Candid moment 3"
                    className="w-full aspect-square rounded-[2px] overflow-hidden"
                  />
                </div>
                <div
                  style={{ transform: "rotate(-2deg)" }}
                  className={`${styles.polaroid} col-span-2`}
                >
                  <AlbumSlot
                    slotId="p6-4"
                    alt="Candid moment 4"
                    className="w-full aspect-square rounded-[2px] overflow-hidden"
                  />
                </div>
                <div
                  style={{ transform: "rotate(3deg)" }}
                  className={`${styles.polaroid} col-span-2`}
                >
                  <AlbumSlot
                    slotId="p6-5"
                    alt="Candid moment 5"
                    className="w-full aspect-square rounded-[2px] overflow-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      /* ═══════════════════════════════════════════════════════════
         PAGE 7: Edge-to-edge grid — 4 small photos + 1 tall center photo
      ═══════════════════════════════════════════════════════════ */
      case 7:
        return (
          <div className="flex flex-col justify-between h-full gap-2.5">
            <div className="text-center">
              <AlbumText
                id="p7-title"
                as="h2"
                className={`${styles.serif} italic text-2xl sm:text-3xl font-bold text-[#4a3f38]`}
              />
            </div>

            <div className="grid grid-cols-3 grid-rows-2 gap-2 sm:gap-2.5 flex-1 min-h-[250px] xs:min-h-[290px] sm:min-h-[340px]">
              {/* Top-left small */}
              <div className="rounded-lg overflow-hidden shadow-sm border-2 border-white">
                <AlbumSlot slotId="p7-1" alt="Grid photo 1" className="w-full h-full min-h-[110px] xs:min-h-[130px]" />
              </div>

              {/* Center Tall Photo spanning 2 rows */}
              <div className="row-span-2 rounded-lg overflow-hidden shadow-md border-2 border-white">
                <AlbumSlot
                  slotId="p7-3"
                  alt="Tall center feature photo"
                  className="w-full h-full min-h-[230px] xs:min-h-[270px]"
                />
              </div>

              {/* Top-right small */}
              <div className="rounded-lg overflow-hidden shadow-sm border-2 border-white">
                <AlbumSlot slotId="p7-2" alt="Grid photo 2" className="w-full h-full min-h-[110px] xs:min-h-[130px]" />
              </div>

              {/* Bottom-left small */}
              <div className="rounded-lg overflow-hidden shadow-sm border-2 border-white">
                <AlbumSlot slotId="p7-4" alt="Grid photo 4" className="w-full h-full min-h-[110px] xs:min-h-[130px]" />
              </div>

              {/* Bottom-right small */}
              <div className="rounded-lg overflow-hidden shadow-sm border-2 border-white">
                <AlbumSlot slotId="p7-5" alt="Grid photo 5" className="w-full h-full min-h-[110px] xs:min-h-[130px]" />
              </div>
            </div>

            <div className="text-center">
              <AlbumText
                id="p7-note"
                className={`${styles.hand} text-lg sm:text-xl text-[#4a3f38]`}
              />
            </div>
          </div>
        );

      /* ═══════════════════════════════════════════════════════════
         PAGE 8: Cut-Paper Sticker Page (Pink background, Heart photo over red/mustard hearts,
                 2 round photos, star photo, taped polaroid, red ribbon banner, torn mustard scrap)
      ═══════════════════════════════════════════════════════════ */
      case 8:
        return (
          <div className="relative flex flex-col justify-between h-full py-1">
            {/* Red Ribbon Banner: "Love Grows Stronger" */}
            <div className="relative z-20 flex justify-center">
              <div className="relative bg-[#c94a3e] text-[#faf6ef] px-6 py-1.5 rounded-sm shadow-md border-2 border-white -rotate-1">
                <AlbumText
                  id="p8-ribbon"
                  as="h2"
                  className={`${styles.serif} italic text-xl sm:text-2xl font-bold tracking-wide text-center`}
                />
              </div>
            </div>

            {/* Collage Stage */}
            <div className="relative flex-1 my-2 grid grid-cols-12 gap-1.5 xs:gap-2 items-center min-h-[250px] xs:min-h-[290px] sm:min-h-[340px]">
              {/* Left Column: Round Photo 1 + Star-Shaped Photo */}
              <div className="col-span-4 flex flex-col items-center justify-between gap-2.5 h-full py-1.5">
                <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-26 sm:h-26 rounded-full p-1 sm:p-1.5 bg-white shadow-md -rotate-3">
                  <AlbumSlot
                    slotId="p8-round1"
                    alt="Round memory 1"
                    className="w-full h-full rounded-full overflow-hidden"
                  />
                </div>

                {/* Star-Shaped Photo with white drop-shadow outline */}
                <div
                  style={{
                    filter:
                      "drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(0 5px 10px rgba(74,63,56,0.22))",
                  }}
                  className="w-16 h-16 xs:w-20 xs:h-20 sm:w-26 sm:h-26 rotate-6"
                >
                  <AlbumSlot
                    slotId="p8-star"
                    alt="Star shaped memory"
                    className={`w-full h-full ${styles.starClip} overflow-hidden`}
                  />
                </div>
              </div>

              {/* Center: Big Heart Photo layered over Red & Mustard Cut-Paper Hearts */}
              <div className="col-span-4 flex items-center justify-center relative">
                {/* Mustard backing heart */}
                <div
                  aria-hidden="true"
                  style={{
                    clipPath: "url(#album-heart-clip)",
                    transform: "rotate(-10deg) translate(-6px, 5px) scale(1.08)",
                  }}
                  className="absolute w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 bg-[#e9c46a] shadow"
                />
                {/* Red backing heart */}
                <div
                  aria-hidden="true"
                  style={{
                    clipPath: "url(#album-heart-clip)",
                    transform: "rotate(8deg) translate(6px, -4px) scale(1.06)",
                  }}
                  className="absolute w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 bg-[#c94a3e] shadow"
                />
                {/* White outline + Heart Photo */}
                <div
                  style={{
                    clipPath: "url(#album-heart-clip)",
                  }}
                  className="relative z-10 w-24 h-24 xs:w-32 xs:h-32 sm:w-40 sm:h-40 bg-white p-1 sm:p-1.5 shadow-lg"
                >
                  <AlbumSlot
                    slotId="p8-heart"
                    alt="Heart shaped centerpiece"
                    style={{ clipPath: "url(#album-heart-clip)" }}
                    className="w-full h-full overflow-hidden"
                  />
                </div>
              </div>

              {/* Right Column: Round Photo 2 + Taped Polaroid */}
              <div className="col-span-4 flex flex-col items-center justify-between gap-2.5 h-full py-1.5">
                <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-26 sm:h-26 rounded-full p-1 sm:p-1.5 bg-white shadow-md rotate-3">
                  <AlbumSlot
                    slotId="p8-round2"
                    alt="Round memory 2"
                    className="w-full h-full rounded-full overflow-hidden"
                  />
                </div>

                {/* Taped Polaroid */}
                <div className="relative bg-white p-1 sm:p-1.5 pb-3 sm:pb-4 rounded-[3px] shadow-md -rotate-3 w-16 xs:w-20 sm:w-26">
                  <span
                    aria-hidden="true"
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-9 sm:w-12 h-2.5 sm:h-3 bg-[#e9c46a]/80 rotate-2 shadow-2xs"
                  />
                  <AlbumSlot
                    slotId="p8-polaroid"
                    alt="Taped polaroid memory"
                    className="w-full aspect-square rounded-[2px] overflow-hidden"
                  />
                  <AlbumText
                    id="p8-polaroid"
                    className={`${styles.hand} text-center text-[10px] xs:text-xs text-[#4a3f38] mt-0.5 leading-none truncate`}
                  />
                </div>
              </div>
            </div>

            {/* Torn Mustard Scrap: "more beautiful together" */}
            <div className="relative z-20 flex justify-center">
              <div
                style={{
                  clipPath:
                    "polygon(2% 8%, 98% 0%, 100% 88%, 95% 100%, 4% 94%, 0% 20%)",
                }}
                className="bg-[#e9c46a] px-6 py-1.5 shadow-md rotate-1"
              >
                <AlbumText
                  id="p8-scrap"
                  className={`${styles.hand} text-xl sm:text-2xl font-bold text-[#4a3f38] text-center`}
                />
              </div>
            </div>
          </div>
        );

      /* ═══════════════════════════════════════════════════════════
         PAGE 9: "Forever & Always" — 4-photo grid + closing text
      ═══════════════════════════════════════════════════════════ */
      case 9:
      default:
        return (
          <div className="flex flex-col justify-between h-full gap-3">
            <div className="text-center">
              <AlbumText
                id="p9-title"
                as="h2"
                className={`${styles.serif} italic text-3xl sm:text-4xl font-bold text-[#4a3f38]`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 my-auto px-1">
              {["p9-1", "p9-2", "p9-3", "p9-4"].map((id, i) => (
                <div
                  key={id}
                  style={{ transform: `rotate(${i % 2 === 0 ? "-1.5deg" : "1.5deg"})` }}
                  className={styles.polaroid}
                >
                  <AlbumSlot
                    slotId={id}
                    alt={`Forever memory ${i + 1}`}
                    className="w-full aspect-[4/3] rounded-[2px] overflow-hidden"
                  />
                </div>
              ))}
            </div>

            <div className="text-center px-3 space-y-1">
              <AlbumText
                id="p9-close"
                className={`${styles.hand} text-xl sm:text-2xl text-[#4a3f38] leading-snug`}
              />
              <AlbumText
                id="p9-sign"
                className={`${styles.serif} italic text-xs sm:text-sm text-[#8aa67c] font-semibold`}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {page !== 8 && <PageDecorations pageNumber={page} />}
      <div className="relative z-10 w-full h-full flex flex-col justify-between">
        {renderBody()}
      </div>
    </>
  );
}
