"use client";

import React from "react";
import { FloatingParticle } from "@/src/lib/realtime";

export default function RealtimeReactionBurst({ particles }: { particles: FloatingParticle[] }) {
  if (!particles.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-10 flex flex-col items-center animate-reaction-float transition-all"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          <span className="filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)] select-none">
            {p.emoji}
          </span>
          {p.senderName && p.senderName !== "Someone" && (
            <span
              className="text-[10px] font-sans font-semibold px-2 py-0.5 mt-1 rounded-full bg-black/60 text-white backdrop-blur-xs whitespace-nowrap shadow-xs"
              style={{ fontSize: "10px" }}
            >
              {p.senderName}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
