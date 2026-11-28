# Markdown Preview Pane

Opt-in edit/preview toggle for notepad-style editors, rendering the text with docs-explorer's `MarkdownViewer`.

## Props

| Prop | Purpose |
| --- | --- |
| `actions` | Extra buttons rendered after the toggle in the pane's top bar (hearth's AI edit button). |
| `className`, `style` | Size the pane; it is a `flex min-h-0 flex-col` wrapper, so the editor and preview flex-fill the space under its top bar. |
| `content` | Text the preview renders. |
| `defaultPreview` | Start in preview (job-hunt-next's demo build). |
| `isLoading` | Disables the toggle button. |
| `markdownPreview` | Default `false`: renders only `renderEditor()`, with no wrapper (unless `actions` is set), button, listener or shortcut. |
| `previewLabel`, `editLabel` | Translated button labels; `(Cmd+Shift+V)` is appended to the `title`/`aria-label`. |
| `renderEditor` | Returns the editor (`SyncedTextEditor`, a plain `Textarea`, or any element); unmounted while previewing. |
| `shortcutEnabled` | Default `true`; turn off while another pane owns the shortcut (hearth's whiteboard while the AI edit dialog is open). |

## Consumers

| App | Surface |
| --- | --- |
| hearth | `WhiteboardEditor` (home, activity notes, kitchen notes, `/whiteboard`) and its AI edit dialog |
| job-hunt-next | Notes page and the career experience editor |
| local-manager-next | `NotepadEditorComponent` and Feature Sandbox `NotepadEditorDemo` |
| mobile-manager-next | `NotepadEditor` on the home Notepad tab |
| notepad-react | `NotepadPage` |
| react-sandbox | `NotepadDemo` (prop off and on) |
| whiteboard | The shared board in `WhiteboardApp` |

## Nuances

- The toggle and `actions` sit in a 32px (`h-8`, the height of a `sm` button), right-aligned, borderless top bar above the editor or preview in both modes, so the buttons never move when toggling and neither the editor nor the preview needs top padding to clear them. Size action buttons `sm` to keep the bar one row.
- Cmd/Ctrl+Shift+V (`event.code === 'KeyV'`, so layouts and Shift's uppercase `key` do not matter) toggles in both directions. The editor is unmounted while previewing, so the listener is on `document`; it ignores events from inputs, textareas, selects and contenteditable elements outside the pane. Plain Cmd/Ctrl+V never matches, so paste is untouched.
- Trade-off: Cmd/Ctrl+Shift+V is the browser's paste-as-plain-text, which the pane's `preventDefault` disables while `markdownPreview` and `shortcutEnabled` are on, including inside the pane's editor.
- With `markdownPreview` off the wrapper is skipped, so size the editor itself; with it on, size the pane (see `NotepadDemo`).
- Host apps must scan `docs-explorer` and `react-lib-higher-level` sources in their Tailwind `content` and load `@tailwindcss/typography`, or the preview renders unstyled.
