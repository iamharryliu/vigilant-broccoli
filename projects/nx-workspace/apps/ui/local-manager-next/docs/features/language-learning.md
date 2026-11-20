# Language Learning

Demo page that generates vocabulary sessions, speaks them and tracks mastered words.

## Speak on Select

Selecting text in the page speaks it with no extra click, through the same `useTextToSpeech` call as the speaker buttons, at the chosen speed and the target language of the session or mastered card holding the selection.

| Rule | Behavior |
| --- | --- |
| Trigger | `mouseup`/`touchend` inside the demo root, handled by `useSpeakOnSelect` |
| Language | Closest ancestor with `data-speech-language` (session card, mastered card); no such ancestor means no speech |
| Replacement | A new selection replaces playing audio; clearing the selection leaves it playing |
| Skips | Collapsed or blank selections, over 500 characters, and selections starting or ending in an input, textarea, button or contenteditable |
| Audio id | `selection`, so no speaker button shows as playing |

## Nuances

- Example-sentence words are buttons, so tapping one opens its definition without speaking; dragging across them selects text but is skipped when either end sits in a word button, so select from the surrounding sentence text to speak it.
- The listener is scoped to the demo's root element only; selections elsewhere in the app never speak.
