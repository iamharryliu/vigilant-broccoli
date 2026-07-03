resource "oci_core_vcn" "code_server_vcn" {
  compartment_id = local.oci_tenancy_ocid
  cidr_block     = "10.2.0.0/16"
  display_name   = "code-server-vcn"
  dns_label      = "codeservervcn"
}

resource "oci_core_internet_gateway" "code_server_igw" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.code_server_vcn.id
  display_name   = "code-server-igw"
  enabled        = true
}

resource "oci_core_route_table" "code_server_public_rt" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.code_server_vcn.id
  display_name   = "code-server-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.code_server_igw.id
  }
}

resource "oci_core_security_list" "code_server_sl" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.code_server_vcn.id
  display_name   = "code-server-security-list"

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

resource "oci_core_subnet" "code_server_public_subnet" {
  compartment_id    = local.oci_tenancy_ocid
  vcn_id            = oci_core_vcn.code_server_vcn.id
  cidr_block        = "10.2.1.0/24"
  display_name      = "code-server-public-subnet"
  dns_label         = "codeserversub"
  route_table_id    = oci_core_route_table.code_server_public_rt.id
  security_list_ids = [oci_core_security_list.code_server_sl.id]
}

resource "random_password" "code_server_password" {
  length  = 32
  special = false
}

resource "oci_core_instance" "code_server" {
  compartment_id      = local.oci_tenancy_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "code-server-vm"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 2
    memory_in_gbs = 14
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_arm.images[0].id
    boot_volume_size_in_gbs = 50
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.code_server_public_subnet.id
    assign_public_ip = true
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(templatefile("${path.module}/cloud-init-code-server.yaml", {
      code_server_domain      = var.code_server_domain
      code_server_password    = random_password.code_server_password.result
      code_server_origin_cert = cloudflare_origin_ca_certificate.code_server.certificate
      code_server_origin_key  = tls_private_key.code_server_origin.private_key_pem
    }))
  }
}

resource "tls_private_key" "code_server_origin" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "tls_cert_request" "code_server_origin" {
  private_key_pem = tls_private_key.code_server_origin.private_key_pem

  subject {
    common_name = var.code_server_domain
  }
}

# 15-year Cloudflare Origin CA cert — replaces ACME, which can't complete behind Access
resource "cloudflare_origin_ca_certificate" "code_server" {
  csr                = tls_cert_request.code_server_origin.cert_request_pem
  hostnames          = [var.code_server_domain]
  request_type       = "origin-rsa"
  requested_validity = 5475
}

resource "cloudflare_dns_record" "code_server" {
  zone_id = var.cloudflare_zone_id
  name    = var.code_server_domain
  content = oci_core_instance.code_server.public_ip
  type    = "A"
  ttl     = 1
  proxied = true
}

data "cloudflare_ip_ranges" "cloudflare" {}

resource "cloudflare_zero_trust_access_policy" "code_server" {
  account_id = var.cloudflare_account_id
  name       = "code-server-allow-owner"
  decision   = "allow"
  include    = [for email in var.code_server_allowed_emails : { email = { email = email } }]
}

resource "cloudflare_zero_trust_access_application" "code_server" {
  account_id       = var.cloudflare_account_id
  name             = "code-server"
  domain           = var.code_server_domain
  type             = "self_hosted"
  session_duration = "24h"

  policies = [{
    id         = cloudflare_zero_trust_access_policy.code_server.id
    precedence = 1
  }]
}
