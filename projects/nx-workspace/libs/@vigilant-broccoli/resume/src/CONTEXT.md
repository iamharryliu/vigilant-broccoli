# Agent Context — resume

Resume data, PDF rendering and validation shared with job-hunt-next.

## Table of Contents

- [Editing](#editing)
- [Cover Letter Template](#cover-letter-template)

## Editing

- Use confirmed facts for resume drafts; ask about unsupported claims before adding them. The PDF must fit exactly one US Letter page.
- `notes/personal/career/career-experience.md` is read by job-hunt-next. Preserve `## Skills` (`Skill | Used In`), `## Job Experience` (`Company | Role | Dates | Context`), `## Languages` (`Language | Proficiency`), `## Education` (`Institution | Program | Dates`), and `## Project Contributions` with `### Company — Project — Dates` headings and `Contribution | Description` tables.
- Skills require a Skills row or explicit Project Contributions evidence; record newly confirmed facts before using them. Update `Used In` when a skill is used somewhere new. Do not infer experience from reference links or copy References lists into resume bullets. Figures must already be in the resume or confirmed records.
- Career-record table conventions:
  - One skill per row, except user-kept pairs (`MySQL / MariaDB`, `TypeScript / JavaScript`). Alphabetize rows case-insensitively.
  - `Used In` contains company names or `vigilant-broccoli`, separated by `; ` and alphabetized, never role titles or implementation details.
  - Keep project details, outcomes and links in Project Contributions; role-wide or unattributed responsibilities stay in Job Experience. Preserve confirmed responsibilities and outcomes when reorganizing.
  - A Job Experience `Role` cell lists the historical title first, then allowed resume titles separated by `; `; extra allowed titles do not change the historical title.
  - Project sections run newest first; contribution rows are alphabetical. Git activity ranges and `Dates unconfirmed` are not resume dates or durations. Record only user-confirmed claims; keep guesses in the conversation.
- Do not repeat a theme across roles (testing, CI/CD, AI-assisted development, reusable libraries or tools, code review, the same UI or outcome). Give each theme one bullet in the role where it is strongest and drop it from the others; keep every bullet distinct in outcome or skill. Scan the bullets across roles for overlap before running the check.
- When editing the master resume (per-application tailoring stays subtle, see `SKILL.md`), keep bullets distinct within a role: merge bullets that share a system, tool or outcome (a queue into the feature it serves, environments into the infrastructure-as-code bullet), keep related bullets adjacent and put quantified or high-impact bullets first. Aim for about six bullets per role.
- A tool that appears in more than one role or project gets its full detail where it is strongest; other mentions add a different angle (scope, cloud, outcome) and do not repeat the wording or the bold.
- Start bullets with a past-tense verb and state the specific outcome; drop vague scope phrases and clauses that add no evidence.
- Bold technologies, searchable keywords and the figure in a quantified result (`**2s+ to ~200 ms**`); do not bold generic nouns (`internal tools`), labels or whole clauses.
- `OSS Projects` and legacy `Open Source` aliases map to the existing `vigilant-broccoli` experience; preserve its label, role and dates instead of adding a duplicate.
- Keep the summary's single opening role-and-years sentence consistent with the work dates; do not repeat years later.
- After the opener, the summary is one general sentence starting `Expertise in` that names three to six target-relevant confirmed skill areas (bold keywords). No specific projects, employers, integrations or implementation details; those belong in bullets.

## Cover Letter Template

The PDF script adds the resume-style three-column header (resume links left; name and title centered; email, resume phone and `Malmö, Sweden` right), so the text starts at the greeting. Do not name where the job was advertised. Separate blocks with blank lines; `- ` bullets are supported and the text carries no Markdown styling (no `**bold**`, `*italic*` or backticks), because the `.txt` is read and copied as is; the letter must fit one page.

1. `Dear <Company> hiring manager,`
2. One intro paragraph: `I am a <resume title, lowercase> from Malmö writing with interest in the <Job Title> position at <Company>`, then one short sentence (at most about 20 words) in the candidate's own words saying why the company's product, mission or work appeals, drawn from what the posting says but paraphrased: do not copy posting phrases, team names, lists or responsibilities, and make no claims about the candidate beyond the records, then, verbatim in every letter, `I believe my career experience makes me a strong candidate for this position. If you are interested in learning more you can checkout the links above.`
3. `My experiences and reasons to consider me for the position include:` followed by four to six bullets matching the posting's top requirements, most relevant first. The first bullet gives the years of experience as `More than N years` from `calculateWorkExperience`, never `nearly`, and may use the posting's phrase (e.g. `More than 7 years of backend development experience, from ...`). Every other bullet uses the `Requirement: evidence` form. For every bullet:
   - Draw evidence from the career note's Job Experience and Project Contributions, not only `resume.json`; the resume is a one-page selection of that note, so use a recorded fact the resume omits when the posting asks for it (e.g. headless CMS work).
   - Open with a short requirement phrase taken from the posting's own wording (a noun phrase such as `Event-driven architecture` or `Ownership of production systems`, not the whole requirement sentence), then a colon, then the evidence: the employer or project that evidences it plus one concrete outcome or figure when the note or resume already records one (never add or inflate figures).
   - Copy requirement phrases, never full requirement sentences or clauses, and do not open bullets with a repeated lead word such as `Demonstrated`.
   - Use a requirement only when the career records support it; skip unsupported requirements rather than stretching evidence.
   - Include one collaboration bullet in the same form when the posting asks for teamwork, communication or knowledge sharing, citing recorded evidence (technical leadership, client communication, knowledge-sharing sessions).
   - Include a bullet in the same form bridging your closest domain experience to the company's field when it matches (e.g. Capco banking for a financial company).
   - Examples:
     - `Event-driven architecture: RabbitMQ at Tillmobil and in vigilant-broccoli, with durable queues, bounded retries and dead-letter queues.`
     - `Ownership of production systems: two systems end to end at Tillmobil, from Terraform-managed GCP infrastructure through monitoring and incident response.`
4. One closing sentence: `I hope to hear from you soon, feel free to contact me anytime, and thank you for your time reading my application.`
5. `Regards,` then `Harry Liu`.
