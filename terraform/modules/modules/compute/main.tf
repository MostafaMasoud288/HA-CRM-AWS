# ==========================================
# Latest Ubuntu 22.04 AMI
# ==========================================
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# ==========================================
# SSH Key Pair
# ==========================================
resource "aws_key_pair" "k3s_key" {
  key_name   = var.key_name
  public_key = file(var.public_key_path)
}

# ==========================================
# Bastion Host
# ==========================================
resource "aws_instance" "bastion" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.bastion_instance_type
  key_name      = aws_key_pair.k3s_key.key_name

  subnet_id                   = var.public_subnet_ids[0]
  vpc_security_group_ids      = [var.bastion_sg_id]
  associate_public_ip_address = true

  tags = {
    Name = "k3s-bastion"
  }
}

# ==========================================
# Master Nodes
# ==========================================
resource "aws_instance" "masters" {
  count = var.master_count

  ami           = data.aws_ami.ubuntu.id
  instance_type = var.node_instance_type
  key_name      = aws_key_pair.k3s_key.key_name

  subnet_id                   = var.private_subnet_ids[count.index]
  vpc_security_group_ids      = [var.k3s_sg_id]
  associate_public_ip_address = false

  tags = {
    Name = "k3s-master-${count.index + 1}"
  }
}

# ==========================================
# Worker Nodes
# ==========================================
resource "aws_instance" "workers" {
  count = var.worker_count

  ami           = data.aws_ami.ubuntu.id
  instance_type = var.node_instance_type
  key_name      = aws_key_pair.k3s_key.key_name

  subnet_id                   = var.private_subnet_ids[count.index]
  vpc_security_group_ids      = [var.k3s_sg_id]
  associate_public_ip_address = false

  tags = {
    Name = "k3s-worker-${count.index + 1}"
  }
}
