const express = require("express");
const { saveContact, saveTour, saveAdmission } = require("./submissions");
const { sendContactEmail, sendTourEmail, sendAdmissionEmail } = require("./mailer");
const admin = require("./admin");
const logger = require("../logger");

const router = express.Router();
const formAttempts = new Map();
const FORM_WINDOW_MS = 10 * 60 * 1000;
const FORM_MAX_ATTEMPTS = 12;
const FORM_MAX_KEYS = 2000;

function notify(sendFn, entry) {
  sendFn(entry).catch((err) => logger.error(err));
}

function clientKey(req) {
  return String(req.ip || req.socket?.remoteAddress || "unknown").slice(0, 80);
}

function pruneFormAttempts(now = Date.now()) {
  for (const [key, bucket] of formAttempts) {
    if (!bucket || bucket.resetAt <= now) formAttempts.delete(key);
  }
  while (formAttempts.size > FORM_MAX_KEYS) formAttempts.delete(formAttempts.keys().next().value);
}

function formRateLimit(req, res, next) {
  const now = Date.now();
  pruneFormAttempts(now);
  const key = `${clientKey(req)}:${req.path}`;
  const bucket = formAttempts.get(key) || { count: 0, resetAt: now + FORM_WINDOW_MS };
  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + FORM_WINDOW_MS;
  }
  if (bucket.count >= FORM_MAX_ATTEMPTS) {
    res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
    return res.status(429).json({ ok: false, message: "Too many submissions. Please try again later." });
  }
  bucket.count += 1;
  formAttempts.set(key, bucket);
  next();
}

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "forestview-api" });
});

router.post("/contact", formRateLimit, (req, res) => {
  try {
    const entry = saveContact(req.body || {});
    notify(sendContactEmail, entry);
    res.status(201).json({ ok: true, id: entry.id, message: "Message Received. We will contact you soon." });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message || "Invalid contact submission." });
  }
});

router.post("/tour", formRateLimit, (req, res) => {
  try {
    const entry = saveTour(req.body || {});
    notify(sendTourEmail, entry);
    res.status(201).json({
      ok: true,
      id: entry.id,
      message: "Tour request received. We will confirm your tour appointment by email.",
    });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message || "Invalid tour submission." });
  }
});

router.post("/admission", formRateLimit, (req, res) => {
  try {
    const entry = saveAdmission(req.body || {});
    notify(sendAdmissionEmail, entry);
    res.status(201).json({
      ok: true,
      id: entry.id,
      message: "Application received. We will follow up with next steps.",
    });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message || "Invalid admission submission." });
  }
});

router.use("/admin", admin);

module.exports = router;
