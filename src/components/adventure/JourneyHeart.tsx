"use client";

import React, { useEffect, useRef } from "react";
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
  const heartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const pathEl = pathRef.current;
    const heartEl = heartRef.current;
    if (!pathEl || !heartEl) return;

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
      let hostW = 1000;
      let hostH = 1800;

      if (host) {
        const rect = host.getBoundingClientRect();
        hostW = rect.width || 1000;
        hostH = rect.height || 1800;
        const winH = window.innerHeight || 800;
        const centerOffset = winH * 0.55 - rect.top;
        progress = Math.max(0, Math.min(1, centerOffset / Math.max(1, hostH)));
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
      const rawAngle = (Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI - 90;
      const angle = Math.max(-28, Math.min(28, rawAngle * 0.25));

      const xPx = (pt.x / VIEW_W) * hostW;
      const yPx = (pt.y / VIEW_H) * hostH;

      // Pure GPU-composited transform — zero React re-renders or layout thrash on scroll
      heartEl.style.transform = `translate3d(${xPx.toFixed(1)}px, ${yPx.toFixed(1)}px, 0) translate(-50%, -50%) rotate(${angle.toFixed(1)}deg)`;
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

      {/* Traveling Red Heart Sticker (GPU-composited via translate3d) */}
      <div
        ref={heartRef}
        style={{
          left: 0,
          top: 0,
          transform: "translate3d(500px, 72px, 0) translate(-50%, -50%)",
        }}
        className={`${styles.journeyHeart} absolute z-10`}
      >
        <Sticker name="heart" size={42} rotate={0} />
      </div>
    </div>
  );
}
