# Agent Context — apps/ui/personal-website-react

`src/app/content/about.md` is not just the about page's content — it is also
the source of truth for the `iamharryliu/iamharryliu` GitHub profile README.
`.github/workflows/deploy-github-profile.yml` copies it verbatim to that repo
on every push to `main` that touches it. If this file moves or is renamed,
update both the `paths:` trigger filter and the `cp` source line in that
workflow in the same change — otherwise the workflow's path filter stops
matching and the profile silently stops syncing, with no CI error.

The paragraph between `<!-- managed:repo-stats:start -->` and
`<!-- managed:repo-stats:end -->` is generated — never hand-edit it. The root
`README.md` carries the same line; `pnpm repo-stats` rewrites both, and the
`repo-stats` pre-commit hook (run by `ci-pr-check`) fails when either is stale.
Its counts and their sources are listed under the root README's managed line in
[app-readme-pattern.md](../../../../../docs/app-readme-pattern.md#aggregate).
