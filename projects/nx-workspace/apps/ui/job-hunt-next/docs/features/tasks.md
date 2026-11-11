# Tasks

- Tasks is a checklist built on react-lib's `CheckList`, opened from the sidebar.
- Tasks live in the `tasks` table of the local SQLite database; adding, checking, renaming and deleting are optimistic and roll back with a toast when the write fails.
- The demo build is read-only and starts empty.
