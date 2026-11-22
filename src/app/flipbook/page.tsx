import type { Metadata } from "next";
import LoveFlipbook from "@/src/components/flipbook/LoveFlipbook";

export const metadata: Metadata = {
  title: "Love Flipbook (16-Page Leather Scrapbook) | LovePage",
  description:
    "A 16-page leather-bound 3D vintage love flipbook with 37 photo cutouts, lace borders, heart frames, 9-polaroid wishlist, and realistic page-flip sound.",
};

export default function FlipbookEditorPage() {
  return <LoveFlipbook />;
}
