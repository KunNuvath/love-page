import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aspdaochkhzwciguyayg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_jZdiPOyBH_9dJ6fkgOD8Zw_83NnzlkN'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface LovePage {
  id: string
  slug: string          // unique shareable ID used in the URL, e.g. /share/abc123
  title: string
  message: string       // rich text / JSON configuration
  image_url: string | null
  created_at: string
  updated_at: string
}

// Server & local memory fallback store so the app is resilient and zero-failure
const memoryPages: Map<string, LovePage> = new Map()

function getStoredPages(): Record<string, LovePage> {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path')
      const dir = path.join(process.cwd(), '.data')
      const file = path.join(dir, 'love_pages.json')
      if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf8'))
      }
    } catch {}
  }
  return {}
}

function persistStoredPage(slug: string, page: LovePage) {
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path')
      const dir = path.join(process.cwd(), '.data')
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      const file = path.join(dir, 'love_pages.json')
      const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
      existing[slug] = page
      fs.writeFileSync(file, JSON.stringify(existing, null, 2), 'utf8')
    } catch {}
  }
}

async function withTimeout<T>(promiseLike: Promise<T> | PromiseLike<T>, ms = 1200): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Supabase request timed out')), ms);
  });
  return Promise.race([promiseLike, timeoutPromise]).finally(() => clearTimeout(timer));
}

// ──────────────────────────────────────────────────────────────────────────────
// Database helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Create a new love page and return it */
export async function createLovePage(data: {
  title: string
  message: string
  image_url?: string | null
}): Promise<LovePage> {
  const slug = generateSlug()
  const now = new Date().toISOString()
  const fallbackPage: LovePage = {
    id: `lp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    slug,
    title: data.title,
    message: data.message,
    image_url: data.image_url ?? null,
    created_at: now,
    updated_at: now,
  }

  // Cache in memory and disk
  memoryPages.set(slug, fallbackPage)
  persistStoredPage(slug, fallbackPage)

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`love_page_${slug}`, JSON.stringify(fallbackPage))
    } catch {}
  }

  try {
    const { data: page, error } = await withTimeout(
      supabase
        .from('love_pages')
        .insert({ ...data, slug, image_url: data.image_url ?? null })
        .select()
        .single()
    )

    if (!error && page) {
      const lovePage = page as LovePage
      memoryPages.set(slug, lovePage)
      persistStoredPage(slug, lovePage)
      return lovePage
    }
  } catch (err) {
    // Falls back to memory cache
  }

  return fallbackPage
}

/** Fetch a single love page by its shareable slug */
export async function getLovePageBySlug(slug: string): Promise<LovePage | null> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('love_pages')
        .select('*')
        .eq('slug', slug)
        .single()
    )

    if (!error && data) {
      const lovePage = data as LovePage
      memoryPages.set(slug, lovePage)
      persistStoredPage(slug, lovePage)
      return lovePage
    }
  } catch (err) {
    // Falls back to memory cache
  }

  // Check disk store
  const diskPages = getStoredPages()
  if (diskPages[slug]) {
    memoryPages.set(slug, diskPages[slug])
    return diskPages[slug]
  }

  // Check memory store
  if (memoryPages.has(slug)) {
    return memoryPages.get(slug)!
  }

  // Check localStorage if in browser
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

  try {
    const { data: page, error } = await withTimeout(
      supabase
        .from('love_pages')
        .update({ ...data, updated_at: now })
        .eq('id', id)
        .select()
        .single()
    )

    if (!error && page) {
      const lovePage = page as LovePage
      memoryPages.set(lovePage.slug, lovePage)
      return lovePage
    }
  } catch (err) {
    // Falls back to memory cache
  }

  // Update in memory if present
  let foundUpdated: LovePage | null = null
  memoryPages.forEach((p, slug) => {
    if (p.id === id || p.slug === id) {
      const updated: LovePage = {
        ...p,
        ...data,
        updated_at: now,
      }
      memoryPages.set(slug, updated)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`love_page_${slug}`, JSON.stringify(updated))
        } catch {}
      }
      foundUpdated = updated
    }
  })

  if (foundUpdated) {
    return foundUpdated
  }

  const newFallback: LovePage = {
    id,
    slug: id,
    title: data.title || 'Untitled',
    message: data.message || '',
    image_url: data.image_url || null,
    created_at: now,
    updated_at: now,
  }
  memoryPages.set(id, newFallback)
  return newFallback
}

// ──────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ──────────────────────────────────────────────────────────────────────────────

const BUCKET = 'love-page-images'

/** Upload an image and return its public URL */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  try {
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    })
    if (!error) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
      if (data?.publicUrl) return data.publicUrl
    }
  } catch (err) {
    console.warn('Storage upload error, falling back to data URL:', err)
  }

  // Resilient fallback to Data URL
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
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

/** Generate a short random slug for the shareable URL */
function generateSlug(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
