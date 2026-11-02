# Resume

## Overview

- job-hunt-next edits and tailors the resume (its Resume tab and the job application skill)
- Resume content is a single JSON file, shared across apps via `@vigilant-broccoli/resume`
- Same data also drives `personal-website-react`'s `resume.pdf` (no more external source)

## Data Model

- `notes/personal/career/resume.json` — single source of truth
- Bullet strings support inline `**bold**` markdown, parsed by the PDF renderer
- Optional `summary` — a concise professional summary rendered between the header and the work experience (the skills line sits at the bottom, after Open Source); resumes without it stay valid
- `@vigilant-broccoli/resume` (index) — browser-safe: `resumeData`, `ResumeData` types, the zod `resumeSchema`/`validateResume`, `calculateWorkExperience` and the PDF layout types
- `@vigilant-broccoli/resume/server` — Node-only: `renderResumePdf()` (Playwright/Chromium), `generateResumePdfBuffer()` and `ResumePdfOverflowError`
- Split into two entry points so a Next client bundle never pulls in Playwright
- `validateResume` is the one structural check: job-hunt-next's resume editor, its `check-resume` script and the PDF renderers go through it. Link URLs must be `http(s)`

## `personal-website-react` resume.pdf

- Generated at build time by the `pre-build` Nx target, not committed (gitignored)
- Calls `generateResumePdfBuffer()`, which throws `ResumePdfOverflowError` (with the measured layout) if the resume is over one page
- Spacing is hand-tuned to fit exactly one Letter page — adding resume content may push it to a second page and require re-tuning
- `pre-build` also runs `playwright install --with-deps chromium` since no other CI job in this repo installs Playwright browsers

## Constraints

- The PDF template loads Roboto from Google Fonts. Loading is bounded (5 s); if it does not arrive the stylesheet is dropped and a fallback font is measured, which is reported as `fontsLoaded: false` and can change whether a resume fits.
- `apps/ui/personal-website-react` declares no `implicitDependencies` on local-manager-next — Nx's affected-graph correctly picks up resume.json changes via the real `@vigilant-broccoli/resume` import.
