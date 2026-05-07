variable "vpc_id" {
  description = "VPC ID where the NLB will be deployed"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for the NLB"
  type        = list(string)
}

variable "worker_ids" {
  description = "List of worker instance IDs to attach to the target group"
  type        = list(string)
}

variable "nlb_port" {
  description = "Port used by the NLB listener and target group"
  type        = number
  default     = 30003
}
