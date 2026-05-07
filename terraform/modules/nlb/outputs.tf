output "nlb_dns" {
  description = "DNS name of the Network Load Balancer"
  value       = aws_lb.nlb.dns_name
}

output "nlb_arn" {
  description = "ARN of the Network Load Balancer"
  value       = aws_lb.nlb.arn
}

output "target_group_arn" {
  description = "ARN of the NLB target group"
  value       = aws_lb_target_group.tg.arn
}
