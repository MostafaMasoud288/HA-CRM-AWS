output "k3s_sg_id" {
  description = "ID of the K3s cluster security group"
  value       = aws_security_group.k3s_sg.id
}

output "bastion_sg_id" {
  description = "ID of the Bastion host security group"
  value       = aws_security_group.bastion_sg.id
}

output "rds_sg_id" {
  description = "ID of the RDS security group"
  value       = aws_security_group.rds_sg.id
}
