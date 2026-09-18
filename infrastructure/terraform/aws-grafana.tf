# Observability VM (Grafana + Loki + Alloy) on AWS, exposed through an
# outbound-only Cloudflare Tunnel like aws-immich.tf. Two hostnames ride the
# same tunnel: the Grafana UI behind Cloudflare Access (owner email), and a
# Loki push endpoint behind nginx basic auth so machine clients — the Fly
# log shipper first — can post logs without an interactive Access login.

resource "aws_security_group" "grafana" {
  name        = "grafana-sg"
  description = "Observability VM: SSH only, Grafana and Loki are reachable solely through the outbound cloudflared tunnel, no inbound 80/443"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "grafana-sg"
  }
}

# Pulled from state by `pnpm grafana:password` (Cloudflare Access already
# gates the UI; this is Grafana's own admin login behind it).
resource "random_password" "grafana_admin_password" {
  length  = 32
  special = false
}

# Basic-auth secret for the Loki push hostname. Synced to Vault as
# LOKI_PUSH_PASSWORD by tf:post-apply so `pnpm logs:shipper:deploy` can hand
# it to the Fly log shipper.
resource "random_password" "loki_push_password" {
  length  = 32
  special = false
}

# Loki chunks/index and Grafana's sqlite db live here, not on the boot disk,
# so log history and dashboards survive VM replacement. cloud-init formats it
# only on first use.
resource "aws_ebs_volume" "grafana_data" {
  availability_zone = "eu-north-1a"
  size              = 20
  type              = "gp3"
  encrypted         = true

  tags = {
    Name = "grafana-data"
  }
}

resource "aws_volume_attachment" "grafana_data" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.grafana_data.id
  instance_id = aws_instance.grafana.id
}

resource "aws_instance" "grafana" {
  ami                    = var.ubuntu_ami
  instance_type          = var.grafana_instance_type
  vpc_security_group_ids = [aws_security_group.grafana.id]

  # Pinned so a replaced instance always lands in the same AZ as
  # aws_ebs_volume.grafana_data (EBS volumes can't cross AZs).
  availability_zone = "eu-north-1a"

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  metadata_options {
    http_tokens = "required"
  }

  # Entirely cloud-init-driven, so any user_data edit should mean a fresh boot
  # (see the matching note in aws-immich.tf).
  user_data_replace_on_change = true

  user_data = base64encode(templatefile("${path.module}/cloud-init-grafana.yaml", {
    grafana_ssh_keys          = split("\n", trimspace(var.ssh_public_key))
    grafana_domain            = var.grafana_domain
    grafana_admin_password    = random_password.grafana_admin_password.result
    loki_push_user            = var.loki_push_user
    loki_push_password        = random_password.loki_push_password.result
    grafana_cloudflared_token = data.cloudflare_zero_trust_tunnel_cloudflared_token.grafana.token
  }))

  tags = {
    Name = "grafana-vm"
  }
}

resource "aws_eip" "grafana" {
  instance = aws_instance.grafana.id
  domain   = "vpc"

  tags = {
    Name = "grafana-eip"
  }
}

resource "cloudflare_zero_trust_tunnel_cloudflared" "grafana" {
  account_id = var.cloudflare_account_id
  name       = "grafana"
  config_src = "cloudflare"
}

data "cloudflare_zero_trust_tunnel_cloudflared_token" "grafana" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.grafana.id
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "grafana" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.grafana.id

  config = {
    ingress = [
      {
        hostname = var.grafana_domain
        # Service names resolve over Compose's internal DNS (cloudflared is a
        # container in the same stack, see cloud-init-grafana.yaml).
        service = "http://grafana:3000"
      },
      {
        hostname = var.loki_domain
        # nginx in front of Loki: basic auth, and only the push/ready paths.
        service = "http://loki-gateway:80"
      },
      {
        service = "http_status:404"
      }
    ]
  }
}

resource "cloudflare_dns_record" "grafana" {
  zone_id = var.cloudflare_zone_id
  name    = var.grafana_domain
  content = "${cloudflare_zero_trust_tunnel_cloudflared.grafana.id}.cfargotunnel.com"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_dns_record" "loki" {
  zone_id = var.cloudflare_zone_id
  name    = var.loki_domain
  content = "${cloudflare_zero_trust_tunnel_cloudflared.grafana.id}.cfargotunnel.com"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_zero_trust_access_policy" "grafana" {
  account_id = var.cloudflare_account_id
  name       = "grafana-allow-owner"
  decision   = "allow"
  include    = [for email in var.grafana_allowed_emails : { email = { email = email } }]
}

# Only the Grafana hostname gets an Access application. The Loki hostname is
# deliberately left out: its clients are non-interactive (the Fly log shipper
# can send basic auth but not Access service-token headers), so nginx's
# htpasswd is the gate there and the exposed surface is the push path alone.
resource "cloudflare_zero_trust_access_application" "grafana" {
  account_id       = var.cloudflare_account_id
  name             = "grafana"
  domain           = var.grafana_domain
  type             = "self_hosted"
  session_duration = "24h"

  policies = [
    {
      id         = cloudflare_zero_trust_access_policy.grafana.id
      precedence = 1
    },
  ]
}
