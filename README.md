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

### Web Dev

- [Javascript](notes/web-dev/javascript.md)
- [Node](notes/web-dev/node.md)
- [Nx](notes/web-dev/nx.md)
- [Frontend](notes/web-dev/frontend/frontend.md)
- [Backend](notes/web-dev/backend/backend.md)
- [Devops](notes/web-dev/devops/devops.md)
- [Network Security](notes/network-security/network-security.md)

## TODO

- tools
  - tmux
  - vim
- vc lite
  - refactor vc-lite-express error handling
  - refactor to use current data for outfit recommendation
- personal website
  - fix frontend app loading
  - e2e
    - error testing
    - fix intercept, it stubs the request
- build

  - fix: vibecheck-flask test cases
  - [Nx scripts](https://www.youtube.com/watch?v=PRURABLaS8s)
  - Storing .env
  - fixing dotenv defaults
  - cors handling?
  - nx cloud

- not coding
  - working holiday visa
    - sign into cigna and retrieve
    - retrieve bank statement
    - submit documents to migration office
  - Valentine's day
    - bowling @8:30, show up for 8??
  - scanwich
  - cafe hopping
- career
  - add devops to resume
