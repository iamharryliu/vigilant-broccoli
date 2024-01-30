# vigilant-broccoli

## About

vigilant-broccoli is my personal mono-repo that I use to house all the code (or most) that I am working on.

## Machine Setup

```
# Install Brew and Git.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
export PATH="/opt/homebrew/bin:$PATH" >> ~/.zshrc
brew install git

# Clone monorepo and run install script.
cd ~ && git clone git@github.com:iamharryliu/vigilant-broccoli.git
chmod +x ~/vigilant-broccoli/setup/brew/install.sh
~/vigilant-broccoli/setup/brew/install.sh

cd ~/vigilant-broccoli
npm i -g recursive-install
npm-recursive-install
pip3 install pre-commit && pre-commit install
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

## Developer Notes

- [Angular](notes/angular.md)

- [AWS](notes/aws.md)

- [Brew](notes/brew.md)

- [Cron](notes/cron.md)

- [Cooking](notes/cooking.md)

- [Design Patterns](notes/design-patterns.md)

- [Express](notes/express.md)

- [FlyIO](notes/flyio.md)

- [Git](notes/git.md)

- [Leet Code](notes/leet-code.md)

- [Javascript](notes/javascript.md)

- [Monorepo](notes/monorepo.md)

- [Network Security](notes/network-security/network-security.md)

- [Nx](notes/nx.md)

- [Node](notes/node.md)

- [Shell](notes/shell/shell.md)

- [Web Dev](notes/web-dev.md)

## TODO

- [Express structure](https://blog.treblle.com/egergr/)

- Nx library testing

- Nx scripts
