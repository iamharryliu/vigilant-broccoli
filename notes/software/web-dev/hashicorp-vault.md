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

## Policies

```
vault policy write default - <<EOF
path "sys/capabilities-self" {
  capabilities = ["update"]
}

path "secret/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
EOF
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

sudo systemctl stop vault
sudo rm -rf /opt/vault/data/*
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
api_addr      = "http://IP_ADDRESS:8200"
cluster_addr  = "http://IP_ADDRESS:8201"
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
```

## Auth

### Github

```
vault auth enable github
vault write auth/github/config organization=ORGANIZATION_NAME

vault list auth/github/map/users
vault list auth/github/map/teams

vault write auth/github/map/teams/TEAM_NAME value=POLICY_NAME
vault read auth/github/map/teams/TEAM_NAME
vault delete auth/github/map/users/TEAM_NAME

vault write auth/github/map/users/USERNAME value=POLICY_NAME
vault read auth/github/map/users/USERNAME
vault delete auth/github/map/users/USERNAME

# https://github.com/settings/tokens and make a classic token `vault-token` with `read:org` permission
vault login -method=github token=TOKEN

curl --request POST --data '{"token":"TOKEN"}' http://127.0.0.1:8200/v1/sys/github/login
```


```
# vault-openssl.cnf
[ req ]
default_bits       = 2048
prompt             = no
default_md         = sha256
req_extensions     = req_ext
distinguished_name = dn

[ dn ]
CN = 127.0.0.1

[ req_ext ]
subjectAltName = @alt_names

[ alt_names ]
IP.1 = 127.0.0.1
IP.2 = 51.20.122.133
DNS.1 = dns.name

[ v3_ext ]
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:TRUE
keyUsage = keyCertSign, digitalSignature, keyEncipherment
subjectAltName = @alt_names
```

sudo openssl x509 -req -in csr.pem -signkey key.pem -out /etc/vault/tls/vault.crt -days 365 -extfile config.cnf -extensions v3_ext

openssl x509 -req -in vault.csr -signkey /etc/vault/tls/vault.key -out /etc/vault/tls/vault.crt -days 365 -extensions req_ext -extfile yourconfig.cnf

sudo openssl req -new -key /etc/vault/tls/vault.key -out vault.csr -config ./vault-openssl.cnf 

sudo openssl req -x50 -new -key key.pem -out req.csr -config your.cnf -reqexts req_ext

openssl req -new -key /etc/vault/tls/vault.key -out /etc/vault/tls/vault.csr -config vault-openssl.cnf

sudo openssl req -x509 -nodes -newkey rsa:2048 -keyout /etc/vault/tls/vault.key -out /etc/vault/tls/vault.crt -days 365 -config vault-openssl.cnf  -extensions v3_ext

sudo openssl req -x509 -nodes -newkey rsa:2048   -keyout /etc/vault/tls/vault.key   -out /etc/vault/tls/vault.crt   -days 365   -config vault-openssl.cnf 
sudo chown vault:vault /etc/vault/tls/vault.key
sudo chmod 600 /etc/vault/tls/vault.key
sudo systemctl restart vault
sudo systemctl status vault

sudo journalctl -u vault -n 50 --no-pager

https://console.cloud.google.com/net-security/firewall-manager/firewall-policies/
