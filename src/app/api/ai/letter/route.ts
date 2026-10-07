import { NextResponse } from "next/server";

interface GenerateParams {
  recipientName?: string;
  senderName?: string;
  tone?: string;
  occasion?: string;
  memories?: string;
  type?: "letter" | "caption" | "poem" | "vows";
}

export async function POST(request: Request) {
  try {
    const body: GenerateParams = await request.json();
    const {
      recipientName = "My Love",
      senderName = "Yours Always",
      tone = "romantic",
      occasion = "Just Because",
      memories = "",
      type = "letter",
    } = body;

    const memorySnippet = memories ? `Remembering: ${memories}. ` : "";

    let generatedText = "";
    let generatedTitle = "";

    if (type === "caption") {
      const captions = [
        `With you, every second becomes my favorite memory. ${memorySnippet}Forever in love with your smile.`,
        `Out of seven billion smiles in the world, yours is the only one that stops my heart.`,
        `Just a snapshot of us doing life together. There's nowhere else I'd rather be.`,
        `Found my safe place, my best friend, and my home all in one person.`,
      ];
      generatedText = captions[Math.floor(Math.random() * captions.length)];
      generatedTitle = "Our Sweet Moments";
    } else if (type === "poem") {
      generatedTitle = `A Verse for ${recipientName}`;
      generatedText = `In the quiet glow of dawn and golden dusk of night,
Your laughter is the melody that makes my world turn bright.
Through every storm and gentle breeze, through all the steps we take,
My heart is yours forevermore, in every choice I make.
${memories ? `\nLike when ${memories} — my world felt so complete.` : ""}`;
    } else if (type === "vows") {
      generatedTitle = `My Promises to You, ${recipientName}`;
      generatedText = `I promise to hold your hand through every chapter of our lives, to celebrate your happiest triumphs and comfort you in quiet hours.

I promise to make you laugh when life is heavy, to share coffee in the morning and dream beneath the stars at night. ${memorySnippet}

You are my favorite discovery and my forever adventure. I choose you today, tomorrow, and for all our days to come.`;
    } else {
      // Default: Love letter
      if (tone === "playful") {
        generatedTitle = `To My Favorite Human, ${recipientName} 🍓`;
        generatedText = `Hey you,

Thank you for being the sweetest weirdo who understands all my silly jokes and makes even grocery runs feel like the best date ever. 

${memories ? `I will never forget when ${memories} — it still makes me grin just thinking about it. ` : ""}You make my heart do little happy dances every single day. I love you more than pizza, morning coffee, and sleeping in on Sundays combined!

Love you to the moon and beyond,`;
      } else if (tone === "poetic") {
        generatedTitle = `To ${recipientName}, My Infinite Star ✨`;
        generatedText = `Dearest ${recipientName},

If love had a geography, my entire map would lead straight to you. You walked into my life not like a storm, but like morning sunlight quietly transforming the room into warmth.

${memories ? `Every detail of ${memories} is etched in my soul. ` : ""}Thank you for your gentleness, the resonance of your voice, and the sanctuary I find in your embrace. With you, eternity feels like just enough time.

Forever and deeply yours,`;
      } else if (tone === "nostalgic") {
        generatedTitle = `Looking Back, Loving You More Each Day 🎞️`;
        generatedText = `My dearest ${recipientName},

Looking through these snapshots reminds me of how far we've traveled hand in hand. From our very first hello to this exact heartbeat, every chapter with you has been a treasure.

${memories ? `Thinking back to ${memories}, I realized just how lucky I am to have found you in this big, noisy world. ` : ""}Thank you for being my constant companion, my confidant, and the greatest love of my life.

With timeless affection,`;
      } else {
        // Romantic
        generatedTitle = `To the Love of My Life, ${recipientName} 💖`;
        generatedText = `Every day with you feels like a gift I didn't know I needed. Thank you for your laugh, your endless patience, and the effortless way you turn ordinary moments into extraordinary memories.

${memories ? `When I look back on ${memories}, I know that loving you is the easiest and truest thing I have ever done. ` : ""}No matter where this journey takes us, having you by my side makes life an adventure I never want to end.

I love you more than words could ever express,`;
      }
    }

    return NextResponse.json({
      success: true,
      title: generatedTitle,
      text: generatedText,
      recipientName,
      senderName,
    });
  } catch (error: any) {
    console.error("API /api/ai/letter error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate romantic letter" },
      { status: 500 }
    );
  }
}
