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
git subtree add --prefix=<subtree-name> <repository-url> <branch-name>
git subtree pull --prefix=<subtree-name> <repository-url> <branch-name> --squash
git subtree push --prefix=<subtree-name> <repository-url> <branch-name>
```
