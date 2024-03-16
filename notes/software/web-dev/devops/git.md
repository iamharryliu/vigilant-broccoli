# Git

## Git Conventions

### Commit conventions

```
<type>[optional scope]: <description>
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

## Subtrees

```
git subtree add --prefix=[filepath] [repo_url] [branch_name]
git subtree pull --prefix=[filepath] [repo_url] [branch_name] --squash
git subtree push --prefix=[filepath] [repo_url] [branch_name]
```

## Commands

```
git checkout -b [branch name]
git add [files]
git commit -m [message]
git push
```

## Git Magic

### Ignore file changes

```
git update-index --assume-unchanged <file>
git update-index --no-assume-unchanged <file>
# List of files assumed unchanged
git ls-files -v | grep '^h'
```
