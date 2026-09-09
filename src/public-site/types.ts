export type PageId =
  | 'home'
  | 'about'
  | 'artists'
  | 'programme'
  | 'gallery'
  | 'tickets'
  | 'venue'
  | 'contact';

export interface Artist {
  id: string;
  number: string;
  name: string;
  role: string;
  category: 'Vocals' | 'Strings & Sitar' | 'Percussion & Tabla' | 'Contemporary Fusion' | 'Keyboards & Flute';
  bio: string;
  shortDescription: string;
  image: string;
  portraitLarge?: string;
  socials?: {
    instagram?: string;
    spotify?: string;
    youtube?: string;
  };
  featuredHighlights?: string[];
  repertoirePreview?: string;
}

export interface ProgrammeAct {
  id: string;
  time: string;
  duration: string;
  title: string;
  subtitle?: string;
  performer: string;
  description: string;
  isIntermission?: boolean;
  categoryTag?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  year: '2026' | '2025' | '2024' | 'BEHIND THE SCENES';
  category: 'Live Concert' | 'Rehearsal' | 'Stage & Light' | 'Atmosphere' | 'Artists';
  image: string;
  aspectRatio: 'portrait' | 'landscape' | 'square' | 'tall';
  caption: string;
  photographer?: string;
}

export interface TicketTier {
  id: string;
  tierName: string;
  subtitle: string;
  priceLKR: number;
  formattedPrice: string;
  availability: 'Available' | 'Selling Fast' | 'Limited Seats' | 'Sold Out';
  seatingZone: string;
  benefits: string[];
  recommended?: boolean;
  colorAccent?: string;
}

export interface PreviousEdition {
  year: string;
  theme: string;
  venue: string;
  attendees: string;
  description: string;
  image: string;
  quote?: string;
}
