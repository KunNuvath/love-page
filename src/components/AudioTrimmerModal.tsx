"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Scissors,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Volume2,
  Clock,
  Sparkles,
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

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioTrimmerModal({
  isOpen,
  onClose,
  song,
  onSaveTrim,
}: AudioTrimmerModalProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPreviewingTrim, setIsPreviewingTrim] = useState<boolean>(false);

  // Trimmer range
  const [startTime, setStartTime] = useState<number>(song.startTime ?? 0);
  const [endTime, setEndTime] = useState<number | undefined>(song.endTime);
  const [hasEndCutoff, setHasEndCutoff] = useState<boolean>(Boolean(song.endTime));

  // Initialize or reset when modal opens or song changes
  useEffect(() => {
    if (isOpen) {
      setStartTime(song.startTime ?? 0);
      setEndTime(song.endTime);
      setHasEndCutoff(Boolean(song.endTime));
      setIsPlaying(false);
      setIsPreviewingTrim(false);
      setCurrentTime(song.startTime ?? 0);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setIsPreviewingTrim(false);
    }
  }, [isOpen, song]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration || 0;
      setDuration(dur);
      if (song.startTime && song.startTime < dur) {
        audioRef.current.currentTime = song.startTime;
        setCurrentTime(song.startTime);
      }
      if (!song.endTime && hasEndCutoff) {
        setEndTime(Math.min(dur, (song.startTime ?? 0) + 30));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const curr = audioRef.current.currentTime;
    setCurrentTime(curr);

    // If previewing the trim, loop within [startTime, effectiveEnd]
    if (isPreviewingTrim) {
      const effectiveEnd = hasEndCutoff && endTime && endTime > startTime ? endTime : duration;
      if (curr >= effectiveEnd) {
        audioRef.current.currentTime = startTime;
      }
    }
  };

  // Toggle regular play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPreviewingTrim(false);
    } else {
      setIsPreviewingTrim(false);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  // Toggle preview trimmed snippet
  const togglePreviewTrim = () => {
    if (!audioRef.current) return;
    if (isPreviewingTrim) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPreviewingTrim(false);
    } else {
      audioRef.current.currentTime = startTime;
      setIsPreviewingTrim(true);
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setIsPreviewingTrim(false);
        });
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    const safeTime = Math.max(0, Math.min(time, duration || 1000));
    audioRef.current.currentTime = safeTime;
    setCurrentTime(safeTime);
  };

  // Button actions: "Set to Current Time"
  const setStartToCurrent = () => {
    const newStart = Math.floor(currentTime);
    setStartTime(newStart);
    if (hasEndCutoff && endTime && endTime <= newStart) {
      setEndTime(Math.min(duration, newStart + 30));
    }
  };

  const setEndToCurrent = () => {
    const newEnd = Math.ceil(currentTime);
    if (newEnd > startTime) {
      setHasEndCutoff(true);
      setEndTime(newEnd);
    }
  };

  const handleSave = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const finalEnd = hasEndCutoff && endTime && endTime > startTime ? endTime : undefined;
    onSaveTrim(startTime, finalEnd);
    onClose();
  };

  const handleReset = () => {
    setStartTime(0);
    setEndTime(undefined);
    setHasEndCutoff(false);
    seek(0);
  };

  if (!isOpen) return null;

  const effectiveEnd = hasEndCutoff && endTime && endTime > startTime ? endTime : duration;
  const snippetLength = Math.max(0, effectiveEnd - startTime);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-lg bg-[#faf7ef] rounded-2xl shadow-2xl border border-[#dfd4c5] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#dfd4c5] bg-[#f4eee1] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#cf493e] text-white shadow-md">
                <Scissors className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-typewriter text-xs font-bold tracking-wider text-[#3d332a] uppercase">
                  Cut Best Part of Song
                </h3>
                <p className="text-[10px] text-[#7e6d5e]">
                  Pick the exact chorus or romantic moment to play
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#e8decb] text-[#5e5145] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
            {/* Song Info Bar */}
            <div className="p-3 rounded-xl border border-[#d8ccb9] bg-white flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-typewriter text-xs font-bold text-[#3d332a] uppercase truncate">
                  {song.title || "Selected Song"}
                </p>
                <p className="font-mono text-[11px] text-[#7e6d5e]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>

              {/* Play / Pause toggle */}
              <button
                onClick={togglePlay}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#cf493e] text-white shadow-md hover:bg-[#b83b31] transition-all transform active:scale-95 ml-3"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying && !isPreviewingTrim ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 translate-x-0.5" />
                )}
              </button>
            </div>

            {/* Timeline Slider with visual markers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#7e6d5e]">
                <span>Timeline Scrubber</span>
                <span className="font-bold text-[#cf493e]">
                  Playing: {formatTime(currentTime)}
                </span>
              </div>

              {/* Progress Slider */}
              <div className="relative py-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.5}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full accent-[#cf493e] h-2 bg-[#e4d6c4] rounded-lg cursor-pointer"
                />

                {/* Markers for Start & End on timeline */}
                {duration > 0 && (
                  <>
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-5 bg-emerald-600 rounded pointer-events-none shadow"
                      style={{ left: `${(startTime / duration) * 100}%` }}
                      title={`Start: ${formatTime(startTime)}`}
                    />
                    {hasEndCutoff && endTime && (
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-1.5 h-5 bg-rose-600 rounded pointer-events-none shadow"
                        style={{ left: `${(endTime / duration) * 100}%` }}
                        title={`End: ${formatTime(endTime)}`}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Live "Set to Now" Fast Catch Controls */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-300/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Listen &amp; Capture Chorus:</span>
              </div>
              <p className="text-[11px] text-[#6e5e50]">
                Hit play above. When your favorite romantic part or chorus starts playing, tap <strong>&quot;Set Start to Now&quot;</strong>!
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={setStartToCurrent}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Set Start ({formatTime(currentTime)})</span>
                </button>

                <button
                  type="button"
                  onClick={setEndToCurrent}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Set End ({formatTime(currentTime)})</span>
                </button>
              </div>
            </div>

            {/* Start Time Section */}
            <div className="p-3.5 rounded-xl border border-[#d8ccb9] bg-white space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Start Time:</span>
                </label>
                <span className="font-mono text-xs font-bold text-[#3d332a] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {formatTime(startTime)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, (duration || 100) - 1)}
                  step={1}
                  value={startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setStartTime(val);
                    seek(val);
                  }}
                  className="flex-1 accent-emerald-600 h-1.5 bg-[#e4d6c4] rounded cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = Math.max(0, startTime - 1);
                    setStartTime(val);
                    seek(val);
                  }}
                  className="px-2 py-0.5 text-xs rounded border border-[#d8ccb9] bg-[#f4eee1] hover:bg-[#e8decb]"
                >
                  -1s
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const val = Math.min((duration || 100) - 1, startTime + 1);
                    setStartTime(val);
                    seek(val);
                  }}
                  className="px-2 py-0.5 text-xs rounded border border-[#d8ccb9] bg-[#f4eee1] hover:bg-[#e8decb]"
                >
                  +1s
                </button>
              </div>
            </div>

            {/* End Time Section */}
            <div className="p-3.5 rounded-xl border border-[#d8ccb9] bg-white space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>End Time:</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-[#7e6d5e] flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!hasEndCutoff}
                      onChange={(e) => {
                        const playToEnd = e.target.checked;
                        setHasEndCutoff(!playToEnd);
                        if (!playToEnd) {
                          setEndTime(Math.min(duration, startTime + 30));
                        }
                      }}
                      className="rounded accent-[#cf493e]"
                    />
                    <span>Play to End of Song</span>
                  </label>
                  {hasEndCutoff && (
                    <span className="font-mono text-xs font-bold text-[#3d332a] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {formatTime(effectiveEnd)}
                    </span>
                  )}
                </div>
              </div>

              {hasEndCutoff && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="range"
                    min={startTime + 1}
                    max={duration || 100}
                    step={1}
                    value={endTime || duration}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setEndTime(val);
                      seek(val);
                    }}
                    className="flex-1 accent-rose-600 h-1.5 bg-[#e4d6c4] rounded cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = Math.max(startTime + 1, (endTime || duration) - 1);
                      setEndTime(val);
                      seek(val);
                    }}
                    className="px-2 py-0.5 text-xs rounded border border-[#d8ccb9] bg-[#f4eee1] hover:bg-[#e8decb]"
                  >
                    -1s
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const val = Math.min(duration || 100, (endTime || duration) + 1);
                      setEndTime(val);
                      seek(val);
                    }}
                    className="px-2 py-0.5 text-xs rounded border border-[#d8ccb9] bg-[#f4eee1] hover:bg-[#e8decb]"
                  >
                    +1s
                  </button>
                </div>
              )}
            </div>

            {/* Summary Badge & Preview Trim Button */}
            <div className="p-3 rounded-xl bg-white border border-[#dfd4c5] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left w-full sm:w-auto">
                <span className="text-[10px] uppercase font-bold text-[#7e6d5e] tracking-wider block">
                  Trimmed Snippet:
                </span>
                <span className="font-mono text-xs font-bold text-[#3d332a]">
                  {formatTime(startTime)} → {hasEndCutoff ? formatTime(effectiveEnd) : "End"} ({formatTime(snippetLength)})
                </span>
              </div>

              {/* Preview trimmed snippet */}
              <button
                type="button"
                onClick={togglePreviewTrim}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  isPreviewingTrim
                    ? "bg-amber-600 text-white animate-pulse"
                    : "bg-[#5f6e5c] hover:bg-[#4d5c4a] text-white active:scale-95"
                }`}
              >
                {isPreviewingTrim ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Stop Preview</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Preview Best Part (Loop)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[#dfd4c5] bg-[#f4eee1] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#6e5e50] hover:bg-[#e8decb] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Full Song</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#cf493e] hover:bg-[#b83b31] text-white text-xs font-bold tracking-wider uppercase shadow-md transition-all active:scale-98"
            >
              <Check className="h-4 w-4" />
              <span>Save &amp; Apply Cut</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audio element for loading metadata and previewing */}
      <audio
        ref={audioRef}
        src={song.src}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setIsPreviewingTrim(false);
        }}
      />
    </>
  );
}
