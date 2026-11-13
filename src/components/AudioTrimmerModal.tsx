"use client";

import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import {
  Scissors,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Music2,
} from "lucide-react";

interface AudioTrimmerModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: {
    src: string;
    title: string;
    startTime?: number;
    endTime?: number;
  };
  onSaveTrim: (startTime: number, endTime?: number) => void;
}

const CLIP_DURATION = 30; // seconds — fixed window size (like Instagram/FB Stories)
const BAR_HEIGHT = 56; // px — height of waveform bars
const MIN_BAR_WIDTH = 320; // px — minimum rendered waveform width

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Deterministic pseudo-random waveform bar heights seeded from song title */
function buildWaveformBars(count: number, seed: string): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return Array.from({ length: count }, (_, i) => {
    h = (Math.imul(1664525, h) + 1013904223) | 0;
    const base = ((h >>> 0) % 70) + 15; // 15–84%
    const ripple = Math.sin((i / count) * Math.PI * 6) * 12;
    return Math.min(100, Math.max(10, base + ripple));
  });
}

export default function AudioTrimmerModal({
  isOpen,
  onClose,
  song,
  onSaveTrim,
}: AudioTrimmerModalProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [windowStart, setWindowStart] = useState(song.startTime ?? 0);
  const [pxPerSec, setPxPerSec] = useState(8);

  const BAR_COUNT = 180;
  const waveform = useRef<number[]>(buildWaveformBars(BAR_COUNT, song.title));

  // ── Reset on open ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setWindowStart(song.startTime ?? 0);
      setIsPlaying(false);
      setCurrentTime(song.startTime ?? 0);
      waveform.current = buildWaveformBars(BAR_COUNT, song.title);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isOpen, song]);

  // ── Compute px/sec scale once duration & container are known ─────────────
  const computeScale = useCallback(() => {
    if (!trackRef.current || !duration) return;
    const containerW = trackRef.current.clientWidth;
    const targetTotalWidth = Math.max(containerW * 2.5, MIN_BAR_WIDTH);
    setPxPerSec(Math.max(6, targetTotalWidth / duration));
  }, [duration]);

  useLayoutEffect(() => { computeScale(); }, [computeScale]);

  // ── Audio events ──────────────────────────────────────────────────────────
  const handleLoadedMetadata = () => {
    const dur = audioRef.current?.duration ?? 0;
    setDuration(dur);
    setWindowStart((ws) => Math.min(ws, Math.max(0, dur - CLIP_DURATION)));
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    setCurrentTime(curr);
    // Loop within the 30-second window
    const winEnd = Math.min(windowStart + CLIP_DURATION, duration || 9999);
    if (curr >= winEnd) {
      audioRef.current.currentTime = windowStart;
    }
  };

  // ── Play / Pause ──────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = windowStart;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [isPlaying, windowStart]);

  // Seek audio when window moves while playing
  const prevWindowStart = useRef(windowStart);
  useEffect(() => {
    if (prevWindowStart.current !== windowStart) {
      prevWindowStart.current = windowStart;
      if (audioRef.current && isPlaying) {
        audioRef.current.currentTime = windowStart;
      }
    }
  }, [windowStart, isPlaying]);

  // Sync scroll position to windowStart
  useEffect(() => {
    if (!trackRef.current || !duration) return;
    trackRef.current.scrollLeft = windowStart * pxPerSec;
  }, [windowStart, pxPerSec, duration]);

  // ── Drag-to-scroll ────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!trackRef.current) return;
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScroll.current = trackRef.current.scrollLeft;
    trackRef.current.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current || !trackRef.current || !duration) return;
      const dx = dragStartX.current - e.clientX;
      const newScroll = Math.max(0, dragStartScroll.current + dx);
      trackRef.current.scrollLeft = newScroll;
      setWindowStart(
        Math.max(0, Math.min(newScroll / pxPerSec, duration - CLIP_DURATION))
      );
    },
    [duration, pxPerSec]
  );

  const onPointerUp = useCallback(() => { isDragging.current = false; }, []);

  // ── Save & Reset ──────────────────────────────────────────────────────────
  const handleSave = () => {
    audioRef.current?.pause();
    const start = Math.round(windowStart);
    const end = Math.min(Math.round(windowStart + CLIP_DURATION), Math.floor(duration));
    onSaveTrim(start, duration > 0 && end < duration ? end : undefined);
    onClose();
  };

  const handleReset = () => {
    setWindowStart(0);
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  // ── Derived display values ────────────────────────────────────────────────
  const totalWidth = Math.max(MIN_BAR_WIDTH, duration * pxPerSec);
  const windowPx = CLIP_DURATION * pxPerSec;
  const windowLeftPx = windowStart * pxPerSec;
  const windowEndTime = Math.min(windowStart + CLIP_DURATION, duration);
  const barWidth = Math.max(2, (totalWidth / BAR_COUNT) - 1);

  // Playhead offset within the visible window
  const playheadOffsetPx =
    duration > 0 && currentTime >= windowStart && currentTime <= windowStart + CLIP_DURATION
      ? ((currentTime - windowStart) / CLIP_DURATION) * windowPx
      : -99; // hide if out of range

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[71] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full sm:max-w-md bg-[#111118] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#cf493e] to-[#e8795e] text-white shrink-0">
                <Scissors className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Choose Best Part</h3>
                <p className="text-[10px] text-white/40">Scroll to pick your 30-second clip</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Song + Play control ──────────────────────────────────────── */}
          <div className="px-5 pb-4 flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#cf493e] to-[#e8795e] text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 translate-x-0.5" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{song.title || "Selected Song"}</p>
              <p className="text-[11px] font-mono text-white/40 mt-0.5">
                {isPlaying ? (
                  <>
                    <span className="text-[#e8795e]">{formatTime(currentTime)}</span>
                    {" "}<span className="text-white/20">playing</span>
                  </>
                ) : (
                  <>Total: {formatTime(duration)}</>
                )}
              </p>
            </div>
          </div>

          {/* ── Instagram-style waveform scrubber ───────────────────────── */}
          <div className="px-5 pb-2">
            <div
              className="relative rounded-2xl overflow-hidden bg-[#0a0a12] border border-white/8"
              style={{ height: BAR_HEIGHT + 32 }}
            >
              {/* Scrollable waveform track */}
              <div
                ref={trackRef}
                className="overflow-x-scroll overflow-y-hidden h-full cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: "none" }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
              >
                {/* Waveform bars */}
                <div
                  className="relative flex items-end pb-7 gap-px"
                  style={{ width: totalWidth, height: BAR_HEIGHT + 32, paddingTop: 10 }}
                >
                  {waveform.current.map((h, i) => {
                    const barLeft = (i / BAR_COUNT) * totalWidth;
                    const inWindow = barLeft >= windowLeftPx && barLeft < windowLeftPx + windowPx;
                    const played = inWindow && barLeft < windowLeftPx + playheadOffsetPx;
                    return (
                      <div
                        key={i}
                        className="rounded-sm flex-shrink-0"
                        style={{
                          width: barWidth,
                          height: `${h}%`,
                          backgroundColor: played
                            ? "#cf493e"
                            : inWindow
                            ? "#c8614d"
                            : "rgba(255,255,255,0.10)",
                          transition: "background-color 0.05s",
                        }}
                      />
                    );
                  })}

                  {/* Playhead */}
                  {isPlaying && playheadOffsetPx >= 0 && (
                    <div
                      className="absolute top-2 bottom-7 w-[2px] bg-white rounded-full pointer-events-none"
                      style={{ left: windowLeftPx + playheadOffsetPx }}
                    />
                  )}
                </div>
              </div>

              {/* Fade edges */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0a0a12] to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a0a12] to-transparent" />

              {/* Selection window bracket — fixed in center of container */}
              <div className="pointer-events-none absolute inset-x-12 top-0 bottom-7">
                {/* top border */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-white/80 rounded-t" />
                {/* bottom border */}
                <div className="absolute bottom-0 inset-x-0 h-[2px] bg-white/80 rounded-b" />
                {/* left handle */}
                <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-white/90 rounded-l" />
                {/* right handle */}
                <div className="absolute top-0 bottom-0 right-0 w-[3px] bg-white/90 rounded-r" />
              </div>

              {/* Time markers row */}
              <div className="absolute bottom-0 inset-x-0 h-7 flex items-center justify-between px-4">
                <span className="text-[9px] font-mono text-white/25">0:00</span>
                <span className="text-[9px] font-mono text-white/40 font-semibold">
                  {formatTime(windowStart)} → {formatTime(windowEndTime)}
                </span>
                <span className="text-[9px] font-mono text-white/25">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Scroll hint */}
            <p className="mt-2 text-center text-[10px] text-white/30 tracking-wide">
              ← Scroll waveform · 30 sec bracket = your clip →
            </p>
          </div>

          {/* ── Clip info + fine-tune ──────────────────────────────────────── */}
          <div className="mx-5 my-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/8 flex items-center gap-3">
            <Music2 className="h-4 w-4 text-[#e8795e] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-white/35 uppercase tracking-widest font-bold">
                Selected clip
              </p>
              <p className="text-sm font-bold font-mono text-white">
                {formatTime(windowStart)}
                <span className="text-white/35 mx-1.5">→</span>
                {formatTime(windowEndTime)}
              </p>
            </div>
            {/* Nudge buttons */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setWindowStart((ws) => Math.max(0, ws - 5))}
                className="w-9 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 text-[11px] font-bold transition-colors text-center"
              >
                −5s
              </button>
              <button
                type="button"
                onClick={() =>
                  setWindowStart((ws) =>
                    Math.min(Math.max(0, (duration || 9999) - CLIP_DURATION), ws + 5)
                  )
                }
                className="w-9 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 text-[11px] font-bold transition-colors text-center"
              >
                +5s
              </button>
            </div>
          </div>

          {/* ── Footer ────────────────────────────────────────────────────── */}
          <div className="px-5 pb-6 sm:pb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#cf493e] to-[#e8795e] text-white text-sm font-bold shadow-lg hover:opacity-90 active:scale-98 transition-all"
            >
              <Check className="h-4 w-4" />
              <span>Use This Part</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={song.src}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (audioRef.current) audioRef.current.currentTime = windowStart;
        }}
      />
    </>
  );
}
