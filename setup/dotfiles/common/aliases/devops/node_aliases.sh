alias initnpm='rm -rf node_modules package-lock.json && npm i'
alias rmdist='rm -rf dist'
alias initnpmserve='initnpm && npm run serve'

export NVM_DIR="$HOME/.nvm"
nvm() {
    unset -f nvm node npm npx
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    nvm "$@"
}
node() { nvm >/dev/null; node "$@"; }
npm() { nvm >/dev/null; npm "$@"; }
npx() { nvm >/dev/null; npx "$@"; }
