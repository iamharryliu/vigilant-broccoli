---
name: job-application
description: Tailor the user's resume.json to a pasted job posting and generate the resume and cover letter PDFs into a per-application folder, or answer a pasted application question, using the job-applications-next app's mounted career files.
---

Portable copy of the vigilant-broccoli `job-application` skill for the job-applications-next image. Every file location comes from the prompt's runner note; use those paths, never `~/Desktop` or repo paths. The resume schema and PDF rendering come from `@vigilant-broccoli/resume`, bundled into the scripts.

The arguments are either a pasted job posting (optionally with notes such as target title, company or extra facts) or an application question (see [Answering application questions](#answering-application-questions)).

## Facts

- Facts come only from the career experience file, the resume and what the arguments state. Never invent metrics, tools, employers, titles, years or motivations.
- Skills require a `## Skills` row or explicit `## Project Contributions` evidence. Do not infer experience from reference links.
- Report posting requirements the records do not support instead of adding them. Do not edit the career experience file; the user records new facts on the app's Career page.

## Tailoring for a posting

1. Read the career experience file and the resume.
2. Edit the resume in place:
   - Keep `basics.name`, `email`, `phone`, `location` and `links` exactly as they are.
   - `basics.title` must be one of the titles in the career experience's Job Experience `Role` cells (separated by `; `).
   - Keep every work and project entry's company, role and dates. When the resume has no work experience yet, build it from the career experience's Job Experience rows.
   - Tailor the summary and bullets to the posting with confirmed facts. Wrap key skills in `**bold**`.
   - The summary is one sentence giving the title and years of experience, then one sentence starting `Expertise in` naming three to six confirmed skill areas relevant to the posting.
3. Run `node skill-scripts/check-resume.cjs` until it passes. It fails on protected-field changes and when the PDF does not fill exactly one US Letter page; shorten or extend bullets to fix it.
4. Create one folder per application in the Job Applications folder: `<YYYY-MM-DD>-<Company>-<Job-Title>/`, with today's date (from `date +%F`), the company from the posting and the posting's job title with hyphens (e.g. `2026-10-22-Acme-Senior-Backend-Developer`).
5. Save the posting as plain text in `<folder>/<YYYY-MM-DD>-job-posting-<Company>-<Job-Title>.txt`, with a `Posting URL: <url>` first line when one was given. Keep the posting's own words; drop only page chrome. The app finds it by its `-job-posting-` name.
6. Save the gaps as plain text in `<folder>/<YYYY-MM-DD>-gaps-<Company>-<Job-Title>.txt`: one `- ` bullet per posting requirement the records do not support, as `<requirement> - <what the records lack>`, most important first. Write a single `- None` bullet when nothing is unsupported. No heading or Markdown styling.
7. Generate the resume PDF: `node skill-scripts/generate-resume-pdf.cjs "<folder>/<YYYY-MM-DD>-resume-<Company>-<Job-Title>.pdf"`.
8. Write the cover letter as plain text in `<folder>/<YYYY-MM-DD>-cover-letter-<Company>-<Job-Title>.txt` following the [cover letter template](#cover-letter-template), with no Markdown styling.
9. Generate its PDF: `node skill-scripts/generate-cover-letter-pdf.cjs "<folder>/<...>.txt" "<folder>/<YYYY-MM-DD>-cover-letter-<Company>-<Job-Title>.pdf"`. It fails when the letter exceeds one page.
10. Finish with the folder name, what changed in the resume, the unsupported requirements and the claims the user should verify.

## Cover letter template

The PDF script adds a header with the resume's links, name, title and contact details, so the text starts at the greeting. Separate blocks with blank lines; `- ` bullets are supported.

1. `Dear <Company> hiring manager,`
2. One intro paragraph: `I am a <resume title, lowercase> writing with interest in the <Job Title> position at <Company>`, then one short sentence (at most about 20 words) on why the company's product, mission or work appeals, paraphrased from the posting, then `I believe my career experience makes me a strong candidate for this position.`
3. `My experiences and reasons to consider me for the position include:` followed by four to six bullets matching the posting's top requirements, most relevant first. The first gives the years of experience as `More than N years`. Each names a confirmed skill with the employer or project that evidences it, and one recorded outcome or figure when one exists. Use the posting's key terms only where the records support them; never copy its sentences.
4. `I hope to hear from you soon, and thank you for your time reading my application.`
5. `Regards,` then the resume's `basics.name`.

## Answering application questions

When the arguments are an application form question instead of a posting, skip tailoring:

1. Read the career experience file and the resume.
2. Write one first-person paragraph of about 130-200 words covering every part of the question with the best-fitting recorded project. Where the records do not cover a part, say so or name the closest supported example and how it differs.
3. End with one line on what the user should verify, a blank line, then the answer alone, so the user can copy it from the app's Runs page.
