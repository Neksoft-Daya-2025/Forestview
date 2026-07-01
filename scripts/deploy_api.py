#!/usr/bin/env python3
"""Deploy API code only — never uploads or overwrites submission JSON files."""
import os
import sys
from pathlib import Path

import paramiko

HOST = "187.124.182.72"
USER = "root"
PASSWORD = os.environ.get("DEPLOY_PASS")
ROOT = Path(__file__).resolve().parent.parent
API_ROOT = "/opt/forestview-api"
UPLOAD = ["package.json", "package-lock.json", "ecosystem.config.cjs"]


def run(ssh, cmd):
    _, stdout, stderr = ssh.exec_command(cmd)
    return (
        stdout.read().decode("utf-8", errors="replace").strip(),
        stderr.read().decode("utf-8", errors="replace").strip(),
    )


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


def main():
    if not PASSWORD:
        print("Set DEPLOY_PASS", file=sys.stderr)
        sys.exit(1)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    sftp = ssh.open_sftp()

    run(
        ssh,
        "mkdir -p /var/lib/forestview-submissions "
        f"&& cp -n {API_ROOT}/server/data/*.json /var/lib/forestview-submissions/ 2>/dev/null || true",
    )
    for name in UPLOAD:
        sftp.put(str(ROOT / name), f"{API_ROOT}/{name}")
    upload_dir(sftp, ROOT / "server", f"{API_ROOT}/server", skip_dirs={"data"})

    cmds = [
        f"cd {API_ROOT} && npm ci --omit=dev",
        f"cd {API_ROOT} && pm2 delete forestview-api 2>/dev/null; pm2 start ecosystem.config.cjs",
        "pm2 save",
        "sleep 2 && curl -s http://127.0.0.1:3010/api/health",
    ]
    out_path = ROOT / "scripts" / "deploy_api_output.txt"
    with open(out_path, "w", encoding="utf-8") as f:
        for cmd in cmds:
            out, err = run(ssh, cmd)
            f.write(f"--- {cmd}\n{out}\n")
            if err:
                f.write(f"ERR: {err}\n\n")

    sftp.close()
    ssh.close()
    print(out_path)


if __name__ == "__main__":
    main()
