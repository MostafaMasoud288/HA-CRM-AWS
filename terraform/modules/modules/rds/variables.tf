variable "private_subnet_ids" {
  description = "List of private subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "rds_sg_id" {
  description = "Security group ID for the RDS cluster"
  type        = string
}

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
  description = "Initial database name"
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
