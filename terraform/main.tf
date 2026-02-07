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
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = "vigilant-broccoli"
  region  = var.region
  zone    = var.zone
}

provider "github" {
  owner = var.github_owner
}

resource "google_compute_instance" "vb_free_vm" {
  name         = "vb-free-vm"
  machine_type = "e2-micro" # Free tier eligible
  zone         = var.zone

  metadata = {
    ssh-keys = "harryliu:ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCdsUNm7YC0dLJ5zNDCNsLcT1c/ff6C/1i0IhAbqKXNGfT5ObXmTtnBOuH1UnTnRGIAr52agN6l5VMx62r90OsCh0+zbvTDSl7dWPvvXOwCXKrftuSKTH84r6gYsRiDGuh6j3zpfokCg1yJlcryp2Dgs1ua26DZm301NXkEaB9MSWYZzgeFv9fmWTgvCXpIHsRnSKV8PINDA3Ouavz1T6uqbAeNL71NVBwEqHlPDWtzGryQdbIS6tA2ufKB8KZSHCZjuORwm8K8Jaf6FIywMOx/3rKOl6u85pI7//D1TORP/pnt1Hn9Wd/QCwtL+J4nhv4eqHtarRpJXtyK7e1c/7Ga8FU/BjNodzA+Sfm5yDg+LZfBcxBVh+8KTCNc1QrmcmhVoPKEh9luG/v/5A8DpuzaG6Wr/c2YKVCU4MU+POFAP94D2M+MgvbHdMDj57oTtqHrNnY97A06LuLpouqmZ6ZG8imbV3pj+UpogpDvJCxZ+iF0+8LJaNnkRzZ84G+hBl5xgQ+JhQ5V7uLYUi0w8D+SwFTTxflTeDBmVgcqPB5TY3tvOasbFIDIP4xCLlPq1J0EaTaESNtfCC7nZPXPjjfjPzKrE56Ne0OLQQdvn1OALvYgSFl58rkSYj1M0esAbQYxfhMzpHovr49wShGg8F+ipCqMRRtzwDbN6fd84M5nTw== harryliu@Harrys-MacBook-Pro.local"
  }

  # Boot disk configuration
  boot_disk {
    auto_delete = false # Keep disk when instance is deleted
    initialize_params {
      size = 10
      # size = 30
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
}

resource "google_compute_firewall" "wireguard" {
  name    = "allow-wireguard-access"
  network = "default"

  direction = "INGRESS"
  priority  = 1000

  allow {
    protocol = "udp"
    ports    = ["51820"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["wireguard"]
}

resource "google_compute_firewall" "allow_iap_ssh" {
  name    = "allow-iap-ssh"
  network = "default"

  direction = "INGRESS"
  priority  = 1000

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["wireguard"]
}

data "google_project" "project" {
}

resource "google_project_service" "iamcredentials" {
  service            = "iamcredentials.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iap" {
  service            = "iap.googleapis.com"
  disable_on_destroy = false
}

resource "google_iam_workload_identity_pool" "github_actions" {
  workload_identity_pool_id = "github-actions"
  display_name              = "GitHub Actions Pool"
  description               = "Workload Identity Pool for GitHub Actions"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_actions.workload_identity_pool_id
  workload_identity_pool_provider_id = "github"
  display_name                       = "GitHub provider"
  description                        = "OIDC identity pool provider for GitHub Actions"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
    "attribute.aud"        = "assertion.aud"
  }

  attribute_condition = "assertion.repository == '${var.github_owner}/${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account" "github_actions" {
  account_id   = "github-actions"
  display_name = "GitHub Actions"
  description  = "Service account for GitHub Actions workflows"
}

resource "google_project_iam_member" "github_actions_compute" {
  project = data.google_project.project.project_id
  role    = "roles/compute.instanceAdmin.v1"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_project_iam_member" "github_actions_iap" {
  project = data.google_project.project.project_id
  role    = "roles/iap.tunnelResourceAccessor"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_service_account_iam_member" "github_actions_workload_identity" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${google_iam_workload_identity_pool.github_actions.workload_identity_pool_id}/attribute.repository/${var.github_owner}/${var.github_repo}"
}

resource "google_service_account_iam_member" "github_actions_compute_service_account" {
  service_account_id = "projects/vigilant-broccoli/serviceAccounts/${data.google_project.project.number}-compute@developer.gserviceaccount.com"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_project_iam_member" "github_actions_oslogin" {
  project = data.google_project.project.project_id
  role    = "roles/compute.osLogin"
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}
