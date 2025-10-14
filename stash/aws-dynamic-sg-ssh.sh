export AWS_ACCESS_KEY_ID=AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=AWS_SECRET_ACCESS_KEY
export AWS_REGION=AWS_REGION

AWS_SECURITY_GROUP_ID=AWS_SECURITY_GROUP_ID
AWS_MACHINE_PEM_KEY=AWS_MACHINE_PEM_KEY
AWS_INSTANCE='USER@ADDRESS'
PORT=22

get_public_ip() {
  curl -s https://api.ipify.org
}

get_current_rules() {
  aws ec2 describe-security-groups \
    --group-ids "$AWS_SECURITY_GROUP_ID" \
    --query "SecurityGroups[0].IpPermissions" \
    --output json
}

clear_ingress_rules() {
  echo "🔍 Fetching current ingress rules..."
  local rules
  rules=$(get_current_rules)

  if [[ "$rules" == "[]" || -z "$rules" ]]; then
    echo "ℹ️ No existing ingress rules to revoke."
    return
  fi

  echo "🚫 Revoking existing rules..."
  aws ec2 revoke-security-group-ingress \
    --group-id "$AWS_SECURITY_GROUP_ID" \
    --ip-permissions "$rules"
}

add_ingress_rule() {
  local ip="$1"
  echo "✅ Adding IP $ip for port $PORT..."
  aws ec2 authorize-security-group-ingress \
    --group-id "$AWS_SECURITY_GROUP_ID" \
    --protocol tcp \
    --port "$PORT" \
    --cidr "$ip/32" 
}

connect_via_ssh() {
  echo "🔐 Connecting to $AWS_INSTANCE..."
  ssh -i "$AWS_MACHINE_PEM_KEY" "$AWS_INSTANCE"
}

# === Main ===
main() {
  echo "🌍 Fetching your public IP..."
  local ip
  ip=$(get_public_ip)
  echo "Your IP: $ip"

  clear_ingress_rules
  add_ingress_rule "$ip"

  echo "🎉 Security group updated successfully!"
  connect_via_ssh
}

main "$@"