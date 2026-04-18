output "vb_free_vm_external_ip" {
  description = "External IP of vb-free-vm"
  value       = google_compute_instance.vb_free_vm.network_interface[0].access_config[0].nat_ip
}

output "vb_free_vm_internal_ip" {
  description = "Internal IP of vb-free-vm"
  value       = google_compute_instance.vb_free_vm.network_interface[0].network_ip
}

output "rabbitmq_public_ip" {
  value = oci_core_instance.rabbitmq.public_ip
}

output "rabbitmq_management_url" {
  value = "https://${oci_core_instance.rabbitmq.public_ip}:15671"
}
