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
import { supabase, uploadImage } from "@/src/lib/supabase";
import { useAuth } from "@/src/context/AuthContext";
import { hasTemplateAccess } from "@/src/lib/premium";
import {
  FLIPBOOK_TEMPLATE_ID,
  FLIPBOOK_PHOTO_COUNT,
  createDefaultFlipbook,
  sanitizeFlipbook,
  type FlipbookData,
} from "@/src/lib/flipbook";
import PremiumUnlockModal from "@/src/components/adventure/PremiumUnlockModal";
import styles from "./flipbook.module.css";

const DRAFT_STORAGE_KEY = "lovepage_love_flipbook_draft_v1";
const LEAF_COUNT = 8; // 8 spreads = 16 pages

interface LoveFlipbookProps {
  readOnly?: boolean;
  initialData?: FlipbookData;
  initialSlug?: string;
  initialEditToken?: string;
}

export default function LoveFlipbook({
  readOnly = false,
  initialData,
  initialSlug,
  initialEditToken,
}: LoveFlipbookProps) {
  const { user, openAuthModal } = useAuth();

  const [data, setData] = useState<FlipbookData>(() => initialData || createDefaultFlipbook());
  const [cur, setCur] = useState(0); // 0..7 (spread index)
  const [movingLeaf, setMovingLeaf] = useState<number | null>(null);
  const [castDir, setCastDir] = useState<"" | "f" | "b">("");
  const [scale, setScale] = useState(0.85);
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

  const busyRef = useRef(false);
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
          setData(sanitizeFlipbook(parsed));
        }
      } catch {}
    }

    if (initialEditToken) {
      setIsUnlocked(true);
    } else {
      setIsUnlocked(hasTemplateAccess(user, FLIPBOOK_TEMPLATE_ID));
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
        if (hasTemplateAccess(latestUser, FLIPBOOK_TEMPLATE_ID)) {
          try {
            localStorage.setItem(`lovepage_unlocked_${FLIPBOOK_TEMPLATE_ID}`, "true");
            if (latestUser?.id) {
              localStorage.setItem(
                `lovepage_unlocked_${FLIPBOOK_TEMPLATE_ID}_${latestUser.id}`,
                "true"
              );
            }
          } catch {}
          setIsUnlocked(true);
          showToast("🎉 Love Flipbook unlocked! Tap any photo slot or text to customize.");
          window.history.replaceState({}, "", "/flipbook");
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

  // Fit book to viewport exactly like the original fit() function
  useEffect(() => {
    const updateFit = () => {
      const topReserve = readOnly ? 130 : 185;
      const s = Math.min(
        (window.innerWidth * 0.93) / 1004,
        (window.innerHeight - topReserve) / 724,
        1.35
      );
      setScale(Math.max(0.28, s));
    };
    updateFit();
    window.addEventListener("resize", updateFit);
    return () => window.removeEventListener("resize", updateFit);
  }, [readOnly]);

  const go = useCallback(
    (d: 1 | -1) => {
      if (busyRef.current) return;
      const target = cur + d;
      if (target < 0 || target > LEAF_COUNT - 1) return;

      const leafIdx = d > 0 ? cur : target;
      busyRef.current = true;
      setMovingLeaf(leafIdx);
      setCastDir("");
      requestAnimationFrame(() => {
        setCastDir(d > 0 ? "f" : "b");
      });
      setCur(target);

      setTimeout(() => {
        setMovingLeaf(null);
        setCastDir("");
        busyRef.current = false;
      }, 1020);
    },
    [cur]
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
        const next: FlipbookData = {
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
      const publicUrl = await uploadImage(file);
      setData((prev) => {
        const nextPhotos = [...prev.photos];
        nextPhotos[slotIdx] = publicUrl;
        const next: FlipbookData = { ...prev, photos: nextPhotos };
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
    showToast(`Uploading ${Math.min(files.length, FLIPBOOK_PHOTO_COUNT)} photo(s)...`);

    // Find empty slots first, then overwrite from 0 if all full
    const targetSlots: number[] = [];
    for (let i = 0; i < FLIPBOOK_PHOTO_COUNT && targetSlots.length < files.length; i++) {
      if (!data.photos[i]) targetSlots.push(i);
    }
    for (let i = 0; i < FLIPBOOK_PHOTO_COUNT && targetSlots.length < files.length; i++) {
      if (!targetSlots.includes(i)) targetSlots.push(i);
    }

    for (let idx = 0; idx < targetSlots.length; idx++) {
      const slotIdx = targetSlots[idx];
      const file = files[idx];
      setUploadingIndex(slotIdx);
      try {
        const publicUrl = await uploadImage(file);
        setData((prev) => {
          const nextPhotos = [...prev.photos];
          nextPhotos[slotIdx] = publicUrl;
          const next: FlipbookData = { ...prev, photos: nextPhotos };
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
    showToast("Photos added to your 16-page flipbook!");
  };

  const executeSave = async () => {
    setIsSaving(true);
    try {
      if (savedSlug && editToken) {
        const res = await fetch(`/api/flipbook/${savedSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editToken, data }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Could not update flipbook.");
        showToast("Flipbook changes saved!");
        return;
      }

      const res = await fetch("/api/flipbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.slug) {
        throw new Error(json.error || "Could not save flipbook.");
      }

      setSavedSlug(json.slug);
      setEditToken(json.editToken || "");
      try {
        localStorage.setItem(`lovepage_flipbook_token_${json.slug}`, json.editToken || "");
      } catch {}
      showToast("Love Flipbook published! Copy your share link below.");
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
        subtitle: "Sign in so your 16-page leather flipbook link stays saved to your account.",
        onSuccess: () => executeSave(),
      });
      return;
    }
    executeSave();
  };

  // Render helper for a photo slot <b> (index 0..36)
  const renderSlot = (slotIdx: number, filterClass = "", extraStyle?: React.CSSProperties) => {
    const url = data.photos[slotIdx];
    const isUploading = uploadingIndex === slotIdx;
    return (
      <b
        onClick={(e) => handlePhotoSlotClick(slotIdx, e)}
        className={`${styles.slot} ${filterClass ? styles[filterClass] || "" : ""} ${
          !readOnly && interactionMode === "edit" ? styles.slotEditable : ""
        }`}
        style={{
          ...extraStyle,
          ...(url ? { backgroundImage: `url("${url}")` } : {}),
        }}
        title={
          !readOnly && interactionMode === "edit"
            ? `Click to upload Photo ${slotIdx + 1}`
            : undefined
        }
      >
        {!url && (
          <span className={styles.slotLabel}>
            {isUploading ? "Uploading..." : `+ photo ${slotIdx + 1}`}
          </span>
        )}
        {url && isUploading && (
          <span className={styles.slotLabel} style={{ background: "rgba(0,0,0,0.45)" }}>
            Uploading...
          </span>
        )}
      </b>
    );
  };

  // Render helper for a framed/taped photo H(x,y,w,h,r,c,tp,f,slotIdx,captionKey?)
  const renderPhotoFrame = (
    slotIdx: number,
    x: number,
    y: number,
    w: number,
    h: number,
    r = 0,
    variant: "" | "fr" | "bare" | "pl" = "",
    tapes = "",
    filter: "" | "bw" | "sep" = "",
    captionKey?: string
  ) => (
    <div
      className={`${styles.ph} ${variant ? styles[variant] : ""}`}
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${r}deg)`,
      }}
    >
      {tapes.split("").map((t, idx) => (
        <i
          key={idx}
          className={`${styles.tape} ${
            t === "c" ? styles.tapeC : t === "l" ? styles.tapeL : styles.tapeR
          }`}
        />
      ))}
      {renderSlot(slotIdx, filter)}
      {captionKey && (
        <em
          contentEditable={canEdit}
          suppressContentEditableWarning
          onClick={(e) => !readOnly && interactionMode === "edit" && e.stopPropagation()}
          onBlur={(e) => handleTextBlur(captionKey, e)}
          className={`${styles.plCap} ${canEdit ? styles.editableText : ""}`}
        >
          {data.texts[captionKey]}
        </em>
      )}
    </div>
  );

  // Render helper for editable script text S(x,y,key,sz,light,extraStyle)
  const renderScript = (
    key: string,
    x: number,
    y: number,
    sz = 18,
    isLight = false,
    extraStyle?: React.CSSProperties
  ) => (
    <div
      contentEditable={canEdit}
      suppressContentEditableWarning
      onClick={(e) => !readOnly && interactionMode === "edit" && e.stopPropagation()}
      onBlur={(e) => handleTextBlur(key, e)}
      className={`${styles.scr} ${isLight ? styles.light : ""} ${
        canEdit ? styles.editableText : ""
      }`}
      style={{
        left: x,
        top: y,
        fontSize: sz,
        whiteSpace: "pre-line",
        ...extraStyle,
      }}
    >
      {data.texts[key]}
    </div>
  );

  // Render helper for editable paragraph T(x,y,w,key,isLight,extraStyle)
  const renderText = (
    key: string,
    x: number,
    y: number,
    w: number,
    isLight = false,
    extraStyle?: React.CSSProperties
  ) => (
    <p
      contentEditable={canEdit}
      suppressContentEditableWarning
      onClick={(e) => !readOnly && interactionMode === "edit" && e.stopPropagation()}
      onBlur={(e) => handleTextBlur(key, e)}
      className={`${styles.txt} ${isLight ? styles.light : ""} ${
        canEdit ? styles.editableText : ""
      }`}
      style={{
        left: x,
        top: y,
        width: w,
        ...extraStyle,
      }}
    >
      {data.texts[key]}
    </p>
  );

  // Render helper for caption CP(x,y,w,key,isLight)
  const renderCaption = (key: string, x: number, y: number, w: number, isLight = false) => (
    <div
      contentEditable={canEdit}
      suppressContentEditableWarning
      onClick={(e) => !readOnly && interactionMode === "edit" && e.stopPropagation()}
      onBlur={(e) => handleTextBlur(key, e)}
      className={`${styles.cap} ${isLight ? styles.light : ""} ${
        canEdit ? styles.editableText : ""
      }`}
      style={{ left: x, top: y, width: w }}
    >
      {data.texts[key]}
    </div>
  );

  // Render helper for each of the 16 pages (1-indexed: 1..16)
  const renderPageContent = (pageNum: number) => {
    switch (pageNum) {
      case 1:
        return (
          <>
            <div className={styles.lw} style={{ left: 272, top: 0, width: 208, height: "100%" }}>
              <div className={`${styles.lace} ${styles.laceL}`} />
            </div>
            <div
              className={`${styles.ph} ${styles.strip}`}
              style={{
                left: 322,
                top: 92,
                width: 134,
                height: 490,
                transform: "rotate(1.5deg)",
              }}
            >
              {renderSlot(0, "bw")}
              {renderSlot(1, "bw")}
              {renderSlot(2, "bw")}
              {renderSlot(3, "bw")}
            </div>
            {renderScript("p1-title", 34, 262, 19, true)}
            {renderText("p1-body", 34, 304, 212, true, { fontSize: "11.5px" })}
            <div className={styles.st} />
          </>
        );

      case 2:
        return (
          <>
            <div className={styles.lw} style={{ left: 0, top: 0, width: 252, height: "100%" }}>
              <div className={`${styles.lace} ${styles.laceR}`} />
            </div>
            {renderPhotoFrame(4, 76, 142, 334, 424, -1, "fr", "lr")}
          </>
        );

      case 3:
        return (
          <>
            {renderScript("p3-title", 0, 68, 26, false, {
              width: 480,
              textAlign: "center",
            })}
            {renderText("p3-body", 46, 142, 388, false, {
              color: "#2f170d",
              fontSize: "15px",
              lineHeight: 1.78,
            })}
            <div className={`${styles.st} ${styles.stD}`} />
          </>
        );

      case 4:
        return (
          <>
            {renderPhotoFrame(5, 0, 372, 480, 308, 0, "bare")}
            <div
              className={styles.ab}
              style={{
                left: 0,
                top: 0,
                width: 480,
                height: 372,
                background: "#623a29",
                boxShadow: "0 6px 14px rgba(42,18,9,.28)",
              }}
            />
            <div
              className={styles.xh}
              style={{ left: 350, top: 200, width: 110, height: 100 }}
            />
            {renderPhotoFrame(6, 46, 40, 140, 108, -3, "pl", "c")}
            {renderPhotoFrame(7, 46, 162, 140, 108, 2, "pl", "c")}
            {renderPhotoFrame(8, 46, 284, 140, 108, -2, "pl", "c")}
            {renderPhotoFrame(9, 226, 70, 152, 206, 3, "pl", "c")}
          </>
        );

      case 5:
        return (
          <>
            {renderScript("p5-title", 56, 108, 25, true, {
              transform: "rotate(-9deg)",
            })}
            <div className={styles.hw} style={{ transform: "rotate(-2deg)" }}>
              <div className={styles.hd} />
              <div className={styles.hp}>{renderSlot(10, "sep")}</div>
            </div>
            {renderText("p5-body", 60, 446, 360, true, { textAlign: "center" })}
            <div className={styles.st} />
          </>
        );

      case 6:
        return (
          <>
            {renderScript("p6-title", 170, 104, 25, false, {
              transform: "rotate(9deg)",
            })}
            <div className={styles.hw} style={{ transform: "rotate(2deg)" }}>
              <div className={`${styles.hd} ${styles.hdG}`} />
              <div className={styles.hp}>{renderSlot(11, "sep")}</div>
            </div>
            {renderText("p6-body", 60, 446, 360, false, { textAlign: "center" })}
            <div className={`${styles.st} ${styles.stD}`} />
          </>
        );

      case 7:
        return <>{renderPhotoFrame(12, 24, 186, 432, 304, -1.5, "", "lr", "sep")}</>;

      case 8:
        return (
          <>
            {renderPhotoFrame(13, 70, 28, 300, 172, 2, "fr", "c", "sep")}
            {renderCaption("p8-cap1", 70, 208, 300)}
            {renderPhotoFrame(14, 22, 246, 190, 150, -2, "fr", "l", "sep")}
            {renderCaption("p8-cap2", 22, 404, 190)}
            {renderText("p8-body", 228, 268, 226, false, { fontSize: "10.5px" })}
            {renderPhotoFrame(15, 150, 470, 290, 180, 2, "fr", "r", "sep")}
            {renderCaption("p8-cap3", 150, 656, 290)}
            <div className={`${styles.st} ${styles.stD}`} />
          </>
        );

      case 9:
        return (
          <>
            <div
              className={`${styles.lw} ${styles.lwInteractive}`}
              style={{
                left: 34,
                top: 40,
                width: 412,
                height: 326,
                transform: "rotate(-1deg)",
              }}
            >
              <div className={styles.lace} style={{ padding: 22 }}>
                {renderSlot(16, "", { border: "3px solid #2a1209" })}
              </div>
            </div>
            {renderScript("p9-title", 46, 424, 18, true)}
            {renderText("p9-body", 34, 470, 412, true)}
            <div className={styles.st} />
          </>
        );

      case 10:
        return (
          <>
            {renderPhotoFrame(17, 128, 44, 252, 192, 1, "", "c")}
            {renderScript("p10-side1", 18, 92, 12, true, {
              whiteSpace: "pre-line",
              fontFamily: "var(--body)",
              width: 90,
              textAlign: "center",
            })}
            {renderPhotoFrame(18, 128, 256, 252, 192, -1.5, "", "c")}
            {renderCaption("p10-side2", 392, 340, 80, true)}
            {renderPhotoFrame(19, 128, 468, 252, 192, 1, "", "c")}
            {renderCaption("p10-side3", 40, 646, 160, true)}
            <i className={styles.star} style={{ left: 400, top: 70 }}>
              ★
            </i>
            <i className={styles.star} style={{ left: 430, top: 250 }}>
              ★
            </i>
            <i className={styles.star} style={{ left: 60, top: 330 }}>
              ★
            </i>
            <i className={styles.star} style={{ left: 90, top: 560 }}>
              ★
            </i>
            <i className={styles.star} style={{ left: 420, top: 560 }}>
              ★
            </i>
            <i className={styles.star} style={{ left: 330, top: 652 }}>
              ★
            </i>
          </>
        );

      case 11:
        return (
          <>
            <div
              className={styles.ab}
              style={{
                left: 0,
                top: 0,
                width: 480,
                height: 336,
                background: "radial-gradient(ellipse at 40% 30%, #fffdf8, #f2e8d4)",
                boxShadow: "0 6px 14px rgba(42,18,9,.3)",
              }}
            />
            {renderPhotoFrame(20, 28, 34, 160, 216, -2, "fr", "c")}
            {renderScript("p11-title", 222, 40, 18)}
            {renderText("p11-body1", 206, 86, 240, false, { color: "#2a1209" })}
            {renderText("p11-body2", 30, 420, 200, true)}
            {renderPhotoFrame(21, 252, 384, 190, 236, 2, "", "c")}
          </>
        );

      case 12:
        return (
          <>
            {renderScript("p12-title", 24, 32, 30, true)}
            {renderText("p12-sub", 24, 92, 432, true, { textAlign: "left" })}
            {renderPhotoFrame(22, 26, 150, 130, 150, -1.5, "pl", "", "", "p12-cap1")}
            {renderPhotoFrame(23, 176, 154, 130, 150, 1.5, "pl", "", "", "p12-cap2")}
            {renderPhotoFrame(24, 326, 150, 130, 150, -0.5, "pl", "", "", "p12-cap3")}
            {renderPhotoFrame(25, 26, 336, 130, 150, 1, "pl", "", "", "p12-cap4")}
            {renderPhotoFrame(26, 176, 332, 130, 150, -1, "pl", "", "", "p12-cap5")}
            {renderPhotoFrame(27, 326, 338, 130, 150, 1.5, "pl", "", "", "p12-cap6")}
            {renderPhotoFrame(28, 26, 518, 130, 150, -1, "pl", "", "", "p12-cap7")}
            {renderPhotoFrame(29, 176, 520, 130, 150, 1.5, "pl", "", "", "p12-cap8")}
            {renderPhotoFrame(30, 326, 516, 130, 150, -1.5, "pl", "", "", "p12-cap9")}
          </>
        );

      case 13:
        return (
          <>
            {renderPhotoFrame(31, 22, 146, 206, 308, -1.5, "fr", "c")}
            {renderPhotoFrame(32, 246, 146, 206, 308, 1.5, "fr", "c")}
            <div
              contentEditable={canEdit}
              suppressContentEditableWarning
              onClick={(e) => !readOnly && interactionMode === "edit" && e.stopPropagation()}
              onBlur={(e) => handleTextBlur("p13-note", e)}
              className={`${styles.noteBox} ${canEdit ? styles.editableText : ""}`}
              style={{
                left: 24,
                top: 514,
                width: 424,
                transform: "rotate(-0.6deg)",
              }}
            >
              {data.texts["p13-note"]}
            </div>
          </>
        );

      case 14:
        return (
          <>
            {renderPhotoFrame(33, 26, 146, 206, 308, 1.5, "fr", "c")}
            {renderPhotoFrame(34, 250, 146, 206, 308, -1.5, "fr", "c")}
            <div
              contentEditable={canEdit}
              suppressContentEditableWarning
              onClick={(e) => !readOnly && interactionMode === "edit" && e.stopPropagation()}
              onBlur={(e) => handleTextBlur("p14-note", e)}
              className={`${styles.noteBox} ${canEdit ? styles.editableText : ""}`}
              style={{
                left: 24,
                top: 514,
                width: 424,
                transform: "rotate(0.6deg)",
              }}
            >
              {data.texts["p14-note"]}
            </div>
          </>
        );

      case 15:
        return (
          <>
            {renderPhotoFrame(35, 0, 0, 480, 340, 0, "bare")}
            {renderScript("p15-top", 96, 232, 24, false, {
              color: "#2a1209",
              zIndex: 3,
              textShadow: "0 0 6px #fff",
            })}
            {renderPhotoFrame(36, 0, 340, 480, 340, 0, "bare")}
            {renderScript("p15-bottom", 210, 356, 20, true, { zIndex: 3 })}
            <div
              className={styles.xh}
              style={{ left: 14, top: 16, width: 80, height: 72, opacity: 0.9 }}
            />
          </>
        );

      case 16:
        return (
          <>
            <div
              className={styles.ab}
              style={{
                left: 34,
                top: 100,
                width: 412,
                height: 380,
                clipPath: "url(#flipbook-hc)",
                background:
                  "radial-gradient(circle, #c4b9a2 2.4px, transparent 3px) 0 0 / 13px 13px, #f6f1e6",
                filter: "drop-shadow(0 8px 10px rgba(0,0,0,.4))",
              }}
            />
            <div
              className={styles.ab}
              style={{
                left: 62,
                top: 128,
                width: 356,
                height: 328,
                clipPath: "url(#flipbook-hc)",
                background: "#f4eee0",
              }}
            />
            {renderScript("p16-quote", 90, 190, 30, false, {
              width: 300,
              textAlign: "center",
              whiteSpace: "pre-line",
              lineHeight: 1.35,
              fontFamily: '"Mynerve", cursive',
            })}
            <div
              className={styles.ab}
              style={{
                left: 120,
                top: 496,
                fontSize: 98,
                filter: "drop-shadow(0 6px 5px rgba(0,0,0,.35))",
                pointerEvents: "none",
              }}
            >
              🐈‍⬛<span style={{ marginLeft: -14 }}>🐈</span>
            </div>
            <div className={`${styles.st} ${styles.stD}`} />
          </>
        );

      default:
        return null;
    }
  };

  const PAGE_THEMES: string[] = [
    "br", // 1
    "pk", // 2
    "cr", // 3
    "br", // 4
    "br", // 5
    "cr", // 6
    "pk", // 7
    "cr", // 8
    "br", // 9
    "wd", // 10
    "br", // 11
    "br", // 12
    "pd", // 13
    "pd", // 14
    "br", // 15
    "kn", // 16
  ];

  const spreadLabel = `Page ${cur * 2 + 1} & ${cur * 2 + 2}`;
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://lovepage.site";
  const publicShareUrl = savedSlug ? `${origin}/flipbook/${savedSlug}` : "";
  const secretEditUrl =
    savedSlug && editToken ? `${origin}/flipbook/${savedSlug}?edit=${editToken}` : "";

  return (
    <div
      className={styles.root}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) {
          go(dx < 0 ? 1 : -1);
        }
        touchStartX.current = null;
      }}
    >
      {/* Google Fonts required by the Love Flipbook */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Homemade+Apple&family=Josefin+Sans:wght@300;400&family=Mynerve&family=Rock+Salt&display=swap"
        rel="stylesheet"
      />

      {/* Hidden SVG heart clip-path */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="flipbook-hc" clipPathUnits="objectBoundingBox">
            <path
              transform="scale(0.004167,0.004651)"
              d="M120 215C20 140 0 90 0 60C0 25 25 0 60 0C85 0 108 15 120 38C132 15 155 0 180 0C215 0 240 25 240 60C240 90 220 140 120 215Z"
            />
          </clipPath>
        </defs>
      </svg>

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

      {/* Top Action Bar pinned at top (matching Vol. 03 & Vol. 04) */}
      <div className="w-full max-w-5xl px-1 sm:px-4 pt-1 pb-3 flex flex-wrap items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/90 hover:bg-white text-[#351a0f] border border-[#351a0f]/15 text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#cf493e]" />
            <span className="hidden xs:inline">Back</span>
          </Link>

          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/90 hover:bg-white text-[#351a0f] border border-[#351a0f]/15 text-xs sm:text-sm font-semibold shadow-2xs transition-all active:scale-95"
          >
            <Layers className="h-3.5 w-3.5 text-[#b56c4b]" />
            <span>Templates</span>
          </Link>

          {!readOnly && (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4a281b] text-[#faf4e6] text-[11px] font-bold">
              <Crown className="h-3 w-3 text-[#e6c26a] fill-[#e6c26a]" />
              <span>{isUnlocked ? "Vol. 05 Unlocked" : "Vol. 05 • $9.99"}</span>
            </span>
          )}
        </div>

        {!readOnly && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-end">
            {/* Toggle Edit vs Flip Mode */}
            <button
              type="button"
              onClick={() =>
                setInteractionMode((m) => (m === "edit" ? "flip" : "edit"))
              }
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/90 hover:bg-white text-[#351a0f] border border-[#351a0f]/15 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              {interactionMode === "edit" ? (
                <>
                  <Eye className="h-3.5 w-3.5 text-[#7a4b34]" />
                  <span className="hidden sm:inline">Preview Flip</span>
                </>
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5 text-[#7a4b34]" />
                  <span className="hidden sm:inline">Edit Mode</span>
                </>
              )}
            </button>

            {/* Batch Upload Photos */}
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
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-white/90 hover:bg-white text-[#351a0f] border border-[#351a0f]/15 text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isBatchUploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5 text-[#7a4b34]" />
              )}
              <span>Batch Upload</span>
            </button>

            {/* Unlock or Publish & Share */}
            {!isUnlocked ? (
              <button
                type="button"
                onClick={() => setIsUnlockModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#4a281b] hover:bg-[#5e3424] text-[#faf4e6] text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Crown className="h-3.5 w-3.5 text-[#e6c26a] fill-[#e6c26a]" />
                <span>Unlock • $9.99</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveClick}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#4a281b] hover:bg-[#5e3424] text-[#faf4e6] text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5 text-[#e6c26a]" />
                )}
                <span>{savedSlug ? "Save Changes" : "Publish & Share"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Spread Heading */}
      <h1 className={styles.ttl}>{spreadLabel}</h1>

      {/* 3D Leather Book Stage */}
      <div
        className={styles.stage}
        style={{
          width: 1004 * scale,
          height: 724 * scale,
        }}
      >
        <div
          className={styles.sc}
          style={{
            transform: `translate(${22 * scale}px, ${22 * scale}px) scale(${scale})`,
          }}
        >
          <div
            className={styles.book}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const isRight = (e.clientX - r.left) / r.width > 0.5;
              go(isRight ? 1 : -1);
            }}
          >
            <div className={styles.cover} />
            <div className={`${styles.stk} ${styles.stkL}`} />
            <div className={`${styles.stk} ${styles.stkR}`} />

            {/* Base Left Page (Page 1) */}
            <div className={styles.half}>
              <div
                className={`${styles.face} ${styles.baseFace} ${styles[PAGE_THEMES[0]]}`}
              >
                {renderPageContent(1)}
              </div>
            </div>

            {/* 8 Flipping Leaves (Pages 2..16) */}
            <div>
              {Array.from({ length: LEAF_COUNT }, (_, i) => {
                const frontPageNum = 2 * i + 2; // 2, 4, 6, 8, 10, 12, 14, 16
                const backPageNum = 2 * i + 3; // 3, 5, 7, 9, 11, 13, 15, (17 unused)
                const isFlipped = i < cur;
                const isMoving = movingLeaf === i;
                const zIndex = isMoving ? 100 : i < cur ? 10 + i : 60 - i;
                const frontTheme = PAGE_THEMES[frontPageNum - 1] || "br";
                const backTheme =
                  backPageNum <= 16 ? PAGE_THEMES[backPageNum - 1] || "br" : "br";

                return (
                  <div
                    key={i}
                    style={{ zIndex }}
                    className={`${styles.leaf} ${
                      readOnly || interactionMode === "flip" ? styles.leafPeek : ""
                    } ${isFlipped ? styles.leafFlipped : ""} ${
                      isMoving ? styles.moving : ""
                    }`}
                  >
                    <div className={`${styles.face} ${styles[frontTheme]}`}>
                      {renderPageContent(frontPageNum)}
                      <s className={styles.fx} />
                    </div>
                    <div
                      className={`${styles.face} ${styles.back} ${styles[backTheme]}`}
                    >
                      {backPageNum <= 16 ? renderPageContent(backPageNum) : null}
                      <s className={styles.fx} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.gut} />
            <div
              className={`${styles.cast} ${
                castDir === "f"
                  ? styles.castF
                  : castDir === "b"
                    ? styles.castB
                    : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Bottom Spread Navigation Controls */}
      <div className={styles.ui}>
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={cur === 0}
          aria-label="Previous spread"
          className={styles.navBtn}
        >
          ‹
        </button>
        <div className={styles.lbl}>{spreadLabel}</div>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={cur === LEAF_COUNT - 1}
          aria-label="Next spread"
          className={styles.navBtn}
        >
          ›
        </button>
      </div>

      {/* Share Links Banner After Publishing */}
      {!readOnly && savedSlug && (
        <div className="mt-2 mx-3 px-4 py-2.5 rounded-2xl bg-white/95 border border-[#2a1209]/20 shadow-lg flex flex-wrap items-center gap-3 text-xs z-20 max-w-2xl">
          <div className="flex items-center gap-1.5 font-bold text-[#2a1209]">
            <Sparkles className="h-3.5 w-3.5 text-[#c94a3e]" />
            <span>Published:</span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(publicShareUrl);
              setCopiedPublic(true);
              setTimeout(() => setCopiedPublic(false), 2200);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#2a1209] text-[#f3e8dc] font-semibold cursor-pointer"
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
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f2ebd9] text-[#2a1209] border border-[#2a1209]/25 font-semibold cursor-pointer"
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
            className="inline-flex items-center gap-1 text-[#2a1209] hover:underline font-semibold"
          >
            <span>Open</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#2a1209] text-[#f3e8dc] text-xs font-semibold shadow-xl border border-[#e6c26a]/40">
          {toast}
        </div>
      )}

      {/* Premium Unlock Modal ($9.99) */}
      <PremiumUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        price="$9.99"
        templateId={FLIPBOOK_TEMPLATE_ID}
        templateTitle="Love Flipbook (16-Page Leather Scrapbook)"
        bullets={[
          "16 handcrafted pages (8 3D leather-bound spreads) + realistic page-flip sound",
          "37 photo slots: Photobooth strip, Lace frames, Heart cutouts & 9-Polaroid Wishlist",
          "Editable handwritten notes, permanent public link & secret owner edit URL",
        ]}
        onUnlocked={() => {
          setIsUnlocked(true);
          setIsUnlockModalOpen(false);
          showToast("🎉 Love Flipbook unlocked! Click any photo or text to customize.");
        }}
      />
    </div>
  );
}
