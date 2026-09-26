"use client";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import type { LovePage } from "@/src/lib/supabase";

export default function LittleBookShareView({ config }: { page: LovePage; config: any }) {
  const photos: Record<string, string> = config?.photos ?? {};
  const notes: Record<string, string> = config?.notes ?? {};
  const ids = Object.keys(photos).map(Number).sort((a, b) => a - b);

  return (
    <div className="min-h-screen cutting-mat-bg py-10 px-4 flex flex-col items-center">
      <Link href="/" className="self-start flex items-center gap-1.5 text-white mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <h1 className="font-bagel text-3xl text-washi-navy text-center">{config?.title}</h1>
      {config?.subtitle && <p className="font-gaegu text-xl text-washi-cherry mb-8">{config.subtitle}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl w-full mb-10">
        {ids.map((id) => (
          <div key={id} className="bg-white p-2 rounded shadow-md">
            <img src={photos[id]} alt={`Photo ${id}`} className="w-full h-auto rounded" />
          </div>
        ))}
      </div>
      <div className="max-w-2xl w-full space-y-4">
        {Object.values(notes).map((text, i) => (
          <p key={i} className="font-gaegu text-lg whitespace-pre-wrap bg-white/80 p-4 rounded">{text}</p>
        ))}
      </div>
      <div className="mt-10 flex items-center gap-1.5 text-white/80 text-sm">
        <Heart className="h-4 w-4 text-washi-cherry" /> Made with LovePage
      </div>
    </div>
  );
}
