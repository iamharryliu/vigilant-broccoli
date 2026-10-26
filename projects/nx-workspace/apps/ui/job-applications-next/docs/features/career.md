# Career

## Overview

- `/career` edits the two files every run reads, in tabs:
  - Career experience: Markdown with an Edit/Preview toggle. Saving requires the `## Skills` (`Skill | Used In`), `## Job Experience` (`Company | Role | Dates | Context`), `## Project Contributions` (`### Company — Project — Dates` blocks whose table starts with `Contribution`), `## Languages` (`Language | Proficiency`) and `## Education` (`Institution | Program | Dates`) sections. Problems are listed while typing and checked again on save
  - Resume: `resume.json` as text, validated against the `@vigilant-broccoli/resume` schema on save. `basics.location` is shown in the PDF headers
- A file that does not exist yet is created from `templates/` on first read, so a user who mounts nothing edits blank templates kept in the career volume
- Each tab shows where its file is stored

## API

- `GET /api/career?kind=career-experience|resume` returns `{ content, path }`; `PUT` with `{ content }` saves it or returns `{ error, errors }`
