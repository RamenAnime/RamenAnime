# Security Policy

  ## Reporting a Vulnerability

  If you discover a security vulnerability in Ramen Anime, please report it **privately**. Do not open a public GitHub issue.

  **Contact:** Send a detailed report to the maintainers via email or through GitHub's private vulnerability reporting feature (Security > Report a vulnerability).

  Please include:

  1. A description of the vulnerability
  2. Steps to reproduce it
  3. The potential impact
  4. Any suggested remediation, if you have one

  You will receive a response within 72 hours acknowledging receipt. We aim to triage all reports within 7 days and issue a fix for confirmed vulnerabilities as quickly as possible.

  We ask that you:

  - Give us reasonable time to address the issue before any public disclosure
  - Avoid accessing or modifying data that does not belong to you during testing
  - Not perform denial-of-service attacks or disrupt live users

  ---

  ## Supported Versions

  Security fixes are applied to the current release on the `main` branch. Older versions are not maintained.

  ---

  ## Security Architecture

  ### Authentication

  - Passwords are hashed using **scrypt** with a 32-byte random salt and 64-byte output (512 bits).
  - Sessions use **HS512 JWT** tokens, valid for 30 days, stored in `HttpOnly; SameSite=None; Secure` cookies.
  - Passkey (WebAuthn) authentication is available as an alternative to passwords.
  - All authentication endpoints are rate-limited to 5 attempts per 15 minutes per IP address.
  - reCAPTCHA v2 can be enabled on login and registration via `RECAPTCHA_SECRET_KEY`.

  ### CSRF Protection

  Mutation endpoints verify that the `Origin` or `Referer` header matches an allowed origin list. Cross-site requests without a matching header are rejected with a 403 before reaching business logic.

  ### Geo Restrictions and OFAC Compliance

  Requests from OFAC-sanctioned countries (Iran, North Korea, Syria, Cuba, Myanmar) are blocked at the Hono middleware layer, before any authentication or database access. The country is determined from the `CF-IPCountry` Cloudflare header, not from the client-supplied `X-Forwarded-For`, to prevent spoofing.

  ### Security Headers

  All responses include:

  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`

  ### Stripe Webhook Verification

  All Stripe webhook events are verified using the Stripe-provided `stripe-signature` header and the `STRIPE_WEBHOOK_SECRET` environment variable before any processing occurs. Requests with an invalid or missing signature are rejected with a 400.

  ### Data

  - Sensitive query parameters and credentials are never logged.
  - Reset tokens are hashed with SHA-256 before storage - only the hash is in the database.
  - Field-level encryption is available for sensitive profile fields.
  