import { NextResponse } from "next/server";

export async function GET() {
  const tracks = [
    {
      id: "track-1",
      title: "Miguel - Sure Thing",
      artist: "Miguel",
      src: "/music/miguel-sure-thing.mp3",
      mood: "Soulful R&B & Tender",
      duration: "3:15",
    },
    {
      id: "track-2",
      title: "Giveon - For Tonight / Numb",
      artist: "Giveon",
      src: "/music/giveon-numb.mp3",
      mood: "Acoustic Warmth & Deep Love",
      duration: "3:40",
    },
    {
      id: "track-3",
      title: "Mac Miller - Cinderella",
      artist: "Mac Miller",
      src: "/music/macmiller-cinderella.mp3",
      mood: "Sweet Melodic Vibes",
      duration: "4:12",
    },
    {
      id: "track-4",
      title: "Sweet Lo-Fi Romance Melodies",
      artist: "LovePage Studio",
      src: "/music/demo-love-song.wav",
      mood: "Soft Gentle Lo-Fi Ambient",
      duration: "2:30",
    },
  ];

  return NextResponse.json({ success: true, tracks });
}
