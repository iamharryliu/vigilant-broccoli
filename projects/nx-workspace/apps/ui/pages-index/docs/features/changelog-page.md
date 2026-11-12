# Changelog page

`/changelog` renders the repository's `CHANGELOG.md` from `raw.githubusercontent.com` (main) through the shared `ReadmePage`, with a **View on GitHub** link, and the home page shows a Changelog card right after the README card. The file is plain Markdown because `MarkdownViewer` renders no raw HTML; `<details>` collapsibles would show as literal tags.

`cron-agentic-pr-create-changelog` writes the entries and advances the `changelog-through` marker; see [agent-support](../../../../../../../docs/agent-support.md).
