import { NextResponse } from "next/server";
import { getAdminClient } from "@/src/lib/supabase-admin";
import { getUserFromRequest } from "@/src/lib/server-auth";
import {
  extractPhotoUrls,
  insertTrackedLovePage,
  type TemplateType,
} from "@/src/lib/db-tracking";

export const dynamic = "force-dynamic";

function generateSlug(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function detectTemplateType(raw: unknown): TemplateType {
  if (raw === "little-book") return "little-book";
  if (raw === "adventure-scrapbook") return "adventure-scrapbook";
  if (raw === "family-album") return "family-album";
  if (raw === "love-flipbook") return "love-flipbook";
  return "polaroid-scrapbook";
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request).catch(() => null);

  try {
    const body = await request.json();
    const { title, message, config, image_url } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let parsedMsg: Record<string, unknown> | null = null;
    if (typeof message === "string" && message.trim().startsWith("{")) {
      try {
        parsedMsg = JSON.parse(message);
      } catch {}
    }

    const templateType = detectTemplateType(
      body.type || config?.type || parsedMsg?.type
    );

    let messagePayload = typeof message === "string" ? message : "";
    if (config && typeof config === "object") {
      messagePayload = JSON.stringify({
        type: templateType,
        ...config,
        title,
      });
    } else if (!messagePayload) {
      messagePayload = JSON.stringify({
        type: templateType,
        title,
        message: "",
      });
    }

    const photoUrls = extractPhotoUrls(config || parsedMsg || { image_url });
    const slug = generateSlug();

    const { data: page, error } = await insertTrackedLovePage({
      slug,
      title,
      message: messagePayload,
      image_url: image_url || photoUrls[0] || null,
      template_type: templateType,
      user_id: user?.id || null,
      user_email: user?.email || null,
      photo_urls: photoUrls,
    });

    if (error || !page) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error?.message || "Failed to create love page" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      page,
      slug: page.slug,
      shareUrl: `/p/${page.slug}`,
    });
  } catch (error: unknown) {
    console.error("API /api/love-page error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create love page" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const adminClient = getAdminClient();
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const { data, error } = await adminClient
      .from("love_pages")
      .select("id, slug, title, image_url, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ pages: [] });
    }

    return NextResponse.json({ pages: data || [] });
  } catch {
    return NextResponse.json({ pages: [] });
  }
}
