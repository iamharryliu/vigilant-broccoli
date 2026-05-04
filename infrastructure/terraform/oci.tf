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
      max = 5672
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 15671
      max = 15672
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
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu_arm.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = true
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(templatefile("${path.module}/cloud-init-rabbitmq.yaml", {
      rabbitmq_user              = var.rabbitmq_user
      rabbitmq_password          = random_password.rabbitmq_password.result
      email_consumer_image       = var.email_consumer_image
      email_service_url          = var.email_service_url
      email_service_api_key_random = random_password.email_service_api_key.result
      rabbitmq_tls_key           = tls_private_key.rabbitmq.private_key_pem
      rabbitmq_tls_cert          = tls_self_signed_cert.rabbitmq.cert_pem
    }))
  }
}
