/**
 * "Family Album" — premium 9-page photo album.
 * Shared types, defaults and sanitising used by the editor, viewer and API.
 */

export const ALBUM_TEMPLATE_ID = "family-album";
export const ALBUM_PAGE_COUNT = 9;

/** Every photo slot id, grouped by page (p<page>-<n>). */
export const PAGE_SLOTS: Record<number, string[]> = {
  1: ["p1-1", "p1-2", "p1-3", "p1-4", "p1-5", "p1-6"],
  2: ["p2-1", "p2-2", "p2-3"],
  3: ["p3-1", "p3-2", "p3-3", "p3-4", "p3-5"],
  4: ["p4-word", "p4-1", "p4-2", "p4-3"],
  5: ["p5-1", "p5-2", "p5-3", "p5-4", "p5-5", "p5-6", "p5-7"],
  6: ["p6-1", "p6-2", "p6-3", "p6-4", "p6-5"],
  7: ["p7-1", "p7-2", "p7-3", "p7-4", "p7-5"],
  8: ["p8-heart", "p8-round1", "p8-round2", "p8-star", "p8-polaroid"],
  9: ["p9-1", "p9-2", "p9-3", "p9-4"],
};

export const ALL_SLOT_IDS: string[] = Object.values(PAGE_SLOTS).flat();

export const DEFAULT_TEXTS: Record<string, string> = {
  "p1-title": "Our Family",
  "p1-sub": "our little world, all in one place",
  "p1-foot": "est. with love",

  "p2-title": "Family Is Where Our Story Begins",
  "p2-note": "every chapter starts with us",

  "p3-title": "Together We Make Beautiful Memories",
  "p3-tile": "Sunday pancakes, silly faces & endless hugs",

  "p4-kicker": "we are",
  "p4-word": "FAMILY",
  "p4-note": "loud, messy & full of love",

  "p5-title": "Little Moments",
  "p5-note": "hung up with love, one memory at a time",

  "p6-title": "Just Us, Being Us",
  "p6-note": "no filters, just love",

  "p7-title": "Our Favorite Days",
  "p7-note": "the days we never want to forget",

  "p8-ribbon": "Love Grows Stronger",
  "p8-scrap": "more beautiful together",
  "p8-polaroid": "you & me",

  "p9-title": "Forever & Always",
  "p9-close": "No matter where life takes us, home will always be each other.",
  "p9-sign": "— with all our love",
};

export const TEXT_LIMIT = 160;

export interface AlbumData {
  type: "family-album";
  version: 1;
  texts: Record<string, string>;
  /** slot id -> public https image URL */
  photos: Record<string, string>;
}

/** What is actually stored in love_pages.message (never sent to viewers). */
export interface StoredAlbum extends AlbumData {
  editTokenHash: string;
}

export function createDefaultAlbum(): AlbumData {
  return {
    type: "family-album",
    version: 1,
    texts: { ...DEFAULT_TEXTS },
    photos: {},
  };
}

const safeUrl = (v: unknown): string | null => {
  if (typeof v !== "string" || v.length > 2000) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
};

/** Normalise untrusted input into valid album data (known keys only). */
export function sanitizeAlbum(input: unknown): AlbumData {
  const d = createDefaultAlbum();
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const texts = (raw.texts && typeof raw.texts === "object" ? raw.texts : {}) as Record<string, unknown>;
  const photos = (raw.photos && typeof raw.photos === "object" ? raw.photos : {}) as Record<string, unknown>;

  for (const key of Object.keys(DEFAULT_TEXTS)) {
    const v = texts[key];
    if (typeof v === "string") {
      const cleaned = v.replace(/\s+/g, " ").trim().slice(0, TEXT_LIMIT);
      d.texts[key] = cleaned || DEFAULT_TEXTS[key];
    }
  }

  for (const id of ALL_SLOT_IDS) {
    const url = safeUrl(photos[id]);
    if (url) d.photos[id] = url;
  }

  return d;
}

/** Cover image for link previews: page-1 first photo, else any photo. */
export function getAlbumCover(data: AlbumData): string | null {
  return data.photos["p1-1"] || ALL_SLOT_IDS.map((id) => data.photos[id]).find(Boolean) || null;
}
