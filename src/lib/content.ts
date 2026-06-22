// ============================================================
// RIDGELINE — verbatim content (from the build prompt appendix)
// Single source of truth for the DOM overlay copy.
// ============================================================

export const IDENTITY = {
  name: "Hassan Nazir",
  role: "Multi-Agent AI Systems Engineer",
  location: "Islamabad, Pakistan",
  education: "BS Computer Science, 2024",
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
  index: string; // editorial chapter number
  kicker: string; // mono meta line / date range
  title: string;
  body: string;
  callout?: { label: string; text: string };
  align: "left" | "right" | "center";
};

// Ordered chapters mapped onto scroll scenes (Scenes 2–4, 7).
export const CHAPTERS: Chapter[] = [
  {
    id: "departure",
    index: "01",
    kicker: "2020 — 2023 · The Foundations",
    title: "Where the road starts",
    body: "Audio Transcriber, then QA Specialist. Where the discipline started: precision, listening, finding the fault before the user does.",
    align: "left",
  },
  {
    id: "build",
    index: "02",
    kicker: "Dec 2023 — Present · Founder & CTO, Gridcore",
    title: "The build",
    body: "Started his own software + AI engineering consultancy. Fully remote. Set company-wide backend standards and shipped products end to end — across TypeScript, React, NestJS, PostgreSQL, Docker, Nginx and GitHub Actions — architecting cloud infrastructure and deployment pipelines at 99.9% reliability.",
    callout: { label: "roadside marker", text: "gridcore.co" },
    align: "left",
  },
  {
    id: "swarm",
    index: "03",
    kicker: "Aug 2025 — Apr 2026 · Senior AI / AI Automation Engineer",
    title: "The swarm awakens",
    body: "Architected an enterprise AI automation platform — a production multi-agent hierarchy processing 10K+ daily transactions at 99.9% uptime, cutting operational cost 40% and lifting workflow efficiency 60%. LangChain, vector DBs, event-driven workflows, n8n orchestration.",
    callout: {
      label: "OpenClaw",
      text: "His proprietary 8-agent platform. Tommy as CEO orchestrator + 7 sub-agents, SQLite + sqlite-vec memory, Telegram control, running on a VPS (“Julie”) over Tailscale. This is the system the swarm you're looking at represents.",
    },
    align: "left",
  },
];

export const RIDER = {
  index: "06",
  kicker: "The human",
  title: "The rider",
  body: [
    "Based in Islamabad, Pakistan. Studied Computer Science at Air University, Islamabad. Builds autonomous agent systems by day; plans long touring routes through northern Pakistan and Azad Kashmir.",
    "Reads Urdu literature — has even built Urdu audiobook pipelines from his own library. The mountains aren't a metaphor he reached for. They're where he actually goes.",
  ],
} as const;

export const EDUCATION = {
  degree: "Computer Science",
  school: "Air University, Islamabad",
  period: "2020 — 2025",
} as const;

// Verifiable, client-agnostic impact across roles.
export const IMPACT = [
  { value: "10K+", label: "users served" },
  { value: "99.9%", label: "uptime" },
  { value: "40%", label: "cost reduced" },
  { value: "60%", label: "more efficient" },
  { value: "20+", label: "LLM fine-tunes" },
  { value: "100+", label: "automations shipped" },
] as const;

// Grouped technical skills with self-rated proficiency (0–100).
export type SkillGroup = { group: string; items: { name: string; level: number }[] };

export const SKILLS: SkillGroup[] = [
  {
    group: "Backend & APIs",
    items: [
      { name: "Python", level: 95 },
      { name: "REST API design & versioning", level: 92 },
      { name: "Microservices architecture", level: 90 },
      { name: "Event-driven systems", level: 88 },
      { name: "FastAPI / Node.js", level: 90 },
    ],
  },
  {
    group: "Data & AI / ML",
    items: [
      { name: "LangChain / RAG", level: 90 },
      { name: "OpenAI / Claude APIs", level: 88 },
      { name: "Hugging Face fine-tuning", level: 85 },
      { name: "PyTorch / TensorFlow", level: 82 },
      { name: "PostgreSQL · Redis · vector DBs", level: 88 },
    ],
  },
  {
    group: "Cloud, Security & Quality",
    items: [
      { name: "Docker / Kubernetes", level: 86 },
      { name: "AWS / GCP", level: 85 },
      { name: "CI/CD — GitHub Actions / Jenkins", level: 84 },
      { name: "OAuth2 / JWT · audit logging", level: 88 },
      { name: "Selenium / Playwright", level: 85 },
    ],
  },
];

export const CERTIFICATIONS = [
  { name: "Certified Ethical Hacker — Practical (CEH-P)", issuer: "NUST-NCAI / NAVTTC" },
  { name: "Practical Ethical Hacking (PEH)", issuer: "TCM Security" },
  { name: "ISO/IEC 27001 Information Security Associate", issuer: "SkillFront" },
] as const;

// The agent hierarchy — Scene 4 swarm. Tommy leads.
export type Drone = {
  name: string;
  role: string;
  lead?: boolean;
};

export const DRONES: Drone[] = [
  { name: "Tommy", role: "CEO orchestrator", lead: true },
  { name: "John", role: "sub-agent" },
  { name: "Dave", role: "sub-agent" },
  { name: "Tao", role: "sub-agent" },
  { name: "Sol", role: "sub-agent" },
  { name: "Jim", role: "sub-agent" },
  { name: "Tana", role: "sub-agent" },
  { name: "Zia", role: "sub-agent" },
];

// Scene 5 — velocity flash markers (momentum over detail).
export const VELOCITY_MARKERS = [
  {
    org: "QA Automation",
    role: "Lead, contract",
    detail: "8-person team · 200+ edge cases caught · 50% faster testing",
  },
  {
    org: "Senior AI Engineer",
    role: "contract",
    detail: "agentic workflows · LLM apps · n8n orchestration",
  },
  {
    org: "AI Architect",
    role: "Apr 2026 — present",
    detail: "AI system architecture · LLM & agent platforms",
  },
] as const;

export const VELOCITY_CLOSER = "Different machines. Same throttle.";

// Scene 6 — summit project constellation.
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
    id: "minecraft",
    name: "Browser Minecraft Clone",
    blurb:
      "A voxel world in the browser — proof he builds the kind of WebGL this very site runs on. MIT open source.",
    tags: ["TypeScript", "Three.js", "Vite", "MIT"],
    href: "https://github.com/zimkk",
    featured: true,
  },
  {
    id: "n8nhub",
    name: "N8NHUB",
    blurb:
      "A curated library of 2,000+ n8n workflow templates for automation builders.",
    tags: ["n8n", "Automation", "Library"],
    href: "https://n8nhub.hassannazir.dev",
  },
  {
    id: "speedyinfluencer",
    name: "SpeedyInfluencer",
    blurb: "Influencer-marketing SaaS connecting brands with creators.",
    tags: ["SaaS", "Marketing", "Full-Stack"],
    href: "https://speedyinfluencer.com",
  },
  {
    id: "fooocus",
    name: "Fooocus",
    blurb:
      "SDXL image-generation tooling — prompt craft and generative pipelines. Open source.",
    tags: ["GenAI", "SDXL", "Python"],
    href: "https://github.com/zimkk/Fooocus",
  },
  {
    id: "legal-summarizer",
    name: "Legal Doc Summarizer",
    blurb:
      "Long-form legal-document summarization with fine-tuned LLMs. Open source.",
    tags: ["LLM", "Fine-tuning", "RAG"],
    href: "https://github.com/zimkk/legal-Document-Summerizer",
  },
  {
    id: "anomaly",
    name: "Anomaly Detection System",
    blurb: "Network anomaly detection built with data science and ML. Open source.",
    tags: ["Data Science", "ML", "Python"],
    href: "https://github.com/zimkk/Anomaly-Detection-System",
  },
  {
    id: "genai",
    name: "GenAI",
    blurb: "A collection of generative-AI prototypes and implementations. Open source.",
    tags: ["GenAI", "Prototypes", "Python"],
    href: "https://github.com/zimkk/genAi",
  },
];

export const PROJECTS_TAGLINE = "70+ repositories. A few that mattered most.";

export const CONTACT = {
  headline: "Let's build something.",
  email: "hassannazir955@gmail.com",
  links: [
    { label: "github.com/zimkk", href: "https://github.com/zimkk" },
    { label: "linkedin.com/in/hassannazirrr", href: "https://linkedin.com/in/hassannazirrr" },
    { label: "gridcore.co", href: "https://gridcore.co" },
    { label: "hassannazir.dev", href: "https://hassannazir.dev" },
  ],
} as const;
