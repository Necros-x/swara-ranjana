import type { TicketTier } from "@/public-site/types";

export interface LiveConcertMeta {
  id: string;
  slug: string;
  name: string;
  date: string;
  doorsOpen: string;
  time: string;
  venue: string;
  hall: string;
  city: string;
  currency: string;
}

export interface PublicTicketCatalog {
  concertMeta: LiveConcertMeta;
  ticketTiers: TicketTier[];
}
