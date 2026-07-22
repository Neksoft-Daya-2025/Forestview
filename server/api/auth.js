const crypto = require("crypto");

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const MAX_SESSIONS = 64;
const sessions = new Map();
let lastCleanup = 0;

function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  return { username: String(username), password: String(password) };
}

function safeEqualString(a, b) {
  const left = Buffer.from(String(a ?? ""));
  const right = Buffer.from(String(b ?? ""));
  const max = Math.max(left.length, right.length, 1);
  const paddedLeft = Buffer.alloc(max);
  const paddedRight = Buffer.alloc(max);
  left.copy(paddedLeft);
  right.copy(paddedRight);
  return crypto.timingSafeEqual(paddedLeft, paddedRight) && left.length === right.length;
}

function cleanupSessions(now = Date.now()) {
  if (now - lastCleanup < 60 * 1000 && sessions.size <= MAX_SESSIONS) return;
  lastCleanup = now;
  for (const [token, session] of sessions) {
    if (!session || session.exp <= now) sessions.delete(token);
  }
  while (sessions.size > MAX_SESSIONS) {
    const oldestToken = sessions.keys().next().value;
    if (!oldestToken) break;
    sessions.delete(oldestToken);
  }
}

function createToken(username) {
  cleanupSessions();
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { username, exp: Date.now() + SESSION_TTL_MS });
  cleanupSessions(0);
  return token;
}

function getSession(token) {
  if (!token || typeof token !== "string" || token.length > 256) return null;
  cleanupSessions();
  const session = sessions.get(token);
  if (!session) return null;
  if (session.exp <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function login(username, password) {
  const creds = getAdminCredentials();
  const usernameOk = safeEqualString(username, creds?.username || "");
  const passwordOk = safeEqualString(password, creds?.password || "");
  if (!creds || !usernameOk || !passwordOk) return null;
  return createToken(creds.username);
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

module.exports = { login, logout, requireAuth, getSession, cleanupSessions, safeEqualString };
