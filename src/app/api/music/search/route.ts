import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy route for Deezer Search API — avoids CORS issues on the client.
 * GET /api/music/search?q=song+name
 *
 * Returns a list of tracks with title, artist, album art, and a 30-second
 * preview stream URL that can be played directly in an <audio> element.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { success: false, error: "Missing search query (?q=...)" },
      { status: 400 }
    );
  }

  try {
    const deezerRes = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=20`,
      { next: { revalidate: 60 } } // cache for 60 s on the edge
    );

    if (!deezerRes.ok) {
      return NextResponse.json(
        { success: false, error: "Deezer API returned an error" },
        { status: 502 }
      );
    }

    const json = await deezerRes.json();

    // Slim down the payload — filter tracks with preview audio and send what the client needs
    const tracks = (json.data ?? [])
      .filter((t: { preview?: string }) => Boolean(t.preview))
      .map(
        (t: {
          id: number;
          title: string;
          duration?: number;
          preview: string;
          artist?: { name?: string; picture_small?: string };
          album?: { title?: string; cover_medium?: string; cover_small?: string };
        }) => ({
          id: String(t.id),
          title: t.title || "Unknown Title",
          artist: t.artist?.name || "Unknown Artist",
          artistThumb: t.artist?.picture_small || "",
          album: t.album?.title || "",
          albumArt: t.album?.cover_medium || "", // 250×250
          albumArtSmall: t.album?.cover_small || "", // 56×56
          duration: t.duration || 0, // seconds
          previewUrl: t.preview, // 30-second MP3 stream
        })
      );

    return NextResponse.json({ success: true, tracks });
  } catch (err) {
    console.error("Deezer proxy error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch from Deezer" },
      { status: 500 }
    );
  }
}
