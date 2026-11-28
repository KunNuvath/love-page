import type { User } from "@supabase/supabase-js";

export interface PremiumTemplate {
  id: string;
  name: string;
  price: string;
  href: string;
}

export const PREMIUM_TEMPLATES: Record<string, PremiumTemplate> = {
  "adventure-scrapbook": {
    id: "adventure-scrapbook",
    name: "Our Little Adventure",
    price: process.env.NEXT_PUBLIC_PREMIUM_PRICE || "$4.99",
    href: "/adventure",
  },
  "family-album": {
    id: "family-album",
    name: "Scrapbook Album (9-Page Flip Album)",
    price: process.env.NEXT_PUBLIC_PREMIUM_PRICE || "$4.99",
    href: "/album",
  },
  "love-flipbook": {
    id: "love-flipbook",
    name: "Love Flipbook (16-Page Leather Scrapbook)",
    price: "$9.99",
    href: "/flipbook",
  },
  "love-story": {
    id: "love-story",
    name: "Love Story",
    price: "$5.99",
    href: "/love-story",
  },
  "anniversary-velvet": {
    id: "anniversary-velvet",
    name: "1 Year With You (Velvet Flipbook)",
    price: "$7.99",
    href: "/anniversary",
  },
};

export function getUnlockedTemplates(
  user: Pick<User, "app_metadata" | "user_metadata"> | null | undefined
): string[] {
  const appList = Array.isArray(user?.app_metadata?.unlocked_templates)
    ? user.app_metadata.unlocked_templates
    : [];
  const userList = Array.isArray(user?.user_metadata?.unlocked_templates)
    ? user.user_metadata.unlocked_templates
    : [];
  return Array.from(new Set([...appList, ...userList])).filter(
    (x): x is string => typeof x === "string"
  );
}

export function hasTemplateAccess(
  user: Pick<User, "app_metadata" | "user_metadata" | "id"> | null | undefined,
  templateId: string
): boolean {
  if (typeof window !== "undefined") {
    try {
      if (localStorage.getItem(`lovepage_unlocked_${templateId}`) === "true") {
        return true;
      }
      if (
        user?.id &&
        localStorage.getItem(`lovepage_unlocked_${templateId}_${user.id}`) === "true"
      ) {
        return true;
      }
    } catch {}
  }
  if (!user) return false;
  if (user.app_metadata?.premium_all === true || user.user_metadata?.is_premium === true) {
    return true;
  }
  return getUnlockedTemplates(user).includes(templateId);
}
