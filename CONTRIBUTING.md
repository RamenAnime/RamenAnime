# Contributing to Ramen Anime

  Thank you for your interest in contributing. This document explains how to report issues, propose features, and submit code changes.

  ## Code of Conduct

  All contributors are expected to be respectful and constructive in all interactions.

  ---

  ## Reporting Bugs

  Before opening a bug report, search existing issues to see if it has already been reported.

  When filing a bug, include:

  1. A clear, descriptive title
  2. Steps to reproduce the problem
  3. The expected behavior and what you observed instead
  4. Your environment (OS, Node.js version, browser)
  5. Any relevant error messages or screenshots

  For security vulnerabilities, do **not** open a public issue. See [SECURITY.md](SECURITY.md) instead.

  ---

  ## Suggesting Features

  Feature requests are welcome. Open an issue with:

  1. A description of the problem you want to solve
  2. The solution you have in mind
  3. Alternatives you considered

  Keep proposals focused - one feature per issue.

  ---

  ## Development Setup

  ### Prerequisites

  - Node.js 20 or later
  - A MySQL-compatible database (TiDB Cloud recommended)
  - A Resend account for email

  ### Steps

  1. Fork the repository and clone your fork:

     ```bash
     git clone https://github.com/YOUR_USERNAME/RamenAnime.git
     cd RamenAnime
     npm install
     ```

  2. Copy the environment template and fill in required values:

     ```bash
     cp .env.example .env
     ```

  3. Push the database schema:

     ```bash
     npm run db:push
     ```

  4. Start the development servers:

     ```bash
     npm run dev
     ```

  ---

  ## Making Changes

  1. Create a branch from `main`:

     ```bash
     git checkout -b fix/short-description
     # or
     git checkout -b feat/short-description
     ```

  2. Make your changes. Keep each commit focused on a single logical change.

  3. Run tests:

     ```bash
     npm test
     ```

  4. Run the type checker:

     ```bash
     npm run typecheck
     ```

  5. Open a pull request against `main`. Describe what changed and why, and reference any related issues (`Closes #123`).

  ---

  ## Code Style

  - TypeScript is required for all new code. Avoid `any` unless there is no alternative.
  - Server code must use the structured logger (`req.log` in route handlers, the `logger` singleton elsewhere). Do not use `console.log` in server code.
  - All new API endpoints must be tRPC procedures. Raw Hono routes are reserved for cases that require access to the unparsed request body (e.g. Stripe webhooks).
  - Validate all inputs and outputs with Zod.
  - Keep components focused. If a component exceeds ~200 lines, consider splitting it.

  ---

  ## Pull Request Guidelines

  - One concern per PR.
  - Provide a short description of what changed and why.
  - Reference related issues.
  - PRs that break existing tests will not be merged.
  - New behavior should have a corresponding test where practical.
  