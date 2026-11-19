"use client";

import React, { useEffect, useRef, useState } from "react";
import Sticker from "./Sticker";
import styles from "./adventure.module.css";

const VIEW_W = 1000;
const VIEW_H = 1800;

const JOURNEY_PATH_D =
  "M 500 60 C 180 240, 840 460, 480 680 C 140 890, 860 1120, 490 1350 C 220 1510, 740 1630, 500 1740";

export default function JourneyHeart({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
}) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [pos, setPos] = useState<{ xPct: number; yPct: number; angle: number }>({
    xPct: 50,
    yPct: 4,
    angle: 0,
  });

  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let totalLen = 0;
    try {
      totalLen = pathEl.getTotalLength();
    } catch {
      return;
    }
    if (!totalLen) return;

    let rafId = 0;
    let ticking = false;

    const updateHeartPosition = () => {
      ticking = false;
      const host = containerRef.current;
      let progress = 0;

      if (host) {
        const rect = host.getBoundingClientRect();
        const winH = window.innerHeight || 800;
        // Map viewport center relative to the sheet from 0..1
        const centerOffset = winH * 0.55 - rect.top;
        progress = Math.max(0, Math.min(1, centerOffset / Math.max(1, rect.height)));
      } else {
        const doc = document.documentElement;
        const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
        progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      }

      if (reducedMotion) {
        progress = 0.05;
      }

      const dist = progress * totalLen;
      const pt = pathEl.getPointAtLength(dist);
      const ahead = pathEl.getPointAtLength(Math.min(totalLen, dist + 6));
      const angle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI - 90;

      setPos({
        xPct: (pt.x / VIEW_W) * 100,
        yPct: (pt.y / VIEW_H) * 100,
        angle: Math.max(-28, Math.min(28, angle * 0.25)),
      });
    };

    const onScrollOrResize = () => {
      if (reducedMotion || ticking) return;
      ticking = true;
      rafId = window.requestAnimationFrame(updateHeartPosition);
    };

    updateHeartPosition();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [containerRef]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <path
          ref={pathRef}
          d={JOURNEY_PATH_D}
          fill="none"
          stroke="#1d2742"
          strokeOpacity="0.32"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="10 14"
        />
      </svg>

      {/* Traveling Red Heart Sticker */}
      <div
        style={{
          left: `${pos.xPct}%`,
          top: `${pos.yPct}%`,
          transform: "translate(-50%, -50%)",
        }}
        className={`${styles.journeyHeart} absolute z-10`}
      >
        <Sticker name="heart" size={42} rotate={pos.angle} />
      </div>
    </div>
  );
}
