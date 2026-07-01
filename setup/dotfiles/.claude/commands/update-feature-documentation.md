Update or create a docs/features/this-feature.md to reflect changes in this conversation. Feature docs should live under the most relevant application's directory (e.g. `apps/my-app/docs/features/`), not at the workspace root.

Keep it as slim as possible:

- Headers + bullet points only — no prose paragraphs
- One line per behaviour — omit anything obvious or derivable from the code
- No implementation details unless they explain a non-obvious constraint or decision
- No file path tables, env var lists, or "key files" sections unless critical to using the feature

Then double check the doc against the actual code and fix anything that is incorrect (file paths, names, env vars, endpoints, defaults, behavior).
