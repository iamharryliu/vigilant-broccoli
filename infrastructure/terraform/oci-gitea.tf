resource "oci_core_vcn" "gitea_vcn" {
  compartment_id = local.oci_tenancy_ocid
  cidr_block     = "10.1.0.0/16"
  display_name   = "gitea-vcn"
  dns_label      = "giteavcn"
}

resource "oci_core_internet_gateway" "gitea_igw" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.gitea_vcn.id
  display_name   = "gitea-igw"
  enabled        = true
}

resource "oci_core_route_table" "gitea_public_rt" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.gitea_vcn.id
  display_name   = "gitea-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.gitea_igw.id
  }
}

resource "oci_core_security_list" "gitea_sl" {
  compartment_id = local.oci_tenancy_ocid
  vcn_id         = oci_core_vcn.gitea_vcn.id
  display_name   = "gitea-security-list"

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

  # Git-over-SSH stays direct — Access only gates the proxied HTTP(S) hostname
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 2222
      max = 2222
    }
  }
}

resource "oci_core_subnet" "gitea_public_subnet" {
  compartment_id    = local.oci_tenancy_ocid
  vcn_id            = oci_core_vcn.gitea_vcn.id
  cidr_block        = "10.1.1.0/24"
  display_name      = "gitea-public-subnet"
  dns_label         = "giteasub"
  route_table_id    = oci_core_route_table.gitea_public_rt.id
  security_list_ids = [oci_core_security_list.gitea_sl.id]
}

# Gitea repo/DB data lives here, not on the boot disk, so it survives VM
# replacement (any cloud-init change forces a new instance). cloud-init formats
# it only on first use, so re-provisioning reattaches existing data intact.
resource "oci_core_volume" "gitea_data" {
  compartment_id      = local.oci_tenancy_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "gitea-data"
  size_in_gbs         = 50

  lifecycle {
    prevent_destroy = true
  }
}

resource "oci_core_volume_attachment" "gitea_data" {
  attachment_type = "paravirtualized"
  instance_id     = oci_core_instance.gitea.id
  volume_id       = oci_core_volume.gitea_data.id
}

resource "oci_core_instance" "gitea" {
  compartment_id      = local.oci_tenancy_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "gitea-vm"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = 1
    memory_in_gbs = 4
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_arm.images[0].id
    boot_volume_size_in_gbs = 50
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.gitea_public_subnet.id
    assign_public_ip = true
  }

  # CI SSH key appended so cron-backup can SSH in to run `gitea dump`.
  metadata = {
    ssh_authorized_keys = "${var.ssh_public_key}${tls_private_key.oci_vm_ci_ssh.public_key_openssh}"
    user_data = base64encode(templatefile("${path.module}/cloud-init-gitea.yaml", {
      gitea_domain      = var.gitea_domain
      gitea_ssh_domain  = var.gitea_ssh_domain
      gitea_origin_cert = cloudflare_origin_ca_certificate.gitea.certificate
      gitea_origin_key  = tls_private_key.gitea_origin.private_key_pem
    }))
  }

  lifecycle {
    ignore_changes = [metadata["ssh_authorized_keys"]]
  }
}

resource "cloudflare_dns_record" "gitea" {
  zone_id = var.cloudflare_zone_id
  name    = var.gitea_domain
  content = oci_core_instance.gitea.public_ip
  type    = "A"
  ttl     = 1
  proxied = true
}

# DNS-only so git-SSH on :2222 reaches the VM directly (the proxy can't forward it).
resource "cloudflare_dns_record" "gitea_ssh" {
  zone_id = var.cloudflare_zone_id
  name    = var.gitea_ssh_domain
  content = oci_core_instance.gitea.public_ip
  type    = "A"
  ttl     = 300
  proxied = false
}
