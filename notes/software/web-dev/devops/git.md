# Git

## Conventions

```
Commits
<type>(optional_scope): <description>

Branch Naming
<type>/<scope>-<description>
```

#### Commit Types

```
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

## Flows

### [Git Pull Rebase](https://www.youtube.com/watch?v=xN1-2p06Urc&list=WL&index=29)

```
git pull --rebase
git rebase --continue
git rebase --abort
```

## Subtrees

```
git subtree add --prefix=[filepath] [repo_url] [branch_name]
git subtree pull --prefix=[filepath] [repo_url] [branch_name] --squash
git subtree push --prefix=[filepath] [repo_url] [branch_name]
```

## Commands

```
git checkout -b [branch_name]
git add [files]
git commit -m [message]
git push
```

### Undos
```
git push origin [COMMIT_HASH]:refs/heads/[BRANCH_NAME] --force
```

## Git Magic

### Ignore file changes

```
git update-index --assume-unchanged <file>
git update-index --no-assume-unchanged <file>
# List of files assumed unchanged
git ls-files -v | grep '^h'
```
