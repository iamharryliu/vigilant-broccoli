# Career / Resume

## Overview

- `/career` page edits Harry's resume (JSON editor or AI chat) next to a live 1:1 web copy of the PDF
- Resume content is a single JSON file, shared across apps via `@vigilant-broccoli/resume`
- Same data also drives `personal-website-react`'s `resume.pdf` (no more external source)

## Data Model

- `libs/@vigilant-broccoli/resume/src/resume.json` — single source of truth
- Bullet strings support inline `**bold**` markdown, parsed by both renderers
- Optional `summary` — a concise professional summary rendered between the header and the work experience (the skills line sits at the bottom, after Open Source); resumes without it stay valid
- `@vigilant-broccoli/resume` (index) — browser-safe: `resumeData`, `ResumeData` types, the zod `resumeSchema`/`validateResume`, `calculateWorkExperience` and the PDF layout types
- `@vigilant-broccoli/resume/server` — Node-only: `renderResumePdf()` (Playwright/Chromium), `generateResumePdfBuffer()` and `ResumePdfOverflowError`
- Split into two entry points so Next's client bundle for `/career` never pulls in Playwright
- `validateResume` is the one structural check: the JSON editor, `PUT /api/resume`, `POST /api/resume/pdf`, the chat request and every model tool output go through it. Link URLs must be `http(s)`

## `/career` Page (vb-manager-next)

- "Edit JSON" tab: edits parse and validate on every keystroke; invalid JSON or a structurally invalid resume shows the error, keeps the last valid preview and blocks save, download and Apply. Valid edits autosave (debounced) to `resume.json`. Nothing is truncated
- "Diff" tab: a git-style line diff (`+`/`-`, green/red) of the JSON editor text against the committed (`HEAD`) `resume.json`, read by `GET /api/resume/baseline` (`git show`). Updates live as the editor or Apply changes the resume, and survives reloads. Until it loads (or if git fails) the baseline is the bundled `resume.json`, and trailing newlines are ignored
- "AI Chat" tab: see below. Its conversation lives in `CareerPage`, so it survives switching tabs; "New conversation" clears it
- "Download PDF" posts the current resume to `POST /api/resume/pdf` (server Playwright, Letter). If the PDF is over one page the toast shows the measured overflow (for example "about 4 lines too long") instead of a generic failure; the editor content is never changed
- Fonts/colors match the original PDF exactly (extracted from the PDF's content streams): Roboto, link color `#1155cc`, heading color `#3d85c6`

## AI Chat

`POST /api/resume/chat` streams newline-delimited JSON: `progress` events (shown in the existing "Thinking" spinner bubble) and one final `text`, `resume_update` or `error` event.

### Progressive conversation

- The browser sends the visible history plus explicit context each turn: the current applied resume, the latest proposal (`validated`, `applied`, `basedOnCurrentResume`) and a tailoring ledger. Users never restate the target or confirmed facts
- Typical flow: paste a recruiter request, receive a tailored one-page draft with gap notes, optionally answer follow-up questions, refine the draft, Apply, keep talking. The model drafts from supported experience in the same turn instead of waiting for answers about unsupported requirements. Feedback-only questions get plain text without a resume update
- The empty chat shows a brief explanation and a free-text input; there are no canned prompt buttons
- Refinements such as "shorten your previous draft" work on the exact latest draft sent as JSON, with its status (applied, awaiting Apply, stale or unvalidated). A stale draft is rebased by asking the assistant to refresh it onto the current resume
- Conversation continuity is session state only (React state, cleared by a reload or "New conversation"); there is no stored chat and no extra service

### Grounding

- Evidence is the current resume, the career note and experience the user states in the conversation. Job descriptions, keyword lists and assistant suggestions are never evidence
- The ledger (`target`, `requirements`, `recruiterInstructions`, `confirmedFacts`, `deniedSkills`, `openQuestions`) is recorded by the model through `record_tailoring_context`. The server drops any confirmed fact whose `evidence` is not quoted in a user message or that mentions a skill the user denied, and says so in the reply
- Years of experience are calculated by `calculateWorkExperience` from the work-experience dates (overlapping roles merged, gaps excluded, month boundaries exclusive) and given to the model as the ceiling to claim
- Each candidate is also checked in code: a new skill needs support in the current resume (summary, bullets and skills, not names or companies), the career note's Skill column or a confirmed fact, matched as whole words so `Java` is not found in `JavaScript`; `basics.links` must match the current resume exactly (links are never edited in the editor); `basics.title` may change only to a title listed in the skills note; and name, contact details, employers, roles and dates must match the current resume unless the user's instruction is quoted. Failures are sent back to the model like overflow
- Figures are grounded by `resume-chat.metrics.ts`: every figure in a bullet (digits with currency, `k`/`million`, `%` or `x`; number words; `doubled`/`halved`; vague magnitudes such as "hundreds of") must match one in that entry's current bullets, its career-note Job Experience row, the Skills Notes for rows whose "Used In" lists it, or a confirmed fact's quoted evidence; summary figures may come from any of those. Matching is by value and unit, so `90 percent`/`90%`, `1,000`/`1k` and `2x`/`doubled` pass, while new, inflated or moved figures are rejected. A vague magnitude only needs a source at least that large (understating passes), and a vague source never grounds a precise figure. Names such as `S3`, `EC2`, `HTTP/2` and hyphenated compounds (`two-factor`) are not figures. An "N years" claim is checked separately: it cannot exceed the full years the work dates support ("nearly N" may reach the next whole year)
- The career note is `notes/personal/personal-software-career-experience.md`, read live on every request by `resume-chat.skills-note.server.ts` (walking up from the working directory, so it works under `next dev` and the PM2 `dist/` process; the app is only run from this checkout). Its `## Skills` table is the confirmed skills, `## Roles` the allowed titles (its first column); a keyword with no row is unconfirmed, left out of the draft and listed as a gap. Follow-up questions can confirm it for a later revision without delaying supported edits. If the file is missing the editor falls back to the resume and conversation, and the title cannot change
- The same guards run for CLI edits through `scripts/check-resume.ts` (run with `npx tsx` from `projects/nx-workspace`; deliberately no root script), which compares the working-tree `resume.json` with `HEAD` (or a given git ref) and also reports the layout. The resume lib's `CONTEXT.md` tells agents to hold CLI edits to the same rules as this chat
- Keyword highlighting is automatic: before rendering, `resume-chat.highlight.ts` bolds (`**…**`) summary and bullet words that match a confirmed skill the target, requirements or recruiter instructions mention, plus that skill's related terms (a posting asking for WCAG also bolds ARIA from `Accessibility (WCAG, ARIA)`). Whole-word matches only, existing bold is left alone, and it runs before the one-page render so the bold width is measured. Unconfirmed keywords are never emphasised
- The skills line is reordered in code (`orderSkillsByImportance`) before rendering: skills the target mentions come first, in the order the ledger lists requirements (the model is told to record them most important first, required before nice-to-have), then the rest in their existing order. No skill is added or removed
- If the model leaves `basics.title` unchanged, `alignTitleWithTarget` switches it to the closest allowed Roles title: the target's mentions of the title's lead word (Backend, DevOps, ..., including spellings such as `full-stack` or `back end`) count triple, plus mentions of that discipline's typical technologies (`ROLE_KEYWORDS`: Java, API, microservices for Backend; React, CSS for Frontend; Docker, Kubernetes, Terraform for DevOps), so a posting that never says "backend" still lands on the nearest role; a title the model chose itself is kept. Highlighting skips generic terms (`platform`, `architecture`, ...), hyphenated compounds (`cross-platform`) and the parenthetical list after an already-bold keyword (`**AWS** resources (EC2, S3)`)
- Experience lines are tailored too: for each requirement with a skills-note row, the model rewrites or adds a bullet in the entries named in that row's "Used In" column (the Note column supplies specifics; with an empty Note it only names the skill inside an existing bullet's real work). A grounding check rejects a new bullet that mentions a requested skill under an employer (or `Open Source`) its "Used In" does not list
- The summary always opens with a code-built sentence, `<title> with <N>+ (or nearly N) years of experience in software development.`, from the aligned title and the work dates (`withRoleSummaryOpener`); the model writes only the related follow-up, and a leading model sentence that claims years is dropped. Title alignment and the opener run before the grounding checks, so the checked text is the text that is rendered
- After a one-page fit, `fillSkillsLine` appends skills beyond the model's choice (confirmed skills the target mentions, then the current resume's skills) as long as the skills line does not gain a line or the resume a page; it binary-searches the count with a few extra renders. It never re-adds a denied skill, or a current skill the latest user message names outside the target (so "drop Testing from the skills" sticks)
- Both renderers (`resume-view.component.tsx`, `server.ts`) parse `**bold**` in the summary as well as in bullets
- The note's `## Job Experience` table (company, role, dates, context) is the user's own account of each job; it is sent to the model as the source of truth for what was done at each company and counts as support when a new skill mention is grounded. Edit the note, not the code, to give the model more context for a job
- The note's `## Languages` table (language and proficiency) is given to the model as confirmed, so it never asks about spoken or written languages
- Each `update_resume` call includes `unconfirmed` (an empty array when there are no gaps), so the edited resume and keywords left out with reasons arrive together. The server merges the gaps from every attempt in a request, so a revision that forgets them, or a retained earlier draft, still shows them; a gap whose keyword ended up in the returned resume is dropped. Optional questions follow the draft rather than blocking it. If the model only records the ledger, its tool result asks it to draft now when a draft was requested. The reply also includes the validation status

### Model

- The server picks the model (`RESUME_CHAT_MODEL` in `resume-chat.consts.ts`, currently `gpt-5.5`, called with `OPENAI_API_KEY`); the client's `model` field is ignored

### Validation and retry limits

- Every candidate from `update_resume` is checked structurally, then for grounding, then rendered with the same `renderResumePdf` path as Download. Only a result of exactly one page (page count read from the PDF with `pdf-lib`) is offered as a validated proposal; zero pages is an error
- One page is the hard constraint; filling it is a bounded, soft objective (see below). On overflow the model receives structured layout feedback (page count, content height versus printable height, overflow lines, per-section heights) and must return a shorter version that keeps employers, roles and dates. Budget: 1 initial call plus 3 revisions, so at most 4 model calls per message; each candidate uses a base PDF render and may use additional bounded renders to fill the skills line
- If the budget runs out with no one-page candidate, or the PDF check itself fails (for example Chromium is missing), the draft stays in the chat as "Not validated as one page", the Apply button is disabled and the assistant asks what to prioritise or cut. If no valid draft ever existed, an error message is shown. In every failure the current resume is untouched
- Page size, margins and type size are never changed to make content fit

### Fit plus fill

- `renderResumePdf` measures the body in the same viewport, fonts and HTML as the exported PDF and adds `unusedPx`, `unusedLines`, `fillRatio` (content height ÷ printable height, so the margins and the spacing between sections count as content and nothing is stretched to the page) and `underfilled` to the layout. The PDF's actual page count remains the final authority for fitting
- The target band is `RESUME_PDF_FILL_TARGET` in `resume.pdf.types.ts`: 95%-98% of the 1017px printable height (967-996px of content). Below 95% is "underfilled"; the unused ~2% at the bottom is an intentional gutter, so content above the band that still fits is never shortened
- The model gets measured feedback in both directions. Overflow: shorten judiciously, only as much as needed. Underfill: restore or develop the most job-relevant supported achievements, clarify existing facts, or include confirmed experience that was left out. It is told not to pad, invent claims or metrics, repeat bullets or keyword-stuff, and to answer in plain text instead when no supported material is left or the user asked for a concise version
- The layout also reports `shortLastLines` (wrapped bullets, summary or skills lines whose last line is under 70% full, `RESUME_PDF_MIN_LAST_LINE_RATIO`) and `skillsLineCount`. A candidate with short last lines is sent back for a bounded revision like an underfilled one; the skills line prefers one line but a wrap never fails a draft
- The best one-page candidate (the one nearest the band, fewest short lines on ties, earliest after that) is retained through refinement. A later overflow, grounding rejection, render failure or model error returns that version instead of losing it, and the reply says an earlier version was kept
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
