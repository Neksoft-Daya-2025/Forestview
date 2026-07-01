"""Fix corrupted /api/ block in default.conf and reload nginx."""
import os
import paramiko

FIXED = """server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name forestviewmontessori.org www.forestviewmontessori.org;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl default_server;
  listen [::]:443 ssl default_server;
  server_name forestviewmontessori.org www.forestviewmontessori.org;

  ssl_certificate /etc/letsencrypt/live/forestviewmontessori.org/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/forestviewmontessori.org/privkey.pem;

  root /home/forestviewmontessori/htdocs/forestviewmontessori.org;
  index index.php index.html index.htm;

  location /api/ {
    proxy_pass http://127.0.0.1:3010/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.php?$args;
  }

  location ~ \\.php$ {
    include fastcgi_params;
    fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
  }
}
"""

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("187.124.182.72", username="root", password=os.environ["DEPLOY_PASS"], timeout=30)
sftp = ssh.open_sftp()
with sftp.file("/etc/nginx/sites-enabled/default.conf", "w") as f:
    f.write(FIXED)
sftp.close()

for cmd in ["nginx -t 2>&1", "systemctl reload nginx 2>&1", "curl -s https://forestviewmontessori.org/api/health"]:
    _, o, _ = ssh.exec_command(cmd)
    print(f"$ {cmd}")
    print(o.read().decode().strip())

ssh.close()
