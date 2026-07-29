resource "oci_core_vcn" "seafile_vcn" {
  compartment_id = local.oci_tenancy_ocid
  cidr_block     = "10.3.0.0/16"
  display_name   = "seafile-vcn"
  dns_label      = "seafilevcn"
}

resource "oci_core_internet_gateway" "seafile_igw" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.seafile_vcn.id
  display_name   = "seafile-igw"
  enabled        = true
}

resource "oci_core_route_table" "seafile_public_rt" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.seafile_vcn.id
  display_name   = "seafile-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.seafile_igw.id
  }
}

resource "oci_core_security_list" "seafile_sl" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.seafile_vcn.id
  display_name   = "seafile-security-list"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 22
      max = 22
    }
  }

  # 80/443 restricted to Cloudflare so Access can't be bypassed via direct IP
  dynamic "ingress_security_rules" {
    for_each = data.cloudflare_ip_ranges.cloudflare.ipv4_cidrs
    content {
      protocol = "6"
      source   = ingress_security_rules.value
      tcp_options {
        min = 80
        max = 80
      }
    }
  }

  dynamic "ingress_security_rules" {
    for_each = data.cloudflare_ip_ranges.cloudflare.ipv4_cidrs
    content {
      protocol = "6"
      source   = ingress_security_rules.value
      tcp_options {
        min = 443
        max = 443
      }
    }
  }
}

resource "oci_core_subnet" "seafile_public_subnet" {
  compartment_id    = local.oci_tenancy_ocid
  vcn_id            = oci_core_vcn.seafile_vcn.id
  cidr_block        = "10.3.1.0/24"
  display_name      = "seafile-public-subnet"
  dns_label         = "seafilesub"
  route_table_id    = oci_core_route_table.seafile_public_rt.id
  security_list_ids = [oci_core_security_list.seafile_sl.id]
}

resource "random_password" "seafile_db_root_password" {
  length  = 32
  special = false
}

resource "random_password" "seafile_admin_password" {
  length  = 32
  special = false
}

# Single 20GB boot volume, no separate data volume (unlike gitea) — traded off
# against code-server's boot volume to stay within OCI's 200GB free block
# storage cap. Fine for documents/small media, tight for large photo/video
# libraries.
resource "oci_core_instance" "seafile" {
  compartment_id      = local.oci_tenancy_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "seafile-vm"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 1
    memory_in_gbs = 8
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_arm.images[0].id
    boot_volume_size_in_gbs = 20
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.seafile_public_subnet.id
    assign_public_ip = true
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(templatefile("${path.module}/cloud-init-seafile.yaml", {
      seafile_domain           = var.seafile_domain
      seafile_origin_cert      = cloudflare_origin_ca_certificate.seafile.certificate
      seafile_origin_key       = tls_private_key.seafile_origin.private_key_pem
      seafile_db_root_password = random_password.seafile_db_root_password.result
      seafile_admin_email      = var.seafile_admin_email
      seafile_admin_password   = random_password.seafile_admin_password.result
    }))
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
  content = oci_core_instance.seafile.public_ip
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
