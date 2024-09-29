# Git Workflows

## Conventions

[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)

```
# Commit Format
COMMIT_TYPE(OPTIONAL_SCOPE): COMMIT_DESCRIPTION

# Branch Format
COMMIT_TYPE/SCOPE-COMMIT_DESCRIPTION

# Commit Types:
fix: # patches a bug in your codebase
feat: # introduces a new feature to the codebase
build: # changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
chore: # changes to the build process or auxiliary tools and libraries such as documentation generation
docs: # documentation only changes
style: # changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
refactor: # a code change that neither fixes a bug nor adds a feature
perf: # a code change that improves performance
test: # adding missing tests or correcting existing tests
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
