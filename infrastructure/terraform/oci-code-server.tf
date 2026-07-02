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
      code_server_domain   = var.code_server_domain
      code_server_password = random_password.code_server_password.result
      acme_email           = var.acme_email
    }))
  }
}

resource "cloudflare_dns_record" "code_server" {
  zone_id = var.cloudflare_zone_id
  name    = var.code_server_domain
  content = oci_core_instance.code_server.public_ip
  type    = "A"
  ttl     = 300
  proxied = false
}
