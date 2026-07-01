const SCHOOL_NAME = "Forestview Montessori";
const SCHOOL_PHONE = "(763) 546-1421";
const SCHOOL_EMAIL = "info@forestviewmontessori.org";
const SCHOOL_ADDRESS = "105 Forestview Ln N, Plymouth, MN 55441";

const SUBMISSION_CONFIRM_MESSAGE =
  "Thank you! Your submission has been received. A confirmation email has been sent to the email address you provided. We will review and contact you shortly.";

const COLORS = {
  navy: "#063f25",
  deep: "#064324",
  accent: "#0b6a3a",
  gold: "#ffdb26",
  text: "#06351f",
  muted: "#5d7469",
  border: "#d8e4de",
  sectionBg: "#f4f8f6",
  white: "#ffffff",
};

function escapeHtml(value) {
  if (value == null || value === "") return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatSubmittedAt(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

function row(label, value) {
  if (value == null || value === "") return "";
  return `
    <tr>
      <td style="padding:8px 12px 8px 0;width:38%;vertical-align:top;color:${COLORS.muted};font-size:14px;font-weight:600;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;vertical-align:top;color:${COLORS.text};font-size:14px;line-height:1.5;">${escapeHtml(value)}</td>
    </tr>`;
}

function section(title, rowsHtml) {
  const body = rowsHtml.filter(Boolean).join("");
  if (!body) return "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-collapse:collapse;">
      <tr>
        <td bgcolor="${COLORS.sectionBg}" style="background-color:${COLORS.sectionBg};border:1px solid ${COLORS.border};padding:16px 18px;">
          <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.accent};">${escapeHtml(title)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${body}</table>
        </td>
      </tr>
    </table>`;
}

function messageBlock(label, text) {
  if (!text) return "";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-collapse:collapse;">
      <tr>
        <td bgcolor="${COLORS.white}" style="background-color:${COLORS.white};border:1px solid ${COLORS.border};border-left:4px solid ${COLORS.gold};padding:14px 16px;">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${COLORS.muted};">${escapeHtml(label)}</p>
          <p style="margin:0;font-size:15px;line-height:1.6;color:${COLORS.text};white-space:pre-wrap;">${escapeHtml(text)}</p>
        </td>
      </tr>
    </table>`;
}

function emailLayout({ badge, title, subtitle, bodyHtml, footerNote }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#eef2f0;font-family:Segoe UI,Helvetica Neue,Arial,sans-serif;color:${COLORS.text};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef2f0" style="background-color:#eef2f0;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;border-collapse:collapse;">
          <tr>
            <td bgcolor="${COLORS.navy}" style="background-color:${COLORS.navy};padding:24px 28px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${COLORS.gold};">${escapeHtml(badge)}</p>
              <p style="margin:0 0 6px;font-size:24px;line-height:1.25;color:#ffffff;font-weight:700;font-family:Segoe UI,Helvetica Neue,Arial,sans-serif;">${escapeHtml(title)}</p>
              ${subtitle ? `<p style="margin:0;font-size:14px;line-height:1.5;color:#e8f3ed;font-family:Segoe UI,Helvetica Neue,Arial,sans-serif;">${escapeHtml(subtitle)}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td bgcolor="${COLORS.white}" style="background-color:${COLORS.white};padding:24px 28px;border-left:1px solid ${COLORS.border};border-right:1px solid ${COLORS.border};">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td bgcolor="#f8faf9" style="background-color:#f8faf9;border:1px solid ${COLORS.border};border-top:none;padding:18px 28px;">
              <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${COLORS.navy};">${escapeHtml(SCHOOL_NAME)}</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:${COLORS.muted};">
                ${escapeHtml(SCHOOL_ADDRESS)}<br>
                Phone: <a href="tel:+17635461421" style="color:${COLORS.accent};text-decoration:none;">${escapeHtml(SCHOOL_PHONE)}</a><br>
                <a href="mailto:${SCHOOL_EMAIL}" style="color:${COLORS.accent};text-decoration:none;">${escapeHtml(SCHOOL_EMAIL)}</a>
              </p>
              ${footerNote ? `<p style="margin:14px 0 0;font-size:12px;line-height:1.5;color:${COLORS.muted};">${footerNote}</p>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function submittedBanner(iso) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">
      <tr>
        <td bgcolor="${COLORS.sectionBg}" style="background-color:${COLORS.sectionBg};border:1px solid ${COLORS.border};padding:10px 14px;font-size:13px;color:${COLORS.muted};">
          <strong style="color:${COLORS.text};">Submitted:</strong> ${escapeHtml(formatSubmittedAt(iso))}
        </td>
      </tr>
    </table>`;
}

function buildContactOfficeHtml(entry) {
  const body = [
    submittedBanner(entry.submittedAt),
    section("Contact details", [
      row("Name", entry.name),
      row("Email", entry.email),
      row("Phone", entry.phone || "—"),
    ]),
    messageBlock("Message", entry.message),
  ].join("");

  return emailLayout({
    badge: "Website form",
    title: "New contact message",
    subtitle: `From ${entry.name}`,
    bodyHtml: body,
    footerNote: "Reply directly to this email to reach the sender.",
  });
}

function buildContactConfirmHtml(entry) {
  const body = [
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Dear ${escapeHtml(entry.name)},</p>`,
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeHtml(SUBMISSION_CONFIRM_MESSAGE)}</p>`,
    messageBlock("Your message", entry.message),
    `<p style="margin:0;font-size:14px;line-height:1.6;color:${COLORS.muted};">If you need immediate assistance, please call us at ${escapeHtml(SCHOOL_PHONE)}.</p>`,
  ].join("");

  return emailLayout({
    badge: "Confirmation",
    title: "We received your message",
    subtitle: "Thank you for reaching out",
    bodyHtml: body,
  });
}

function buildTourOfficeHtml(entry) {
  const body = [
    submittedBanner(entry.submittedAt),
    section("Parent / guardian", [
      row("Name", entry.parentName),
      row("Phone", entry.phone),
      row("Email", entry.email),
    ]),
    section("Tour details", [
      row("Child", entry.childName),
      row("Child age", entry.childAge),
      row("Preferred Saturday", entry.tourDate),
      row("Tour window", "Saturday · 10:00 AM – 12:00 PM"),
    ]),
    entry.message ? messageBlock("Additional note", entry.message) : "",
  ].join("");

  return emailLayout({
    badge: "Website form",
    title: "New tour request",
    subtitle: `${entry.parentName} · ${entry.childName}`,
    bodyHtml: body,
    footerNote: "Reply directly to this email to confirm the appointment.",
  });
}

function buildTourConfirmHtml(entry) {
  const body = [
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Dear ${escapeHtml(entry.parentName)},</p>`,
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeHtml(SUBMISSION_CONFIRM_MESSAGE)}</p>`,
    section("Your tour request", [
      row("Child", entry.childName),
      row("Preferred Saturday", entry.tourDate),
      row("Tour hours", "Saturday · 10:00 AM – 12:00 PM"),
    ]),
    entry.message ? messageBlock("Your note", entry.message) : "",
  ].join("");

  return emailLayout({
    badge: "Confirmation",
    title: "Tour request received",
    subtitle: "We look forward to meeting your family",
    bodyHtml: body,
  });
}

function buildAdmissionOfficeHtml(entry) {
  const body = [
    submittedBanner(entry.submittedAt),
    section("Primary guardian", [
      row("Name", entry.parentName),
      row("Relationship", entry.parentRelation),
      row("Phone", entry.phone),
      row("Email", entry.email),
    ]),
    section("Home address", [
      row("Street", entry.addressLine),
      row("City", entry.city),
      row("State", entry.state),
      row("ZIP", entry.zip),
    ]),
    section("Second contact", [
      row("Name", entry.secondaryName),
      row("Email", entry.secondaryEmail),
      row("Phone", entry.secondaryPhone),
    ]),
    section("Child", [
      row("Legal name", entry.childLegalName),
      row("Preferred name", entry.childPreferredName),
      row("Date of birth", entry.childDob),
      row("Current care", entry.currentCare),
    ]),
    section("Enrollment", [
      row("Program", entry.program),
      row("Schedule", entry.schedulePref),
      row("Desired start", entry.start),
      row("Sibling enrolled", entry.siblingAtSchool),
      row("Sibling name(s)", entry.siblingNames),
    ]),
    section("Referral", [
      row("Source", entry.referralSource),
      row("Detail", entry.referralDetail),
    ]),
    section("Health & learning", [
      row("Health notes", entry.healthNotes),
      row("Learning notes", entry.learningNotes),
    ]),
    entry.message ? messageBlock("Anything else", entry.message) : "",
  ].join("");

  return emailLayout({
    badge: "Website form",
    title: "New admission application",
    subtitle: entry.childLegalName || entry.parentName,
    bodyHtml: body,
    footerNote: "Reply directly to this email to contact the applicant.",
  });
}

function buildAdmissionConfirmHtml(entry) {
  const body = [
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Dear ${escapeHtml(entry.parentName)},</p>`,
    `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeHtml(SUBMISSION_CONFIRM_MESSAGE)}</p>`,
    section("Application summary", [
      row("Child", entry.childLegalName),
      row("Program", entry.program),
      row("Desired start", entry.start),
    ]),
    `<p style="margin:0;font-size:14px;line-height:1.6;color:${COLORS.muted};">Additional paperwork may be required. If you have questions, please call ${escapeHtml(SCHOOL_PHONE)} or reply to this email.</p>`,
  ].join("");

  return emailLayout({
    badge: "Confirmation",
    title: "Application received",
    subtitle: "Thank you for applying",
    bodyHtml: body,
  });
}

function line(label, value) {
  if (value == null || value === "") return null;
  return `${label}: ${value}`;
}

function buildBody(rows) {
  return rows.filter(Boolean).join("\n");
}

function schoolFooterText() {
  return buildBody(["", SCHOOL_NAME, SCHOOL_ADDRESS, `Phone: ${SCHOOL_PHONE}`, SCHOOL_EMAIL]);
}

function buildContactOfficeText(entry) {
  return buildBody([
    "NEW CONTACT MESSAGE",
    "",
    line("Submitted", formatSubmittedAt(entry.submittedAt)),
    line("Name", entry.name),
    line("Email", entry.email),
    line("Phone", entry.phone || "—"),
    "",
    "Message:",
    entry.message,
  ]);
}

function buildContactConfirmText(entry) {
  return buildBody([
    `Dear ${entry.name},`,
    "",
    SUBMISSION_CONFIRM_MESSAGE,
    "",
    "— Your message —",
    entry.message,
    schoolFooterText(),
  ]);
}

function buildTourOfficeText(entry) {
  return buildBody([
    "NEW TOUR REQUEST",
    "",
    line("Submitted", formatSubmittedAt(entry.submittedAt)),
    line("Parent / guardian", entry.parentName),
    line("Child", entry.childName),
    line("Child age", entry.childAge),
    line("Preferred Saturday", entry.tourDate),
    line("Tour window", "Saturday · 10:00 AM – 12:00 PM"),
    line("Phone", entry.phone),
    line("Email", entry.email),
    entry.message ? "" : null,
    entry.message ? "Message:" : null,
    entry.message || null,
  ]);
}

function buildTourConfirmText(entry) {
  return buildBody([
    `Dear ${entry.parentName},`,
    "",
    SUBMISSION_CONFIRM_MESSAGE,
    "",
    "Your tour request details:",
    line("Child", entry.childName),
    line("Preferred Saturday", entry.tourDate),
    line("Tour hours", "Saturday · 10:00 AM – 12:00 PM"),
    "",
    entry.message ? "— Your note —" : null,
    entry.message || null,
    schoolFooterText(),
  ]);
}

function buildAdmissionOfficeText(entry) {
  return buildBody([
    "NEW ADMISSION APPLICATION",
    "",
    line("Submitted", formatSubmittedAt(entry.submittedAt)),
    "",
    "— PRIMARY GUARDIAN —",
    line("Name", entry.parentName),
    line("Relationship", entry.parentRelation),
    line("Phone", entry.phone),
    line("Email", entry.email),
    "",
    "— HOME ADDRESS —",
    line("Street", entry.addressLine),
    line("City", entry.city),
    line("State", entry.state),
    line("ZIP", entry.zip),
    "",
    "— SECOND CONTACT —",
    line("Name", entry.secondaryName),
    line("Email", entry.secondaryEmail),
    line("Phone", entry.secondaryPhone),
    "",
    "— CHILD —",
    line("Legal name", entry.childLegalName),
    line("Preferred name", entry.childPreferredName),
    line("Date of birth", entry.childDob),
    line("Current care", entry.currentCare),
    "",
    "— ENROLLMENT —",
    line("Program", entry.program),
    line("Schedule", entry.schedulePref),
    line("Desired start", entry.start),
    line("Sibling enrolled", entry.siblingAtSchool),
    line("Sibling name(s)", entry.siblingNames),
    "",
    "— REFERRAL —",
    line("Source", entry.referralSource),
    line("Detail", entry.referralDetail),
    "",
    "— HEALTH & LEARNING —",
    line("Health notes", entry.healthNotes),
    line("Learning notes", entry.learningNotes),
    "",
    "— ANYTHING ELSE —",
    entry.message || "—",
  ]);
}

function buildAdmissionConfirmText(entry) {
  return buildBody([
    `Dear ${entry.parentName},`,
    "",
    SUBMISSION_CONFIRM_MESSAGE,
    "",
    "Application summary:",
    line("Child", entry.childLegalName),
    line("Program", entry.program),
    line("Desired start", entry.start),
    "",
    "Additional paperwork may be required.",
    "",
    `If you have questions in the meantime, please call us at ${SCHOOL_PHONE} or reply to this email.`,
    schoolFooterText(),
  ]);
}

module.exports = {
  buildContactOfficeHtml,
  buildContactConfirmHtml,
  buildTourOfficeHtml,
  buildTourConfirmHtml,
  buildAdmissionOfficeHtml,
  buildAdmissionConfirmHtml,
  buildContactOfficeText,
  buildContactConfirmText,
  buildTourOfficeText,
  buildTourConfirmText,
  buildAdmissionOfficeText,
  buildAdmissionConfirmText,
};
