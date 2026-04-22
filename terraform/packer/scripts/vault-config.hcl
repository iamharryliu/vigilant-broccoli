disable_mlock = true

listener "tcp" {
  address       = "0.0.0.0:8200"
  tls_cert_file = "/etc/vault/tls/vault.crt"
  tls_key_file  = "/etc/vault/tls/vault.key"
}

storage "file" {
  path = "/opt/vault/data"
}

seal "gcpckms" {
  project    = "vigilant-broccoli"
  region     = "us-east1"
  key_ring   = "vault-keyring"
  crypto_key = "vault-unseal-key"
}

api_addr = "https://127.0.0.1:8200"
ui       = true
