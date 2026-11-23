import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://aspdaochkhzwciguyayg.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_jZdiPOyBH_9dJ6fkgOD8Zw_83NnzlkN";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Return Authorization header for the currently signed-in user (if any). */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface LovePage {
  id: string;
  slug: string;          // unique shareable ID, e.g. /share/abc123
  title: string;
  message: string;       // JSON-stringified config blob
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Database helpers (Client-safe: routes through API endpoints using Admin Client)
// ──────────────────────────────────────────────────────────────────────────────

/** Create a new love page and persist it to Supabase via server API */
export async function createLovePage(data: {
  title: string;
  message: string;
  image_url?: string | null;
}): Promise<LovePage> {
  try {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/love-page", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
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

/** Fetch a single love page by its shareable slug via server API */
export async function getLovePageBySlug(slug: string): Promise<LovePage | null> {
  try {
    const res = await fetch(`/api/love-page/${slug}`);
    if (res.ok) {
      const json = await res.json();
      if (json.page) {
        try {
          localStorage.setItem(`love_page_${slug}`, JSON.stringify(json.page));
        } catch {}
        return json.page as LovePage;
      }
    }
  } catch (err) {
    console.warn("getLovePageBySlug via API failed, checking localStorage:", err);
  }

  // Creator's localStorage fallback (only works in browser on creator's device)
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`love_page_${slug}`);
      if (stored) {
        return JSON.parse(stored) as LovePage;
      }
    } catch {}
  }

  return null;
}

/** Update an existing love page via server API */
export async function updateLovePage(
  slugOrId: string,
  data: Partial<Pick<LovePage, "title" | "message" | "image_url">>
): Promise<LovePage> {
  const res = await fetch(`/api/love-page/${slugOrId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    const json = await res.json();
    if (json.page) {
      return json.page as LovePage;
    }
  }

  const errJson = await res.json().catch(() => ({}));
  throw new Error(errJson.error || `HTTP ${res.status}`);
}

// ──────────────────────────────────────────────────────────────────────────────
// Storage helpers — routed via /api/upload using Admin Client to bypass RLS
// ──────────────────────────────────────────────────────────────────────────────

/** Downscale large photos in browser before upload to prevent HTTP 413 and mobile lag */
async function compressImageFile(file: File, maxDim = 1600, quality = 0.85): Promise<File> {
  if (
    typeof window === "undefined" ||
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.size < 400 * 1024
  ) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(
              new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                type: "image/jpeg",
              })
            );
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

/** Upload an image File and return its permanent public URL */
export async function uploadImage(
  file: File,
  meta?: { templateType?: string; slotName?: string }
): Promise<string> {
  try {
    const optimizedFile = await compressImageFile(file);
    const formData = new FormData();
    formData.append("file", optimizedFile);
    if (meta?.templateType) formData.append("templateType", meta.templateType);
    if (meta?.slotName) formData.append("slotName", meta.slotName);

    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: authHeaders,
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
export async function uploadAudio(
  file: File,
  meta?: { templateType?: string }
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (meta?.templateType) formData.append("templateType", meta.templateType);

    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: authHeaders,
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
