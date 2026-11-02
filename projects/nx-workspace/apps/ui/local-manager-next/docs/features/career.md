# Career / Resume

## Overview

- local-manager-next no longer has a `/career` page; see [Editing Rules](#editing-rules)
- Resume content is a single JSON file, shared across apps via `@vigilant-broccoli/resume`
- Same data also drives `personal-website-react`'s `resume.pdf` (no more external source)

## Data Model

- `notes/personal/career/resume.json` — single source of truth
- Bullet strings support inline `**bold**` markdown, parsed by both renderers
- Optional `summary` — a concise professional summary rendered between the header and the work experience (the skills line sits at the bottom, after Open Source); resumes without it stay valid
- `@vigilant-broccoli/resume` (index) — browser-safe: `resumeData`, `ResumeData` types, the zod `resumeSchema`/`validateResume`, `calculateWorkExperience` and the PDF layout types
- `@vigilant-broccoli/resume/server` — Node-only: `renderResumePdf()` (Playwright/Chromium), `generateResumePdfBuffer()` and `ResumePdfOverflowError`
- Split into two entry points so a Next client bundle never pulls in Playwright
- `validateResume` is the one structural check: job-hunt-next's resume editor and `scripts/check-resume.ts` go through it. Link URLs must be `http(s)`

## Editing Rules

- The local-manager `/career` page and its resume and chat API routes are gone; the resume is edited in job-hunt-next's Resume tab (see its [Applications](../../../job-hunt-next/docs/features/applications.md)) or by an agent editing `resume.json` directly
- `src/app/api/resume/chat/resume-chat.prompt.ts` (`buildSystemPrompt`) and `src/lib/resume-chat.protection.ts` remain only as the rules reference for agent edits, per [the resume lib's workflow](../../../../../libs/@vigilant-broccoli/resume/src/CONTEXT.md). Nothing calls a model with the prompt, and the mechanical checks it mentions (figure fidelity, keyword highlighting) no longer run
- `scripts/check-resume.ts` (run with `npx tsx` from `projects/nx-workspace`; deliberately no root script) compares the working-tree `resume.json` with `HEAD` (or a given git ref) for protected-field changes and renders it with `renderResumePdf` to check the one-page layout
- The career note is `notes/personal/career/personal-software-career-experience.md`, read by `resume-chat.skills-note.server.ts` (walking up from the working directory). Its `## Skills` table is the confirmed skills and `## Job Experience` the allowed titles (every `; `-separated entry in its `Role` column)

## `personal-website-react` resume.pdf

- Generated at build time by the `pre-build` Nx target, not committed (gitignored)
- Calls `generateResumePdfBuffer()`, which throws `ResumePdfOverflowError` (with the measured layout) if the resume is over one page
- Spacing is hand-tuned to fit exactly one Letter page — adding resume content may push it to a second page and require re-tuning
- `pre-build` also runs `playwright install --with-deps chromium` since no other CI job in this repo installs Playwright browsers

## Constraints

- The PDF template loads Roboto from Google Fonts. Loading is bounded (5 s); if it does not arrive the stylesheet is dropped and a fallback font is measured, which is reported as `fontsLoaded: false` and can change whether a resume fits.
- `apps/ui/personal-website-react` declares no `implicitDependencies` on local-manager-next — Nx's affected-graph correctly picks up resume.json changes via the real `@vigilant-broccoli/resume` import.
