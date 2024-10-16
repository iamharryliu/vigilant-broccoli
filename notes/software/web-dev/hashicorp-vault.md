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

vault status
vault secrets list
vault kv put PATH KEY=VALUE
vault kv get PATH
vault kv delete PATH

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

## Auth

```
vault auth enable github
vault write auth/github/config organization=ORGANIZATION_NAME
vault login -method=github token=TOKEN

curl --request POST --data '{"token":"TOKEN"}' http://127.0.0.1:8200/v1/sys/github/login
```
