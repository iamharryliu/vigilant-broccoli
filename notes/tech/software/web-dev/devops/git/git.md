# Git

## Table of Contents

- [Commands](#commands)
- [Merge Strategies](#merge-strategies)
- [Rebasing](#rebasing)
- [Undoing a Commit](#undoing-a-commit)
- [Tags](#tags)
- [Subtrees](#subtrees)
- [Git Magic](#git-magic)
  - [Ignore file changes](#ignore-file-changes)
- [Passphrase](#passphrase)
- [Security](#security)
- [References](#references)

## Commands

```
git checkout -b [branch_name]
git add [files]
git commit -m [message]
git push

# Fix filepath.
git mv -f FILEPATH NEW_FILEPATH

# Remove git history for specific file.
git-filter-repo --sensitive-data-removal --invert-paths --path README.md


# Push to new repo
git remote add NEW_REPO_URL
git remote -v
git push new-origin main      # Push main branch.
git push new-origin --all     # Push all branches.
git remote remove origin
git remote rename new-origin origin

# Remote URL - read and update
git remote get-url origin
git remote set-url origin NEW_REPO_URL
```

## Merge Strategies

| Strategy           | Description                                                                                                                                                         | Command                        | Why choose                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fast-forward merge | Moves the target branch pointer forward when it has no new commits of its own; no merge commit is created and history stays linear.                                 | `git merge --ff-only [branch]` | Choose for a clean linear history when the target hasn't moved; `--ff-only` refuses to merge otherwise, so nothing unexpected is created.                |
| Merge commit       | Joins two branches with a new commit that has two parents; preserves the full branch history and never rewrites existing commits, so it is safe on shared branches. | `git merge --no-ff [branch]`   | Choose when the branch's history and merge point matter, or the branch is shared; it is the safest option and easy to revert as a unit.                  |
| Rebase             | Replays the branch's commits on top of another base, creating new commits for a linear history; rewrites history, so avoid it on commits others have pulled.        | `git rebase origin/main`       | Choose to update a private feature branch onto the latest main or tidy commits before review, giving a linear history that is easier to bisect and read. |
| Squash merge       | Combines all of a branch's changes into one new commit on the target; the branch's individual commits are not kept and no merge relationship is recorded.           | `git merge --squash [branch]`  | Choose when a branch has noisy work-in-progress commits and one commit per feature is wanted; this keeps main concise and easy to revert.                |

## Rebasing

[Git Pull Rebase](https://www.youtube.com/watch?v=xN1-2p06Urc)

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

## Subtrees

```
git subtree add --prefix=[filepath] [repo_url] [branch_name]
git subtree pull --prefix=[filepath] [repo_url] [branch_name] --squash
git subtree push --prefix=[filepath] [repo_url] [branch_name]
```

## Git Magic

### Ignore file changes

```
git update-index --assume-unchanged <file>
git update-index --no-assume-unchanged <file>
# List of files assumed unchanged
git ls-files -v | grep '^h'
```

## Passphrase

```
eval $(ssh-agent)
ssh-add
ssh-add -K # macOS
ssh-add ~/.ssh/id_rsa # Ubuntu
```

_~/.ssh/config_

```
Host *
    UseKeychain yes
```

## Security

```
gitleaks detect --source=. --verbose
```

## References

- Commits
  - [Commit Conventions](https://www.conventionalcommits.org/en/v1.0.0/)
  - [Commit Types](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md#type)
- Git Providers
  - [Gitlab](./gitlab/gitlab.md)
