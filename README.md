# vigilant-broccoli

## About

vigilant-broccoli is my personal mono-repo that I use to house all the code (or most) that I am working on.

## Machine Setup

### Mac

```
# Install Brew and Git.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc
brew install git
```

```
# Clone monorepo and run install script.
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git
chmod +x ~/vigilant-broccoli/setup/mac/install.sh
~/vigilant-broccoli/setup/mac/install.sh
```

## Commands

### General

```
npm run install-all
npm run monitor-projects
```

### Personal Website

```
npm run serve:personal-website
npm run e2e:personal-website
```

## Projects

- [Personal Website](projects/personal-website/)

## Notes

### General

- [Cooking](notes/cooking.md)

### Software

- [Design Patterns](notes/design-patterns.md)
- [Leet Code](notes/leet-code.md)

### Shell

- [Brew](notes/os/brew.md)
- [Cron](notes/os/cron.md)
- [Find](notes/os/find.md)
- [Grep](notes/os/grep.md)
- [Vim](notes/os/vim.md)

### Web Dev

- [Javascript](notes/web-dev/javascript.md)
- [Node](notes/web-dev/node.md)
- [Nx](notes/web-dev/nx.md)
- [Frontend](notes/web-dev/frontend/frontend.md)
- [Backend](notes/web-dev/backend/backend.md)
- [Postgres](notes/postgres.md)
- [Devops](notes/web-dev/devops/devops.md)
- [Network Security](notes/network-security/network-security.md)

## TODO

- vc
  - fix: vibecheck-flask test cases
- vc lite
  - refactor vc-lite-express error handling
  - new getRecommendation fn for current weather

## Not Coding

- Q1 - important + urgent
  - comviq phone plan
  - skanetrafiken cc issue
  - handle visa application
- Q2 - important + not urgent
  - being myself
  - add devops to resume
  - learn tmux
- Q3 - not important + urgent
- Q4 - not important + not urgent
  - scanwich
  - cafe hopping
