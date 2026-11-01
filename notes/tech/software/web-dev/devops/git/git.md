# Git

## Table of Contents

- [Terminology](#terminology)
- [Git Providers](#git-providers)
- [GitLab Package Registry](#gitlab-package-registry)
- [Commands](#commands)
- [Merge Strategies](#merge-strategies)
- [Conventional Commits](#conventional-commits)
- [Git Magic](#git-magic)
  - [Ignore file changes](#ignore-file-changes)
- [Passphrase](#passphrase)
- [References](#references)

## Terminology

| Term | Description |
| --- | --- |
| Branch | A movable pointer to a commit; a line of development isolated from other work. |
| Checkout | Switches the working tree to a branch or commit; `git checkout -b` also creates the branch. |
| Clone | Copies a remote repository, with its full history, to your machine and sets that remote up as `origin`. |
| Commit | A snapshot of the staged changes, saved to history with a message. |
| Fast-forward | A merge that only moves the branch pointer forward because the target has no commits of its own; no merge commit is created. |
| Fetch | Downloads new commits and branches from a remote without changing your working tree or branches. |
| HEAD | A pointer to the commit or branch you currently have checked out. |
| Merge | Combines the histories of two branches, either with a merge commit or by fast-forwarding. |
| Origin | The default name Git gives the remote a repository was cloned from. |
| Pull | Fetches from a remote, then merges (or rebases with `--rebase`) the result into the current branch. |
| Pull request | A provider feature for proposing a branch's changes and reviewing them before they merge; GitLab calls it a merge request. |
| Push | Uploads local commits on a branch to a remote. |
| Rebase | Replays a branch's commits on top of another base, creating new commits and rewriting history. |
| Remote | A named reference to another copy of the repository, usually hosted, such as `origin`. |
| Squash | Combines several commits into one, either during a merge or an interactive rebase. |
| Staging area | Also called the index; where changes wait after `git add` until the next commit. |
| Stash | Shelves uncommitted changes so the working tree is clean, and lets you reapply them later. |
| Subtree | A way to embed another repository's history under a directory of this one without submodules. |
| Tag | A fixed name for a specific commit, typically marking a release. |

## Git Providers

| Provider | Description | Best used for |
| --- | --- | --- |
| Bitbucket | Atlassian's Git hosting, integrated with Jira and Bitbucket Pipelines. | Teams already on Jira and other Atlassian tools. |
| GitHub | The largest Git host, with pull requests, GitHub Actions and the widest open source ecosystem. | Open source projects and general-purpose team collaboration. |
| GitLab | Git hosting with built-in CI/CD that can also be self-hosted. | An all-in-one DevOps platform, or self-hosting for control over code and data. |

## GitLab Package Registry

```
# Set URL for your scoped packages.
# For example package with name `@my-org/my-package` will use this URL for download
@my-org:registry=https://gitlab.com/api/v4/packages/npm/
@my-org/my-package:registry=https://gitlab.com/api/v4/packages/npm/

# Add the token for the scoped packages URL. This will allow you to download
# `@my-org/` packages from private projects.
'//gitlab.com/api/v4/packages/npm/:_authToken'="${GITLAB_AUTH_TOKEN}"

# Add token for uploading to the registry. Replace <your-project-id>
# with the project you want your package to be uploaded to.
'//gitlab.com/api/v4/projects/<your-project-id>/packages/npm/:_authToken'="${GITLAB_AUTH_TOKEN}"
```

[Reference](https://shivamarora.medium.com/publishing-your-private-npm-packages-to-gitlab-npm-registry-39d30a791085)

## Commands

```
git checkout -b [branch_name]
git add [files]
git restore --staged [files]   # Unstage.
git status
git commit -m [message]
git push

git clone [repo_url]
git fetch origin
git pull

# HEAD
git log --oneline -5
git show HEAD
git checkout HEAD~1            # Detaches HEAD one commit back.

# Stash
git stash
git stash list
git stash pop

# Pull request (GitHub CLI)
gh pr create
gh pr view --web

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

# Rebase on main
git fetch origin
git rebase origin/main

git rebase -i
git rebase -i origin/master

git pull --rebase
git rebase --continue
git rebase --abort

git branch backup-branch-name

# Delete git tags.
git tag -d $(git tag)

# Subtrees
git subtree add --prefix=[filepath] [repo_url] [branch_name]
git subtree pull --prefix=[filepath] [repo_url] [branch_name] --squash
git subtree push --prefix=[filepath] [repo_url] [branch_name]

# Undo a commit by resetting a remote branch to a commit.
git push origin [COMMIT_HASH]:refs/heads/[BRANCH_NAME] --force

# Scan for leaked secrets.
gitleaks detect --source=. --verbose
gitleaks detect --report-path gitleaks-report.json
```

## Merge Strategies

| Strategy | Description | Command | Why choose |
| --- | --- | --- | --- |
| Fast-forward merge | Moves the target branch pointer forward when it has no new commits of its own; no merge commit is created and history stays linear. | `git merge --ff-only [branch]` | Choose for a clean linear history when the target hasn't moved; `--ff-only` refuses to merge otherwise, so nothing unexpected is created. |
| Merge commit | Joins two branches with a new commit that has two parents; preserves the full branch history and never rewrites existing commits, so it is safe on shared branches. | `git merge --no-ff [branch]` | Choose when the branch's history and merge point matter, or the branch is shared; it is the safest option and easy to revert as a unit. |
| Rebase | Replays the branch's commits on top of another base, creating new commits for a linear history; rewrites history, so avoid it on commits others have pulled. | `git rebase origin/main` | Choose to update a private feature branch onto the latest main or tidy commits before review, giving a linear history that is easier to bisect and read. |
| Squash merge | Combines all of a branch's changes into one new commit on the target; the branch's individual commits are not kept and no merge relationship is recorded. | `git merge --squash [branch]` | Choose when a branch has noisy work-in-progress commits and one commit per feature is wanted; this keeps main concise and easy to revert. |

## Conventional Commits

| Format | Pattern |
| --- | --- |
| Branch | `COMMIT_TYPE/SCOPE-COMMIT_DESCRIPTION` |
| Commit | `COMMIT_TYPE(OPTIONAL_SCOPE): COMMIT_DESCRIPTION` |

| Type | Description | Example |
| --- | --- | --- |
| build | Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm). | `build(npm): upgrade webpack to v5` |
| chore | Changes to the build process or auxiliary tools and libraries such as documentation generation. | `chore: update .gitignore` |
| docs | Documentation only changes. | `docs(readme): document local setup` |
| feat | Introduces a new feature to the codebase. | `feat(auth): add password reset flow` |
| fix | Patches a bug in your codebase. | `fix: handle empty response from payments API` |
| perf | A code change that improves performance. | `perf(db): add index to users email column` |
| refactor | A code change that neither fixes a bug nor adds a feature. | `refactor(api): rename user endpoints` |
| style | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.). | `style: format files with prettier` |
| test | Adding missing tests or correcting existing tests. | `test(auth): cover expired token case` |

- [Commit Conventions](https://www.conventionalcommits.org/en/v1.0.0/)
- [Commit Types](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md#type)

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

## References

- Rebasing
  - [Git Pull Rebase](https://www.youtube.com/watch?v=xN1-2p06Urc)
