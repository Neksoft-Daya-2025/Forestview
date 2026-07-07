const express = require("express");
const { saveContact, saveTour, saveAdmission } = require("./submissions");
const { sendContactEmail, sendTourEmail, sendAdmissionEmail } = require("./mailer");
const admin = require("./admin");
const logger = require("../logger");

const router = express.Router();

function notify(sendFn, entry) {
  sendFn(entry).catch((err) => logger.error(err));
}

router.get("/health", (_req, res) => {
  res.json({ ok: true, service: "forestview-api" });
});

router.post("/contact", (req, res) => {
  try {
    const entry = saveContact(req.body || {});
    notify(sendContactEmail, entry);
    res.status(201).json({ ok: true, id: entry.id, message: "Message Received. We will contact you soon." });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message || "Invalid contact submission." });
  }
});

router.post("/tour", (req, res) => {
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

router.post("/admission", (req, res) => {
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
