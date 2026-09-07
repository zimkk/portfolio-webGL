// ============================================================
// RIDGELINE — single source of truth for all DOM overlay copy.
// The portfolio is a riding story and a career story told as one.
// ============================================================

export const IDENTITY = {
  name: "Hassan Nazir",
  role: "Forward Deployed Engineer",
  location: "Islamabad, Pakistan",
  education: "BS Computer Science, Air University — 2024",
  email: "hassannazir955@gmail.com",
  site: "hassannazir.dev",
  github: "github.com/zimkk",
  githubUrl: "https://github.com/zimkk",
  linkedin: "linkedin.com/in/hassannazirrr",
  linkedinUrl: "https://linkedin.com/in/hassannazirrr",
  gridcore: "gridcore.co",
  gridcoreUrl: "https://gridcore.co",
  tagline: "Engineer of autonomous systems. Rider of mountain roads.",
  chips: ["Multi-Agent AI", "Full-Stack", "Automation", "Islamabad, PK"],
} as const;

export type Chapter = {
  id: string;
  index: string;
  kicker: string;
  title: string;
  body: string;
  callout?: { label: string; text: string };
  align: "left" | "right" | "center";
};

export const CHAPTERS: Chapter[] = [
  {
    id: "departure",
    index: "01",
    kicker: "2020 — 2023 · The Foundations",
    title: "Where the road starts",
    body: "First job wasn't code — it was audio. Transcription work at Touchstone Communications, learning to listen for where the signal breaks. A year later, QA Specialist, testing internal software for 14+ teams and 500+ employees. The discipline that stuck: precision, pattern recognition, finding the fault before the user does. Computer Science at Air University running in parallel. One hand in a textbook, one already reaching for a keyboard.",
    align: "left",
  },
  {
    id: "build",
    index: "02",
    kicker: "Aug 2021 — Present · GridCore, Islamabad",
    title: "The first long climb",
    body: "Joined GridCore in August 2021 as Associate Software Engineer. Promoted to Backend Engineer, then to Software Architect & Full-Stack Engineer — five years, two promotions. Built IDitracker for IDitech Mexico: inventory and stock management for 220+ employees and 200+ clients, with tenant isolation, RBAC, real-time updates, and full audit logging. In December 2023, took ownership and became CTO. The stack runs deep: React, Next.js, TypeScript, NestJS, Node.js, Python, PostgreSQL, MongoDB, Redis, Docker, CI/CD.",
    callout: { label: "gridcore.co", text: "Hybrid engineering consultancy, Islamabad. Client forward deployment, architecture, and production ownership across web, mobile, and AI systems." },
    align: "left",
  },
  {
    id: "swarm",
    index: "03",
    kicker: "2023 — Present · Multi-Agent Systems",
    title: "The swarm awakens",
    body: "AI stopped being a side interest and became core to the work. Real RAG pipelines, vector databases — Pinecone, Chroma, sqlite-vec — multi-agent systems that actually hand off tasks to each other. OpenClaw: an eight-agent hierarchical orchestration platform. Tommy at the top as CEO orchestrator. John, Dave, Tao, Sol, Jim, Tana, Zia underneath. Runs on Julie, a personal VPS over Tailscale, with SQLite and sqlite-vec for memory. Wired to Telegram, X/Twitter, a Canvas Host, agent-to-agent communication. The swarm you're watching is not a metaphor.",
    callout: {
      label: "OpenClaw",
      text: "Eight-agent hierarchical orchestration platform. Tommy as CEO orchestrator + 7 sub-agents, SQLite + sqlite-vec memory, Telegram control, running on VPS (Julie) over Tailscale. This is the system the swarm you are watching represents.",
    },
    align: "left",
  },
];

export const RIDER = {
  index: "06",
  kicker: "The human",
  title: "The rider",
  body: [
    "Based in Islamabad, Pakistan. Computer Science at Air University, 2024. Solo touring has stretched across the whole country: the northern areas, KPK, Sindh, Punjab. Balochistan is the next horizon. The Karakoram isn't a one-time trip — it's a road he keeps returning to.",
    "The same pattern that runs through the riding runs through the work: solo, self-directed, comfortable being the only one responsible for getting through the terrain. Reads Urdu literature; built an audiobook pipeline for his own library using Tesseract OCR and Facebook MMS-TTS. The mountains are not a metaphor he reached for. They are where he actually goes.",
  ],
} as const;

export const EDUCATION = {
  degree: "Computer Science",
  school: "Air University, Islamabad",
  period: "2020 — 2024",
} as const;

export const IMPACT = [
  { value: "10K+", label: "users served" },
  { value: "99.9%", label: "uptime" },
  { value: "40%", label: "cost reduced" },
  { value: "10K+", label: "daily transactions" },
  { value: "20+", label: "LLM fine-tunes" },
  { value: "100+", label: "automations shipped" },
] as const;

export type SkillGroup = { group: string; items: { name: string; level: number }[] };

export const SKILLS: SkillGroup[] = [
  {
    group: "Full-Stack & APIs",
    items: [
      { name: "React · Next.js · TypeScript", level: 95 },
      { name: "Node.js · NestJS · FastAPI", level: 92 },
      { name: "PostgreSQL · MongoDB · Redis", level: 90 },
      { name: "REST APIs · Microservices", level: 92 },
      { name: "Docker · Kubernetes · Nginx", level: 86 },
    ],
  },
  {
    group: "Applied AI & Automation",
    items: [
      { name: "LLM Apps · RAG · Agent Orchestration", level: 93 },
      { name: "LangChain · LangGraph · MCP", level: 90 },
      { name: "n8n · Make · Zapier · Workflow Automation", level: 92 },
      { name: "Vector DBs · pgvector · Pinecone", level: 88 },
      { name: "Fine-tuning · Hugging Face · Unsloth", level: 85 },
    ],
  },
  {
    group: "Cloud, Security & QA",
    items: [
      { name: "AWS · GCP · GitHub Actions · CI/CD", level: 86 },
      { name: "VAPT · Secure Code Review (CEH-P)", level: 84 },
      { name: "Playwright · Selenium · Cypress", level: 87 },
      { name: "Python · Bash · PowerShell", level: 90 },
      { name: "OAuth2 · JWT · Audit Logging · RBAC", level: 88 },
    ],
  },
];

export const CERTIFICATIONS = [
  { name: "Certified Ethical Hacker — Practical (CEH-P)", issuer: "NUST-NCAI / NAVTTC" },
  { name: "Practical Ethical Hacking (PEH)", issuer: "TCM Security" },
  { name: "ISO/IEC 27001 Information Security Associate", issuer: "SkillFront" },
] as const;

// The agent hierarchy — Scene 4 swarm. Tommy leads.
// These are the real names from OpenClaw, Hassan's 8-agent orchestration platform.
export type Drone = {
  name: string;
  role: string;
  lead?: boolean;
};

export const DRONES: Drone[] = [
  { name: "Tommy", role: "CEO orchestrator", lead: true },
  { name: "John", role: "retrieval agent" },
  { name: "Dave", role: "code agent" },
  { name: "Tao", role: "data agent" },
  { name: "Sol", role: "search agent" },
  { name: "Jim", role: "file agent" },
  { name: "Tana", role: "comms agent" },
  { name: "Zia", role: "memory agent" },
];

// Scene 6 — velocity tarmac. The long straight stretch.
// Camps coming one after another, flashing by like highway markers.
export const VELOCITY_MARKERS = [
  {
    org: "NDT Legacy Group",
    role: "Senior AI Engineer · Aug 2025 – Apr 2026",
    detail: "Enterprise AI automation · 10K+ daily transactions · 40% cost reduction",
  },
  {
    org: "Schmoozzer, London",
    role: "Senior AI Engineer · Oct 2025 – Jan 2026",
    detail: "7–8 client projects simultaneously · LLM pipelines · NY County auditing system",
  },
  {
    org: "UNO OS, Las Vegas",
    role: "AI Architect · May 2026 – Present",
    detail: "7 engineers · 4 client engagements · AI-native Business Operating System",
  },
] as const;

export const VELOCITY_CLOSER = "Different machines. Same throttle.";

export type Project = {
  id: string;
  name: string;
  blurb: string;
  tags: string[];
  href?: string;
  featured?: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "wonderkit",
    name: "WonderKit",
    blurb:
      "Open-source, agent-native AI SaaS starter kit. Pre-structured application, integration, and platform foundations — ship an AI product in days, not months.",
    tags: ["TypeScript", "AI Agents", "MCP", "Next.js", "Open Source"],
    href: "https://github.com/zimkk/wonderkit",
    featured: true,
  },
  {
    id: "n8nhub",
    name: "n8nHub",
    blurb:
      "Workflow library and community forum hosting 2,400+ free n8n workflows. Discovery, reusable templates, a forum layer. Built because the itch to ship it wouldn't go away.",
    tags: ["n8n", "TypeScript", "Automation", "Next.js"],
    href: "https://n8nhub.hassannazir.dev",
  },
  {
    id: "vigil",
    name: "Vigil",
    blurb:
      "Open-source cybersecurity tool: Tauri/Rust backend, TypeScript/React frontend. Red team and blue team in one — vulnerability scanning, code analysis, AI orchestrator on top.",
    tags: ["Python", "Rust", "Security", "VAPT", "Open Source"],
    href: "https://github.com/zimkk/vigil",
  },
  {
    id: "mynecraft",
    name: "Mynecraft",
    blurb:
      "Minecraft-style 3D sandbox that runs entirely in the browser. Three.js + WebGL voxel engine with terrain generation, crafting, mobs, and a day/night cycle.",
    tags: ["TypeScript", "Three.js", "WebGL", "Open Source"],
    href: "https://github.com/zimkk/mynecraft",
  },
  {
    id: "lead-scraper",
    name: "Lead Scraper",
    blurb:
      "B2B lead discovery tool — scrapes, extracts, and structures qualified leads from Google Maps with filtering and export. Python and Playwright.",
    tags: ["Python", "Playwright", "Scraping", "Open Source"],
    href: "https://github.com/zimkk/Lead-Scraper-Google-Maps",
  },
  {
    id: "portfolio-webgl",
    name: "Ridgeline",
    blurb:
      "This portfolio — a scroll-driven ride up a computed Karakoram pass from deep night to golden sunrise. The code is open. Fork it, make it yours.",
    tags: ["Next.js", "Three.js", "WebGL", "Open Source"],
    href: "https://github.com/zimkk/portfolio-webGL",
  },
];

export const PROJECTS_TAGLINE = "70+ projects built. A few that live here.";

export const CONTACT = {
  headline: "Let's build something.",
  email: "hassannazir955@gmail.com",
  links: [
    { label: "github.com/zimkk", href: "https://github.com/zimkk" },
    { label: "linkedin.com/in/hassannazirrr", href: "https://linkedin.com/in/hassannazirrr" },
    { label: "gridcore.co", href: "https://gridcore.co" },
    { label: "n8nhub.hassannazir.dev", href: "https://n8nhub.hassannazir.dev" },
  ],
} as const;
