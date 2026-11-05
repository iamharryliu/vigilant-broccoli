# Tabs

- `TabsList` draws one highlight pill behind the triggers and slides it (200ms, `translateX` and width) to the active trigger, so every tab set animates without per-app code. Triggers only change text color when active.
- The pill is measured from the `data-state="active"` trigger on mount, on `data-state` changes and on list resize. The first measurement skips the transition so the pill does not slide in from the left edge, and `prefers-reduced-motion` disables the transition.
- A `TabsList` with no active trigger hides the pill.
