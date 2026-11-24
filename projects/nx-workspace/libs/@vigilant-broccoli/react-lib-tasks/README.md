# React Lib Tasks

Google Tasks list (`GoogleTasksComponent`), task capture and its dialog, task sorting helpers, a localStorage adapter for using the list without signing in (`createLocalTasksAdapter`), the shared `/api/tasks/**` route handlers (`@vigilant-broccoli/react-lib-tasks/google-tasks-server`), and the recurring-schedule picker (`TaskScheduleFields`, from `@vigilant-broccoli/react-lib-tasks/task-schedule-fields`) with its pure schedule logic (`@vigilant-broccoli/react-lib-tasks/recurrence`, safe to import from server code).

## Table of Contents

- [Components](#components)
- [Stack](#stack)

## Components

| Component | Demo |
| --- | --- |
| Task Schedule Fields | [View](https://components.vigilant-broccoli.app/task-schedule-fields) |
| Tasks | [View](https://components.vigilant-broccoli.app/tasks) |

## Stack

- Language - TypeScript
- Framework - React
- External libs
  - `@dnd-kit/core`
  - `zod`
- Internal libs
  - `common-js`
  - `google-workspace`
  - `react-lib`
  - `react-lib-checklist`
