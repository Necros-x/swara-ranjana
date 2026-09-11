import type { ReservedSeatSummary, SeatSelectionMode } from "@/lib/seating/types";

export interface CheckoutReservationInput {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  requestId: string;
  selectionMode?: SeatSelectionMode;
  selectedSeatIds?: string[];
}

export interface CheckoutReservationSuccess {
  ok: true;
  reused: boolean;
  orderId: string;
  orderNumber: string;
  accessToken: string;
  subtotalLkr: number;
  totalLkr: number;
  currency: string;
  expiresAt: string;
  ticketTypeId?: string;
  ticketTypeName?: string;
  quantity?: number;
  remainingAfterHold?: number;
  selectionMode?: SeatSelectionMode;
  seatSelectionFeeLkr?: number;
  selectedSeats?: ReservedSeatSummary[];
}

export interface CheckoutReservationFailure {
  ok: false;
  code: string;
  message: string;
  remaining?: number;
}

export type CheckoutReservationResult =
  | CheckoutReservationSuccess
  | CheckoutReservationFailure;
