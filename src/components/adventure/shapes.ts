/**
 * Deterministic torn-paper clip-paths.
 * A seeded PRNG keeps server and client output identical (no hydration mismatch).
 */

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Jagged edges on all four sides, in percentages. */
export function tornPolygon(seed: number, amp = 2.6, steps = 18): string {
  const rand = seeded(seed);
  const pts: string[] = [];
  const j = () => r2(rand() * amp);

  for (let i = 0; i <= steps; i++) pts.push(`${r2((i / steps) * 100)}% ${j()}%`);
  for (let i = 1; i <= steps; i++) pts.push(`${r2(100 - j())}% ${r2((i / steps) * 100)}%`);
  for (let i = steps - 1; i >= 0; i--) pts.push(`${r2((i / steps) * 100)}% ${r2(100 - j())}%`);
  for (let i = steps - 1; i >= 1; i--) pts.push(`${j()}% ${r2((i / steps) * 100)}%`);

  return `polygon(${pts.join(", ")})`;
}

/** Torn only on top and bottom, using px depth so it looks right on a tall sheet. */
export function tornTopBottom(seed: number, depth = 14, steps = 36): string {
  const rand = seeded(seed);
  const pts: string[] = [];
  const j = () => Math.round(rand() * depth);

  for (let i = 0; i <= steps; i++) pts.push(`${r2((i / steps) * 100)}% ${j()}px`);
  for (let i = steps; i >= 0; i--) pts.push(`${r2((i / steps) * 100)}% calc(100% - ${j()}px)`);

  return `polygon(${pts.join(", ")})`;
}

export const SHEET_CLIP = tornTopBottom(7);
export const TORN_PHOTO_CLIP = tornPolygon(21, 2.8, 16);
export const NEWS_CLIP = tornPolygon(42, 2.2, 14);
export const LABEL_CLIP = tornPolygon(5, 3.5, 8);

/** Small pseudo-random number in [min, max] from an integer key. */
export function hashRange(key: number, min: number, max: number): number {
  const rand = seeded(key * 9301 + 49297);
  rand();
  return r2(min + rand() * (max - min));
}
