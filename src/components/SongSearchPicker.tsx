"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Search,
  X,
  Play,
  Pause,
  Check,
  Music,
  Disc3,
  Loader2,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Headphones,
} from "lucide-react";
import { uploadAudio } from "@/src/lib/supabase";

/* ── Types ─────────────────────────────────────────────────────── */
export interface DeezerTrack {
  id: string;
  title: string;
  artist: string;
  artistThumb: string;
  album: string;
  albumArt: string;       // 250×250
  albumArtSmall: string;  // 56×56
  duration: number;       // seconds
  previewUrl: string;     // 30-second MP3
}

export interface CuratedTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  mood: string;
  duration: string;
}

const CURATED_TRACKS: CuratedTrack[] = [
  {
    id: "curated-1",
    title: "Miguel - Sure Thing",
    artist: "Miguel",
    src: "/music/miguel-sure-thing.mp3",
    mood: "Soulful R&B & Tender Romance",
    duration: "3:15",
  },
  {
    id: "curated-2",
    title: "Giveon - For Tonight / Numb",
    artist: "Giveon",
    src: "/music/giveon-numb.mp3",
    mood: "Acoustic Warmth & Deep Feelings",
    duration: "3:40",
  },
  {
    id: "curated-3",
    title: "Mac Miller - Cinderella",
    artist: "Mac Miller",
    src: "/music/macmiller-cinderella.mp3",
    mood: "Sweet Melodic Nostalgia",
    duration: "4:12",
  },
  {
    id: "curated-4",
    title: "Sweet Lo-Fi Romance Melodies",
    artist: "LovePage Studio",
    src: "/music/demo-love-song.wav",
    mood: "Soft Gentle Lo-Fi Ambient",
    duration: "2:30",
  },
];

interface SongSearchPickerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when user selects a track */
  onSelect: (track: { src: string; title: string; albumArt?: string }) => void;
  /** Currently active song src, to show "selected" indicator */
  currentSongSrc?: string;
  /** Callback to directly open the audio trimmer */
  onOpenTrimmer?: () => void;
}

/* ── Helpers ───────────────────────────────────────────────────── */
function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type TabType = "search" | "upload" | "curated";

/* ── Component ─────────────────────────────────────────────────── */
export default function SongSearchPicker({
  isOpen,
  onClose,
  onSelect,
  currentSongSrc,
  onOpenTrimmer,
}: SongSearchPickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("search");

  // Search tab state
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DeezerTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload tab state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedTrack, setUploadedTrack] = useState<{
    src: string;
    title: string;
  } | null>(null);

  // Custom URL state
  const [customUrl, setCustomUrl] = useState("");
  const [customTitle, setCustomTitle] = useState("");

  // Preview state
  const [previewingSrc, setPreviewingSrc] = useState<string | null>(null);
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "search") {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      setSelectedSrc(currentSongSrc || null);
    } else {
      // Stop preview when modal closes
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      setPreviewingSrc(null);
    }
  }, [isOpen, activeTab, currentSongSrc]);

  // Search with debounce
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/music/search?q=${encodeURIComponent(q.trim())}`
      );
      const json = await res.json();

      if (!json.success) {
        setError(json.error || "Search failed");
        setResults([]);
      } else {
        setResults(json.tracks ?? []);
        if ((json.tracks ?? []).length === 0) {
          setError("No results found. Try a different search term.");
        }
      }
    } catch {
      setError("Network error — check your connection");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 400);
  };

  // Preview audio toggle
  const togglePreview = (src: string) => {
    if (!audioRef.current) return;

    if (previewingSrc === src) {
      audioRef.current.pause();
      setPreviewingSrc(null);
    } else {
      audioRef.current.src = src;
      audioRef.current
        .play()
        .then(() => setPreviewingSrc(src))
        .catch(() => setPreviewingSrc(null));
    }
  };

  // Track selection
  const handleSelect = (track: {
    src: string;
    title: string;
    albumArt?: string;
  }) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPreviewingSrc(null);
    setSelectedSrc(track.src);

    onSelect(track);

    // Close modal after brief feedback
    setTimeout(() => onClose(), 400);
  };

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
      const publicUrl = await uploadAudio(file);

      const newTrack = {
        src: publicUrl,
        title: cleanTitle,
      };

      setUploadedTrack(newTrack);
      handleSelect(newTrack);
    } catch (err) {
      console.error("Audio upload error:", err);
      setUploadError("Failed to upload audio file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle custom URL submit
  const handleCustomUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const title = customTitle.trim() || "Custom Audio Track";
    handleSelect({
      src: customUrl.trim(),
      title,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-2.5 xs:p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-lg bg-[#faf7ef] rounded-2xl shadow-2xl border border-[#dfd4c5] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 max-h-[90dvh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 xs:px-5 pt-4 xs:pt-5 pb-3 border-b border-[#dfd4c5] bg-[#f4eee1]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#cf493e] shadow-md shrink-0">
                  <Music className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-typewriter text-xs font-bold tracking-wider text-[#3d332a] uppercase">
                    Audio Studio
                  </h3>
                  <p className="text-[10px] text-[#8a7b6c]">
                    Pick full songs, search, or upload your own
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

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#e8decb]/70">
              <button
                type="button"
                onClick={() => setActiveTab("search")}
                className={`flex-1 py-1.5 px-2 xs:px-3 rounded-lg text-[11px] xs:text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
                  activeTab === "search"
                    ? "bg-white text-[#cf493e] shadow-xs"
                    : "text-[#6e5e50] hover:text-[#3d332a]"
                }`}
              >
                <Search className="h-3.5 w-3.5 shrink-0" />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-1.5 px-2 xs:px-3 rounded-lg text-[11px] xs:text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
                  activeTab === "upload"
                    ? "bg-white text-[#cf493e] shadow-xs"
                    : "text-[#6e5e50] hover:text-[#3d332a]"
                }`}
              >
                <Upload className="h-3.5 w-3.5 shrink-0" />
                <span>Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("curated")}
                className={`flex-1 py-1.5 px-2 xs:px-3 rounded-lg text-[11px] xs:text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1 sm:gap-1.5 ${
                  activeTab === "curated"
                    ? "bg-white text-[#cf493e] shadow-xs"
                    : "text-[#6e5e50] hover:text-[#3d332a]"
                }`}
              >
                <Headphones className="h-3.5 w-3.5 shrink-0" />
                <span>Library</span>
              </button>
            </div>
          </div>

          {/* Body Content by Tab */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* ── TAB 1: SEARCH (DEEZER) ────────────────────────── */}
            {activeTab === "search" && (
              <div className="p-3.5 sm:p-4 space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a99a8a]" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Search any song, artist, or album..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#d8ccb9] bg-white text-base sm:text-sm text-[#3d332a] placeholder:text-[#b8ab9a] focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 font-handwriting"
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#cf493e] animate-spin" />
                  )}
                </div>

                {/* Empty State */}
                {!query && results.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                    <Disc3 className="h-14 w-14 text-[#d8ccb9] animate-[spin_8s_linear_infinite] mb-3" />
                    <p className="font-typewriter text-xs font-bold uppercase tracking-wider text-[#7e6d5e] mb-1">
                      Search Millions of Songs
                    </p>
                    <p className="font-handwriting text-sm text-[#a99a8a]">
                      Type any track name, artist, or romantic melody
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-[#cf493e] bg-[#cf493e]/10">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="font-handwriting">{error}</span>
                  </div>
                )}

                {/* Track Results */}
                {results.length > 0 && (
                  <ul className="divide-y divide-[#e8decb] rounded-xl border border-[#e8decb] overflow-hidden bg-white/70">
                    {results.map((track) => {
                      const isCurrent = (selectedSrc || currentSongSrc) === track.previewUrl;
                      const isPreviewing = previewingSrc === track.previewUrl;

                      return (
                        <li
                          key={track.id}
                          className={`group relative flex items-center gap-3 px-3.5 py-3 transition-all hover:bg-[#f0e9dc] cursor-pointer ${
                            isCurrent ? "bg-[#cf493e]/5 border-l-2 border-[#cf493e]" : ""
                          }`}
                          onClick={() =>
                            handleSelect({
                              src: track.previewUrl,
                              title: `${track.artist} - ${track.title}`,
                              albumArt: track.albumArt,
                            })
                          }
                        >
                          {/* Album Art + Play overlay */}
                          <div className="relative shrink-0">
                            <img
                              src={track.albumArtSmall || track.albumArt}
                              alt={track.album}
                              className="h-12 w-12 rounded-lg object-cover shadow-xs border border-[#e4d6c4]"
                              loading="lazy"
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePreview(track.previewUrl);
                              }}
                              className={`absolute inset-0 flex items-center justify-center rounded-lg transition-all ${
                                isPreviewing
                                  ? "bg-black/50"
                                  : "bg-black/0 group-hover:bg-black/35"
                              }`}
                              title={isPreviewing ? "Stop preview" : "Preview 30s"}
                            >
                              {isPreviewing ? (
                                <Pause className="h-5 w-5 text-white" />
                              ) : (
                                <Play className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 translate-x-0.5" />
                              )}
                            </button>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-typewriter text-xs font-bold text-[#3d332a] truncate uppercase">
                              {track.title}
                            </p>
                            <p className="font-handwriting text-sm text-[#7e6d5e] truncate">
                              {track.artist}
                            </p>
                            <p className="text-[10px] text-[#b8ab9a] truncate">
                              {track.album} · {formatDuration(track.duration)}
                            </p>
                          </div>

                          {/* Selected Checkmark */}
                          {isCurrent && (
                            <div className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#cf493e] text-white shadow-xs">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* ── TAB 2: UPLOAD FULL MP3 ────────────────────────── */}
            {activeTab === "upload" && (
              <div className="p-5 space-y-5">
                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#cbbeaa] hover:border-[#cf493e] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/60 hover:bg-white group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#cf493e]/10 group-hover:bg-[#cf493e] transition-colors mb-3">
                    <Upload className="h-6 w-6 text-[#cf493e] group-hover:text-white transition-colors" />
                  </div>

                  <p className="font-typewriter text-xs font-bold text-[#3d332a] uppercase tracking-wide mb-1">
                    Upload Your Own Song (Full MP3)
                  </p>
                  <p className="font-handwriting text-sm text-[#7e6d5e] mb-2">
                    Upload any full love song from your device (.mp3, .m4a, .wav)
                  </p>
                  <span className="text-[11px] text-[#a99a8a] bg-[#f4eee1] px-3 py-1 rounded-full border border-[#e4d6c4]">
                    Tap to browse files
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {isUploading && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-300 flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    <span>Uploading audio to cloud…</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Uploaded track preview */}
                {uploadedTrack && (
                  <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        ✅ Uploaded Successfully
                      </span>
                      <p className="font-typewriter text-xs font-bold text-[#3d332a] truncate">
                        {uploadedTrack.title}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePreview(uploadedTrack.src)}
                      className="p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 ml-2 shadow-xs"
                      title={previewingSrc === uploadedTrack.src ? "Pause" : "Play"}
                    >
                      {previewingSrc === uploadedTrack.src ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4 translate-x-0.5" />
                      )}
                    </button>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-[#f4eee1] border border-[#dfd4c5] text-xs text-[#6e5e50] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#3d332a]">
                    <Sparkles className="h-3.5 w-3.5 text-[#cf493e]" />
                    <span>Full Song Tip</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Uploading your own audio file lets the page play the complete song. You can then use the <strong>Audio Trimmer</strong> to choose the exact chorus!
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB 3: CURATED FULL TRACKS & URL ───────────────── */}
            {activeTab === "curated" && (
              <div className="p-5 space-y-5">
                <div className="space-y-2">
                  <h4 className="font-typewriter text-xs font-bold uppercase tracking-wider text-[#7e6d5e]">
                    Full Curated Love Songs
                  </h4>
                  <p className="text-[11px] text-[#8a7b6c]">
                    Pre-installed full tracks ready to play and trim
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {CURATED_TRACKS.map((track) => {
                    const isSelected = (selectedSrc || currentSongSrc) === track.src;
                    const isPreviewing = previewingSrc === track.src;

                    return (
                      <div
                        key={track.id}
                        onClick={() =>
                          handleSelect({
                            src: track.src,
                            title: track.title,
                          })
                        }
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#cf493e] bg-white ring-2 ring-[#cf493e]/20 shadow-xs"
                            : "border-[#d8ccb9] bg-white/70 hover:bg-white hover:border-[#cbbeaa]"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-typewriter text-xs font-bold text-[#3d332a] uppercase truncate">
                            {track.title}
                          </p>
                          <p className="font-handwriting text-xs text-[#7e6d5e] truncate">
                            {track.mood} · {track.duration}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Preview button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePreview(track.src);
                            }}
                            className="p-2 rounded-full bg-[#f4eee1] hover:bg-[#e8decb] text-[#5e5145] transition-colors"
                            title={isPreviewing ? "Pause" : "Preview"}
                          >
                            {isPreviewing ? (
                              <Pause className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5 translate-x-0.5" />
                            )}
                          </button>

                          {/* Selected check */}
                          {isSelected && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#cf493e] text-white shadow-xs">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Audio URL input */}
                <form
                  onSubmit={handleCustomUrlSubmit}
                  className="pt-3 border-t border-[#dfd4c5] space-y-2.5"
                >
                  <label className="block text-xs font-bold text-[#3d332a] flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5 text-[#cf493e]" />
                    <span>Paste Direct Audio URL</span>
                  </label>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/my-song.mp3"
                    className="w-full px-3 py-2 rounded-xl border border-[#d8ccb9] bg-white text-xs font-mono text-[#3d332a] focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Song Title (optional)"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[#d8ccb9] bg-white text-xs text-[#3d332a] focus:outline-none focus:ring-2 focus:ring-[#cf493e]/40 font-typewriter"
                    />
                    <button
                      type="submit"
                      disabled={!customUrl.trim()}
                      className="px-4 py-1.5 rounded-xl bg-[#cf493e] hover:bg-[#b83b31] text-white text-xs font-bold disabled:opacity-50 transition-all"
                    >
                      Use URL
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer with Cut Best Part shortcut */}
          <div className="px-5 py-3 border-t border-[#dfd4c5] bg-[#f4eee1] flex items-center justify-between">
            <span className="text-[11px] text-[#7e6d5e] font-handwriting">
              💡 Selected song can be trimmed to your favorite chorus
            </span>
            {onOpenTrimmer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTrimmer();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#d8ccb9] hover:border-[#cf493e] text-[#cf493e] text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
              >
                <span>✂️ Trim Chorus</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden audio element for previews */}
      <audio
        ref={audioRef}
        onEnded={() => setPreviewingSrc(null)}
        onError={() => setPreviewingSrc(null)}
      />
    </>
  );
}
