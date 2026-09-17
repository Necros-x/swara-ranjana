export type PublicPageMetadataKey =
  | "home"
  | "about"
  | "artists"
  | "vasr"
  | "programme"
  | "gallery"
  | "tickets"
  | "venue"
  | "contact";

type PublicPageMetadata = {
  title: string;
  description: string;
  absoluteTitle?: boolean;
};

/**
 * Public browser-tab / SEO titles live here.
 *
 * For normal pages, Next.js appends the root template from src/app/layout.tsx:
 *   "%s | Swara Ranjana 2026"
 *
 * Home uses an absolute title so it does not repeat the brand name.
 */
export const PUBLIC_PAGE_METADATA: Record<
  PublicPageMetadataKey,
  PublicPageMetadata
> = {
  home: {
    title: "Swara Ranjana 2026 | Live Musical Experience",
    description:
      "Swara Ranjana 2026: An evening where voices, melodies and memories become one.",
    absoluteTitle: true,
  },
  about: {
    title: "About",
    description:
      "Discover the story, vision and identity behind Swara Ranjana 2026 in Kandy.",
  },
  artists: {
    title: "Artist Line-up",
    description:
      "Official Swara Ranjana 2026 artist announcements will be published here once confirmed.",
  },
  vasr: {
    title: "VASR | Visual Artists Swara Ranjana",
    description:
      "Meet the developers, animation creators and visual artists shaping the visual language of Swara Ranjana 2026.",
  },
  programme: {
    title: "Programme",
    description:
      "The official Swara Ranjana 2026 running order will be published here once the programme is confirmed.",
  },
  gallery: {
    title: "Gallery",
    description:
      "Official Swara Ranjana photography and archive material will be published here once approved.",
  },
  tickets: {
    title: "Tickets",
    description:
      "View ticket categories, auditorium seating and reserve tickets for Swara Ranjana 2026.",
  },
  venue: {
    title: "Venue & Access",
    description:
      "Venue and access information for Swara Ranjana 2026 at Mahinda Rajapaksha Auditorium, Polgolla, Kandy.",
  },
  contact: {
    title: "Contact",
    description:
      "View current Swara Ranjana 2026 inquiry and event contact information.",
  },
};
