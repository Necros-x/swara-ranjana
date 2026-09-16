import type { Metadata } from "next";
import "./globals.css";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteUrl =
  configuredSiteUrl?.startsWith("http://") || configuredSiteUrl?.startsWith("https://")
    ? configuredSiteUrl
    : "https://swara-ranjana.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Swara Ranjana 2026 | Live Musical Experience",
    template: "%s | Swara Ranjana 2026",
  },
  description:
    "Swara Ranjana 2026: An evening where voices, melodies and memories become one.",
  openGraph: {
    type: "website",
    locale: "en_LK",
    siteName: "Swara Ranjana 2026",
    title: "Swara Ranjana 2026 | Live Musical Experience",
    description:
      "An evening where voices, melodies and memories become one.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Swara Ranjana 2026 — Live Musical Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Swara Ranjana 2026 | Live Musical Experience",
    description:
      "An evening where voices, melodies and memories become one.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Inter:wght@300;400;500;600;700&family=Manrope:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="overflow-x-hidden bg-[#FEFFFF] text-[#0E1721] antialiased selection:bg-[#2271B1] selection:text-white">
        {children}
        <div className="relative z-[70] border-t border-white/10 bg-[#0E1721] px-4 py-2.5 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-white/45">
          Designed & Developed by{" "}
          <a
            href="https://studio.necros.co"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-white/80 transition-colors hover:text-[#4BA8F5]"
          >
            NECROS Studio ↗
          </a>
        </div>
      </body>
    </html>
  );
}
