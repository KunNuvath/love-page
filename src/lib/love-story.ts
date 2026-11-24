export const LOVE_STORY_TEMPLATE_ID = "love-story";
export const LOVE_STORY_PHOTO_COUNT = 18;
export const LOVE_STORY_PAGE_COUNT = 12;

export interface LoveStoryData {
  type: "love-story";
  version: 1;
  photos: string[]; // length 18
  texts: Record<string, string>;
}

export interface StoredLoveStory extends LoveStoryData {
  editTokenHash?: string;
}

export const DEFAULT_LOVE_STORY_TEXTS: Record<string, string> = {
  "p1-kick": "lovepage.site",
  "p1-ttl": "Our Love\nStory",
  "p1-hand": "a little book of us ✦",

  "p2-kick": "dear you,",
  "p2-body":
    "I made this little book so every tiny moment we share has a place to live. Pages of photos, ticket stubs, songs and silly notes — all of it is you, all of it is us.\n\nAlways yours,\n— me ♡",
  "p2-cap0": "us, always",

  "p3-hand1": "the first\nphoto booth",
  "p3-hand2": "you made\nme laugh",
  "p3-hand3": "forever\nours",

  "p4-cap0": "our favourite day",
  "p4-hand": "every page, you ♡",

  "p5-note1-title": "the first hello",
  "p5-note1-sub": "date — where it all began",
  "p5-note2-title": "the first date",
  "p5-note2-sub": "date — where we laughed",
  "p5-note3-title": "first “I love you”",
  "p5-note3-sub": "date — meant it then, more now",
  "p5-hand": "to be continued… ✦",

  "p6-cap0": "write a memory",
  "p6-cap1": "us, again",
  "p6-cap2": "little things",

  "p7-cap0": "us, always",
  "p7-quote": "“You are my favourite place to go when my mind searches for peace.”",
  "p7-author": "— write your own line ✦",

  "p8-kick": "our playlist",
  "p8-tracks":
    "A1  song that was playing\nA2  the one we sing in the car\nA3  slow dance in the kitchen\nB1  rainy day, you and me\nB2  the one that says it all",
  "p8-cap0": "",

  "p9-hand": "little moments ♡",

  "p10-ttl": "Things I\nlove about you",
  "p10-list":
    "✦ your laugh\n✦ how you hold my hand\n✦ the way you say my name\n✦ every little detail\n✦ that you’re mine",
  "p10-cap0": "",
  "p10-cap1": "",

  "p11-kick": "our promises",
  "p11-body":
    "to choose you every day\nto keep adventuring, near or far\nto laugh at the small things\nto never stop writing our story",
  "p11-cap0": "",
  "p11-cap1": "",

  "p12-kick": "and so it continues…",
  "p12-ttl": "Forever\n& always",
  "p12-hand": "made with lovepage.site ♡",
};

export function createDefaultLoveStory(): LoveStoryData {
  return {
    type: "love-story",
    version: 1,
    photos: Array.from({ length: LOVE_STORY_PHOTO_COUNT }, () => ""),
    texts: { ...DEFAULT_LOVE_STORY_TEXTS },
  };
}

export function sanitizeLoveStory(raw: unknown): LoveStoryData {
  const def = createDefaultLoveStory();
  if (!raw || typeof raw !== "object") return def;
  const obj = raw as Record<string, unknown>;

  const rawPhotos = Array.isArray(obj.photos) ? obj.photos : [];
  const photos = Array.from({ length: LOVE_STORY_PHOTO_COUNT }, (_, i) => {
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
  const texts: Record<string, string> = { ...DEFAULT_LOVE_STORY_TEXTS };
  for (const key of Object.keys(DEFAULT_LOVE_STORY_TEXTS)) {
    const v = rawTexts[key];
    if (typeof v === "string") {
      texts[key] = v.slice(0, 1200);
    }
  }

  return {
    type: "love-story",
    version: 1,
    photos,
    texts,
  };
}

export function getLoveStoryCover(data: LoveStoryData): string | null {
  for (const url of data.photos) {
    if (url && (url.startsWith("https://") || url.startsWith("http://"))) {
      return url;
    }
  }
  return null;
}
