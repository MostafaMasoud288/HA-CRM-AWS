# ==========================================
# Network Load Balancer
# ==========================================
resource "aws_lb" "nlb" {
  name               = "my-nlb"
  load_balancer_type = "network"
  subnets            = var.public_subnet_ids

  enable_cross_zone_load_balancing = true
}

# ==========================================
# Target Group
# ==========================================
resource "aws_lb_target_group" "tg" {
  name     = "nlb-target-group"
  port     = var.nlb_port
  protocol = "TCP"
  vpc_id   = var.vpc_id

  health_check {
    protocol = "TCP"
    port     = "traffic-port"
  }
}

# ==========================================
# Listener
# ==========================================
resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_lb.nlb.arn
  port              = var.nlb_port
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

# ==========================================
# Target Group Attachments (Workers)
# ==========================================
resource "aws_lb_target_group_attachment" "workers" {
  count = length(var.worker_ids)

  target_group_arn = aws_lb_target_group.tg.arn
  target_id        = var.worker_ids[count.index]
  port             = var.nlb_port
}
