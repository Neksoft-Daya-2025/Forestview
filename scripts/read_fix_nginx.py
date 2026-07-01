import os
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("187.124.182.72", username="root", password=os.environ["DEPLOY_PASS"], timeout=30)
_, o, _ = ssh.exec_command("cat -n /etc/nginx/sites-enabled/default.conf")
print(o.read().decode("utf-8", errors="replace").encode("ascii", errors="replace").decode("ascii"))
ssh.close()
