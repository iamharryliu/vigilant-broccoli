# Agent Context — apps/ui/personal-website-react

`src/app/content/about.md` also supplies the GitHub profile README. If moving it, update both the `paths:` filter and `cp` source in `.github/workflows/deploy-github-profile.yml`; a stale filter silently stops syncing.

Do not hand-edit the `managed:repo-stats` section; `pnpm repo-stats` owns it. See [generated counts](../../../../../docs/app-readme-pattern.md#aggregate).

The resume PDF must remain one page or `pre-build` fails. Before editing its source, read the [resume context](../../../libs/@vigilant-broccoli/resume/src/CONTEXT.md).
