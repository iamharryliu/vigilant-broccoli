# Floating Island

## Overview

- Fixed bottom-right translucent container with backdrop blur
- Always visible across all pages
- Draggable via pointer events; resets to default position on page refresh

## Blocks

- **Time**: Live clock display
- **Info**: Date and contextual info
- **Controls**: Action buttons and mode selector

## Controls

- Jarvis chatbot (with day planning & outfit suggestions)
- Email composer
- Calendar dialog
- Search dialog (keyboard shortcut: `/`)
- Theme toggle (light/dark)
- App mode selector (Personal/Work)

## Drag Behavior

- Drag the island by clicking and dragging any non-interactive area
- 5px movement threshold to distinguish clicks from drags
- Position is clamped to stay within the viewport (including on resize)
- Resets to bottom-right on every page load
- Implementation: `useDrag` hook (`hooks/useDrag.ts`)
