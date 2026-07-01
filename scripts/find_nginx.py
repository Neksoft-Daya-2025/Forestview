import os
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("187.124.182.72", username="root", password=os.environ["DEPLOY_PASS"], timeout=30)
cmds = [
    "ls -la /etc/nginx/sites-enabled/",
    "grep -rl forestview /etc/nginx/ 2>/dev/null",
    "grep -rl 'forestviewmontessori' /etc/nginx/ 2>/dev/null",
]
for cmd in cmds:
    _, o, _ = ssh.exec_command(cmd)
    text = o.read().decode("utf-8", errors="replace").encode("ascii", errors="replace").decode("ascii")
    print(f"--- {cmd} ---\n{text}\n")
ssh.close()
