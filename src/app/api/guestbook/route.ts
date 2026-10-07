import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

export interface GuestbookEntry {
  id: string;
  page_slug: string;
  author_name: string;
  message: string;
  emoji: string;
  created_at: string;
}

// In-memory fallback cache for instant real-time notes
const guestbookCache: Record<string, GuestbookEntry[]> = {};

export async function POST(request: Request) {
  try {
    const { slug, author_name, message, emoji = "💌" } = await request.json();

    if (!slug || !message) {
      return NextResponse.json(
        { error: "Slug and message are required" },
        { status: 400 }
      );
    }

    const newEntry: GuestbookEntry = {
      id: `gb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      page_slug: slug,
      author_name: (author_name || "Secret Admirer").trim(),
      message: message.trim(),
      emoji: emoji || "💌",
      created_at: new Date().toISOString(),
    };

    if (!guestbookCache[slug]) {
      guestbookCache[slug] = [];
    }
    guestbookCache[slug].unshift(newEntry);

    // Broadcast non-blocking through Supabase Realtime channel
    try {
      const channel = supabase.channel(`love-page:${slug}`);
      channel.send({
        type: "broadcast",
        event: "new_guestbook_entry",
        payload: newEntry,
      }).catch(() => {});
    } catch (err) {
      // Broadcast fallback
    }

    return NextResponse.json({
      success: true,
      entry: newEntry,
    });
  } catch (error: any) {
    console.error("API /api/guestbook POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to add guestbook note" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 });
    }

    const entries = guestbookCache[slug] || [
      {
        id: "default_1",
        page_slug: slug,
        author_name: "LovePage Studio",
        message: "This keepsake is filled with pure warmth & lovely memories! ✨💖",
        emoji: "🌸",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ];

    return NextResponse.json({ success: true, slug, entries });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch guestbook notes" },
      { status: 500 }
    );
  }
}
