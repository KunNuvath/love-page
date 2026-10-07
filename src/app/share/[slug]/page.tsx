import { redirect } from "next/navigation";

// ── Legacy redirect ────────────────────────────────────────────────────────────
// Old links used /share/<slug>. New canonical path is /p/<slug>.
// This redirect makes both work forever — no broken old links.
export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export default function LegacyShareRedirect({ params }: Props) {
  redirect(`/p/${params.slug}`);
}
