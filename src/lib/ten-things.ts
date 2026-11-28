export const TEN_THINGS_TEMPLATE_ID = "ten-things";
export const TEN_THINGS_PHOTO_COUNT = 28;
export const TEN_THINGS_LEAF_COUNT = 6;

export interface TenThingsData {
  type: "ten-things";
  version: 1;
  photos: string[]; // length 28 (l1,l2,a1..a3,b1..b4,c1,c2,d1..d4,e1..e4,f1,g1,h1..h5,i1,i2)
  texts: Record<string, string>;
}

export interface StoredTenThings extends TenThingsData {
  editTokenHash?: string;
}

export const DEFAULT_TEN_THINGS_TEXTS: Record<string, string> = {
  // Cover
  "c-num": "10",
  "c-t1": "Things\nI love",
  "c-t2": "About You",
  "c-i1": "Your Smile",
  "c-i2": "Your Heart",
  "c-i3": "Your Face",
  "c-i4": "Your Efforts",
  "c-i5": "Your Voice",
  "c-i6": "Your Assurance",
  "c-i7": "The Way You Listen",
  "c-i8": "Your Consistency",
  "c-i9": "Your presence",
  "c-i10": "Simply You",

  // #1 Your Smile
  "p1-ttl": "Your Smile",
  "p1-txt":
    "Your smile never fails to make my day better. I could look at it a thousand times and still love it.",
  "p1-tag": "soulmates",

  // #2 Your Heart
  "p2-ttl": "Your\nHeart",
  "p2-txt":
    "I love how kind and genuine your heart is. You always care deeply about the people you love. You have a way of making others feel valued and appreciated. I admire how you can be so thoughtful, even in the smallest ways. Your heart is one of the many reasons I love you so much. ♡",

  // #3 Your Face
  "p3-lab": "your face",
  "p3-cap":
    "I love every little expression you make. You're simply my favorite face to see every day.",

  // #4 Your Efforts
  "p4-ttl": "Your Efforts",
  "p4-txt":
    "I love how you always put effort into the little things. I notice even the smallest things you do for me. It makes me feel appreciated and cared for. It means so much to me knowing that you genuinely try for us.",

  // #5 Your Voice
  "p5-txt":
    "I love hearing your voice, no matter what we're talking about. It always brings me comfort and makes me happy. I could listen to you for hours and never get tired of it.",
  "p5-cap": "your voice",

  // #6 Your Assurance
  "p6-ttl": "Your Assurance",
  "p6-b1": "i love you",
  "p6-b2": "i'm so proud of you",
  "p6-b3": "and everything you're becoming",
  "p6-b4": "i'm here",
  "p6-b5": "for you",
  "p6-txt":
    "I love how you always reassure me when I need it. Your words give me comfort and peace. It means so much to know that I can always count on you.",

  // #7 The Way You Listen
  "p7-ttl": "The Way You Listen",
  "p7-txt":
    "I love how you genuinely listen to me. You remember the little things I tell you, even when I don't expect you to. You always make me feel like what I say matters. I feel comfortable sharing my thoughts and feelings with you. Most of all, you make me feel heard and understood.",

  // #8 Your Consistency
  "p8-ttl": "YOUR\nCONSISTENCY",

  // #9 Your Presence
  "p9-ttl": "Your Presence",
  "p9-t1":
    "I love simply having you around, even when we're doing nothing special. Your presence makes ordinary moments feel more meaningful. I feel comfortable and happy whenever you're with me.",
  "p9-t2":
    "You have a way of making everything feel a little lighter. I don't need anything special as long as I get to spend time with you. Somehow, everything just feels better when you're there.",

  // #10 Simply You
  "p10-ttl": "Simply You",
  "p10-txt":
    "I love you for everything that makes you who you are. I love your personality, your little habits, and the way you see things. I love how you make me smile without even trying. I love the person you are when you're happy, serious, playful, or quiet. You don't have to be perfect for me to love you. I appreciate every little part of you that makes you different and special. I'm grateful for every moment I get to spend with you. Most of all, I'm simply grateful that you're you.",
};

export function createDefaultTenThings(): TenThingsData {
  return {
    type: "ten-things",
    version: 1,
    photos: Array.from({ length: TEN_THINGS_PHOTO_COUNT }, () => ""),
    texts: { ...DEFAULT_TEN_THINGS_TEXTS },
  };
}

export function sanitizeTenThings(raw: unknown): TenThingsData {
  const def = createDefaultTenThings();
  if (!raw || typeof raw !== "object") return def;
  const obj = raw as Record<string, unknown>;

  const rawPhotos = Array.isArray(obj.photos) ? obj.photos : [];
  const photos = Array.from({ length: TEN_THINGS_PHOTO_COUNT }, (_, i) => {
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
  const texts: Record<string, string> = { ...DEFAULT_TEN_THINGS_TEXTS };
  for (const key of Object.keys(DEFAULT_TEN_THINGS_TEXTS)) {
    const v = rawTexts[key];
    if (typeof v === "string") {
      texts[key] = v.slice(0, 1400);
    }
  }

  return {
    type: "ten-things",
    version: 1,
    photos,
    texts,
  };
}

export function getTenThingsCover(data: TenThingsData): string | null {
  for (const url of data.photos) {
    if (url && (url.startsWith("https://") || url.startsWith("http://"))) {
      return url;
    }
  }
  return null;
}
