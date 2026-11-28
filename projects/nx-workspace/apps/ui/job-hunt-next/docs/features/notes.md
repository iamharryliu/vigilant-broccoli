# Notes

- Notes is a single free-text notepad opened from the sidebar.
- Edits save automatically after a short pause, and on leaving the page, to the `notes` table of the local SQLite database.
- An eye button in a thin bar above the textarea, or Cmd/Ctrl+Shift+V, switches the textarea to a rendered markdown preview and a pencil button (or the shortcut) switches back; the preview is not saved separately. It is react-lib-higher-level's shared `MarkdownPreviewPane`, the same one Hearth's whiteboard uses.
- The demo build is read-only and starts empty.
