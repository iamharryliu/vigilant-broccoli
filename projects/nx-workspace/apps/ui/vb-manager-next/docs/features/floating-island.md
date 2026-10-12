# Floating Island

## Overview

- Fixed bottom-right translucent container
- Always visible across all pages
- Draggable via pointer events; resets to default position on page refresh

## Blocks

- **Time**: Live clock display
- **Info**: Date and contextual info
- **Weather**: City name, emoji weather status, and temperature; clickable to open the weather dialog (keyboard shortcut: `w`), which renders the shared `LocalWeatherDialog` from `react-lib` (the same UI as `weather-next`), fed by `fetchLocalWeather` (`src/app/utils/local-weather.utils.ts`) over this app's `/api/weather` plus `/api/weather/city` (Nominatim reverse geocoding, best-effort); no preparation badges. The island's inline city/emoji/temperature still comes from `useWeather`

## Dialogs

- Hosts Jarvis, email, calendar, notepad, search, weather, pomodoro, and utilities dialogs, opened through the page layout's controls and keyboard shortcuts
- Runs the shared alarm, timer, and pomodoro engines
- See [Settings](./settings.md) for the keyboard shortcuts cheatsheet

## Drag Behavior

- Drag the island by clicking and dragging any non-interactive area
- 5px movement threshold to distinguish clicks from drags
- Position is clamped to stay within the viewport (including on resize)
- Resets to bottom-right on every page load
- Implementation: `useDrag` hook (`src/app/hooks/useDrag.ts`)
