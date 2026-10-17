# Sidebar

- `AppSidebar` (`src/app/components/sidebar.tsx`) renders the react-lib-higher-level `Sidebar` as a drawer on phones and an icon rail from `md` up, with Home, Apps and an expandable Agentic group, plus Sign out in the footer.
- Agentic lists the links registry's `Agentic` subgroup: one link per manual agentic workflow's GitHub Actions page, where the workflow is started with "Run workflow". The app never dispatches workflows itself. Each link opens in a new tab, and the home Quick Links tab excludes that subgroup so the links are listed once.
