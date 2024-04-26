# Personal Monorepo

## How my personal monorepo is setup

Currently this is how my monorepo is setup (definitely subject to change in the future) at the top root level:

- **setup** - machine setup configurations(install scripts, shell variables and aliases) and utility scripts
- **notes** - collection of markdown notes for software and personal hobbies such as cooking
- **projects** - inside there is a Nx monorepo workspace (manages my node projects), a folder sandbox demo applications, a collection of leetcode solutions, other misc project
- scripts - collection of personal scripts, demo apps folder (all my tutorial code get dumped into here usually), my leetcode solutions and their unittests

Of course you can add all these folders to a single workspace in a code editor but getting code to play nicely together and good workflows takes a bit more finesse.

## Automation

- Saving the monorepo to a Google Drive folder on personal machine.
- Copying my Resume from my Downloads folder to my personal website. (TODO: automate Git push)
- Script to download my Spotify playlists for DJing.
