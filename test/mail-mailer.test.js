const assert = require("node:assert/strict");
const test = require("node:test");

const nodemailer = require("nodemailer");
const logger = require("../server/logger");

const originalCreateTransport = nodemailer.createTransport;
const originalLoggerError = logger.error;
const MAILER_PATH = require.resolve("../server/api/mailer");

function resetSafeEnvironment() {
  process.env.SMTP_HOST = "smtp.test.invalid";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_SECURE = "false";
  process.env.SMTP_USER = "sender@example.com";
  process.env.SMTP_PASS = "test-password";
  process.env.SMTP_FROM = "sender@example.com";
  process.env.SMTP_TO = "office@example.com";
  process.env.SMTP_MAX_ATTEMPTS = "3";
  process.env.SMTP_RETRY_BASE_MS = "0";
}

function loadMailer(sendMail, onConfig = () => {}) {
  nodemailer.createTransport = (config) => {
    onConfig(config);
    return { sendMail };
  };
  delete require.cache[MAILER_PATH];
  return require(MAILER_PATH);
}

function contactEntry(overrides = {}) {
  return {
    id: "test-entry-1",
    submittedAt: "2026-01-15T12:00:00.000Z",
    name: "Parent Example",
    email: "parent@example.com",
    phone: "555-555-5555",
    message: "Please contact me.",
    ...overrides,
  };
}

test("mailer hardening uses only mocked transports", async (t) => {
  t.afterEach(() => {
    logger.error = originalLoggerError;
  });

  await t.test("uses bounded TLS transport options and returns separate delivery results", async () => {
    resetSafeEnvironment();
    let transportConfig;
    const messages = [];
    const mailer = loadMailer(async (message) => {
      messages.push(message);
      return { messageId: `mock-${messages.length}`, accepted: [message.to], rejected: [] };
    }, (config) => {
      transportConfig = config;
    });

    const result = await mailer.sendContactEmail(contactEntry());

    assert.equal(result.ok, true);
    assert.equal(result.office.kind, "contact.office");
    assert.equal(result.office.attempts, 1);
    assert.equal(result.confirmation.kind, "contact.confirmation");
    assert.equal(result.confirmation.attempts, 1);
    assert.equal(messages.length, 2);
    assert.equal(messages[0].to, "office@example.com");
    assert.equal(messages[1].to, "parent@example.com");
    assert.deepEqual(messages[0].from, { name: "Forestview Montessori", address: "sender@example.com" });
    assert.equal(transportConfig.requireTLS, true);
    assert.equal(transportConfig.secure, false);
    assert.equal(transportConfig.connectionTimeout, 10000);
    assert.equal(transportConfig.greetingTimeout, 10000);
    assert.equal(transportConfig.socketTimeout, 30000);
    assert.equal(transportConfig.disableFileAccess, true);
    assert.equal(transportConfig.disableUrlAccess, true);
    assert.equal(transportConfig.tls.minVersion, "TLSv1.2");
  });

  await t.test("retries transient failures with a strict attempt limit", async () => {
    resetSafeEnvironment();
    let calls = 0;
    const mailer = loadMailer(async (message) => {
      calls += 1;
      if (calls <= 2) {
        const err = new Error("temporary network failure");
        err.code = "ETIMEDOUT";
        throw err;
      }
      return { messageId: `mock-${calls}`, accepted: [message.to], rejected: [] };
    });

    const result = await mailer.sendContactEmail(contactEntry());

    assert.equal(calls, 4);
    assert.equal(result.office.ok, true);
    assert.equal(result.office.attempts, 3);
    assert.equal(result.confirmation.ok, true);
    assert.equal(result.confirmation.attempts, 1);
  });

  await t.test("does not retry permanent SMTP rejection and logs no recipient PII", async () => {
    resetSafeEnvironment();
    const logs = [];
    logger.error = (event) => logs.push(event);
    let calls = 0;
    const mailer = loadMailer(async (message) => {
      calls += 1;
      if (calls === 1) {
        const err = new Error("550 parent@example.com rejected with provider detail");
        err.code = "EENVELOPE";
        err.responseCode = 550;
        throw err;
      }
      return { messageId: "mock-confirmation", accepted: [message.to], rejected: [] };
    });

    const result = await mailer.sendContactEmail(contactEntry());

    assert.equal(calls, 2);
    assert.equal(result.ok, false);
    assert.equal(result.office.attempts, 1);
    assert.equal(result.office.transient, false);
    assert.equal(result.office.errorCode, "EENVELOPE");
    assert.equal(result.office.responseCode, 550);
    assert.equal(result.confirmation.ok, true);
    assert.equal(logs.length, 1);
    assert.equal(logs[0].event, "email_delivery_failed");
    assert.equal(JSON.stringify(logs).includes("parent@example.com"), false);
    assert.equal(JSON.stringify(logs).includes("provider detail"), false);
  });

  await t.test("treats a resolved but rejected recipient as a delivery failure", async () => {
    resetSafeEnvironment();
    const logs = [];
    logger.error = (event) => logs.push(event);
    let calls = 0;
    const mailer = loadMailer(async (message) => {
      calls += 1;
      if (calls === 1) return { messageId: "mock-rejected", accepted: [], rejected: [message.to] };
      return { messageId: "mock-confirmation", accepted: [message.to], rejected: [] };
    });

    const result = await mailer.sendContactEmail(contactEntry());

    assert.equal(calls, 2);
    assert.equal(result.office.ok, false);
    assert.equal(result.office.errorCode, "SMTP_RECIPIENT_REJECTED");
    assert.equal(result.office.attempts, 1);
    assert.equal(result.confirmation.ok, true);
    assert.equal(JSON.stringify(logs).includes("office@example.com"), false);
  });

  await t.test("rejects control characters before creating a transport", async () => {
    resetSafeEnvironment();
    const logs = [];
    logger.error = (event) => logs.push(event);
    let transportCreated = false;
    const mailer = loadMailer(async () => {
      throw new Error("mock should not be called");
    }, () => {
      transportCreated = true;
    });

    const result = await mailer.sendContactEmail(contactEntry({ name: "Parent\r\nBcc: attacker@example.com" }));

    assert.equal(result.ok, false);
    assert.equal(result.office.errorCode, "EMAIL_NAME_INVALID");
    assert.equal(result.confirmation.errorCode, "EMAIL_NAME_INVALID");
    assert.equal(result.office.attempts, 0);
    assert.equal(transportCreated, false);
    assert.equal(logs.length, 1);
  });

  await t.test("rejects malformed configured mailboxes without opening SMTP", async () => {
    resetSafeEnvironment();
    process.env.SMTP_FROM = "Forestview <sender@example.com>";
    const logs = [];
    logger.error = (event) => logs.push(event);
    let transportCreated = false;
    const mailer = loadMailer(async () => {
      throw new Error("mock should not be called");
    }, () => {
      transportCreated = true;
    });

    assert.equal(mailer.isConfigured(), false);
    const result = await mailer.sendContactEmail(contactEntry());
    assert.equal(result.office.errorCode, "SMTP_FROM_INVALID");
    assert.equal(result.confirmation.errorCode, "SMTP_FROM_INVALID");
    assert.equal(transportCreated, false);
    assert.equal(logs.length, 2);
  });

  await t.test("confirmation templates use Central Time and do not imply a confirmed tour", () => {
    const templates = require("../server/api/emailTemplates");
    const tour = {
      submittedAt: "2026-01-15T12:00:00.000Z",
      parentName: "Parent Example",
      childName: "Child Example",
      childAge: "4",
      tourDate: "2026-02-03",
      phone: "555-555-5555",
      email: "parent@example.com",
      message: "",
    };

    const officeText = templates.buildTourOfficeText(tour);
    const confirmationText = templates.buildTourConfirmText(tour);
    const confirmationHtml = templates.buildTourConfirmHtml(tour);

    assert.match(officeText, /CST/);
    assert.doesNotMatch(confirmationText, /confirmation email has been sent/i);
    assert.match(confirmationText, /not a confirmed appointment/i);
    assert.match(confirmationHtml, /not a confirmed appointment/i);
  });
});

test.after(() => {
  nodemailer.createTransport = originalCreateTransport;
  logger.error = originalLoggerError;
  delete require.cache[MAILER_PATH];
});
