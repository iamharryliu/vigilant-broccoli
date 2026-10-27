# Agent Context — job-hunt-next

## Table of Contents

- [Nuances](#nuances)
  - [The image must not ship the owner's resume.json](#the-image-must-not-ship-the-owners-resumejson)

Keep `skill/job-application/SKILL.md` in step with the job application workflow and cover letter template in `libs/@vigilant-broccoli/resume/src/CONTEXT.md`, minus the owner-specific details (name, city, repo paths, clipboard).

## Nuances

### The image must not ship the owner's resume.json

`@vigilant-broccoli/resume`'s barrel imports the owner's `resume.json`, so any import of the lib would bundle it. `next.config.js` and `scripts/build-skill-scripts.mjs` alias it to `templates/resume.json`, and `outputFileTracingExcludes` stops Next's file tracing from copying the real file into `.next/standalone` anyway, which it did despite the alias. `check-personal-data` (`scripts/check-personal-data.mjs`), which `deploy-container` runs before pushing the public image, fails if the owner's email or phone from that file appears in the standalone, static, `skill-workdir` or `templates` output. If it fails after a build or dependency change, find which import or traced file brought the real `resume.json` back before publishing.

Vercel also traces the repository root `package.json`, whose maintenance scripts contain owner contact details. Keep that manifest in `outputFileTracingExcludes`; otherwise the same privacy gate blocks the demo upload.
