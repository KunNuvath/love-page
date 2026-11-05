"use client";

import React, { useState } from "react";
import {
  Heart,
  Sparkles,
  Flame,
  MessageSquare,
  Share2,
  Users,
  QrCode,
  Volume2,
  VolumeX,
} from "lucide-react";
import { ReactionCounts } from "@/src/lib/api";

interface Props {
  viewerCount: number;
  reactions: ReactionCounts;
  onReact: (emojiKey: string, emojiSymbol: string) => void;
  onOpenGuestbook: () => void;
  onOpenShare: () => void;
  guestbookCount?: number;
  theme?: "light" | "cutting-mat";
}

const REACTION_CONFIG = [
  { key: "heart", symbol: "💖", label: "Love", icon: Heart, color: "text-rose-500 hover:bg-rose-50" },
  { key: "sparkle", symbol: "✨", label: "Sparkle", icon: Sparkles, color: "text-amber-500 hover:bg-amber-50" },
  { key: "kiss", symbol: "💋", label: "Kiss", custom: "💋", color: "text-pink-500 hover:bg-pink-50" },
  { key: "fire", symbol: "🔥", label: "Passionate", icon: Flame, color: "text-orange-500 hover:bg-orange-50" },
  { key: "cupcake", symbol: "🧁", label: "Sweet", custom: "🧁", color: "text-purple-500 hover:bg-purple-50" },
];

export default function RealtimeLiveBar({
  viewerCount,
  reactions,
  onReact,
  onOpenGuestbook,
  onOpenShare,
  guestbookCount = 0,
  theme = "light",
}: Props) {
  const [activeBounce, setActiveBounce] = useState<string | null>(null);

  const handleReactionClick = (key: string, symbol: string) => {
    setActiveBounce(key);
    setTimeout(() => setActiveBounce(null), 300);
    onReact(key, symbol);
  };

  const isDarkDesk = theme === "cutting-mat";

  return (
    <div
      className={`fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-1.25rem)] max-w-2xl px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all flex items-center justify-between gap-1.5 sm:gap-4 ${
        isDarkDesk
          ? "bg-[#16382e]/92 border-white/20 text-white"
          : "bg-white/94 border-[#e6d8c7] text-[#3d332a]"
      }`}
    >
      {/* Live Presence indicator */}
      <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-black/10 text-[10px] sm:text-xs font-semibold shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="hidden sm:inline">Live</span>
        <span className="font-mono">{viewerCount}</span>
      </div>

      {/* Reaction Buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 no-scrollbar touch-pan-x">
        {REACTION_CONFIG.map((r) => {
          const count = reactions[r.key] || 0;
          const isBouncing = activeBounce === r.key;
          return (
            <button
              key={r.key}
              type="button"
              onClick={() => handleReactionClick(r.key, r.symbol)}
              title={`Send ${r.label}`}
              className={`flex items-center gap-0.5 sm:gap-1 px-1.5 xs:px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-xs font-semibold transition-all active:scale-90 select-none shrink-0 ${
                isDarkDesk
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-neutral-100/90 hover:bg-neutral-200/90 text-neutral-800"
              } ${isBouncing ? "scale-125 !bg-rose-500/20" : ""}`}
            >
              <span className="text-sm sm:text-base leading-none">{r.symbol}</span>
              {count > 0 && (
                <span className="text-[10px] sm:text-xs opacity-80 font-mono">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Guestbook & Share */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onOpenGuestbook}
          title="Open Love Notes & Guestbook"
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 shrink-0 ${
            isDarkDesk
              ? "bg-washi-mustard/30 text-amber-200 hover:bg-washi-mustard/40 border border-amber-300/30"
              : "bg-[#fdf0eb] text-[#cf493e] hover:bg-[#fae4dc] border border-[#f3cfc4]"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Notes</span>
          {guestbookCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#cf493e] text-white text-[10px] font-bold">
              {guestbookCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenShare}
          title="Share & QR Code"
          className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shrink-0 ${
            isDarkDesk
              ? "bg-white/15 hover:bg-white/25 text-white"
              : "bg-neutral-800 hover:bg-neutral-900 text-white"
          }`}
        >
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </div>
  );
}
