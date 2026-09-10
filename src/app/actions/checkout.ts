"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CheckoutReservationInput,
  CheckoutReservationResult,
  CheckoutReservationSuccess,
} from "@/lib/checkout/types";
import type { Json } from "@/types/database";

function isRecord(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  value: { [key: string]: Json | undefined },
  key: string,
): string | undefined {
  const candidate = value[key];
  return typeof candidate === "string" ? candidate : undefined;
}

function readNumber(
  value: { [key: string]: Json | undefined },
  key: string,
): number | undefined {
  const candidate = value[key];
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : undefined;
}

function readBoolean(
  value: { [key: string]: Json | undefined },
  key: string,
): boolean | undefined {
  const candidate = value[key];
  return typeof candidate === "boolean" ? candidate : undefined;
}

function failure(code: string, message: string, remaining?: number): CheckoutReservationResult {
  return {
    ok: false,
    code,
    message,
    ...(typeof remaining === "number" ? { remaining } : {}),
  };
}

export async function createCheckoutReservation(
  input: CheckoutReservationInput,
): Promise<CheckoutReservationResult> {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();
  const notes = input.notes?.trim() || null;
  const quantity = Number.isFinite(input.quantity)
    ? Math.trunc(input.quantity)
    : 0;

  if (!input.eventId || !input.ticketTypeId || !input.requestId) {
    return failure("INVALID_REQUEST", "The reservation request is incomplete.");
  }

  if (quantity < 1 || quantity > 20) {
    return failure("INVALID_QUANTITY", "Choose a valid ticket quantity.");
  }

  if (fullName.length < 2 || fullName.length > 120) {
    return failure("INVALID_NAME", "Enter the customer name.");
  }

  if (
    email.length < 5 ||
    email.length > 254 ||
    !email.includes("@")
  ) {
    return failure("INVALID_EMAIL", "Enter a valid email address.");
  }

  if (phone.length < 7 || phone.length > 40) {
    return failure("INVALID_PHONE", "Enter a valid phone number.");
  }

  if (notes && notes.length > 500) {
    return failure(
      "NOTES_TOO_LONG",
      "Special requests must be 500 characters or fewer.",
    );
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("create_checkout_reservation", {
      p_event_id: input.eventId,
      p_ticket_type_id: input.ticketTypeId,
      p_quantity: quantity,
      p_full_name: fullName,
      p_email: email,
      p_phone: phone,
      p_notes: notes,
      p_request_id: input.requestId,
    });

    if (error) {
      console.error("create_checkout_reservation RPC failed:", error);
      return failure(
        "CHECKOUT_FAILED",
        "We couldn't reserve those seats right now. Please try again.",
      );
    }

    if (!isRecord(data)) {
      console.error("Unexpected checkout response:", data);
      return failure(
        "INVALID_RESPONSE",
        "The reservation service returned an unexpected response.",
      );
    }

    if (data.ok !== true) {
      return failure(
        readString(data, "code") ?? "RESERVATION_REJECTED",
        readString(data, "message") ??
          "Those seats could not be reserved.",
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

    if (
      !orderId ||
      !orderNumber ||
      !accessToken ||
      subtotalLkr === undefined ||
      totalLkr === undefined ||
      !currency ||
      !expiresAt
    ) {
      console.error("Incomplete checkout response:", data);
      return failure(
        "INVALID_RESPONSE",
        "The reservation was created, but its confirmation data was incomplete. Please contact support with your email address before retrying.",
      );
    }

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
    };

    return success;
  } catch (error) {
    console.error("Checkout reservation action failed:", error);
    return failure(
      "CHECKOUT_UNAVAILABLE",
      "The reservation service is temporarily unavailable. Please try again.",
    );
  }
}
