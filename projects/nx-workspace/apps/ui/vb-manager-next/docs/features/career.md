# Career / Resume

## Overview

- `/career` page renders Harry's resume as a 1:1 web copy of the source PDF
- Resume content is a single JSON file, shared across apps via `@vigilant-broccoli/resume`
- Same data also drives `personal-website-react`'s `resume.pdf` (no more external source)

## Data Model

- `libs/@vigilant-broccoli/resume/src/resume.json` — single source of truth
- Bullet strings support inline `**bold**` markdown, parsed by both renderers
- `@vigilant-broccoli/resume` (index) — browser-safe: `resumeData` + `ResumeData` types
- `@vigilant-broccoli/resume/server` — Node-only: `generateResumePdfBuffer()` (Playwright/Chromium)
- Split into two entry points so Next's client bundle for `/career` never pulls in Playwright

## `/career` Page (vb-manager-next)

- Read-only view for now — manual editing and AI-assisted updates are a future step
- "Download PDF" button opens the browser print dialog (`window.print()`) — no server-side export
- Print styling forces Letter page size and strips the app chrome (nav bar, sidebar) via `print:` Tailwind variants
- Fonts/colors match the original PDF exactly (extracted from the PDF's content streams): Roboto, link color `#1155cc`, heading color `#3d85c6`

## `personal-website-react` resume.pdf

- Generated at build time by the `pre-build` Nx target, not committed (gitignored)
- Renders a standalone HTML/CSS template (duplicated from, not shared with, the React view — different runtime, see below) via headless Chromium, `page.pdf()`
- Spacing is hand-tuned to fit exactly one Letter page — adding resume content may push it to a second page and require re-tuning
- `pre-build` also runs `playwright install --with-deps chromium` since no other CI job in this repo installs Playwright browsers

## Constraints

- The React component (`resume-view.component.tsx`, Tailwind/`next/font`) and the PDF template (`server.ts`, plain HTML string) implement the same design twice — Next's bundler and the headless-Chromium script can't share one implementation. Styling changes must be applied in both places.
- vb-manager-next isn't deployed to the cloud (runs locally via PM2) — the PDF generator can't render the live `/career` page, so it re-implements the layout standalone instead.
- `apps/ui/personal-website-react` declares no `implicitDependencies` on vb-manager-next — Nx's affected-graph correctly picks up resume.json changes via the real `@vigilant-broccoli/resume` import.

## Deprecated

- The old Google Docs → R2 cron pipeline (`cron-utility-update-resume.yml`) is removed; the stale `HarryLiu-Resume.pdf` object in the `vigilant-broccoli` R2 bucket is now unmaintained.
