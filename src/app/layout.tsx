import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hassannazir.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Hassan Nazir — Forward Deployed Engineer",
  description:
    "Hassan Nazir is a Forward Deployed Engineer and Applied AI specialist based in Islamabad, Pakistan. Software Architect at GridCore, AI Architect at UNO OS. Ships LLM systems, RAG pipelines, agent orchestration, and full-stack products.",
  keywords: [
    "Hassan Nazir",
    "Forward Deployed Engineer",
    "Applied AI",
    "AI Architect",
    "Software Architect",
    "Full-Stack Engineer",
    "Agent Orchestration",
    "RAG",
    "LangChain",
    "n8n Automation",
    "GridCore",
    "Islamabad",
  ],
  authors: [{ name: "Hassan Nazir", url: SITE }],
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    url: SITE,
    title: "Hassan Nazir — Forward Deployed Engineer",
    description:
      "A scroll-driven ride up a computed Karakoram pass — the career of a Forward Deployed Engineer who ships AI systems and rides mountain roads.",
    siteName: "Hassan Nazir",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hassan Nazir — Forward Deployed Engineer",
    description:
      "Forward Deployed Engineer & Applied AI specialist. Software Architect at GridCore, AI Architect at UNO OS. Islamabad, Pakistan.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hassan Nazir",
  jobTitle: "Forward Deployed Engineer",
  url: SITE,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Islamabad",
    addressCountry: "PK",
  },
  email: "hassannazir955@gmail.com",
  sameAs: [
    "https://github.com/zimkk",
    "https://linkedin.com/in/hassannazirrr",
    "https://gridcore.co",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
