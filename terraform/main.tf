terraform {
  required_version = ">= 1.0"

  # Terraform Cloud - using local execution with remote state storage
  cloud {
    organization = "vigilant-broccoli"

    workspaces {
      name = "vigilant-broccoli-infrastructure"
    }
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "vigilant-broccoli"
  region  = "us-east1"
  zone    = "us-east1-b"
}

resource "google_compute_instance" "vb_free_vm" {
  name         = "vb-free-vm"
  machine_type = "e2-micro" # Free tier eligible
  zone         = "us-east1-b"

  # Boot disk configuration
  boot_disk {
    auto_delete = false # Keep disk when instance is deleted
    initialize_params {
      size = 10 # Current disk size
      type = "pd-standard"
    }
  }

  # Network interface
  network_interface {
    network = "default"

    # Access configuration for external IP
    access_config {
      # Ephemeral external IP
    }
  }

  # Network tags
  tags = ["wireguard"]

  # Service account
  service_account {
    scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring.write",
      "https://www.googleapis.com/auth/pubsub",
      "https://www.googleapis.com/auth/service.management.readonly",
      "https://www.googleapis.com/auth/servicecontrol",
      "https://www.googleapis.com/auth/trace.append",
    ]
  }

  # Scheduling options
  scheduling {
    automatic_restart   = true
    on_host_maintenance = "MIGRATE"
    preemptible         = false
  }

  # Deletion protection disabled
  deletion_protection = false

  # Allow stopping for updates
  allow_stopping_for_update = true
}
