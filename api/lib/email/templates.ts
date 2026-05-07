/**
 * Email HTML Templates for ラーメンアニメ (Ramen Anime)
 *
 * Self-contained template functions for sending transactional emails.
 * No external dependencies — only standard string/template-literal interpolation.
 *
 * Visual design tokens:
 *   - Header: linear-gradient(135deg, #d4a853, #b8860b)
 *   - Body background: #ffffff
 *   - Outer/page background: #f5f5f5
 *   - Footer / card background: #1a1a1a
 *   - Primary text: #333
 *   - Muted text: #555, #888
 *   - Accent color: #b8860b (dark gold)
 */

/** ------------------------------------------------------------------ */
/**  Shared CSS styles (inline-friendly)                               */
/** ------------------------------------------------------------------ */

/**
 * Returns shared CSS styles used across all email templates.
 * These are injected into a `<style>` block inside the `<head>`.
 */
export function baseEmailStyles(): string {
  return `
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: Arial, sans-serif; }
    .wrapper { width: 100%; border-collapse: collapse; }
    .spacer { padding: 20px 0; }
    .card { width: 600px; background: #1a1a1a; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #d4a853, #b8860b); padding: 30px; text-align: center; }
    .header h1 { color: #1a1a1a; margin: 0; font-size: 32px; font-weight: bold; }
    .header p { color: #1a1a1a; margin: 8px 0 0; font-size: 14px; font-weight: 500; }
    .body { padding: 30px; background: #ffffff; }
    .body p { font-size: 16px; color: #333; line-height: 1.6; }
    .body ul { font-size: 15px; color: #333; line-height: 1.8; padding-left: 20px; }
    .body a.btn { display: inline-block; background: #d4a853; color: #1a1a1a; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; }
    .body a.btn:hover { background: #b8860b; }
    .footer { background: #1a1a1a; padding: 20px; text-align: center; font-size: 12px; color: #888; }
    .footer p { margin: 0; }
    .fine-print { font-size: 14px; color: #555; line-height: 1.5; }
    .gold { color: #b8860b; }
    code { background: #f0f0f0; padding: 4px 8px; border-radius: 4px; word-break: break-all; font-size: 13px; }
  `;
}

/** ------------------------------------------------------------------ */
/**  Wrapper                                                             */
/** ------------------------------------------------------------------ */

/**
 * Wraps arbitrary email content in the standard header/footer shell.
 *
 * @param title      - Text shown in the gold header (e.g. "ラーメンアニメ")
 * @param subtitle   - Optional subtitle under the title (e.g. "Password Reset Request")
 * @param contentHtml - Raw HTML for the white body section
 * @param footerText - Optional custom footer text; defaults to brand name
 */
export function emailWrapper(
  title: string,
  subtitle: string | undefined,
  contentHtml: string,
  footerText = "ラーメンアニメ | Anime Collectibles & Social Community"
): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${baseEmailStyles()}</style>
</head>
<body>
  <table role="presentation" class="wrapper" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" class="spacer">
        <table role="presentation" class="card" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td class="header">
              <h1>${title}</h1>
              ${subtitle ? `<p>${subtitle}</p>` : ""}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="body">
              ${contentHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="footer">
              <p>${footerText}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** ------------------------------------------------------------------ */
/**  Template 1 – Welcome Email                                          */
/** ------------------------------------------------------------------ */

/**
 * Generates the HTML for the welcome email sent after registration.
 *
 * @param username    - Display name of the new user
 * @param baseUrl     - Canonical site URL (e.g. "https://ramenanime.com")
 * @param verifyToken - Optional email-verification token; if provided a
 *                      "Verify Email Address" CTA button is included
 */
export function welcomeEmailHtml(
  username: string,
  baseUrl: string,
  verifyToken?: string
): string {
  const verifyLink = verifyToken
    ? `${baseUrl}/verify-email?token=${verifyToken}`
    : null;

  const verifySection = verifyLink
    ? `<p>Please verify your email address to unlock all features:</p>
      <p style="margin:20px 0;text-align:center;">
        <a href="${verifyLink}" class="btn">Verify Email Address</a>
      </p>`
    : "";

  const bodyContent = `
    <p>Hi <strong>${username}</strong>,</p>
    <p>Welcome to <strong class="gold">ラーメンアニメ</strong>! We are thrilled to have you join our community of anime enthusiasts.</p>
    <p>Your account has been successfully created. Here is what you can do now:</p>
    <ul>
      <li><strong>Shop</strong> – Browse our exclusive collection of custom 3D prints and trading cards</li>
      <li><strong>Forum</strong> – Connect with fellow fans in our MySpace-style social forum</li>
      <li><strong>Marketplace</strong> – Buy and sell anime collectibles from other community members</li>
      <li><strong>Friends</strong> – Build your anime network and make new friends</li>
    </ul>
    ${verifySection}
    <p class="fine-print">By using our platform, you agree to our Terms of Service and Privacy Policy.</p>
    <p>Enjoy your stay!<br/>– The <strong class="gold">ラーメンアニメ</strong> Team</p>
  `;

  return emailWrapper(
    "ラーメンアニメ",
    "Anime Collectibles & Social Community",
    bodyContent,
    "ラーメンアニメ | Anime Collectibles & Social Community"
  );
}

/** ------------------------------------------------------------------ */
/**  Template 2 – Verify Email                                         */
/** ------------------------------------------------------------------ */

/**
 * Generates the HTML for a standalone email-verification message.
 *
 * @param username - Display name of the recipient
 * @param link     - Full verification URL (including token)
 */
export function verifyEmailHtml(username: string, link: string): string {
  const bodyContent = `
    <p>Hi <strong>${username}</strong>,</p>
    <p>Please verify your email address by clicking the button below:</p>
    <p style="margin:20px 0;text-align:center;">
      <a href="${link}" class="btn">Verify Email</a>
    </p>
    <p class="fine-print">This link expires in 24 hours. If you did not create an account, you can safely ignore this email.</p>
  `;

  return emailWrapper(
    "ラーメンアニメ",
    undefined,
    bodyContent,
    "ラーメンアニメ"
  );
}

/** ------------------------------------------------------------------ */
/**  Template 3 – Password Reset                                       */
/** ------------------------------------------------------------------ */

/**
 * Generates the HTML for a password-reset request email.
 *
 * @param username - Display name of the recipient
 * @param token    - Raw reset token (will be appended to baseUrl)
 * @param baseUrl  - Canonical site URL (e.g. "https://ramenanime.com")
 */
export function resetEmailHtml(
  username: string,
  token: string,
  baseUrl: string
): string {
  const link = `${baseUrl}/reset-password?token=${token}`;

  const bodyContent = `
    <p>Hi <strong>${username}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to set a new password:</p>
    <p style="margin:20px 0;text-align:center;">
      <a href="${link}" class="btn">Reset Password</a>
    </p>
    <p class="fine-print">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
    <p class="fine-print">If the button doesn't work, copy and paste this link:<br/>
      <code>${link}</code>
    </p>
  `;

  return emailWrapper(
    "ラーメンアニメ",
    "Password Reset Request",
    bodyContent,
    "ラーメンアニメ | Anime Collectibles & Social Community"
  );
}
