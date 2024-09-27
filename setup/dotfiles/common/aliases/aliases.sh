dir=~/shell-common/aliases/os
find "$dir" -name "*.sh" | while read -r script; do
  source "$script"
done

dir=~/shell-common/aliases/devops
find "$dir" -name "*.sh" | while read -r script; do
  source "$script"
done

dir=~/shell-common/aliases/network
find "$dir" -name "*.sh" | while read -r script; do
  source "$script"
done
