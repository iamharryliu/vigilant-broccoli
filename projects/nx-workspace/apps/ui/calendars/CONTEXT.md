# Agent Context — projects/nx-workspace/apps/ui/calendars

## Table of Contents

- [Nuances](#nuances)
  - [Constants imported from a `'use client'` module are `undefined` in server components](#constants-imported-from-a-use-client-module-are-undefined-in-server-components)

## Nuances

### Constants imported from a `'use client'` module are `undefined` in server components

`CALENDAR_SECTION_STATE` was first exported from `CalendarSection.tsx` (a
client component) and read by the server component that passes `state={ERROR}`.
A server component importing from a client module receives a client reference,
not the value, so `CALENDAR_SECTION_STATE.ERROR` evaluated to `undefined`, the
prop fell back to its default, and a failed Supabase read rendered as "No event
calendars yet". Types, lint and the build all passed. Keep every const shared
between server and client components in a module without `'use client'` (here
`src/lib/calendars.consts.ts`), and verify the failed-load state against a
failing database rather than by reading the code.
