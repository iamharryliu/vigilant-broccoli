#!/usr/bin/env python3
"""Shared by every agentic-sandbox runner that opens or edits a PR
(solve-todo-runner.sh, update-pr-runner.sh,
create-todo-runner.sh, create-rnd-runner.sh,
audit-todo-runner.sh) to rewrite a PR body in place: replace the
"## Summary" / "## Next steps" / "## Suggestions" sections with the agent's latest cumulative
description, and append a row to an "## Agentic Change History" table —
creating either if the PR body doesn't have them yet. Reads everything from
the environment (see the CURRENT_BODY/PR_*/HISTORY_* vars below) and prints
the merged body to stdout; the caller passes it to `gh pr create --body` or
`gh pr edit --body`.
"""
import os
import re

CLAUDE_FOOTER = "🤖 Generated with [Claude Code](https://claude.com/claude-code)"
CODEX_FOOTER = "Generated with [Codex](https://openai.com/codex)"

body = os.environ["CURRENT_BODY"]

# The sandbox runners' Claude and Codex paths each sign off with their own
# footer as the body's trailing paragraph — strip it before editing sections
# so it stays last instead of getting stranded above whatever's appended below.
# A body that is nothing but the footer (every runner's fresh PR body) has no leading blank line to match on,
# hence the exact-equality branch.
footer = ""
for candidate in (CLAUDE_FOOTER, CODEX_FOOTER):
    if body == candidate:
        body = ""
        footer = candidate
        break
    suffix = "\n\n" + candidate
    if body.endswith(suffix):
        body = body[: -len(suffix)]
        footer = candidate
        break

# Split into (heading, content) pairs on top-level "## " headings, keeping any
# content that precedes the first heading (there normally is none).
heading_re = re.compile(r"^## (.+)$", re.MULTILINE)
matches = list(heading_re.finditer(body))
sections = []
if matches:
    if matches[0].start() > 0:
        sections.append((None, body[: matches[0].start()]))
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        sections.append((m.group(1).strip(), body[start:end]))
else:
    sections.append((None, body))


def replace_section(name, content):
    for i, (heading, _) in enumerate(sections):
        if heading == name:
            sections[i] = (heading, content)
            return True
    return False


pr_summary = os.environ.get("PR_SUMMARY", "").strip()
pr_next_steps = os.environ.get("PR_NEXT_STEPS", "").strip()

if pr_summary and not replace_section("Summary", pr_summary):
    sections.insert(0, ("Summary", pr_summary))

if pr_next_steps and not replace_section("Next steps", pr_next_steps):
    insert_at = next((i for i, (h, _) in enumerate(sections) if h == "Summary"), -1) + 1
    sections.insert(insert_at, ("Next steps", pr_next_steps))

pr_suggestions = os.environ.get("PR_SUGGESTIONS", "").strip()

if pr_suggestions and not replace_section("Suggestions", pr_suggestions):
    insert_at = (
        next(
            (i for i, (h, _) in enumerate(sections) if h == "Next steps"),
            next((i for i, (h, _) in enumerate(sections) if h == "Summary"), -1),
        )
        + 1
    )
    sections.insert(insert_at, ("Suggestions", pr_suggestions))

history_source = os.environ.get("HISTORY_SOURCE", "").strip()
history_command = os.environ.get("HISTORY_COMMAND", "").strip()
history_prompt = os.environ.get("HISTORY_PROMPT", "").strip()
history_summary = os.environ.get("HISTORY_SUMMARY", "").strip()
history_date = os.environ.get("HISTORY_DATE", "").strip()

if history_source and history_command and history_summary and history_date:
    HISTORY_HEADING = "Agentic Change History"
    HEADER_ROW = "| Date | Source | Command | Prompt | Summary |"
    SEPARATOR_ROW = "| --- | --- | --- | --- | --- |"

    def table_cell(text):
        return text.replace("|", "\\|").replace("\n", "<br>").strip()

    new_row = "| {} | {} | {} | {} | {} |".format(
        table_cell(history_date),
        table_cell(history_source),
        table_cell(history_command),
        table_cell(history_prompt),
        table_cell(history_summary),
    )

    existing_index = next(
        (i for i, (h, _) in enumerate(sections) if h == HISTORY_HEADING), None
    )
    if existing_index is None:
        sections.append(
            (HISTORY_HEADING, "\n".join([HEADER_ROW, SEPARATOR_ROW, new_row]))
        )
    else:
        lines = [
            l for l in sections[existing_index][1].strip().splitlines() if l.strip()
        ]
        data_rows = lines[2:] if len(lines) >= 2 else []
        data_rows.append(new_row)
        sections[existing_index] = (
            HISTORY_HEADING,
            "\n".join([HEADER_ROW, SEPARATOR_ROW] + data_rows),
        )

parts = []
for heading, text in sections:
    if heading is not None:
        parts.append(f"## {heading}")
    stripped = text.strip()
    if stripped:
        parts.append(stripped)
if footer:
    parts.append(footer)

print("\n\n".join(parts))
