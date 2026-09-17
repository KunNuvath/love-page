import type { Metadata } from "next";
import { Caveat, Courier_Prime, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
  display: "swap",
});

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Memories — Curated for Lina",
  description: "A scrapbook love page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${courierPrime.variable} ${jakarta.variable}`}
    >
      <body className="min-h-screen bg-[#f3d5cf] font-sans antialiased selection:bg-[#e29578]/30">
        {children}
      </body>
    </html>
  );
}
