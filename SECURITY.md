# Security Policy

## Reporting a Vulnerability

**Do NOT open public GitHub issues for security vulnerabilities.**

Email: **ramenanime@protonmail.com**

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

We respond within 48 hours.

## Security Measures

- Passwords: scrypt (512-bit output)
- JWT: HS512 algorithm
- Reset tokens: SHA-256 hashed before storage
- Rate limiting on all auth endpoints
- CSRF protection on mutations
- Security headers: HSTS, CSP, X-Frame-Options
- IP-based geoblocking with Cloudflare
