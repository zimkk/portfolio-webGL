# Ridgeline

A scroll-driven 3D portfolio — a motorcycle ride up a computed Karakoram mountain pass. Built with Next.js, React Three Fiber, and Framer Motion.

**Live demo:** [hassannazir.dev](https://hassannazir.dev)

---

## Features

- **Scroll-driven 3D world** — a procedural alpine terrain, day-cycle (night → astronomical dawn → sunrise → golden morning), volumetric fog, stars, Milky Way, cirrus clouds
- **Cinematic camera** — per-scene set pieces: aerial hero reveal, swarm liftoff, tarmac velocity run, summit crest rise, sky ascent
- **Agent swarm** — 8 animated drones (Tommy + 7 sub-agents) with spring-flocking, delegation links, and data packets
- **Parked motorcycle** — Honda Shadow RS 2010 GLTF model at the overlook with warm/cool lighting
- **Music player** — jingle-truck-icon playlist with track progress, volume, prev/next. Drop your own MP3s into `public/audio/`
- **Post-processing** — bloom, god rays, chromatic aberration, vignette, film grain
- **Custom cursor**, magnetic button, decode/scramble text, mask-reveal on scroll
- **HUD** — scene nav dots + altitude meter. Keyboard: `↑` / `↓` to jump scenes
- **Accessibility** — skip link, ARIA labels, reduced-motion support, focus styles
- **Device-adaptive** — HIGH tier (postFX, 200-segment terrain) vs LOW tier (no postFX, 110 segments) based on memory/cores/screen

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| 3D | Three.js + React Three Fiber + Drei |
| Post-processing | `postprocessing` + `@react-three/postprocessing` |
| Animation | Framer Motion |
| Scroll | Lenis |
| Fonts | Space Grotesk · Inter · JetBrains Mono |
| Styling | Tailwind CSS v4 |

## Quick Start

```bash
git clone https://github.com/zimkk/modern-portfolio
cd modern-portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Making It Yours

### 1. Edit your content

Everything visible on screen is in **`src/lib/content.ts`**:

```ts
export const IDENTITY = {
  name: "Your Name",
  role: "Your Role",
  email: "you@example.com",
  // ...
};

export const CHAPTERS = [ /* career chapters */ ];
export const PROJECTS = [ /* your projects */ ];
export const SKILLS    = [ /* skill groups */ ];
// ...
```

### 2. Set your site URL

Copy `.env.example` → `.env.local` and set:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

This drives the sitemap, robots.txt, OG image URL, and canonical links.

### 3. Add music

The player expects MP3 files in `public/audio/`. They are gitignored so you must supply your own.

Edit the `PLAYLIST` array in `src/components/ui/SoundToggle.tsx`:

```ts
const PLAYLIST = [
  {
    id: "01",
    title: "Track Title",
    artist: "Artist",
    src: "/audio/your-track.mp3",
    duration: "4:30",
    startTime: 0, // optional: start at N seconds
  },
  // ...
];
```

## Architecture

### How scroll maps to scenes

`lib/ride.ts` defines 9 scenes with relative weights. Lenis scroll position maps to a global `progress` (0→1) via `setProgress()`. Every consumer — the 3D camera, the DOM overlay, the day-cycle, the post-processing — reads from the same shared `ride.progress` so nothing drifts out of sync.

```
Lenis scroll → setProgress(p) → ride.progress
                                 ├── Rig.tsx     (camera set pieces)
                                 ├── Atmosphere  (day-cycle: night → dawn → sunrise)
                                 ├── Sections    (DOM scene layers, opacity-driven)
                                 ├── PostFX      (bloom, god rays, aberration)
                                 └── HUD         (altitude = p × 5000 m)
```

### Adding a scene

1. Add to `RAW` in `lib/ride.ts` with a `weight`
2. Add `SceneId` type literal
3. Add `<SceneLayer id="..." label="...">` in `Sections.tsx`
4. Add content to `lib/content.ts`
5. Add a day-cycle keyframe to `lib/sky.ts` at the right `p` value
6. *(Optional)* Add a camera set piece in `three/Rig.tsx`

### File map

```
src/
├── app/
│   ├── layout.tsx           # metadata, fonts, JSON-LD
│   ├── page.tsx             # renders <Ridgeline />
│   ├── globals.css          # design tokens, Tailwind, utility classes
│   ├── sitemap.ts           # auto-generated sitemap
│   ├── robots.ts            # robots.txt
│   └── opengraph-image.tsx  # dynamic OG image
├── components/
│   ├── Ridgeline.tsx        # root shell — preloader, 3D, scroll, HUD
│   ├── Sections.tsx         # DOM overlay scenes (9 SceneLayers)
│   ├── SmoothScroll.tsx     # Lenis wrapper
│   ├── three/
│   │   ├── Experience.tsx   # R3F Canvas
│   │   ├── Atmosphere.tsx   # sky dome shader + sun disc + lights
│   │   ├── Terrain.tsx      # displaced mesh + alpenglow shader
│   │   ├── Road.tsx         # asphalt ribbon + markings + guard posts
│   │   ├── FogPlanes.tsx    # screen-space fog sheets
│   │   ├── Roadside.tsx     # lattice towers, Gridcore sign, parked bike (GLTF)
│   │   ├── WorldLife.tsx    # valley lights, pennants, speed streaks, dawn motes
│   │   ├── Swarm.tsx        # 8-drone agent flock
│   │   ├── Rig.tsx          # camera choreography + headlight
│   │   └── PostFX.tsx       # bloom, god rays, aberration, vignette, grain
│   └── ui/
│       ├── Preloader.tsx    # count-up 00→100, slides away
│       ├── HUD.tsx          # scene nav dots + altitude + keyboard nav
│       ├── SoundToggle.tsx  # jingle-truck music player
│       ├── Cursor.tsx       # lagged ring cursor
│       ├── ChapterCard.tsx  # editorial chapter overlay
│       └── ...              # Decode, Reveal, CountUp, MagneticButton, etc.
└── lib/
    ├── content.ts           # all copy — IDENTITY, CHAPTERS, PROJECTS, SKILLS, etc.
    ├── ride.ts              # global scroll state + scene definitions + math helpers
    ├── sky.ts               # 9-keyframe day-cycle (night → dawn → sunrise → morning)
    ├── world.ts             # terrain model — roadX, floorY, terrainHeight, camera path
    └── device.ts            # device tier detection (HIGH vs LOW)
```

## Attribution

- **Honda Shadow RS 2010** by [Alex.Ka.](https://sketchfab.com/Alex.Ka.) — [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Not for commercial use, not modifiable.
- **Audio** — not included. Supply your own tracks in `public/audio/`.

## License

MIT — see [LICENSE](LICENSE).

The Honda Shadow model in `public/models/` is CC BY-NC-ND 4.0 and is explicitly excluded from the MIT grant. See [LICENSE](LICENSE) for details.
