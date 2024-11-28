# Git

## Commands

```
git checkout -b [branch_name]
git add [files]
git commit -m [message]
git push

# Fix filepath.
git mv -f FILEPATH NEW_FILEPATH
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

[Git keeps asking me for my ssh key passphrase](https://stackoverflow.com/questions/10032461/git-keeps-asking-me-for-my-ssh-key-passphrase)
