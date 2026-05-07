variable "master_private_ips" {
  description = "Private IPs of all master nodes"
  type        = list(string)
}

variable "worker_private_ips" {
  description = "Private IPs of all worker nodes"
  type        = list(string)
}

variable "bastion_public_ip" {
  description = "Public IP of the bastion host (used as ProxyJump)"
  type        = string
}

variable "inventory_path" {
  description = "Output path for the generated inventory file"
  type        = string
  default     = "inventory.ini"
}
