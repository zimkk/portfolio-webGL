# BUILD PROMPT — "RIDGELINE" / hassannazir.dev

> A scroll-driven WebGL portfolio for Hassan Nazir. This is not a normal landing page. It is a cinematic, first-person journey up a generative mountain pass where each chapter of his career is a waypoint, the terrain is visibly *computed*, and a swarm of AI agent-drones rides alongside the viewer. Target: Awwwards Site of the Day caliber.

Hand this entire document to your builder (Claude Code, a creative developer, Cursor, or v0). Build it scene by scene. Do not flatten the concept into a generic dark template.

---

## 0. THE CONCEPT (read this first — protect it)

**Core metaphor:** Hassan is two things at once — an engineer who builds **multi-agent AI systems**, and a rider who tours the **northern Pakistan / Karakoram** mountain roads on a motorcycle. The site fuses both. The visitor rides a road up a mountain pass at pre-dawn. The mountains are not photoreal — they are **generated, wireframe / point-cloud terrain that resolves as you climb**, signaling "this world is computed." Accompanying the rider is a **constellation of small glowing agent-drones** — the literal embodiment of his OpenClaw agent hierarchy (a lead drone = Tommy the orchestrator, seven smaller ones in formation).

**Scroll is the throttle.** Scrolling drives the camera forward along a spline that climbs the pass. Each switchback / plateau is a chapter of his career. The journey ends at a summit at sunrise where the entire landscape dissolves into a constellation of his projects.

**Emotional arc:** cold digital void → structured ascent → the swarm awakens (centerpiece) → velocity → warm summit payoff → the human behind it → the road continues to the horizon.

**One-line pitch for the build team:** "Bruno Simon's playfulness × Lando Norris's race-pace momentum × Messenger's living WebGL world — but it's a motorcycle climbing a computed Karakoram pass, and the mountain is made of his career."

---

## 1. TECH STACK

- **Framework:** Next.js (App Router) + TypeScript
- **3D:** React Three Fiber + `@react-three/drei` + `@react-three/postprocessing`
- **Custom shaders:** raw GLSL for terrain (vertex displacement from noise), fog, particle/agent field, and the dissolve transitions. This is where the "out of this world" lives — do not fake it with CSS.
- **Scroll + motion:** Lenis (smooth inertia scroll) driving GSAP **ScrollTrigger** for scene pinning and scroll-linked camera animation along a `CatmullRomCurve3` spline.
- **2D UI overlay:** Framer Motion for text reveals, chapter labels, cursor, magnetic buttons.
- **Post-processing:** Bloom (on agent-drones + accents), subtle depth-of-field, vignette, film grain, chromatic aberration on speed beats only.
- **Audio (optional, off by default):** Howler or native Web Audio for a low engine hum + directional wind, spatialized like Bruno Simon's portfolio. Hard mute toggle, never autoplay with sound.
- **Type animation:** custom scramble/decode effect for headings (GSAP or splittype).

Performance budget: first meaningful paint under ~2.5s, clamp DPR to 2, instanced meshes for drones/particles, lazy-init heavy scenes, and a `prefers-reduced-motion` + low-power fallback (see §7).

---

## 2. THE SCROLL STORYBOARD (scene by scene)

Build each scene as a pinned section. The camera is on a continuous spline; section boundaries trigger terrain/material/agent state changes. Transitions between chapters use a **shader dissolve** (terrain particles scatter and re-form into the next landform) — never a hard cut except in the velocity section.

### Scene 0 — PRELOADER ("Ignition")
- Pure black. A single headlight beam cuts through volumetric fog.
- A percentage counter (00 → 100) in mono, bottom-left. Terrain wireframe assembles in the dark behind it as assets load.
- On 100: a soft engine-ignition swell (muted unless sound is on), the fog parts, camera eases forward. Curtain wipe up.

### Scene 1 — HERO ("The Ridge")
- First-person POV on a dark ridge, pre-dawn blue hour. Generative peaks silhouetted, slow drifting fog, a faint road ahead vanishing into mist.
- Name **HASSAN NAZIR** resolves from scattered particles into solid type (decode effect).
- Sub-line (rotates or pick one): *"Engineer of autonomous systems. Rider of mountain roads."* / *"I build multi-agent AI. I ride the Karakoram. Same instinct."*
- Tag chips, small mono: `Multi-Agent AI` · `Full-Stack` · `Automation` · `Islamabad, PK`
- Scroll cue: a pulsing chevron + "SCROLL TO RIDE".

### Scene 2 — DEPARTURE ("Where the road starts")
- Scroll begins forward motion. The void gives way to the first stretch of road; low foothills form from noise.
- Chapter card (left-anchored, parallaxed): **2020 — 2023 · The Foundations**
  - *Audio Transcriber, then QA Specialist at Touchstone Communications.* Where the discipline started: precision, listening, finding the fault before the user does.
- Visual: sparse terrain, muted. The world is still "booting."

### Scene 3 — THE BUILD ("Gridcore")
- Terrain becomes structured — wireframe scaffolding, lattice towers rising along the roadside, a sense of construction.
- Chapter card: **Dec 2023 — Present · Founder & CTO, Gridcore**
  - Started his own software + AI engineering consultancy. Fully remote. Shipped products end to end — *Speedyinfluencer*, *Finart* — across TypeScript, React, NestJS, PostgreSQL, Docker, Nginx, GitHub Actions.
- Small detail: as you pass, a roadside marker reads `gridcore.co`.

### Scene 4 — THE SWARM ⭐ (centerpiece — "Agents awaken")
This is the showpiece. Give it the most time, the most polish, the most scroll distance.
- The terrain reveals it was point-cloud all along — points lift off the surface and reorganize into a **living swarm of agent-drones** that fall into formation around the rider.
- One larger drone leads (**Tommy — the orchestrator**); smaller drones (**John, Dave, Tao, Sol, Jim, Tana, Zia**) orbit in a hierarchy. Thin light-links draw between them (the delegation graph). Interaction-as-play: hovering a drone reveals its name + role; the formation reacts to the cursor like a flock (boids).
- Chapter card: **Aug 2025 — Apr 2026 · Senior AI / AI Automation Engineer, NDT Legacy Group**
  - Designed and deployed a production multi-agent hierarchy. LangChain, vector DBs, GoHighLevel, n8n orchestration.
- Inset callout: **OpenClaw** — his proprietary 8-agent platform. Tommy as CEO orchestrator + 7 sub-agents, SQLite + sqlite-vec memory, Telegram control, running on a VPS ("Julie") over Tailscale. *This is the system the swarm you're looking at represents.*

### Scene 5 — VELOCITY ("Range")
- Hard tonal shift to **speed** (this is the Lando Norris beat). Motion blur, chromatic aberration, the road whips. Milestones flash past as roadside signs you barely catch — momentum over detail.
- Flashing markers (fast cuts):
  - **Brilliant Gaming L.L.C.** — QA Automation Engineer (EPWIN app, Python/JS test automation, CI/CD)
  - **Schmoozzer** — Senior AI Engineer (agentic workflows, LLM apps, n8n)
  - **Uno O.S.** — AI Architect (Apr 2026 — present)
- Closing line as speed settles: *"Different machines. Same throttle."*

### Scene 6 — THE SUMMIT ⭐ ("Built things")
- Crest the pass. **Sunrise payoff** — the cold blue breaks into a warm aurora/dawn gradient over the peaks (this is the one place warm tones are welcome; it's the emotional release). The whole valley below is now a **constellation of project nodes**, glowing.
- Projects as interactive orbiting cards / 3D nodes. Click to expand a detail panel (Framer Motion). Surface these:
  - **OpenClaw** — proprietary multi-agent orchestration platform (8-agent hierarchy).
  - **Drift** — Pakistan-first online travel marketplace (tours, hotels, car rentals, buses, attractions). *Keep this card self-contained — describe it on its own terms, do not blend in stack details from his other projects.*
  - **TalentGrid** — curated talent marketplace.
  - **Browser Minecraft Clone** — TypeScript · Three.js · Vite, MIT open source. *Lead with this — it proves he built the kind of WebGL this very site runs on.*
  - **Finart** & **Speedyinfluencer** — Gridcore products.
  - Tag line: *"70+ repositories. A few that mattered most."* → link to `github.com/zimkk`.

### Scene 7 — THE RIDER ("The human")
- Camera dismounts. Slower, warmer, quieter. A parked motorcycle silhouette against the dawn ridge.
- About copy (his voice — direct, no fluff): based in **Islamabad, Pakistan**. BS Computer Science, 2024. Builds autonomous agent systems by day; plans long touring routes through **northern Pakistan and Azad Kashmir**; reads **Urdu literature** (has even built Urdu audiobook pipelines from his own library). The mountains aren't a metaphor he reached for — they're where he actually goes.

### Scene 8 — HORIZON (Contact / CTA)
- The road continues past the summit toward an infinite horizon line. Minimal.
- Big magnetic CTA: **Let's build something.** → mail `hassannazir955@gmail.com`.
- Links, mono, understated: `github.com/zimkk` · `linkedin.com/in/hassannazirrr` · `gridcore.co` · `hassannazir.dev`
- Footer: tiny credit line, current year, a final flickering tail-light dot.

---

## 3. ART DIRECTION & DESIGN TOKENS

**Mood:** premium, cinematic, cold-to-warm, engineered. Think aerospace HUD meets alpine pre-dawn. Restraint everywhere except the swarm and the summit.

**Color**
- Base / void: `#05060A`
- Surface: `#0A0A0F`
- Signature electric blue (his color): `#5B7FFF` → `#6B8AFF` (accents, agent glow, links, line-art)
- Cyan-blue glow secondary: soft `#7FE9FF` for bloom highlights
- Off-white text: `#EDEFF5`
- Muted metadata grey: `#8A90A6`
- **Summit-only warm payoff:** dawn gradient amber→rose (e.g. `#FFB27A` → `#FF7E9D`). Reserved exclusively for Scene 6. Everywhere else stays cool.

> Note: this is Hassan's *personal* site, so the warm summit accent is intentional and allowed — this is **not** the Gridcore brand system, which forbids warm tones. Keep the two separate.

**Typography**
- Display / chapter titles: a confident grotesk (PP Neue Montreal, Aeonik, or General Sans vibe) — large, tight tracking. Optionally a high-contrast display serif for chapter numbers to add editorial tension.
- Body: clean sans (Inter / Geist).
- Metadata, tags, counters, coordinates: a mono (Geist Mono / JetBrains Mono). Lean into mono for that "instrument panel" feel.
- Use real kinetic type: decode/scramble on entry, mask-reveal on scroll.

**Motion principles**
- Smooth inertia scroll (Lenis), nothing snaps unless intentional (the velocity scene).
- Camera glides on a spline; never teleports.
- Custom cursor: a small ring that magnetizes to interactive elements and reads context ("VIEW", "RIDE").
- Every transition is *physical* — particles scatter and re-form, fog rolls, light bleeds. No fade-to-black cuts except the velocity beat.
- Parallax depth on every chapter card (foreground UI moves slower than the world).

---

## 4. STEAL-LIST (what to borrow from the actual award winners)

- **Lando Norris (OFF+BRAND, Site of the Year 2025):** race-pace momentum, hard kinetic cuts, speed as emotion → Scene 5 (Velocity).
- **Messenger (Site of the Year 2025):** a living, self-contained WebGL micro-world; interaction becomes play, the visitor is a participant not a scroller → Scene 4 (the Swarm).
- **Bruno Simon Portfolio (Site of the Month, Jan 2026):** the ride mechanic itself, directional/spatial audio, handcrafted-world charm → the whole ride conceit + optional sound.
- **Igloo Inc / Lusion v3:** shader craft, cohesive premium art direction, flawless loading/transition polish → the dissolve transitions and overall finish.

The point isn't to copy any one of them — it's to hit their *bar*. Cohesion and craft beat feature-count.

---

## 5. INTERACTION DETAILS (the small stuff that wins awards)

- Preloader counter that actually maps to asset load progress, not a fake timer.
- Hover the agent-drones → name + role tooltip; click Tommy → the whole hierarchy briefly highlights its delegation links.
- Scroll velocity feeds the shaders: scroll faster → more motion blur, fog turbulence, drone agitation. Stop → the world settles and breathes.
- Magnetic buttons + custom cursor states.
- A persistent minimal HUD in a corner: an altitude/progress readout (`0m → SUMMIT`) and a chapter index, styled like instruments. Doubles as scroll progress + nav.
- Konami-style easter egg (optional, on-brand): tap a hidden marker → the motorcycle does a quick throttle/wheelie flourish. Bruno-Simon energy.

---

## 6. SEO / META / HEAD

- Title: `Hassan Nazir — Multi-Agent AI Systems Engineer`
- Description: builds autonomous multi-agent AI systems and full-stack products; founder & CTO of Gridcore; based in Islamabad.
- Open Graph image: a rendered frame of the summit constellation, name overlaid.
- Structured data: `Person` schema (name, jobTitle, url, sameAs → GitHub/LinkedIn).
- Canonical: `https://hassannazir.dev`.

---

## 7. ACCESSIBILITY, FALLBACKS & PERFORMANCE (non-negotiable)

- **`prefers-reduced-motion`:** serve a calm, fully-functional version — static beautiful stills per chapter, normal scroll, no camera flight, no shader churn. All content still present and readable.
- **Low-power / mobile / weak GPU:** detect and downgrade — simpler terrain (fewer points), drone count reduced, post-processing off, capped DPR. Never ship a janky 3D experience to a phone; ship a lighter, still-gorgeous one.
- **Keyboard + screen reader:** all copy lives in real, semantic DOM (the 3D is decorative/augmentative, not the only source of content). Skip-to-content, focus states, alt text on the OG/preview assets, ARIA labels on nav/HUD.
- **Audio:** off by default, explicit toggle, respects system mute. Never autoplay sound.
- **Performance targets:** Lighthouse 90+ on the reduced-motion build; lazy-load scenes; suspend offscreen 3D; instanced geometry for all particle/drone systems; compress and KTX2/Draco any loaded assets.

---

## 8. CONTENT APPENDIX (verbatim facts — use these, don't invent)

**Identity**
- Name: Hassan Nazir
- Location: Islamabad, Pakistan
- Education: BS Computer Science, 2024
- Site: hassannazir.dev · GitHub: github.com/zimkk · LinkedIn: linkedin.com/in/hassannazirrr · Email: hassannazir955@gmail.com
- Positioning: Multi-agent AI systems · full-stack development · automation engineering. 70+ GitHub repositories.

**Career timeline (chronological — this is the ride order)**
1. Touchstone Communications PK — Audio Transcriber (Jul 2020 – May 2021, part-time)
2. Touchstone Communications PK — QA Specialist (Dec 2022 – Nov 2023)
3. Gridcore — Founder & CTO / Full-Stack Engineer (Dec 2023 – present). Stack: TypeScript, React, NestJS, PostgreSQL, Docker, Nginx, GitHub Actions. Products: Speedyinfluencer, Finart.
4. Brilliant Gaming L.L.C. — QA Automation Engineer (Feb – Sep 2025, contract, remote). EPWIN app; Python/JS test automation; n8n; CI/CD.
5. NDT Legacy Group — Senior AI Engineer → AI Automation Engineer (Aug 2025 – Apr 2026). LangChain, vector DBs, multi-agent hierarchy, GoHighLevel, n8n.
6. Schmoozzer — Senior AI Engineer (Oct 2025 – Jan 2026, contract). Agentic workflows, LLM apps, n8n.
7. Uno O.S. — AI Architect (Apr 2026 – present, part-time).

**Flagship projects**
- **OpenClaw** — proprietary multi-agent AI platform. 8-agent hierarchy: Tommy (CEO orchestrator) + John, Dave, Tao, Sol, Jim, Tana, Zia. SQLite + sqlite-vec memory, Telegram control, deployed on VPS "Julie" via Tailscale.
- **Drift** — Pakistan-first online travel marketplace (tours, hotels, car rentals, buses, attractions). *Self-contained card only.*
- **TalentGrid** — curated talent marketplace.
- **Browser Minecraft Clone** — TypeScript, Three.js, Vite; MIT open source. (Surface prominently — it validates the site's own tech.)
- **Finart**, **Speedyinfluencer** — Gridcore products.

**The human**
- Motorcyclist; plans extensive touring routes through northern Pakistan and Azad Kashmir.
- Urdu literature enthusiast; has built Urdu audiobook pipelines from his personal PDF library.

---

## 9. SWAPPABLE ALTERNATE SPINE (if you ever want a different world)

The road-up-a-pass is the recommended spine. If a future version wants pure-AI abstraction instead of mountains, keep the *exact same career storyboard and scene order* but reskin the world as a **dark neural constellation** — the camera flies through an expanding agent graph, milestones are nodes, the swarm is the whole environment, and the "summit" is the fully-resolved network. Same narrative, different skin. Don't blend the two — pick one and commit.

---

**Final note to the builder:** the failure mode here is a pretty dark template with a particle background and parallax text. That is not this. The win condition is that a visitor forgets they're scrolling a webpage and feels like they took a ride. Commit to the world. Make every chapter earn its scroll distance. Go.
