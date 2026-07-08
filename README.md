# Forestview Montessori Website

React + Vite frontend with an Express API for contact, tour, and admission forms.

## Quick start (local)

**Requirements:** Node.js 20+ and npm

```bash
git clone https://github.com/Neksoft-Daya-2025/Forestview.git
cd Forestview
npm install
```

`npm install` automatically creates `.env` from `.env.example` if you do not have one yet.

1. Open `.env` and set `SMTP_PASS` (and other values if needed).
2. Start development:

```bash
npm run dev
```

- Website: http://localhost:5173/
- API: http://localhost:3000/api/health

## What works without SMTP?

The site and API run without email configured. Form submissions are saved on the server, but emails are not sent until `SMTP_PASS` is set in `.env`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + Vite dev server |
| `npm run build` | Production frontend build (`dist/`) |
| `npm start` | Production API (serve `dist/` separately or via nginx) |
| `npm run setup` | Create `.env` from `.env.example` if missing |

## Environment variables

See `.env.example` for all supported variables. Minimum for form emails:

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=info@forestviewmontessori.org
SMTP_PASS=your-password
SMTP_FROM=info@forestviewmontessori.org
```

Never commit `.env` — it is gitignored.

## Production deploy

Deploy scripts live in `scripts/`. On the server:

- Static site: `/home/forestviewmontessori/htdocs/forestviewmontessori.org`
- API (PM2): `/opt/forestview-api`
- Submissions data: `/var/lib/forestview-submissions`
- Create `/opt/forestview-api/.env` with the same SMTP settings as local

```bash
npm run build
# then use scripts/deploy_production.py with DEPLOY_PASS set
```
