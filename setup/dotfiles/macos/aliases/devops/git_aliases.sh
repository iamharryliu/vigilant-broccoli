alias openrepo='open "$(git config --get remote.origin.url | sed -E "s/git@github.com:/https:\/\/github.com\//; s/\.git$//")"'
