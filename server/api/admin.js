const express = require("express");
const { login, logout, requireAuth } = require("./auth");
const { listAllSubmissions } = require("./submissions");

const router = express.Router();
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_MAX_KEYS = 1000;

function clientKey(req) {
  return String(req.ip || req.socket?.remoteAddress || "unknown").slice(0, 80);
}

function pruneAttempts(now = Date.now()) {
  for (const [key, bucket] of loginAttempts) {
    if (!bucket || bucket.resetAt <= now) loginAttempts.delete(key);
  }
  while (loginAttempts.size > LOGIN_MAX_KEYS) loginAttempts.delete(loginAttempts.keys().next().value);
}

function checkLoginLimit(req, res, next) {
  const now = Date.now();
  pruneAttempts(now);
  const key = clientKey(req);
  const bucket = loginAttempts.get(key) || { count: 0, resetAt: now + LOGIN_WINDOW_MS };
  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + LOGIN_WINDOW_MS;
  }
  if (bucket.count >= LOGIN_MAX_ATTEMPTS) {
    res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
    return res.status(429).json({ ok: false, message: "Too many login attempts. Please try again later." });
  }
  req.loginAttempt = { key, bucket };
  next();
}

function recordFailedLogin(req) {
  if (!req.loginAttempt) return;
  req.loginAttempt.bucket.count += 1;
  loginAttempts.set(req.loginAttempt.key, req.loginAttempt.bucket);
}

function clearLoginAttempts(req) {
  if (req.loginAttempt) loginAttempts.delete(req.loginAttempt.key);
}

router.post("/login", checkLoginLimit, (req, res) => {
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");
  if (!username || !password || username.length > 120 || password.length > 1024) {
    recordFailedLogin(req);
    return res.status(400).json({ ok: false, message: "Username and password are required." });
  }
  const token = login(username, password);
  if (!token) {
    recordFailedLogin(req);
    return res.status(401).json({ ok: false, message: "Invalid username or password." });
  }
  clearLoginAttempts(req);
  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true, token, username });
});

router.post("/logout", requireAuth, (req, res) => {
  logout(req.adminToken);
  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true, username: req.adminUser });
});

router.get("/submissions", requireAuth, (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ ok: true, ...listAllSubmissions({ limit: req.query.limit }) });
});

module.exports = router;
