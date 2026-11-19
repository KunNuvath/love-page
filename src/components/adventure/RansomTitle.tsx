"use client";

import React, { useState } from "react";
import { Pencil, Check } from "lucide-react";
import styles from "./adventure.module.css";
import { hashRange } from "./shapes";
import { LIMITS } from "@/src/lib/adventure";

const CHIP_PALETTE = [
  { bg: "#fbf6ea", fg: "#1d2742" }, // off-white paper
  { bg: "#f7d56a", fg: "#1d2742" }, // butter yellow
  { bg: "#e5533d", fg: "#fbf6ea" }, // tomato red
  { bg: "#a6d9c0", fg: "#1d2742" }, // mint
  { bg: "#9cc9ee", fg: "#1d2742" }, // sky blue
];

interface RansomTitleProps {
  title: string;
  ownerName: string;
  editable?: boolean;
  onTitleChange?: (newTitle: string) => void;
  onOwnerNameChange?: (newName: string) => void;
}

export default function RansomTitle({
  title,
  ownerName,
  editable = false,
  onTitleChange,
  onOwnerNameChange,
}: RansomTitleProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  const words = (title || "Our Little Adventure").split(" ");
  let globalCharIndex = 0;

  const commitTitle = () => {
    const cleaned = draftTitle.trim().slice(0, LIMITS.title) || "Our Little Adventure";
    setDraftTitle(cleaned);
    onTitleChange?.(cleaned);
    setIsEditingTitle(false);
  };

  return (
    <header className="relative z-10 text-center pt-4 sm:pt-6 pb-4 sm:pb-6 px-2">
      {/* Ransom-Note Cutout Letter Chips */}
      {isEditingTitle && editable ? (
        <div className="inline-flex items-center gap-2 bg-[#fbf6ea] p-2 rounded-xl border-2 border-[#1d2742] shadow-[4px_4px_0_#1d2742] w-full max-w-md mx-auto">
          <input
            type="text"
            value={draftTitle}
            maxLength={LIMITS.title}
            autoFocus
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setDraftTitle(title);
                setIsEditingTitle(false);
              }
            }}
            onBlur={commitTitle}
            aria-label="Edit scrapbook title"
            className={`${styles.hand} flex-1 min-w-0 text-xl xs:text-2xl sm:text-4xl text-[#1d2742] bg-transparent px-2 py-0.5 focus:outline-none text-center`}
          />
          <button
            type="button"
            onClick={commitTitle}
            className="p-2 rounded-lg bg-[#a6d9c0] text-[#1d2742] border-2 border-[#1d2742] hover:bg-[#f7d56a] cursor-pointer shrink-0"
            aria-label="Save title"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="inline-flex flex-col items-center gap-2">
          <h1
            onClick={() => {
              if (!editable) return;
              setDraftTitle(title);
              setIsEditingTitle(true);
            }}
            className={`flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-5 gap-y-2.5 select-none ${
              editable ? "cursor-pointer group" : ""
            }`}
            title={editable ? "Click to edit title" : undefined}
          >
            {words.map((word, wIdx) => (
              <span key={wIdx} className="inline-flex items-center gap-1 sm:gap-1.5">
                {word.split("").map((ch) => {
                  const idx = globalCharIndex++;
                  const palette = CHIP_PALETTE[idx % CHIP_PALETTE.length];
                  const deg = hashRange(idx + 11, -6, 6);
                  const useTypewriter = idx % 3 === 1;
                  const isUpper = idx % 4 !== 2;

                  return (
                    <span
                      key={idx}
                      style={
                        {
                          "--rot": `${deg}deg`,
                          backgroundColor: palette.bg,
                          color: palette.fg,
                        } as React.CSSProperties
                      }
                      className={`${styles.chip} ${
                        useTypewriter ? styles.type : styles.hand
                      } text-2xl xs:text-3xl sm:text-5xl md:text-[3.35rem] font-bold rounded-[4px] transition-transform group-hover:scale-105`}
                    >
                      {isUpper ? ch.toUpperCase() : ch}
                    </span>
                  );
                })}
              </span>
            ))}

            {editable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDraftTitle(title);
                  setIsEditingTitle(true);
                }}
                aria-label="Edit scrapbook title"
                className={`${styles.focusable} ml-1 p-1.5 rounded-full bg-[#fbf6ea] text-[#1d2742] border-2 border-[#1d2742] shadow-[2px_2px_0_#1d2742] hover:bg-[#f7d56a] transition-colors cursor-pointer`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </h1>
        </div>
      )}

      {/* Handwritten Subtitle: "a book of us, glued in by [owner name]" */}
      <div className="mt-4 sm:mt-5 flex justify-center">
        <p
          style={{ transform: "rotate(-1.4deg)" }}
          className={`${styles.hand} inline-block text-xl sm:text-2xl md:text-3xl text-[#1d2742] leading-snug`}
        >
          <span>a book of </span>
          <span className={`${styles.highlight} font-bold`}>us</span>
          <span>, glued in by </span>
          {editable ? (
            <span
              role="textbox"
              aria-label="Owner name"
              tabIndex={0}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const next =
                  e.currentTarget.innerText.replace(/\s+/g, " ").trim().slice(0, LIMITS.ownerName) ||
                  "you";
                e.currentTarget.innerText = next;
                onOwnerNameChange?.(next);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).blur();
                }
              }}
              className={`${styles.caption} ${styles.captionEditable} font-bold text-[#e5533d]`}
            >
              {ownerName}
            </span>
          ) : (
            <span className="font-bold text-[#e5533d] underline decoration-wavy decoration-[#e5533d]/60">
              {ownerName}
            </span>
          )}
        </p>
      </div>
    </header>
  );
}
