import { createLovePage, uploadImage } from "@/src/lib/supabase";
import LittleBook from "@/src/components/LittleBook";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Little Book — Spiral Memory Journal",
  description:
    "An interactive spiral-bound memory book on a craft cutting mat desk with 18 photo frames and 4 spreads.",
};

export default function LittleBookAliasPage() {
  return <LittleBook />;
}

