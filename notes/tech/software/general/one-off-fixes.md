# One Off Fixes

- [Getting mailto to work on MBP](https://www.youtube.com/watch?v=oGqZy93oWiM)
- [Declarations in JS Switch Statement](https://stackoverflow.com/questions/50752987/eslint-no-case-declaration-unexpected-lexical-declaration-in-case-block)
- [tsc not found in Docker build.](https://stackoverflow.com/questions/67199539/tsc-not-found-in-docker-build)
- [Allowing comments in interactive zsh commands](https://unix.stackexchange.com/questions/557486/allowing-comments-in-interactive-zsh-commands)
- [Fix slow vscode](https://stackoverflow.com/questions/65147934/how-to-fix-vs-code-integrated-terminal-choppy-and-laggy-on-macos-big-sur)
- [SSH Passphrase](https://stackoverflow.com/questions/10032461/git-keeps-asking-me-for-my-ssh-key-passphrase)
- Stupid Next.js not following tailwind patterns

```
const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510
```
