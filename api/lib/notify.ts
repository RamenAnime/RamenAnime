import { getDb } from "../queries/connection";
import { notifications, users } from "@db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "./mailer";

const EMAIL_TYPES = new Set([
  "outbid",
  "auction_won",
  "auction_ended",
  "auction_unsold",
  "payment_expired",
  "message",
]);

const EMAIL_SUBJECTS: Record<string, string> = {
  outbid: "You were outbid on Ramen Anime",
  auction_won: "You won an auction on Ramen Anime",
  auction_ended: "A watched auction ended",
  auction_unsold: "Your auction ended",
  payment_expired: "Payment deadline passed",
  message: "New message on Ramen Anime",
};

export async function createNotification(input: {
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  const db = getDb();
  await db.insert(notifications).values({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link,
  });

  if (!EMAIL_TYPES.has(input.type)) return;

  const user = await db.query.users.findFirst({
    where: eq(users.id, input.userId),
    columns: { email: true, name: true },
  });
  if (!user?.email) return;

  const site = process.env.SITE_URL || "https://ramenanime.com";
  const linkUrl = input.link ? `${site}${input.link.startsWith("/") ? input.link : `/${input.link}`}` : site;
  const subject = EMAIL_SUBJECTS[input.type] || input.title;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px">
      <h2 style="color:#F97316">${input.title}</h2>
      <p>${input.message}</p>
      <p><a href="${linkUrl}" style="color:#F97316">Open Ramen Anime</a></p>
    </div>
  `;

  await sendEmail(user.email, subject, html);
}
