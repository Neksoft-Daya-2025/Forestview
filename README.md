# Forestview Montessori Website

React + Vite frontend with an Express API for contact, tour, and admission forms.

## Quick start (local)

**Requirements:** Node.js 20+ and npm

```bash
git clone https://github.com/Neksoft-Daya-2025/Forestview.git
cd Forestview
npm install
npm run dev
```

- Website: http://localhost:5173/
- API: http://localhost:3000/api/health

SMTP and admin settings are in the committed `.env` file — clone and run, no extra config needed.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + Vite dev server |
| `npm run build` | Production frontend build (`dist/`) |
| `npm start` | Production API (serve `dist/` separately or via nginx) |
| `npm run setup` | Create `.env` from `.env.example` if missing |

## Environment variables

Default values live in `.env` (included in the repo). See `.env.example` for the full list of supported variables.

| Variable | Purpose |
|----------|---------|
| `SMTP_*` | Form email delivery (contact, tour, admission) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin submissions dashboard |
| `PORT` | API port (default `3000`) |

## Production deploy

Deploy scripts live in `scripts/`. On the server:

- Static site: `/home/forestviewmontessori/htdocs/forestviewmontessori.org`
- API (PM2): `/opt/forestview-api`
- Submissions data: `/var/lib/forestview-submissions`
- Copy repo `.env` to `/opt/forestview-api/.env` on deploy (or use `scripts/deploy_production.py`)

```bash
npm run build
# DEPLOY_PASS=... python scripts/deploy_production.py
```
