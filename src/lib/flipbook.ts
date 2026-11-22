export const FLIPBOOK_TEMPLATE_ID = "love-flipbook";
export const FLIPBOOK_PHOTO_COUNT = 37;

export interface FlipbookSong {
  title: string;
  artist: string;
  url: string;
  coverUrl?: string;
  clipStart?: number;
  clipEnd?: number;
}

export interface FlipbookData {
  type: "love-flipbook";
  version: 1;
  photos: (string | null)[];
  texts: Record<string, string>;
  song?: FlipbookSong | null;
}

export interface StoredFlipbook extends FlipbookData {
  editTokenHash: string;
}

export const DEFAULT_FLIPBOOK_TEXTS: Record<string, string> = {
  "p1-title": "a little about you",
  "p1-body":
    "You have your own little way of making people feel comfortable. There's something special about the way you carry yourself and see the world.\n\nYou're a mix of little things that make you, you. Your habits, your laughter, and even the smallest details make you someone worth knowing.\n\nI hope you see yourself the way the people who love you see you. You're more special than you think, and the world is a little better with you in it.",
  "p3-title": "Our First Chapter",
  "p3-body":
    "It all started with a simple meeting that turned into something more special than we ever expected. We never knew that two people could become this close, sharing random stories, laughing at the smallest things, and creating memories out of ordinary days.\n\nLooking back, it's funny how we used to be strangers who knew so little about each other, and now we have so many stories to tell. From our silly conversations to the little moments we share, our friendship has become something I truly cherish.\n\nI'm really glad life brought us together. If someone had told me back then that we would become this close, I probably wouldn't have believed them. But here we are, making memories and growing together, and I hope this is only the beginning of many more beautiful moments to come.",
  "p5-title": "meet the boy",
  "p5-body":
    "So, who's this boy? He's the one who makes her laugh, listens to her little stories, and somehow turns ordinary moments into special memories. Maybe he's not perfect, but to her, he's someone worth keeping around.",
  "p6-title": "meet the girl",
  "p6-body":
    "And who's this girl? She's the one who brings her own little magic into the world, with a heart full of stories and a personality that makes her uniquely her. She might not always realize it, but she means so much to the people lucky enough to know her.",
  "p8-cap1": "(1)",
  "p8-cap2": "(2)",
  "p8-body":
    "From silly laughs to random pictures, every moment with you becomes a memory worth keeping. Someday, I hope we can look back at these photos and smile at all the little things we shared together.",
  "p8-cap3": "(3)",
  "p9-title": "Dear Sweetheart",
  "p9-body":
    "I'm so grateful that life brought us together. Thank you for being someone I can laugh with, share my stories with, and make the sweetest memories with. You've become such a special part of my life, and I hope you know how much our friendship means to me.\n\nNo matter where life takes us, I hope we'll always find our way back to each other. Here's to more memories, more laughter, and a friendship that keeps growing through the years. ♡",
  "p10-side1": "Us Against\nEverything ♡",
  "p10-side2": "Just The Two",
  "p10-side3": "Days Like These",
  "p11-title": "Make a wish",
  "p11-body1":
    "I hope life brings you so many beautiful things, endless reasons to smile, and people who love you as genuinely as you deserve. May you always find happiness in the little things and strength in the moments that feel a little harder.",
  "p11-body2":
    "I wish for all your dreams to slowly come true, for you to grow into the person you've always wanted to be, and for your heart to always feel loved. No matter where life takes us, I hope we'll keep making memories together for many years to come. ♡",
  "p12-title": "Wishlist",
  "p12-sub":
    "A little list of dreams, places, and moments I hope we get to experience together someday.",
  "p12-cap1": "Roadtrip together",
  "p12-cap2": "Sunset picnic",
  "p12-cap3": "Photobooth date",
  "p12-cap4": "Stargazing together",
  "p12-cap5": "Attend a concert",
  "p12-cap6": "Visit Disneyland",
  "p12-cap7": "Camping under the stars",
  "p12-cap8": "A date by the beach",
  "p12-cap9": "Candlelight dinner",
  "p13-note":
    "May you always be surrounded by genuine love, endless laughter, and people who make life feel a little brighter. ♡",
  "p14-note":
    "I hope you always find happiness in the little things and have the courage to chase every dream you have. You deserve all the good things life has to offer.",
  "p15-top": "I love",
  "p15-bottom": "this man/girl",
  "p16-quote": "Love actually\nis all\naround.",
};

export function createDefaultFlipbook(): FlipbookData {
  return {
    type: "love-flipbook",
    version: 1,
    photos: Array.from({ length: FLIPBOOK_PHOTO_COUNT }, () => null),
    texts: { ...DEFAULT_FLIPBOOK_TEXTS },
    song: null,
  };
}

export function sanitizeFlipbook(input: unknown): FlipbookData {
  const fallback = createDefaultFlipbook();
  if (!input || typeof input !== "object") return fallback;
  const obj = input as Record<string, unknown>;

  const photos: (string | null)[] = Array.from({ length: FLIPBOOK_PHOTO_COUNT }, (_, i) => {
    if (Array.isArray(obj.photos) && typeof obj.photos[i] === "string" && obj.photos[i]) {
      return obj.photos[i] as string;
    }
    return null;
  });

  const texts: Record<string, string> = { ...DEFAULT_FLIPBOOK_TEXTS };
  if (obj.texts && typeof obj.texts === "object") {
    for (const [k, v] of Object.entries(obj.texts as Record<string, unknown>)) {
      if (typeof v === "string") {
        texts[k] = v.slice(0, 2000);
      }
    }
  }

  let song: FlipbookSong | null = null;
  if (obj.song && typeof obj.song === "object") {
    const s = obj.song as Record<string, unknown>;
    if (typeof s.url === "string" && s.url) {
      song = {
        title: typeof s.title === "string" ? s.title : "Our Song",
        artist: typeof s.artist === "string" ? s.artist : "",
        url: s.url,
        coverUrl: typeof s.coverUrl === "string" ? s.coverUrl : undefined,
        clipStart: typeof s.clipStart === "number" ? s.clipStart : undefined,
        clipEnd: typeof s.clipEnd === "number" ? s.clipEnd : undefined,
      };
    }
  }

  return {
    type: "love-flipbook",
    version: 1,
    photos,
    texts,
    song,
  };
}

export function getFlipbookCover(data: FlipbookData): string | null {
  for (const p of data.photos) {
    if (p) return p;
  }
  return null;
}
