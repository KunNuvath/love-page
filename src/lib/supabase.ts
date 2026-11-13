import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://aspdaochkhzwciguyayg.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_jZdiPOyBH_9dJ6fkgOD8Zw_83NnzlkN";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface LovePage {
  id: string
  slug: string          // unique shareable ID, e.g. /share/abc123
  title: string
  message: string       // JSON-stringified config blob
  image_url: string | null
  created_at: string
  updated_at: string
}

// ──────────────────────────────────────────────────────────────────────────────
// In-memory cache (process lifetime only — good for SSR dedup within one request)
// This is NOT persistent across deploys. Supabase is the real storage.
// ──────────────────────────────────────────────────────────────────────────────
const memoryPages: Map<string, LovePage> = new Map()

async function withTimeout<T>(p: PromiseLike<T>, ms = 5000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Supabase request timed out')), ms)
  })
  return Promise.race([Promise.resolve(p), timeout]).finally(() => clearTimeout(timer))
}

// ──────────────────────────────────────────────────────────────────────────────
// Database helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Create a new love page and persist it to Supabase */
export async function createLovePage(data: {
  title: string
  message: string
  image_url?: string | null
}): Promise<LovePage> {
  // Route through the API route which uses the service-role key to bypass RLS.
  try {
    const res = await fetch("/api/love-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        message: data.message,
        image_url: data.image_url ?? null,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.page) {
        // Also persist to localStorage so the creator can still view it offline
        try {
          localStorage.setItem(`love_page_${json.page.slug}`, JSON.stringify(json.page));
        } catch {}
        memoryPages.set(json.page.slug, json.page);
        return json.page as LovePage;
      }
    }

    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `HTTP ${res.status}`);
  } catch (err) {
    console.error("createLovePage via API failed:", err);
    throw err;
  }
}

/** Fetch a single love page by its shareable slug */
export async function getLovePageBySlug(slug: string): Promise<LovePage | null> {
  // 1. Try Supabase first — this is the source of truth
  const { data, error } = await withTimeout<{ data: LovePage | null; error: unknown }>(
    supabase
      .from('love_pages')
      .select('*')
      .eq('slug', slug)
      .single() as PromiseLike<{ data: LovePage | null; error: unknown }>
  ).catch(() => ({ data: null, error: new Error('timeout') }))

  if (!error && data) {
    const lovePage = data as LovePage
    memoryPages.set(slug, lovePage)
    return lovePage
  }

  // 2. In-memory cache (same process, same request dedup)
  if (memoryPages.has(slug)) {
    return memoryPages.get(slug)!
  }

  // 3. Creator's localStorage (only works in the browser on the creator's device)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`love_page_${slug}`)
      if (stored) {
        const parsed = JSON.parse(stored) as LovePage
        memoryPages.set(slug, parsed)
        return parsed
      }
    } catch {}
  }

  return null
}

/** Update an existing love page */
export async function updateLovePage(
  id: string,
  data: Partial<Pick<LovePage, 'title' | 'message' | 'image_url'>>
): Promise<LovePage> {
  const now = new Date().toISOString()

  const { data: page, error } = await withTimeout<{ data: LovePage | null; error: unknown }>(
    supabase
      .from('love_pages')
      .update({ ...data, updated_at: now })
      .eq('id', id)
      .select()
      .single() as PromiseLike<{ data: LovePage | null; error: unknown }>
  ).catch(() => ({ data: null, error: new Error('timeout') }))

  if (!error && page) {
    const lovePage = page as LovePage
    memoryPages.set(lovePage.slug, lovePage)
    return lovePage
  }

  // Fallback: update in-memory copy
  let found: LovePage | null = null
  memoryPages.forEach((p, slug) => {
    if (p.id === id || p.slug === id) {
      const updated: LovePage = { ...p, ...data, updated_at: now }
      memoryPages.set(slug, updated)
      found = updated
    }
  })

  if (found) return found

  const fallback: LovePage = {
    id,
    slug: id,
    title: data.title || 'Untitled',
    message: data.message || '',
    image_url: data.image_url || null,
    created_at: now,
    updated_at: now,
  }
  memoryPages.set(id, fallback)
  return fallback
}

// ──────────────────────────────────────────────────────────────────────────────
// Storage helpers — Supabase Storage bucket "love-page-images"
// ──────────────────────────────────────────────────────────────────────────────

const BUCKET = 'love-page-images'

/** Upload an image File and return its permanent public URL */
export async function uploadImage(file: File): Promise<string> {
  // Route through the API endpoint which uses the service-role key
  // so uploads succeed regardless of storage RLS settings.
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (err) {
    console.warn("uploadImage via API failed, falling back to base64:", err);
  }

  // Last-resort: base64 data URL (only works for the creator's own view)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

/** Upload an audio File (MP3, M4A, WAV) and return its public URL */
export async function uploadAudio(file: File): Promise<string> {
  // Route through the API endpoint which uses the service-role key.
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (err) {
    console.warn("uploadAudio via API failed, falling back to base64:", err);
  }

  // Last-resort: base64 data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

/** Delete an image from storage by its public URL */
export async function deleteImage(publicUrl: string): Promise<void> {
  try {
    const path = publicUrl.split(`/${BUCKET}/`)[1]
    if (!path) return
    await supabase.storage.from(BUCKET).remove([path])
  } catch {}
}

// ──────────────────────────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────────────────────────

function generateSlug(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
