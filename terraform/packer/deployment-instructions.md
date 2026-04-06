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

## 6. Initialize + unseal Vault (first boot only)

```bash
ssh harryliu@10.0.1.1
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_SKIP_VERIFY=true
vault operator init
vault operator unseal <key1>
vault operator unseal <key2>
vault operator unseal <key3>
```

**SAVE unseal keys + root token securely.**

## 7. Configure github-actions-role

```bash
export VAULT_TOKEN=<root-token-from-step-6>
npm run vm:post-init
```

## 8. Regenerate Vault TLS cert + update WireGuard endpoint

```bash
npm run vm:regen-cert
```

Regenerates Vault TLS cert with current external IP, restarts Vault, copies cert to `projects/nx-workspace/scripts/vault-ca.crt`, and updates WireGuard endpoint in `/opt/homebrew/etc/wireguard/vb.conf`. Vault will need to be unsealed after.

To update WireGuard endpoint only:

```bash
npm run vm:update-wg
```

## 9. Populate secrets

```bash
ssh harryliu@10.0.1.1
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_SKIP_VERIFY=true
export VAULT_TOKEN=<root-token>
vault kv put kv/secrets \
  CLOUDFLARE_ACCOUNT_ID=... \
  CLOUDFLARE_API_TOKEN_VB_DEPLOY_NX_APPS=... \
  FLY_API_TOKEN=...
```

## After VM restart

```bash
npm run vm:update-wg
sudo wg-quick down vb && sudo wg-quick up vb
ssh harryliu@10.0.1.1
export VAULT_ADDR=https://127.0.0.1:8200
export VAULT_SKIP_VERIFY=true
vault operator unseal <key1>
vault operator unseal <key2>
vault operator unseal <key3>
```

If external IP changed, run `npm run vm:regen-cert` instead and unseal after.

## Rebuilding image

```bash
cd terraform/packer
make build
cd ..
terraform apply   # destroys /opt/vault/data — re-run steps 6-9
```
