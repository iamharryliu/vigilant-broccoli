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
`README.md` carries a reworded opening sentence from its own template; `pnpm repo-stats` rewrites both, and the
`repo-stats` pre-commit hook (run by `ci-pr-check`) fails when either is stale.
Its counts and their sources are listed under the root README's managed line in
[app-readme-pattern.md](../../../../../docs/app-readme-pattern.md#aggregate).

The resume PDF (`scripts/generate-resume.ts`, from `@vigilant-broccoli/resume`) must stay on one page — generation throws otherwise and `pre-build` fails. Its repo-stats bullet in `resume.json` has its counts rewritten by `pnpm repo-stats` (run by the pre-commit hook) and should stay a single line, so trim wording rather than adding a line when the counts grow.
