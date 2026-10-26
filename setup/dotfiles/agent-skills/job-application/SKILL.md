---
name: job-application
description: In vigilant-broccoli, tailor resume.json to a pasted job posting and generate the resume and cover letter PDFs into a per-application folder under ~/Desktop/Job Applications, or answer a pasted application question and copy the answer to the clipboard.
---

Use the current vigilant-broccoli Git root. Outside this repo, ask which checkout to use; never default to the skill installation checkout.

Run only on explicit `job-application` invocation. The arguments are either a pasted job posting (optionally with notes such as target title, company or extra facts) or an application question (see Answering application questions). Without either, ask for it.

## Tailoring for a posting

1. Read `projects/nx-workspace/libs/@vigilant-broccoli/resume/src/CONTEXT.md` and follow its [Job Application Workflow](../../../../projects/nx-workspace/libs/@vigilant-broccoli/resume/src/CONTEXT.md#job-application-workflow) and Editing rules exactly: they own the folder naming, commands, checks and the factual rules for the resume and cover letter. Run the commands from `projects/nx-workspace`.
2. Read the editor rules and career note that file points to before editing `resume.json`.
3. Report posting requirements the career records do not support instead of adding them. Ask before recording a new fact in the career note; confirmed facts go there before they appear in the resume.
4. Finish with the application folder path, what changed, the unsupported requirements, claims the user should verify, and that `resume.json` now holds this tailored version. Do not commit.

## Answering application questions

When the arguments are an application form question (for example "Describe a project where...") instead of a job posting, skip the tailoring workflow and answer it:

1. Read `resume.json` and the career note named in the resume `CONTEXT.md`, plus any posting or folder from this conversation for context. Facts come only from those and what the user states; never invent metrics, tools, incidents, titles or years.
2. Write the answer as one brief paragraph (about 130-200 words) in first person, covering every part the question asks for, using the concrete project that fits best. Where the records do not cover a part, say so honestly in the answer or pick the closest supported example and name the difference (for example a different cloud) instead of overstating.
3. Copy only the answer text to the clipboard with `pbcopy` (via a temporary file or heredoc, with no extra commentary), then check it with `pbpaste`.
4. Reply briefly: that it is on the clipboard, which project it uses, and what the user should verify, such as estimated years of experience, a missing requirement or an example that is adjacent rather than exact. Offer to swap in a real example if the user has one.
