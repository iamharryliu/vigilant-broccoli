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

- General

  - [Cooking](notes/cooking.md)

- Software

  - [Design Patterns](notes/design-patterns.md)
  - [Leet Code](notes/leet-code.md)

- OS

  - [Brew](notes/brew.md)
  - [Cron](notes/cron.md)
  - [Shell](notes/shell/shell.md)

- [Web Dev](notes/web-dev/web-dev.md)

  - [Javascript](notes/javascript.md)
  - [Node](notes/node.md)
  - [Nx](notes/nx.md)
  - [Frontend](notes/web-dev/frontend/frontend.md)
    - [Angular](notes/web-dev/frontend/angular.md)
    - [React](notes/web-dev/frontend//react.md)
    - [Bootstrap](notes/web-dev/frontend/bootstrap.md)
  - [Backend](notes/web-dev/backend/backend.md)
    - [Express](notes/web-dev/backend/express.md)
  - [Devops](notes/web-dev/devops/devops.md)
  - [Network Security](notes/network-security/network-security.md)

## TODO

- not coding
  - scanwich
  - cafe hopping
- tools
  - tmux
  - vim
- personal website
  - move frontend into nx-workspace
  - refactor vc-lite-express error handling
- build

  - nx cloud
  - fix: vibecheck-flask test cases
  - FlyIO destroy and create apps
  - [Nx scripts](https://www.youtube.com/watch?v=PRURABLaS8s)
  - Storing .env
  - fixing dotenv defaults
  - checkout Vercel/Netlify
  - cors handling?

- docs

  - git docs table of contents
