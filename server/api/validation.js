const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const US_STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA",
  "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC",
]);

function assertValidEmail(email, label = "email address") {
  const trimmed = String(email ?? "").trim();
  if (!trimmed.includes("@") || trimmed.length > 254 || !EMAIL_RE.test(trimmed)) {
    throw new Error(`Please enter a valid ${label} (must include @).`);
  }
}

function assertRequiredName(name, label = "name") {
  const value = String(name ?? "").trim();
  if (!value || !/[A-Za-z]/.test(value)) {
    throw new Error(`Please enter your ${label}.`);
  }
}

function assertValidPhone(phone, { required = true, label = "phone number" } = {}) {
  const trimmed = String(phone ?? "").trim();
  if (!trimmed) {
    if (required) throw new Error(`Please enter a valid ${label}.`);
    return;
  }
  if (!/^[\d\s()+\-.]+$/.test(trimmed)) {
    throw new Error(`Please enter a valid ${label}.`);
  }
  const digits = trimmed.replace(/\D/g, "");
  if (!(digits.length === 10 || (digits.length === 11 && digits.startsWith("1")))) {
    throw new Error(`Please enter a valid 10-digit ${label}.`);
  }
}

function parseIsoDate(iso, label = "date") {
  const value = String(iso ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Please enter a valid ${label}.`);
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`Please enter a valid ${label}.`);
  }
  return date;
}

function assertNotPastDate(iso, label = "date", now = new Date()) {
  const date = parseIsoDate(iso, label);
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (date < today) throw new Error(`${label.charAt(0).toUpperCase()}${label.slice(1)} cannot be in the past.`);
  return date;
}

function assertPastDate(iso, label = "date", now = new Date()) {
  const date = parseIsoDate(iso, label);
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (date >= today) throw new Error(`${label.charAt(0).toUpperCase()}${label.slice(1)} must be in the past.`);
  return date;
}

function assertValidState(state) {
  if (!US_STATES.has(String(state ?? "").trim().toUpperCase())) throw new Error("Please enter a valid state abbreviation.");
}

function assertValidZip(zip) {
  if (!/^\d{5}(?:-\d{4})?$/.test(String(zip ?? "").trim())) throw new Error("Please enter a valid ZIP code.");
}

function assertAllowedValue(value, allowed, label) {
  if (!allowed.includes(String(value ?? "").trim())) throw new Error(`Please select a valid ${label}.`);
}

module.exports = {
  assertValidEmail,
  assertValidPhone,
  assertRequiredName,
  parseIsoDate,
  assertNotPastDate,
  assertPastDate,
  assertValidState,
  assertValidZip,
  assertAllowedValue,
};
