# DatePicker

shadcn-style date picker in `libs/@vigilant-broccoli/react-lib`: an outline button that opens `Calendar` in a `Popover` and closes once a day is chosen. `react-lib-tasks`' `TaskScheduleFields` uses it for the Annually schedule.

## Props

- `value`, `onValueChange` — the selected `Date`; the callback receives the clicked day.
- `placeholder`, `formatDate` — trigger text when empty and the formatter for the selected date (default `dateStyle: 'medium'`).
- `startMonth`, `endMonth` — bound the months the calendar pages through.
- `formatCaption` — caption above the grid, such as the month name alone.
- `disabled`, `className`, `id`, `aria-label`.

## Behavior

- A yearless date, as in Annually, is picked in a fixed leap year bounded with `startMonth`/`endMonth` and a month-only `formatCaption`, so Feb 29 stays selectable and no year shows.
