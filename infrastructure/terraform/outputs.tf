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
