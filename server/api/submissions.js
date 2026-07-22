const fs = require("fs");
const path = require("path");
const {
  assertAllowedValue,
  assertNotPastDate,
  assertPastDate,
  assertRequiredName,
  assertValidEmail,
  assertValidPhone,
  assertValidState,
  assertValidZip,
  parseIsoDate,
} = require("./validation");

// Production uses DATA_DIR outside deploy folder so frontend/API deploys never wipe submissions.
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, "../data");

const SUBMISSION_FILES = {
  contact: "contact-submissions.json",
  tour: "tour-submissions.json",
  admission: "admission-submissions.json",
};
const TOUR_WEEKDAYS = [2, 3, 4];
const MAX_LIST_LIMIT = 500;
const LOCK_WAIT_MS = 5000;
const LOCK_STALE_MS = 10000;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function sleepSync(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.min(ms, end - Date.now()));
}

function withFileLock(file, fn) {
  ensureDataDir();
  const lockFile = `${file}.lock`;
  const start = Date.now();
  let handle;
  while (!handle) {
    try {
      handle = fs.openSync(lockFile, "wx");
      fs.writeFileSync(handle, `${process.pid}:${Date.now()}`, "utf8");
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      try {
        const age = Date.now() - fs.statSync(lockFile).mtimeMs;
        if (age > LOCK_STALE_MS) fs.unlinkSync(lockFile);
      } catch (lockErr) {
        if (lockErr.code !== "ENOENT") throw lockErr;
      }
      if (Date.now() - start > LOCK_WAIT_MS) throw new Error("Submission storage is busy. Please try again.");
      sleepSync(25);
    }
  }
  try {
    return fn();
  } finally {
    if (handle) fs.closeSync(handle);
    try {
      fs.unlinkSync(lockFile);
    } catch {}
  }
}

function readList(filename, { allowMissing = true } = {}) {
  ensureDataDir();
  const file = path.join(DATA_DIR, filename);
  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Submission file is not a JSON array.");
    return parsed;
  } catch (err) {
    if (allowMissing && err.code === "ENOENT") return [];
    err.message = `Unable to read ${filename}: ${err.message}`;
    throw err;
  }
}

function readListForAdmin(filename) {
  try {
    return { records: readList(filename), error: null };
  } catch (err) {
    return { records: [], error: err.message };
  }
}

function appendRecord(filename, record) {
  const file = path.join(DATA_DIR, filename);
  return withFileLock(file, () => {
    const list = readList(filename);
    const entry = {
      id: `${Date.now()}-${cryptoRandomId()}`,
      submittedAt: new Date().toISOString(),
      ...record,
    };
    list.push(entry);
    const tmp = `${file}.${process.pid}.${cryptoRandomId()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(list, null, 2), "utf8");
    fs.renameSync(tmp, file);
    return entry;
  });
}

function cryptoRandomId() {
  return require("crypto").randomBytes(6).toString("hex");
}

function isTourDay(iso) {
  const date = parseIsoDate(iso, "tour date");
  return TOUR_WEEKDAYS.includes(date.getUTCDay());
}

function cleanText(value, max = 4000) {
  return String(value ?? "").trim().slice(0, max);
}

function saveContact(body) {
  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 120).toLowerCase();
  const phone = cleanText(body.phone, 40);
  const message = cleanText(body.message, 4000);

  if (!name || !email || !phone || !message) throw new Error("Name, email, phone, and message are required.");
  assertRequiredName(name);
  assertValidEmail(email);
  assertValidPhone(phone);

  return appendRecord(SUBMISSION_FILES.contact, { type: "contact", name, email, phone, message });
}

function saveTour(body) {
  const parentName = cleanText(body.parentName, 120);
  const childName = cleanText(body.childName, 120);
  const childAge = cleanText(body.childAge, 40);
  const tourDate = cleanText(body.tourDate, 10);
  const phone = cleanText(body.phone, 40);
  const email = cleanText(body.email, 120).toLowerCase();
  const message = cleanText(body.message, 4000);

  if (!parentName || !childName || !childAge || !tourDate || !phone || !email) {
    throw new Error("Please complete all required tour fields (name, email, and phone are required).");
  }
  assertRequiredName(parentName, "parent / guardian name");
  assertRequiredName(childName, "child name");
  assertNotPastDate(tourDate, "tour date");
  if (!isTourDay(tourDate)) throw new Error("Tour date must be a Tuesday, Wednesday, or Thursday.");
  assertValidEmail(email);
  assertValidPhone(phone);

  return appendRecord(SUBMISSION_FILES.tour, { type: "tour", parentName, childName, childAge, tourDate, phone, email, message });
}

function saveAdmission(body) {
  const parentName = cleanText(body.parentName, 120);
  const parentRelation = cleanText(body.parentRelation, 80);
  const phone = cleanText(body.phone, 40);
  const email = cleanText(body.email, 120).toLowerCase();
  const addressLine = cleanText(body.addressLine, 200);
  const city = cleanText(body.city, 80);
  const state = cleanText(body.state, 2).toUpperCase();
  const zip = cleanText(body.zip, 10);
  const secondaryName = cleanText(body.secondaryName, 120);
  const secondaryEmail = cleanText(body.secondaryEmail, 120).toLowerCase();
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

  if (!parentName || !parentRelation || !phone || !email || !addressLine || !city || !state || !zip || !childLegalName || !childDob || !program || !schedulePref || !start || !siblingAtSchool || !referralSource) {
    throw new Error("Please complete all required application fields (name, email, and phone are required).");
  }
  assertRequiredName(parentName, "parent / guardian name");
  assertRequiredName(childLegalName, "child legal name");
  assertValidEmail(email);
  assertValidPhone(phone);
  assertValidState(state);
  assertValidZip(zip);
  assertPastDate(childDob, "child date of birth");
  if (/^\d{4}-\d{2}-\d{2}$/.test(start)) assertNotPastDate(start, "preferred start date");
  assertAllowedValue(siblingAtSchool, ["yes", "no", "Yes", "No", "YES", "NO"], "sibling answer");
  if (secondaryEmail) assertValidEmail(secondaryEmail, "secondary email address");
  assertValidPhone(secondaryPhone, { required: false, label: "secondary phone number" });

  return appendRecord(SUBMISSION_FILES.admission, {
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

function boundedSorted(records, limit) {
  const byNewest = (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt);
  return [...records].sort(byNewest).slice(0, limit);
}

function normalizeLimit(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return MAX_LIST_LIMIT;
  return Math.min(parsed, MAX_LIST_LIMIT);
}

function listAllSubmissions(options = {}) {
  const limit = normalizeLimit(options.limit);
  const contact = readListForAdmin(SUBMISSION_FILES.contact);
  const tour = readListForAdmin(SUBMISSION_FILES.tour);
  const admission = readListForAdmin(SUBMISSION_FILES.admission);
  const errors = {};
  if (contact.error) errors.contact = contact.error;
  if (tour.error) errors.tour = tour.error;
  if (admission.error) errors.admission = admission.error;
  return {
    contact: boundedSorted(contact.records, limit),
    tour: boundedSorted(tour.records, limit),
    admission: boundedSorted(admission.records, limit),
    limit,
    counts: {
      contact: contact.records.length,
      tour: tour.records.length,
      admission: admission.records.length,
      total: contact.records.length + tour.records.length + admission.records.length,
    },
    ...(Object.keys(errors).length ? { storageErrors: errors } : {}),
  };
}

module.exports = { saveContact, saveTour, saveAdmission, listAllSubmissions, isTourDay, readList };
