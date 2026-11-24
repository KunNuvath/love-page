import type { Metadata } from "next";
import LoveStoryBook from "@/src/components/love-story/LoveStoryBook";

export const metadata: Metadata = {
  title: "Love Story (12-Page Vintage Scrapbook) | LovePage",
  description:
    "A 12-page vintage plaid, wine corduroy, film-strip, and parchment 3D scrapbook flipbook with 18 photo slots, antique stickers, and handwritten notes.",
};

export default function LoveStoryEditorPage() {
  return <LoveStoryBook />;
}
