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

output "aws_immich_public_ip" {
  value = aws_eip.immich.public_ip
}

output "aws_immich_url" {
  value = "https://${var.immich_domain}"
}

output "aws_grafana_public_ip" {
  value = aws_eip.grafana.public_ip
}

output "aws_grafana_url" {
  value = "https://${var.grafana_domain}"
}

output "loki_push_url" {
  value = "https://${var.loki_domain}/loki/api/v1/push"
}

output "docs_url" {
  value = "https://${var.docs_domain}"
}

output "nx_cache_url" {
  value = "https://${var.nx_cache_domain}"
}
