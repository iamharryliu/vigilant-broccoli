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

// Teardown
pgrep -f vault | xargs kill
rm -r ./vault/data
```

```
sudo systemctl daemon-reexec
sudo systemctl enable vault
sudo systemctl start vault
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

sudo journalctl -u vault -n 50 --no-pager
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

## Access Production Vault

```
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_SKIP_VERIFY=true

export VAULT_CACERT=/etc/vault/tls/vault.crt
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

## Usage

```
curl --cacert vault.crt \
  --header "X-Vault-Token: TOKEN" \
  --request GET \
https://ID_ADDRESS:8200/v1/SECRET_ENGINE_PATH/data/PATH_TO_SECRET
```

https://console.cloud.google.com/net-security/firewall-manager/firewall-policies/
