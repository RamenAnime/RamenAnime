# Contributing to Ramen Anime

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/RamenAnime.git`
3. Create a branch: `git checkout -b feat/your-feature-name`
4. Install dependencies: `npm install`
5. Copy `.env.example` to `.env` and fill in your values
6. Start the dev server: `npm run dev`
7. Visit `http://localhost:3000/api/run-migration` to set up the database

## Branch Naming

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New features | `feat/add-search-filter` |
| `fix/` | Bug fixes | `fix/login-redirect-loop` |
| `docs/` | Documentation changes | `docs/update-api-reference` |
| `refactor/` | Code refactoring | `refactor/extract-auth-utils` |
| `security/` | Security improvements | `security/add-rate-limiting` |
| `test/` | Test additions or fixes | `test/add-integration-tests` |

## Before Submitting

- [ ] Run `npm run build` to ensure the project compiles
- [ ] Run `npm test` to ensure all tests pass
- [ ] Test your changes locally at `http://localhost:3000`
- [ ] Update relevant documentation if needed
- [ ] Keep commits atomic and descriptive
- [ ] No em dashes or AI watermarks in non-bot code

## Pull Request Process

1. Push your branch to your fork
2. Open a Pull Request against the `main` branch
3. Link any related issues with `Fixes #123` or `Closes #456`
4. Wait for review - maintainers respond within 48 hours

## Code Standards

- TypeScript strict mode - no implicit `any`
- Use Zod validation for all API inputs
- Add rate limiting for mutation endpoints
- Admin endpoints must use `adminQuery` middleware
- Use Tailwind CSS utility classes only
- Add translations for all 7 languages when adding new UI text
- Never commit secrets or API keys

## Reporting Issues

Use GitHub Issues and include:
- Clear title with [Bug], [Feature], or [Question] prefix
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS info

## Security Issues

Do NOT open public issues for security vulnerabilities. Email ramenanime@protonmail.com. See SECURITY.md.
