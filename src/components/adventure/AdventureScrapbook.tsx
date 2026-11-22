"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  Share2,
  Copy,
  Check,
  Crown,
  Sparkles,
  Loader2,
  ExternalLink,
  Music,
  Play,
  Pause,
  Scissors,
} from "lucide-react";
import { supabase, uploadImage } from "@/src/lib/supabase";
import { useAuth } from "@/src/context/AuthContext";
import { hasTemplateAccess } from "@/src/lib/premium";
import {
  ADVENTURE_TEMPLATE_ID,
  createDefaultAdventure,
  sanitizeAdventure,
  type AdventureScrapbookData,
  type SlotShape,
} from "@/src/lib/adventure";
import SongSearchPicker from "@/src/components/SongSearchPicker";
import AudioTrimmerModal from "@/src/components/AudioTrimmerModal";
import { gochiHand, specialElite } from "./fonts";
import styles from "./adventure.module.css";
import ScrapbookSheet from "./ScrapbookSheet";
import PremiumUnlockModal from "./PremiumUnlockModal";

const STORAGE_KEY = "lovepage_adventure_draft_v1";

// Sample preview photos shown while the premium template is in locked preview mode
const PREVIEW_SAMPLE_PHOTOS: Record<SlotShape, string> = {
  torn: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80",
  circle: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=80",
  ticket: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
  film: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
  arch: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=700&q=80",
  heart: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80",
};

interface AdventureScrapbookProps {
  readOnly?: boolean;
  initialData?: AdventureScrapbookData;
  initialId?: string;
}

export default function AdventureScrapbook({
  readOnly = false,
  initialData,
  initialId,
}: AdventureScrapbookProps) {
  const { user, session, openAuthModal } = useAuth();

  const [data, setData] = useState<AdventureScrapbookData>(
    () => initialData || createDefaultAdventure()
  );
  const [isUnlocked, setIsUnlocked] = useState<boolean>(readOnly);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<SlotShape | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string>(initialId || "");
  const [copiedLink, setCopiedLink] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Soundtrack & 30s Trimmer state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSongPickerOpen, setIsSongPickerOpen] = useState(false);
  const [isTrimmerOpen, setIsTrimmerOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Auto-play soundtrack on first gesture in public share view
  useEffect(() => {
    if (!readOnly) return;
    const handleFirstGesture = async () => {
      if (!audioRef.current || isPlaying) return;
      try {
        const a = audioRef.current;
        await a.play();
        setIsPlaying(true);
        const start = data.song?.startTime || 0;
        if (start > 0 && a.currentTime < start) a.currentTime = start;
      } catch {}
    };
    window.addEventListener("pointerdown", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };
  }, [readOnly, isPlaying, data.song?.startTime]);

  const toggleMusic = useCallback(async () => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    if (isPlaying) {
      a.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await a.play();
      setIsPlaying(true);
      const start = data.song?.startTime || 0;
      if (start > 0 && a.currentTime < start) a.currentTime = start;
    } catch {
      setIsPlaying(false);
    }
  }, [isPlaying, data.song?.startTime]);

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const a = audioRef.current;
    if (data.song?.endTime && a.currentTime >= data.song.endTime) {
      a.currentTime = data.song.startTime || 0;
    }
  };

  // Load saved local draft & premium access status on mount
  useEffect(() => {
    if (readOnly) {
      setIsUnlocked(true);
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData((prev) => ({
          ...prev,
          ...sanitizeAdventure(parsed),
          photos: {
            ...prev.photos,
            ...(parsed?.photos || {}),
          },
        }));
      }
    } catch {}

    setIsUnlocked(hasTemplateAccess(user, ADVENTURE_TEMPLATE_ID));
  }, [readOnly, user]);

  // Automatically confirm unlock when returning from Lemon Squeezy (?paid=1)
  useEffect(() => {
    if (readOnly || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") !== "1") return;

    let cancelled = false;
    const verifyAfterCheckout = async () => {
      showToast("Confirming your payment...");
      for (let attempt = 0; attempt < 5; attempt++) {
        if (cancelled) return;
        const { data: refreshed } = await supabase.auth.refreshSession().catch(() => ({
          data: { user: null },
        }));
        const latestUser = refreshed?.user || user;
        if (hasTemplateAccess(latestUser, ADVENTURE_TEMPLATE_ID)) {
          try {
            localStorage.setItem(`lovepage_unlocked_${ADVENTURE_TEMPLATE_ID}`, "true");
            if (latestUser?.id) {
              localStorage.setItem(
                `lovepage_unlocked_${ADVENTURE_TEMPLATE_ID}_${latestUser.id}`,
                "true"
              );
            }
          } catch {}
          setIsUnlocked(true);
          showToast("🎉 Payment confirmed! Welcome to Our Little Adventure!");
          window.history.replaceState({}, "", "/adventure");
          return;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      showToast("Payment received! Refresh in a moment if your unlock hasn't appeared yet.");
    };

    verifyAfterCheckout();
    return () => {
      cancelled = true;
    };
  }, [readOnly, user, showToast]);

  const persistDraft = useCallback((next: AdventureScrapbookData) => {
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const canEdit = !readOnly && isUnlocked;

  // In locked preview mode, display curated travel sample imagery so the collage looks rich and complete
  const displayData: AdventureScrapbookData =
    !readOnly && !isUnlocked
      ? {
          ...data,
          photos: {
            torn: data.photos.torn || PREVIEW_SAMPLE_PHOTOS.torn,
            circle: data.photos.circle || PREVIEW_SAMPLE_PHOTOS.circle,
            ticket: data.photos.ticket || PREVIEW_SAMPLE_PHOTOS.ticket,
            film: data.photos.film || PREVIEW_SAMPLE_PHOTOS.film,
            arch: data.photos.arch || PREVIEW_SAMPLE_PHOTOS.arch,
            heart: data.photos.heart || PREVIEW_SAMPLE_PHOTOS.heart,
          },
        }
      : data;

  const handlePhotoSelect = async (shape: SlotShape, file: File) => {
    if (!canEdit) return;

    // 1. Instant local object URL so the "glue down" animation plays right away
    const localUrl = URL.createObjectURL(file);
    setData((prev) => ({
      ...prev,
      photos: { ...prev.photos, [shape]: localUrl },
    }));

    // 2. Compress (~1600px max) & upload to storage
    setUploadingSlot(shape);
    try {
      const publicUrl = await uploadImage(file);
      setData((prev) => {
        const next: AdventureScrapbookData = {
          ...prev,
          photos: { ...prev.photos, [shape]: publicUrl },
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
      showToast("Photo glued into your scrapbook!");
    } catch {
      showToast("Kept local photo preview.");
    } finally {
      setUploadingSlot(null);
    }
  };

  const executeSave = async () => {
    setIsSaving(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/adventure", {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok || !json.id) {
        throw new Error(json.error || "Could not save scrapbook.");
      }

      setSavedId(json.id);
      showToast("Scrapbook saved! Copy your share link below.");
    } catch (err: any) {
      showToast(err?.message || "Could not save right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (!isUnlocked) {
      setIsUnlockModalOpen(true);
      return;
    }
    if (uploadingSlot) {
      showToast("Finishing photo upload — one moment!");
      return;
    }
    if (!user) {
      openAuthModal({
        title: "Sign In to Save & Share",
        subtitle: "Sign in so we can create your permanent scrapbook share link.",
        onSuccess: () => executeSave(),
      });
      return;
    }
    executeSave();
  };

  const sharePath = savedId ? `/adventure/${savedId}` : "";
  const fullShareUrl =
    typeof window !== "undefined" && sharePath
      ? `${window.location.origin}${sharePath}`
      : sharePath;

  const handleCopyShareLink = async () => {
    if (!fullShareUrl) return;
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      setCopiedLink(true);
      showToast("Copied share link to clipboard!");
      setTimeout(() => setCopiedLink(false), 2400);
    } catch {}
  };

  const pillBtn =
    "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full backdrop-blur-md text-[11px] xs:text-xs sm:text-sm font-semibold transition-all active:scale-95 shrink-0 cursor-pointer";

  return (
    <div
      className={`${gochiHand.variable} ${specialElite.variable} ${styles.desk} min-h-screen min-h-[100dvh] pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2.25rem,env(safe-area-inset-bottom))] pl-[max(0.875rem,env(safe-area-inset-left))] pr-[max(0.875rem,env(safe-area-inset-right))] sm:py-10 sm:px-6 relative flex flex-col items-center overflow-x-clip selection:bg-[#f7d56a] selection:text-[#1d2742]`}
    >
      {/* Background Couple Soundtrack */}
      <audio
        ref={audioRef}
        src={data.song?.src || "/music/miguel-sure-thing.mp3"}
        loop={!data.song?.endTime}
        preload="metadata"
        playsInline
        onTimeUpdate={handleAudioTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-4 left-4 sm:left-auto sm:right-6 z-50 bg-[#fbf6ea] text-[#1d2742] px-4 py-3 rounded-xl border-2 border-[#1d2742] shadow-[4px_4px_0_#1d2742] flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-bold">
          <Sparkles className="h-4 w-4 text-[#e5533d] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ─── TOP BAR (Clean, matching the other templates) ─── */}
      <div className="relative z-30 w-full max-w-5xl flex flex-wrap items-center justify-between gap-2 mb-5 sm:mb-7">
        <Link
          href="/"
          className={`${pillBtn} bg-white/10 hover:bg-white/20 border border-white/20 text-[#fbf6ea] group`}
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
          <span className="hidden xs:inline">Back</span>
          <span className="hidden sm:inline"> to Home</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* Music Controls: shown once unlocked (or in public read-only view) */}
          {(canEdit || readOnly) && (
            <button
              type="button"
              onClick={toggleMusic}
              className={`${pillBtn} ${
                isPlaying
                  ? "bg-[#a6d9c0] text-[#1d2742] border-2 border-[#1d2742]"
                  : "bg-white/10 hover:bg-white/20 border border-white/20 text-[#fbf6ea]"
              }`}
              title={isPlaying ? "Pause song" : "Play song"}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 shrink-0" /> : <Play className="h-3.5 w-3.5 shrink-0" />}
              <Music className="h-3.5 w-3.5 text-[#f7d56a] shrink-0" />
              <span className="hidden lg:inline max-w-[120px] truncate text-xs">
                {data.song?.title || "Song"}
              </span>
            </button>
          )}

          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => setIsSongPickerOpen(true)}
                className={`${pillBtn} bg-white/10 hover:bg-white/20 border border-white/20 text-[#fbf6ea]`}
              >
                <span>Song</span>
              </button>
              <button
                type="button"
                onClick={() => setIsTrimmerOpen(true)}
                className={`${pillBtn} hidden sm:flex bg-[#f7d56a]/90 hover:bg-[#f7d56a] text-[#1d2742] border border-[#1d2742] font-bold`}
                title="Cut 30-second song clip"
              >
                <Scissors className="h-3.5 w-3.5 shrink-0" />
                <span>Cut 30s</span>
              </button>
            </>
          )}

          <Link
            href="/templates"
            className={`${pillBtn} bg-white/10 hover:bg-white/20 border border-white/20 text-[#fbf6ea]`}
          >
            <Layers className="h-3.5 w-3.5 text-[#f7d56a] shrink-0" />
            <span className="hidden sm:inline">Switch Template</span>
            <span className="sm:hidden">Templates</span>
          </Link>

          {!readOnly && (
            <>
              {canEdit ? (
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={isSaving || Boolean(uploadingSlot)}
                  className={`${pillBtn} bg-[#e5533d] hover:bg-[#cc442f] text-[#fbf6ea] border-2 border-[#1d2742] shadow-[3px_3px_0_#1d2742] disabled:opacity-50`}
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{isSaving ? "Saving..." : "Save & Share"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsUnlockModalOpen(true)}
                  className={`${pillBtn} bg-[#f7d56a] hover:bg-[#f0c84b] text-[#1d2742] border-2 border-[#1d2742] shadow-[3px_3px_0_#1d2742] font-bold`}
                >
                  <Crown className="h-3.5 w-3.5 text-[#e5533d] fill-[#e5533d] shrink-0" />
                  <span>Unlock $4.99</span>
                </button>
              )}
            </>
          )}

          {savedId && (
            <button
              type="button"
              onClick={handleCopyShareLink}
              className={`${pillBtn} bg-[#a6d9c0] hover:bg-[#8ecbb0] text-[#1d2742] border-2 border-[#1d2742] shadow-[3px_3px_0_#1d2742] font-bold`}
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                  <span>Copy share link</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Share Link Banner after saving */}
      {!readOnly && savedId && (
        <div className="relative z-30 w-full max-w-2xl mb-6 p-3.5 sm:p-4 rounded-2xl bg-[#fbf6ea] text-[#1d2742] border-2 border-[#1d2742] shadow-[5px_5px_0_#1d2742] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="min-w-0 text-center sm:text-left">
            <span className={`${styles.type} text-[10px] uppercase tracking-widest text-[#e5533d] font-bold block`}>
              ★ Ready to share ★
            </span>
            <p className="font-mono text-xs sm:text-sm text-[#1d2742] truncate">{fullShareUrl}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-4 py-2 rounded-xl bg-[#f7d56a] hover:bg-[#efc74c] text-[#1d2742] border-2 border-[#1d2742] shadow-[2px_2px_0_#1d2742] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedLink ? "Link Copied" : "Copy share link"}</span>
            </button>
            <Link
              href={sharePath}
              className="p-2 rounded-xl bg-white hover:bg-[#9cc9ee]/30 text-[#1d2742] border-2 border-[#1d2742] shadow-[2px_2px_0_#1d2742]"
              title="Open public page"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ─── THE KRAFT-PAPER SCRAPBOOK SHEET ─── */}
      <ScrapbookSheet
        data={displayData}
        editable={canEdit}
        uploadingSlot={uploadingSlot}
        onTitleChange={(nextTitle) => persistDraft({ ...data, title: nextTitle })}
        onOwnerNameChange={(nextOwner) => persistDraft({ ...data, ownerName: nextOwner })}
        onPhotoSelect={handlePhotoSelect}
        onCaptionChange={(shape, nextCaption) =>
          persistDraft({
            ...data,
            captions: { ...data.captions, [shape]: nextCaption },
          })
        }
        onHeadlineChange={(nextHeadline) =>
          persistDraft({
            ...data,
            news: { ...data.news, headline: nextHeadline },
          })
        }
        onStoryChange={(nextStory) =>
          persistDraft({
            ...data,
            news: { ...data.news, story: nextStory },
          })
        }
      />

      {/* ─── PUBLIC READ-ONLY FOOTER CTA: "Make your own scrapbook" ─── */}
      {readOnly && (
        <div className="relative z-20 mt-10 mb-4 flex flex-col items-center gap-2">
          <Link
            href="/adventure"
            className={`${styles.hand} inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#f7d56a] hover:bg-[#f2ca4b] text-[#1d2742] text-xl sm:text-2xl font-bold border-2 border-[#1d2742] shadow-[4px_4px_0_#1d2742] transition-transform hover:-translate-y-0.5 active:translate-y-0`}
          >
            <Sparkles className="h-5 w-5 text-[#e5533d]" />
            <span>Make your own scrapbook</span>
          </Link>
        </div>
      )}

      {/* Song Picker & 30s Audio Trimmer Modals */}
      <SongSearchPicker
        isOpen={isSongPickerOpen}
        onClose={() => setIsSongPickerOpen(false)}
        currentSongSrc={data.song?.src || "/music/miguel-sure-thing.mp3"}
        onSelect={(track) => {
          persistDraft({
            ...data,
            song: {
              src: track.src,
              title: track.title,
              startTime: undefined,
              endTime: undefined,
            },
          });
          showToast(`🎵 Selected "${track.title}"`);
        }}
        onOpenTrimmer={() => {
          setIsSongPickerOpen(false);
          setIsTrimmerOpen(true);
        }}
      />

      <AudioTrimmerModal
        isOpen={isTrimmerOpen}
        onClose={() => setIsTrimmerOpen(false)}
        song={data.song || { src: "/music/miguel-sure-thing.mp3", title: "Miguel - Sure Thing" }}
        onSaveTrim={(startTime, endTime) => {
          persistDraft({
            ...data,
            song: {
              ...(data.song || { src: "/music/miguel-sure-thing.mp3", title: "Miguel - Sure Thing" }),
              startTime,
              endTime,
            },
          });
          showToast("✂️ Saved 30-second song clip!");
        }}
      />

      {/* Premium Checkout / Unlock Modal */}
      <PremiumUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlocked={() => {
          setIsUnlocked(true);
          setIsUnlockModalOpen(false);
          showToast("Unlocked! Tap any shape to add your photos.");
        }}
      />
    </div>
  );
}
