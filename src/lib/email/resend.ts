import "server-only";

export interface TransactionalEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export type TransactionalEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; skipped?: boolean; error: string };

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL?.trim() ?? "";
}

export function isTransactionalEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      getFromAddress(),
  );
}

export async function sendTransactionalEmail(
  input: TransactionalEmailInput,
): Promise<TransactionalEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getFromAddress();

  if (!apiKey || !from) {
    return {
      ok: false,
      skipped: true,
      error:
        "RESEND_API_KEY and RESEND_FROM_EMAIL are required to send transactional email.",
    };
  }

  const replyTo = process.env.RESEND_REPLY_TO?.trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | { id?: string; message?: string; error?: string }
      | null;

    if (!response.ok) {
      return {
        ok: false,
        error:
          payload?.message ||
          payload?.error ||
          `Resend returned HTTP ${response.status}.`,
      };
    }

    return {
      ok: true,
      id: payload?.id ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to connect to the email provider.",
    };
  }
}
