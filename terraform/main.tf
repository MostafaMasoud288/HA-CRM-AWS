# ==========================================
# VPC & Networking
# ==========================================
module "vpc" {
  source = "./modules/vpc"

  vpc_cidr = var.vpc_cidr
  azs      = var.azs
}

# ==========================================
# Security Groups
# ==========================================
module "security_groups" {
  source = "./modules/security_groups"

  vpc_id = module.vpc.vpc_id
}

# ==========================================
# Compute (Bastion, Masters, Workers)
# ==========================================
module "compute" {
  source = "./modules/compute"

  key_name           = var.key_name
  public_key_path    = var.public_key_path
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  k3s_sg_id          = module.security_groups.k3s_sg_id
  bastion_sg_id      = module.security_groups.bastion_sg_id

  master_count          = var.master_count
  worker_count          = var.worker_count
  node_instance_type    = var.node_instance_type
  bastion_instance_type = var.bastion_instance_type
}

# ==========================================
# Network Load Balancer
# ==========================================
module "nlb" {
  source = "./modules/nlb"

  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  worker_ids        = module.compute.worker_ids
  nlb_port          = var.nlb_port
}

# ==========================================
# RDS Aurora MySQL
# ==========================================
module "rds" {
  source = "./modules/rds"

  private_subnet_ids = module.vpc.private_subnet_ids
  rds_sg_id          = module.security_groups.rds_sg_id
  db_username        = var.db_username
  db_password        = var.db_password
  database_name      = var.database_name
  engine_version     = var.engine_version
  db_instance_class  = var.db_instance_class
}

# ==========================================
# Ansible Inventory
# ==========================================
module "ansible" {
  source = "./modules/ansible"

  master_private_ips = module.compute.master_private_ips
  worker_private_ips = module.compute.worker_private_ips
  bastion_public_ip  = module.compute.bastion_public_ip
  inventory_path     = var.inventory_path
}
# ==========================================
# Copy Writer  & Reader Endpoints
# ==========================================
resource "null_resource" "update_configmap" {

  depends_on = [
    module.rds
  ]

  provisioner "local-exec" {

    command = <<EOT
export WRITER=${module.rds.writer_endpoint}
export READER=${module.rds.reader_endpoint}

envsubst < ../crm-app/k8s/configmap-template.yaml > ../crm-app/k8s/configmap.yaml
EOT

  }
}
