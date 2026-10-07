import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase";

// Global in-memory reaction state store for fast real-time response
const reactionStore: Record<string, Record<string, number>> = {};

export async function POST(request: Request) {
  try {
    const { slug, emoji, senderName } = await request.json();

    if (!slug || !emoji) {
      return NextResponse.json(
        { error: "Slug and emoji are required" },
        { status: 400 }
      );
    }

    if (!reactionStore[slug]) {
      reactionStore[slug] = {
        heart: 0,
        sparkle: 0,
        kiss: 0,
        fire: 0,
        cupcake: 0,
        star: 0,
      };
    }

    // Increment count
    reactionStore[slug][emoji] = (reactionStore[slug][emoji] || 0) + 1;

    // Broadcast non-blocking through Supabase Realtime channel if available
    try {
      const channel = supabase.channel(`love-page:${slug}`);
      channel.send({
        type: "broadcast",
        event: "reaction",
        payload: {
          emoji,
          senderName: senderName || "Someone",
          timestamp: Date.now(),
          count: reactionStore[slug][emoji],
        },
      }).catch(() => {});
    } catch (err) {
      // Broadcast fallback
    }

    return NextResponse.json({
      success: true,
      emoji,
      count: reactionStore[slug][emoji],
      allReactions: reactionStore[slug],
    });
  } catch (error: any) {
    console.error("API /api/reactions error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to record reaction" },
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

    const reactions = reactionStore[slug] || {
      heart: 12,
      sparkle: 8,
      kiss: 5,
      fire: 4,
      cupcake: 3,
      star: 7,
    };

    return NextResponse.json({ success: true, slug, reactions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to get reactions" },
      { status: 500 }
    );
  }
}
