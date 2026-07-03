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

output "oci_vm_rabbitmq_management_url" {
  value = "https://${oci_core_instance.rabbitmq.public_ip}:15671"
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
  value = "ssh://git@${var.gitea_domain}:2222/<owner>/<repo>.git"
}

output "oci_code_server_public_ip" {
  value = oci_core_instance.code_server.public_ip
}

output "oci_code_server_url" {
  value = "https://${var.code_server_domain}"
}

output "oci_code_server_password" {
  value     = random_password.code_server_password.result
  sensitive = true
}
