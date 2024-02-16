# Vim

## Vscode Extension

[Look for installation section](https://github.com/VSCodeVim/Vim)

```
defaults write com.microsoft.VSCode ApplePressAndHoldEnabled -bool false
```

## Exiting Vim

## Modes

Vim has 3 different modes

- insert mode - used to edit text document through insertions or deletions
- command mode - used to enter commands such as save or quit
- visual mode - used to read and move through text

### Command Mode:

```
:q
:q!
:wq

:set number - adds line numbers
:[number] - jump to line number
```

### Insert Mode

```
i - insert mode before curser
a - insert mode after cursor
I - insert mode at the start of the line
A - insert mode at the end of the line
```

## Movement

```
h - move left
j - move down
k - move up
l - move right
0 - move to start of the line
$ - move to end of the line
w - jump to next word
b - jump to previous word
gg - jump to top of the file
G - jump to end of the file
```

## Delete / Undo

```
x - delete character
dd - delete line
[n]dd - delete n lines
u - undo
r - replace character
```

# Run Node from Vim

```
:!node [fname]
```
