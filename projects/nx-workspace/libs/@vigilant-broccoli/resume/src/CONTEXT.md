# Agent Context — resume

Resume data, PDF rendering and validation shared with the manager's career editor.

## Table of Contents

- [Editing](#editing)

## Editing

- Before resume edits, read `apps/ui/vb-manager-next/src/app/api/resume/chat/resume-chat.prompt.ts` (`buildSystemPrompt`) and `src/lib/resume-chat.protection.ts` in that app. Follow their factual, editing and conversation rules; waive a rule only on explicit user instruction and identify the waiver.
- CLI edits go directly to `resume.json`, without the chat's ledger or Apply step. Use confirmed facts for the draft; ask about unsupported claims before adding them.
- After editing, run `npx tsx apps/ui/vb-manager-next/scripts/check-resume.ts` from `projects/nx-workspace` (optional git ref; default `HEAD`). Fix protected-field, page overflow, fill-band and line-wrap failures. The PDF must fit exactly one US Letter page.
- `notes/personal/personal-software-career-experience.md` is read live by the editor. Preserve `## Skills` (`Skill | Used In`), `## Job Experience` (`Company | Role | Dates | Context`), `## Languages` (`Language | Proficiency`), and `## Project Contributions` with `### Company — Project — Dates` headings and `Contribution | Description` tables.
- Skills require a Skills row or explicit Project Contributions evidence; record newly confirmed facts before using them. Update `Used In` when a skill is used somewhere new. Do not infer experience from reference links or copy References lists into resume bullets. Figures must already be in the resume or confirmed records.
- Career-record table conventions:
  - One skill per row, except user-kept pairs (`MySQL / MariaDB`, `TypeScript / JavaScript`). Alphabetize rows case-insensitively.
  - `Used In` contains company names or `vigilant-broccoli`, separated by `; ` and alphabetized, never role titles or implementation details.
  - Keep project details, outcomes and links in Project Contributions; role-wide or unattributed responsibilities stay in Job Experience. Preserve confirmed responsibilities and outcomes when reorganizing.
  - A Job Experience `Role` cell lists the historical title first, then allowed resume titles separated by `; `; extra allowed titles do not change the historical title.
  - Project sections run newest first; contribution rows are alphabetical. Git activity ranges and `Dates unconfirmed` are not resume dates or durations. Record only user-confirmed claims; keep guesses in the conversation.
- `OSS Projects` and legacy `Open Source` aliases map to the existing `vigilant-broccoli` experience; preserve its label, role and dates instead of adding a duplicate.
- Keep the summary's single opening role-and-years sentence consistent with the chat editor and work dates; do not repeat years later.
- After the opener, the summary is one general sentence starting `Expertise in` that names three to six target-relevant confirmed skill areas (bold keywords). No specific projects, employers, integrations or implementation details; those belong in bullets.
