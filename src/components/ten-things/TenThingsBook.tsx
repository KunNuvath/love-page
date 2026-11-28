"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
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
  TEN_THINGS_TEMPLATE_ID,
  TEN_THINGS_PHOTO_COUNT,
  TEN_THINGS_LEAF_COUNT,
  createDefaultTenThings,
  sanitizeTenThings,
  type TenThingsData,
} from "@/src/lib/ten-things";
import PremiumUnlockModal from "@/src/components/adventure/PremiumUnlockModal";
import styles from "./tenthings.module.css";

const DRAFT_STORAGE_KEY = "lovepage_ten_things_draft_v1";

type PhotoVars = React.CSSProperties & {
  "--img"?: string;
};

interface TenThingsBookProps {
  readOnly?: boolean;
  initialData?: TenThingsData;
  initialSlug?: string;
  initialEditToken?: string;
}

export default function TenThingsBook({
  readOnly = false,
  initialData,
  initialSlug,
  initialEditToken,
}: TenThingsBookProps) {
  const { user, openAuthModal } = useAuth();

  const [data, setData] = useState<TenThingsData>(
    () => initialData || createDefaultTenThings()
  );
  const [cur, setCur] = useState(0); // 0 (Cover) .. 6 (The end)
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
        if (raw) setData(sanitizeTenThings(JSON.parse(raw)));
      } catch {}
    }
    if (initialEditToken) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(hasTemplateAccess(user, TEN_THINGS_TEMPLATE_ID));
    }
  }, [readOnly, initialData, initialEditToken, user]);

  // Verify unlock when returning from Paddle checkout (?paid=1)
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
        if (hasTemplateAccess(latestUser, TEN_THINGS_TEMPLATE_ID)) {
          try {
            localStorage.setItem(`lovepage_unlocked_${TEN_THINGS_TEMPLATE_ID}`, "true");
            if (latestUser?.id) {
              localStorage.setItem(
                `lovepage_unlocked_${TEN_THINGS_TEMPLATE_ID}_${latestUser.id}`,
                "true"
              );
            }
          } catch {}
          setIsUnlocked(true);
          showToast("🎉 10 Things I Love About You unlocked! Tap any photo or text to customize.");
          window.history.replaceState({}, "", "/ten-things");
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
    setCur((prev) => {
      const clamped = Math.max(0, Math.min(TEN_THINGS_LEAF_COUNT, target));
      if (clamped === prev) return prev;
      const movedLeaf = clamped > prev ? prev : clamped;
      setMovingIdx(movedLeaf);
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      moveTimerRef.current = setTimeout(() => setMovingIdx(null), 920);
      return clamped;
    });
  }, []);

  const go = useCallback(
    (d: 1 | -1) => {
      goTo(cur + d);
    },
    [cur, goTo]
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
        const next: TenThingsData = {
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
        templateType: "ten-things",
        slotName: `photo-${slotIdx + 1}`,
      });
      setData((prev) => {
        const nextPhotos = [...prev.photos];
        nextPhotos[slotIdx] = publicUrl;
        const next: TenThingsData = { ...prev, photos: nextPhotos };
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
    showToast(`Uploading ${Math.min(files.length, TEN_THINGS_PHOTO_COUNT)} photo(s)...`);

    const targetSlots: number[] = [];
    for (let i = 0; i < TEN_THINGS_PHOTO_COUNT && targetSlots.length < files.length; i++) {
      if (!data.photos[i]) targetSlots.push(i);
    }
    for (let i = 0; i < TEN_THINGS_PHOTO_COUNT && targetSlots.length < files.length; i++) {
      if (!targetSlots.includes(i)) targetSlots.push(i);
    }

    for (let idx = 0; idx < targetSlots.length; idx++) {
      const slotIdx = targetSlots[idx];
      const file = files[idx];
      setUploadingIndex(slotIdx);
      try {
        const publicUrl = await uploadImage(file, {
          templateType: "ten-things",
          slotName: `photo-${slotIdx + 1}`,
        });
        setData((prev) => {
          const nextPhotos = [...prev.photos];
          nextPhotos[slotIdx] = publicUrl;
          const next: TenThingsData = { ...prev, photos: nextPhotos };
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
    showToast("Photos added to your 10 Things flipbook!");
  };

  const executeSave = async () => {
    setIsSaving(true);
    try {
      const authHeaders = await getAuthHeaders();
      if (savedSlug && editToken) {
        const res = await fetch(`/api/ten-things/${savedSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify({ editToken, data }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not update flipbook.");
        showToast("Flipbook changes saved!");
        return;
      }

      const res = await fetch("/api/ten-things", {
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
        localStorage.setItem(`lovepage_ten_things_token_${json.slug}`, json.editToken || "");
      } catch {}
      showToast("Flipbook published! Copy your share link below.");
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
        subtitle: "Sign in so your 10 Things I Love About You flipbook stays saved to your account.",
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
    extraClass: string,
    opts?: { style?: React.CSSProperties }
  ) => {
    const url = data.photos[slotIdx];
    const merged: PhotoVars = {
      ...(opts?.style || {}),
      ...(url ? { "--img": `url("${url}")` } : {}),
    };
    return (
      <i
        role={!readOnly && interactionMode === "edit" ? "button" : undefined}
        onClick={(e) => handlePhotoSlotClick(slotIdx, e)}
        className={`${styles.ph} ${extraClass} ${url ? styles.phHas : ""} ${
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

  const leafZIndex = (idx: number) => {
    if (movingIdx === idx) return TEN_THINGS_LEAF_COUNT + 2;
    return idx < cur ? idx + 1 : TEN_THINGS_LEAF_COUNT - idx;
  };

  const bookTransform =
    cur === 0
      ? "translateX(-25%)"
      : cur === TEN_THINGS_LEAF_COUNT
        ? "translateX(25%)"
        : "none";

  const pageLabel =
    cur === 0
      ? "Cover"
      : cur === TEN_THINGS_LEAF_COUNT
        ? "The end"
        : `Pages ${cur * 2 - 1}–${cur * 2}`;

  const filledCount = data.photos.filter(Boolean).length;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.lovepage.site";
  const publicShareUrl = savedSlug ? `${origin}/ten-things/${savedSlug}` : "";
  const secretEditUrl =
    savedSlug && editToken ? `${origin}/ten-things/${savedSlug}?edit=${editToken}` : "";

  const copyText = async (text: string, which: "public" | "secret") => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === "public") {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 2000);
      } else {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      }
      showToast("Link copied to clipboard!");
    } catch {}
  };

  return (
    <div
      className={`${styles.root} ${readOnly ? styles.rootReadOnly : ""}`}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchStartX.current = null;
      }}
    >
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

      {/* ── Top Bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarGroup}>
          <Link href="/templates" className={styles.pillBtn}>
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Templates</span>
          </Link>
          <span className={styles.pillBtn} style={{ cursor: "default" }}>
            <Sparkles className="h-3.5 w-3.5 text-[#f6e9b8]" />
            <span>10 Things I Love About You</span>
            {!readOnly && (
              <span style={{ opacity: 0.78 }}>
                • {filledCount}/{TEN_THINGS_PHOTO_COUNT} photos
              </span>
            )}
          </span>
        </div>

        {!readOnly && (
          <div className={styles.topBarGroup}>
            <button
              type="button"
              onClick={() =>
                setInteractionMode((m) => (m === "edit" ? "flip" : "edit"))
              }
              className={`${styles.pillBtn} ${
                interactionMode === "flip" ? styles.pillBtnActive : ""
              }`}
              title="Switch between editing photos/text and previewing page turns"
            >
              {interactionMode === "edit" ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview Flip</span>
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Back to Edit</span>
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
              className={styles.pillBtn}
            >
              {isBatchUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              <span>Batch Upload</span>
            </button>

            {isUnlocked ? (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveClick}
                className={`${styles.pillBtn} ${styles.pillBtnGold}`}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5" />
                )}
                <span>{savedSlug ? "Save Updates" : "Publish & Share"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(true)}
                className={`${styles.pillBtn} ${styles.pillBtnGold}`}
              >
                <Crown className="h-3.5 w-3.5" />
                <span>Unlock • $6.00</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Share Links Banner */}
      {publicShareUrl && !readOnly && (
        <div className={styles.shareBanner}>
          <div className={styles.shareRow}>
            <div>
              <strong>Public Share Link:</strong>{" "}
              <span className={styles.shareUrl}>{publicShareUrl}</span>
            </div>
            <div className={styles.topBarGroup}>
              <button
                type="button"
                onClick={() => copyText(publicShareUrl, "public")}
                className={styles.pillBtn}
              >
                {copiedPublic ? (
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedPublic ? "Copied" : "Copy Link"}</span>
              </button>
              <a
                href={publicShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pillBtn}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open</span>
              </a>
            </div>
          </div>
          {secretEditUrl && (
            <div className={styles.shareRow}>
              <div>
                <KeyRound className="inline h-3.5 w-3.5 mr-1 text-[#f6e9b8]" />
                <strong>Secret Owner Edit Link:</strong>{" "}
                <span className={styles.shareUrl}>{secretEditUrl}</span>
              </div>
              <button
                type="button"
                onClick={() => copyText(secretEditUrl, "secret")}
                className={styles.pillBtn}
              >
                {copiedSecret ? (
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copiedSecret ? "Copied" : "Copy Edit Link"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 3D Flipbook Stage ── */}
      <div className={styles.stageWrap}>
        <div className={styles.stage}>
          <div
            className={styles.book}
            style={{ transform: bookTransform }}
          >
            {/* Leaf 0: Cover / #1 Your Smile */}
            <div
              className={`${styles.leaf} ${cur > 0 ? styles.flipped : ""}`}
              style={{ zIndex: leafZIndex(0) }}
            >
              <div
                className={`${styles.face} ${styles.front} ${styles.cover}`}
                onClick={() => go(1)}
              >
                <div
                  className={`${styles.coverBig} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("c-num")}
                >
                  {data.texts["c-num"]}
                </div>
                <div
                  className={`${styles.coverT1} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("c-t1")}
                >
                  {data.texts["c-t1"]}
                </div>
                <div
                  className={`${styles.script} ${styles.coverT2} ${
                    canEdit ? styles.editableText : ""
                  }`}
                  {...edProps("c-t2")}
                >
                  {data.texts["c-t2"]}
                </div>

                <div className={styles.locket}>
                  <span className={`${styles.locketHeart} ${styles.locketA}`}>
                    {renderPh(0, styles.locketPh)}
                  </span>
                  <span className={`${styles.locketHeart} ${styles.locketB}`}>
                    {renderPh(1, styles.locketPh)}
                  </span>
                </div>

                <ul className={styles.tlist}>
                  <li>
                    <b>01.</b>{" "}
                    <span
                      className={canEdit ? styles.editableText : ""}
                      {...edProps("c-i1")}
                    >
                      {data.texts["c-i1"]}
                    </span>
                  </li>
                  <li>
                    <b>06.</b>{" "}
                    <span
                      className={canEdit ? styles.editableText : ""}
                      {...edProps("c-i6")}
                    >
                      {data.texts["c-i6"]}
                    </span>
                  </li>
                  <li>
                    <b>02.</b>{" "}
                    <span
                      className={canEdit ? styles.editableText : ""}
                      {...edProps("c-i2")}
                    >
                      {data.texts["c-i2"]}
                    </span>
                  </li>
                  <li>
                    <b>07.</b>{" "}
                    <span
                      className={canEdit ? styles.editableText : ""}
                      {...edProps("c-i7")}
                    >
                      {data.texts["c-i7"]}
                    </span>
                  </li>
                  <li>
                    <b>03.</b>{" "}
                    <span
                      className={canEdit ? styles.editableText : ""}
                      {...edProps("c-i3")}
                    >
                      {data.texts["c-i3"]}
                    </span>
                  </li>
                  <li>
                    <b>08.</b>{" "}
                    <span
                      className={canEdit ? styles.editableText : ""}
                      {...edProps("c-i8")}
                    >
                      {data.texts["c-i8"]}
                    </span>
                  </li>
                  <li>
                    <b>04.</b>{" "}
                    <span
                      className={canEdit ? styles.editableText : ""}
                      {...edProps("c-i4")}
                    >
                      {data.texts["c-i4"]}
                    </span>
                  </li>
                  <li>
                    <b>09.</b>{" "}
                    <span
                      className={canEdit ? styles.editableText : ""}
                      {...edProps("c-i9")}
                    >
                      {data.texts["c-i9"]}
                    </span>
                  </li>
                  <li>
                    <b>05.</b>{" "}
                    <span
                      className={canEdit ? styles.editableText : ""}
                      {...edProps("c-i5")}
                    >
                      {data.texts["c-i5"]}
                    </span>
                  </li>
                  <li>
                    <b>10.</b>{" "}
                    <span
                      className={canEdit ? styles.editableText : ""}
                      {...edProps("c-i10")}
                    >
                      {data.texts["c-i10"]}
                    </span>
                  </li>
                </ul>
              </div>

              <div
                className={`${styles.face} ${styles.back} ${styles.p1}`}
                onClick={() => go(-1)}
              >
                <div className={styles.num}>#1</div>
                {renderPh(2, `${styles.oval} ${styles.p1O1}`)}
                {renderPh(3, `${styles.oval} ${styles.p1O2}`)}
                <div
                  className={`${styles.script} ${styles.p1Script} ${
                    canEdit ? styles.editableText : ""
                  }`}
                  {...edProps("p1-ttl")}
                >
                  {data.texts["p1-ttl"]}
                </div>
                <p
                  className={`${styles.p1Txt} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p1-txt")}
                >
                  {data.texts["p1-txt"]}
                </p>
                {renderPh(4, styles.p1Big)}
                <span
                  className={`${styles.p1Tag} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p1-tag")}
                >
                  {data.texts["p1-tag"]}
                </span>
              </div>
            </div>

            {/* Leaf 1: #2 Your Heart / #3 Your Face */}
            <div
              className={`${styles.leaf} ${cur > 1 ? styles.flipped : ""}`}
              style={{ zIndex: leafZIndex(1) }}
            >
              <div
                className={`${styles.face} ${styles.front} ${styles.p2}`}
                onClick={() => go(1)}
              >
                <div className={styles.num}>#2</div>
                <div className={styles.p2Band} />
                <div className={styles.p2Strip}>
                  {renderPh(5, styles.p2StripPh)}
                  {renderPh(6, styles.p2StripPh)}
                  {renderPh(7, styles.p2StripPh)}
                  {renderPh(8, styles.p2StripPh)}
                </div>
                <div
                  className={`${styles.script} ${styles.p2Script} ${
                    canEdit ? styles.editableText : ""
                  }`}
                  {...edProps("p2-ttl")}
                >
                  {data.texts["p2-ttl"]}
                </div>
                <p
                  className={`${styles.p2Txt} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p2-txt")}
                >
                  {data.texts["p2-txt"]}
                </p>
              </div>

              <div
                className={`${styles.face} ${styles.back} ${styles.p3}`}
                onClick={() => go(-1)}
              >
                <div className={styles.num}>#3</div>
                {renderPh(9, `${styles.oval} ${styles.p3O1}`)}
                <i className={styles.star1} />
                <div
                  className={`${styles.p3Lab} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p3-lab")}
                >
                  {data.texts["p3-lab"]}
                </div>
                {renderPh(10, `${styles.oval} ${styles.p3O2}`)}
                <i className={styles.star2} />
                <p
                  className={`${styles.p3Cap} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p3-cap")}
                >
                  {data.texts["p3-cap"]}
                </p>
              </div>
            </div>

            {/* Leaf 2: #4 Your Efforts / #5 Your Voice */}
            <div
              className={`${styles.leaf} ${cur > 2 ? styles.flipped : ""}`}
              style={{ zIndex: leafZIndex(2) }}
            >
              <div
                className={`${styles.face} ${styles.front} ${styles.p4}`}
                onClick={() => go(1)}
              >
                <div className={styles.num}>#4</div>
                <div
                  className={`${styles.script} ${styles.p4Script} ${
                    canEdit ? styles.editableText : ""
                  }`}
                  {...edProps("p4-ttl")}
                >
                  {data.texts["p4-ttl"]}
                </div>
                {renderPh(11, `${styles.p4Frame} ${styles.p4A1}`)}
                {renderPh(12, `${styles.p4Frame} ${styles.p4A2}`)}
                <p
                  className={`${styles.p4Txt} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p4-txt")}
                >
                  {data.texts["p4-txt"]}
                </p>
                {renderPh(13, `${styles.p4Frame} ${styles.p4B1}`)}
                {renderPh(14, `${styles.p4Frame} ${styles.p4B2}`)}
              </div>

              <div
                className={`${styles.face} ${styles.back} ${styles.p5}`}
                onClick={() => go(-1)}
              >
                <div className={`${styles.num} ${styles.p5Num}`}>#5</div>
                <p
                  className={`${styles.p5Txt} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p5-txt")}
                >
                  {data.texts["p5-txt"]}
                </p>
                <div className={styles.env}>
                  <div className={`${styles.envPol} ${styles.envPolL}`}>
                    {renderPh(15, styles.envPolPh)}
                    {renderPh(16, styles.envPolPh)}
                  </div>
                  <div className={`${styles.envPol} ${styles.envPolR}`}>
                    {renderPh(17, styles.envPolPh)}
                    {renderPh(18, styles.envPolPh)}
                  </div>
                  <div className={styles.envFlap} />
                  <div
                    className={`${styles.envCap} ${canEdit ? styles.editableText : ""}`}
                    {...edProps("p5-cap")}
                  >
                    {data.texts["p5-cap"]}
                  </div>
                </div>
              </div>
            </div>

            {/* Leaf 3: #6 Your Assurance / #7 The Way You Listen */}
            <div
              className={`${styles.leaf} ${cur > 3 ? styles.flipped : ""}`}
              style={{ zIndex: leafZIndex(3) }}
            >
              <div
                className={`${styles.face} ${styles.front} ${styles.p6}`}
                onClick={() => go(1)}
              >
                <div className={`${styles.num} ${styles.p6Num}`}>#6</div>
                <div
                  className={`${styles.script} ${styles.p6Script} ${
                    canEdit ? styles.editableText : ""
                  }`}
                  {...edProps("p6-ttl")}
                >
                  {data.texts["p6-ttl"]}
                </div>
                <div className={styles.phone}>
                  {renderPh(19, styles.phonePh)}
                </div>
                <span
                  className={`${styles.bub} ${canEdit ? styles.editableText : ""}`}
                  style={{ right: "6%", top: "30%" }}
                  {...edProps("p6-b1")}
                >
                  {data.texts["p6-b1"]}
                </span>
                <span
                  className={`${styles.bub} ${canEdit ? styles.editableText : ""}`}
                  style={{ right: "4%", top: "35%" }}
                  {...edProps("p6-b2")}
                >
                  {data.texts["p6-b2"]}
                </span>
                <span
                  className={`${styles.bub} ${canEdit ? styles.editableText : ""}`}
                  style={{ right: "3%", top: "40%" }}
                  {...edProps("p6-b3")}
                >
                  {data.texts["p6-b3"]}
                </span>
                <span
                  className={`${styles.bub} ${canEdit ? styles.editableText : ""}`}
                  style={{ right: "12%", top: "50%" }}
                  {...edProps("p6-b4")}
                >
                  {data.texts["p6-b4"]}
                </span>
                <span
                  className={`${styles.bub} ${canEdit ? styles.editableText : ""}`}
                  style={{ right: "12%", top: "55%" }}
                  {...edProps("p6-b5")}
                >
                  {data.texts["p6-b5"]}
                </span>
                <p
                  className={`${styles.p6Txt} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p6-txt")}
                >
                  {data.texts["p6-txt"]}
                </p>
              </div>

              <div
                className={`${styles.face} ${styles.back} ${styles.p7}`}
                onClick={() => go(-1)}
              >
                <div className={`${styles.num} ${styles.p7Num}`}>#7</div>
                <div className={styles.cord} />
                <div className={styles.handset} />
                <div className={styles.frame}>
                  {renderPh(20, styles.framePh)}
                </div>
                <div
                  className={`${styles.script} ${styles.p7Script} ${
                    canEdit ? styles.editableText : ""
                  }`}
                  {...edProps("p7-ttl")}
                >
                  {data.texts["p7-ttl"]}
                </div>
                <p
                  className={`${styles.p7Txt} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p7-txt")}
                >
                  {data.texts["p7-txt"]}
                </p>
              </div>
            </div>

            {/* Leaf 4: #8 YOUR CONSISTENCY / #9 Your Presence */}
            <div
              className={`${styles.leaf} ${cur > 4 ? styles.flipped : ""}`}
              style={{ zIndex: leafZIndex(4) }}
            >
              <div
                className={`${styles.face} ${styles.front} ${styles.p8}`}
                onClick={() => go(1)}
              >
                <div className={`${styles.num} ${styles.p8Num}`}>#8</div>
                <h3
                  className={`${styles.p8Title} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p8-ttl")}
                >
                  {data.texts["p8-ttl"]}
                </h3>
                {renderPh(21, styles.p8Ph, { style: { left: "8%", top: "30%" } })}
                {renderPh(22, styles.p8Ph, { style: { left: "62%", top: "21%" } })}
                {renderPh(23, styles.p8Ph, { style: { left: "38%", top: "47%" } })}
                {renderPh(24, styles.p8Ph, { style: { left: "6%", top: "65%" } })}
                {renderPh(25, styles.p8Ph, { style: { left: "68%", top: "67%" } })}
                <i className={styles.st} style={{ left: "22%", top: "41%" }} />
                <i className={styles.st} style={{ left: "57%", top: "73%" }} />
                <span className={styles.word} style={{ left: "40%", top: "22%" }}>
                  You
                </span>
                <span className={styles.word} style={{ left: "36%", top: "35%" }}>
                  Make
                </span>
                <span className={styles.word} style={{ left: "68%", top: "40%" }}>
                  Me
                </span>
                <span className={styles.word} style={{ left: "4%", top: "54%" }}>
                  Loved
                </span>
                <span className={styles.word} style={{ left: "70%", top: "55%" }}>
                  Feel
                </span>
                <span className={styles.word} style={{ left: "31%", top: "64.5%" }}>
                  Appreciated
                </span>
                <span className={styles.word} style={{ left: "72%", top: "61%" }}>
                  Cared
                </span>
                <span className={styles.word} style={{ left: "40%", top: "76%" }}>
                  through
                </span>
                <span className={styles.word} style={{ left: "26%", top: "88%" }}>
                  your
                </span>
                <span className={styles.word} style={{ left: "55%", top: "90%" }}>
                  consistency
                </span>
              </div>

              <div
                className={`${styles.face} ${styles.back} ${styles.p9}`}
                onClick={() => go(-1)}
              >
                <div className={styles.num}>#9</div>
                <div
                  className={`${styles.script} ${styles.p9Script} ${
                    canEdit ? styles.editableText : ""
                  }`}
                  {...edProps("p9-ttl")}
                >
                  {data.texts["p9-ttl"]}
                </div>
                <p
                  className={`${styles.p9T1} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p9-t1")}
                >
                  {data.texts["p9-t1"]}
                </p>
                <div className={styles.film}>
                  {renderPh(26, styles.filmPh)}
                  {renderPh(27, styles.filmPh)}
                </div>
                <p
                  className={`${styles.p9T2} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p9-t2")}
                >
                  {data.texts["p9-t2"]}
                </p>
              </div>
            </div>

            {/* Leaf 5: #10 Simply You / Back Cover */}
            <div
              className={`${styles.leaf} ${cur > 5 ? styles.flipped : ""}`}
              style={{ zIndex: leafZIndex(5) }}
            >
              <div
                className={`${styles.face} ${styles.front} ${styles.p10}`}
                onClick={() => go(1)}
              >
                <div className={`${styles.num} ${styles.p10Num}`}>#10</div>
                <h2
                  className={`${styles.p10Title} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p10-ttl")}
                >
                  {data.texts["p10-ttl"]}
                </h2>
                <p
                  className={`${styles.p10Txt} ${canEdit ? styles.editableText : ""}`}
                  {...edProps("p10-txt")}
                >
                  {data.texts["p10-txt"]}
                </p>
              </div>

              <div
                className={`${styles.face} ${styles.back} ${styles.endc}`}
                onClick={() => go(-1)}
              />
            </div>
          </div>
        </div>

        {/* Bottom Prev / Next Controls */}
        <div className={styles.ctl}>
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={cur === 0}
            aria-label="Previous page"
          >
            ‹
          </button>
          <span className={styles.pgLabel}>{pageLabel}</span>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={cur === TEN_THINGS_LEAF_COUNT}
            aria-label="Next page"
          >
            ›
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Premium Unlock Modal ($6.00) */}
      <PremiumUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        price="$6.00"
        templateId={TEN_THINGS_TEMPLATE_ID}
        templateTitle="10 Things I Love About You (3D Flipbook)"
        onUnlocked={() => {
          setIsUnlocked(true);
          setIsUnlockModalOpen(false);
          showToast("🎉 10 Things I Love About You unlocked! Tap any photo or text to customize.");
        }}
      />
    </div>
  );
}
