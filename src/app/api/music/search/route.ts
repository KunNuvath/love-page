import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Music Search API
 * GET /api/music/search?q=song+name
 *
 * Searches Apple iTunes API (primary) with permanent HTTPS audio streams,
 * falling back to Deezer if iTunes returns no matches.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { success: false, error: "Missing search query (?q=...)" },
      { status: 400 }
    );
  }

  // 1. Try iTunes Search API (permanent preview URLs, reliable globally)
  try {
    const itunesRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=25`,
      {
        headers: {
          "User-Agent": "LovePage/1.0",
        },
        next: { revalidate: 3600 }, // Cache search queries for 1 hour
      }
    );

    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      const results = itunesData.results ?? [];

      if (results.length > 0) {
        const tracks = results
          .filter((t: any) => Boolean(t.previewUrl))
          .map((t: any) => ({
            id: String(t.trackId),
            title: t.trackName || "Unknown Title",
            artist: t.artistName || "Unknown Artist",
            artistThumb: t.artworkUrl100 || "",
            album: t.collectionName || "",
            albumArt: t.artworkUrl100
              ? t.artworkUrl100.replace("100x100bb", "600x600bb")
              : "",
            albumArtSmall: t.artworkUrl100 || "",
            duration: Math.round((t.trackTimeMillis || 30000) / 1000),
            previewUrl: t.previewUrl,
          }));

        if (tracks.length > 0) {
          return NextResponse.json({ success: true, tracks });
        }
      }
    }
  } catch (itunesErr) {
    console.warn("iTunes search error, falling back to Deezer:", itunesErr);
  }

  // 2. Fallback to Deezer if iTunes has no results or fails
  try {
    const deezerRes = await fetch(
      `https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=20`,
      { next: { revalidate: 60 } }
    );

    if (deezerRes.ok) {
      const json = await deezerRes.json();
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
            albumArt: t.album?.cover_medium || "",
            albumArtSmall: t.album?.cover_small || "",
            duration: t.duration || 0,
            previewUrl: t.preview,
          })
        );

      return NextResponse.json({ success: true, tracks });
    }
  } catch (deezerErr) {
    console.error("Deezer search error:", deezerErr);
  }

  return NextResponse.json(
    { success: false, error: "No songs found. Try a different search query." },
    { status: 404 }
  );
}
