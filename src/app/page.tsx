import LandingPage from "@/src/components/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LovePage — Vintage Digital Scrapbooks & 3D Love Flipbooks",
  description:
    "Create a timeless vintage digital scrapbook or 3D love flipbook for your favorite person. 6 handcrafted templates from Free to $9.99 one-time.",
};

export default function Home() {
  return <LandingPage />;
}
