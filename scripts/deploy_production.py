#!/usr/bin/env python3
"""Deploy Forestview: static dist + Express API (PM2) + nginx /api proxy."""
import os
import sys
from pathlib import Path

import paramiko

HOST = "187.124.182.72"
USER = "root"
PASSWORD = os.environ.get("DEPLOY_PASS")
ROOT = Path(__file__).resolve().parent.parent
LOCAL_DIST = ROOT / "dist"
WEB_ROOT = "/home/forestviewmontessori/htdocs/forestviewmontessori.org"
API_ROOT = "/opt/forestview-api"
NGINX_VHOST = "/etc/nginx/sites-enabled/default.conf"
API_PORT = 3010
API_LOCATION = f"""  location /api/ {{
    proxy_pass http://127.0.0.1:{API_PORT}/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }}

"""

UPLOAD_API_FILES = [
    "package.json",
    "package-lock.json",
    "ecosystem.config.cjs",
]


def run(ssh, cmd):
    _, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    return out, err


def upload_dir(sftp, local_dir, remote_dir, *, skip_dirs=None):
    skip_dirs = skip_dirs or set()
    for entry in local_dir.iterdir():
        if entry.name in skip_dirs:
            continue
        remote_path = f"{remote_dir}/{entry.name}"
        if entry.is_dir():
            try:
                sftp.mkdir(remote_path)
            except OSError:
                pass
            upload_dir(sftp, entry, remote_path, skip_dirs=skip_dirs)
        else:
            sftp.put(str(entry), remote_path)


def upload_server_code(sftp, local_server, remote_server):
    """Upload server code only — never overwrite submission JSON on the server."""
    upload_dir(sftp, local_server, remote_server, skip_dirs={"data"})


def main():
    if not PASSWORD:
        print("Set DEPLOY_PASS environment variable.", file=sys.stderr)
        sys.exit(1)
    if not LOCAL_DIST.is_dir():
        print("Run npm run build first.", file=sys.stderr)
        sys.exit(1)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    sftp = ssh.open_sftp()

    print("Ensuring persistent submission storage...")
    run(
        ssh,
        "mkdir -p /var/lib/forestview-submissions "
        f"&& (test -f {API_ROOT}/server/data/contact-submissions.json && "
        f"cp -n {API_ROOT}/server/data/*.json /var/lib/forestview-submissions/ 2>/dev/null || true)",
    )

    print("Uploading static dist...")
    upload_dir(sftp, LOCAL_DIST, WEB_ROOT)

    print("Uploading API package files...")
    for name in UPLOAD_API_FILES:
        local = ROOT / name
        if local.exists():
            sftp.put(str(local), f"{API_ROOT}/{name}")

    env_status, _ = run(ssh, f"test -f {API_ROOT}/.env && echo present")
    if env_status != "present":
        raise RuntimeError(
            f"{API_ROOT}/.env is missing. Provision production secrets on the server before deploying."
        )
    run(ssh, f"chmod 600 {API_ROOT}/.env")
    print("Using the existing server-managed API environment file.")

    print("Uploading server code (submissions data NOT touched)...")
    upload_server_code(sftp, ROOT / "server", f"{API_ROOT}/server")

    print("Patching nginx vhost for /api proxy...")
    patch_cmd = f"""python3 <<'PY'
from pathlib import Path
path = Path("{NGINX_VHOST}")
text = path.read_text()
block = '''{API_LOCATION.rstrip()}'''
if "location /api/" not in text:
    text = text.replace("  location / {{", block + "\\n\\n  location / {{", 1)
    path.write_text(text)
    print("nginx: added /api/ proxy")
elif "127.0.0.1:{API_PORT}/api/" in text:
    print("nginx: /api/ proxy already ok")
else:
    print("nginx: /api/ block present but unexpected target — fix default.conf manually")
PY"""
    run(ssh, patch_cmd)

    cmds = [
        f"chown -R forestviewmontessori:forestviewmontessori {WEB_ROOT}",
        f"cd {API_ROOT} && npm ci --omit=dev 2>&1",
        "command -v pm2 >/dev/null || npm install -g pm2 2>&1",
        f"cd {API_ROOT} && pm2 delete forestview-api 2>/dev/null; pm2 start ecosystem.config.cjs 2>&1",
        "pm2 save 2>&1",
        "pm2 startup systemd -u root --hp /root 2>&1 | tail -1",
        "nginx -t 2>&1",
        "systemctl reload nginx 2>&1",
        f"curl -s http://127.0.0.1:{API_PORT}/api/health",
        "curl -s https://forestviewmontessori.org/api/health",
    ]

    for cmd in cmds:
        print(f"\n$ {cmd}")
        out, err = run(ssh, cmd)
        if out:
            print(out.encode("ascii", errors="replace").decode("ascii"))
        if err:
            print("stderr:", err.encode("ascii", errors="replace").decode("ascii"))

    sftp.close()
    ssh.close()
    print("\nDeploy finished.")


if __name__ == "__main__":
    main()
