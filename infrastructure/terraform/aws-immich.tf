# Immich on AWS, exposed via an outbound-only Cloudflare Tunnel (like
# cloudflare-vault.tf) rather than Seafile's direct-A-record + Origin CA
# pattern (aws-seafile.tf) — no inbound 80/443 rule is needed at all, so the
# security group only opens SSH.

data "aws_ami" "immich" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "immich" {
  name        = "immich-sg"
  description = "Immich VM: SSH only, the app is reachable solely through the outbound cloudflared tunnel, no inbound 80/443"

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
    Name = "immich-sg"
  }
}

resource "random_password" "immich_db_password" {
  length  = 32
  special = false
}

# Immich's library/DB live here, not on the boot disk, so they survive VM
# replacement (AMI updates force a new instance whenever Canonical publishes a
# new Ubuntu 22.04 build — see data.aws_ami.immich). cloud-init formats it only
# on first use, so re-provisioning reattaches existing data intact.
resource "aws_ebs_volume" "immich_data" {
  availability_zone = "eu-north-1a"
  size              = 100
  type              = "gp3"
  encrypted         = true

  tags = {
    Name = "immich-data"
  }
}

resource "aws_volume_attachment" "immich_data" {
  device_name = "/dev/sdf"
  volume_id   = aws_ebs_volume.immich_data.id
  instance_id = aws_instance.immich.id
}

resource "aws_instance" "immich" {
  ami                    = data.aws_ami.immich.id
  instance_type          = "t3.medium"
  vpc_security_group_ids = [aws_security_group.immich.id]

  # Pinned so a replaced instance always lands in the same AZ as
  # aws_ebs_volume.immich_data (EBS volumes can't cross AZs).
  availability_zone = "eu-north-1a"

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
    encrypted   = true
  }

  metadata_options {
    http_tokens = "required"
  }

  # aws_instance defaults this to false: a user_data-only change (no other
  # ForceNew attribute in the same apply) would otherwise sit in state without
  # ever reaching the running instance, since AWS doesn't re-run cloud-init on
  # a live boot. This VM is entirely cloud-init-driven, so any user_data edit
  # should always mean a fresh boot.
  user_data_replace_on_change = true

  user_data = base64encode(templatefile("${path.module}/cloud-init-immich.yaml", {
    immich_ssh_keys          = split("\n", trimspace(var.ssh_public_key))
    immich_db_password       = random_password.immich_db_password.result
    immich_cloudflared_token = data.cloudflare_zero_trust_tunnel_cloudflared_token.immich.token
  }))

  tags = {
    Name = "immich-vm"
  }
}

# Kept for stable SSH access; the box also needs outbound internet (apt,
# docker pulls, the cloudflared connection to Cloudflare's edge) regardless
# of the tunnel, so a public IP stays required even with no inbound app ports.
resource "aws_eip" "immich" {
  instance = aws_instance.immich.id
  domain   = "vpc"

  tags = {
    Name = "immich-eip"
  }
}

resource "cloudflare_zero_trust_tunnel_cloudflared" "immich" {
  account_id = var.cloudflare_account_id
  name       = "immich"
  config_src = "cloudflare"
}

data "cloudflare_zero_trust_tunnel_cloudflared_token" "immich" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.immich.id
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "immich" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.immich.id

  config = {
    ingress = [
      {
        hostname = var.immich_domain
        # cloudflared runs as its own container in the compose stack (see
        # cloud-init-immich.yaml), so "localhost" here would mean the
        # cloudflared container itself, not immich-server — route over
        # Compose's internal DNS by service name instead.
        service = "http://immich-server:2283"
      },
      {
        service = "http_status:404"
      }
    ]
  }
}

resource "cloudflare_dns_record" "immich" {
  zone_id = var.cloudflare_zone_id
  name    = var.immich_domain
  content = "${cloudflare_zero_trust_tunnel_cloudflared.immich.id}.cfargotunnel.com"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_zero_trust_access_policy" "immich" {
  account_id = var.cloudflare_account_id
  name       = "immich-allow-owner"
  decision   = "allow"
  include    = [for email in var.immich_allowed_emails : { email = { email = email } }]
}

resource "cloudflare_zero_trust_access_application" "immich" {
  account_id       = var.cloudflare_account_id
  name             = "immich"
  domain           = var.immich_domain
  type             = "self_hosted"
  session_duration = "24h"

  policies = [
    {
      id         = cloudflare_zero_trust_access_policy.immich.id
      precedence = 1
    },
  ]
}
