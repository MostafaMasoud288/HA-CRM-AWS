# ==========================================
# VPC
# ==========================================
resource "aws_vpc" "k3s_vpc" {
  cidr_block = var.vpc_cidr

  tags = {
    Name = "k3s-vpc"
  }
}

# ==========================================
# Public Subnets
# ==========================================
resource "aws_subnet" "public_subnets" {
  count = length(var.azs)

  vpc_id                  = aws_vpc.k3s_vpc.id
  cidr_block              = cidrsubnet(aws_vpc.k3s_vpc.cidr_block, 8, count.index)
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "k3s-public-subnet-${count.index + 1}"
  }
}

# ==========================================
# Private Subnets
# ==========================================
resource "aws_subnet" "private_subnets" {
  count = length(var.azs)

  vpc_id            = aws_vpc.k3s_vpc.id
  cidr_block        = cidrsubnet(aws_vpc.k3s_vpc.cidr_block, 8, count.index + 3)
  availability_zone = var.azs[count.index]

  tags = {
    Name = "k3s-private-subnet-${count.index + 1}"
  }
}

# ==========================================
# Internet Gateway (Public access)
# ==========================================
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.k3s_vpc.id

  tags = {
    Name = "k3s-igw"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.k3s_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "k3s-public-rt"
  }
}

resource "aws_route_table_association" "public_rt_assoc" {
  count = length(var.azs)

  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_rt.id
}

# ==========================================
# NAT Gateway (Private subnets internet)
# ==========================================
resource "aws_eip" "nat_eip" {
  domain = "vpc"
}

resource "aws_nat_gateway" "nat_gw" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnets[0].id

  tags = {
    Name = "k3s-nat"
  }
}

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.k3s_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gw.id
  }

  tags = {
    Name = "k3s-private-rt"
  }
}

resource "aws_route_table_association" "private_rt_assoc" {
  count = length(var.azs)

  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_rt.id
}
