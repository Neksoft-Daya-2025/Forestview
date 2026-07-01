import os
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("187.124.182.72", username="root", password=os.environ["DEPLOY_PASS"], timeout=20)
web = "/home/forestviewmontessori/htdocs/forestviewmontessori.org"
cmds = [
    f"cat {web}/index.html",
    f"ls -la {web}/assets/ | tail -8",
    "curl -sI https://forestviewmontessori.org/ | head -8",
    "curl -sI https://forestviewmontessori.org/assets/index-CTpzEeQJ.js | head -5",
    "curl -s https://forestviewmontessori.org/api/health",
    "pm2 list | grep forestview",
]
path = os.path.join(os.path.dirname(__file__), "live_check.txt")
with open(path, "w", encoding="utf-8") as f:
    for c in cmds:
        _, o, e = ssh.exec_command(c)
        f.write(f"--- {c}\n{o.read().decode('utf-8', errors='replace')}\n")
        err = e.read().decode("utf-8", errors="replace").strip()
        if err:
            f.write(f"ERR: {err}\n")
ssh.close()
print(path)
