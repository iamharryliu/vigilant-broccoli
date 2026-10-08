# Text Editors

## Table of Contents

- [Comparison](#comparison)
- [Visual Studio Code](#visual-studio-code)
  - [Keyboard Shortcuts](#keyboard-shortcuts)

## Comparison

| Editor                                               | Description                                                                           | Pros                                                                                                                                                                                                                                 | Cons                                                                                                                                                                                                                 | Choose if                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| [Visual Studio Code](https://code.visualstudio.com/) | Extensible code editor with integrated development tools.                             | [Extensive extension ecosystem](https://code.visualstudio.com/docs/configure/extensions/extension-marketplace); [remote development over SSH, in containers, and in WSL](https://code.visualstudio.com/docs/remote/remote-overview). | Extensions can introduce [startup delays or high CPU/memory usage](https://github.com/microsoft/vscode/wiki/Performance-Issues); specialized workflows may require several extensions and configuration.             | You depend on specific extensions, remote environments, or a shared editor setup across a team.                           |
| [Zed](./zed.md)                                      | Code editor written in Rust with GPU rendering, designed for speed and collaboration. | Native rendering architecture; [built-in collaboration and AI assistance](https://zed.dev/docs/); familiar keymaps and language-server support.                                                                                      | [Smaller extension catalog and incomplete equivalents for some VS Code workflows](https://zed.dev/docs/migrate/vs-code#extensions-vs-marketplace); settings import does not import extensions or custom keybindings. | You prioritize responsive editing and built-in collaboration, and your languages and required integrations are supported. |

## Visual Studio Code

### Keyboard Shortcuts

| **Action**                | **Shortcut (Mac)**   |
| :------------------------ | :------------------- |
| Open Settings             | `cmd + ,`            |
| Quick Open (File Search)  | `cmd + P`            |
| Open Command Palette      | `cmd + shift + P`    |
| Move Line Up/Down         | `option + up/down`   |
| Jump between code blocks  | `cmd + shift + \`    |
| Collapse All              | `cmd + K cmd + 0`    |
| Expand All                | `cmd + K cmd + J`    |
| Paste Markdown as HTML    | `cmd + shift + V`    |
| Toggle Sidebar Visibility | `cmd + B`            |
| Split Editor              | `cmd + \`            |
| Toggle Terminal           | `CTRL + \``          |
| Multi-Cursor (Add Cursor) | `option + click`     |
| Select Next Match         | `cmd + D`            |
| Select All Matches        | `cmd + shift + L`    |
| Indent Line(s)            | `cmd + ]`            |
| Outdent Line(s)           | `cmd + [`            |
| Go to Definition          | `F12`                |
| Peek Definition           | `option + F12`       |
| Rename Symbol             | `F2`                 |
| Format Document           | `option + shift + F` |
| Show All Symbols          | `cmd + T`            |
