import type { Metadata } from "next";
import AnniversaryFlipbook from "@/src/components/anniversary/AnniversaryFlipbook";

export const metadata: Metadata = {
  title: "1 Year With You (Velvet Anniversary Flipbook) | LovePage",
  description:
    "A realistic 3D wine-velvet anniversary flipbook with closed cover, 8 bespoke vintage spreads (16 pages), 38 photo slots, and stone-plaster backdrop.",
};

export default function AnniversaryEditorPage() {
  return <AnniversaryFlipbook />;
}
