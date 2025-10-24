# Hashicorp Vault

```
vault --version
vault server -dev

vault status
vault secrets list
vault secrets enable -path=PATH_NAME kv
vault kv put PATH_NAME KEY=VALUE
vault kv get PATH_NAME
vault kv delete PATH_NAME

curl --header "X-Vault-Token: VAULT_TOKEN" --request POST --data '{"data": {"key":"value"}}' http://127.0.0.1:8200/v1/secret/data/my-secret
curl --header "X-Vault-Token: VAULT_TOKEN" http://127.0.0.1:8200/v1/secret/data/my-secret
```

## Deploy in Production

[Deploy Vault](https://developer.hashicorp.com/vault/tutorials/getting-started/getting-started-deploy)

```
vim ~/config.hcl
mkdir -p ./vault/data
vault server -config=config.hcl

export VAULT_ADDR='http://127.0.0.1:8200'
vault operator init
vault operator unseal
vault operator unseal UNSEAL_KEY
vault login
vault login TOKEN
vault operator seal

```

```
sudo systemctl daemon-reexec
sudo systemctl enable vault
sudo systemctl start vault
sudo systemctl restart vault
sudo systemctl status vault
```

Teardown

```
pgrep -f vault | xargs kill
rm -r ./vault/data
```

### SSL

Single self-signed for quick local testing.

```
sudo openssl req -x509 -nodes -newkey rsa:2048 -keyout /etc/vault/tls/vault.key -out /etc/vault/tls/vault.crt -days 365 -config vault-openssl.cnf -extensions v3_ext
```

CSR-based for production.

```vim /etc/vault/tls/vault-openssl.cnf```

```
# vault-openssl.cnf

[ req ]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_ext

[ dn ]
CN = 127.0.0.1

[ alt_names ]
IP.1 = 127.0.0.1
IP.2 = 51.21.242.75
IP.3 = 10.0.0.1

[ v3_ext ]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
```

```
# 1. Generate a private key (reusable)
sudo openssl genrsa -out /etc/vault/tls/vault.key 2048

# 2. Generate a CSR
sudo openssl req -new -key /etc/vault/tls/vault.key \
  -out /etc/vault/tls/vault.csr \
  -config vault-openssl.cnf

# 3. Self-sign the CSR for 1 year (or sign with CA)
sudo openssl x509 -req -in /etc/vault/tls/vault.csr \
  -signkey /etc/vault/tls/vault.key \
  -out /etc/vault/tls/vault.crt \
  -days 365 \
  -extfile vault-openssl.cnf \
  -extensions v3_ext

# 4. Secure and restart Vault
sudo chown vault:vault /etc/vault/tls/vault.key
sudo chmod 600 /etc/vault/tls/vault.key
sudo systemctl restart vault
sudo systemctl status vault
```

```
sudo vim /etc/systemd/system/vault.service
sudo vim /etc/vault/config.hcl
sudo systemctl restart vault

sudo systemctl stop vault
sudo rm -rf /opt/vault/data/
sudo systemctl start vault
```

```
# /etc/vault/config.hcl

disable_mlock = true
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = true  # Use true only for testing; use TLS in production
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_cert_file = "/etc/vault/tls/vault.crt"
  tls_key_file  = "/etc/vault/tls/vault.key"
}

storage "file" {
  path = "/opt/vault/data"
}

ui            = true
```

```
# /etc/systemd/system/vault.service
[Unit]
Description=Vault Server
Requires=network-online.target
After=network-online.target

[Service]
User=vault
Group=vault
ExecStart=/usr/local/bin/vault server -config=/etc/vault/config.hcl
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
LimitNOFILE=65536
CapabilityBoundingSet=CAP_IPC_LOCK
AmbientCapabilities=CAP_IPC_LOCK

[Install]
WantedBy=multi-user.target
```

```
## Accessing Production Vault Locally

export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_SKIP_VERIFY=true

export VAULT_CACERT=/etc/vault/tls/vault.crt

# Accessing Production Vault Remotely
curl --cacert vault.crt \
  --header "X-Vault-Token: TOKEN" \
  --request GET \
https://ID_ADDRESS:8200/v1/SECRET_ENGINE_PATH/data/PATH_TO_SECRET
```

## App Role

```
vault auth enable approle
vault auth disable approle

vault list auth/approle/role
vault read auth/approle/role/<role-name>
vault delete auth/approle/role/<role-name>
```

## Auth

### Github

```
# https://github.com/settings/tokens and make a classic token `vault-token` with `read:org` permission
vault login -method=github token=TOKEN

vault auth enable github
vault write auth/github/config organization=ORGANIZATION_NAME

vault list auth/github/map/teams
vault read auth/github/map/teams/TEAM_NAME
vault write auth/github/map/teams/TEAM_NAME value=POLICY_NAME
vault delete auth/github/map/users/TEAM_NAME

vault list auth/github/map/users
vault read auth/github/map/users/USERNAME
vault write auth/github/map/users/USERNAME value=POLICY_NAME
vault delete auth/github/map/users/USERNAME

curl --request POST --data '{"token":"TOKEN"}' http://127.0.0.1:8200/v1/sys/github/login
```

## Policies

```
vault policy list
vault policy read POLICY_NAME
vault policy delete POLICY_NAME

vault write auth/github/map/teams/TEAM_NAME value=POLICY_NAME

vault policy write default - <<EOF
path "PATH" {
  capabilities = []
}
EOF
```

https://console.cloud.google.com/net-security/firewall-manager/firewall-policies/

### Audit

```
vault audit list

sudo mkdir -p /var/log
sudo chown vault:vault /var/log
sudo chmod 750 /var/log
vault audit enable file file_path=./vault_audit.log

cat /var/log/vault_audit.log | jq .
cat /var/log/vault_audit.log | jq '{time: .time, path: .request.path, method: .request.method, client: .client_address}'
```

## App Role

```
#!/usr/bin/env bash
set -euo pipefail

# Args
if [ $# -lt 2 ]; then
  echo "Usage: $0 <app-name> <secret-path>"
  echo "Example: $0 github-action secret/data/github"
  exit 1
fi

APP_NAME="$1"
SECRET_PATH="$2"

# Derived config
ROLE_NAME="${APP_NAME}-role"
POLICY_NAME="${APP_NAME}-policy"

echo "➡️ Creating policy: $POLICY_NAME"

# Create a temporary policy file
cat > ${POLICY_NAME}.hcl <<EOF
path "$SECRET_PATH" {
  capabilities = ["read"]
}
EOF

# Write the policy
vault policy write $POLICY_NAME ${POLICY_NAME}.hcl
rm ${POLICY_NAME}.hcl

echo "✅ Policy created."

# Enable approle if not already enabled
if ! vault auth list | grep -q "approle/"; then
  echo "➡️ Enabling AppRole auth method"
  vault auth enable approle
fi

echo "➡️ Creating role: $ROLE_NAME"

# Create the role
vault write auth/approle/role/$ROLE_NAME \
    token_ttl=1h \
    token_max_ttl=4h \
    secret_id_ttl=24h \
    policies=$POLICY_NAME

# Get RoleID
ROLE_ID=$(vault read -field=role_id auth/approle/role/$ROLE_NAME/role-id)

# Generate SecretID
SECRET_ID=$(vault write -f -field=secret_id auth/approle/role/$ROLE_NAME/secret-id)

echo "✅ Role created successfully!"
echo "----------------------------------"
echo "App Name  : $APP_NAME"
echo "Role Name : $ROLE_NAME"
echo "Policy    : $POLICY_NAME"
echo "SecretPath: $SECRET_PATH"
echo "----------------------------------"
echo "RoleID    : $ROLE_ID"
echo "SecretID  : $SECRET_ID"
echo "----------------------------------"
echo "⚠️  Save RoleID and SecretID into GitHub Actions secrets:"
echo "   VAULT_ROLE_ID=$ROLE_ID"
echo "   VAULT_SECRET_ID=$SECRET_ID"
```

```
# Authenticate with AppRole
VAULT_TOKEN=$(curl --request POST \
  --data "{\"role_id\": \"$VAULT_ROLE_ID\",\"secret_id\": \"$VAULT_SECRET_ID\"}" \
  $VAULT_ADDR/v1/auth/approle/login | jq -r '.auth.client_token')

echo "Vault token: $VAULT_TOKEN"


# Authenticate and get a client token
RESPONSE=$(curl -s --request POST \
  --data "{\"role_id\": \"${VAULT_ROLE_ID}\", \"secret_id\": \"${VAULT_SECRET_ID}\"}" \
  $VAULT_ADDR/v1/auth/approle/login)

# Extract the client token
CLIENT_TOKEN=$(echo "$RESPONSE" | jq -r '.auth.client_token')

echo "Vault client token: $CLIENT_TOKEN"
```

## jwt

```
vault auth enable jwt

vault list auth/jwt/roles
vault read auth/jwt/role/ROLE_NAME
```

### OIDC

```
vault write auth/jwt/config \
  oidc_discovery_url="https://token.actions.githubusercontent.com" \
  bound_issuer="https://token.actions.githubusercontent.com"

vault write auth/jwt/role/github-actions \
    role_type="jwt" \
    user_claim="actor" \
    bound_audiences="vault" \
    bound_subject="actor" \
    policies="github-actions" \
    ttl="1h"

vault write auth/jwt/role/github-actions \
    role_type="jwt" \
    user_claim="sub" \
    bound_audiences="vault" \
    bound_subject="sub" \
    policies="github-actions" \
    ttl="1h"

vault write auth/jwt/role/github-actions -<<EOF
{
  "role_type": "jwt",
  "user_claim": "sub",
  "bound_audiences": "vault",
  "bound_claims_type": "glob",
  "bound_claims": {
    "sub": "repo:ORGANIZATION_NAME/REPO_NAME:*"
  },
  "policies": "github-actions",
  "ttl": "1h"
}
EOF
```

### Troubleshooting

```

curl -vk https://IP_ADDRESS:8200/v1/sys/health --cacert vault.crt
openssl x509 -in /etc/vault/tls/vault.crt -text -noout | grep -A1 "Subject Alternative Name"
sudo journalctl -u vault -n 50 --no-pager
```
```
      - name: Inspect GitHub OIDC token
        run: |
          TOKEN=$(curl -sSL -H "Authorization: Bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=vault" | jq -r .value)
          echo "OIDC token claims:"
          echo "$TOKEN" | cut -d. -f2 | base64 --decode | jq
```
