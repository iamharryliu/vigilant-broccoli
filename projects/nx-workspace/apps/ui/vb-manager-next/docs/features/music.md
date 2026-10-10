# Music

## Overview

- `/music` page (sidebar entry, `SIDEBAR_ROUTE.MUSIC`) hosts the Metronome from `@vigilant-broccoli/react-music-lib` and the DJ Music utility (`src/app/components/utilities/dj-music.utility.tsx`) each in its own card, side by side (DJ Music left, Metronome right) in one row at every width (`grid-cols-2`, `min-w-0` cells that scroll horizontally if a card's content is too wide)
- Both used to live in the Utilities modal; they were moved here so music tools sit together
