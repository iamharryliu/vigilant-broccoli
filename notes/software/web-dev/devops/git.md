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

```
# Add to .gitignore but keep file.
git update-index --assume-unchanged <file>
```
