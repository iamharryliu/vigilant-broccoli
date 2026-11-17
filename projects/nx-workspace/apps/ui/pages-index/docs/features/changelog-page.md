# Changelog page

`/changelog` renders the repository's `CHANGELOG.md` from `raw.githubusercontent.com` (main) through the shared `ReadmePage`, with a **View on GitHub** link, and the home page shows a Changelog card right after the README card. Each `## YYYY-MM` section renders as a `CollapsibleList` item through `MarkdownViewer`'s `collapsibleHeadingLevel` (newest month open); the file stays plain Markdown because `MarkdownViewer` renders no raw HTML, so `<details>` would show as literal tags.

Entries are one `## YYYY-MM` section per month, newest first. `cron-agentic-pr-create-changelog` folds each week's merged PRs into the current month and advances the `changelog-through` marker; see [agent-support](../../../../../../../docs/agent-support.md).
