### 📦 **npm vs Yarn vs pnpm: A Package Manager Comparison**

| Feature                   | `npm`                                                | `Yarn`                                                 | `pnpm`                                                             |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------ |
| **Performance**           |                                                      | Faster than npm, slower than pnpm                      | Fast installs, efficient caching, uses hard links for dependencies |
| **Disk Space Usage**      | Duplicates dependencies across projects              | Better than npm but still duplicates some dependencies | Saves space using symlinks and a global store                      |
| **Dependency Management** | Allows undeclared dependencies due to flat structure | Similar to npm but with better control (Plug’n’Play)   | Strict, avoids phantom dependencies                                |
| **Lock File**             | `package-lock.json`                                  | `yarn.lock`                                            | `pnpm-lock.yaml`                                                   |
| **Install Command**       | `npm install`                                        | `yarn install`                                         | `pnpm install`                                                     |
| **Add Package**           | `npm install <package>`                              | `yarn add <package>`                                   | `pnpm add <package>`                                               |
| **Remove Package**        | `npm uninstall <package>`                            | `yarn remove <package>`                                | `pnpm remove <package>`                                            |
| **Update Packages**       | `npm update`                                         | `yarn upgrade`                                         | `pnpm update`                                                      |
