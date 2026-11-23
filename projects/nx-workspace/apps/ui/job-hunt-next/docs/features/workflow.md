# Workflow

- Workflow is a sidebar page that shows the Job Hunt Workflow note (`notes/life-skills/career/job-hunt-workflow.md`) through docs-explorer's `MarkdownViewer`: its Mermaid diagram of the five stages, from Job Posting Site to Monitoring Applications, and the table of what each stage is for.
- The note is the single source. `next.config.js` aliases `@notes` to the repository's `notes/` folder and loads that one file as raw text at build time, so edit the note to change the page; `project.json` lists it as a build input so a change rebuilds. The note's text is English only.
- The page uses the app's theme: the viewer re-renders the diagram when the theme changes.
