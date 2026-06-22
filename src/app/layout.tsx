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

const SITE = "https://hassannazir.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Hassan Nazir — Multi-Agent AI Systems Engineer",
  description:
    "Hassan Nazir builds autonomous multi-agent AI systems and full-stack products. Founder & CTO of Gridcore. Based in Islamabad, Pakistan.",
  keywords: [
    "Hassan Nazir",
    "Multi-Agent AI",
    "AI Systems Engineer",
    "Full-Stack Developer",
    "Automation Engineer",
    "Gridcore",
    "OpenClaw",
    "Islamabad",
  ],
  authors: [{ name: "Hassan Nazir", url: SITE }],
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    url: SITE,
    title: "Hassan Nazir — Multi-Agent AI Systems Engineer",
    description:
      "A scroll-driven ride up a computed Karakoram pass — the career of an engineer who builds multi-agent AI and rides mountain roads.",
    siteName: "Hassan Nazir",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hassan Nazir — Multi-Agent AI Systems Engineer",
    description:
      "Builds autonomous multi-agent AI systems and full-stack products. Founder & CTO of Gridcore.",
  },
  robots: { index: true, follow: true },
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
  jobTitle: "Multi-Agent AI Systems Engineer",
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
