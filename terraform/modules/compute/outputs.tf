output "bastion_public_ip" {
  description = "Public IP of the bastion host"
  value       = aws_instance.bastion.public_ip
}

output "master_private_ips" {
  description = "Private IPs of all master nodes"
  value       = aws_instance.masters[*].private_ip
}

output "worker_private_ips" {
  description = "Private IPs of all worker nodes"
  value       = aws_instance.workers[*].private_ip
}

output "worker_ids" {
  description = "Instance IDs of all worker nodes"
  value       = aws_instance.workers[*].id
}

output "key_name" {
  description = "Name of the created key pair"
  value       = aws_key_pair.k3s_key.key_name
}
