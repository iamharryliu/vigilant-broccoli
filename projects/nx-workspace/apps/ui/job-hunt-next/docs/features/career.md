# Career

## Overview

- The Career experience (`/?tab=career-experience`) and Resume (`/?tab=resume`) sidebar sections edit the two files every run reads:
  - Career experience: Markdown with an Edit/Preview toggle. Saving requires the `## Skills` (`Skill | Used In`), `## Job Experience` (`Company | Role | Dates | Context`), `## Project Contributions` (`### Company — Project — Dates` blocks whose table starts with `Contribution`), `## Languages` (`Language | Proficiency`) and `## Education` (`Institution | Program | Dates`) sections. Problems are listed while typing and checked again on save
  - Resume: `resume.json` as text, validated against the `@vigilant-broccoli/resume` schema on save. `basics.location` is shown in the PDF headers
- The Resume section's PDF mode renders the editor's current text, saved or not, through the application PDF script and shows it in a frame, so you can check the one-page fit before saving. It posts to `POST /api/career/preview` and is hidden in the demo; a resume that overflows one page shows the render error instead
- A file that does not exist yet is created from the sample in `templates/sample/` on first read: a fictional mid-senior full stack developer, so a user who mounts nothing sees the expected detail. Job application runs refuse while the resume's email is blank or the sample's
- Each section has Save and Reset buttons. Reset opens a step dialog: picking an option shows its upload form or a confirmation with a Back button, and each option replaces the saved file:
  - Upload: pasted text and an optional `.txt`, `.md`, `.json` or `.pdf` file (up to 10 MB) start an import run. Claude formats them into the file's shape using only their facts, checks the result with `validate-career-file`, and the app validates it again before saving. The editor reloads when the run's toast reports it finished
  - Clear: the blank template in `templates/`, keeping the required headings, table columns and resume fields with no entries
  - Sample: the sample profile
- Reset and import refuse while any run is in progress, since runs read and rewrite these files

## API

- `GET /api/career?kind=career-experience|resume` returns `{ content, path }`; `PUT` with `{ content }` saves it or returns `{ error, errors }`
- `POST /api/career/reset?kind=…` with `{ preset: "blank" | "sample" }` replaces the file
- `POST /api/career/import?kind=…` with multipart `text` and/or `file` starts an import run and returns `{ id }`
