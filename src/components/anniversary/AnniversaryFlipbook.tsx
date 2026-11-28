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
  KeyRound,
  ExternalLink,
  ImagePlus,
  Eye,
  Pencil,
} from "lucide-react";
import { supabase, uploadImage, getAuthHeaders } from "@/src/lib/supabase";
import { useAuth } from "@/src/context/AuthContext";
import { hasTemplateAccess } from "@/src/lib/premium";
import {
  ANNIVERSARY_TEMPLATE_ID,
  ANNIVERSARY_PHOTO_COUNT,
  createDefaultAnniversary,
  sanitizeAnniversary,
  type AnniversaryData,
} from "@/src/lib/anniversary";
import PremiumUnlockModal from "@/src/components/adventure/PremiumUnlockModal";
import styles from "./anniversary.module.css";

const DRAFT_STORAGE_KEY = "lovepage_anniversary_velvet_draft_v2";
const LEAF_COUNT = 9; // 9 leaves -> states 0 (closed cover), 1..8 (page 1&2 .. 15&16), 9 (back cover)

type PhotoVars = React.CSSProperties & {
  "--img"?: string;
  "--a"?: string;
  "--b"?: string;
};

interface AnniversaryFlipbookProps {
  readOnly?: boolean;
  initialData?: AnniversaryData;
  initialSlug?: string;
  initialEditToken?: string;
}

export default function AnniversaryFlipbook({
  readOnly = false,
  initialData,
  initialSlug,
  initialEditToken,
}: AnniversaryFlipbookProps) {
  const { user, openAuthModal } = useAuth();

  const [data, setData] = useState<AnniversaryData>(
    () => initialData || createDefaultAnniversary()
  );
  const [n, setN] = useState(0); // 0..9
  const [movingIdx, setMovingIdx] = useState<number | null>(null);
  const [interactionMode, setInteractionMode] = useState<"edit" | "flip">("edit");

  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    readOnly || Boolean(initialEditToken)
  );
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string>(initialSlug || "");
  const [editToken, setEditToken] = useState<string>(initialEditToken || "");
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const touchStartX = useRef<number | null>(null);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const singleFileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const activeSlotRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3400);
  }, []);

  useEffect(() => {
    if (readOnly) return;
    if (!initialData) {
      try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (raw) setData(sanitizeAnniversary(JSON.parse(raw)));
      } catch {}
    }
    if (initialEditToken) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(hasTemplateAccess(user, ANNIVERSARY_TEMPLATE_ID));
    }
  }, [readOnly, initialData, initialEditToken, user]);

  // Verify unlock when returning from checkout (?paid=1)
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
        if (hasTemplateAccess(latestUser, ANNIVERSARY_TEMPLATE_ID)) {
          try {
            localStorage.setItem(`lovepage_unlocked_${ANNIVERSARY_TEMPLATE_ID}`, "true");
            if (latestUser?.id) {
              localStorage.setItem(
                `lovepage_unlocked_${ANNIVERSARY_TEMPLATE_ID}_${latestUser.id}`,
                "true"
              );
            }
          } catch {}
          setIsUnlocked(true);
          showToast("🎉 1 Year With You unlocked! Tap any photo or text to customize.");
          window.history.replaceState({}, "", "/anniversary");
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

  const goTo = useCallback((target: number) => {
    setN((prev) => {
      const clamped = Math.max(0, Math.min(LEAF_COUNT, target));
      if (clamped === prev) return prev;
      const movedLeaf = clamped > prev ? prev : clamped;
      setMovingIdx(movedLeaf);
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      moveTimerRef.current = setTimeout(() => setMovingIdx(null), 1000);
      return clamped;
    });
  }, []);

  const go = useCallback(
    (d: 1 | -1) => {
      goTo(n + d);
    },
    [n, goTo]
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
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go]);

  const canEdit = !readOnly && isUnlocked && interactionMode === "edit";

  const handleTextBlur = useCallback(
    (key: string, e: React.FocusEvent<HTMLElement>) => {
      if (readOnly) return;
      if (!isUnlocked) {
        setIsUnlockModalOpen(true);
        return;
      }
      const val = e.currentTarget.innerText;
      setData((prev) => {
        const next: AnniversaryData = {
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
    [readOnly, isUnlocked, initialSlug]
  );

  const handlePhotoSlotClick = useCallback(
    (slotIdx: number, e: React.MouseEvent) => {
      if (readOnly || interactionMode === "flip") return;
      e.stopPropagation();
      if (!isUnlocked) {
        setIsUnlockModalOpen(true);
        return;
      }
      activeSlotRef.current = slotIdx;
      singleFileInputRef.current?.click();
    },
    [readOnly, interactionMode, isUnlocked]
  );

  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const slotIdx = activeSlotRef.current;
    if (!file || slotIdx === null) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file (JPG, PNG, WebP).");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setData((prev) => {
      const nextPhotos = [...prev.photos];
      nextPhotos[slotIdx] = localUrl;
      return { ...prev, photos: nextPhotos };
    });

    setUploadingIndex(slotIdx);
    try {
      const publicUrl = await uploadImage(file, {
        templateType: "anniversary-velvet",
        slotName: `photo-${slotIdx + 1}`,
      });
      setData((prev) => {
        const nextPhotos = [...prev.photos];
        nextPhotos[slotIdx] = publicUrl;
        const next: AnniversaryData = { ...prev, photos: nextPhotos };
        if (!initialSlug) {
          try {
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
      showToast(`Photo ${slotIdx + 1} uploaded!`);
    } catch {
      showToast("Could not upload photo right now. Please try again.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleBatchFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    e.target.value = "";
    if (!files.length) return;

    setIsBatchUploading(true);
    showToast(`Uploading ${Math.min(files.length, ANNIVERSARY_PHOTO_COUNT)} photo(s)...`);

    const targetSlots: number[] = [];
    for (let i = 0; i < ANNIVERSARY_PHOTO_COUNT && targetSlots.length < files.length; i++) {
      if (!data.photos[i]) targetSlots.push(i);
    }
    for (let i = 0; i < ANNIVERSARY_PHOTO_COUNT && targetSlots.length < files.length; i++) {
      if (!targetSlots.includes(i)) targetSlots.push(i);
    }

    for (let idx = 0; idx < targetSlots.length; idx++) {
      const slotIdx = targetSlots[idx];
      const file = files[idx];
      setUploadingIndex(slotIdx);
      try {
        const publicUrl = await uploadImage(file, {
          templateType: "anniversary-velvet",
          slotName: `photo-${slotIdx + 1}`,
        });
        setData((prev) => {
          const nextPhotos = [...prev.photos];
          nextPhotos[slotIdx] = publicUrl;
          const next: AnniversaryData = { ...prev, photos: nextPhotos };
          if (!initialSlug) {
            try {
              localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(next));
            } catch {}
          }
          return next;
        });
      } catch {}
    }

    setUploadingIndex(null);
    setIsBatchUploading(false);
    showToast("Photos added to your Velvet Flipbook!");
  };

  const executeSave = async () => {
    setIsSaving(true);
    try {
      const authHeaders = await getAuthHeaders();
      if (savedSlug && editToken) {
        const res = await fetch(`/api/anniversary/${savedSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ editToken, data }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not update flipbook.");
        showToast("Flipbook changes saved!");
        return;
      }

      const res = await fetch("/api/anniversary", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.slug) {
        throw new Error(json.error || "Could not save flipbook.");
      }

      setSavedSlug(json.slug);
      setEditToken(json.editToken || "");
      try {
        localStorage.setItem(`lovepage_anniversary_token_${json.slug}`, json.editToken || "");
      } catch {}
      showToast("Velvet Flipbook published! Copy your share link below.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not save right now.";
      showToast(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveClick = () => {
    if (!isUnlocked) {
      setIsUnlockModalOpen(true);
      return;
    }
    if (uploadingIndex !== null || isBatchUploading) {
      showToast("Finishing photo upload — one moment!");
      return;
    }
    if (!user && !editToken) {
      openAuthModal({
        title: "Sign In to Publish Your Flipbook",
        subtitle: "Sign in so your Velvet Anniversary Flipbook stays saved to your account.",
        onSuccess: () => executeSave(),
      });
      return;
    }
    executeSave();
  };

  const edProps = (key: string) => ({
    contentEditable: canEdit,
    suppressContentEditableWarning: true,
    onClick: (e: React.MouseEvent) => {
      if (!readOnly && interactionMode === "edit") {
        e.stopPropagation();
        if (!isUnlocked) setIsUnlockModalOpen(true);
      }
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => handleTextBlur(key, e),
  });

  const renderPh = (
    slotIdx: number,
    style: PhotoVars,
    opts?: { bw?: boolean; pol?: boolean }
  ) => {
    const url = data.photos[slotIdx];
    const merged: PhotoVars = {
      ...style,
      ...(url ? { "--img": `url("${url}")` } : {}),
    };
    return (
      <div
        role={!readOnly && interactionMode === "edit" ? "button" : undefined}
        onClick={(e) => handlePhotoSlotClick(slotIdx, e)}
        className={`ph ${styles.ph} ${opts?.bw ? `bw ${styles.bw}` : ""} ${
          opts?.pol ? styles.polPh : ""
        } ${url ? `on ${styles.phOn}` : ""} ${
          !readOnly && interactionMode === "edit" ? styles.phEditable : ""
        }`}
        style={merged}
        title={
          !readOnly && interactionMode === "edit"
            ? `Click to upload Photo ${slotIdx + 1}`
            : undefined
        }
      />
    );
  };

  const renderAv = (slotIdx: number) => {
    const url = data.photos[slotIdx];
    const merged: PhotoVars = url ? { "--img": `url("${url}")` } : {};
    return (
      <b
        role={!readOnly && interactionMode === "edit" ? "button" : undefined}
        onClick={(e) => handlePhotoSlotClick(slotIdx, e)}
        className={`${styles.av} ${
          !readOnly && interactionMode === "edit" ? styles.avEditable : ""
        }`}
        style={merged}
        title={
          !readOnly && interactionMode === "edit"
            ? `Click to upload Avatar ${slotIdx + 1}`
            : undefined
        }
      />
    );
  };

  const zFor = (i: number) => (i === movingIdx ? 50 : i < n ? i : LEAF_COUNT - i);

  const labelText = n > 0 && n < LEAF_COUNT ? `page ${2 * n - 1}&${2 * n}` : "";

  const publicShareUrl =
    typeof window !== "undefined" && savedSlug
      ? `${window.location.origin}/anniversary/${savedSlug}`
      : savedSlug
        ? `/anniversary/${savedSlug}`
        : "";
  const secretEditUrl =
    typeof window !== "undefined" && savedSlug && editToken
      ? `${window.location.origin}/anniversary/${savedSlug}?edit=${editToken}`
      : "";

  return (
    <div className={styles.shell}>
      {/* Exact Stone/Plaster Backdrop (.b2) */}
      <div className={styles.stoneBg} aria-hidden="true" />

      {/* Hidden File Inputs */}
      <input
        ref={singleFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSingleFileChange}
      />
      <input
        ref={batchFileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleBatchFilesChange}
      />

      {/* Top Navigation & Editor Action Bar */}
      <div className="w-full max-w-5xl px-3 sm:px-5 pt-3 pb-1 flex flex-wrap items-center justify-between gap-2 z-20 font-sans">
        <div className="flex items-center gap-2">
          <Link
            href={readOnly ? "/" : "/templates"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/35 hover:bg-black/50 text-[#f7f1df] border border-white/30 text-xs sm:text-sm font-semibold transition-all active:scale-95 backdrop-blur-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#eee6b6]" />
            <span>{readOnly ? "LovePage" : "Templates"}</span>
          </Link>

          {!readOnly && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 border border-white/25 text-[11px] font-bold text-[#eee6b6] backdrop-blur-sm">
              <Layers className="h-3.5 w-3.5" />
              <span>Vol. 07 • 1 Year With You ($7.99)</span>
            </span>
          )}
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() =>
                setInteractionMode((prev) => (prev === "edit" ? "flip" : "edit"))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/35 hover:bg-black/50 text-[#f7f1df] border border-white/30 text-xs font-semibold transition-all cursor-pointer active:scale-95 backdrop-blur-sm"
            >
              {interactionMode === "edit" ? (
                <>
                  <Eye className="h-3.5 w-3.5 text-[#eee6b6]" />
                  <span>Preview</span>
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5 text-[#eee6b6]" />
                  <span>Edit</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isBatchUploading}
              onClick={() => {
                if (!isUnlocked) {
                  setIsUnlockModalOpen(true);
                  return;
                }
                batchFileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/35 hover:bg-black/50 text-[#f7f1df] border border-white/30 text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50 backdrop-blur-sm"
            >
              {isBatchUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#eee6b6]" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5 text-[#eee6b6]" />
              )}
              <span className="hidden xs:inline">Batch Upload</span>
            </button>

            {!isUnlocked ? (
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#eee6b6] hover:bg-[#f6f0c8] text-[#2a1212] text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Crown className="h-3.5 w-3.5 text-[#7b1f1f] fill-[#7b1f1f]" />
                <span>Unlock • $7.99</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveClick}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#eee6b6] hover:bg-[#f6f0c8] text-[#2a1212] text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5 text-[#7b1f1f]" />
                )}
                <span>{savedSlug ? "Save Changes" : "Publish & Share"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Centered 3:2 Velvet Flipbook Stage */}
      <main className={styles.stageWrap}>
        <div className={styles.lab}>{labelText}</div>

        <div
          className={`${styles.wrap} ${readOnly ? styles.wrapReadOnly : ""}`}
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const d = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(d) > 50) go(d < 0 ? 1 : -1);
          }}
        >
          <div
            className={`${styles.book} ${n === 0 ? styles.bookS : ""} ${
              n === LEAF_COUNT ? styles.bookE : ""
            }`}
          >
            {/* 0: Cover | S1 Left: About us */}
            <div
              className={`${styles.leaf} ${0 < n ? styles.leafF : ""}`}
              style={{ zIndex: zFor(0) }}
              onClick={() => goTo(0 < n ? 0 : 1)}
            >
              <div className={`${styles.face} ${styles.cover}`}>
                <div
                  {...edProps("c-title")}
                  className={`${styles.a} ${styles.editable} ${
                    canEdit ? styles.editableActive : ""
                  }`}
                  style={{
                    left: "19%",
                    top: "35%",
                    font: "5cqw/1 var(--sc)",
                    color: "#fff",
                    zIndex: 2,
                  }}
                >
                  {data.texts["c-title"]}
                </div>
                <div
                  className={styles.a}
                  style={{
                    left: "31%",
                    top: "37.5%",
                    width: "38%",
                    height: "27%",
                    background: "#fff",
                    padding: ".25cqw",
                  }}
                >
                  {renderPh(0, { inset: ".25cqw" }, { bw: true })}
                </div>
                <div
                  {...edProps("c-date")}
                  className={`${styles.a} ${styles.editable} ${
                    canEdit ? styles.editableActive : ""
                  }`}
                  style={{
                    left: "31%",
                    top: "66%",
                    font: "1.2cqw var(--sa)",
                    color: "#fff",
                    letterSpacing: ".06em",
                  }}
                >
                  {data.texts["c-date"]}
                </div>
              </div>

              <div className={`${styles.face} ${styles.faceK} ${styles.white}`}>
                <div
                  className={`${styles.a} ${styles.winePanel}`}
                  style={{
                    left: "10%",
                    right: 0,
                    top: "10%",
                    bottom: "8%",
                    color: "#fff",
                    padding: "3cqw 3cqw 2cqw 3.2cqw",
                  }}
                >
                  <div
                    {...edProps("s1-head")}
                    className={`${styles.editable} ${canEdit ? styles.editableActive : ""}`}
                    style={{
                      font: "3.6cqw/1 'Bebas Neue',sans-serif",
                      marginBottom: "1.2cqw",
                    }}
                  >
                    {data.texts["s1-head"]}
                  </div>
                  <p
                    className={styles.pText}
                    style={{
                      fontSize: ".88cqw",
                      lineHeight: 1.55,
                      textAlign: "justify",
                      marginBottom: ".9cqw",
                    }}
                  >
                    <span
                      style={{
                        font: "3cqw/.7 var(--sc)",
                        float: "left",
                        margin: ".4cqw .3cqw 0 0",
                      }}
                    >
                      K
                    </span>
                    <span
                      {...edProps("s1-p1")}
                      className={`${styles.editable} ${canEdit ? styles.editableActive : ""}`}
                    >
                      {data.texts["s1-p1"]}
                    </span>
                  </p>
                  <p
                    {...edProps("s1-p2")}
                    className={`${styles.pText} ${styles.editable} ${
                      canEdit ? styles.editableActive : ""
                    }`}
                    style={{
                      fontSize: ".88cqw",
                      lineHeight: 1.55,
                      textAlign: "justify",
                      marginBottom: ".9cqw",
                    }}
                  >
                    {data.texts["s1-p2"]}
                  </p>
                  <p
                    {...edProps("s1-p3")}
                    className={`${styles.pText} ${styles.editable} ${
                      canEdit ? styles.editableActive : ""
                    }`}
                    style={{
                      fontSize: ".88cqw",
                      lineHeight: 1.55,
                      textAlign: "justify",
                    }}
                  >
                    {data.texts["s1-p3"]}
                  </p>
                </div>
              </div>
            </div>

            {/* 1: S1 Right | S2 Left (1/2/10 The start of forever) */}
            <div
              className={`${styles.leaf} ${1 < n ? styles.leafF : ""}`}
              style={{ zIndex: zFor(1) }}
              onClick={() => goTo(1 < n ? 1 : 2)}
            >
              <div className={`${styles.face} ${styles.white}`}>
                {renderPh(1, {
                  left: 0,
                  width: "74%",
                  top: "21.7%",
                  height: "56.6%",
                  "--a": "#9a8f86",
                  "--b": "#3a3330",
                })}
                <svg
                  className={styles.a}
                  style={{
                    left: "70%",
                    top: "68%",
                    width: "6.5cqw",
                    filter: "drop-shadow(0 .3cqw .4cqw rgba(0,0,0,.3))",
                    pointerEvents: "none",
                  }}
                  viewBox="0 0 100 90"
                >
                  <path
                    d="M50 85C10 55 2 35 2 24 2 11 12 3 25 3c10 0 20 6 25 15C55 9 65 3 75 3c13 0 23 8 23 21 0 11-8 31-48 61z"
                    fill="#a8262c"
                  />
                </svg>
              </div>

              <div className={`${styles.face} ${styles.faceK} ${styles.brownp}`}>
                <div
                  {...edProps("s2-nums")}
                  className={`${styles.a} ${styles.editable} ${
                    canEdit ? styles.editableActive : ""
                  }`}
                  style={{
                    left: "5%",
                    top: "2%",
                    font: "800 25cqw/.8 Poppins,sans-serif",
                    color: "#eee7d6",
                  }}
                >
                  {data.texts["s2-nums"]}
                </div>
                <div className={styles.a} style={{ left: "40%", right: "8%", top: "8%" }}>
                  <div style={{ font: "500 2.6cqw/1.05 var(--pf)" }}>
                    <span
                      {...edProps("s2-h1")}
                      className={`${styles.editable} ${canEdit ? styles.editableActive : ""}`}
                    >
                      {data.texts["s2-h1"]}
                    </span>
                    <i
                      {...edProps("s2-h2")}
                      className={`${styles.editable} ${canEdit ? styles.editableActive : ""}`}
                      style={{ font: "2.9cqw var(--sc)" }}
                    >
                      {data.texts["s2-h2"]}
                    </i>
                  </div>
                </div>
                <div
                  className={styles.pol}
                  style={{
                    right: "5%",
                    top: "6%",
                    width: "9cqw",
                    height: "7cqw",
                    transform: "rotate(-6deg)",
                  }}
                >
                  {renderPh(2, { inset: "6%" }, { bw: true })}
                </div>
                <div className={styles.a} style={{ left: "40%", right: "8%", top: "32%" }}>
                  <p
                    {...edProps("s2-p1")}
                    className={`${styles.pText} ${styles.editable} ${
                      canEdit ? styles.editableActive : ""
                    }`}
                    style={{
                      fontSize: ".86cqw",
                      lineHeight: 1.6,
                      textAlign: "justify",
                      marginBottom: ".9cqw",
                    }}
                  >
                    {data.texts["s2-p1"]}
                  </p>
                  <p
                    {...edProps("s2-p2")}
                    className={`${styles.pText} ${styles.editable} ${
                      canEdit ? styles.editableActive : ""
                    }`}
                    style={{
                      fontSize: ".86cqw",
                      lineHeight: 1.6,
                      textAlign: "justify",
                    }}
                  >
                    {data.texts["s2-p2"]}
                  </p>
                </div>
              </div>
            </div>

            {/* 2: S2 Right (2x3 Grid + Our "first") | S3 Left (Full B&W + cream squares) */}
            <div
              className={`${styles.leaf} ${2 < n ? styles.leafF : ""}`}
              style={{ zIndex: zFor(2) }}
              onClick={() => goTo(2 < n ? 2 : 3)}
            >
              <div
                className={`${styles.face} ${styles.white}`}
                style={{ display: "grid", gridTemplate: "repeat(3,1fr)/1fr 1fr" }}
              >
                <div style={{ position: "relative" }}>
                  {renderPh(3, { inset: 0, "--a": "#c93a2e", "--b": "#2a2a2a" })}
                  <div
                    {...edProps("s2-g1")}
                    className={`${styles.a} ${styles.editable} ${
                      canEdit ? styles.editableActive : ""
                    }`}
                    style={{
                      left: "3%",
                      bottom: "4%",
                      background: "#fff",
                      font: ".95cqw var(--lo)",
                      padding: ".2cqw .8cqw",
                      color: "var(--ink)",
                      zIndex: 1,
                    }}
                  >
                    {data.texts["s2-g1"]}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  {renderPh(4, { inset: 0, "--a": "#cbb98a", "--b": "#33301f" })}
                  <div
                    {...edProps("s2-g2")}
                    className={`${styles.a} ${styles.editable} ${
                      canEdit ? styles.editableActive : ""
                    }`}
                    style={{
                      left: "3%",
                      bottom: "4%",
                      background: "#fff",
                      font: ".95cqw var(--lo)",
                      padding: ".2cqw .8cqw",
                      color: "var(--ink)",
                      zIndex: 1,
                    }}
                  >
                    {data.texts["s2-g2"]}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  {renderPh(5, { inset: 0, "--a": "#d98a5b", "--b": "#1d2540" })}
                  <div
                    {...edProps("s2-g3")}
                    className={`${styles.a} ${styles.editable} ${
                      canEdit ? styles.editableActive : ""
                    }`}
                    style={{
                      left: "3%",
                      bottom: "4%",
                      background: "#fff",
                      font: ".95cqw var(--lo)",
                      padding: ".2cqw .8cqw",
                      color: "var(--ink)",
                      zIndex: 1,
                    }}
                  >
                    {data.texts["s2-g3"]}
                  </div>
                </div>
                <div
                  style={{
                    background: "#faf6ea",
                    color: "#6b1a1a",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "0 2cqw",
                  }}
                >
                  <div
                    {...edProps("s2-first-ttl")}
                    className={`${styles.editable} ${canEdit ? styles.editableActive : ""}`}
                    style={{ font: "italic 500 5.2cqw/.95 var(--pf)" }}
                  >
                    {data.texts["s2-first-ttl"]}
                  </div>
                  <div
                    {...edProps("s2-first-sub")}
                    className={`${styles.editable} ${canEdit ? styles.editableActive : ""}`}
                    style={{
                      font: ".82cqw/1.6 var(--te)",
                      color: "var(--ink)",
                      marginTop: "1cqw",
                    }}
                  >
                    {data.texts["s2-first-sub"]}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  {renderPh(6, { inset: 0, "--a": "#e5c15a", "--b": "#3a2e1c" })}
                  <div
                    {...edProps("s2-g4")}
                    className={`${styles.a} ${styles.editable} ${
                      canEdit ? styles.editableActive : ""
                    }`}
                    style={{
                      left: "3%",
                      bottom: "4%",
                      background: "#fff",
                      font: ".95cqw var(--lo)",
                      padding: ".2cqw .8cqw",
                      color: "var(--ink)",
                      zIndex: 1,
                    }}
                  >
                    {data.texts["s2-g4"]}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  {renderPh(7, { inset: 0, "--a": "#6b4a3a", "--b": "#15110f" })}
                  <div
                    {...edProps("s2-g5")}
                    className={`${styles.a} ${styles.editable} ${
                      canEdit ? styles.editableActive : ""
                    }`}
                    style={{
                      left: "3%",
                      bottom: "4%",
                      background: "#fff",
                      font: ".95cqw var(--lo)",
                      padding: ".2cqw .8cqw",
                      color: "var(--ink)",
                      zIndex: 1,
                    }}
                  >
                    {data.texts["s2-g5"]}
                  </div>
                </div>
              </div>

              <div
                className={`${styles.face} ${styles.faceK}`}
                style={{ background: "#1a1a1a" }}
              >
                {renderPh(8, { inset: 0, "--a": "#9a9a9a", "--b": "#1c1c1c" }, { bw: true })}
                <i className={styles.a} style={{ left: "12%", top: "12%", width: "2.4cqw", height: "2.4cqw", background: "var(--cream)", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "30%", top: "19%", width: "2.4cqw", height: "2.4cqw", background: "var(--cream)", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "88%", top: "10%", width: "2.4cqw", height: "2.4cqw", background: "var(--cream)", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "6%", bottom: "6%", width: "2.4cqw", height: "2.4cqw", background: "var(--cream)", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "12%", bottom: "11%", width: "2.4cqw", height: "2.4cqw", background: "var(--cream)", pointerEvents: "none" }} />
              </div>
            </div>

            {/* 3: S3 Right (Letter for you) | S4 Left (Velvet +) */}
            <div
              className={`${styles.leaf} ${3 < n ? styles.leafF : ""}`}
              style={{ zIndex: zFor(3) }}
              onClick={() => goTo(3 < n ? 3 : 4)}
            >
              <div
                className={`${styles.face} ${styles.cream}`}
                style={{ padding: "3.6cqw 3cqw" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "1cqw",
                    marginBottom: "1.2cqw",
                  }}
                >
                  <span
                    {...edProps("s3-h1")}
                    className={`${styles.editable} ${canEdit ? styles.editableActive : ""}`}
                    style={{ font: "6cqw/1 var(--sc)", color: "#8a1c22" }}
                  >
                    {data.texts["s3-h1"]}
                  </span>
                  <b
                    {...edProps("s3-h2")}
                    className={`${styles.editable} ${canEdit ? styles.editableActive : ""}`}
                    style={{ font: "700 3.4cqw/.9 var(--pf)", color: "#222" }}
                  >
                    {data.texts["s3-h2"]}
                  </b>
                </div>
                <p {...edProps("s3-p1")} className={`${styles.pText} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ fontSize: ".82cqw", lineHeight: 1.6, marginBottom: ".8cqw" }}>
                  {data.texts["s3-p1"]}
                </p>
                <p {...edProps("s3-p2")} className={`${styles.pText} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ fontSize: ".82cqw", lineHeight: 1.6, marginBottom: ".8cqw", textAlign: "justify" }}>
                  {data.texts["s3-p2"]}
                </p>
                <p {...edProps("s3-p3")} className={`${styles.pText} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ fontSize: ".82cqw", lineHeight: 1.6, marginBottom: ".8cqw", textAlign: "justify" }}>
                  {data.texts["s3-p3"]}
                </p>
                <div
                  style={{
                    float: "left",
                    width: "41%",
                    height: "36cqw",
                    margin: ".4cqw 1.2cqw 0 -3cqw",
                    background: "#13224a",
                    position: "relative",
                  }}
                >
                  {renderPh(9, {
                    left: "10%",
                    right: "10%",
                    top: "7%",
                    height: "40%",
                    borderRadius: "50%",
                    "--a": "#c9a089",
                    "--b": "#3c2b25",
                  })}
                  {renderPh(10, {
                    left: "10%",
                    right: "10%",
                    bottom: "7%",
                    height: "40%",
                    borderRadius: "50%",
                    "--a": "#b08a6a",
                    "--b": "#2d2f35",
                  })}
                </div>
                <p {...edProps("s3-p4")} className={`${styles.pText} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ fontSize: ".82cqw", lineHeight: 1.6, marginBottom: ".8cqw", textAlign: "justify" }}>
                  {data.texts["s3-p4"]}
                </p>
                <p {...edProps("s3-p5")} className={`${styles.pText} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ fontSize: ".82cqw", lineHeight: 1.6, marginBottom: ".8cqw", textAlign: "justify" }}>
                  {data.texts["s3-p5"]}
                </p>
                <p {...edProps("s3-p6")} className={`${styles.pText} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ fontSize: ".82cqw", lineHeight: 1.6, textAlign: "justify" }}>
                  {data.texts["s3-p6"]}
                </p>
              </div>

              <div className={`${styles.face} ${styles.faceK} ${styles.velvet}`}>
                <div className={styles.pol} style={{ left: "31%", top: "9%", width: "37%", height: "32%" }}>
                  {renderPh(11, { "--a": "#8d8a98", "--b": "#413e4c" }, { pol: true })}
                </div>
                <div
                  className={styles.a}
                  style={{
                    left: "46%",
                    top: "44%",
                    font: "800 5.4cqw/1 var(--sa)",
                    color: "#f4ecd8",
                    transform: "translateX(-20%)",
                    pointerEvents: "none",
                  }}
                >
                  +
                </div>
                <div className={styles.pol} style={{ left: "31%", top: "59%", width: "37%", height: "32%" }}>
                  {renderPh(12, { "--a": "#a89c88", "--b": "#4a4136" }, { pol: true })}
                </div>
              </div>
            </div>

            {/* 4: S4 Right (= lace heart) | S5 Left (kind words + avatars) */}
            <div
              className={`${styles.leaf} ${4 < n ? styles.leafF : ""}`}
              style={{ zIndex: zFor(4) }}
              onClick={() => goTo(4 < n ? 4 : 5)}
            >
              <div className={`${styles.face} ${styles.velvet}`}>
                <div
                  className={styles.a}
                  style={{
                    left: 0,
                    top: "40%",
                    font: "800 7cqw/1 var(--sa)",
                    color: "#f4ecd8",
                    pointerEvents: "none",
                  }}
                >
                  =
                </div>
                <svg
                  className={`${styles.a} ${styles.velvetSvg}`}
                  style={{
                    left: "20%",
                    top: "28%",
                    width: "60%",
                    cursor: !readOnly && interactionMode === "edit" ? "pointer" : undefined,
                  }}
                  viewBox="0 0 100 90"
                  onClick={(e) => handlePhotoSlotClick(13, e)}
                >
                  <defs>
                    <clipPath id="hc-anniv">
                      <path
                        transform="translate(8 7) scale(.84)"
                        d="M50 85C10 55 2 35 2 24 2 11 12 3 25 3c10 0 20 6 25 15C55 9 65 3 75 3c13 0 23 8 23 21 0 11-8 31-48 61z"
                      />
                    </clipPath>
                    <linearGradient id="g-anniv" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#6b8aa8" />
                      <stop offset="1" stopColor="#3a2f2a" />
                    </linearGradient>
                  </defs>
                  <path
                    className={styles.velvetHeartPath}
                    d="M50 85C10 55 2 35 2 24 2 11 12 3 25 3c10 0 20 6 25 15C55 9 65 3 75 3c13 0 23 8 23 21 0 11-8 31-48 61z"
                    stroke="#e9e4d6"
                  />
                  <g clipPath="url(#hc-anniv)">
                    <rect width="100" height="90" fill="url(#g-anniv)" />
                    {data.photos[13] && (
                      <image
                        href={data.photos[13]}
                        width="100"
                        height="90"
                        preserveAspectRatio="xMidYMid slice"
                      />
                    )}
                  </g>
                </svg>
              </div>

              <div
                className={`${styles.face} ${styles.faceK} ${styles.cream}`}
                style={{ color: "#222" }}
              >
                <div
                  className={styles.a}
                  style={{
                    left: 0,
                    right: 0,
                    top: "44%",
                    transform: "translateY(-50%)",
                    textAlign: "center",
                    font: "1.45cqw/3.1 var(--te)",
                  }}
                >
                  may {renderAv(14)} this year
                  <br />
                  be as kind {renderAv(15)} to
                  <br />
                  you {renderAv(16)} as you&apos;ve been
                  <br />
                  to {renderAv(17)} me.
                </div>
                <div
                  className={styles.a}
                  style={{
                    right: "-5cqw",
                    top: "19%",
                    width: "10cqw",
                    height: "10cqw",
                    borderRadius: "50%",
                    background: "#f6f0dc",
                    pointerEvents: "none",
                  }}
                />
              </div>
            </div>

            {/* 5: S5 Right (B&W + cream circles) | S6 Left (Ring binder + 3 polaroids) */}
            <div
              className={`${styles.leaf} ${5 < n ? styles.leafF : ""}`}
              style={{ zIndex: zFor(5) }}
              onClick={() => goTo(5 < n ? 5 : 6)}
            >
              <div className={styles.face} style={{ background: "#16140f" }}>
                {renderPh(18, { inset: 0, "--a": "#8f8f8f", "--b": "#1a1a1a" }, { bw: true })}
                <i className={styles.a} style={{ left: "3%", top: "-1%", width: "20cqw", height: "7cqw", borderRadius: "0 0 10cqw 10cqw", background: "#f6f0dc", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "16%", top: "17%", width: "5.5cqw", height: "5.5cqw", borderRadius: "50%", background: "#f6f0dc", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "60%", top: "4%", width: "3.4cqw", height: "3.4cqw", borderRadius: "50%", background: "#f6f0dc", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "56%", top: "21%", width: "4.4cqw", height: "4.4cqw", borderRadius: "50%", background: "#f6f0dc", pointerEvents: "none" }} />
                <i className={styles.a} style={{ right: "-4%", top: "28%", width: "12cqw", height: "12cqw", borderRadius: "50%", background: "#f6f0dc", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "40%", top: "30%", width: "2.4cqw", height: "2.4cqw", borderRadius: "50%", background: "#f6f0dc", pointerEvents: "none" }} />
              </div>

              <div className={`${styles.face} ${styles.faceK}`} style={{ background: "#fff" }}>
                {renderPh(19, {
                  left: 0,
                  right: 0,
                  top: 0,
                  height: "48%",
                  "--a": "#3d6a8e",
                  "--b": "#1f3550",
                })}
                <div className={styles.a} style={{ left: 0, right: 0, top: "48%", height: "3.4%", background: "#cfcfcf", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "10%", top: "47%", width: ".8cqw", height: "3cqw", background: "#8c8c8c", borderRadius: "1cqw", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "32%", top: "47%", width: ".8cqw", height: "3cqw", background: "#8c8c8c", borderRadius: "1cqw", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "63%", top: "47%", width: ".8cqw", height: "3cqw", background: "#8c8c8c", borderRadius: "1cqw", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "87%", top: "47%", width: ".8cqw", height: "3cqw", background: "#8c8c8c", borderRadius: "1cqw", pointerEvents: "none" }} />
                <div className={styles.a} style={{ left: 0, right: 0, top: "57%", bottom: 0, background: "linear-gradient(#fff 55%,#cfd6dc)", pointerEvents: "none" }} />

                <div className={styles.pol} style={{ left: "8%", top: "60%", width: "26%", height: "28%", transform: "none" }}>
                  {renderPh(20, { inset: "5%", "--a": "#6e8a55", "--b": "#2e2a22" })}
                </div>
                <div className={styles.pol} style={{ left: "38%", top: "68%", width: "22%", height: "26%" }}>
                  {renderPh(21, { inset: "5%", "--a": "#6e8a55", "--b": "#2e2a22" })}
                </div>
                <div className={styles.pol} style={{ left: "66%", top: "60%", width: "26%", height: "28%" }}>
                  {renderPh(22, { inset: "5%", "--a": "#6e8a55", "--b": "#2e2a22" })}
                </div>

                <div {...edProps("s6-c1")} className={`${styles.a} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ left: "12%", top: "55%", font: "italic 700 .95cqw var(--pf)", textDecoration: "underline", color: "#222" }}>
                  {data.texts["s6-c1"]}
                </div>
                <div {...edProps("s6-c2")} className={`${styles.a} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ left: "40%", top: "63%", font: "italic 700 .95cqw var(--pf)", textDecoration: "underline", color: "#222" }}>
                  {data.texts["s6-c2"]}
                </div>
                <div {...edProps("s6-c3")} className={`${styles.a} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ left: "73%", top: "55%", font: "italic 700 .95cqw var(--pf)", textDecoration: "underline", color: "#222" }}>
                  {data.texts["s6-c3"]}
                </div>
                <i className={styles.a} style={{ left: "13%", top: "15%", width: "6cqw", height: "6cqw", borderRadius: "50%", background: "#3b2a22", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "49%", top: "12%", width: "4.4cqw", height: "4.4cqw", borderRadius: "50%", background: "#3b2a22", pointerEvents: "none" }} />
              </div>
            </div>

            {/* 6: S6 Right (Apple of my eye) | S7 Left (30/10 day monroe 8-photo collage) */}
            <div
              className={`${styles.leaf} ${6 < n ? styles.leafF : ""}`}
              style={{ zIndex: zFor(6) }}
              onClick={() => goTo(6 < n ? 6 : 7)}
            >
              <div className={`${styles.face} ${styles.wood}`}>
                {renderPh(23, {
                  left: "20%",
                  right: "18%",
                  top: "21%",
                  height: "56%",
                  "--a": "#7a746c",
                  "--b": "#1c1a19",
                })}
                <div
                  {...edProps("s6-apple")}
                  className={`${styles.a} ${styles.editable} ${
                    canEdit ? styles.editableActive : ""
                  }`}
                  style={{
                    left: "5.5%",
                    top: "25%",
                    font: "3cqw/1.18 var(--sa)",
                    color: "#fff",
                    width: "14%",
                  }}
                >
                  {data.texts["s6-apple"]}
                </div>
                <i className={styles.a} style={{ left: "12%", top: "6%", width: "5.4cqw", height: "5.4cqw", borderRadius: "50%", background: "#b9d4ea", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "76%", top: "19%", width: "4.6cqw", height: "4.6cqw", borderRadius: "50%", background: "#b9d4ea", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "16%", top: "55%", width: "4.6cqw", height: "4.6cqw", borderRadius: "50%", background: "#b9d4ea", pointerEvents: "none" }} />
                <i className={styles.a} style={{ left: "76%", top: "84%", width: "5.4cqw", height: "5.4cqw", borderRadius: "50%", background: "#b9d4ea", pointerEvents: "none" }} />
                <div className={styles.a} style={{ left: "12%", top: "2%", color: "#e5b84a", font: "2cqw var(--sa)", pointerEvents: "none" }}>✦</div>
                <div className={styles.a} style={{ left: "88%", top: "6%", color: "#e5b84a", font: "1.6cqw var(--sa)", pointerEvents: "none" }}>★</div>
                <div className={styles.a} style={{ left: "86%", top: "75%", color: "#e5b84a", font: "1.6cqw var(--sa)", pointerEvents: "none" }}>★</div>
                <div className={styles.a} style={{ left: "10%", top: "90%", color: "#d9c9a0", font: "1.6cqw var(--sa)", pointerEvents: "none" }}>★</div>
              </div>

              <div className={`${styles.face} ${styles.faceK} ${styles.slate}`}>
                <div {...edProps("s7-l")} className={`${styles.a} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ left: "5%", top: "3.5%", font: "1.5cqw var(--te)", color: "#fff" }}>
                  {data.texts["s7-l"]}
                </div>
                <div {...edProps("s7-m")} className={`${styles.a} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ left: "35%", right: "35%", top: "3.5%", textAlign: "center", font: "1.5cqw var(--te)", color: "#fff" }}>
                  {data.texts["s7-m"]}
                </div>
                <div {...edProps("s7-r")} className={`${styles.a} ${styles.editable} ${canEdit ? styles.editableActive : ""}`} style={{ right: "5%", top: "3.5%", font: "1.5cqw var(--te)", color: "#fff" }}>
                  {data.texts["s7-r"]}
                </div>
                {renderPh(24, { left: "18%", top: "20.5%", width: "27%", height: "12%", "--a": "#6b4a2a", "--b": "#14100c" })}
                {renderPh(25, { left: "46%", top: "17%", width: "27%", height: "17.5%", "--a": "#9a7a4a", "--b": "#1f1812" })}
                {renderPh(26, { left: "9%", top: "35%", width: "23%", height: "21.5%", "--a": "#b0563a", "--b": "#2a1a14" })}
                {renderPh(27, { left: "32.5%", top: "35%", width: "35%", height: "30%", "--a": "#c9a79a", "--b": "#3a2a26" })}
                {renderPh(28, { left: "68%", top: "35%", width: "23%", height: "17%", "--a": "#4a3a30", "--b": "#120e0c" })}
                {renderPh(29, { left: "68%", top: "53%", width: "23%", height: "18%", "--a": "#6d625a", "--b": "#1a1715" })}
                {renderPh(30, { left: "14.5%", top: "57.5%", width: "17.5%", height: "16%", "--a": "#d6a35a", "--b": "#3a2515" })}
                {renderPh(31, { left: "33%", top: "65.5%", width: "34.5%", height: "17%", "--a": "#7a5a3a", "--b": "#17110d" })}
              </div>
            </div>

            {/* 7: S7 Right (2x2 B&W) | S8 Left (Olive Constellation) */}
            <div
              className={`${styles.leaf} ${7 < n ? styles.leafF : ""}`}
              style={{ zIndex: zFor(7) }}
              onClick={() => goTo(7 < n ? 7 : 8)}
            >
              <div
                className={styles.face}
                style={{
                  display: "grid",
                  gridTemplate: "1fr 1fr / 1fr 1fr",
                  background: "#999",
                }}
              >
                <div style={{ position: "relative" }}>
                  {renderPh(32, { inset: 0, "--a": "#b9b9b9", "--b": "#444" }, { bw: true })}
                </div>
                <div style={{ position: "relative" }}>
                  {renderPh(33, { inset: 0, "--a": "#d0d0d0", "--b": "#555" }, { bw: true })}
                </div>
                <div style={{ position: "relative" }}>
                  {renderPh(34, { inset: 0, "--a": "#c4c4c4", "--b": "#4a4a4a" }, { bw: true })}
                </div>
                <div style={{ position: "relative" }}>
                  {renderPh(35, { inset: 0, "--a": "#aaa", "--b": "#3c3c3c" }, { bw: true })}
                </div>
              </div>

              <div className={`${styles.face} ${styles.faceK} ${styles.olive}`}>
                <svg
                  className={styles.a}
                  style={{ inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                  viewBox="0 0 100 140"
                >
                  <polyline
                    points="9,50 38,35 46,56 52,88 61,70 82,49 67,38 84,82"
                    fill="none"
                    stroke="#fff"
                    strokeWidth=".6"
                    strokeLinejoin="round"
                  />
                  <g fill="#fff">
                    <circle cx="9" cy="50" r="1.5" />
                    <circle cx="38" cy="35" r="1.5" />
                    <circle cx="46" cy="56" r="1.5" />
                    <circle cx="52" cy="88" r="1.5" />
                    <circle cx="61" cy="70" r="1.5" />
                    <circle cx="82" cy="49" r="1.5" />
                    <circle cx="67" cy="38" r="1.5" />
                    <circle cx="84" cy="82" r="1.5" />
                    <circle cx="9" cy="10" r="1.1" />
                    <circle cx="82" cy="17" r="1.1" />
                    <circle cx="48" cy="26" r="1.1" />
                    <circle cx="21" cy="75" r="1.1" />
                    <circle cx="62" cy="108" r="1.1" />
                    <circle cx="27" cy="126" r="1.1" />
                  </g>
                  <g style={{ font: "3.2px Arial,sans-serif", fill: "#fff" }}>
                    <text x="8" y="47">I</text>
                    <text x="38" y="32">love</text>
                    <text x="48" y="60">you</text>
                    <text x="46" y="93">to</text>
                    <text x="62" y="76">the</text>
                    <text x="83" y="47">moon</text>
                    <text x="66" y="35">and</text>
                    <text x="81" y="88">back</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* 8: S8 Right (Striped Fabric + 2 B&W) | Back Cover */}
            <div
              className={`${styles.leaf} ${8 < n ? styles.leafF : ""}`}
              style={{ zIndex: zFor(8) }}
              onClick={() => goTo(8 < n ? 8 : 9)}
            >
              <div className={`${styles.face} ${styles.stripe}`}>
                <div
                  className={styles.pol}
                  style={{
                    left: "15%",
                    top: "10%",
                    width: "70%",
                    height: "37%",
                    padding: "2cqw",
                    background: "#f6f1e4",
                  }}
                >
                  {renderPh(36, { inset: "2cqw", "--a": "#9d9d9d", "--b": "#2a2a2a" }, { bw: true })}
                </div>
                <div
                  className={styles.pol}
                  style={{
                    left: "15%",
                    top: "54%",
                    width: "70%",
                    height: "37%",
                    padding: "2cqw",
                    background: "#f6f1e4",
                  }}
                >
                  {renderPh(37, { inset: "2cqw", "--a": "#8a8a8a", "--b": "#222" }, { bw: true })}
                </div>
              </div>

              <div className={`${styles.face} ${styles.faceK} ${styles.cover}`}>
                <div
                  {...edProps("bc-title")}
                  className={`${styles.a} ${styles.editable} ${
                    canEdit ? styles.editableActive : ""
                  }`}
                  style={{
                    left: 0,
                    right: 0,
                    top: "44%",
                    textAlign: "center",
                    font: "5cqw/1 var(--sc)",
                    color: "#fff",
                  }}
                >
                  {data.texts["bc-title"]}
                </div>
                <div
                  {...edProps("bc-foot")}
                  className={`${styles.a} ${styles.editable} ${
                    canEdit ? styles.editableActive : ""
                  }`}
                  style={{
                    left: 0,
                    right: 0,
                    top: "56%",
                    textAlign: "center",
                    font: "1.1cqw var(--te)",
                    color: "var(--gold)",
                  }}
                >
                  {data.texts["bc-foot"]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exact Circular Prev / Next Controls (.ui) */}
        <div className={styles.ui}>
          <button
            type="button"
            className={styles.uiBtn}
            onClick={() => go(-1)}
            disabled={n === 0}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.uiBtn}
            onClick={() => go(1)}
            disabled={n === LEAF_COUNT}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </main>

      {/* Share Links Banner After Publishing */}
      {!readOnly && savedSlug && (
        <div className="mb-3 mx-3 px-4 py-2.5 rounded-2xl bg-[#f7f1df] text-[#2a2220] border border-[#eee6b6] shadow-lg flex flex-wrap items-center gap-3 text-xs z-20 max-w-2xl font-sans">
          <div className="flex items-center gap-1.5 font-bold text-[#7b1f1f]">
            <Sparkles className="h-3.5 w-3.5 text-[#b58a2d]" />
            <span>Published:</span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(publicShareUrl);
              setCopiedPublic(true);
              setTimeout(() => setCopiedPublic(false), 2200);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#7b1f1f] text-[#f7f1df] font-semibold cursor-pointer"
          >
            {copiedPublic ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copiedPublic ? "Copied Public Link!" : "Copy Public Link"}</span>
          </button>

          {secretEditUrl && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(secretEditUrl);
                setCopiedSecret(true);
                setTimeout(() => setCopiedSecret(false), 2200);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-[#7b1f1f] border border-[#7b1f1f]/25 font-semibold cursor-pointer"
            >
              {copiedSecret ? <Check className="h-3 w-3" /> : <KeyRound className="h-3 w-3" />}
              <span>{copiedSecret ? "Copied Secret Edit URL!" : "Copy Owner Edit URL"}</span>
            </button>
          )}

          <a
            href={publicShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#7b1f1f] hover:underline font-semibold"
          >
            <span>Open</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#3d0c0c] text-[#f7f1df] text-xs font-semibold font-sans shadow-xl border border-[#eee6b6]/50">
          {toast}
        </div>
      )}

      {/* Premium Unlock Modal ($7.99) */}
      <PremiumUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        price="$7.99"
        templateId={ANNIVERSARY_TEMPLATE_ID}
        templateTitle="1 Year With You (Velvet Anniversary Flipbook)"
        bullets={[
          "Closed wine-red velvet cover, 8 bespoke 3:2 spreads (16 pages) & matching back cover",
          "38 photo slots: Polaroids, lace-edged heart, ring binder, 8-photo collage & constellation",
          "Editable Indonesian + English placeholders, permanent public link & owner edit URL",
        ]}
        onUnlocked={() => {
          setIsUnlocked(true);
          setIsUnlockModalOpen(false);
          showToast("🎉 1 Year With You unlocked! Tap any photo or text to customize.");
        }}
      />
    </div>
  );
}
