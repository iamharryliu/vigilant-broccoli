# Git Workflows

## Rebasing

[Git Pull Rebase](https://www.youtube.com/watch?v=xN1-2p06Urc&list=WL&index=29)

```
# Rebase on main
git fetch origin
git rebase origin/main

git rebase -i
git rebase -i origin/master

git pull --rebase
git rebase --continue
git rebase --abort


git branch backup-branch-name
```

## Undoing a Commit

```
git push origin [COMMIT_HASH]:refs/heads/[BRANCH_NAME] --force
```

## Tags

```
# Delete git tags.
git tag -d $(git tag)
```
