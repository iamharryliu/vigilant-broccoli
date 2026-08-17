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

output "aws_seafile_public_ip" {
  value = aws_eip.seafile.public_ip
}

output "aws_seafile_url" {
  value = "https://${var.seafile_domain}"
}

output "journal_url" {
  value = "https://${var.journal_domain}"
}

output "docs_url" {
  value = "https://${var.docs_domain}"
}

output "nx_cache_url" {
  value = "https://${var.nx_cache_domain}"
}

# Not sensitive: a WIF provider path or SA email grants nothing by itself —
# the actual boundary is the attribute_condition + IAM bindings. Paste these
# literally into ci-pr-check.yml's vault-secrets step (not a repo secret —
# see the comment there for why).
output "github_actions_pr_check_workload_identity_provider" {
  value = google_iam_workload_identity_pool_provider.github_pr_check.name
}

output "github_actions_pr_check_service_account_email" {
  value = google_service_account.github_actions_pr_check.email
}
