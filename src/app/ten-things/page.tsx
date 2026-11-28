import type { Metadata } from "next";
import TenThingsBook from "@/src/components/ten-things/TenThingsBook";

export const metadata: Metadata = {
  title: "10 Things I Love About You (3D Flipbook) | LovePage",
  description:
    "A romantic 3D flipbook celebrating 10 things you love about your partner — heart locket cover, 28 photo slots, envelope polaroids, iMessage assurance page, film strip & butter-yellow letter.",
};

export default function TenThingsEditorPage() {
  return <TenThingsBook />;
}
