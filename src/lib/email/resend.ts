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

const NECROS_STUDIO_URL = "https://studio.necros.co";
const SWARA_RANJANA_EMAIL = "concierge@swararanjana.lk";
const SWARA_RANJANA_PHONE = "+94 11 268 9000";

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL?.trim() ?? "";
}

export function isTransactionalEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && getFromAddress());
}

function shouldIncludeRefundPolicy(subject: string) {
  if (/login code/i.test(subject)) return false;
  return /(reservation|ticket|refund|cancellation|cancel)/i.test(subject);
}

function withRefundPolicy(html: string, subject: string) {
  if (!shouldIncludeRefundPolicy(subject)) return html;
  if (html.includes('data-refund-policy-notice="true"')) return html;

  const notice = `
<table data-refund-policy-notice="true" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:#F7F9FA;border-top:1px solid #E1E6EA;">
  <tr>
    <td style="padding:20px 28px;font-family:Arial,Helvetica,sans-serif;">
      <div style="font-size:9px;line-height:1.4;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#2271B1;">Refunds &amp; cancellations</div>
      <div style="margin-top:8px;font-size:12px;line-height:1.7;color:#5F6D79;">
        Online refund and cancellation requests close exactly <strong style="color:#0E1721;">48 hours before showtime</strong>. For an urgent exception after the cutoff, contact <strong style="color:#0E1721;">Swara Ranjana</strong> at <a href="mailto:${SWARA_RANJANA_EMAIL}" style="color:#2271B1;text-decoration:none;font-weight:700;">${SWARA_RANJANA_EMAIL}</a> or <a href="tel:+94112689000" style="color:#2271B1;text-decoration:none;font-weight:700;">${SWARA_RANJANA_PHONE}</a>.
      </div>
    </td>
  </tr>
</table>`;

  const bodyClose = html.toLowerCase().lastIndexOf("</body>");
  if (bodyClose === -1) return `${html}${notice}`;
  return `${html.slice(0, bodyClose)}${notice}${html.slice(bodyClose)}`;
}

function refundPolicyText(subject: string) {
  if (!shouldIncludeRefundPolicy(subject)) return "";
  return `Refund & cancellation policy: Online refund and cancellation requests close exactly 48 hours before showtime. For an urgent exception after the cutoff, contact Swara Ranjana at ${SWARA_RANJANA_EMAIL} or ${SWARA_RANJANA_PHONE}.`;
}

function withDevelopmentCredit(html: string) {
  if (html.includes('data-necros-studio-credit="true"')) return html;

  // Keep the dark credit background fitted to the credit itself rather than
  // stretching a dark bar across the entire email viewport.
  const credit = `
<table data-necros-studio-credit="true" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:transparent;">
  <tr>
    <td align="center" style="padding:14px 16px 0;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="display:inline-table;background:#0E1721;">
        <tr>
          <td align="center" style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:1.5;letter-spacing:1.8px;text-transform:uppercase;color:#80909E;white-space:nowrap;">
            Designed & Developed by <a href="${NECROS_STUDIO_URL}" style="color:#C9D3DB;text-decoration:none;font-weight:700;">NECROS Studio ↗</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  const bodyClose = html.toLowerCase().lastIndexOf("</body>");
  if (bodyClose === -1) return `${html}${credit}`;
  return `${html.slice(0, bodyClose)}${credit}${html.slice(bodyClose)}`;
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
  const policyText = refundPolicyText(input.subject);

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
        html: withDevelopmentCredit(
          withRefundPolicy(input.html, input.subject),
        ),
        text: [
          input.text,
          policyText,
          `Designed & Developed by NECROS Studio — ${NECROS_STUDIO_URL}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as {
      id?: string;
      message?: string;
      error?: string;
    } | null;

    if (!response.ok) {
      return {
        ok: false,
        error:
          payload?.message ||
          payload?.error ||
          `Resend returned HTTP ${response.status}.`,
      };
    }

    return { ok: true, id: payload?.id ?? null };
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
