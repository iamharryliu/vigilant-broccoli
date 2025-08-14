# Tree

```
brew install tree
```

| **Command**                 | **Description**                                                                   |
| --------------------------- | --------------------------------------------------------------------------------- |
| `tree`                      | Displays the directory structure starting from the current directory.             |
| `tree -d`                   | Lists only directories.                                                           |
| `tree -L <level>`           | Limits the display depth of directories (e.g., `tree -L 2`).                      |
| `tree -s`                   | Shows the size of files.                                                          |
| `tree -a`                   | Lists all files, including hidden files (`.` prefix).                             |
| `tree -p`                   | Displays file and directory permissions.                                          |
| `tree -t`                   | Lists files sorted by last modification time.                                     |
| `tree -h`                   | Shows file sizes in human-readable format (e.g., KB, MB).                         |
| `tree -a -L 2 -h`           | Combines options: lists hidden files, limits depth to 2, and shows readable sizes |
| `tree --prune -I "pattern"` | Ignores specific files or directories (`node_modules\|*.log`).                    |
