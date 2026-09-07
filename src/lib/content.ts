// ============================================================
// RIDGELINE — single source of truth for all DOM overlay copy.
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
  tagline: "Forward Deployed Engineer. Applied AI. Mountain roads.",
  chips: ["Forward Deployment", "Applied AI", "Full-Stack", "Islamabad, PK"],
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
    body: "QA Executive at Touchstone Communications — functional, regression, UAT and compliance testing across 14+ teams and 500+ employees. The discipline starts here: precision, pattern recognition, finding the fault before the user does. Freelance work running in parallel since 2019.",
    align: "left",
  },
  {
    id: "build",
    index: "02",
    kicker: "Aug 2021 — Present · GridCore, Islamabad",
    title: "The build",
    body: "Joined GridCore as an Associate SWE. Promoted twice over five years into Software Architect & Full-Stack Engineer — owning technical direction across multiple engineering teams. Architected IDitracker for IDitech Mexico: inventory and stock-management for 220+ employees and 200+ clients. React, Next.js, TypeScript, NestJS, Node.js, PostgreSQL, MongoDB, Redis, Docker, CI/CD. 99.9% production reliability.",
    callout: { label: "gridcore.co", text: "Hybrid engineering consultancy, Islamabad. Client forward deployment, architecture, and delivery." },
    align: "left",
  },
  {
    id: "swarm",
    index: "03",
    kicker: "Aug 2025 — Present · AI Architecture Contracts",
    title: "The swarm awakens",
    body: "NDT Legacy Group — engineered enterprise AI automation platform processing 10K+ daily transactions, 40% cost reduction. Schmoozzer, London — 7-8 concurrent client projects, LLM pipelines, n8n orchestration, NY County auditing system. UNO OS, Las Vegas — AI Architect, leading 7 engineers across 4 client engagements, architecting an AI-native Business Operating System.",
    callout: {
      label: "OpenClaw",
      text: "Proprietary 8-agent orchestration platform. Tommy as CEO orchestrator + 7 sub-agents, SQLite + sqlite-vec memory, Telegram control, running on a VPS over Tailscale. The swarm you are watching.",
    },
    align: "left",
  },
];

export const RIDER = {
  index: "06",
  kicker: "The human",
  title: "The rider",
  body: [
    "Based in Islamabad, Pakistan. BS Computer Science at Air University, 2024. Certified Ethical Hacker (CEH-P, NUST-NCAI / NAVTTC). Five years at GridCore, promoted twice. Now also AI Architect at UNO OS, Las Vegas — remote.",
    "Builds autonomous agent systems and ships production AI. Plans long touring routes through northern Pakistan and Azad Kashmir. Reads Urdu literature and has built Urdu audiobook pipelines from his own library. The mountains aren't a metaphor he reached for. They're where he actually goes.",
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

export const VELOCITY_MARKERS = [
  {
    org: "Brilliant Gaming LLC",
    role: "Lead QA Engineer · Feb 2025 – Sep 2025",
    detail: "8-person QA team · EPWIN casino platform · payment-critical flows · E2E + API automation",
  },
  {
    org: "Schmoozzer",
    role: "Senior AI Engineer · Oct 2025 – Jan 2026",
    detail: "7-8 client projects · LLM pipelines · n8n orchestration · NY County auditing system",
  },
  {
    org: "UNO OS",
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
      "Open-source agent-native AI SaaS starter kit. Pre-structured application, integration, and platform foundations — ship production AI agent apps in days, not months.",
    tags: ["TypeScript", "AI Agents", "MCP", "Next.js", "Open Source"],
    href: "https://github.com/zimkk/wonderkit",
    featured: true,
  },
  {
    id: "n8nhub",
    name: "n8nHub",
    blurb:
      "Platform hosting 2.4K+ free n8n automation workflows with workflow discovery, reusable templates, and an embedded community forum layer.",
    tags: ["n8n", "TypeScript", "Automation", "Next.js"],
    href: "https://n8nhub.hassannazir.dev",
  },
  {
    id: "vigil",
    name: "Vigil",
    blurb:
      "Security research and VAPT tool for vulnerability scanning, code analysis, and application-level security review across web and software systems.",
    tags: ["Python", "Security", "VAPT", "Open Source"],
    href: "https://github.com/zimkk/vigil",
  },
  {
    id: "mynecraft",
    name: "Mynecraft",
    blurb:
      "Minecraft-style 3D sandbox running entirely in the browser — Three.js + WebGL voxel engine with terrain generation, crafting, mobs, and day/night cycle.",
    tags: ["TypeScript", "Three.js", "WebGL", "Open Source"],
    href: "https://github.com/zimkk/mynecraft",
  },
  {
    id: "lead-scraper",
    name: "Lead Scraper",
    blurb:
      "Interactive B2B lead discovery tool — scrapes, extracts, and structures qualified leads from Google Maps with filtering and export.",
    tags: ["Python", "Scraping", "Lead Gen", "Open Source"],
    href: "https://github.com/zimkk/Lead-Scraper-Google-Maps",
  },
  {
    id: "portfolio-webgl",
    name: "Ridgeline",
    blurb:
      "This portfolio — a scroll-driven 3D ride up a computed Karakoram mountain pass from deep night to golden sunrise. Next.js, React Three Fiber, multi-agent AI swarm.",
    tags: ["Next.js", "Three.js", "WebGL", "Open Source"],
    href: "https://github.com/zimkk/portfolio-webGL",
  },
];

export const PROJECTS_TAGLINE = "31 public repositories. A few that mattered most.";

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
