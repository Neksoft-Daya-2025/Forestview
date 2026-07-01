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

app.use(express.json({ limit: "64kb" }));

if (!isProd) {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
}

// Backend API (react-boilerplate pattern: app.use('/api', myApi))
app.use("/api", api);

// Production: serve Vite build when dist is present (nginx may serve static separately)
if (serveFrontend) {
  setup(app, {
    outputPath: distPath,
    publicPath: "/",
  });
}

app.listen(port, (err) => {
  if (err) return logger.error(err.message || err);
  logger.appStarted(port);
});
