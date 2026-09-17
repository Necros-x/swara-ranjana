import "server-only";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

function hashKey(scope: string, value: string) {
  return createHash("sha256")
    .update(`${scope}\0${value.trim().toLowerCase()}`)
    .digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Returns the best request-network identifier available behind Vercel.
 * The value is only used after SHA-256 hashing and is never persisted raw.
 */
export async function getRequestNetworkKey(): Promise<string | null> {
  const requestHeaders = await headers();
  const forwarded =
    requestHeaders.get("x-vercel-forwarded-for") ??
    requestHeaders.get("x-forwarded-for") ??
    requestHeaders.get("x-real-ip");

  if (!forwarded) return null;

  const address = forwarded.split(",")[0]?.trim();
  return address || null;
}

/**
 * Durable cross-instance rate limit backed by a private Postgres ledger.
 * If the limiter itself is unavailable we fail open and log the error so a
 * transient protection failure does not take ticketing/auth completely down.
 */
export async function consumeServerRateLimit({
  scope,
  key,
  limit,
  windowSeconds,
}: {
  scope: string;
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const supabase = createAdminClient() as any;

  const { data, error } = await supabase.rpc("consume_server_rate_limit", {
    p_scope: scope,
    p_key_hash: hashKey(scope, key),
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error || !isRecord(data) || data.ok !== true) {
    console.error("Server rate-limit check failed:", error ?? data);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: data.allowed !== false,
    retryAfterSeconds:
      typeof data.retry_after_seconds === "number"
        ? Math.max(0, Math.trunc(data.retry_after_seconds))
        : 0,
  };
}
