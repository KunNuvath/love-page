"use client";

import React from "react";
import styles from "./adventure.module.css";
import { NEWS_CLIP } from "./shapes";
import { LIMITS } from "@/src/lib/adventure";

interface NewsClippingProps {
  headline: string;
  story: string;
  editable?: boolean;
  onHeadlineChange?: (next: string) => void;
  onStoryChange?: (next: string) => void;
}

export default function NewsClipping({
  headline,
  story,
  editable = false,
  onHeadlineChange,
  onStoryChange,
}: NewsClippingProps) {
  return (
    <aside
      style={{ "--rot": "1.6deg" } as React.CSSProperties}
      className={`${styles.piece} relative my-auto`}
      aria-label="The Daily Us newspaper clipping"
    >
      {/* Top Washi Tape */}
      <div
        aria-hidden="true"
        style={{
          backgroundColor: "#a6d9c0",
          transform: "translateX(-50%) rotate(-3deg)",
        }}
        className={`${styles.tape} ${styles.tapeStripes} -top-3 left-1/2`}
      />

      <div className={styles.shadowWrap}>
        <div
          style={{ clipPath: NEWS_CLIP }}
          className={`${styles.newspaper} p-5 sm:p-7 border border-[#1d2742]/20`}
        >
          {/* Newspaper Masthead */}
          <div className="border-b-2 border-[#1d2742] pb-1.5 mb-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[9px] xs:text-[10px] sm:text-xs">
            <span className={`${styles.type} uppercase tracking-wider sm:tracking-widest font-bold`}>
              VOL. I • NO. 1
            </span>
            <span className={`${styles.type} uppercase tracking-wider sm:tracking-widest font-bold text-[#e5533d]`}>
              ★ SPECIAL EDITION ★
            </span>
            <span className={`${styles.type} uppercase tracking-wider sm:tracking-widest font-bold`}>
              PRICE: 1 KISS
            </span>
          </div>

          <div className="border-b-2 border-double border-[#1d2742] pb-2 mb-3 text-center">
            <h2
              className={`${styles.type} text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.14em] text-[#1d2742] uppercase`}
            >
              THE DAILY US
            </h2>
          </div>

          {/* Editable Headline */}
          <div className="mb-3 text-center">
            {editable ? (
              <h3
                role="textbox"
                aria-label="Newspaper headline"
                tabIndex={0}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const next =
                    e.currentTarget.innerText.replace(/\s+/g, " ").trim().slice(0, LIMITS.headline) ||
                    headline;
                  e.currentTarget.innerText = next;
                  onHeadlineChange?.(next);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).blur();
                  }
                }}
                className={`${styles.type} ${styles.caption} ${styles.captionEditable} text-base sm:text-lg md:text-xl font-bold uppercase tracking-wide text-[#1d2742] leading-snug`}
              >
                {headline}
              </h3>
            ) : (
              <h3
                className={`${styles.type} text-base sm:text-lg md:text-xl font-bold uppercase tracking-wide text-[#1d2742] leading-snug`}
              >
                {headline}
              </h3>
            )}
          </div>

          {/* Two-Column Typewriter Story Blurb */}
          {editable ? (
            <div
              role="textbox"
              aria-label="Newspaper story"
              tabIndex={0}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const next = e.currentTarget.innerText.trim().slice(0, LIMITS.story) || story;
                onStoryChange?.(next);
              }}
              className={`${styles.type} ${styles.captionEditable} sm:columns-2 sm:gap-5 text-xs sm:text-[13px] leading-relaxed text-[#1d2742]/95 text-justify rounded p-1 outline-none`}
              style={{ columnRule: "1px solid rgba(29,39,66,0.22)" }}
            >
              {story}
            </div>
          ) : (
            <div
              className={`${styles.type} sm:columns-2 sm:gap-5 text-xs sm:text-[13px] leading-relaxed text-[#1d2742]/95 text-justify`}
              style={{ columnRule: "1px solid rgba(29,39,66,0.22)" }}
            >
              {story}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
