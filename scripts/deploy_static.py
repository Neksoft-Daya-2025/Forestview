#!/usr/bin/env python3
"""Deploy dist/ only to production web root.

NEVER uploads or restarts the API — form submissions stay untouched.
Use this for all frontend-only changes.
"""
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


def upload_dir(sftp, local_dir, remote_dir):
    for entry in local_dir.iterdir():
        remote_path = f"{remote_dir}/{entry.name}"
        if entry.is_dir():
            try:
                sftp.mkdir(remote_path)
            except OSError:
                pass
            upload_dir(sftp, entry, remote_path)
        else:
            sftp.put(str(entry), remote_path)


def main():
    if not PASSWORD:
        print("Set DEPLOY_PASS", file=sys.stderr)
        sys.exit(1)
    if not LOCAL_DIST.is_dir():
        print("Run npm run build first", file=sys.stderr)
        sys.exit(1)

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)
    sftp = ssh.open_sftp()

    print("Uploading dist...")
    upload_dir(sftp, LOCAL_DIST, WEB_ROOT)
    sftp.close()

    _, o, _ = ssh.exec_command(
        f"chown -R forestviewmontessori:forestviewmontessori {WEB_ROOT} && "
        f"head -12 {WEB_ROOT}/index.html && "
        f"curl -sI https://forestviewmontessori.org/ | head -3"
    )
    out = o.read().decode("utf-8", errors="replace")
    ssh.close()

    result = ROOT / "scripts" / "deploy_result.txt"
    result.write_text(out, encoding="utf-8")
    print(result)
    print(out)


if __name__ == "__main__":
    main()
