# Changelog page

`/changelog` renders the repository's `CHANGELOG.md` from `raw.githubusercontent.com` (main) through the shared `ReadmePage`, with a **View on GitHub** link, and the home page shows a Changelog card right after the README card. `MarkdownViewer` renders each top-level `<details><summary>` block as an animated `CollapsibleList` item, and `defaultOpenSections` opens the newest month.

Entries are one `<details><summary>Month YYYY</summary>` block per month, newest first (validated by `changelog-check.py`). `cron-agentic-pr-create-changelog` folds each week's merged PRs into the current month and advances the `changelog-through` marker; see [agent-support](../../../../../../../docs/agent-support.md).
