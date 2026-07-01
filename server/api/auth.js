const crypto = require("crypto");

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();

function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "forestview",
    password: process.env.ADMIN_PASSWORD || "FvAdmin@2026",
  };
}

function createToken(username) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { username, exp: Date.now() + SESSION_TTL_MS });
  return token;
}

function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.exp < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function login(username, password) {
  const creds = getAdminCredentials();
  if (username !== creds.username || password !== creds.password) {
    return null;
  }
  return createToken(username);
}

function logout(token) {
  if (token) sessions.delete(token);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const session = getSession(token);
  if (!session) {
    return res.status(401).json({ ok: false, message: "Unauthorized." });
  }
  req.adminUser = session.username;
  req.adminToken = token;
  next();
}

module.exports = { login, logout, requireAuth, getSession };
