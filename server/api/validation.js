const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function assertValidEmail(email, label = "email address") {
  const trimmed = String(email ?? "").trim();
  if (!trimmed.includes("@") || !EMAIL_RE.test(trimmed)) {
    throw new Error(`Please enter a valid ${label} (must include @).`);
  }
}

function assertRequiredName(name, label = "name") {
  if (!String(name ?? "").trim()) {
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

module.exports = { assertValidEmail, assertValidPhone, assertRequiredName };
