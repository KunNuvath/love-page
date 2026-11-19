import type { Metadata } from "next";
import AdventureScrapbook from "@/src/components/adventure/AdventureScrapbook";

export const metadata: Metadata = {
  title: "Our Little Adventure — Vol. 03 Premium Travel Collage",
  description:
    "A handmade travel-journal collage made of torn kraft paper, washi tape, 6 unique photo cutouts, a newspaper clipping, and doodle stickers.",
};

export default function AdventureEditorPage() {
  return <AdventureScrapbook />;
}
