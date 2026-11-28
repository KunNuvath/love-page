"use client";

import React, { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import styles from "./adventure.module.css";
import { TORN_PHOTO_CLIP } from "./shapes";
import Sticker, { type StickerName } from "./Sticker";
import { LIMITS, type SlotShape } from "@/src/lib/adventure";

export interface TapeSpec {
  color: string;
  pattern?: "solid" | "stripes" | "dots";
  positionClass: string;
  rotate: number;
}

export interface StickerSpec {
  name: StickerName;
  positionClass: string;
  rotate?: number;
  size?: number;
}

interface PhotoSlotProps {
  shape: SlotShape;
  photoUrl: string | null;
  caption: string;
  rotation: number;
  tape: TapeSpec;
  sticker?: StickerSpec;
  editable?: boolean;
  uploading?: boolean;
  onPhotoSelect?: (shape: SlotShape, file: File) => void;
  onCaptionChange?: (shape: SlotShape, nextCaption: string) => void;
}

export default function PhotoSlot({
  shape,
  photoUrl,
  caption,
  rotation,
  tape,
  sticker,
  editable = false,
  uploading = false,
  onPhotoSelect,
  onCaptionChange,
}: PhotoSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Increment animKey whenever a new photo is chosen so the "glue down" animation plays
  const [animKey, setAnimKey] = useState(0);

  const openPicker = () => {
    if (!editable) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnimKey((k) => k + 1);
    onPhotoSelect?.(shape, file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const renderEmptyOrImage = () => (
    <>
      {photoUrl ? (
        <img
          key={`${photoUrl}-${animKey}`}
          src={photoUrl}
          alt={caption}
          loading="lazy"
          decoding="async"
          className={`${styles.photo} ${styles.glue}`}
        />
      ) : (
        <div className={styles.empty}>
          <div className="w-11 h-11 rounded-full bg-[#f7d56a] border-2 border-[#1d2742] shadow-[2px_2px_0_#1d2742] flex items-center justify-center mb-1">
            <ImagePlus className="h-5 w-5 text-[#1d2742]" />
          </div>
          <span className={`${styles.hand} text-lg sm:text-xl font-bold text-[#1d2742] px-3 leading-tight`}>
            {editable ? "Add a photo" : "Memory slot"}
          </span>
          {editable && (
            <span className={`${styles.type} text-[11px] text-[#1d2742]/80 px-3`}>
              tap to choose
            </span>
          )}
        </div>
      )}

      {uploading && (
        <div className="absolute inset-0 z-20 bg-[#1d2742]/65 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1.5 text-[#fbf6ea]">
          <Loader2 className="h-6 w-6 animate-spin text-[#f7d56a]" />
          <span className={`${styles.type} text-xs tracking-wider`}>Gluing in...</span>
        </div>
      )}

      {editable && photoUrl && !uploading && (
        <div className="absolute bottom-2.5 right-2.5 z-10 opacity-0 group-hover/slot:opacity-100 transition-opacity pointer-events-none">
          <span
            className={`${styles.type} px-2.5 py-1 rounded-full bg-[#fbf6ea]/95 text-[#1d2742] border border-[#1d2742] text-[10px] font-bold shadow`}
          >
            Tap to swap
          </span>
        </div>
      )}
    </>
  );

  const renderShapeFrame = () => {
    switch (shape) {
      case "torn":
        return (
          <div
            style={{ clipPath: TORN_PHOTO_CLIP }}
            className={`${styles.media} ${styles.torn} p-2.5 sm:p-3`}
          >
            <div className="relative w-full h-full overflow-hidden rounded-[2px]">
              {renderEmptyOrImage()}
            </div>
          </div>
        );

      case "circle":
        return (
          <div className={`${styles.media} ${styles.circle} mx-auto w-full max-w-[330px]`}>
            {renderEmptyOrImage()}
          </div>
        );

      case "ticket":
        return (
          <div className={`${styles.media} ${styles.ticket} mx-auto w-full max-w-[320px]`}>
            <div className={styles.ticketInner}>{renderEmptyOrImage()}</div>
            <div className={`${styles.ticketStub} ${styles.type}`}>
              <span>ADMIT TWO</span>
              <span>★ NO. 0214 ★</span>
            </div>
          </div>
        );

      case "film":
        return (
          <div className={`${styles.media} ${styles.film}`}>
            <div className={styles.filmInner}>{renderEmptyOrImage()}</div>
          </div>
        );

      case "arch":
        return (
          <div className={`${styles.media} ${styles.arch} mx-auto w-full max-w-[330px]`}>
            <div className={styles.archInner}>{renderEmptyOrImage()}</div>
          </div>
        );

      case "heart":
        return (
          <div className={`${styles.media} ${styles.heart} mx-auto w-full max-w-[360px] p-[6%]`}>
            <div
              style={{ clipPath: "url(#lp-heart-clip)" }}
              className="relative w-full h-full overflow-hidden bg-[#fbf6ea]"
            >
              {renderEmptyOrImage()}
            </div>
          </div>
        );
    }
  };

  const tapePatternClass =
    tape.pattern === "stripes"
      ? styles.tapeStripes
      : tape.pattern === "dots"
      ? styles.tapeDots
      : "";

  return (
    <figure
      style={{ "--rot": `${rotation}deg` } as React.CSSProperties}
      className={`${styles.piece} group/slot select-none`}
    >
      {/* Hidden File Input */}
      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          tabIndex={-1}
          aria-label={`Upload photo for ${caption}`}
        />
      )}

      {/* Washi Tape Strip */}
      <div
        aria-hidden="true"
        style={{
          backgroundColor: tape.color,
          transform: `rotate(${tape.rotate}deg)`,
        }}
        className={`${styles.tape} ${tapePatternClass} ${tape.positionClass}`}
      />

      {/* Clipped Photo Wrapper with drop-shadow filter */}
      <div className={styles.shadowWrap}>
        {editable ? (
          <button
            type="button"
            onClick={openPicker}
            aria-label={`${photoUrl ? "Change" : "Add"} photo: ${caption}`}
            className={`${styles.slotButton} text-left`}
          >
            {renderShapeFrame()}
          </button>
        ) : (
          <div>{renderShapeFrame()}</div>
        )}
      </div>

      {/* Overlapping Corner Doodle Sticker */}
      {sticker && (
        <div className={`absolute z-20 pointer-events-none ${sticker.positionClass}`}>
          <Sticker
            name={sticker.name}
            rotate={sticker.rotate ?? 0}
            size={sticker.size ?? 56}
          />
        </div>
      )}

      {/* Editable Handwritten Caption */}
      <figcaption className="mt-2.5 text-center">
        {editable ? (
          <span
            role="textbox"
            aria-label={`Caption for ${shape} photo`}
            tabIndex={0}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const cleaned =
                e.currentTarget.innerText.replace(/\s+/g, " ").trim().slice(0, LIMITS.caption) ||
                caption;
              e.currentTarget.innerText = cleaned;
              onCaptionChange?.(shape, cleaned);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.currentTarget as HTMLElement).blur();
              }
            }}
            className={`${styles.hand} ${styles.caption} ${styles.captionEditable} text-xl sm:text-2xl`}
          >
            {caption}
          </span>
        ) : (
          <span className={`${styles.hand} ${styles.caption} text-xl sm:text-2xl`}>
            {caption}
          </span>
        )}
      </figcaption>
    </figure>
  );
}
