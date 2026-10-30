/**
 * Background Vibes for Vol. 1 Scrapbook Template
 * Curated romantic atmosphere themes with custom gradients and matching floating elements.
 */

export type BackgroundVibeId =
  | "vintage-rose"
  | "midnight-velvet"
  | "matcha-sage"
  | "sunset-bliss";

export interface BackgroundVibe {
  id: BackgroundVibeId;
  name: string;
  tagline: string;
  emoji: string;
  /** Preview swatch CSS (for drawer pills) */
  previewBg: string;
  /** Classes applied to the <main> container */
  mainClass: string;
  /** Floating heart colors */
  heartColor: string;
  /** Ambient light overlay */
  ambientGlow: string;
  /** Whether the background is dark (for text/badge contrast) */
  isDark: boolean;
}

export const BACKGROUND_VIBES: BackgroundVibe[] = [
  {
    id: "vintage-rose",
    name: "Vintage Rose",
    tagline: "Warm & Nostalgic",
    emoji: "🌸",
    previewBg: "linear-gradient(135deg, #f8e4df 0%, #f3d5cf 50%, #ebd0c9 100%)",
    mainClass: "bg-gradient-to-b from-[#f8e4df] via-[#f3d5cf] to-[#ebd0c9]",
    heartColor: "fill-[#e29578]/25 text-[#e29578]/40",
    ambientGlow: "radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 70%)",
    isDark: false,
  },
  {
    id: "midnight-velvet",
    name: "Midnight Love",
    tagline: "Candlelight & Dreamy",
    emoji: "🌙",
    previewBg: "linear-gradient(135deg, #1c1527 0%, #291d38 50%, #151020 100%)",
    mainClass: "bg-gradient-to-b from-[#1a1423] via-[#241a2f] to-[#120d1a]",
    heartColor: "fill-[#f4a7bb]/35 text-[#f4a7bb]/55",
    ambientGlow: "radial-gradient(circle at 50% 30%, rgba(138, 75, 120, 0.22) 0%, rgba(20, 15, 30, 0.85) 100%)",
    isDark: true,
  },
  {
    id: "matcha-sage",
    name: "Cozy Matcha",
    tagline: "Earthy & Serene",
    emoji: "🌿",
    previewBg: "linear-gradient(135deg, #e8ede4 0%, #d8e3d2 50%, #c9d8c3 100%)",
    mainClass: "bg-gradient-to-b from-[#e8ede4] via-[#dce5d6] to-[#cfdcce]",
    heartColor: "fill-[#7c9470]/30 text-[#607755]/45",
    ambientGlow: "radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.35) 0%, transparent 70%)",
    isDark: false,
  },
  {
    id: "sunset-bliss",
    name: "Sunset Haze",
    tagline: "Golden Hour Lilac",
    emoji: "✨",
    previewBg: "linear-gradient(135deg, #fdeae4 0%, #f1e0f7 50%, #e2e4fb 100%)",
    mainClass: "bg-gradient-to-b from-[#fdeae4] via-[#f1e0f7] to-[#e2e4fb]",
    heartColor: "fill-[#c084fc]/30 text-[#a855f7]/45",
    ambientGlow: "radial-gradient(circle at 50% 20%, rgba(255, 240, 230, 0.4) 0%, transparent 70%)",
    isDark: false,
  },
];

export function getBackgroundVibe(vibeId?: string): BackgroundVibe {
  return (
    BACKGROUND_VIBES.find((v) => v.id === vibeId) ?? BACKGROUND_VIBES[0]
  );
}
