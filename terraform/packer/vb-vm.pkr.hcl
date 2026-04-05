packer {
  required_plugins {
    googlecompute = {
      version = ">= 1.1.1"
      source  = "github.com/hashicorp/googlecompute"
    }
  }
}

variable "project_id" {
  type        = string
  description = "GCP Project ID"
  default     = "vigilant-broccoli"
}

variable "zone" {
  type        = string
  description = "GCP Zone"
  default     = "us-east1-b"
}

variable "image_family" {
  type        = string
  description = "Image family name"
  default     = "vb-vm"
}

variable "source_image_family" {
  type        = string
  description = "Source image family"
  default     = "debian-12"
}

variable "source_image_project_id" {
  type        = list(string)
  description = "Source image project"
  default     = ["debian-cloud"]
}

variable "machine_type" {
  type        = string
  description = "Machine type for building"
  default     = "e2-small"
}

variable "disk_size" {
  type        = number
  description = "Disk size in GB"
  default     = 10
}

source "googlecompute" "vb-vm" {
  project_id              = var.project_id
  source_image_family     = var.source_image_family
  source_image_project_id = var.source_image_project_id
  zone                    = var.zone
  machine_type            = var.machine_type
  disk_size               = var.disk_size
  disk_type               = "pd-standard"

  image_name        = "${var.image_family}-{{timestamp}}"
  image_family      = var.image_family
  image_description = "Vigilant Broccoli VM image with Vault + Docker + WireGuard - Built at {{isotime}}"

  image_labels = {
    managed_by = "packer"
    created    = "{{isotime \"2006-01-02\"}}"
  }

  ssh_username = "packer"

  network          = "default"
  omit_external_ip = false
  use_iap          = true

  scopes = [
    "https://www.googleapis.com/auth/cloud-platform",
  ]

  tags = ["packer-build"]
}

build {
  name    = "vb-vm"
  sources = ["source.googlecompute.vb-vm"]

  provisioner "file" {
    source      = "${path.root}/scripts/provision.sh"
    destination = "/tmp/provision.sh"
  }

  provisioner "file" {
    source      = "${path.root}/scripts/vault-config.hcl"
    destination = "/tmp/vault-config.hcl"
  }

  provisioner "file" {
    source      = "${path.root}/scripts/vault.service"
    destination = "/tmp/vault.service"
  }

  provisioner "file" {
    source      = "${path.root}/scripts/vault-openssl.cnf"
    destination = "/tmp/vault-openssl.cnf"
  }

  provisioner "file" {
    source      = "${path.root}/scripts/wg-init.sh"
    destination = "/tmp/wg-init.sh"
  }

  provisioner "file" {
    source      = "${path.root}/scripts/wg-init.service"
    destination = "/tmp/wg-init.service"
  }

  provisioner "file" {
    source      = "${path.root}/scripts/99-wireguard.conf"
    destination = "/tmp/99-wireguard.conf"
  }

  provisioner "file" {
    source      = "${path.root}/scripts/vault-post-init.sh"
    destination = "/tmp/vault-post-init.sh"
  }

  provisioner "shell" {
    inline = [
      "set -e",
      "sudo chmod +x /tmp/provision.sh",
      "sudo /tmp/provision.sh",
      "echo 'Provisioning completed successfully'",
    ]
  }

  provisioner "shell" {
    inline = [
      "set -e",
      "echo 'Running cleanup...'",
      "sudo apt-get clean",
      "sudo rm -rf /tmp/*",
      "sudo rm -rf /var/tmp/*",
      "sudo rm -f /root/.bash_history",
      "sudo rm -f /home/*/.bash_history",
      "sudo find /var/log -type f -exec truncate -s 0 {} \\;",
      "echo 'Cleanup completed'",
    ]
  }

  post-processor "manifest" {
    output     = "packer-manifest.json"
    strip_path = true
  }
}
