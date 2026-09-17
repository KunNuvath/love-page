# Love Page — for Lina 💗

A small, personal Next.js + TailwindCSS + shadcn-style page: a message, a photo
grid, and a background song. Built to be easy to reskin.

## 1. Install

```bash
npm install
```

## 2. Add your content

- **Photos** — drop your images into `public/photos/` and list the filenames
  in `CONFIG.photos` inside `components/LovePage.tsx`.
- **Music** — drop an mp3 into `public/music/` (e.g. `song.mp3`) and set
  `CONFIG.song.src` in the same file.
- **Message / names** — edit the `CONFIG` object at the top of
  `components/LovePage.tsx`. Everything on the page is driven from that one
  object, so you don't need to touch the layout to change the words.

## 3. Run it locally

```bash
npm run dev
```

Open http://localhost:3000.

## 4. Deploy it for free

The easiest free hosting for a Next.js app is **Vercel**:

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com, sign in with GitHub, and "Import" the repo.
3. Leave the defaults (it auto-detects Next.js) and click Deploy.
4. You'll get a free `your-project.vercel.app` link to share.

Netlify (netlify.com) also has a free tier that works well with Next.js if
you'd rather use that instead.

## Structure

```
app/
  layout.tsx       — root layout, page metadata
  page.tsx          — renders the LovePage component
  globals.css       — Tailwind + shadcn-style CSS variables (rose theme)
components/
  LovePage.tsx      — all the content lives here (CONFIG object at the top)
  ui/
    button.tsx      — shadcn Button
    card.tsx        — shadcn Card
public/
  photos/           — put your images here
  music/            — put your mp3 here
```

## Notes

- The floating hearts, fade-in, and pulse animations are plain CSS
  keyframes defined in `tailwind.config.ts` — tweak timing/count in
  `FloatingHearts` inside `LovePage.tsx`.
- Colors are CSS variables in `app/globals.css` (`--primary`, `--accent`,
  etc.) — change those to reskin the whole palette in one place.
- No backend/database — this is a static personal page, so hosting is free
  and there's nothing to configure server-side.
