/**
 * "Our Little Adventure" — premium travel-journal scrapbook.
 * Shared types + defaults used by the editor, the public viewer and the API.
 */

export type SlotShape = "torn" | "circle" | "ticket" | "film" | "arch" | "heart";

export const SLOT_ORDER: SlotShape[] = ["torn", "circle", "ticket", "film", "arch", "heart"];

export interface AdventureSong {
  src: string;
  title: string;
  startTime?: number;
  endTime?: number;
}

export interface AdventureScrapbookData {
  type: "adventure-scrapbook";
  version: 1;
  title: string;
  ownerName: string;
  captions: Record<SlotShape, string>;
  /** Public image URLs (null = empty slot). */
  photos: Record<SlotShape, string | null>;
  news: {
    headline: string;
    story: string;
  };
  song: AdventureSong;
}

export const ADVENTURE_TEMPLATE_ID = "adventure-scrapbook";

export const LIMITS = {
  title: 40,
  ownerName: 30,
  caption: 60,
  headline: 80,
  story: 900,
} as const;

export function createDefaultAdventure(): AdventureScrapbookData {
  return {
    type: "adventure-scrapbook",
    version: 1,
    title: "Our Little Adventure",
    ownerName: "you",
    captions: {
      torn: "The day it all began",
      circle: "First date",
      ticket: "Our trip ticket",
      film: "Adventures",
      arch: "Laughs & coffee",
      heart: "Forever & always",
    },
    photos: {
      torn: null,
      circle: null,
      ticket: null,
      film: null,
      arch: null,
      heart: null,
    },
    news: {
      headline: "Local Couple Refuses To Stop Smiling",
      story:
        "EXTRA, EXTRA! Witnesses report that two people met, shared one coffee, and have not stopped laughing since. Experts are baffled. Neighbours confirm at least 400 inside jokes, three questionable road-trip playlists and one argument about the correct way to fold a map (still unresolved). When asked for comment, the couple simply looked at each other and giggled. Authorities advise the public to stay calm: this condition is believed to be permanent.",
    },
    song: {
      src: "/music/miguel-sure-thing.mp3",
      title: "Miguel - Sure Thing",
    },
  };
}

const clip = (v: unknown, max: number, fallback: string) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) || fallback : fallback;

const clipMultiline = (v: unknown, max: number, fallback: string) =>
  typeof v === "string" ? v.trim().slice(0, max) || fallback : fallback;

/** Only keep http(s) image URLs (never inline base64 blobs) for shared pages. */
const safeUrl = (v: unknown): string | null => {
  if (typeof v !== "string") return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
};

/** Normalise untrusted input (from the client or the database) into valid data. */
export function sanitizeAdventure(input: unknown): AdventureScrapbookData {
  const d = createDefaultAdventure();
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, any>;
  const captions = (raw.captions ?? {}) as Record<string, unknown>;
  const photos = (raw.photos ?? {}) as Record<string, unknown>;
  const news = (raw.news ?? {}) as Record<string, unknown>;

  for (const s of SLOT_ORDER) {
    d.captions[s] = clip(captions[s], LIMITS.caption, d.captions[s]);
    d.photos[s] = safeUrl(photos[s]);
  }

  const rawSong = (raw.song ?? {}) as Record<string, unknown>;
  const songSrc =
    typeof rawSong.src === "string" &&
    (rawSong.src.startsWith("/") || rawSong.src.startsWith("http://") || rawSong.src.startsWith("https://"))
      ? rawSong.src
      : d.song.src;

  return {
    ...d,
    title: clip(raw.title, LIMITS.title, d.title),
    ownerName: clip(raw.ownerName, LIMITS.ownerName, d.ownerName),
    news: {
      headline: clip(news.headline, LIMITS.headline, d.news.headline),
      story: clipMultiline(news.story, LIMITS.story, d.news.story),
    },
    song: {
      src: songSrc,
      title: clip(rawSong.title, 80, d.song.title),
      startTime: typeof rawSong.startTime === "number" ? rawSong.startTime : undefined,
      endTime: typeof rawSong.endTime === "number" ? rawSong.endTime : undefined,
    },
  };
}
