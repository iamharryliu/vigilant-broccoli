# Shell

- [vim](./vim.md)
- Tools
  - [tmux](./tmux.md)
  - [fzf](./fzf.md)
- Commands
  - [find](./find.md)
  - [grep](./grep.md)
  - [tree](./tree.md)
- [Cron](./cron.md)

## Commands

```
# cp(copy) - Used to copy source or multiple sources to another location
cp [source] [destination]
cp [source]/* [destination]
cp [source]/*.json [destination]
cp [source1] [source2] [destination]

# rsync(remote sync) - Used to synchronize files or directories between two location
rsync [source] [destination]



# grep(global regular expression print) - Used for searching plain-text files for line that match a regular expression
grep [options] [regex] [file(s)]

# ARP(Address Resolution Protocol)
arp -a

# du(disk usage)
du -h DIRECTORY_PATH # Lists sizes for all files and subdirectories.
du -sh DIRECTORY_PATH # Shows only the total size of the directory.

# df(disk free) -  Displays the amount of available disk space for operating system.
df -h

# ps(process status) - Allows you to view information about the processes running on your system.
ps aux

echo "Hello, clipboard!" | pbcopy
pbcopy < filename.txt
```

```

# grep for process number
ps aux | grep WORDS
```

## Logging

```
# Log stdout and stderr to the same file.
[command] > [output.log] 2>&1

# Log stdout and stderr to different files.
[command] > [output.log] 2> [error.log]

# Log only errors.
[command] 2> [error.log]
```

## Encode/Decode
```
base64 -i DECODED_FILENAME -o ENCODED_FILENAME
echo ENCODED_FILENAME| base64 -d > DECODED_FILENAME

```