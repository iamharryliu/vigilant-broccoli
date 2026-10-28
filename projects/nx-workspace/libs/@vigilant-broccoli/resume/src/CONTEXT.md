# Agent Context — resume

Resume data, PDF rendering and validation shared with the manager's career editor.

## Table of Contents

- [Editing](#editing)
- [Job Application Workflow](#job-application-workflow)
- [Cover Letter Template](#cover-letter-template)

## Editing

- Before resume edits, read `apps/ui/local-manager-next/src/app/api/resume/chat/resume-chat.prompt.ts` (`buildSystemPrompt`) and `src/lib/resume-chat.protection.ts` in that app. Follow their factual, editing and conversation rules; waive a rule only on explicit user instruction and identify the waiver.
- CLI edits go directly to `resume.json`, without the chat's ledger or Apply step. Use confirmed facts for the draft; ask about unsupported claims before adding them.
- After editing, run `npx tsx apps/ui/local-manager-next/scripts/check-resume.ts` from `projects/nx-workspace` (optional git ref; default `HEAD`). Fix protected-field, page overflow, fill-band and line-wrap failures. The PDF must fit exactly one US Letter page.
- `notes/personal/personal-software-career-experience.md` is read live by the editor. Preserve `## Skills` (`Skill | Used In`), `## Job Experience` (`Company | Role | Dates | Context`), `## Languages` (`Language | Proficiency`), `## Education` (`Institution | Program | Dates`), and `## Project Contributions` with `### Company — Project — Dates` headings and `Contribution | Description` tables.
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

## Job Application Workflow

When the user pastes a job posting and asks for a tailored resume via the agent CLI:

1. Edit `resume.json` per [Editing](#editing). Report posting requirements the career records do not support (e.g. a missing technology or years of experience) instead of adding them.
2. Run `check-resume.ts` until it passes.
3. Create one folder per application: `$HOME/Desktop/Job Applications/<YYYY-MM-DD>-<Company>-<Job-Title>/`. Use today's date, the company from the posting, and the posting's job title with hyphens (e.g. `2026-10-22-Capgemini-Senior-Backend-Developer`), even where the resume's own title differs (titles are limited to the career note's allowed list).
4. Save the pasted posting as plain text in `<folder>/<YYYY-MM-DD>-job-posting-<Company>-<Job-Title>.txt`, with a `Posting URL: <url>` first line when one was given. Keep the posting's own words and drop only page chrome; the manager's Sample page reads this file by its `-job-posting-` name.
5. Save the gaps between the posting and the candidate as plain text in `<folder>/<YYYY-MM-DD>-gaps-<Company>-<Job-Title>.txt`: one `- ` bullet per posting requirement the career records do not support (a missing technology, too few years, a missing certification or language), as `<requirement> - <what the records lack>`, most important first, using only the facts the records confirm. When nothing is unsupported write a single `- None` bullet. No Markdown styling and no heading; the manager's Sample page lists these bullets and finds the file by its `-gaps-` name. Report the same gaps to the user.
6. Generate the resume PDF from `projects/nx-workspace` into that folder: `npx tsx apps/ui/local-manager-next/scripts/generate-resume-pdf.ts "<folder>/<YYYY-MM-DD>-resume-<Company>-<Job-Title>.pdf"`. The script creates missing folders.
7. Write the cover letter as plain text in `<folder>/<YYYY-MM-DD>-cover-letter-<Company>-<Job-Title>.txt` (no `.md` file; no Markdown styling such as `**bold**`), following the [cover letter template](#cover-letter-template). Follow the same factual rules as the resume: only confirmed facts from `resume.json`, the career note and what the user states, no unsupported posting requirements, no invented figures or motivations.
8. Generate the cover letter PDF next to its source: `npx tsx apps/ui/local-manager-next/scripts/generate-cover-letter-pdf.ts "<folder>/<...>.txt" "<folder>/<YYYY-MM-DD>-cover-letter-<Company>-<Job-Title>.pdf"`. The header title defaults to `resume.json`'s title; pass a title as an optional third argument when regenerating a letter after `resume.json` has changed. It fails when the letter exceeds one page.
9. `resume.json` stays the single working copy and is not committed unless the user asks; tell the user it now holds the tailored version.

## Cover Letter Template

The PDF script adds the resume-style three-column header (resume links left; name and title centered; email, resume phone and `Malmö, Sweden` right), so the text starts at the greeting. Do not name where the job was advertised. Separate blocks with blank lines; `- ` bullets are supported and the text carries no Markdown styling (no `**bold**`, `*italic*` or backticks), because the `.txt` is read and copied as is; the letter must fit one page.

1. `Dear <Company> hiring manager,`
2. One intro paragraph: `I am a <resume title, lowercase> from Malmö writing with interest in the <Job Title> position at <Company>`, then one short sentence (at most about 20 words) in the candidate's own words saying why the company's product, mission or work appeals, drawn from what the posting says but paraphrased: do not copy posting phrases, team names, lists or responsibilities, and make no claims about the candidate beyond the records, then, verbatim in every letter, `I believe my career experience makes me a strong candidate for this position. If you are interested in learning more you can checkout the links above.`
3. `My experiences and reasons to consider me for the position include:` followed by four to six bullets matching the posting's top requirements, most relevant first. The first bullet gives the years of experience as `More than N years` from `calculateWorkExperience`, never `nearly`. For every bullet:
   - Draw evidence from the career note's Job Experience and Project Contributions, not only `resume.json`; the resume is a one-page selection of that note, so use a recorded fact the resume omits when the posting asks for it (e.g. headless CMS work).
   - Name a confirmed skill with the employer or project that evidences it, and include one concrete outcome or figure when the note or resume already records one (never add or inflate figures).
   - Use the posting's key terms (e.g. `event consumers`, `design systems`) as single words or short phrases when the records support them; never lift whole sentences or clauses from the posting.
   - Include one collaboration bullet when the posting asks for teamwork, communication or knowledge sharing, citing recorded evidence (technical leadership, client communication, knowledge-sharing sessions).
   - Include a bullet bridging your closest domain experience to the company's field when it matches (e.g. Capco banking for a financial company).
4. One closing sentence: `I hope to hear from you soon, feel free to contact me anytime, and thank you for your time reading my application.`
5. `Regards,` then `Harry Liu`.
