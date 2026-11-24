import { NextResponse } from "next/server";
import {
  getLoveStoryCover,
  sanitizeLoveStory,
  type StoredLoveStory,
} from "@/src/lib/love-story";
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

  const data = sanitizeLoveStory(raw);
  const editToken = generateEditToken();
  const stored: StoredLoveStory = {
    ...data,
    editTokenHash: hashToken(editToken),
  };

  const slug = generateShortSlug(8);
  const title = (data.texts["p1-ttl"] || "Our Love Story").replace(/\s+/g, " ").trim();
  const coverUrl = getLoveStoryCover(data);
  const photoUrls = extractPhotoUrls(data.photos);

  const { data: page, error } = await insertTrackedLovePage({
    slug,
    title,
    message: JSON.stringify(stored),
    image_url: coverUrl,
    template_type: "love-story",
    user_id: user?.id || null,
    user_email: user?.email || null,
    photo_urls: photoUrls,
  });

  if (error || !page) {
    console.error("love-story insert failed:", error);
    return NextResponse.json(
      { error: error?.message || "Could not save Love Story." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    slug: page.slug,
    editToken,
    publicUrl: `/love-story/${page.slug}`,
    editUrl: `/love-story/${page.slug}?edit=${editToken}`,
  });
}
