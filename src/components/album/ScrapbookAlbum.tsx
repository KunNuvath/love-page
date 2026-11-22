"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Share2,
  Copy,
  Check,
  Crown,
  Sparkles,
  Layers,
  Loader2,
  KeyRound,
  ExternalLink,
} from "lucide-react";
import { supabase, uploadImage } from "@/src/lib/supabase";
import { useAuth } from "@/src/context/AuthContext";
import { hasTemplateAccess } from "@/src/lib/premium";
import {
  ALBUM_PAGE_COUNT,
  ALBUM_TEMPLATE_ID,
  ALL_SLOT_IDS,
  createDefaultAlbum,
  sanitizeAlbum,
  type AlbumData,
} from "@/src/lib/album";
import PremiumUnlockModal from "@/src/components/adventure/PremiumUnlockModal";
import { playfairAlbum, caveatAlbum } from "./fonts";
import styles from "./album.module.css";
import { AlbumContext, AlbumPageContent } from "./AlbumPages";

const DRAFT_STORAGE_KEY = "lovepage_family_album_draft_v1";

// Sample preview photos displayed while the template is in locked preview mode
const SAMPLE_POOL = [
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1475503572774-15a45e5d60b9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=800&q=80",
];

const PREVIEW_PHOTOS: Record<string, string> = Object.fromEntries(
  ALL_SLOT_IDS.map((id, i) => [id, SAMPLE_POOL[i % SAMPLE_POOL.length]])
);

interface ScrapbookAlbumProps {
  readOnly?: boolean;
  initialData?: AlbumData;
  initialSlug?: string;
  initialEditToken?: string;
}

export default function ScrapbookAlbum({
  readOnly = false,
  initialData,
  initialSlug,
  initialEditToken,
}: ScrapbookAlbumProps) {
  const { user, session, openAuthModal } = useAuth();

  const [data, setData] = useState<AlbumData>(() => initialData || createDefaultAlbum());
  const [currentPage, setCurrentPage] = useState(1);
  const [turnState, setTurnState] = useState<{
    from: number;
    to: number;
    dir: "next" | "prev";
    id: number;
  } | null>(null);
  const turnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    readOnly || Boolean(initialEditToken)
  );
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string>(initialSlug || "");
  const [editToken, setEditToken] = useState<string>(initialEditToken || "");
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const touchStartX = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3400);
  }, []);

  // Load saved local draft & check premium access
  useEffect(() => {
    if (readOnly) return;

    if (!initialData) {
      try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setData((prev) => ({
            ...prev,
            ...sanitizeAlbum(parsed),
            photos: { ...prev.photos, ...(parsed?.photos || {}) },
          }));
        }
      } catch {}
    }

    if (initialEditToken) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(hasTemplateAccess(user, ALBUM_TEMPLATE_ID));
    }
  }, [readOnly, initialData, initialEditToken, user]);

  // Automatically confirm unlock when returning from Lemon Squeezy (?paid=1)
  useEffect(() => {
    if (readOnly || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") !== "1") return;

    let cancelled = false;
    const verify = async () => {
      showToast("Confirming your payment...");
      for (let attempt = 0; attempt < 5; attempt++) {
        if (cancelled) return;
        const { data: refreshed } = await supabase.auth.refreshSession().catch(() => ({
          data: { user: null },
        }));
        const latestUser = refreshed?.user || user;
        if (hasTemplateAccess(latestUser, ALBUM_TEMPLATE_ID)) {
          try {
            localStorage.setItem(`lovepage_unlocked_${ALBUM_TEMPLATE_ID}`, "true");
            if (latestUser?.id) {
              localStorage.setItem(
                `lovepage_unlocked_${ALBUM_TEMPLATE_ID}_${latestUser.id}`,
                "true"
              );
            }
          } catch {}
          setIsUnlocked(true);
          showToast("🎉 Album unlocked! Tap any photo slot or text to begin.");
          window.history.replaceState({}, "", "/album");
          return;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      showToast("Payment received! Refresh in a moment if your unlock hasn't appeared yet.");
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [readOnly, user, showToast]);

  const persistDraft = useCallback(
    (next: AlbumData) => {
      setData(next);
      if (!initialSlug) {
        try {
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
        } catch {}
      }
    },
    [initialSlug]
  );

  // Flipbook-style 3D page turn transition + ArrowLeft / ArrowRight keyboard support
  const triggerTurn = useCallback(
    (target: number, dir: "next" | "prev") => {
      if (target === currentPage) return;
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
      setTurnState({ from: currentPage, to: target, dir, id: Date.now() });
      setCurrentPage(target);
      turnTimerRef.current = setTimeout(() => {
        setTurnState(null);
        turnTimerRef.current = null;
      }, 1020);
    },
    [currentPage]
  );

  const goPrev = useCallback(() => {
    const target = currentPage > 1 ? currentPage - 1 : ALBUM_PAGE_COUNT;
    triggerTurn(target, "prev");
  }, [currentPage, triggerTurn]);

  const goNext = useCallback(() => {
    const target = currentPage < ALBUM_PAGE_COUNT ? currentPage + 1 : 1;
    triggerTurn(target, "next");
  }, [currentPage, triggerTurn]);

  const jumpToPage = useCallback(
    (target: number) => {
      if (target === currentPage) return;
      triggerTurn(target, target > currentPage ? "next" : "prev");
    },
    [currentPage, triggerTurn]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (
        el?.tagName === "INPUT" ||
        el?.tagName === "TEXTAREA" ||
        el?.isContentEditable
      ) {
        return;
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext]);

  const canEdit = !readOnly && isUnlocked;

  const displayPhotos: Record<string, string> =
    !readOnly && !isUnlocked
      ? { ...PREVIEW_PHOTOS, ...data.photos }
      : data.photos;

  const handleTextChange = useCallback(
    (key: string, val: string) => {
      if (!canEdit) return;
      setData((prev) => {
        const next: AlbumData = {
          ...prev,
          texts: { ...prev.texts, [key]: val },
        };
        if (!initialSlug) {
          try {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
    },
    [canEdit, initialSlug]
  );

  const handlePickPhoto = useCallback(
    async (slotId: string, file: File) => {
      if (!canEdit) return;
      if (!file.type.startsWith("image/")) {
        showToast("Please choose an image file (JPG, PNG, WebP).");
        return;
      }

      const localUrl = URL.createObjectURL(file);
      setData((prev) => ({
        ...prev,
        photos: { ...prev.photos, [slotId]: localUrl },
      }));

      setUploadingSlot(slotId);
      try {
        const publicUrl = await uploadImage(file);
        if (!publicUrl || publicUrl.startsWith("data:")) {
          showToast("Photo added locally — save when online to sync.");
        } else {
          showToast("Photo uploaded & saved to page!");
        }
        setData((prev) => {
          const next: AlbumData = {
            ...prev,
            photos: { ...prev.photos, [slotId]: publicUrl },
          };
          if (!initialSlug) {
            try {
              localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
            } catch {}
          }
          return next;
        });
      } catch {
        showToast("Could not upload photo right now. Please try another image.");
      } finally {
        setUploadingSlot(null);
      }
    },
    [canEdit, initialSlug, showToast]
  );

  const executeSave = async () => {
    setIsSaving(true);
    try {
      // If we already have a slug + secret editToken, update the existing album
      if (savedSlug && editToken) {
        const res = await fetch(`/api/album/${savedSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editToken, data }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not update album.");
        showToast("Album changes saved!");
        return;
      }

      // Otherwise create a new album with a unique short slug + secret owner token
      const res = await fetch("/api/album", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.slug) {
        throw new Error(json.error || "Could not save album.");
      }

      setSavedSlug(json.slug);
      setEditToken(json.editToken || "");
      try {
        localStorage.setItem(`lovepage_album_token_${json.slug}`, json.editToken || "");
      } catch {}
      showToast("Album saved! Share your public link below.");
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
    if (!user && !editToken) {
      openAuthModal({
        title: "Sign In to Save & Share Album",
        subtitle: "Sign in so we can create your permanent public album link.",
        onSuccess: () => executeSave(),
      });
      return;
    }
    executeSave();
  };

  const publicPath = savedSlug ? `/album/${savedSlug}` : "";
  const fullPublicUrl =
    typeof window !== "undefined" && publicPath
      ? `${window.location.origin}${publicPath}`
      : publicPath;
  const fullEditUrl =
    typeof window !== "undefined" && publicPath && editToken
      ? `${window.location.origin}${publicPath}?edit=${editToken}`
      : "";

  const handleSharePublic = async () => {
    if (!fullPublicUrl) return;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: data.texts["p1-title"] || "Our Family Album",
          text: data.texts["p1-sub"] || "Flip through our 9-page photo album!",
          url: fullPublicUrl,
        });
        return;
      } catch {}
    }
    try {
      await navigator.clipboard.writeText(fullPublicUrl);
      setCopiedPublic(true);
      showToast("Public album link copied!");
      setTimeout(() => setCopiedPublic(false), 2400);
    } catch {}
  };

  const handleCopySecretLink = async () => {
    if (!fullEditUrl) return;
    try {
      await navigator.clipboard.writeText(fullEditUrl);
      setCopiedSecret(true);
      showToast("Secret owner edit link copied!");
      setTimeout(() => setCopiedSecret(false), 2400);
    } catch {}
  };

  const pillBtn =
    "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all active:scale-95 shrink-0 cursor-pointer";

  return (
    <AlbumContext.Provider
      value={{
        canEdit,
        readOnly,
        texts: data.texts,
        photos: displayPhotos,
        uploadingSlot,
        onTextChange: handleTextChange,
        onPickPhoto: handlePickPhoto,
      }}
    >
      <div
        className={`${playfairAlbum.variable} ${caveatAlbum.variable} ${styles.scene} min-h-screen min-h-[100dvh] sm:py-8 sm:px-6 flex flex-col items-center justify-between selection:bg-[#e9c46a]/45`}
      >
        {/* Shared SVG objectBoundingBox clipPath for Page 8 Heart Photo */}
        <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
          <defs>
            <clipPath id="album-heart-clip" clipPathUnits="objectBoundingBox">
              <path d="M 0.5,0.92 C 0.5,0.92 0.04,0.64 0.04,0.33 C 0.04,0.16 0.17,0.05 0.32,0.05 C 0.41,0.05 0.47,0.10 0.5,0.17 C 0.53,0.10 0.59,0.05 0.68,0.05 C 0.83,0.05 0.96,0.16 0.96,0.33 C 0.96,0.64 0.5,0.92 0.5,0.92 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Friendly Toast Notification */}
        {toast && (
          <div
            role="status"
            className="fixed bottom-5 right-4 left-4 sm:left-auto sm:right-6 z-50 bg-[#4a3f38] text-[#faf6ef] px-4 py-3 rounded-2xl border border-[#e9c46a] shadow-2xl flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm font-semibold"
          >
            <Sparkles className="h-4 w-4 text-[#e9c46a] shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* ─── TOP BAR ─── */}
        <div className="w-full max-w-[490px] flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
          <Link
            href="/"
            className={`${pillBtn} bg-white/80 hover:bg-white text-[#4a3f38] border border-[#4a3f38]/15 shadow-2xs`}
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#8aa67c]" />
            <span className="hidden xs:inline">Back</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <Link
              href="/templates"
              className={`${pillBtn} bg-white/80 hover:bg-white text-[#4a3f38] border border-[#4a3f38]/15 shadow-2xs`}
            >
              <Layers className="h-3.5 w-3.5 text-[#eab7aa]" />
              <span>Templates</span>
            </Link>

            {!readOnly && (
              <>
                {canEdit ? (
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={isSaving || Boolean(uploadingSlot)}
                    className={`${pillBtn} bg-[#4a3f38] hover:bg-[#382f29] text-[#faf6ef] shadow-md disabled:opacity-50`}
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Share2 className="h-3.5 w-3.5 text-[#e9c46a]" />
                    )}
                    <span>{isSaving ? "Saving..." : savedSlug ? "Save Changes" : "Save & Share"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsUnlockModalOpen(true)}
                    className={`${pillBtn} bg-[#e9c46a] hover:bg-[#dfb54e] text-[#4a3f38] border border-[#4a3f38]/30 shadow-md font-bold`}
                  >
                    <Crown className="h-3.5 w-3.5 text-[#c94a3e] fill-[#c94a3e]" />
                    <span>Unlock $4.99</span>
                  </button>
                )}
              </>
            )}

            {savedSlug && (
              <button
                type="button"
                onClick={handleSharePublic}
                className={`${pillBtn} bg-[#8aa67c] hover:bg-[#78946a] text-white shadow-md`}
              >
                {copiedPublic ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                <span>{copiedPublic ? "Copied!" : "Share"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Share & Secret Owner Edit Links Banner */}
        {!readOnly && savedSlug && (
          <div className="w-full max-w-lg mb-4 p-3.5 rounded-2xl bg-white/90 text-[#4a3f38] border border-[#4a3f38]/15 shadow-md space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="font-bold text-[#8aa67c] uppercase tracking-wider text-[10px] block">
                  Public Read-Only Link
                </span>
                <p className="font-mono text-xs truncate">{fullPublicUrl}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleSharePublic}
                  className="px-3 py-1.5 rounded-xl bg-[#8aa67c] text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedPublic ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedPublic ? "Copied" : "Share"}</span>
                </button>
                <Link
                  href={publicPath}
                  className="p-1.5 rounded-xl bg-[#faf6ef] border border-[#4a3f38]/20 text-[#4a3f38]"
                  title="Open public album"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {fullEditUrl && (
              <div className="pt-2 border-t border-[#4a3f38]/10 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-bold text-[#c94a3e] uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <KeyRound className="h-3 w-3" />
                    <span>Secret Owner Edit Link (Keep Private)</span>
                  </span>
                  <p className="font-mono text-[11px] text-[#4a3f38]/75 truncate">{fullEditUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySecretLink}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-[#e9c46a] text-[#4a3f38] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedSecret ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSecret ? "Copied" : "Copy Edit Link"}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── 9-PAGE FLIP ALBUM STAGE ─── */}
        <main
          className={`${styles.bookStage} w-full max-w-[440px] sm:max-w-[490px] my-auto`}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(dx) > 50) {
              if (dx < 0) goNext();
              else goPrev();
            }
          }}
        >
          {/* Base Page underneath (flat, crisp — zero blur) */}
          {(() => {
            const basePage = turnState?.dir === "prev" ? turnState.from : currentPage;
            return (
              <article
                aria-label={`Album page ${currentPage} of ${ALBUM_PAGE_COUNT}`}
                className={`${styles.pageCard} ${basePage === 8 ? styles.pagePink : ""} w-full aspect-[3/4.1] min-h-[430px] xs:min-h-[480px] sm:min-h-[550px] px-3.5 xs:px-5 sm:px-7 py-6 sm:py-8 flex flex-col justify-between`}
              >
                <AlbumPageContent page={basePage} />
              </article>
            );
          })()}

          {/* Flipbook-style 3D Turning Page & Cast Shadow Sweep */}
          {turnState && (
            <>
              <div key={`cast-${turnState.id}`} className={styles.castOverlay} aria-hidden="true">
                <div
                  className={`${styles.castBar} ${
                    turnState.dir === "next" ? styles.castNext : styles.castPrev
                  }`}
                />
              </div>

              {(() => {
                const leafPage = turnState.dir === "next" ? turnState.from : turnState.to;
                return (
                  <div
                    key={`leaf-${turnState.id}`}
                    aria-hidden="true"
                    className={`${styles.turningLeafWrap} ${
                      turnState.dir === "next" ? styles.turnNext : styles.turnPrev
                    }`}
                  >
                    <article
                      className={`${styles.pageCard} ${styles.leafFaceFront} ${
                        leafPage === 8 ? styles.pagePink : ""
                      } w-full h-full px-3.5 xs:px-5 sm:px-7 py-6 sm:py-8 flex flex-col justify-between`}
                    >
                      <AlbumPageContent page={leafPage} />
                      <div className={styles.turnSheen} />
                    </article>
                    <div className={styles.leafFaceBack}>
                      <div className={styles.turnSheen} />
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </main>

        {/* ─── BOTTOM PAGE-FLIP CONTROLS & "3 / 9" COUNTER ─── */}
        <div className="w-full max-w-[440px] sm:max-w-[490px] mt-4 sm:mt-5 flex flex-col items-center gap-2.5">
          <div className="w-full flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous page"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-[#4a3f38] border border-[#4a3f38]/15 shadow-sm text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-[#8aa67c]" />
              <span>Prev</span>
            </button>

            <div
              aria-live="polite"
              className={`${styles.serif} italic px-4 py-1.5 rounded-full bg-white/75 border border-[#4a3f38]/15 text-sm sm:text-base font-bold text-[#4a3f38] shadow-2xs`}
            >
              {currentPage} / {ALBUM_PAGE_COUNT}
            </div>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next page"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#4a3f38] hover:bg-[#382f29] text-[#faf6ef] shadow-sm text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4 text-[#e9c46a]" />
            </button>
          </div>

          {/* Quick Page Dots (1..9) */}
          <div className="flex items-center justify-center gap-1.5">
            {Array.from({ length: ALBUM_PAGE_COUNT }).map((_, idx) => {
              const p = idx + 1;
              const active = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => jumpToPage(p)}
                  aria-label={`Go to page ${p}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    active ? "w-6 bg-[#8aa67c]" : "w-2 bg-[#4a3f38]/25 hover:bg-[#4a3f38]/50"
                  }`}
                />
              );
            })}
          </div>

          {readOnly && (
            <Link
              href="/album"
              className={`${styles.hand} mt-2 inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#e9c46a] hover:bg-[#dfb54e] text-[#4a3f38] text-lg font-bold shadow-sm transition-transform hover:-translate-y-0.5`}
            >
              <Sparkles className="h-4 w-4 text-[#c94a3e]" />
              <span>Make your own Scrapbook Album</span>
            </Link>
          )}
        </div>

        {/* Stripe Premium Unlock Modal */}
        <PremiumUnlockModal
          isOpen={isUnlockModalOpen}
          onClose={() => setIsUnlockModalOpen(false)}
          templateId={ALBUM_TEMPLATE_ID}
          templateTitle="Scrapbook Album (9-Page Flip Album)"
          bullets={[
            "9 handcrafted collage pages with 3D page-flip animation",
            "41 photo slots, FAMILY photo-clipped letters & clothesline spread",
            "Cut-paper heart & star sticker page + secret owner edit link",
          ]}
          onUnlocked={() => {
            setIsUnlocked(true);
            setIsUnlockModalOpen(false);
            showToast("🎉 Album unlocked! Tap any photo slot or text to personalize.");
          }}
        />
      </div>
    </AlbumContext.Provider>
  );
}
