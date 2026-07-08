const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env");
const examplePath = path.join(root, ".env.example");

if (fs.existsSync(envPath)) {
  console.log(".env already exists — skipped.");
  process.exit(0);
}

if (!fs.existsSync(examplePath)) {
  console.warn(".env.example not found — create .env manually for SMTP.");
  process.exit(0);
}

fs.copyFileSync(examplePath, envPath);
console.log("Created .env from .env.example");
console.log("→ Open .env and set SMTP_PASS before testing contact / tour / admission emails.");
