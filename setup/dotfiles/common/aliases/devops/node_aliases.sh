# Node
alias initnpm='rm -rf node_modules package-lock.json && npm i'
alias rmdist='rm -rf dist'
alias initnpmserve='initnpm && npm run serve'
alias mynpmpackages='chrome "https://www.npmjs.com/
tings/prettydamntired/packages"'
alias installall='npm run install-all'

export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"
[ -s "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm" ] && \. "/opt/homebrew/opt/nvm/etc/bash_completion.d/nvm"
