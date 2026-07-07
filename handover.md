# Handover: CI Vault access via Cloudflare Tunnel

CI no longer reaches Vault on `vb-free-vm` through GCP IAP or WireGuard. The
VM runs `cloudflared`, which dials out to Cloudflare and exposes Vault at
`https://vault.harryliu.dev`, gated by a Cloudflare Access service token.
Workflows send the service token headers and authenticate to Vault with the
existing GitHub OIDC JWT roles — plain HTTPS, so concurrent workflows no
longer contend for a tunnel, and the VM's ephemeral external IP no longer
matters for CI.

Code changes are done and staged. These steps are manual / out-of-repo and
still need to happen before CI will work again:

## 1. Apply Terraform

```bash
pnpm tf:apply
```

Creates the tunnel, the `vault.harryliu.dev` DNS record, the Access
application/policy, the `vault-ci` service token, the
`VB_VM_CLOUDFLARED_TUNNEL_TOKEN` GCP secret, and pushes
`VAULT_CF_ACCESS_CLIENT_ID` / `VAULT_CF_ACCESS_CLIENT_SECRET` GitHub Actions
secrets — no hand-copied credentials.

Note: the Cloudflare API token used by Terraform needs Zero Trust
(Access: Apps and Policies + Cloudflare Tunnel) edit permissions in addition
to the existing zone/DNS ones — update it at the Cloudflare dashboard first
if `tf:apply` 403s.

## 2. Install cloudflared on the already-running VM

`cloudflared-init.sh` only runs on first boot of a freshly built image, so on
the existing VM do it once by hand (this is the last time IAP is needed):

```bash
pnpm gcp:vm:ssh
# then on the VM:
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared bookworm main" | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt-get update && sudo apt-get install -y cloudflared
sudo mkdir -p /etc/cloudflared
sudo sh -c 'umask 077; printf "TUNNEL_TOKEN=%s\n" "$(gcloud secrets versions access latest --secret=VB_VM_CLOUDFLARED_TUNNEL_TOKEN)" > /etc/cloudflared/env'
sudo tee /etc/systemd/system/cloudflared.service > /dev/null <<'EOF'
[Unit]
Description=Cloudflare Tunnel (Vault ingress)
After=network-online.target
Wants=network-online.target

[Service]
EnvironmentFile=/etc/cloudflared/env
ExecStart=/usr/bin/cloudflared --no-autoupdate tunnel run --token ${TUNNEL_TOKEN}
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared
```

The next image rebuild (`pnpm gcp:vm:image:build`) bakes all of this in;
first boot then only needs the tunnel token secret to exist.

## 3. Remove the WireGuard GHA leftovers

Nothing was ever applied for the abandoned WireGuard-CI approach, so this is
just checking there's no drift:

- GCP secret `VB_VM_WG_GHA_PUBLIC_KEY`: if a previous `terraform apply`
  created it, the next apply removes it (it's gone from main.tf).
- GitHub secret `VB_GHA_WG_PRIVATE_KEY` / variable `VAULT_VM_WG_ENDPOINT`:
  were never created — nothing to do.
- Laptop WireGuard peers (10.0.1.2/.3) are untouched; local scripts still use
  `https://10.0.1.1:8200` over WireGuard.

## 4. Keep

- `GCP_WORKLOAD_IDENTITY_PROVIDER` / `GCP_SERVICE_ACCOUNT` repo secrets:
  still used by `cron-health-check.yml` (VM status via gcloud) and
  `test-smoke-gcp-secret-manager.yml`.

## 5. Verify

Trigger `test-smoke-vault-service.yml` manually and confirm it authenticates
with no GCP auth step and no WireGuard step in the logs. Then run
`cron-health-check` — the Vault check now goes through
`https://vault.harryliu.dev/v1/sys/health` with the service token headers.
