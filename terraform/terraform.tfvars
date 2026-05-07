region   = "us-east-1"
key_name = "k3s-ubuntu-key"
my_ip    = "197.55.152.165/32"

# VPC
vpc_cidr = "10.0.0.0/16"
azs      = ["us-east-1a", "us-east-1b", "us-east-1c"]

# Compute
master_count          = 3
worker_count          = 3
node_instance_type    = "t3.small"
bastion_instance_type = "t3.micro"

# NLB
nlb_port = 30003

# RDS
db_username       = "admin"
db_password       = "123456789"  # ⚠️ Move this to a secret manager in production!
database_name     = "myappdb"
engine_version    = "5.7.mysql_aurora.2.11.3"
db_instance_class = "db.t3.medium"
