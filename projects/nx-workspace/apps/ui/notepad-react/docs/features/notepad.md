# Notepad

## Overview

- Multiple notes saved in the browser's `localStorage` under `notepad-react:notes`; nothing leaves the device
- Notes list (newest edit first) beside a `SyncedTextEditor`; the first line is the note's title
- An eye button, or Cmd/Ctrl+Shift+V, toggles a rendered markdown preview of the selected note (react-lib-higher-level's `MarkdownPreviewPane`)
- New note and delete with confirmation; the selected note id persists under `notepad-react:selected`
- Edits in another tab sync through the `storage` event
