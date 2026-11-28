import { NextResponse } from "next/server";
import {
  getAnniversaryCover,
  sanitizeAnniversary,
  type StoredAnniversary,
} from "@/src/lib/anniversary";
import {
  generateEditToken,
  generateShortSlug,
  hashToken,
} from "@/src/lib/album-server";
import { getUserFromRequest } from "@/src/lib/server-auth";
import { extractPhotoUrls, insertTrackedLovePage } from "@/src/lib/db-tracking";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getUserFromRequest(request).catch(() => null);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = sanitizeAnniversary(raw);
  const editToken = generateEditToken();
  const stored: StoredAnniversary = {
    ...data,
    editTokenHash: hashToken(editToken),
  };

  const slug = generateShortSlug(8);
  const title = (data.texts["c-title"] || "1 Year With You").replace(/\s+/g, " ").trim();
  const coverUrl = getAnniversaryCover(data);
  const photoUrls = extractPhotoUrls(data.photos);

  const { data: page, error } = await insertTrackedLovePage({
    slug,
    title,
    message: JSON.stringify(stored),
    image_url: coverUrl,
    template_type: "anniversary-velvet",
    user_id: user?.id || null,
    user_email: user?.email || null,
    photo_urls: photoUrls,
  });

  if (error || !page) {
    console.error("anniversary insert failed:", error);
    return NextResponse.json(
      { error: error?.message || "Could not save flipbook." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    slug: page.slug,
    editToken,
    publicUrl: `/anniversary/${page.slug}`,
    editUrl: `/anniversary/${page.slug}?edit=${editToken}`,
  });
}
