# ==========================================
# General
# ==========================================
variable "region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

# ==========================================
# VPC
# ==========================================
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# ==========================================
# Compute
# ==========================================
variable "key_name" {
  description = "AWS SSH Key Pair name"
  type        = string
}

variable "public_key_path" {
  description = "Path to the public SSH key file"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "master_count" {
  description = "Number of k3s master nodes"
  type        = number
  default     = 3
}

variable "worker_count" {
  description = "Number of k3s worker nodes"
  type        = number
  default     = 3
}

variable "node_instance_type" {
  description = "EC2 instance type for master and worker nodes"
  type        = string
  default     = "t3.small"
}

variable "bastion_instance_type" {
  description = "EC2 instance type for the bastion host"
  type        = string
  default     = "t3.micro"
}

# ==========================================
# NLB
# ==========================================
variable "nlb_port" {
  description = "Port for the NLB listener and target group"
  type        = number
  default     = 30003
}

# ==========================================
# RDS
# ==========================================
variable "db_username" {
  description = "Master username for the Aurora cluster"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Master password for the Aurora cluster"
  type        = string
  sensitive   = true
}

variable "database_name" {
  description = "Initial database name in the Aurora cluster"
  type        = string
  default     = "myappdb"
}

variable "engine_version" {
  description = "Aurora MySQL engine version"
  type        = string
  default     = "5.7.mysql_aurora.2.11.3"
}

variable "db_instance_class" {
  description = "Instance class for Aurora writer and reader"
  type        = string
  default     = "db.t3.medium"
}

# ==========================================
# Ansible
# ==========================================
variable "inventory_path" {
  description = "Output path for the generated Ansible inventory file"
  type        = string
  default     = "inventory.ini"
}

# ==========================================
# Misc (kept for compatibility)
# ==========================================
variable "my_ip" {
  description = "Your public IP in CIDR notation (e.g. x.x.x.x/32)"
  type        = string
}

variable "subnet_ids" {
  description = "Existing subnet IDs (unused - kept for compatibility)"
  type        = list(string)
  default     = []
}
