import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface LovePage {
  id: string
  slug: string          // unique shareable ID used in the URL, e.g. /share/abc123
  title: string
  message: string       // rich text / love message
  image_url: string | null  // path inside Supabase Storage bucket "love-page-images"
  created_at: string
  updated_at: string
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
  const { data: page, error } = await supabase
    .from('love_pages')
    .insert({ ...data, slug, image_url: data.image_url ?? null })
    .select()
    .single()

  if (error) throw error
  return page as LovePage
}

/** Fetch a single love page by its shareable slug */
export async function getLovePageBySlug(slug: string): Promise<LovePage | null> {
  const { data, error } = await supabase
    .from('love_pages')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as LovePage
}

/** Update an existing love page */
export async function updateLovePage(
  id: string,
  data: Partial<Pick<LovePage, 'title' | 'message' | 'image_url'>>
): Promise<LovePage> {
  const { data: page, error } = await supabase
    .from('love_pages')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return page as LovePage
}

// ──────────────────────────────────────────────────────────────────────────────
// Storage helpers
// ──────────────────────────────────────────────────────────────────────────────

const BUCKET = 'love-page-images'

/** Upload an image and return its public URL */
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/** Delete an image from storage by its public URL */
export async function deleteImage(publicUrl: string): Promise<void> {
  const path = publicUrl.split(`/${BUCKET}/`)[1]
  if (!path) return
  await supabase.storage.from(BUCKET).remove([path])
}

// ──────────────────────────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────────────────────────

/** Generate a short random slug for the shareable URL */
function generateSlug(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
