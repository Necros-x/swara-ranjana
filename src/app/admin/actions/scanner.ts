"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/auth/requireStaff";
import type { Json, StaffRole } from "@/types/database";

const SCAN_ROLES: StaffRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "BOX_OFFICE",
  "SCANNER",
];

const PAYMENT_ROLES: StaffRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "BOX_OFFICE",
];

export type ScannerResultCode =
  | "ADMITTED"
  | "PAYMENT_DUE"
  | "DUPLICATE"
  | "INVALID"
  | "REVOKED"
  | "REFUNDED"
  | "WRONG_EVENT"
  | "ERROR";

export interface ScannerActionResult {
  ok: boolean;
  result: ScannerResultCode;
  message: string;
  ticketId?: string;
  ticketNumber?: string;
  customerName?: string;
  ticketType?: string;
  firstUsedAt?: string | null;
  checkedInAt?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  amountDue?: number | null;
  currency?: string | null;
}

export interface ScannerActionInput {
  identifier: string;
  eventId: string;
  gate?: string;
  device?: Json;
}

type JsonRecord = Record<string, Json | undefined>;

function isRecord(value: Json | undefined): value is JsonRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function stringValue(record: JsonRecord, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function numberValue(record: JsonRecord, key: string) {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function parseResult(data: Json | null): ScannerActionResult {
  if (!isRecord(data)) {
    return {
      ok: false,
      result: "ERROR",
      message: "The scanner received an invalid server response.",
    };
  }

  const rawResult = stringValue(data, "result");
  const allowed: ScannerResultCode[] = [
    "ADMITTED",
    "PAYMENT_DUE",
    "DUPLICATE",
    "INVALID",
    "REVOKED",
    "REFUNDED",
    "WRONG_EVENT",
  ];
  const result = allowed.includes(rawResult as ScannerResultCode)
    ? (rawResult as ScannerResultCode)
    : "ERROR";

  return {
    ok: data.ok === true,
    result,
    message:
      stringValue(data, "message") ??
      (result === "ADMITTED" ? "Ticket admitted." : "Ticket could not be admitted."),
    ticketId: stringValue(data, "ticketId"),
    ticketNumber: stringValue(data, "ticketNumber"),
    customerName: stringValue(data, "customerName"),
    ticketType: stringValue(data, "ticketType"),
    firstUsedAt: stringValue(data, "firstUsedAt") ?? null,
    checkedInAt: stringValue(data, "checkedInAt") ?? null,
    paymentMethod: stringValue(data, "paymentMethod") ?? null,
    paymentStatus: stringValue(data, "paymentStatus") ?? null,
    amountDue: numberValue(data, "amountDue") ?? null,
    currency: stringValue(data, "currency") ?? null,
  };
}

async function resolveIdentifier(identifier: string) {
  const clean = identifier.trim();
  if (!clean) return "";

  if (/^SR\d{2}-T\d{7}$/i.test(clean)) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("tickets")
      .select("qr_token")
      .ilike("ticket_number", clean)
      .maybeSingle();

    if (data?.qr_token) return data.qr_token;
  }

  return clean;
}

export async function redeemScannedTicket(
  input: ScannerActionInput,
): Promise<ScannerActionResult> {
  const { supabase } = await requireStaff(SCAN_ROLES);
  const token = await resolveIdentifier(input.identifier);

  if (!token || !input.eventId) {
    return {
      ok: false,
      result: "INVALID",
      message: "Enter or scan a valid ticket.",
    };
  }

  const { data, error } = await supabase.rpc("redeem_ticket", {
    p_token: token,
    p_event_id: input.eventId,
    p_gate: input.gate?.trim() || null,
    p_device: input.device ?? {},
  });

  if (error) {
    console.error("Ticket redemption failed:", error);
    return {
      ok: false,
      result: "ERROR",
      message: "The ticket could not be validated. Check the connection and try again.",
    };
  }

  return parseResult(data);
}

export async function collectOnArrivalAndAdmit(
  input: ScannerActionInput,
): Promise<ScannerActionResult> {
  const { supabase } = await requireStaff(PAYMENT_ROLES);
  const token = await resolveIdentifier(input.identifier);

  if (!token || !input.eventId) {
    return {
      ok: false,
      result: "INVALID",
      message: "Enter or scan a valid ticket.",
    };
  }

  type RpcResponse = {
    data: Json | null;
    error: { message?: string } | null;
  };

  const untypedRpc = supabase.rpc as unknown as (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<RpcResponse>;

  const { data, error } = await untypedRpc(
    "collect_on_arrival_and_redeem",
    {
      p_token: token,
      p_event_id: input.eventId,
      p_gate: input.gate?.trim() || null,
      p_device: input.device ?? {},
    },
  );

  if (error) {
    console.error("On-arrival payment collection failed:", error);
    return {
      ok: false,
      result: "ERROR",
      message:
        error.message ||
        "Payment could not be recorded. Do not admit the guest yet.",
    };
  }

  return parseResult(data);
}
