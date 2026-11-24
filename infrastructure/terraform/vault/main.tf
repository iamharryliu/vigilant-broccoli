terraform {
  # import blocks with for_each.
  required_version = ">= 1.7"

  # Its own workspace rather than the infrastructure one: that workspace
  # creates the VM Vault runs on and reads its provider credentials from Vault,
  # so Vault's own configuration can only be planned once Vault is up.
  cloud {
    organization = "vigilant-broccoli"

    workspaces {
      name = "vigilant-broccoli-vault"
    }
  }

  required_providers {
    vault = {
      source  = "hashicorp/vault"
      version = "~> 5.0"
    }
  }
}

# VAULT_ADDR and VAULT_TOKEN come from scripts/load-vault-provider-env.sh.
provider "vault" {
  # The root token is used directly; a child token per run would only add
  # orphaned tokens to clean up.
  skip_child_token = true

  # vault.vigilant-broccoli.app sits behind a Cloudflare Access service-token policy.
  headers {
    name  = "CF-Access-Client-Id"
    value = var.cf_access_client_id
  }
  headers {
    name  = "CF-Access-Client-Secret"
    value = var.cf_access_client_secret
  }
}
