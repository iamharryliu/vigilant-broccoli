# Git Workflows

## Conventions

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)

```
# Commit Format
COMMIT_TYPE(OPTIONAL_SCOPE): COMMIT_DESCRIPTION

# Branch Format
COMMIT_TYPE/SCOPE-COMMIT_DESCRIPTION

# Commit Types:
fix:
feat:
build:
chore:
ci:
docs:
style:
refactor:
perf:
test:
```

## Rebasing

[Git Pull Rebase](https://www.youtube.com/watch?v=xN1-2p06Urc&list=WL&index=29)

```
git pull --rebase
git rebase --continue
git rebase --abort
```

## Undoing a Commit

```
git push origin [COMMIT_HASH]:refs/heads/[BRANCH_NAME] --force
```
