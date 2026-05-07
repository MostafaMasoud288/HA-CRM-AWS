resource "local_file" "ansible_inventory" {
  filename = var.inventory_path

  content = <<EOF
[masters]
%{for ip in var.master_private_ips~}
${ip}
%{endfor~}

[workers]
%{for ip in var.worker_private_ips~}
${ip}
%{endfor~}

[all:vars]
ansible_user=ubuntu
ansible_ssh_private_key_file=~/.ssh/id_rsa.pub
ansible_ssh_common_args='-o ProxyJump=ubuntu@${var.bastion_public_ip}'
EOF
}
