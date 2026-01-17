variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-east1"
  # default = "us-central1"  # Iowa
  # default = "us-west1"      # Oregon
}

variable "zone" {
  description = "GCP zone for compute resources"
  type        = string
  default     = "us-east1-b"
  # default = "us-east1-c"
  # default = "us-east1-d"
  # default = "us-central1-a"
  # default = "us-central1-b"
  # default = "us-central1-c"
  # default = "us-central1-f"
  # default = "us-west1-a"
  # default = "us-west1-b"
  # default = "us-west1-c"
}

variable "github_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "iamharryliu"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "vigilant-broccoli"
}
