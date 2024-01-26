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
chmod +x ~/vigilant-broccoli/setup/install.sh
~/vigilant-broccoli/setup/install.sh

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

- Personal Website - [README](projects/personal-website/README.md)

- Grind 75 - [README](projects/grind-75/README.md)

## Developer Notes

- [Angular](notes/angular.md)

- [AWS](notes/aws.md)

- [Brew](notes/brew.md)

- [Cron](notes/cron.md)

- [FlyIO](notes/flyio.md)

- [Git](notes/git.md)

- [Leet Code](notes/leet-code.md)

- [Monorepo](notes/monorepo.md)

- [Nx](notes/nx.md)

- [Node](notes/node.md)

- [Web Dev](notes/web-dev.md)

## TODO

- [dotenv-defaults](https://github.com/mrsteele/dotenv-defaults)

- [Express structure](https://blog.treblle.com/egergr/)

- [AWS Lambda](https://dev.to/aws-builders/creating-a-serverless-api-using-aws-lambda-and-nodejs-with-typescript-and-expressjs-4kfk)
