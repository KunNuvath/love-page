export const ANNIVERSARY_TEMPLATE_ID = "anniversary-velvet";
export const ANNIVERSARY_PHOTO_COUNT = 38;
export const ANNIVERSARY_SPREAD_COUNT = 10; // 0=cover, 1..8=spreads, 9=back cover

export interface AnniversaryData {
  type: "anniversary-velvet";
  version: 1;
  photos: string[]; // length 38
  texts: Record<string, string>;
}

export interface StoredAnniversary extends AnniversaryData {
  editTokenHash?: string;
}

export const DEFAULT_ANNIVERSARY_TEXTS: Record<string, string> = {
  // 0. Cover
  "c-title": "1 year with you.",
  "c-date": "12/10/2026",

  // S1 Left — About us
  "s1-head": "ABOUT US",
  "s1-p1":
    "ita awalnya cuma dua orang yang bertemu, ngobrol, terus somehow jadi sedekat ini. Dari yang awalnya mungkin nggak kepikiran bakal punya cerita sejauh sekarang, sampai akhirnya punya banyak banget hal yang cuma kita berdua yang ngerti.",
  "s1-p2":
    "Tentang kita sebenarnya nggak harus selalu sesuatu yang besar. Ada obrolan random, bercanda yang kadang nggak jelas, pergi barang, foto-foto, sampai hal kecil yang sekarang malah jadi kebiasaan. We just have our own little things, dan mungkin itu yang bikin hubungan ini terasa nyata.",
  "s1-p3":
    "Jadi kalau ditanya “who are we?”, jawabannya mungkin cuma dua orang yang somehow cocok, nyaman, dan sudah punya terlalu banyak cerita bersama.",

  // S2 Left — The start of forever
  "s2-nums": "1\n2\n10",
  "s2-h1": "The start\nof ",
  "s2-h2": "forever",
  "s2-p1":
    "Semuanya berawal pada 12 Oktober 2019, dari sebuah percakapan sederhana yang nggak pernah kita sangka akan membawa kita sejauh ini.",
  "s2-p2":
    "Aku masih ingat bagaimana senangnya waktu pertama kali kamu menyapa dan bagaimana semuanya perlahan mulai terasa berbeda setelahnya. Kalau melihat kembali semuanya dari awal, aku cuma merasa beruntung kita pernah memulai cerita ini.",

  // S2 Right — 2x3 grid + Our "first"
  "s2-g1": "Our “first” date",
  "s2-g2": "Our “first” photo",
  "s2-g3": "Our “first” trip",
  "s2-first-ttl": "Our\n“first”",
  "s2-first-sub":
    "The little moments that started it all, before we knew they would become some of our favorite memories.",
  "s2-g4": "Our “first” movie",
  "s2-g5": "Our “first” birthday together",

  // S3 Right — Letter for you
  "s3-h1": "Letter",
  "s3-h2": "for\nyou",
  "s3-p1": "Happy anniversary, love.",
  "s3-p2":
    "Kadang masih nggak nyangka kita bisa sampai di titik ini. Dari awal yang mungkin nggak pernah kita bayangkan, sampai sekarang kita udah punya banyak banget cerita, kebiasaan kecil, inside jokes, dan momen yang cuma kita berdua yang ngerti.",
  "s3-p3":
    "Makasih ya, udah jadi bagian dari banyak versi hidup aku. Aku mungkin nggak selalu bilang, tapi I really appreciate every little thing you do, even the",
  "s3-p4":
    "small things that sometimes seem unimportant. Dan kalau suatu hari nanti kita lihat lagi semua foto dan cerita yang pernah kita kumpulin, I hope we can smile and realize how much we've grown together.",
  "s3-p5":
    "Aku nggak tahu persis nanti kita bakal ada di mana, tapi aku berharap kita tetap jadi dua orang yang saling ngerti, saling milih, dan tetap bisa ketawa bareng.",
  "s3-p6":
    "Here's to everything we've been through, everything we're building, and all the little moments we haven't lived yet. I'm really glad it's you.",

  // S6 Left — Ring binder labels
  "s6-c1": "(3) sweetie",
  "s6-c2": "(1) handsome",
  "s6-c3": "(2) kindness",

  // S6 Right — Apple of my eye
  "s6-apple": "you are the apple of my eye",

  // S7 Left — 30/10 day monroe
  "s7-l": "30/10",
  "s7-m": "day",
  "s7-r": "monroe",

  // Back Cover
  "bc-title": "forever, us.",
  "bc-foot": "made with lovepage.site",
};

export function createDefaultAnniversary(): AnniversaryData {
  return {
    type: "anniversary-velvet",
    version: 1,
    photos: Array.from({ length: ANNIVERSARY_PHOTO_COUNT }, () => ""),
    texts: { ...DEFAULT_ANNIVERSARY_TEXTS },
  };
}

export function sanitizeAnniversary(raw: unknown): AnniversaryData {
  const def = createDefaultAnniversary();
  if (!raw || typeof raw !== "object") return def;
  const obj = raw as Record<string, unknown>;

  const rawPhotos = Array.isArray(obj.photos) ? obj.photos : [];
  const photos = Array.from({ length: ANNIVERSARY_PHOTO_COUNT }, (_, i) => {
    const val = rawPhotos[i];
    if (typeof val !== "string") return "";
    const trimmed = val.trim();
    if (
      trimmed.startsWith("https://") ||
      trimmed.startsWith("http://") ||
      trimmed.startsWith("/photos/")
    ) {
      return trimmed.slice(0, 2000);
    }
    return "";
  });

  const rawTexts =
    obj.texts && typeof obj.texts === "object"
      ? (obj.texts as Record<string, unknown>)
      : {};
  const texts: Record<string, string> = { ...DEFAULT_ANNIVERSARY_TEXTS };
  for (const key of Object.keys(DEFAULT_ANNIVERSARY_TEXTS)) {
    const v = rawTexts[key];
    if (typeof v === "string") {
      texts[key] = v.slice(0, 1200);
    }
  }

  return {
    type: "anniversary-velvet",
    version: 1,
    photos,
    texts,
  };
}

export function getAnniversaryCover(data: AnniversaryData): string | null {
  for (const url of data.photos) {
    if (url && (url.startsWith("https://") || url.startsWith("http://"))) {
      return url;
    }
  }
  return null;
}
