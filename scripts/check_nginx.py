import os
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("187.124.182.72", username="root", password=os.environ["DEPLOY_PASS"], timeout=30)
for cmd in [
    "grep -n 'location /api' /etc/nginx/sites-enabled/forestviewmontessori.org.conf",
    "grep -n 'proxy_pass' /etc/nginx/sites-enabled/forestviewmontessori.org.conf",
    "nginx -t 2>&1",
]:
    _, o, _ = ssh.exec_command(cmd)
    text = o.read().decode("utf-8", errors="replace").encode("ascii", errors="replace").decode("ascii")
    print(f"--- {cmd} ---\n{text}")
ssh.close()
