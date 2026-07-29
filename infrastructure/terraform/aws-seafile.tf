data "aws_ami" "ubuntu" {
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

resource "aws_security_group" "seafile" {
  name        = "seafile-sg"
  description = "Seafile VM: SSH open, 80/443 restricted to Cloudflare so Access can't be bypassed via direct IP"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = data.cloudflare_ip_ranges.cloudflare.ipv4_cidrs
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = data.cloudflare_ip_ranges.cloudflare.ipv4_cidrs
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "seafile-sg"
  }
}

resource "random_password" "seafile_db_root_password" {
  length  = 32
  special = false
}

resource "random_password" "seafile_admin_password" {
  length  = 32
  special = false
}

resource "aws_instance" "seafile" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.medium"
  vpc_security_group_ids = [aws_security_group.seafile.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = base64encode(templatefile("${path.module}/cloud-init-seafile.yaml", {
    seafile_ssh_keys         = split("\n", trimspace(var.ssh_public_key))
    seafile_domain           = var.seafile_domain
    seafile_origin_cert      = cloudflare_origin_ca_certificate.seafile.certificate
    seafile_origin_key       = tls_private_key.seafile_origin.private_key_pem
    seafile_db_root_password = random_password.seafile_db_root_password.result
    seafile_admin_email      = var.seafile_admin_email
    seafile_admin_password   = random_password.seafile_admin_password.result
  }))

  tags = {
    Name = "seafile-vm"
  }
}

resource "tls_private_key" "seafile_origin" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_cert_request" "seafile_origin" {
  private_key_pem = tls_private_key.seafile_origin.private_key_pem

  subject {
    common_name = var.seafile_domain
  }
}

# 15-year Cloudflare Origin CA cert — replaces ACME, which can't complete behind Access
resource "cloudflare_origin_ca_certificate" "seafile" {
  csr                = tls_cert_request.seafile_origin.cert_request_pem
  hostnames          = [var.seafile_domain]
  request_type       = "origin-rsa"
  requested_validity = 5475
}

resource "cloudflare_dns_record" "seafile" {
  zone_id = var.cloudflare_zone_id
  name    = var.seafile_domain
  content = aws_instance.seafile.public_ip
  type    = "A"
  ttl     = 1
  proxied = true
}

resource "cloudflare_zero_trust_access_policy" "seafile" {
  account_id = var.cloudflare_account_id
  name       = "seafile-allow-owner"
  decision   = "allow"
  include    = [for email in var.seafile_allowed_emails : { email = { email = email } }]
}

resource "cloudflare_zero_trust_access_application" "seafile" {
  account_id       = var.cloudflare_account_id
  name             = "seafile"
  domain           = var.seafile_domain
  type             = "self_hosted"
  session_duration = "24h"

  policies = [
    {
      id         = cloudflare_zero_trust_access_policy.seafile.id
      precedence = 1
    },
  ]
}
