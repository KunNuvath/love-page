import { NextResponse } from "next/server";
import { getAdminClient } from "@/src/lib/supabase-admin";

export const dynamic = "force-dynamic";

function generateSlug(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(request: Request) {
  const adminClient = getAdminClient();
  try {
    const body = await request.json();
    const { title, message, config, image_url, type = "polaroid-scrapbook" } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Pack the configuration into message payload if provided as structured object
    let messagePayload = message;
    if (config || type) {
      const fullConfig = {
        type,
        ...(typeof config === "object" ? config : {}),
        message: message ?? (config?.message || ""),
        title,
      };
      messagePayload = JSON.stringify(fullConfig);
    }

    const slug = generateSlug();
    const { data: page, error } = await adminClient
      .from("love_pages")
      .insert({
        slug,
        title,
        message: messagePayload,
        image_url: image_url || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create love page" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      page,
      slug: page.slug,
      shareUrl: `/p/${page.slug}`,
    });
  } catch (error: any) {
    console.error("API /api/love-page error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create love page" },
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
  } catch (error: any) {
    return NextResponse.json({ pages: [] });
  }
}
