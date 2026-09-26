# atharva's portfolio

A mac-desktop style portfolio: draggable windows, stickers, a working dock with a trash can, and an iPod music pill.

```bash
npm run dev     # http://localhost:3000
npm run build
```

## editing content
All text lives in `src/lib/data.ts` (profile, projects, experience, skills).

## adding your media
- **photo**: `public/media/me.jpg` (swap the file to change it)
- **project screenshots**: `public/media/outly.png` etc., then set `image: "/media/outly.png"` on the project
- **music**: drop an mp3 at `public/music/track.mp3` (title/cover under `music` in data.ts)
- **resume**: replace `public/resume.pdf`

Anything left unset keeps its hand-drawn placeholder.

## fun stuff
- drag anything; drop desktop items on the dock's trash (or hit a window's red light) — put them back from the trash
- green light / click opens a window big; esc closes
- click the kaomoji or the cat logo (meow); the headphones icon in the menu bar opens the music player (never autoplays)
- skills: click an icon to see which project/internship used it (derived from the `stack` lists in data.ts)
