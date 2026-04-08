# Deployment Instructions

## 1. Create Secret Manager secrets + IAM

```bash
cd terraform
terraform apply \
  -target=google_project_service.secretmanager \
  -target=google_project_iam_member.vm_default_sa_secret_accessor \
  -target=google_secret_manager_secret.wg_server_private_key \
  -target=google_secret_manager_secret.wg_server_public_key \
  -target=google_secret_manager_secret.wg_elva11_mbp_public_key
```

## 2. Generate WireGuard keys + populate secrets

```bash
SERVER_PRIV=$(wg genkey)
SERVER_PUB=$(echo "$SERVER_PRIV" | wg pubkey)
LAPTOP_PRIV=$(wg genkey)
LAPTOP_PUB=$(echo "$LAPTOP_PRIV" | wg pubkey)

echo -n "$SERVER_PRIV" | gcloud secrets versions add VB_VM_WG_SERVER_PRIVATE_KEY --data-file=- --project=vigilant-broccoli
echo -n "$SERVER_PUB"  | gcloud secrets versions add VB_VM_WG_SERVER_PUBLIC_KEY  --data-file=- --project=vigilant-broccoli
echo -n "$LAPTOP_PUB"  | gcloud secrets versions add VB_VM_WG_ELVA11_MBP_PUBLIC_KEY --data-file=- --project=vigilant-broccoli

echo "Laptop private key (save for wg0.conf): $LAPTOP_PRIV"
echo "Server public key (for wg0.conf [Peer]): $SERVER_PUB"
```

## 3. Build VM image

```bash
cd terraform/packer
make init
make build
```

## 4. Deploy VM

```bash
cd terraform
terraform apply
```

## 5. Laptop WireGuard config

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

## 6. Initialize Vault + configure (first boot only)

```bash
npm run vm:post-init
```

Initializes Vault, saves unseal keys + root token to GCP Secret Manager, unseals, and configures KV engine, JWT auth, and github-actions role.

## 9. Regenerate Vault TLS cert + update WireGuard endpoint (optional)

```bash
npm run vm:regen-cert
```

Regenerates Vault TLS cert with current external IP, restarts Vault, copies cert to `projects/nx-workspace/scripts/vault-ca.crt`, and updates WireGuard endpoint. Vault will need to be unsealed after (`npm run vm:vault:unseal`).

To update WireGuard endpoint only:

```bash
npm run vm:update-wg
```

## 7. Test Vault access

```bash
npm run vault:test:local
```

Verify Vault is unsealed and accessible.

## 8. Populate secrets

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
npm run vm:vault:set-secrets
```

## 10. After VM restart

```bash
npm run vm:vault:unseal
```

If external IP changed:

```bash
npm run vm:regen-cert
npm run vm:vault:unseal
sudo wg-quick down vb && sudo wg-quick up vb
```

## 11. Seal Vault

```bash
npm run vm:vault:seal
```

## 12. Rebuilding image

```bash
cd terraform/packer
make build
cd ..
terraform apply   # destroys /opt/vault/data — re-run steps 6-9
```
