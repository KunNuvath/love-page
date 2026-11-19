"use client";

import React, { useRef } from "react";
import styles from "./adventure.module.css";
import { SHEET_CLIP, LABEL_CLIP } from "./shapes";
import RansomTitle from "./RansomTitle";
import PhotoSlot from "./PhotoSlot";
import NewsClipping from "./NewsClipping";
import JourneyHeart from "./JourneyHeart";
import type { AdventureScrapbookData, SlotShape } from "@/src/lib/adventure";

interface ScrapbookSheetProps {
  data: AdventureScrapbookData;
  editable?: boolean;
  uploadingSlot?: SlotShape | null;
  onTitleChange?: (nextTitle: string) => void;
  onOwnerNameChange?: (nextOwner: string) => void;
  onPhotoSelect?: (shape: SlotShape, file: File) => void;
  onCaptionChange?: (shape: SlotShape, nextCaption: string) => void;
  onHeadlineChange?: (nextHeadline: string) => void;
  onStoryChange?: (nextStory: string) => void;
}

export default function ScrapbookSheet({
  data,
  editable = false,
  uploadingSlot = null,
  onTitleChange,
  onOwnerNameChange,
  onPhotoSelect,
  onCaptionChange,
  onHeadlineChange,
  onStoryChange,
}: ScrapbookSheetProps) {
  const sheetRef = useRef<HTMLElement | null>(null);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Shared SVG objectBoundingBox clipPath for Slot 6 (Heart-Shaped Photo) */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="lp-heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M 0.5,0.92 C 0.5,0.92 0.04,0.64 0.04,0.33 C 0.04,0.16 0.17,0.05 0.32,0.05 C 0.41,0.05 0.47,0.10 0.5,0.17 C 0.53,0.10 0.59,0.05 0.68,0.05 C 0.83,0.05 0.96,0.16 0.96,0.33 C 0.96,0.64 0.5,0.92 0.5,0.92 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Outer drop-shadow wrapper so the torn top & bottom edges of the kraft sheet cast a soft shadow */}
      <div className="drop-shadow-[0_26px_42px_rgba(8,14,28,0.55)] overflow-x-clip">
        <article
          ref={sheetRef}
          style={{ clipPath: SHEET_CLIP }}
          className={`${styles.sheet} relative px-5 xs:px-6 sm:px-10 md:px-14 pt-10 sm:pt-14 pb-14 sm:pb-20 text-[#1d2742] overflow-hidden`}
        >
          {/* Wavy dotted journey path + scroll-driven red heart sticker behind the collage */}
          <JourneyHeart containerRef={sheetRef} />

          {/* 1. Ransom-Note Header & Handwritten Subtitle */}
          <RansomTitle
            title={data.title}
            ownerName={data.ownerName}
            editable={editable}
            onTitleChange={onTitleChange}
            onOwnerNameChange={onOwnerNameChange}
          />

          {/* 2. Staggered 12-Column Collage Grid (6 Unique Photo Shapes + Torn Newspaper Clipping) */}
          <div className="relative z-10 mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-12 gap-y-12 sm:gap-y-14 md:gap-x-8 lg:gap-x-10 items-start">
            {/* ── ROW 1: Slot 1 (7 cols, Torn Rectangle 4:3) + Slot 2 (5 cols, Circle) ── */}
            <div className="md:col-span-7">
              <PhotoSlot
                shape="torn"
                photoUrl={data.photos.torn}
                caption={data.captions.torn}
                rotation={-2.2}
                tape={{
                  color: "#e5533d",
                  pattern: "stripes",
                  positionClass: "-top-3 left-1/2 -translate-x-1/2",
                  rotate: -3,
                }}
                sticker={{
                  name: "plane",
                  positionClass: "-top-4 right-0 sm:-right-4",
                  rotate: 12,
                  size: 54,
                }}
                editable={editable}
                uploading={uploadingSlot === "torn"}
                onPhotoSelect={onPhotoSelect}
                onCaptionChange={onCaptionChange}
              />
            </div>

            <div className="md:col-span-5 md:mt-8">
              <PhotoSlot
                shape="circle"
                photoUrl={data.photos.circle}
                caption={data.captions.circle}
                rotation={2.8}
                tape={{
                  color: "#f7d56a",
                  pattern: "dots",
                  positionClass: "top-2 left-6 sm:left-10",
                  rotate: -32,
                }}
                sticker={{
                  name: "star",
                  positionClass: "bottom-8 right-2 sm:right-6",
                  rotate: -14,
                  size: 54,
                }}
                editable={editable}
                uploading={uploadingSlot === "circle"}
                onPhotoSelect={onPhotoSelect}
                onCaptionChange={onCaptionChange}
              />
            </div>

            {/* ── ROW 2: Slot 3 (5 cols, Yellow Ticket Stub 3:4) + Torn Newspaper Clipping (7 cols) ── */}
            <div className="md:col-span-5">
              <PhotoSlot
                shape="ticket"
                photoUrl={data.photos.ticket}
                caption={data.captions.ticket}
                rotation={-2.5}
                tape={{
                  color: "#9cc9ee",
                  pattern: "stripes",
                  positionClass: "-top-3 left-1/2 -translate-x-1/2",
                  rotate: 4,
                }}
                sticker={{
                  name: "sun",
                  positionClass: "-bottom-3 left-0 sm:left-2",
                  rotate: -8,
                  size: 54,
                }}
                editable={editable}
                uploading={uploadingSlot === "ticket"}
                onPhotoSelect={onPhotoSelect}
                onCaptionChange={onCaptionChange}
              />
            </div>

            <div className="md:col-span-7 md:mt-6">
              <NewsClipping
                headline={data.news.headline}
                story={data.news.story}
                editable={editable}
                onHeadlineChange={onHeadlineChange}
                onStoryChange={onStoryChange}
              />
            </div>

            {/* ── ROW 3: Slot 4 (7 cols, Film Strip 16:9) + Slot 5 (5 cols, Sky-Blue Arch 3:4) ── */}
            <div className="md:col-span-7 md:mt-4">
              <PhotoSlot
                shape="film"
                photoUrl={data.photos.film}
                caption={data.captions.film}
                rotation={1.8}
                tape={{
                  color: "#f7d56a",
                  pattern: "stripes",
                  positionClass: "-top-3 left-10 sm:left-16",
                  rotate: -5,
                }}
                sticker={{
                  name: "camera",
                  positionClass: "-bottom-4 right-0 sm:-right-3",
                  rotate: 10,
                  size: 54,
                }}
                editable={editable}
                uploading={uploadingSlot === "film"}
                onPhotoSelect={onPhotoSelect}
                onCaptionChange={onCaptionChange}
              />
            </div>

            <div className="md:col-span-5 md:-mt-4">
              <PhotoSlot
                shape="arch"
                photoUrl={data.photos.arch}
                caption={data.captions.arch}
                rotation={-2.4}
                tape={{
                  color: "#a6d9c0",
                  pattern: "dots",
                  positionClass: "-top-3 left-1/2 -translate-x-1/2",
                  rotate: 3,
                }}
                sticker={{
                  name: "star",
                  positionClass: "-top-3 right-3 sm:right-6",
                  rotate: 18,
                  size: 50,
                }}
                editable={editable}
                uploading={uploadingSlot === "arch"}
                onPhotoSelect={onPhotoSelect}
                onCaptionChange={onCaptionChange}
              />
            </div>

            {/* ── ROW 4: Slot 6 (Centered Heart Photo with objectBoundingBox SVG clipPath) ── */}
            <div className="md:col-span-6 md:col-start-4 pt-2">
              <PhotoSlot
                shape="heart"
                photoUrl={data.photos.heart}
                caption={data.captions.heart}
                rotation={-1.4}
                tape={{
                  color: "#fbf6ea",
                  pattern: "stripes",
                  positionClass: "-top-2 left-1/2 -translate-x-1/2",
                  rotate: -2,
                }}
                sticker={{
                  name: "heart",
                  positionClass: "bottom-10 right-4 sm:right-8",
                  rotate: 15,
                  size: 54,
                }}
                editable={editable}
                uploading={uploadingSlot === "heart"}
                onPhotoSelect={onPhotoSelect}
                onCaptionChange={onCaptionChange}
              />
            </div>
          </div>

          {/* 3. Footer Paper Label: "made with love, glue & tape" */}
          <footer className="relative z-10 mt-14 sm:mt-16 flex justify-center">
            <div className={styles.shadowWrap}>
              <div
                style={{
                  clipPath: LABEL_CLIP,
                  transform: "rotate(-1.8deg)",
                }}
                className="bg-[#fbf6ea] px-6 py-2.5 border border-[#1d2742]/20"
              >
                <span className={`${styles.type} text-xs sm:text-sm tracking-widest text-[#1d2742]`}>
                  made with love, glue &amp; tape ♥
                </span>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}
