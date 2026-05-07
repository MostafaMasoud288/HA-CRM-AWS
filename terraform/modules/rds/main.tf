# ==========================================
# DB Subnet Group
# ==========================================
resource "aws_db_subnet_group" "database_subnets" {
  name       = "main-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "Main DB Subnet Group"
  }
}

# ==========================================
# Aurora MySQL Cluster
# ==========================================
resource "aws_rds_cluster" "app_cluster" {
  cluster_identifier = "main-aurora-cluster"

  engine         = "aurora-mysql"
  engine_version = var.engine_version

  database_name   = var.database_name
  master_username = var.db_username
  master_password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.database_subnets.name
  vpc_security_group_ids = [var.rds_sg_id]

  storage_encrypted   = true
  skip_final_snapshot = true

  tags = {
    Name = "Main Aurora Cluster"
  }
}

# ==========================================
# Writer Instance
# ==========================================
resource "aws_rds_cluster_instance" "writer" {
  identifier         = "aurora-writer"
  cluster_identifier = aws_rds_cluster.app_cluster.id

  instance_class = var.db_instance_class
  engine         = aws_rds_cluster.app_cluster.engine
  engine_version = aws_rds_cluster.app_cluster.engine_version

  publicly_accessible = false

  tags = {
    Name = "Aurora Writer"
  }
}

# ==========================================
# Reader Instance
# ==========================================
resource "aws_rds_cluster_instance" "reader" {
  identifier         = "aurora-reader"
  cluster_identifier = aws_rds_cluster.app_cluster.id

  instance_class = var.db_instance_class
  engine         = aws_rds_cluster.app_cluster.engine
  engine_version = aws_rds_cluster.app_cluster.engine_version

  publicly_accessible = false

  tags = {
    Name = "Aurora Reader"
  }
}
