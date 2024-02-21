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

## Notes

### General

- [Cooking](notes/cooking.md)

### Software

- [Design Patterns](notes/design-patterns.md)
- [Leet Code](notes/leet-code.md)

### OS

- [Brew](notes/os/brew.md)

### Command Line

- [Cron](notes/os/command-line/cron.md)
- [Find](notes/os/command-line/find.md)
- [Grep](notes/os/command-line/grep.md)
- [Vim](notes/os/command-line/vim.md)

### Web Dev

- [Javascript](notes/web-dev/javascript.md)
- [Node](notes/web-dev/node.md)
- [Nx](notes/web-dev/nx.md)
- [Devops](notes/web-dev/devops/devops.md)
- [Backend](notes/web-dev/backend/backend.md)
- [Database](notes/web-dev/database/database.md)
- [Frontend](notes/web-dev/frontend/frontend.md)
- [Network Security](notes/network-security/network-security.md)

## Todo

### Coding

- reading
  - Redis
  - tmux
- vc
  - fix: vibecheck-flask test cases
- vc lite
  - new getRecommendation fn for current weather
- docs
  - docs for dotnet
  - docs for spring boot

### Not Coding

- Q1 - important + urgent
  - cc issue
    - call cc company
    - comviq phone plan(https://comviq.se/tanka)
    - test skanetrafiken
    - uniqlo marimekko bag, https://www.uniqlo.com/uk/en/product/round-mini-shoulder-bag-466335.html?dwvar_466335_color=COL02&dwvar_466335_size=SIZ999
  - handle visa application
  - practice db server handling
  - taxes
- Q2 - important + not urgent
  - being myself
  - add devops to resume
  - learn tmux
- Q3 - not important + urgent
- Q4 - not important + not urgent
  - scanwich
