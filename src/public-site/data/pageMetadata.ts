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
    title: "Featured Artists",
    description:
      "Meet the featured musical artists and performers of Swara Ranjana 2026.",
  },
  vasr: {
    title: "VASR — Visual Artists Swara Ranjana",
    description:
      "Meet the developers, animation creators and visual artists shaping the visual language of Swara Ranjana 2026.",
  },
  programme: {
    title: "Programme",
    description:
      "Explore the evening programme and performance schedule for Swara Ranjana 2026.",
  },
  gallery: {
    title: "Gallery",
    description:
      "Explore the visual archive, rehearsal moments and performance imagery of Swara Ranjana.",
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
      "Contact the Swara Ranjana team for concert, ticketing and event inquiries.",
  },
};
