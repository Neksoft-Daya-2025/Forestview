const express = require("express");
const { login, logout, requireAuth } = require("./auth");
const { listAllSubmissions } = require("./submissions");

const router = express.Router();

router.post("/login", (req, res) => {
  const username = String(req.body?.username ?? "").trim();
  const password = String(req.body?.password ?? "");
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Username and password are required." });
  }
  const token = login(username, password);
  if (!token) {
    return res.status(401).json({ ok: false, message: "Invalid username or password." });
  }
  res.json({ ok: true, token, username });
});

router.post("/logout", requireAuth, (req, res) => {
  logout(req.adminToken);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ ok: true, username: req.adminUser });
});

router.get("/submissions", requireAuth, (_req, res) => {
  res.json({ ok: true, ...listAllSubmissions() });
});

module.exports = router;
