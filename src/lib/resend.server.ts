/**
 * Server-only Resend email helper for cupai.
 *
 * This module MUST NOT be imported from client/browser code. The Resend API
 * key is read from the CUPAI_APP_RESEND_KEY environment variable at call time
 * and is never hardcoded.
 */

const RESEND_API_URL = "https://api.resend.com";

function getResendKey(): string {
  const key = process.env.CUPAI_APP_RESEND_KEY;
  if (!key) {
    throw new Error("Missing required environment variable: CUPAI_APP_RESEND_KEY");
  }
  return key;
}

export interface SendEmailInput {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
}

export interface SendEmailResult {
  id: string;
}

/** Send an email through Resend. Server-side only. */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const response = await fetch(`${RESEND_API_URL}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo,
      cc: input.cc,
      bcc: input.bcc,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend request failed [${response.status}]: ${body}`);
  }

  return (await response.json()) as SendEmailResult;
}
