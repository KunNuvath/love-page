import LandingPage from "@/src/components/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LovePage — Modern & Lovely Digital Scrapbook Keepsake",
  description:
    "Create a timeless personalized retro love scrapbook for your favorite person. Interactive polaroids, background song, and romantic love letters.",
};

export default function Home() {
  return <LandingPage />;
}
