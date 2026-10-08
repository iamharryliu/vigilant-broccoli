# Career / Resume

## Overview

- `/career` page edits Harry's resume (JSON editor or AI chat) next to a live 1:1 web copy of the PDF
- Resume content is a single JSON file, shared across apps via `@vigilant-broccoli/resume`
- Same data also drives `personal-website-react`'s `resume.pdf` (no more external source)

## Data Model

- `libs/@vigilant-broccoli/resume/src/resume.json` — single source of truth
- Bullet strings support inline `**bold**` markdown, parsed by both renderers
- Optional `summary` — a concise professional summary rendered between the header and the skills line; resumes without it stay valid
- `@vigilant-broccoli/resume` (index) — browser-safe: `resumeData`, `ResumeData` types, the zod `resumeSchema`/`validateResume`, `calculateWorkExperience` and the PDF layout types
- `@vigilant-broccoli/resume/server` — Node-only: `renderResumePdf()` (Playwright/Chromium), `generateResumePdfBuffer()` and `ResumePdfOverflowError`
- Split into two entry points so Next's client bundle for `/career` never pulls in Playwright
- `validateResume` is the one structural check: the JSON editor, `PUT /api/resume`, `POST /api/resume/pdf`, the chat request and every model tool output go through it. Link URLs must be `http(s)`

## `/career` Page (vb-manager-next)

- "Edit JSON" tab: edits parse and validate on every keystroke; invalid JSON or a structurally invalid resume shows the error, keeps the last valid preview and blocks save, download and Apply. Valid edits autosave (debounced) to `resume.json`. Nothing is truncated
- "AI Chat" tab: see below. Its conversation lives in `CareerPage`, so it survives switching tabs; "New conversation" clears it
- "Download PDF" posts the current resume to `POST /api/resume/pdf` (server Playwright, Letter). If the PDF is over one page the toast shows the measured overflow (for example "about 4 lines too long") instead of a generic failure; the editor content is never changed
- Fonts/colors match the original PDF exactly (extracted from the PDF's content streams): Roboto, link color `#1155cc`, heading color `#3d85c6`

## AI Chat

`POST /api/resume/chat` streams newline-delimited JSON: `progress` events (shown in the existing "Thinking" spinner bubble) and one final `text`, `resume_update` or `error` event.

### Progressive conversation

- The browser sends the visible history plus explicit context each turn: the current applied resume, the latest proposal (`validated`, `applied`, `basedOnCurrentResume`) and a tailoring ledger. Users never restate the target or confirmed facts
- Typical flow: paste a recruiter request, answer focused questions about unsupported requirements, refine the draft, Apply, keep talking. Feedback-only questions get plain text and no tool call
- Refinements such as "shorten your previous draft" work on the exact latest draft sent as JSON, with its status (applied, awaiting Apply, stale or unvalidated). A stale draft is rebased by asking the assistant to refresh it onto the current resume
- Conversation continuity is session state only (React state, cleared by a reload or "New conversation"); there is no stored chat and no extra service

### Grounding

- Evidence is the current resume plus experience the user states in the conversation. Job descriptions, keyword lists and assistant suggestions are never evidence
- The ledger (`target`, `requirements`, `recruiterInstructions`, `confirmedFacts`, `deniedSkills`, `openQuestions`) is recorded by the model through `record_tailoring_context`. The server drops any confirmed fact whose `evidence` is not quoted in a user message or that mentions a skill the user denied, and says so in the reply
- Years of experience are calculated by `calculateWorkExperience` from the work-experience dates (overlapping roles merged, gaps excluded, month boundaries exclusive) and given to the model as the ceiling to claim
- Each candidate is also checked in code: a new skill needs support in the current resume or a confirmed fact, a new link needs a URL the user typed, and name, contact details, employers, titles and dates must match the current resume unless the user's instruction is quoted. Failures are sent back to the model like overflow
- The reply lists keywords left out as unconfirmed, with reasons, and the validation status

### Validation and retry limits

- Every candidate from `update_resume` is checked structurally, then for grounding, then rendered with the same `renderResumePdf` path as Download. Only a result of exactly one page (page count read from the PDF with `pdf-lib`) is offered as a validated proposal; zero pages is an error
- One page is the hard constraint; filling it is a bounded, soft objective (see below). On overflow the model receives structured layout feedback (page count, content height versus printable height, overflow lines, per-section heights) and must return a shorter version that keeps employers, roles and dates. Budget: 1 initial call plus 3 revisions, so at most 4 model calls and 4 renders per message
- If the budget runs out with no one-page candidate, or the PDF check itself fails (for example Chromium is missing), the draft stays in the chat as "Not validated as one page", the Apply button is disabled and the assistant asks what to prioritise or cut. If no valid draft ever existed, an error message is shown. In every failure the current resume is untouched
- Page size, margins and type size are never changed to make content fit

### Fit plus fill

- `renderResumePdf` measures the body in the same viewport, fonts and HTML as the exported PDF and adds `unusedPx`, `unusedLines`, `fillRatio` (content height ÷ printable height, so the margins and the spacing between sections count as content and nothing is stretched to the page) and `underfilled` to the layout. The PDF's actual page count remains the final authority for fitting
- The target band is `RESUME_PDF_FILL_TARGET` in `resume.pdf.types.ts`: 90%-97% of the 1017px printable height (915-986px of content). Below 90% is "underfilled"; the unused ~3% at the bottom is an intentional gutter, so content above the band that still fits is never shortened
- The model gets measured feedback in both directions. Overflow: shorten judiciously, only as much as needed. Underfill: restore or develop the most job-relevant supported achievements, clarify existing facts, or include confirmed experience that was left out. It is told not to pad, invent claims or metrics, repeat bullets or keyword-stuff, and to answer in plain text instead when no supported material is left or the user asked for a concise version
- The best one-page candidate (the one nearest the band, earliest on ties) is retained through refinement. A later overflow, grounding rejection, render failure or model error returns that version instead of losing it, and the reply says an earlier version was kept
- Underfill alone never blocks Apply or counts as a failed one-page check. When the budget or the supported material runs out the sparse candidate is returned as validated with how much of the page is used, and the assistant offers to work in other relevant experience the user can describe
- Layout CSS is unchanged: page size, margins, font sizes and spacing are the same, so the browser preview matches and Download exports exactly the validated candidate with no export-time content changes. No spacing stretch, forced height or shrinking is used to claim occupancy
- Progress shows "Refining to fill the page (n of 3)"; the metrics themselves are only sent to the model and appear here

### Apply and stale protection

- A proposal is never applied or saved automatically. Apply updates the preview, JSON editor and `resume.json` together (through the editor's autosave)
- `CareerPage` keeps a resume revision that increases on every JSON edit, load and Apply. A proposal records the revision it was based on and can only be applied while that revision is current; otherwise it shows as out of date
- A reply that arrives after the resume changed is marked as based on the older version and cannot be applied. A reply that arrives after "New conversation" is dropped
- Apply is blocked while the JSON editor has an error. A malformed or invalid model response is discarded before it reaches state

## `personal-website-react` resume.pdf

- Generated at build time by the `pre-build` Nx target, not committed (gitignored)
- Calls `generateResumePdfBuffer()`, which throws `ResumePdfOverflowError` (with the measured layout) if the resume is over one page
- Spacing is hand-tuned to fit exactly one Letter page — adding resume content may push it to a second page and require re-tuning
- `pre-build` also runs `playwright install --with-deps chromium` since no other CI job in this repo installs Playwright browsers

## Constraints

- The React component (`resume-view.component.tsx`, Tailwind/`next/font`) and the PDF template (`server.ts`, plain HTML string) implement the same design twice — Next's bundler and the headless-Chromium script can't share one implementation. Styling changes must be applied in both places.
- vb-manager-next isn't deployed to the cloud (runs locally via PM2) — the PDF generator can't render the live `/career` page, so it re-implements the layout standalone instead.
- The PDF template loads Roboto from Google Fonts. Loading is bounded (5 s); if it does not arrive the stylesheet is dropped and a fallback font is measured, which is reported as `fontsLoaded: false` and can change whether a resume fits.
- `apps/ui/personal-website-react` declares no `implicitDependencies` on vb-manager-next — Nx's affected-graph correctly picks up resume.json changes via the real `@vigilant-broccoli/resume` import.
