# Hashicorp Vault

```
# MacOS
brew tap hashicorp/tap
brew install hashicorp/tap/vault

# Linux
curl -O https://releases.hashicorp.com/vault/1.14.0/vault_1.14.0_linux_amd64.zip
unzip vault_1.14.0_linux_amd64.zip
sudo mv vault /usr/local/bin/

vault --version
vault server -dev

export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='ROOT_TOKEN'

vault operator unseal UNSEAL_KEY #Requires 3 unseal keys to unseal vault.
vault operator seal
vault login ROOT_TOKEN

vault status
vault secrets list
vault kv put PATH KEY=VALUE
vault kv get PATH
vault kv delete PATH

curl --header "X-Vault-Token: VAULT_TOKEN" --request POST --data '{"data": {"key":"value"}}' http://127.0.0.1:8200/v1/secret/data/my-secret
curl --header "X-Vault-Token: VAULT_TOKEN" http://127.0.0.1:8200/v1/secret/data/my-secret
```

## Auth

```
vault auth enable github
vault write auth/github/config organization=ORGANIZATION_NAME
vault login -method=github token=TOKEN


curl --request POST --data '{"token":"TOKEN"}' http://127.0.0.1:8200/v1/sys/github/login
```

## Persistant Storage

By default, dev mode is in-memory only. For persistence, use a backup file.

```
# vault.hcl
storage "file" {
  path = "/path/to/your/data"
}

listener "tcp" {
  address = "127.0.0.1:8200"
  tls_disable = 1
}

disable_mlock = true
```

```
vault server -config=vault.hcl
```
