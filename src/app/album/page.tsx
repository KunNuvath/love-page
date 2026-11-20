import type { Metadata } from "next";
import ScrapbookAlbum from "@/src/components/album/ScrapbookAlbum";

export const metadata: Metadata = {
  title: "Scrapbook Album — Vol. 04 Premium 9-Page Flip Album",
  description:
    "A 9-page family & couple collage photo album with 3D page-flip animation, clothesline polaroids, photo-filled letters, and cut-paper heart stickers.",
};

export default function AlbumEditorPage() {
  return <ScrapbookAlbum />;
}
