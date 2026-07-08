#!/usr/bin/env python3
import os
import paramiko

HOST = "187.124.182.72"
USER = "root"
PASSWORD = os.environ.get("DEPLOY_PASS")


def run(ssh, cmd):
    _, stdout, stderr = ssh.exec_command(cmd)
    return (
        stdout.read().decode("utf-8", errors="replace").strip(),
        stderr.read().decode("utf-8", errors="replace").strip(),
    )


def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=30)

    checks = [
        "test -f /opt/forestview-api/.env && echo ENV_OK || echo ENV_MISSING",
        "curl -s http://127.0.0.1:3010/api/health",
        "curl -s -o /dev/null -w '%{http_code}' https://forestviewmontessori.org/",
        (
            "cd /opt/forestview-api && node -e "
            "\"require('dotenv').config(); "
            "const m=require('./server/api/mailer'); "
            "console.log(JSON.stringify({configured:m.isConfigured()}));\""
        ),
    ]

    for cmd in checks:
        out, err = run(ssh, cmd)
        print(f"$ {cmd}")
        if out:
            print(out)
        if err:
            print("stderr:", err)
        print()

    ssh.close()


if __name__ == "__main__":
    main()
