output "writer_endpoint" {
  description = "Writer endpoint of the Aurora cluster"
  value       = aws_rds_cluster.app_cluster.endpoint
}

output "reader_endpoint" {
  description = "Reader endpoint of the Aurora cluster"
  value       = aws_rds_cluster.app_cluster.reader_endpoint
}

output "cluster_identifier" {
  description = "Identifier of the Aurora cluster"
  value       = aws_rds_cluster.app_cluster.cluster_identifier
}
