# Agent Context — resume

The resume data (`resume.json`), its one-page PDF renderer (`server.ts`), and the validation shared by the career editor in `vb-manager-next`.

## Editing

- Treat a request to edit or tailor the resume from the CLI exactly like a message to the in-app AI chat. Follow the same rules, whose source of truth is `buildSystemPrompt` in `apps/ui/vb-manager-next/src/app/api/resume/chat/resume-chat.prompt.ts` (factual sources, editing rules, conversation flow) and the protected-field checks in `apps/ui/vb-manager-next/src/lib/resume-chat.protection.ts`. Read both before editing instead of relying on a summary here, and deviate only when the user explicitly waives a rule for that edit, saying which one you are waiving.
- What differs from the chat: there is no ledger or Apply step, so edit `resume.json` directly and ask the user in the conversation about anything unsupported before drafting it.
- After editing `resume.json`, run `cd projects/nx-workspace && npx tsx apps/ui/vb-manager-next/scripts/check-resume.ts` from the repo root (append a git ref to compare against something other than `HEAD`; there is deliberately no pnpm script for it). It runs the editor's protected-field check (links, title, identity, employers, roles, dates) against the committed resume, then renders the PDF and reports overflow, the fill band, wrapped lines ending under 70% full and how many lines the skills line wraps onto. Fix what it reports until it passes.
- `notes/personal/personal-software-career-experience.md` holds confirmed career facts in four tables: `## Skills` (`| Skill | Used In | Note |`, Note may be empty), `## Roles` (`| Role | Used In |`), `## Job Experience` (`| Company | Role | Dates | Context |`) and `## Languages` (`| Language | Proficiency |`). The in-app editor reads them live, so preserve these headings and table shapes. Job Experience supplies the company-specific facts used to tailor bullets; Languages records confirmed spoken and written proficiency.
- A skill may be added to a resume only if it has a row in `## Skills`; a keyword with no row is unconfirmed, so ask the user before claiming it and add a row once they confirm. Add a row, or extend an existing row's `Used In`, whenever a skill is used somewhere new. The editor sends these tables to the model as factual sources and does not check skills or figures in code, so never add a skill, count, percentage or other figure that is not already in the resume or these tables; record a new one there first.
- Conventions for that file's tables (keep them when editing):
  - One skill per row; split combined skills such as `Angular / Ionic` into separate rows, except where the user keeps a pair together (`MySQL / MariaDB`, `TypeScript / JavaScript`).
  - Rows are sorted alphabetically by the first column, case-insensitively, in all four tables.
  - `Used In` lists only where the skill or role was used: company names (`Capco`, `ELVA11`, `Tillmobil`, `Tretton37`) and `Open Source` for the personal projects. Never repeat the role title there; the `## Roles` table maps roles to companies. Entries are separated by `; ` and sorted alphabetically, case-insensitively.
  - `Note` is optional and usually empty. Put extra detail there as `Company: detail`, separated by `; ` and sorted by company, never in parentheses inside `Used In`.
  - Reflect each company-specific Skills note in the matching Job Experience row, preserving original responsibilities and outcomes. Keep role titles and dates factual; adding an allowed Roles title does not change historical job titles.
  - Write only what the user has confirmed; guesses are labelled as such in the conversation, not in the file.
- Keep the resume on exactly one US Letter page.
