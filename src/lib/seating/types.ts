export type SeatAvailability = "AVAILABLE" | "HELD" | "SOLD";
export type SeatSelectionMode = "RANDOM" | "MANUAL";

export interface PublicSeat {
  id: string;
  rowNumber: number;
  seatNumber: number;
  label: string;
  manualFeeLkr: number;
  status: SeatAvailability;
}

export interface PublicSeatBlock {
  id: string;
  code: string;
  level: "ODC" | "BALCONY";
  name: string;
  ticketTypeId: string;
  manualFeeLkr: number;
  seats: PublicSeat[];
}

export interface PublicSeatMap {
  eventId: string;
  capacity: number;
  blocks: PublicSeatBlock[];
}

export interface ReservedSeatSummary {
  id: string;
  label: string;
  manualFeeLkr: number;
}
