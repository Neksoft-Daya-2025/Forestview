const fs = require("fs");
const path = require("path");
const { assertValidEmail, assertValidPhone, assertRequiredName } = require("./validation");

// Production uses DATA_DIR outside deploy folder so frontend/API deploys never wipe submissions.
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, "../data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readList(filename) {
  ensureDataDir();
  const file = path.join(DATA_DIR, filename);
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function appendRecord(filename, record) {
  const list = readList(filename);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    submittedAt: new Date().toISOString(),
    ...record,
  };
  list.push(entry);
  const file = path.join(DATA_DIR, filename);
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2), "utf8");
  fs.renameSync(tmp, file);
  return entry;
}

const TOUR_WEEKDAYS = [2, 3, 4];

function isTourDay(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  return TOUR_WEEKDAYS.includes(new Date(y, m - 1, d).getDay());
}

function cleanText(value, max = 4000) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function saveContact(body) {
  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 120);
  const phone = cleanText(body.phone, 40);
  const message = cleanText(body.message, 4000);

  if (!name || !email || !phone || !message) {
    throw new Error("Name, email, phone, and message are required.");
  }
  assertRequiredName(name);
  assertValidEmail(email);
  assertValidPhone(phone);

  return appendRecord("contact-submissions.json", { type: "contact", name, email, phone, message });
}

function saveTour(body) {
  const parentName = cleanText(body.parentName, 120);
  const childName = cleanText(body.childName, 120);
  const childAge = cleanText(body.childAge, 40);
  const tourDate = cleanText(body.tourDate, 10);
  const phone = cleanText(body.phone, 40);
  const email = cleanText(body.email, 120);
  const message = cleanText(body.message, 4000);

  if (!parentName || !childName || !childAge || !tourDate || !phone || !email) {
    throw new Error("Please complete all required tour fields (name, email, and phone are required).");
  }
  if (!isTourDay(tourDate)) {
    throw new Error("Tour date must be a Tuesday, Wednesday, or Thursday.");
  }
  assertRequiredName(parentName, "parent / guardian name");
  assertValidEmail(email);
  assertValidPhone(phone);

  return appendRecord("tour-submissions.json", {
    type: "tour",
    parentName,
    childName,
    childAge,
    tourDate,
    phone,
    email,
    message,
  });
}

function saveAdmission(body) {
  const parentName = cleanText(body.parentName, 120);
  const parentRelation = cleanText(body.parentRelation, 80);
  const phone = cleanText(body.phone, 40);
  const email = cleanText(body.email, 120);
  const addressLine = cleanText(body.addressLine, 200);
  const city = cleanText(body.city, 80);
  const state = cleanText(body.state, 2).toUpperCase();
  const zip = cleanText(body.zip, 10);
  const secondaryName = cleanText(body.secondaryName, 120);
  const secondaryEmail = cleanText(body.secondaryEmail, 120);
  const secondaryPhone = cleanText(body.secondaryPhone, 40);
  const childLegalName = cleanText(body.childLegalName, 120);
  const childPreferredName = cleanText(body.childPreferredName, 120);
  const childDob = cleanText(body.childDob, 10);
  const currentCare = cleanText(body.currentCare, 2000);
  const program = cleanText(body.program, 120);
  const schedulePref = cleanText(body.schedulePref, 120);
  const start = cleanText(body.start, 120);
  const siblingAtSchool = cleanText(body.siblingAtSchool, 10);
  const siblingNames = cleanText(body.siblingNames, 200);
  const referralSource = cleanText(body.referralSource, 120);
  const referralDetail = cleanText(body.referralDetail, 200);
  const healthNotes = cleanText(body.healthNotes, 4000);
  const learningNotes = cleanText(body.learningNotes, 4000);
  const message = cleanText(body.message, 4000);

  if (
    !parentName ||
    !parentRelation ||
    !phone ||
    !email ||
    !addressLine ||
    !city ||
    !state ||
    !zip ||
    !childLegalName ||
    !childDob ||
    !program ||
    !schedulePref ||
    !start ||
    !siblingAtSchool ||
    !referralSource
  ) {
    throw new Error("Please complete all required application fields (name, email, and phone are required).");
  }
  assertRequiredName(parentName, "parent / guardian name");
  assertValidEmail(email);
  assertValidPhone(phone);
  if (secondaryEmail) assertValidEmail(secondaryEmail, "secondary email address");
  assertValidPhone(secondaryPhone, { required: false, label: "secondary phone number" });

  return appendRecord("admission-submissions.json", {
    type: "admission",
    parentName,
    parentRelation,
    phone,
    email,
    addressLine,
    city,
    state,
    zip,
    secondaryName,
    secondaryEmail,
    secondaryPhone,
    childLegalName,
    childPreferredName,
    childDob,
    currentCare,
    program,
    schedulePref,
    start,
    siblingAtSchool,
    siblingNames,
    referralSource,
    referralDetail,
    healthNotes,
    learningNotes,
    message,
  });
}

function listAllSubmissions() {
  const contact = readList("contact-submissions.json");
  const tour = readList("tour-submissions.json");
  const admission = readList("admission-submissions.json");
  const byNewest = (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt);
  return {
    contact: [...contact].sort(byNewest),
    tour: [...tour].sort(byNewest),
    admission: [...admission].sort(byNewest),
    counts: {
      contact: contact.length,
      tour: tour.length,
      admission: admission.length,
      total: contact.length + tour.length + admission.length,
    },
  };
}

module.exports = { saveContact, saveTour, saveAdmission, listAllSubmissions };
