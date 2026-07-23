output "gcp_vm_external_ip" {
  description = "External IP of vb-free-vm"
  value       = google_compute_instance.vb_free_vm.network_interface[0].access_config[0].nat_ip
}

output "gcp_vm_internal_ip" {
  description = "Internal IP of vb-free-vm"
  value       = google_compute_instance.vb_free_vm.network_interface[0].network_ip
}

output "oci_vm_public_ip" {
  value = oci_core_instance.rabbitmq.public_ip
}

output "oci_vm_socket_server_url" {
  value = "https://${var.socket_server_domain}"
}

output "oci_gitea_public_ip" {
  value = oci_core_instance.gitea.public_ip
}

output "oci_gitea_url" {
  value = "https://${var.gitea_domain}"
}

output "oci_gitea_ssh_clone_hint" {
  value = "ssh://git@${var.gitea_ssh_domain}:2222/<owner>/<repo>.git"
}

output "oci_code_server_public_ip" {
  value = oci_core_instance.code_server.public_ip
}

output "oci_code_server_url" {
  value = "https://${var.code_server_domain}"
}

output "journal_url" {
  value = "https://${var.journal_domain}"
}

output "docs_url" {
  value = "https://${var.docs_domain}"
}

output "nx_cache_r2_bucket" {
  value = cloudflare_r2_bucket.nx_cache.name
}

output "nx_cache_r2_endpoint" {
  description = "S3 endpoint for the Nx remote cache; matches the `endpoint` in nx.json's s3 config."
  value       = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
}
