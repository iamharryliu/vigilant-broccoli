# Keyboard toolbar

- `AppShell` (`src/app/components/app-shell.tsx`) renders react-lib's `KeyboardAccessoryToolbar` on phones only (`isPhoneUserAgent` from common-browser, resolved after mount; tablets, iPad and desktop never see it).
- The toolbar shows while a text input, textarea or contenteditable has focus and sits above the on-screen keyboard using `window.visualViewport`. Its `pointerdown` is prevented so tapping keeps focus and the keyboard open.
- Enter (`pressEnter` in react-lib) inserts a newline in textareas and contenteditable through `execCommand`, so React and the Notepad `SyncedTextEditor` see a normal input event. In single-line inputs it dispatches an Enter `keydown` and calls `requestSubmit` on the enclosing form unless the keydown was prevented.
- Modelled on the web terminal toolbar in `infrastructure/code-server/web-terminal/public`.
