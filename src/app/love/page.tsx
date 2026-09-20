import LovePage from "@/src/components/LovePage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Love Page — Our Memories",
  description: "A personalized retro scrapbook page with polaroid memories, love letter, and your favorite song.",
};

export default function LoveRoute() {
  return <LovePage />;
}
