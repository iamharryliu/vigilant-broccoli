# Runner

## Overview

- A run spawns `claude -p "/job-application …"` in the skill workdir with the posting, its URL and a runner note naming every file location, so the same skill works in the container and under `nx serve`
- The workdir holds the portable skill (`skill/job-application/SKILL.md`, copied to `.claude/skills/`) and its scripts bundled by `scripts/build-skill-scripts.mjs` into `skill-scripts/*.cjs`: `generate-resume-pdf`, `generate-cover-letter-pdf` and `check-resume`. They render the mounted resume with `@vigilant-broccoli/resume`
- `check-resume` compares against a copy of the resume taken when the run starts (`resume.baseline.json` in the state directory): name, contact details, location and links stay, the title must be one listed in the career experience's Job Experience `Role` cells, and employers, roles and dates stay unless the resume had no work history yet
- Tools are limited to Read, Edit, Write, the three scripts, `mkdir`, `ls` and `date`; `--add-dir` grants the career, state and Job Applications folders
- Application questions finish with the answer as the last message; `/runs` lists the 20 newest runs with their output and a Copy button, polling every 3 seconds. A toast reports a finished or failed run on any page
- Run history is SQLite (`node:sqlite`) in the state directory

## Locations

| Variable | Container | `nx serve` default |
| --- | --- | --- |
| `CAREER_DIR` | `/career` | `~/.job-applications/career` |
| `CAREER_EXPERIENCE_PATH` | `$CAREER_DIR/career-experience.md` | same |
| `JOB_APPLICATIONS_DIR` | `/data` | `~/Desktop/Job Applications` |
| `RESUME_PATH` | `$CAREER_DIR/resume.json` | same |
| `SKILL_WORKDIR` | `/opt/skill-workdir` | `dist/apps/ui/job-applications-next/skill-workdir` |
| `STATE_DIR` | `/state` | `~/.job-applications` |
| `TEMPLATES_DIR` | `/app/templates` | `templates` |
