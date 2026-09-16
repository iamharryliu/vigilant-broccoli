# Cheatsheet — Shell Aliases

Shell aliases and functions from `setup/dotfiles/`, available in any shell. Print with `cheatsheet` (or `pnpm cheatsheet:aliases`).

```
🐚 SHELL
  initsh                      Reload the shell (source ~/.zshrc or ~/.bashrc)
  cheatsheet                  Print this cheatsheet
  explain_shell '<cmd>'       Open the command on explainshell.com
  spellcheck                  Run codespell

📁 FILES & DIRS
  la / lt / ltr               List all / by newest / by oldest
  lS / lSr                    List by largest / smallest
  .. / ... / ....             Up 1 / 2 / 3 directories
  mkcd <dir>                  Create directory and cd into it
  newfile <path>              Create file (with parents) and open in VS Code
  zipDirs <dir...>            Zip each directory into <dir>.zip
  killport <port>             Kill whatever is listening on a port

🔀 GIT
  gs                          git status
  gb                          List local branches, numbered
  gcon <n>                    Checkout branch by number
  cpgbn <n>                   Copy branch name by number to clipboard
  rmgbn <n>                   Delete branch by number (confirms)
  gco <ref> / gcob <new>      Checkout / create branch (gco- for previous)
  gstageall                   git add .
  gc <type> [scope] <msg>     Conventional commit (type(scope): msg)
  gcm <msg>                   git commit -m
  gamend                      Amend the last commit
  tmpcommit                   Commit staged work as 'tmp: tmp commit'
  undocommit / deletecommit   Reset last commit --soft / --hard
  removefromstaged            Unstage everything
  gstash / gpop               Stash / pop (gstashls, gstashclear)
  gpush / gpushf              Push / force push
  gpull / gpo / grebase       Pull --autostash --rebase / pull origin / rebase
  pushfile <file> <msg>       Find, add, commit and push a single file
  pushreadme / pushignore     Push README.md / .gitignore with a standard message
  pushtodo / pushcron         Push TODO.md / crontab with a standard message
  droplocalbranches           Delete every local branch except main (+ worktrees)
  dropremotebranches          Delete every remote branch except origin/main (confirms)
  gtagls / rmgtag <tag>       List / delete tags
  gitstats                    Lines added/removed per author
  openrepo                    Open the current repo's GitHub page

🪟 TMUX & NVIM
  tmuxvb                      Start/attach the vb tmux session
  vibecode [dir] [-n name]    Vibe coding layout (claude + lazygit + shells)
  mktmuxw <name> [dir]        Create a named tmux window
  rmtmuxw <name>              Kill a named tmux window
  neovidetmuxvb               Launch Neovide attached to the vb session
  neovideterminal             Launch Neovide straight into :terminal
  fzfvim                      fzf-pick a file and open it in vim
  pnpm cheatsheet:tmux-nvim   Print the tmux/nvim keybindings (from the repo)

📦 NODE
  initnpm                     Wipe node_modules + lockfile, reinstall
  initnpmserve                initnpm then npm run serve
  rmdist                      Remove dist/
  mynpmpackages               Open the npm packages page

🐍 PYTHON
  venvon                      Activate ./venv
  makevenv                    Recreate venv and install requirements.txt
  newvenv                     Recreate an empty venv and activate it
  revenv                      Deactivate, reload shell, reactivate venv
  rmenv                       Deactivate and delete venv
  pipdump                     Freeze deps into requirements.txt
  pipreinstall <pkg>          Uninstall then reinstall a package
  runvenv / flaskrun          Activate venv then run run.py / flask --debug

🏗️  TERRAFORM
  tfinit / tfplan / tfapply   terraform init / plan / apply
  tfdestroy                   terraform destroy
  tf{plan,apply,destroy}dev   Same, with -var-file=dev.tfvars
  tf{plan,apply,destroy}prod  Same, with -var-file=prod.tfvars
  tfapplydeva / tfapplyproda  Auto-approve apply (destroy: tfdestroydeva/proda)
  tfoutput                    terraform output

🔒 WIREGUARD & VPN
  wgls                        List WireGuard configs, numbered
  wgupn <n>                   Bring up a WireGuard interface by number
  wgkeygen                    Generate a WireGuard private/public keypair
  wg-status                   sudo wg show
  wg0-up / wg0-down           Bring wg0 up / down
  vb-up / vb-down             Bring the vb tunnel up / down

🐳 DOCKER
  dockeropen                  Open Docker Desktop
  killdockerdesktop           Quit Docker Desktop and its background processes
  dockercleanup               Run docker_cleanup.sh

☁️  VB INFRA
  sshocivm [cmd]              SSH into the OCI VM (IP from terraform output)
  vbvault                     Open the Vault UI
  cpvaulttoken                Copy the Vault root token to clipboard
  vbbackup                    Back up secrets and the repo
  awsprofiles                 Open ~/.aws/credentials
  vbactions / vbnpm           Open the repo's Actions / npm packages

📂 VB DIRECTORIES
  cdvb / cdprojects / cdnx    cd to repo root / projects / nx-workspace
  cdgrind75[ts|py|go]         cd to grind-75 (optionally a language dir)
  cdjournal                   cd to ~/journal

⬆️  VB PUSH
  pushdocs / pushnotes        Commit and push docs/ / notes/
  pushvbtodo / pushsnippets   Commit and push TODO.md / snippets
  pushactions / pushsetup     Commit and push workflows / setup scripts
  pushdotfiles                Commit and push dotfiles
  pushleetcode                Commit and push grind-75
  pushJournal / pulljournal   Push / pull the journal repo

🧪 VB PROJECTS
  testgrind75                 Run grind-75 tests (py + ts + go)
  testgrind75py|ts|go         Run grind-75 tests for one language
  deploypersonalfrontend      Manually deploy the personal website frontend
  servecloud8                 Serve cloud-8-skate-angular
  npmEmployeeHandler          Install the local employee-handler build
  dldjmusic                   Download DJ music from Spotify playlists

🍺 HOMEBREW & DEPS
  brewinit / brewup           Install from Brewfile / update + upgrade + cleanup
  brewsync / brewdump         Sync to Brewfile / dump Brewfile
  npminit / npmdump           Install from npmfile / dump npmfile
  depsdump / pushdeps         Dump both / dump both, commit and push
  pushbrew / pushnpm          Commit and push Brewfile / npmfile

🖥️  MACHINE SETUP
  reinstallsh                 Re-run the machine install.sh (mac/linux)
  setupdock                   Run setup_dock.sh
  setupdockstacks             Rebuild Dock Stacks folders (setup_dock_stacks.sh)
  setupmac                    Run setup_macos_preferences.sh
  toggledarkmode              Toggle macOS system dark mode
  changewallpaper             Run change_wallpaper.sh

🧰 MACOS UTILS
  alarm <min> <message>       Say a message after N minutes
  alertinterval <cron|off>    Cron a spoken time announcement (off to remove)
  cpsshpubkey                 Copy ~/.ssh/id_rsa.pub to clipboard
  openmail / clearmail        Open / clear local /var/mail

🌐 NETWORK
  pingtest                    Ping google.com
  check_network [-v]          Exit 0 if 8.8.8.8 is reachable (-v prints)

🔍 VS CODE & SEARCH
  fzfcode                     fzf-pick a file and open it in VS Code
  vswsls                      List VS Code workspaces, numbered
  vsws [name] / vswsn <n>     Open a workspace by name / number
  google|youtube|reddit <q>   Web search (also pinterest, amazon, chatgpt)
```
