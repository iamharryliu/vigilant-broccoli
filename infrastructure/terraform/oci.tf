data "oci_identity_availability_domains" "ads" {
  compartment_id = local.oci_tenancy_ocid
}

data "oci_core_images" "ubuntu_arm" {
  compartment_id           = local.oci_tenancy_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "22.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "oci_core_vcn" "rabbitmq_vcn" {
  compartment_id = local.oci_tenancy_ocid
  cidr_block     = "10.0.0.0/16"
  display_name   = "rabbitmq-vcn"
  dns_label      = "rabbitmqvcn"
}

resource "oci_core_internet_gateway" "igw" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.rabbitmq_vcn.id
  display_name   = "rabbitmq-igw"
  enabled        = true
}

resource "oci_core_route_table" "public_rt" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.rabbitmq_vcn.id
  display_name   = "rabbitmq-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.igw.id
  }
}

resource "oci_core_security_list" "rabbitmq_sl" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.rabbitmq_vcn.id
  display_name   = "rabbitmq-security-list"

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

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 5671
      max = 5671
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_subnet" "public_subnet" {
  compartment_id    = local.oci_tenancy_ocid
  vcn_id            = oci_core_vcn.rabbitmq_vcn.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "rabbitmq-public-subnet"
  dns_label         = "rabbitmqsub"
  route_table_id    = oci_core_route_table.public_rt.id
  security_list_ids = [oci_core_security_list.rabbitmq_sl.id]
}

# ARM Ampere A1 — Oracle Free Tier: up to 4 OCPUs + 24GB RAM total
resource "oci_core_instance" "rabbitmq" {
  compartment_id      = local.oci_tenancy_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "rabbitmq-vm"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 1
    memory_in_gbs = 6
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_arm.images[0].id
    boot_volume_size_in_gbs = 50
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = true
  }

  metadata = {
    ssh_authorized_keys = "${var.ssh_public_key}${tls_private_key.oci_vm_ci_ssh.public_key_openssh}"
    user_data = base64encode(templatefile("${path.module}/cloud-init-rabbitmq.yaml", {
      rabbitmq_user        = var.rabbitmq_user
      rabbitmq_password    = random_password.rabbitmq_password.result
      rabbitmq_tls_key     = tls_private_key.rabbitmq.private_key_pem
      rabbitmq_tls_cert    = tls_locally_signed_cert.rabbitmq.cert_pem
      rabbitmq_ca_cert     = tls_self_signed_cert.rabbitmq_ca.cert_pem
      shared_app_token     = random_password.shared_app_token.result
      socket_server_domain = var.socket_server_domain
      acme_email           = var.acme_email
      cloudflared_token    = data.cloudflare_zero_trust_tunnel_cloudflared_token.rabbitmq.token
    }))
  }

  # Metadata changes force VM replacement; key changes on the live VM are
  # handled by post-apply.sh, while replacements pick up the config value.
  lifecycle {
    ignore_changes = [metadata["ssh_authorized_keys"]]
  }
}

resource "cloudflare_dns_record" "socket_server" {
  zone_id = var.cloudflare_zone_id
  name    = var.socket_server_domain
  content = oci_core_instance.rabbitmq.public_ip
  type    = "A"
  ttl     = 300
  proxied = false
}

resource "cloudflare_zero_trust_tunnel_cloudflared" "rabbitmq" {
  account_id = var.cloudflare_account_id
  name       = "rabbitmq"
  config_src = "cloudflare"
}

data "cloudflare_zero_trust_tunnel_cloudflared_token" "rabbitmq" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.rabbitmq.id
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "rabbitmq" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.rabbitmq.id

  config = {
    ingress = [
      {
        hostname = var.rabbitmq_management_domain
        # Compose DNS name; it is the `rabbitmq` SAN on the leaf cert, so the
        # origin is verified against the private CA instead of skipping TLS.
        service = "https://rabbitmq:15671"
        origin_request = {
          origin_server_name = "rabbitmq"
          ca_pool            = "/etc/rabbitmq/certs/ca.crt"
        }
      },
      {
        service = "http_status:404"
      }
    ]
  }
}

resource "cloudflare_dns_record" "rabbitmq_management" {
  zone_id = var.cloudflare_zone_id
  name    = var.rabbitmq_management_domain
  content = "${cloudflare_zero_trust_tunnel_cloudflared.rabbitmq.id}.cfargotunnel.com"
  type    = "CNAME"
  ttl     = 1
  proxied = true
}

resource "cloudflare_zero_trust_access_policy" "rabbitmq" {
  account_id = var.cloudflare_account_id
  name       = "rabbitmq-allow-owner"
  decision   = "allow"
  include    = [for email in var.rabbitmq_allowed_emails : { email = { email = email } }]
}

resource "cloudflare_zero_trust_access_application" "rabbitmq" {
  account_id       = var.cloudflare_account_id
  name             = "rabbitmq"
  domain           = var.rabbitmq_management_domain
  type             = "self_hosted"
  session_duration = "24h"

  policies = [
    {
      id         = cloudflare_zero_trust_access_policy.rabbitmq.id
      precedence = 1
    },
  ]
}
