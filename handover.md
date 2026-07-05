# Handover: CI Vault access via WireGuard (no GCP)

CI no longer needs `google-github-actions/auth` + an IAP SSH tunnel to reach
Vault on `vb-free-vm`. It now joins the VM's WireGuard network directly
(`10.0.1.4/32`) and talks to Vault at `10.0.1.1:8200`.

Code changes are done and staged. These steps are manual / out-of-repo and
still need to happen before CI will work again:

## 1. Generate the CI keypair

```bash
wg genkey | tee gha.key | wg pubkey > gha.pub
```

## 2. Register the public key with the VM

```bash
GHA_PUB=$(cat gha.pub)

# GCP Secret Manager (so future VM rebuilds pick it up via wg-init.sh)
echo -n "$GHA_PUB" | gcloud secrets versions add VB_VM_WG_GHA_PUBLIC_KEY --data-file=- --project=vigilant-broccoli

# Also update infrastructure/terraform/main.tf: replace the placeholder
# "REPLACE_WITH_GHA_WIREGUARD_PUBLIC_KEY" secret_data with $GHA_PUB, then
terraform apply -target=google_secret_manager_secret_version.wg_gha_public_key

# Add the peer to the already-running VM (wg-init.sh only runs once per VM)
gcloud compute ssh vb-free-vm --zone=us-central1-a --tunnel-through-iap -- \
  "sudo wg set wg0 peer ${GHA_PUB} allowed-ips 10.0.1.4/32"
```

Also SSH in and manually append the same `[Peer]` block to
`/etc/wireguard/wg0.conf` so it survives a reboot (see
`infrastructure/terraform/packer/deployment-instructions.md`, section 2a).

## 3. Add GitHub repo secrets/vars

- Secret `VB_GHA_WG_PRIVATE_KEY` = contents of `gha.key`
- Confirm secret `VB_VM_WG_SERVER_PUBLIC_KEY` exists (already used elsewhere)
- Variable `VAULT_VM_WG_ENDPOINT` = `<vb-free-vm external IP>:51820`

## 4. Known caveat: ephemeral VM IP

`vb-free-vm` has an ephemeral external IP (`access_config {}` in Terraform),
so `VAULT_VM_WG_ENDPOINT` will go stale on VM restart. Update it the same
time you run `npm run gcp:vm:update-wg` for your laptop, or say the word if
you want to switch to a reserved static IP instead (small infra change,
touches the live network interface, held off on it for this round).

## 5. Cleanup once verified working

- `GCP_WORKLOAD_IDENTITY_PROVIDER` / `GCP_SERVICE_ACCOUNT` repo secrets:
  keep — still used by `cron-health-check.yml` (VM status check) and
  `test-smoke-gcp-secret-manager.yml`.
- Delete `gha.key` / `gha.pub` from local disk once the secret is in GitHub.

## 6. Verify

Trigger `test-smoke-vault-service.yml` (or any workflow using the
`vault-secrets` action) manually and confirm it authenticates without any
GCP auth step in the logs.
