"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendReservationCreatedEmail } from "@/lib/email/orderEmails";
import type {
  CheckoutReservationInput,
  CheckoutReservationResult,
  CheckoutReservationSuccess,
} from "@/lib/checkout/types";
import type {
  PublicSeat,
  PublicSeatBlock,
  PublicSeatMap,
  ReservedSeatSummary,
  SeatSelectionMode,
} from "@/lib/seating/types";
import type { Json } from "@/types/database";

function isRecord(value: Json | unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: Record<string, unknown>, key: string) {
  const candidate = value[key];
  return typeof candidate === "string" ? candidate : undefined;
}

function readNumber(value: Record<string, unknown>, key: string) {
  const candidate = value[key];
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : undefined;
}

function readBoolean(value: Record<string, unknown>, key: string) {
  const candidate = value[key];
  return typeof candidate === "boolean" ? candidate : undefined;
}

function failure(
  code: string,
  message: string,
  remaining?: number,
): CheckoutReservationResult {
  return {
    ok: false,
    code,
    message,
    ...(typeof remaining === "number" ? { remaining } : {}),
  };
}

function parseSeatMap(value: unknown): PublicSeatMap | null {
  if (!isRecord(value)) return null;
  const eventId = readString(value, "eventId");
  const capacity = readNumber(value, "capacity");
  const rawBlocks = value.blocks;
  if (!eventId || capacity === undefined || !Array.isArray(rawBlocks)) return null;

  const blocks: PublicSeatBlock[] = rawBlocks.flatMap((rawBlock) => {
    if (!isRecord(rawBlock)) return [];
    const id = readString(rawBlock, "id");
    const code = readString(rawBlock, "code");
    const level = readString(rawBlock, "level");
    const name = readString(rawBlock, "name");
    const ticketTypeId = readString(rawBlock, "ticketTypeId");
    const manualFeeLkr = readNumber(rawBlock, "manualFeeLkr") ?? 0;
    if (!id || !code || !name || !ticketTypeId || (level !== "ODC" && level !== "BALCONY")) {
      return [];
    }

    const seats: PublicSeat[] = Array.isArray(rawBlock.seats)
      ? rawBlock.seats.flatMap((rawSeat) => {
          if (!isRecord(rawSeat)) return [];
          const seatId = readString(rawSeat, "id");
          const label = readString(rawSeat, "label");
          const rowNumber = readNumber(rawSeat, "rowNumber");
          const seatNumber = readNumber(rawSeat, "seatNumber");
          const fee = readNumber(rawSeat, "manualFeeLkr") ?? 0;
          const status = readString(rawSeat, "status");
          if (
            !seatId ||
            !label ||
            rowNumber === undefined ||
            seatNumber === undefined ||
            (status !== "AVAILABLE" && status !== "HELD" && status !== "SOLD")
          ) {
            return [];
          }
          return [{ id: seatId, label, rowNumber, seatNumber, manualFeeLkr: fee, status }];
        })
      : [];

    return [{ id, code, level, name, ticketTypeId, manualFeeLkr, seats }];
  });

  return { eventId, capacity, blocks };
}

function parseReservedSeats(value: unknown): ReservedSeatSummary[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((rawSeat) => {
    if (!isRecord(rawSeat)) return [];
    const id = readString(rawSeat, "id");
    const label = readString(rawSeat, "label");
    const manualFeeLkr = readNumber(rawSeat, "manualFeeLkr") ?? 0;
    return id && label ? [{ id, label, manualFeeLkr }] : [];
  });
}

export async function getCheckoutSeatMap(
  eventId: string,
  ticketTypeId?: string,
): Promise<PublicSeatMap | null> {
  if (!eventId) return null;
  try {
    const supabase = createAdminClient() as any;
    const { data, error } = await supabase.rpc("get_public_seat_map", {
      p_event_id: eventId,
      p_ticket_type_id: ticketTypeId || null,
    });
    if (error) {
      console.error("get_public_seat_map RPC failed:", error);
      return null;
    }
    return parseSeatMap(data);
  } catch (error) {
    console.error("Seat map lookup failed:", error);
    return null;
  }
}

export async function createCheckoutReservation(
  input: CheckoutReservationInput,
): Promise<CheckoutReservationResult> {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const notes = input.notes?.trim() || null;
  const quantity = Number.isFinite(input.quantity) ? Math.trunc(input.quantity) : 0;
  const selectionMode: SeatSelectionMode = input.selectionMode === "MANUAL" ? "MANUAL" : "RANDOM";
  const selectedSeatIds = selectionMode === "MANUAL" ? input.selectedSeatIds ?? [] : [];

  if (!input.eventId || !input.ticketTypeId || !input.requestId) {
    return failure("INVALID_REQUEST", "The reservation request is incomplete.");
  }
  if (quantity < 1 || quantity > 20) return failure("INVALID_QUANTITY", "Choose a valid ticket quantity.");
  if (selectionMode === "MANUAL" && selectedSeatIds.length !== quantity) {
    return failure("SEAT_COUNT_MISMATCH", "Select exactly the requested number of seats.");
  }
  if (fullName.length < 2 || fullName.length > 120) return failure("INVALID_NAME", "Enter the customer name.");
  if (email.length < 5 || email.length > 254 || !email.includes("@")) return failure("INVALID_EMAIL", "Enter a valid email address.");
  if (phone.length < 7 || phone.length > 40) return failure("INVALID_PHONE", "Enter a valid phone number.");
  if (notes && notes.length > 500) return failure("NOTES_TOO_LONG", "Special requests must be 500 characters or fewer.");

  try {
    const supabase = createAdminClient() as any;
    const { data, error } = await supabase.rpc("create_checkout_reservation_with_seats", {
      p_event_id: input.eventId,
      p_ticket_type_id: input.ticketTypeId,
      p_quantity: quantity,
      p_full_name: fullName,
      p_email: email,
      p_phone: phone,
      p_notes: notes,
      p_request_id: input.requestId,
      p_selection_mode: selectionMode,
      p_selected_seat_ids: selectionMode === "MANUAL" ? selectedSeatIds : null,
    });

    if (error) {
      console.error("create_checkout_reservation_with_seats RPC failed:", error);
      return failure("CHECKOUT_FAILED", "We couldn't reserve those seats right now. Please try again.");
    }
    if (!isRecord(data)) return failure("INVALID_RESPONSE", "The reservation service returned an unexpected response.");
    if (data.ok !== true) {
      return failure(
        readString(data, "code") ?? "RESERVATION_REJECTED",
        readString(data, "message") ?? "Those seats could not be reserved.",
        readNumber(data, "remaining"),
      );
    }

    const orderId = readString(data, "order_id");
    const orderNumber = readString(data, "order_number");
    const accessToken = readString(data, "access_token");
    const subtotalLkr = readNumber(data, "subtotal_lkr");
    const totalLkr = readNumber(data, "total_lkr");
    const currency = readString(data, "currency");
    const expiresAt = readString(data, "expires_at");
    if (!orderId || !orderNumber || !accessToken || subtotalLkr === undefined || totalLkr === undefined || !currency || !expiresAt) {
      return failure("INVALID_RESPONSE", "The reservation was created, but its confirmation data was incomplete. Please contact support with your email address before retrying.");
    }

    const responseMode = readString(data, "selection_mode");
    const success: CheckoutReservationSuccess = {
      ok: true,
      reused: readBoolean(data, "reused") ?? false,
      orderId,
      orderNumber,
      accessToken,
      subtotalLkr,
      totalLkr,
      currency,
      expiresAt,
      ticketTypeId: readString(data, "ticket_type_id"),
      ticketTypeName: readString(data, "ticket_type_name"),
      quantity: readNumber(data, "quantity"),
      remainingAfterHold: readNumber(data, "remaining_after_hold"),
      selectionMode: responseMode === "MANUAL" ? "MANUAL" : "RANDOM",
      seatSelectionFeeLkr: readNumber(data, "seat_selection_fee_lkr") ?? 0,
      selectedSeats: parseReservedSeats(data.selected_seats),
    };

    await sendReservationCreatedEmail(orderId).catch((emailError) => {
      console.error("Reservation email failed:", emailError);
    });

    return success;
  } catch (error) {
    console.error("Checkout reservation action failed:", error);
    return failure("CHECKOUT_UNAVAILABLE", "The reservation service is temporarily unavailable. Please try again.");
  }
}
