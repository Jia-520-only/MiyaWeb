# Linux 服务器安全配置最佳实践

> **分类**: Linux | **阅读时间**: 8 分钟 | **发布时间**: 2025-12-20

## 目录

- [SSH 安全配置](#ssh-安全配置)
- [防火墙设置](#防火墙设置)
- [用户权限管理](#用户权限管理)
- [系统更新与监控](#系统更新与监控)
- [常见安全措施](#常见安全措施)

---

## SSH 安全配置

### 1. 禁用 root 登录

```bash
# 编辑 SSH 配置文件
sudo nano /etc/ssh/sshd_config

# 添加或修改以下行
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# 重启 SSH 服务
sudo systemctl restart sshd
```

### 2. 使用密钥认证

```bash
# 生成 SSH 密钥对
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 将公钥复制到服务器
ssh-copy-id user@server_ip
```

### 3. 修改默认端口

```bash
# 在 sshd_config 中修改
Port 2222
```

---

## 防火墙设置

### UFW 配置

```bash
# 启用 UFW
sudo ufw enable

# 允许 SSH（使用自定义端口）
sudo ufw allow 2222/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 查看状态
sudo ufw status
```

### iptables 配置

```bash
# 清空现有规则
sudo iptables -F

# 设置默认策略
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT

# 允许回环
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A OUTPUT -o lo -j ACCEPT

# 允许已建立的连接
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 保存规则
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

---

## 用户权限管理

### 1. 创建普通用户

```bash
# 创建新用户
sudo adduser username

# 添加到 sudo 组
sudo usermod -aG sudo username
```

### 2. 配置 sudo

```bash
# 编辑 sudo 配置
sudo visudo

# 添加用户权限
username ALL=(ALL) NOPASSWD:ALL
```

### 3. 限制文件权限

```bash
# 设置正确的权限
sudo chmod 644 /etc/ssh/sshd_config
sudo chmod 600 ~/.ssh/id_rsa
sudo chmod 644 ~/.ssh/id_rsa.pub
```

---

## 系统更新与监控

### 1. 自动更新

```bash
# 安装 unattended-upgrades
sudo apt install unattended-upgrades

# 配置自动更新
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. 安装监控工具

```bash
# 安装 fail2ban
sudo apt install fail2ban

# 安装 logwatch
sudo apt install logwatch

# 配置日志监控
sudo nano /etc/fail2ban/jail.local
```

---

## 常见安全措施

### 1. 禁用不必要的服务

```bash
# 查看运行的服务
sudo systemctl list-units --type=service

# 停止并禁用不需要的服务
sudo systemctl stop <service_name>
sudo systemctl disable <service_name>
```

### 2. 安装安全工具

```bash
# 安装 Lynis 进行安全审计
sudo apt install lynis
sudo lynis audit system

# 安装 ClamAV 杀毒软件
sudo apt install clamav
sudo freshclam
```

### 3. 配置日志轮转

```bash
# 编辑 logrotate 配置
sudo nano /etc/logrotate.conf

# 配置日志保留策略
/var/log/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## 总结

服务器安全是一个持续的过程，需要定期检查和更新。以上措施可以大大提高服务器的安全性，但不能保证 100% 安全。建议定期进行安全审计，关注最新的安全漏洞和修复方案。

---

**相关文章**:
- [Docker 容器化部署入门](/articles/docker-deployment)
- [防火墙进阶配置](/articles/firewall-advanced)
