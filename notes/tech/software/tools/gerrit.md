# Gerrit

Web-based code review system that sits between developers and Git. Every commit goes through a review ("Change") before merging.

## Run Locally (Docker)

```bash
docker run -d \
  --name gerrit \
  -p 8080:8080 \
  -p 29418:29418 \
  gerritcodereview/gerrit
open http://localhost:8080
```

## SSH Setup

```bash
# Add your public key in UI: Settings → SSH Keys
# Test connection
ssh -p 29418 admin@localhost          # local
ssh -p 29418 admin@gerrit.example.com # remote
```

## Clone + Hook Setup

Clones and installs the Change-Id hook in one step:

```bash
git clone "http://localhost:8080/a/test-repository" && \
  (cd "test-repository" && \
  mkdir -p `git rev-parse --git-dir`/hooks/ && \
  curl -fLo `git rev-parse --git-dir`/hooks/commit-msg http://localhost:8080/tools/hooks/commit-msg && \
  chmod +x `git rev-parse --git-dir`/hooks/commit-msg)
```

## Commit & Push for Review

```bash
touch test.txt
git add . && git commit -m "Your message"
git push origin HEAD:refs/for/main
```

## Review in UI

1. http://localhost:8080 → **Changes** → click your change
2. Review diffs, leave inline comments
3. Vote: **Code-Review** (+2 approve / -1 needs work), **Verified** (+1 CI pass)
4. Once approved → **Submit** to merge

## Key Commands

```bash
git push origin HEAD:refs/for/main                         # push for review
git fetch origin refs/changes/34/1234/5 && git checkout FETCH_HEAD  # download a change
# search: status:open owner:self
```

## References

- [Gerrit](https://www.gerritcodereview.com/)
