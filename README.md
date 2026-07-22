# Forestview Montessori Website

React + Vite frontend with an Express API for contact, tour, and admission forms.

## Quick start (local)

**Requirements:** Node.js 20+ and npm

```bash
git clone https://github.com/Neksoft-Daya-2025/Forestview.git
cd Forestview
npm install
cp .env.example .env
# Fill in local SMTP/admin values as needed.
npm run dev
```

- Website: http://localhost:5173/
- API: http://localhost:3000/api/health

Secrets are not committed. Create a local `.env` from `.env.example` and keep deployment secrets in the production host, PM2 environment, or another approved secret manager.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + Vite dev server |
| `npm run build` | Production frontend build (`dist/`) |
| `npm start` | Production API (serve `dist/` separately or via nginx) |
| `npm test` | Run Node integration/unit hygiene tests |
| `npm run lint` | Run the lightweight JavaScript syntax check |
| `npm run check` | Run lint and tests |
| `npm run setup` | Create `.env` from `.env.example` if missing |

## Environment variables

Copy `.env.example` to `.env` for local development. The application supports these variables:

| Variable | Required in production | Purpose |
|----------|------------------------|---------|
| `SMTP_HOST` | Yes | SMTP server hostname for form email delivery |
| `SMTP_PORT` | Yes | SMTP server port, usually `587` for STARTTLS or `465` for SSL |
| `SMTP_USER` | Yes | SMTP account username |
| `SMTP_PASS` | Yes | SMTP account password or app password |
| `SMTP_FROM` | Yes | Sender address for contact, tour, and admission emails |
| `SMTP_TO` | Recommended | Recipient inbox for form notifications, defaults to `SMTP_FROM` |
| `SMTP_SECURE` | Required when using port 465 | Set to `1` for SSL on port 465, otherwise leave unset or `0` |
| `ADMIN_USERNAME` | Yes | Admin submissions dashboard username |
| `ADMIN_PASSWORD` | Yes | Admin submissions dashboard password |
| `PORT` | Deployment-specific | API port, default `3000` |
| `NODE_ENV` | Yes | Set to `production` on production hosts |
| `API_ONLY` | Deployment-specific | Set to `1` when the API is served without the Vite static build |
| `DATA_DIR` | Yes | Persistent submissions storage directory, for example `/var/lib/forestview-submissions` |

## Secret handling and incident cleanup

If a real secret was ever committed or copied into repository history, assume it is compromised even after the file is deleted.

1. Rotate the affected SMTP/admin credentials in the upstream provider immediately.
2. Replace the production secret in the host, PM2 environment, or secret manager.
3. Remove the secret from git history with a reviewed history-rewrite tool such as `git filter-repo` or BFG.
4. Force-push only after coordinating with maintainers and making a backup.
5. Ask every clone/fork owner to rebase from the cleaned history or reclone.
6. Verify with a secret scanner before considering the incident closed.

## Production deploy

Deploy scripts live in `scripts/`. On the server:

- Static site: `/home/forestviewmontessori/htdocs/forestviewmontessori.org`
- API (PM2): `/opt/forestview-api`
- Submissions data: `/var/lib/forestview-submissions`
- Provision production environment variables on the server before starting PM2. Do not deploy a committed `.env` file.

```bash
npm run build
# DEPLOY_PASS=... python scripts/deploy_production.py
```
