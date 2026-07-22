/**
 * Express server adapted from react-boilerplate/server
 * https://github.com/react-boilerplate/react-boilerplate
 */
try {
  require("dotenv").config();
} catch {
  // dotenv optional in production (PM2 sets env)
}

const express = require("express");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");
const port = require("./port");
const setup = require("./middlewares/frontendMiddleware");
const api = require("./api");

const app = express();
const isProd = process.env.NODE_ENV === "production";
const apiOnly = process.env.API_ONLY === "1";
const distPath = path.resolve(process.cwd(), "dist");
const serveFrontend = isProd && !apiOnly && fs.existsSync(distPath);

function trustLocalReverseProxy(ip) {
  const value = String(ip || "").toLowerCase();
  if (value === "::1" || value === "0:0:0:0:0:0:0:1") return true;
  const ipv4 = value.startsWith("::ffff:") ? value.slice(7) : value;
  const parts = ipv4.split(".");
  return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d+$/.test(part) && Number(part) <= 255);
}

app.disable("x-powered-by");
// Trust X-Forwarded-* only from the local nginx hop. Do not trust arbitrary remote proxies.
app.set("trust proxy", trustLocalReverseProxy);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isProd) {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
    if (req.path.startsWith("/api/") || req.path === "/api") {
      res.setHeader("Cache-Control", "no-store");
    }
  }
  next();
});

app.use(express.json({ limit: "64kb", strict: true }));

if (!isProd) {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
}

// Backend API (react-boilerplate pattern: app.use('/api', myApi))
app.use("/api", api);

app.use((err, _req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ ok: false, message: "Invalid JSON request body." });
  }
  logger.error(err.message || err);
  res.status(500).json({ ok: false, message: "Internal server error." });
});

// Production: serve Vite build when dist is present (nginx may serve static separately)
if (serveFrontend) {
  setup(app, {
    outputPath: distPath,
    publicPath: "/",
  });
}

if (require.main === module) {
  app.listen(port, (err) => {
    if (err) return logger.error(err.message || err);
    logger.appStarted(port);
  });
}

module.exports = { app, trustLocalReverseProxy };
