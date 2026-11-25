import crypto from "crypto";
import type { LovePage } from "@/src/lib/supabase";
import { getCachedLovePageBySlug } from "@/src/lib/page-cache";
import { sanitizeAlbum, type AlbumData } from "@/src/lib/album";

/** Server-only helpers for the Family Album (token hashing + loading). */

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token, "utf8").digest("hex");
}

export function generateEditToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

export function generateShortSlug(length = 8): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"; // no look-alike characters
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function tokensMatch(token: string, storedHash: string): boolean {
  if (!token || !storedHash) return false;
  const a = Buffer.from(hashToken(token), "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export interface LoadedAlbum {
  page: LovePage;
  data: AlbumData;
  editTokenHash: string;
}

/** Load an album by slug. Returns null if missing or not an album. */
export async function loadAlbum(slug: string): Promise<LoadedAlbum | null> {
  if (!/^[a-z0-9]{4,16}$/.test(slug)) return null;
  const page = await getCachedLovePageBySlug(slug);
  if (!page) return null;

  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse((page as LovePage).message);
  } catch {
    return null;
  }
  if (!parsed || parsed.type !== "family-album") return null;

  return {
    page: page as LovePage,
    data: sanitizeAlbum(parsed),
    editTokenHash: typeof parsed.editTokenHash === "string" ? parsed.editTokenHash : "",
  };
}
