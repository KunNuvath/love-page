/**
 * LovePage API Client
 * Provides type-safe functions for interacting with /api/* routes
 */

export interface LovePagePayload {
  title: string;
  recipientName?: string;
  senderName?: string;
  message?: string;
  type?: "polaroid-scrapbook" | "little-book";
  image_url?: string | null;
  config?: Record<string, any>;
}

export interface GuestbookEntry {
  id: string;
  page_slug: string;
  author_name: string;
  message: string;
  emoji: string;
  created_at: string;
}

export interface ReactionCounts {
  heart: number;
  sparkle: number;
  kiss: number;
  fire: number;
  cupcake: number;
  star: number;
  [key: string]: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
  mood: string;
  duration?: string;
}

/**
 * Save or create a new love page via API
 */
export async function apiCreateLovePage(payload: LovePagePayload) {
  const res = await fetch("/api/love-page", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create love page");
  }
  return res.json();
}

/**
 * Fetch a love page by slug
 */
export async function apiGetLovePage(slug: string) {
  const res = await fetch(`/api/love-page/${slug}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch love page");
  }
  return res.json();
}

/**
 * Update an existing love page by slug
 */
export async function apiUpdateLovePage(slug: string, payload: Partial<LovePagePayload>) {
  const res = await fetch(`/api/love-page/${slug}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update love page");
  }
  return res.json();
}

/**
 * Upload an image file or base64 via API
 */
export async function apiUploadImage(fileOrBase64: File | string, filename?: string): Promise<{ url: string; success: boolean }> {
  if (typeof fileOrBase64 === "string") {
    // Base64 JSON upload
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64: fileOrBase64, filename: filename || "photo.jpg" }),
    });
    if (!res.ok) throw new Error("Image upload failed");
    return res.json();
  }

  // FormData multipart upload
  const formData = new FormData();
  formData.append("file", fileOrBase64);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Image upload failed");
  return res.json();
}

/**
 * Send a real-time reaction burst
 */
export async function apiSendReaction(slug: string, emoji: string, senderName?: string) {
  const res = await fetch("/api/reactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, emoji, senderName }),
  });
  if (!res.ok) throw new Error("Failed to send reaction");
  return res.json();
}

/**
 * Fetch reaction counts for a page
 */
export async function apiGetReactions(slug: string): Promise<ReactionCounts> {
  const res = await fetch(`/api/reactions?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return { heart: 0, sparkle: 0, kiss: 0, fire: 0, cupcake: 0, star: 0 };
  const data = await res.json();
  return data.reactions;
}

/**
 * Add a guestbook message
 */
export async function apiAddGuestbookEntry(slug: string, author_name: string, message: string, emoji = "💌"): Promise<GuestbookEntry> {
  const res = await fetch("/api/guestbook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, author_name, message, emoji }),
  });
  if (!res.ok) throw new Error("Failed to post guestbook note");
  const data = await res.json();
  return data.entry;
}

/**
 * Get guestbook messages for a page
 */
export async function apiGetGuestbookEntries(slug: string): Promise<GuestbookEntry[]> {
  const res = await fetch(`/api/guestbook?slug=${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.entries ?? [];
}

/**
 * Generate romantic letter / caption with AI
 */
export async function apiGenerateAiLetter(params: {
  recipientName?: string;
  senderName?: string;
  tone?: string;
  occasion?: string;
  memories?: string;
  type?: "letter" | "caption" | "poem" | "vows";
}): Promise<{ text: string; title?: string }> {
  const res = await fetch("/api/ai/letter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate AI letter");
  }
  return res.json();
}

/**
 * Get curated music tracks
 */
export async function apiGetMusicTracks(): Promise<MusicTrack[]> {
  const res = await fetch("/api/music", {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.tracks ?? [];
}
