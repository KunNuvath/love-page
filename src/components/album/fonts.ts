import { Playfair_Display, Caveat } from "next/font/google";

export const playfairAlbum = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-album-serif",
  display: "swap",
});

export const caveatAlbum = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-album-hand",
  display: "swap",
});
