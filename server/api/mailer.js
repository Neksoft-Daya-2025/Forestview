const nodemailer = require("nodemailer");
const logger = require("../logger");
const templates = require("./emailTemplates");

const SCHOOL_NAME = "Forestview Montessori";
const SCHOOL_EMAIL = "info@forestviewmontessori.org";

let transporter;

function getSmtpConfig() {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "1" || port === 465;
  return {
    host: process.env.SMTP_HOST || "smtp.office365.com",
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: process.env.SMTP_USER || SCHOOL_EMAIL,
      pass: process.env.SMTP_PASS || "",
    },
    tls: { minVersion: "TLSv1.2" },
  };
}

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport(getSmtpConfig());
  }
  return transporter;
}

function isConfigured() {
  const { auth } = getSmtpConfig();
  return Boolean(auth.user && auth.pass);
}

async function sendMail({ to, subject, text, html, replyTo }) {
  if (!isConfigured()) {
    logger.error("SMTP not configured (SMTP_USER / SMTP_PASS missing).");
    return false;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const recipient = to || process.env.SMTP_TO || from;

  try {
    await getTransporter().sendMail({
      from: `${SCHOOL_NAME} <${from}>`,
      to: recipient,
      replyTo: replyTo || undefined,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    logger.error(`Email failed (${recipient}): ${err.message || err}`);
    return false;
  }
}

async function sendOfficeAndConfirmation(officeMail, confirmationMail) {
  const officeOk = await sendMail(officeMail);
  const confirmOk = await sendMail(confirmationMail);
  return officeOk && confirmOk;
}

async function sendContactEmail(entry) {
  return sendOfficeAndConfirmation(
    {
      subject: `Website contact from ${entry.name}`,
      text: templates.buildContactOfficeText(entry),
      html: templates.buildContactOfficeHtml(entry),
      replyTo: entry.email,
    },
    {
      to: entry.email,
      subject: `We received your message — ${SCHOOL_NAME}`,
      text: templates.buildContactConfirmText(entry),
      html: templates.buildContactConfirmHtml(entry),
    },
  );
}

async function sendTourEmail(entry) {
  return sendOfficeAndConfirmation(
    {
      subject: `Tour request — ${entry.parentName}`,
      text: templates.buildTourOfficeText(entry),
      html: templates.buildTourOfficeHtml(entry),
      replyTo: entry.email,
    },
    {
      to: entry.email,
      subject: `Tour request received — ${SCHOOL_NAME}`,
      text: templates.buildTourConfirmText(entry),
      html: templates.buildTourConfirmHtml(entry),
    },
  );
}

async function sendAdmissionEmail(entry) {
  return sendOfficeAndConfirmation(
    {
      subject: `Admission application — ${entry.childLegalName || entry.parentName}`,
      text: templates.buildAdmissionOfficeText(entry),
      html: templates.buildAdmissionOfficeHtml(entry),
      replyTo: entry.email,
    },
    {
      to: entry.email,
      subject: `Application received — ${SCHOOL_NAME}`,
      text: templates.buildAdmissionConfirmText(entry),
      html: templates.buildAdmissionConfirmHtml(entry),
    },
  );
}

module.exports = { sendContactEmail, sendTourEmail, sendAdmissionEmail, isConfigured };
