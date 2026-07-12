# Deployment Instructions

## OCI RabbitMQ

### Prerequisites

Set up `./.oci/config` — see [Auth Tokens](https://cloud.oracle.com/identity/domains/my-profile/auth-tokens?region=ca-toronto-1) for API key setup.

### Deploy

```bash
cd terraform
terraform init
terraform apply
```

---

## GCP vb-free-vm

### 1. Create Secret Manager secrets + IAM

```bash
cd terraform
terraform apply \
  -target=google_project_service.secretmanager \
  -target=google_project_iam_member.vm_default_sa_secret_accessor \
  -target=google_secret_manager_secret.wg_server_private_key \
  -target=google_secret_manager_secret.wg_server_public_key \
  -target=google_secret_manager_secret.wg_elva11_mbp_public_key \
  -target=google_secret_manager_secret.wg_gha_public_key
```

WireGuard is for laptop access only. CI reaches Vault through the cloudflared tunnel at `vault.harryliu.dev` — the tunnel, DNS record, Access service token, `VB_VM_CLOUDFLARED_TUNNEL_TOKEN` GCP secret, and the `VAULT_CF_ACCESS_*` GitHub Actions secrets are all created by the full `terraform apply` (see `cloudflare-vault.tf`); `cloudflared-init.sh` picks the tunnel token up on first boot.

### 2.Generate WireGuard keys + populate secrets

```bash
SERVER_PRIV=$(wg genkey)
SERVER_PUB=$(echo "$SERVER_PRIV" | wg pubkey)
LAPTOP_PRIV=$(wg genkey)
LAPTOP_PUB=$(echo "$LAPTOP_PRIV" | wg pubkey)
GHA_PRIV=$(wg genkey)
GHA_PUB=$(echo "$GHA_PRIV" | wg pubkey)

echo -n "$SERVER_PRIV" | gcloud secrets versions add VB_VM_WG_SERVER_PRIVATE_KEY --data-file=- --project=vigilant-broccoli
echo -n "$SERVER_PUB"  | gcloud secrets versions add VB_VM_WG_SERVER_PUBLIC_KEY  --data-file=- --project=vigilant-broccoli
echo -n "$LAPTOP_PUB"  | gcloud secrets versions add VB_VM_WG_ELVA11_MBP_PUBLIC_KEY --data-file=- --project=vigilant-broccoli
echo -n "$GHA_PUB"     | gcloud secrets versions add VB_VM_WG_GHA_PUBLIC_KEY --data-file=- --project=vigilant-broccoli

echo "Laptop private key (save for wg0.conf): $LAPTOP_PRIV"
echo "Server public key (for wg0.conf [Peer]): $SERVER_PUB"
echo "GHA private key (save as GitHub Actions secret VB_GHA_WG_PRIVATE_KEY): $GHA_PRIV"
```

`VB_VM_WG_GHA_PUBLIC_KEY` is the CI runner's WireGuard peer public key — the matching private key lives only in the `VB_GHA_WG_PRIVATE_KEY` GitHub Actions secret, never in this repo or Secret Manager.

### 2a. Adding the GHA peer to an already-provisioned VM

`wg-init.sh` only runs once per VM (guarded by `/var/lib/wg-init.done`), so on an existing VM add the peer directly instead of re-running it:

```bash
GHA_PUB=$(gcloud secrets versions access latest --secret=VB_VM_WG_GHA_PUBLIC_KEY --project=vigilant-broccoli)
gcloud compute ssh vb-free-vm --zone=us-central1-a --tunnel-through-iap -- \
  "sudo wg set wg0 peer ${GHA_PUB} allowed-ips 10.0.1.4/32"
```

This only updates the running interface — re-append the same `[Peer]` block to `/etc/wireguard/wg0.conf` (see `wg-init.sh`) so it survives a reboot.

### 3.Build VM image

```bash
npm run gcp:vm:image:build
```

### 4.Deploy VM

```bash
cd terraform
terraform apply
```

First boot runs `wg-init.service` and `cloudflared-init.service` (tunnel token from Secret Manager). Verify the tunnel with `sudo systemctl status cloudflared` on the VM, or `curl https://vault.harryliu.dev/v1/sys/health` with the Access service token headers.

### 5.Laptop WireGuard config

Write `/opt/homebrew/etc/wireguard/vb.conf`:

```ini
[Interface]
PrivateKey = <LAPTOP_PRIV from step 2>
Address = 10.0.1.2/24

[Peer]
PublicKey = <SERVER_PUB from step 2>
Endpoint = <VM-external-IP>:51820
AllowedIPs = 10.0.1.0/24
PersistentKeepalive = 25
```

```bash
sudo wg-quick up vb
```

### 6. Initialize Vault + configure (first boot only)

```bash
npm run gcp:vm:post-init
```

Initializes Vault, saves unseal keys + root token to GCP Secret Manager, unseals, and configures KV engine, JWT auth, and github-actions role.

After every VM restart, you'll need to re-unseal Vault — see step 10 below.

### 9.Regenerate Vault TLS cert + update WireGuard endpoint (optional)

```bash
npm run gcp:vm:regen-cert
```

Regenerates Vault TLS cert with current external IP, restarts Vault, copies cert to `projects/nx-workspace/scripts/vault-ca.crt`, and updates WireGuard endpoint. Vault will need to be unsealed after (`npm run vm:vault:unseal`).

To update WireGuard endpoint only:

```bash
npm run gcp:vm:update-wg
```

### 7.Test Vault access

```bash
npm run vault:test:local
```

Verify Vault is unsealed and accessible.

### 8.Populate secrets

Create `~/.vault-secrets.json`:

```json
{
  "CLOUDFLARE_ACCOUNT_ID": "...",
  "CLOUDFLARE_API_TOKEN": "...",
  "FLY_API_TOKEN": "..."
}
```

Then run:

```bash
npm run gcp:vm:vault:set-secrets
```

### 10.After VM restart

```bash
npm run vm:vault:unseal
```

If external IP changed:

```bash
npm run gcp:vm:regen-cert
npm run gcp:vm:vault:unseal
sudo wg-quick down vb && sudo wg-quick up vb
```

### 11.Seal Vault

```bash
npm run gcp:vm:vault:seal
```

### 12.Rebuilding image

```bash
npm run gcp:vm:image:build
cd infrastructure/terraform && terraform apply   # destroys /opt/vault/data — re-run steps 6-9
```
