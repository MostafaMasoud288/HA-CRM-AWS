variable "key_name" {
  description = "Name for the AWS Key Pair"
  type        = string
  default     = "k3s-ubuntu-key"
}

variable "public_key_path" {
  description = "Path to the public SSH key"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs (used for bastion)"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs (used for masters & workers)"
  type        = list(string)
}

variable "k3s_sg_id" {
  description = "Security group ID for k3s cluster nodes"
  type        = string
}

variable "bastion_sg_id" {
  description = "Security group ID for the bastion host"
  type        = string
}

variable "bastion_instance_type" {
  description = "EC2 instance type for the bastion host"
  type        = string
  default     = "t3.micro"
}

variable "node_instance_type" {
  description = "EC2 instance type for master and worker nodes"
  type        = string
  default     = "t3.small"
}

variable "master_count" {
  description = "Number of master nodes"
  type        = number
  default     = 3
}

variable "worker_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 3
}
