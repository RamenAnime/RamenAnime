import { createTransport, type Transporter } from "nodemailer";
import { logger } from "./logger";

let transport: Transporter | null = null;

function getTransport(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  if (!transport) {
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    transport = createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transport;
}

export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const t = getTransport();
  if (!t) {
    logger.info("SMTP not configured, skipping email", { to, subject });
    return false;
  }
  const from = process.env.SMTP_FROM || "Ramen Anime <noreply@ramenanime.com>";
  try {
    await t.sendMail({ from, to, subject, html });
    logger.info("Email sent via SMTP", { to, subject });
    return true;
  } catch (err) {
    logger.error("SMTP send failed", { to, subject, error: (err as Error).message });
    return false;
  }
}
