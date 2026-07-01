import os
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("187.124.182.72", username="root", password=os.environ["DEPLOY_PASS"], timeout=30)
for path in [
    "/etc/nginx/sites-enabled/default.conf",
    "/etc/nginx/sites-enabled/forestviewmontessori.org.conf.bak",
]:
    _, o, _ = ssh.exec_command(f"cat {path}")
    text = o.read().decode("utf-8", errors="replace")
    print(f"===== {path} =====")
    print(text.encode("ascii", errors="replace").decode("ascii"))
    print()
ssh.close()
