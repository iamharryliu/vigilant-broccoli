# Agent Context — job-applications-next

## Table of Contents

- [Nuances](#nuances)
  - [The image must not ship the owner's resume.json](#the-image-must-not-ship-the-owners-resumejson)

Keep `skill/job-application/SKILL.md` in step with the job application workflow and cover letter template in `libs/@vigilant-broccoli/resume/src/CONTEXT.md`, minus the owner-specific details (name, city, repo paths, clipboard).

## Nuances

### The image must not ship the owner's resume.json

`@vigilant-broccoli/resume`'s barrel imports the owner's `resume.json`, so any import of the lib would bundle it. `next.config.js` and `scripts/build-skill-scripts.mjs` alias it to `templates/resume.json`, and `outputFileTracingExcludes` stops Next's file tracing from copying the real file into `.next/standalone` anyway, which it did despite the alias. After changing the build or adding a lib that reads personal data, rebuild and search `dist/apps/ui/job-applications-next` (standalone, static and `skill-workdir`) for the owner's email and phone before building the image.
