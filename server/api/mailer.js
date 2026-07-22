const nodemailer = require("nodemailer");
const logger = require("../logger");
const templates = require("./emailTemplates");

const SCHOOL_NAME = "Forestview Montessori";
const SCHOOL_EMAIL = "info@forestviewmontessori.org";
const CONTROL_CHARS_RE = /[\u0000-\u001f\u007f]/;
const LOCAL_PART_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
const DOMAIN_LABEL_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;
const TRANSIENT_CODES = new Set([
  "EAI_AGAIN",
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "ECONNECTION",
  "EDNS",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPIPE",
  "ESOCKET",
  "ETIMEDOUT",
]);
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_BASE_MS = 250;

let transporter;

function configurationError(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

function parsePort(value) {
  const port = Number(value || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw configurationError("SMTP_PORT_INVALID");
  return port;
}

function parseBoolean(value, fallback) {
  if (value == null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  throw configurationError("SMTP_SECURE_INVALID");
}

function parseBoundedInteger(value, fallback, min, max, code) {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw configurationError(code);
  return parsed;
}

function validateHost(value) {
  const host = String(value || "").trim();
  if (!host || host.length > 253 || CONTROL_CHARS_RE.test(host) || /\s/.test(host)) {
    throw configurationError("SMTP_HOST_INVALID");
  }
  return host;
}

function validateMailbox(value, code = "EMAIL_ADDRESS_INVALID") {
  const address = String(value || "").trim();
  if (!address || address.length > 254 || CONTROL_CHARS_RE.test(address)) throw configurationError(code);
  const parts = address.split("@");
  if (parts.length !== 2) throw configurationError(code);
  const [local, domain] = parts;
  if (
    !local ||
    local.length > 64 ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..") ||
    !LOCAL_PART_RE.test(local)
  ) {
    throw configurationError(code);
  }
  const labels = domain.split(".");
  if (labels.length < 2 || labels.some((label) => !DOMAIN_LABEL_RE.test(label))) throw configurationError(code);
  return `${local}@${domain.toLowerCase()}`;
}

function validateHeader(value, code = "EMAIL_HEADER_INVALID", maxLength = 240) {
  const header = String(value || "").trim();
  if (!header || header.length > maxLength || CONTROL_CHARS_RE.test(header)) throw configurationError(code);
  return header;
}

function getSmtpSettings() {
  const port = parsePort(process.env.SMTP_PORT);
  const secure = parseBoolean(process.env.SMTP_SECURE, port === 465);
  const user = validateMailbox(process.env.SMTP_USER || SCHOOL_EMAIL, "SMTP_USER_INVALID");
  const password = String(process.env.SMTP_PASS || "");
  if (!password) throw configurationError("SMTP_PASS_MISSING");

  return {
    from: validateMailbox(process.env.SMTP_FROM || user, "SMTP_FROM_INVALID"),
    officeRecipient: validateMailbox(process.env.SMTP_TO || process.env.SMTP_FROM || user, "SMTP_TO_INVALID"),
    maxAttempts: parseBoundedInteger(process.env.SMTP_MAX_ATTEMPTS, DEFAULT_MAX_ATTEMPTS, 1, 5, "SMTP_MAX_ATTEMPTS_INVALID"),
    retryBaseMs: parseBoundedInteger(process.env.SMTP_RETRY_BASE_MS, DEFAULT_RETRY_BASE_MS, 0, 10000, "SMTP_RETRY_BASE_MS_INVALID"),
    transport: {
      host: validateHost(process.env.SMTP_HOST || "smtp.office365.com"),
      port,
      secure,
      requireTLS: !secure,
      auth: { user, pass: password },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
      disableFileAccess: true,
      disableUrlAccess: true,
      tls: { minVersion: "TLSv1.2" },
    },
  };
}

function getTransporter(settings) {
  if (!transporter) transporter = nodemailer.createTransport(settings.transport);
  return transporter;
}

function isConfigured() {
  try {
    getSmtpSettings();
    return true;
  } catch {
    return false;
  }
}

function safeErrorCode(err) {
  const code = String(err?.code || "SMTP_SEND_FAILED");
  return /^[A-Z0-9_-]{1,64}$/.test(code) ? code : "SMTP_SEND_FAILED";
}

function responseCode(err) {
  const code = Number(err?.responseCode);
  return Number.isInteger(code) && code >= 100 && code <= 599 ? code : undefined;
}

function isTransientError(err) {
  const smtpCode = responseCode(err);
  return TRANSIENT_CODES.has(String(err?.code || "")) || (smtpCode >= 400 && smtpCode < 500);
}

function delay(ms) {
  if (!ms) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logDeliveryFailure(event) {
  logger.error({ event: "email_delivery_failed", ...event });
}

function configurationFailure(kind, err) {
  const result = {
    ok: false,
    status: "rejected",
    kind,
    attempts: 0,
    transient: false,
    errorCode: safeErrorCode(err),
  };
  logDeliveryFailure(result);
  return result;
}

async function sendMail({ kind, to, subject, text, html, replyTo }) {
  let settings;
  let message;
  try {
    settings = getSmtpSettings();
    message = {
      from: { name: SCHOOL_NAME, address: settings.from },
      to: validateMailbox(to || settings.officeRecipient, "EMAIL_RECIPIENT_INVALID"),
      replyTo: replyTo ? validateMailbox(replyTo, "EMAIL_REPLY_TO_INVALID") : undefined,
      subject: validateHeader(subject, "EMAIL_SUBJECT_INVALID"),
      text: String(text || ""),
      html: String(html || ""),
    };
  } catch (err) {
    return configurationFailure(kind, err);
  }

  for (let attempt = 1; attempt <= settings.maxAttempts; attempt += 1) {
    try {
      const info = await getTransporter(settings).sendMail(message);
      const acceptedCount = Array.isArray(info?.accepted) ? info.accepted.length : undefined;
      const rejectedCount = Array.isArray(info?.rejected) ? info.rejected.length : undefined;
      if ((acceptedCount === 0 && rejectedCount !== undefined) || rejectedCount > 0) {
        const rejection = configurationError("SMTP_RECIPIENT_REJECTED");
        rejection.responseCode = 550;
        throw rejection;
      }
      return {
        ok: true,
        status: "sent",
        kind,
        attempts: attempt,
        messageId: typeof info?.messageId === "string" ? info.messageId : undefined,
        acceptedCount,
        rejectedCount,
      };
    } catch (err) {
      const transient = isTransientError(err);
      if (transient && attempt < settings.maxAttempts) {
        await delay(settings.retryBaseMs * 2 ** (attempt - 1));
        continue;
      }
      const result = {
        ok: false,
        status: "failed",
        kind,
        attempts: attempt,
        transient,
        errorCode: safeErrorCode(err),
        responseCode: responseCode(err),
      };
      logDeliveryFailure(result);
      return result;
    }
  }

  return configurationFailure(kind, configurationError("SMTP_RETRY_EXHAUSTED"));
}

async function sendOfficeAndConfirmation(officeMail, confirmationMail) {
  const office = await sendMail(officeMail);
  const confirmation = await sendMail(confirmationMail);
  return { ok: office.ok && confirmation.ok, office, confirmation };
}

function invalidPair(kind, err) {
  const office = configurationFailure(`${kind}.office`, err);
  const confirmation = { ...office, kind: `${kind}.confirmation` };
  return { ok: false, office, confirmation };
}

function validateEntry(name, email) {
  validateHeader(name, "EMAIL_NAME_INVALID", 120);
  validateMailbox(email, "EMAIL_ADDRESS_INVALID");
}

async function sendContactEmail(entry) {
  try {
    validateEntry(entry.name, entry.email);
  } catch (err) {
    return invalidPair("contact", err);
  }
  return sendOfficeAndConfirmation(
    {
      kind: "contact.office",
      subject: `Website contact from ${entry.name}`,
      text: templates.buildContactOfficeText(entry),
      html: templates.buildContactOfficeHtml(entry),
      replyTo: entry.email,
    },
    {
      kind: "contact.confirmation",
      to: entry.email,
      subject: `We received your message — ${SCHOOL_NAME}`,
      text: templates.buildContactConfirmText(entry),
      html: templates.buildContactConfirmHtml(entry),
    },
  );
}

async function sendTourEmail(entry) {
  try {
    validateEntry(entry.parentName, entry.email);
  } catch (err) {
    return invalidPair("tour", err);
  }
  return sendOfficeAndConfirmation(
    {
      kind: "tour.office",
      subject: `Tour request — ${entry.parentName}`,
      text: templates.buildTourOfficeText(entry),
      html: templates.buildTourOfficeHtml(entry),
      replyTo: entry.email,
    },
    {
      kind: "tour.confirmation",
      to: entry.email,
      subject: `Tour request received — ${SCHOOL_NAME}`,
      text: templates.buildTourConfirmText(entry),
      html: templates.buildTourConfirmHtml(entry),
    },
  );
}

async function sendAdmissionEmail(entry) {
  try {
    validateEntry(entry.childLegalName || entry.parentName, entry.email);
  } catch (err) {
    return invalidPair("admission", err);
  }
  return sendOfficeAndConfirmation(
    {
      kind: "admission.office",
      subject: `Admission application — ${entry.childLegalName || entry.parentName}`,
      text: templates.buildAdmissionOfficeText(entry),
      html: templates.buildAdmissionOfficeHtml(entry),
      replyTo: entry.email,
    },
    {
      kind: "admission.confirmation",
      to: entry.email,
      subject: `Application received — ${SCHOOL_NAME}`,
      text: templates.buildAdmissionConfirmText(entry),
      html: templates.buildAdmissionConfirmHtml(entry),
    },
  );
}

module.exports = { sendContactEmail, sendTourEmail, sendAdmissionEmail, isConfigured };
