alias initnpm='rm -rf node_modules package-lock.json && npm i'
alias rmdist='rm -rf dist'
alias initnpmserve='initnpm && npm run serve'
alias installall='npm run install-all'

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
