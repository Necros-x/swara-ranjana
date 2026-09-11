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

function getFromAddress() {
  return process.env.RESEND_FROM_EMAIL?.trim() ?? "";
}

export function isTransactionalEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && getFromAddress());
}

function withDevelopmentCredit(html: string) {
  if (html.includes('data-necros-studio-credit="true"')) return html;

  const credit = `
<table data-necros-studio-credit="true" width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="background:#0E1721;">
  <tr>
    <td align="center" style="padding:13px 18px;font-family:Arial,Helvetica,sans-serif;font-size:9px;line-height:1.5;letter-spacing:1.8px;text-transform:uppercase;color:#80909E;">
      Designed & Developed by <a href="${NECROS_STUDIO_URL}" style="color:#C9D3DB;text-decoration:none;font-weight:700;">NECROS Studio ↗</a>
    </td>
  </tr>
</table>`;

  const bodyClose = html.toLowerCase().lastIndexOf("</body>");
  if (bodyClose === -1) return `${html}${credit}`;
  return `${html.slice(0, bodyClose)}${credit}${html.slice(bodyClose)}`;
}

export async function sendTransactionalEmail(input: TransactionalEmailInput): Promise<TransactionalEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = getFromAddress();
  if (!apiKey || !from) return { ok: false, skipped: true, error: "RESEND_API_KEY and RESEND_FROM_EMAIL are required to send transactional email." };

  const replyTo = process.env.RESEND_REPLY_TO?.trim();
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: withDevelopmentCredit(input.html),
        text: `${input.text}\n\nDesigned & Developed by NECROS Studio — ${NECROS_STUDIO_URL}`,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as { id?: string; message?: string; error?: string } | null;
    if (!response.ok) return { ok: false, error: payload?.message || payload?.error || `Resend returned HTTP ${response.status}.` };
    return { ok: true, id: payload?.id ?? null };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to connect to the email provider." };
  }
}
