export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_INPUT_PATTERN = "[^\\s@]+@[^\\s@]+\\.[^\\s@]+";
export const PHONE_INPUT_PATTERN = "^(\\+?1[\\s\\-.]?)?(\\(?\\d{3}\\)?[\\s\\-.]?)?\\d{3}[\\s\\-.]?\\d{4}$";

export function sanitizePhoneInput(value) {
  return String(value).replace(/[^\d\s()+\-.]/g, "");
}

export function isValidEmail(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || !trimmed.includes("@")) return false;
  return EMAIL_PATTERN.test(trimmed);
}

const EMAIL_ERROR = "Please enter a valid email address (must include @).";
const PHONE_ERROR = "Please enter a valid 10-digit phone number.";
const NAME_ERROR = "Please enter your name.";

export function isValidPhone(value, { required = true } = {}) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return !required;
  if (!/^[\d\s()+\-.]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

export function validateContactFields({ name, email, phone }) {
  if (!String(name ?? "").trim()) return NAME_ERROR;
  if (!isValidEmail(email)) return EMAIL_ERROR;
  if (!isValidPhone(phone)) return PHONE_ERROR;
  return "";
}

export function validateTourFields({ name, email, phone }) {
  if (!String(name ?? "").trim()) return NAME_ERROR;
  if (!isValidEmail(email)) return EMAIL_ERROR;
  if (!isValidPhone(phone)) return PHONE_ERROR;
  return "";
}

export function validateAdmissionFields({ name, email, phone, secondaryEmail, secondaryPhone }) {
  if (!String(name ?? "").trim()) return NAME_ERROR;
  if (!isValidEmail(email)) return EMAIL_ERROR;
  if (!isValidPhone(phone)) return PHONE_ERROR;
  if (secondaryEmail && !isValidEmail(secondaryEmail)) {
    return "Please enter a valid secondary email address (must include @).";
  }
  if (secondaryPhone && !isValidPhone(secondaryPhone, { required: false })) {
    return "Please enter a valid secondary phone number.";
  }
  return "";
}
