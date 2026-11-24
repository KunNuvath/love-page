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
  LOVE_STORY_TEMPLATE_ID,
  LOVE_STORY_PHOTO_COUNT,
  LOVE_STORY_PAGE_COUNT,
  createDefaultLoveStory,
  sanitizeLoveStory,
  type LoveStoryData,
} from "@/src/lib/love-story";
import PremiumUnlockModal from "@/src/components/adventure/PremiumUnlockModal";
import styles from "./lovestory.module.css";

const DRAFT_STORAGE_KEY = "lovepage_love_story_draft_v1";

type CSSVars = React.CSSProperties & { "--r"?: string };

interface LoveStoryBookProps {
  readOnly?: boolean;
  initialData?: LoveStoryData;
  initialSlug?: string;
  initialEditToken?: string;
}

export default function LoveStoryBook({
  readOnly = false,
  initialData,
  initialSlug,
  initialEditToken,
}: LoveStoryBookProps) {
  const { user, openAuthModal } = useAuth();

  const [data, setData] = useState<LoveStoryData>(() => initialData || createDefaultLoveStory());
  const [pageIdx, setPageIdx] = useState(0); // 0..11
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
  const singleFileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const activeSlotRef = useRef<number | null>(null);

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
          setData(sanitizeLoveStory(parsed));
        }
      } catch {}
    }

    if (initialEditToken) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(hasTemplateAccess(user, LOVE_STORY_TEMPLATE_ID));
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
        if (hasTemplateAccess(latestUser, LOVE_STORY_TEMPLATE_ID)) {
          try {
            localStorage.setItem(`lovepage_unlocked_${LOVE_STORY_TEMPLATE_ID}`, "true");
            if (latestUser?.id) {
              localStorage.setItem(
                `lovepage_unlocked_${LOVE_STORY_TEMPLATE_ID}_${latestUser.id}`,
                "true"
              );
            }
          } catch {}
          setIsUnlocked(true);
          showToast("🎉 Love Story unlocked! Tap any photo or text to customize.");
          window.history.replaceState({}, "", "/love-story");
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

  const go = useCallback((d: 1 | -1) => {
    setPageIdx((prev) => Math.max(0, Math.min(LOVE_STORY_PAGE_COUNT - 1, prev + d)));
  }, []);

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
        const next: LoveStoryData = {
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
        templateType: "love-story",
        slotName: `photo-${slotIdx + 1}`,
      });
      setData((prev) => {
        const nextPhotos = [...prev.photos];
        nextPhotos[slotIdx] = publicUrl;
        const next: LoveStoryData = { ...prev, photos: nextPhotos };
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
    showToast(`Uploading ${Math.min(files.length, LOVE_STORY_PHOTO_COUNT)} photo(s)...`);

    const targetSlots: number[] = [];
    for (let i = 0; i < LOVE_STORY_PHOTO_COUNT && targetSlots.length < files.length; i++) {
      if (!data.photos[i]) targetSlots.push(i);
    }
    for (let i = 0; i < LOVE_STORY_PHOTO_COUNT && targetSlots.length < files.length; i++) {
      if (!targetSlots.includes(i)) targetSlots.push(i);
    }

    for (let idx = 0; idx < targetSlots.length; idx++) {
      const slotIdx = targetSlots[idx];
      const file = files[idx];
      setUploadingIndex(slotIdx);
      try {
        const publicUrl = await uploadImage(file, {
          templateType: "love-story",
          slotName: `photo-${slotIdx + 1}`,
        });
        setData((prev) => {
          const nextPhotos = [...prev.photos];
          nextPhotos[slotIdx] = publicUrl;
          const next: LoveStoryData = { ...prev, photos: nextPhotos };
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
    showToast("Photos added to your Love Story!");
  };

  const executeSave = async () => {
    setIsSaving(true);
    try {
      const authHeaders = await getAuthHeaders();
      if (savedSlug && editToken) {
        const res = await fetch(`/api/love-story/${savedSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ editToken, data }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not update Love Story.");
        showToast("Love Story changes saved!");
        return;
      }

      const res = await fetch("/api/love-story", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.slug) {
        throw new Error(json.error || "Could not save Love Story.");
      }

      setSavedSlug(json.slug);
      setEditToken(json.editToken || "");
      try {
        localStorage.setItem(`lovepage_love_story_token_${json.slug}`, json.editToken || "");
      } catch {}
      showToast("Love Story published! Copy your share link below.");
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
        title: "Sign In to Publish Your Love Story",
        subtitle: "Sign in so your 12-page Love Story link stays saved to your account.",
        onSuccess: () => executeSave(),
      });
      return;
    }
    executeSave();
  };

  const renderEditable = (
    key: string,
    className: string,
    style?: CSSVars
  ) => (
    <div
      contentEditable={canEdit}
      suppressContentEditableWarning
      onClick={(e) => {
        if (!readOnly && interactionMode === "edit") {
          e.stopPropagation();
          if (!isUnlocked) setIsUnlockModalOpen(true);
        }
      }}
      onBlur={(e) => handleTextBlur(key, e)}
      className={`${className} ${styles.editable} ${canEdit ? styles.editableActive : ""}`}
      style={style}
    >
      {data.texts[key]}
    </div>
  );

  const renderPhotoSlot = (
    slotIdx: number,
    extraClass: string,
    style?: CSSVars
  ) => {
    const url = data.photos[slotIdx];
    const isUploading = uploadingIndex === slotIdx;
    return (
      <div
        role={!readOnly && interactionMode === "edit" ? "button" : undefined}
        tabIndex={!readOnly && interactionMode === "edit" ? 0 : undefined}
        onClick={(e) => handlePhotoSlotClick(slotIdx, e)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handlePhotoSlotClick(slotIdx, e as unknown as React.MouseEvent);
          }
        }}
        className={`${styles.ph} ${extraClass} ${url ? styles.phOn : ""} ${
          !readOnly && interactionMode === "edit" ? styles.phEditable : ""
        }`}
        style={{
          ...style,
          ...(url ? { backgroundImage: `url("${url}")` } : {}),
        }}
        title={
          !readOnly && interactionMode === "edit"
            ? `Click to upload Photo ${slotIdx + 1}`
            : undefined
        }
      >
        {!url && <span>{isUploading ? "uploading…" : "＋ photo"}</span>}
        {url && isUploading && <span className={styles.uploadingBadge}>uploading…</span>}
      </div>
    );
  };

  const renderPolaroid = (
    slotIdx: number,
    captionKey: string,
    style: CSSVars,
    big = false
  ) => (
    <div className={`${styles.pol} ${big ? styles.polBig : ""}`} style={style}>
      <span className={styles.tape} />
      {renderPhotoSlot(slotIdx, styles.phIn)}
      <em
        contentEditable={canEdit}
        suppressContentEditableWarning
        onClick={(e) => {
          if (!readOnly && interactionMode === "edit") {
            e.stopPropagation();
            if (!isUnlocked) setIsUnlockModalOpen(true);
          }
        }}
        onBlur={(e) => handleTextBlur(captionKey, e)}
        className={`${styles.polCap} ${styles.editable} ${
          canEdit ? styles.editableActive : ""
        }`}
      >
        {data.texts[captionKey]}
      </em>
    </div>
  );

  const publicShareUrl =
    typeof window !== "undefined" && savedSlug
      ? `${window.location.origin}/love-story/${savedSlug}`
      : savedSlug
        ? `/love-story/${savedSlug}`
        : "";
  const secretEditUrl =
    typeof window !== "undefined" && savedSlug && editToken
      ? `${window.location.origin}/love-story/${savedSlug}?edit=${editToken}`
      : "";

  const pages: React.ReactNode[] = [
    /* 1 — Plaid Cover */
    <div
      key="p1"
      className={`${styles.pg} ${styles.plaid}`}
      onClick={() => {
        if (pageIdx === 0) go(1);
      }}
    >
      {renderEditable("p1-kick", styles.kick, { left: "14cqw", top: "50cqw", width: "72cqw", "--r": "0deg" })}
      {renderEditable("p1-ttl", styles.ttl, { left: "14cqw", top: "58cqw", width: "72cqw", "--r": "0deg" })}
      {renderEditable("p1-hand", styles.hand, { left: "14cqw", top: "98cqw", width: "60cqw", "--r": "0deg" })}
      <i className={`${styles.s} ${styles.daisies}`} style={{ left: "62cqw", top: "100cqw", width: "24cqw", "--r": "8deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.butterfly}`} style={{ left: "14cqw", top: "112cqw", width: "20cqw", "--r": "-12deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.letters}`} style={{ left: "8cqw", top: "136cqw", width: "30cqw", "--r": "-5deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.coffee}`} style={{ left: "44cqw", top: "142cqw", width: "22cqw", "--r": "6deg" } as CSSVars} />
      <div className={styles.hint}>tap to open ›</div>
    </div>,

    /* 2 — Corduroy Letter & Polaroid */
    <div key="p2" className={`${styles.pg} ${styles.cord}`}>
      <b className={styles.star} style={{ left: "8cqw", top: "6cqw", width: "9cqw", rotate: "12deg" }} />
      <b className={styles.star} style={{ left: "86cqw", top: "100cqw", width: "7cqw", rotate: "0deg" }} />
      <div className={styles.card} style={{ left: "9cqw", top: "14cqw", width: "82cqw", height: "92cqw", "--r": "-1.2deg" } as CSSVars}>
        <span className={styles.tape} />
        <div className={styles.cardIn}>
          {renderEditable("p2-kick", styles.kick)}
          {renderEditable("p2-body", styles.hand)}
        </div>
      </div>
      {renderPolaroid(0, "p2-cap0", { left: "24cqw", top: "106cqw", width: "54cqw", "--r": "3deg" }, true)}
      <i className={`${styles.s} ${styles.letters}`} style={{ left: "1cqw", top: "124cqw", width: "30cqw", "--r": "-8deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.coffee}`} style={{ left: "68cqw", top: "148cqw", width: "24cqw", "--r": "6deg" } as CSSVars} />
      <b className={styles.star} style={{ left: "8cqw", top: "156cqw", width: "8cqw", rotate: "-10deg" }} />
      <u className={styles.pageNum}>2</u>
    </div>,

    /* 3 — Film Strip (Slots 1, 2, 3) */
    <div key="p3" className={`${styles.pg} ${styles.film}`}>
      {renderPhotoSlot(1, styles.phX, { left: "35.5cqw", top: "19.9cqw", width: "28.5cqw", height: "40cqw", "--r": "0deg" })}
      {renderPhotoSlot(2, styles.phX, { left: "35.5cqw", top: "71.8cqw", width: "28.5cqw", height: "40cqw", "--r": "0deg" })}
      {renderPhotoSlot(3, styles.phX, { left: "35.5cqw", top: "124.8cqw", width: "28.5cqw", height: "40cqw", "--r": "0deg" })}
      {renderEditable("p3-hand1", `${styles.hand} ${styles.handC}`, { left: "2cqw", top: "32cqw", width: "30cqw", "--r": "-4deg" })}
      <i className={`${styles.s} ${styles.daisies}`} style={{ left: "4cqw", top: "62cqw", width: "24cqw", "--r": "-6deg" } as CSSVars} />
      {renderEditable("p3-hand2", `${styles.hand} ${styles.handC}`, { left: "68cqw", top: "76cqw", width: "30cqw", "--r": "5deg" })}
      <i className={`${styles.s} ${styles.heart}`} style={{ left: "70cqw", top: "10cqw", width: "26cqw", "--r": "8deg" } as CSSVars} />
      {renderEditable("p3-hand3", `${styles.hand} ${styles.handC}`, { left: "2cqw", top: "132cqw", width: "30cqw", "--r": "-3deg" })}
      <i className={`${styles.s} ${styles.butterfly2}`} style={{ left: "70cqw", top: "136cqw", width: "24cqw", "--r": "10deg" } as CSSVars} />
      <u className={styles.pageNum}>3</u>
    </div>,

    /* 4 — Plaid Favourite Day (Slot 4) */
    <div key="p4" className={`${styles.pg} ${styles.plaid}`}>
      {renderPolaroid(4, "p4-cap0", { left: "20cqw", top: "50cqw", width: "60cqw", "--r": "-2deg" })}
      <i className={`${styles.s} ${styles.coffee}`} style={{ left: "10cqw", top: "124cqw", width: "24cqw", "--r": "-6deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.books}`} style={{ left: "66cqw", top: "110cqw", width: "24cqw", "--r": "5deg" } as CSSVars} />
      {renderEditable("p4-hand", `${styles.hand} ${styles.handC}`, { left: "6cqw", top: "152cqw", width: "60cqw", "--r": "-1deg" })}
      <u className={styles.pageNum}>4</u>
    </div>,

    /* 5 — Paper Milestones & Ticket */
    <div key="p5" className={`${styles.pg} ${styles.paper}`}>
      <i className={`${styles.s} ${styles.ticket}`} style={{ left: "9cqw", top: "8cqw", width: "82cqw", "--r": "-2deg" } as CSSVars} />
      <div className={styles.note} style={{ left: "8cqw", top: "58cqw", width: "66cqw", "--r": "-2deg" } as CSSVars}>
        <span className={styles.tape} />
        <b className={styles.bd}>1</b>
        {renderEditable("p5-note1-title", styles.noteTitle)}
        {renderEditable("p5-note1-sub", styles.noteSub)}
      </div>
      <div className={styles.note} style={{ left: "26cqw", top: "92cqw", width: "66cqw", "--r": "2deg" } as CSSVars}>
        <span className={styles.tape} />
        <b className={styles.bd}>2</b>
        {renderEditable("p5-note2-title", styles.noteTitle)}
        {renderEditable("p5-note2-sub", styles.noteSub)}
      </div>
      <div className={styles.note} style={{ left: "8cqw", top: "126cqw", width: "66cqw", "--r": "-1.5deg" } as CSSVars}>
        <span className={styles.tape} />
        <b className={styles.bd}>3</b>
        {renderEditable("p5-note3-title", styles.noteTitle)}
        {renderEditable("p5-note3-sub", styles.noteSub)}
      </div>
      <i className={`${styles.s} ${styles.saturn}`} style={{ left: "78cqw", top: "58cqw", width: "14cqw", "--r": "10deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.eiffel}`} style={{ left: "3cqw", top: "90cqw", width: "18cqw", "--r": "-4deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.daisies}`} style={{ left: "77cqw", top: "124cqw", width: "17cqw", "--r": "8deg" } as CSSVars} />
      {renderEditable("p5-hand", styles.hand, { left: "8cqw", top: "160cqw", width: "48cqw", "--r": "0deg" })}
      <i className={`${styles.s} ${styles.coffee}`} style={{ left: "64cqw", top: "150cqw", width: "26cqw", "--r": "-6deg" } as CSSVars} />
      <u className={styles.pageNum}>5</u>
    </div>,

    /* 6 — Paper 3 Polaroids (Slots 5, 6, 7) */
    <div key="p6" className={`${styles.pg} ${styles.paper}`}>
      {renderPolaroid(5, "p6-cap0", { left: "6cqw", top: "10cqw", width: "50cqw", "--r": "-5deg" })}
      {renderPolaroid(6, "p6-cap1", { left: "44cqw", top: "54cqw", width: "50cqw", "--r": "4deg" })}
      {renderPolaroid(7, "p6-cap2", { left: "8cqw", top: "98cqw", width: "42cqw", "--r": "-3deg" })}
      <i className={`${styles.s} ${styles.butterfly}`} style={{ left: "66cqw", top: "6cqw", width: "24cqw", "--r": "12deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.hands}`} style={{ left: "50cqw", top: "118cqw", width: "44cqw", "--r": "-3deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.teacups}`} style={{ left: "54cqw", top: "138cqw", width: "38cqw", "--r": "3deg" } as CSSVars} />
      <u className={styles.pageNum}>6</u>
    </div>,

    /* 7 — Corduroy Moon & Quote (Slot 8) */
    <div key="p7" className={`${styles.pg} ${styles.cord}`}>
      <i className={`${styles.s} ${styles.moon}`} style={{ left: "46cqw", top: "8cqw", width: "46cqw", "--r": "6deg" } as CSSVars} />
      <b className={styles.star} style={{ left: "8cqw", top: "10cqw", width: "6cqw", rotate: "0deg" }} />
      <b className={styles.star} style={{ left: "88cqw", top: "70cqw", width: "5cqw", rotate: "0deg" }} />
      {renderPolaroid(8, "p7-cap0", { left: "8cqw", top: "20cqw", width: "58cqw", "--r": "-4deg" }, true)}
      {renderEditable("p7-quote", styles.quote, { left: "12cqw", top: "102cqw", width: "76cqw", "--r": "0deg" })}
      {renderEditable("p7-author", `${styles.hand} ${styles.handC}`, { left: "12cqw", top: "134cqw", width: "76cqw", "--r": "0deg" })}
      <i className={`${styles.s} ${styles.butterfly2}`} style={{ left: "68cqw", top: "144cqw", width: "22cqw", "--r": "10deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.heart}`} style={{ left: "6cqw", top: "148cqw", width: "24cqw", "--r": "-8deg" } as CSSVars} />
      <u className={styles.pageNum}>7</u>
    </div>,

    /* 8 — Paper Cassette Playlist (Slot 9) */
    <div key="p8" className={`${styles.pg} ${styles.paper}`}>
      <i className={`${styles.s} ${styles.cassette}`} style={{ left: "9cqw", top: "9cqw", width: "82cqw", "--r": "-3deg" } as CSSVars} />
      {renderEditable("p8-kick", styles.kick, { left: "9cqw", top: "72cqw", width: "80cqw", "--r": "0deg" })}
      {renderEditable("p8-tracks", styles.type, { left: "9cqw", top: "82cqw", width: "80cqw", "--r": "0deg" })}
      {renderPolaroid(9, "p8-cap0", { left: "5cqw", top: "126cqw", width: "38cqw", "--r": "-4deg" }, true)}
      <i className={`${styles.s} ${styles.daisies}`} style={{ left: "42cqw", top: "138cqw", width: "18cqw", "--r": "-8deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.coffee}`} style={{ left: "68cqw", top: "142cqw", width: "26cqw", "--r": "8deg" } as CSSVars} />
      <u className={styles.pageNum}>8</u>
    </div>,

    /* 9 — Plaid 4-Photo Collage (Slots 10, 11, 12, 13) */
    <div key="p9" className={`${styles.pg} ${styles.plaid}`}>
      {renderPhotoSlot(10, `${styles.phX} ${styles.phF}`, { left: "14cqw", top: "48cqw", width: "33cqw", height: "36cqw", "--r": "-3deg" })}
      {renderPhotoSlot(11, `${styles.phX} ${styles.phF}`, { left: "52cqw", top: "47cqw", width: "33cqw", height: "36cqw", "--r": "3deg" })}
      {renderPhotoSlot(12, `${styles.phX} ${styles.phF}`, { left: "14cqw", top: "90cqw", width: "33cqw", height: "36cqw", "--r": "2deg" })}
      {renderPhotoSlot(13, `${styles.phX} ${styles.phF}`, { left: "52cqw", top: "89cqw", width: "33cqw", height: "36cqw", "--r": "-2deg" })}
      <i className={`${styles.s} ${styles.pisa}`} style={{ left: "78cqw", top: "2cqw", width: "14cqw", "--r": "6deg" } as CSSVars} />
      {renderEditable("p9-hand", `${styles.hand} ${styles.handC}`, { left: "4cqw", top: "140cqw", width: "62cqw", "--r": "-1deg" })}
      <i className={`${styles.s} ${styles.parcel}`} style={{ left: "6cqw", top: "152cqw", width: "20cqw", "--r": "-6deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.butterfly}`} style={{ left: "34cqw", top: "154cqw", width: "18cqw", "--r": "8deg" } as CSSVars} />
      <u className={styles.pageNum}>9</u>
    </div>,

    /* 10 — Paper Things I Love About You (Slots 14, 15) */
    <div key="p10" className={`${styles.pg} ${styles.paper}`}>
      {renderEditable("p10-ttl", `${styles.ttl} ${styles.ttlDk}`, { left: "9cqw", top: "10cqw", width: "82cqw", "--r": "0deg" })}
      {renderEditable("p10-list", `${styles.hand} ${styles.handSm}`, { left: "9cqw", top: "46cqw", width: "58cqw", "--r": "0deg" })}
      <i className={`${styles.s} ${styles.bust}`} style={{ left: "66cqw", top: "44cqw", width: "28cqw", "--r": "3deg" } as CSSVars} />
      {renderPolaroid(14, "p10-cap0", { left: "4cqw", top: "112cqw", width: "44cqw", "--r": "-4deg" }, true)}
      {renderPolaroid(15, "p10-cap1", { left: "50cqw", top: "116cqw", width: "44cqw", "--r": "4deg" }, true)}
      <i className={`${styles.s} ${styles.daisies}`} style={{ left: "72cqw", top: "96cqw", width: "16cqw", "--r": "-8deg" } as CSSVars} />
      <u className={styles.pageNum}>10</u>
    </div>,

    /* 11 — Corduroy Our Promises (Slots 16, 17) */
    <div key="p11" className={`${styles.pg} ${styles.cord}`}>
      <i className={`${styles.s} ${styles.openbook}`} style={{ left: "9cqw", top: "10cqw", width: "82cqw", "--r": "-3deg" } as CSSVars} />
      {renderEditable("p11-kick", styles.kick, { left: "12cqw", top: "56cqw", width: "76cqw", "--r": "0deg" })}
      {renderEditable("p11-body", `${styles.hand} ${styles.handSm}`, { left: "12cqw", top: "66cqw", width: "76cqw", "--r": "0deg" })}
      {renderPolaroid(16, "p11-cap0", { left: "8cqw", top: "118cqw", width: "38cqw", "--r": "-4deg" })}
      {renderPolaroid(17, "p11-cap1", { left: "54cqw", top: "122cqw", width: "34cqw", "--r": "5deg" })}
      <i className={`${styles.s} ${styles.heart}`} style={{ left: "40cqw", top: "150cqw", width: "22cqw", "--r": "8deg" } as CSSVars} />
      <b className={styles.star} style={{ left: "44cqw", top: "110cqw", width: "7cqw", rotate: "-8deg" }} />
      <u className={styles.pageNum}>11</u>
    </div>,

    /* 12 — Plaid Finale */
    <div key="p12" className={`${styles.pg} ${styles.plaid}`}>
      {renderEditable("p12-kick", styles.kick, { left: "14cqw", top: "50cqw", width: "72cqw", "--r": "0deg" })}
      {renderEditable("p12-ttl", styles.ttl, { left: "14cqw", top: "58cqw", width: "72cqw", "--r": "0deg" })}
      {renderEditable("p12-hand", styles.hand, { left: "14cqw", top: "98cqw", width: "60cqw", "--r": "0deg" })}
      <i className={`${styles.s} ${styles.butterfly2}`} style={{ left: "68cqw", top: "104cqw", width: "20cqw", "--r": "10deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.moon}`} style={{ left: "6cqw", top: "142cqw", width: "24cqw", "--r": "0deg" } as CSSVars} />
      <i className={`${styles.s} ${styles.ticket}`} style={{ left: "30cqw", top: "152cqw", width: "36cqw", "--r": "-4deg" } as CSSVars} />
      <u className={styles.pageNum}>12</u>
    </div>,
  ];

  return (
    <div className={styles.shell}>
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f2e7d0]/12 hover:bg-[#f2e7d0]/20 text-[#f2e7d0] border border-[#f2e7d0]/25 text-xs sm:text-sm font-semibold transition-all active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#c9a24a]" />
            <span>{readOnly ? "LovePage" : "Templates"}</span>
          </Link>

          {!readOnly && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f2e7d0]/10 border border-[#c9a24a]/35 text-[11px] font-bold text-[#c9a24a]">
              <Layers className="h-3.5 w-3.5" />
              <span>Vol. 06 • Love Story (12 Pages)</span>
            </span>
          )}
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            {/* Edit / Flip Toggle */}
            <button
              type="button"
              onClick={() =>
                setInteractionMode((prev) => (prev === "edit" ? "flip" : "edit"))
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f2e7d0]/12 hover:bg-[#f2e7d0]/20 text-[#f2e7d0] border border-[#f2e7d0]/25 text-xs font-semibold transition-all cursor-pointer active:scale-95"
              title={
                interactionMode === "edit"
                  ? "Switch to Preview Flip mode"
                  : "Switch to Edit mode"
              }
            >
              {interactionMode === "edit" ? (
                <>
                  <Eye className="h-3.5 w-3.5 text-[#c9a24a]" />
                  <span>Preview</span>
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5 text-[#c9a24a]" />
                  <span>Edit</span>
                </>
              )}
            </button>

            {/* Batch Upload */}
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f2e7d0]/12 hover:bg-[#f2e7d0]/20 text-[#f2e7d0] border border-[#f2e7d0]/25 text-xs font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isBatchUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#c9a24a]" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5 text-[#c9a24a]" />
              )}
              <span className="hidden xs:inline">Batch Upload</span>
            </button>

            {/* Unlock or Publish & Share */}
            {!isUnlocked ? (
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#c9a24a] hover:bg-[#d8b35b] text-[#2a070c] text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Crown className="h-3.5 w-3.5 text-[#4a0f17] fill-[#4a0f17]" />
                <span>Unlock • $5.99</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveClick}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#c9a24a] hover:bg-[#d8b35b] text-[#2a070c] text-xs sm:text-sm font-extrabold shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5 text-[#4a0f17]" />
                )}
                <span>{savedSlug ? "Save Changes" : "Publish & Share"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Centered 9:16 Book Stage */}
      <main className={styles.stageWrap}>
        <div
          className={`${styles.book} ${readOnly ? styles.bookReadOnly : ""}`}
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
          {pages.map((content, k) => (
            <section
              key={k}
              className={`${styles.leaf} ${k < pageIdx ? styles.leafTurned : ""}`}
              style={{ zIndex: LOVE_STORY_PAGE_COUNT - k }}
            >
              {content}
            </section>
          ))}
        </div>

        {/* Clean Bottom Navigation (no + add frame button) */}
        <nav className={styles.nav} aria-label="Flipbook page navigation">
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => go(-1)}
            disabled={pageIdx === 0}
          >
            ‹ back
          </button>
          <span>
            {pageIdx + 1} / {LOVE_STORY_PAGE_COUNT}
          </span>
          <button
            type="button"
            className={styles.navBtn}
            onClick={() => go(1)}
            disabled={pageIdx === LOVE_STORY_PAGE_COUNT - 1}
          >
            next ›
          </button>
        </nav>
      </main>

      {/* Share Links Banner After Publishing */}
      {!readOnly && savedSlug && (
        <div className="mb-3 mx-3 px-4 py-2.5 rounded-2xl bg-[#f2e7d0] text-[#3b2a1d] border border-[#c9a24a]/60 shadow-lg flex flex-wrap items-center gap-3 text-xs z-20 max-w-2xl font-sans">
          <div className="flex items-center gap-1.5 font-bold text-[#4a0f17]">
            <Sparkles className="h-3.5 w-3.5 text-[#c9a24a]" />
            <span>Published:</span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(publicShareUrl);
              setCopiedPublic(true);
              setTimeout(() => setCopiedPublic(false), 2200);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4a0f17] text-[#f2e7d0] font-semibold cursor-pointer"
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
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-[#4a0f17] border border-[#4a0f17]/25 font-semibold cursor-pointer"
            >
              {copiedSecret ? (
                <Check className="h-3 w-3" />
              ) : (
                <KeyRound className="h-3 w-3" />
              )}
              <span>{copiedSecret ? "Copied Secret Edit URL!" : "Copy Owner Edit URL"}</span>
            </button>
          )}

          <a
            href={publicShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#4a0f17] hover:underline font-semibold"
          >
            <span>Open</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#2a070c] text-[#f2e7d0] text-xs font-semibold font-sans shadow-xl border border-[#c9a24a]/50">
          {toast}
        </div>
      )}

      {/* Premium Unlock Modal ($5.99) */}
      <PremiumUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        price="$5.99"
        templateId={LOVE_STORY_TEMPLATE_ID}
        templateTitle="Love Story (12-Page Vintage Scrapbook)"
        bullets={[
          "12 handcrafted 3D flip pages on vintage plaid, wine corduroy, film strip & parchment",
          "18 photo slots + 18 antique stickers (cassette, ticket, moon, coffee, daisies & more)",
          "Editable handwritten notes, permanent public link & secret owner edit URL",
        ]}
        onUnlocked={() => {
          setIsUnlocked(true);
          setIsUnlockModalOpen(false);
          showToast("🎉 Love Story unlocked! Tap any photo or text to customize.");
        }}
      />
    </div>
  );
}
