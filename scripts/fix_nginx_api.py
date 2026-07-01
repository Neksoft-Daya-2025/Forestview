"""Add /api proxy to active forestview nginx vhost."""
import os
import sys
import paramiko

HOST = "187.124.182.72"
USER = "root"
PASSWORD = os.environ.get("DEPLOY_PASS")
VHOST = "/etc/nginx/sites-enabled/default.conf"
API_BLOCK = """  location /api/ {
    proxy_pass http://127.0.0.1:3010/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

"""


def main():
    if not PASSWORD:
        print("Set DEPLOY_PASS", file=sys.stderr)
        return 1

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)

    patch = f"""python3 <<'PY'
from pathlib import Path
path = Path("{VHOST}")
text = path.read_text()
block = '''{API_BLOCK}'''
if "location /api/" not in text:
    text = text.replace("  location / {{", block + "  location / {{", 1)
    path.write_text(text)
    print("PATCHED")
else:
    print("ALREADY_OK")
PY"""
    _, o, e = ssh.exec_command(patch)
    print(o.read().decode().strip())
    err = e.read().decode().strip()
    if err:
        print("stderr:", err)

    for cmd in ["nginx -t 2>&1", "systemctl reload nginx 2>&1", "curl -s https://forestviewmontessori.org/api/health"]:
        _, o, _ = ssh.exec_command(cmd)
        print(f"$ {cmd}")
        print(o.read().decode().strip())

    ssh.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
