# Agent Context — job-hunt-next

## Table of Contents

- [Nuances](#nuances)
  - [The image must not ship the owner's resume.json](#the-image-must-not-ship-the-owners-resumejson)

Keep the cover letter template in `skill/job-application/SKILL.md` in step with the one in `libs/@vigilant-broccoli/resume/src/CONTEXT.md`, minus the owner-specific details (name, city, repo paths, clipboard). `SKILL.md` owns the job application workflow.

## Nuances

### The image must not ship the owner's resume.json

`@vigilant-broccoli/resume` takes the resume as an argument and never imports the owner's `resume.json`; keep it that way, since the app has no alias or tracing exclude that would stop a new import from bundling it. `check-personal-data` (`scripts/check-personal-data.mjs`), which `deploy-container` runs before pushing the public image, fails if the owner's email or phone from that file appears in the standalone, static, `skill-workdir` or `templates` output. If it fails after a build or dependency change, find which import or traced file brought the real `resume.json` back before publishing.

Vercel also traces the repository root `package.json`, whose maintenance scripts contain owner contact details. Keep that manifest in `outputFileTracingExcludes`; otherwise the same privacy gate blocks the demo upload.
