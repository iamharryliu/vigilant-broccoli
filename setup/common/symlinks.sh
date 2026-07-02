#!/bin/bash
create_symlink() {
    local target=$1
    local link_name=$2

    if [ -L "$link_name" ]; then
        rm "$link_name"
        echo "Removed existing symlink $link_name"
    elif [ -e "$link_name" ]; then
        rm -rf "$link_name"
        echo "Removed existing file/directory $link_name"
    fi

    ln -s "$target" "$link_name"
    echo "Created symbolic link $link_name -> $target"
}

symlink_common_dotfiles() {
    create_symlink "$DOTFILES_DIR/.gitconfig" "$HOME/.gitconfig"
    create_symlink "$ZSH_DOTFILES_DIR/aliases" "$HOME/shell-aliases"
    create_symlink "$ZSH_DOTFILES_DIR/scripts" "$HOME/shell-scripts"
    create_symlink "$DOTFILES_DIR/.tmux.conf" "$HOME/.tmux.conf"
    create_symlink "$DOTFILES_DIR/.vimrc" "$HOME/.vimrc"
    mkdir -p "$HOME/.config"
    create_symlink "$DOTFILES_DIR/.config/nvim" "$HOME/.config/nvim"
    mkdir -p "$HOME/.claude"
    create_symlink "$CLAUDE_COMMANDS_DIR" "$HOME/.claude/commands"
    create_symlink "$CLAUDE_SKILLS_DIR" "$HOME/.claude/skills"
    chmod -R +x "$HOME/shell-aliases/"
    chmod -R +x "$HOME/shell-scripts/"
}
