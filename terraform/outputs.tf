output "nlb_dns" {
  description = "DNS name of the Network Load Balancer"
  value       = module.nlb.nlb_dns
}

output "bastion_public_ip" {
  description = "Public IP of the bastion host"
  value       = module.compute.bastion_public_ip
}

output "master_private_ips" {
  description = "Private IPs of all master nodes"
  value       = module.compute.master_private_ips
}

output "worker_private_ips" {
  description = "Private IPs of all worker nodes"
  value       = module.compute.worker_private_ips
}

output "rds_writer_endpoint" {
  description = "Aurora cluster writer endpoint"
  value       = module.rds.writer_endpoint
}

output "rds_reader_endpoint" {
  description = "Aurora cluster reader endpoint"
  value       = module.rds.reader_endpoint
}

output "rds_cluster_identifier" {
  description = "Aurora cluster identifier"
  value       = module.rds.cluster_identifier
}
