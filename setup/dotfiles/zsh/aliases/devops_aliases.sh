## LOCAL

alias openmail="code /var/mail/$(whoami)"
alias clearmail="echo '' > /var/mail/$(whoami)"
load_aliases ~/shell-aliases/devops/

## CRON

alias cronguru="chrome 'https://crontab.guru/'"


## UTILITY

alias ghtokens="open 'https://github.com/settings/personal-access-tokens'"

## TERRAFORM
# Shared helper: terraform_run <action> [env] [auto]
# - action: init|plan|apply|destroy
# - env: optional, "dev" or "prod" (will append -var-file=<env>.tfvars)
# - auto: optional, set to "auto" to add -auto-approve for apply/destroy
terraform_run() {
  local action=$1; shift || return 1
  local env=$1
  local auto=$2
  # If user used a 3rd positional param for extra args, preserve them:
  # (we allow terraform_run to be called with extra args after the three params)
  # so shift accordingly if env/auto were supplied
  # (caller functions below pass parameters explicitly)
  # Build var-file flag if env provided
  local varfile=""
  if [[ -n "$env" ]]; then
    varfile="-var-file=${env}.tfvars"
  fi

  local auto_flag=""
  if [[ "$auto" == "auto" ]]; then
    auto_flag="-auto-approve"
  fi

  case "$action" in
    init)
      terraform init "$@"
      ;;
    plan)
      terraform plan $varfile "$@"
      ;;
    apply)
      terraform apply $varfile $auto_flag "$@"
      ;;
    destroy)
      terraform destroy $varfile $auto_flag "$@"
      ;;
    *)
      echo "terraform_run: unsupported action '$action'" >&2
      return 2
      ;;
  esac
}

# Basic wrappers without empty placeholders
tfinit()    { terraform_run init "$@"; }
tfplan()    { terraform_run plan "$@"; }
tfapply()   { terraform_run apply "$@"; }
tfdestroy() { terraform_run destroy "$@"; }


# Dev
tfplandev()     { terraform_run plan dev "$@"; }
tfapplydev()    { terraform_run apply dev "$@"; }
tfdestroydev()  { terraform_run destroy dev "$@"; }

# Prod
tfplanprod()     { terraform_run plan prod "$@"; }
tfapplyprod()    { terraform_run apply prod "$@"; }
tfdestroyprod()  { terraform_run destroy prod "$@"; }

# Auto-approve variants
tfapplydeva()    { terraform_run apply dev auto "$@"; }
tfdestroydeva()  { terraform_run destroy dev auto "$@"; }
tfapplyproda()   { terraform_run apply prod auto "$@"; }
tfdestroyproda() { terraform_run destroy prod auto "$@"; }


alias tfoutput="terraform output"

## WIREGUARD
wgls() {
  local conf_files=(/opt/homebrew/etc/wireguard/*.conf(N))

  if [[ ${#conf_files[@]} -eq 0 ]]; then
    echo "No WireGuard configurations found"
    return 0
  fi

  local num=1
  for conf_path in "${conf_files[@]}"; do
    local conf_name=$(basename "$conf_path")

    # Extract the Address from the config file
    local address=$(grep "^Address" "$conf_path" 2>/dev/null | sed 's/.*=[ ]*//' | cut -d'/' -f1)

    # Find matching interface by IP address
    local wg_status="DOWN"
    local iface=""

    if [[ -n "$address" ]]; then
      # Check all utun interfaces for matching IP
      local matching_iface=$(ifconfig | grep -B1 "inet $address " | grep "^utun" | awk '{print $1}' | tr -d ':')

      if [[ -n "$matching_iface" ]]; then
        # Check if interface is UP and RUNNING
        if ifconfig "$matching_iface" | grep -q "flags=.*<.*UP.*RUNNING"; then
          wg_status="UP"
          iface="$matching_iface"
        fi
      fi
    fi

    # Format output with color and status
    if [[ "$wg_status" == "UP" ]]; then
      printf "%2d. %-20s \033[32m[%s]\033[0m %s (%s)\n" "$num" "$conf_name" "$wg_status" "$iface" "$address"
    else
      printf "%2d. %-20s \033[90m[%s]\033[0m\n" "$num" "$conf_name" "$wg_status"
    fi

    num=$((num + 1))
  done
}

validate_wg_number() {
  local num=$1
  if [[ -z $num || $num -le 0 ]]; then
    echo "Please provide a valid config number (starting from 1)."
    return 1
  fi
}

get_wg_by_number() {
  local num=$1
  validate_wg_number "$num" || return 1

  local wg_file
  wg_file=$(command ls -1 /opt/homebrew/etc/wireguard/*.conf 2>/dev/null \
    | xargs -n1 basename \
    | sed -n "${num}p")

  if [[ -n $wg_file ]]; then
    echo "$wg_file"
  else
    echo "WG config number $num does not exist."
    return 1
  fi
}

wgupn() {
  local num=$1
  local wg_file
  wg_file=$(get_wg_by_number "$num") || return 1

  local wg_name="${wg_file%.conf}"

  echo "Bringing up WireGuard interface: $wg_name"
  sudo wg-quick up "$wg_name"
}

## HASHICORP VAULT

alias openlocalvault="open 'https://127.0.0.1:8200'"