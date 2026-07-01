import os
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("187.124.182.72", username="root", password=os.environ["DEPLOY_PASS"], timeout=30)
for cmd in [
    "pm2 list",
    "curl -s http://127.0.0.1:3010/api/health",
    "curl -s -o /dev/null -w '%{http_code}' https://forestviewmontessori.org/api/health",
    "tail -8 /root/.pm2/logs/forestview-api-error.log 2>/dev/null || echo no log",
]:
    _, o, e = ssh.exec_command(cmd)
    out = o.read().decode("utf-8", errors="replace").strip()
    err = e.read().decode("utf-8", errors="replace").strip()
    print(f"--- {cmd} ---")
    text = (out or err or "(empty)").encode("ascii", errors="replace").decode("ascii")
    print(text)
ssh.close()
