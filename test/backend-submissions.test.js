const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "forestview-backend-"));
process.env.DATA_DIR = tempDir;
const submissions = require("../server/api/submissions");

function futureTourDate() {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  for (let i = 1; i < 21; i += 1) {
    const candidate = new Date(date);
    candidate.setUTCDate(date.getUTCDate() + i);
    if ([2, 3, 4].includes(candidate.getUTCDay())) return candidate.toISOString().slice(0, 10);
  }
  throw new Error("No future tour date found");
}

test("tour validation rejects invalid and past dates", () => {
  const base = {
    parentName: "Jane Parent",
    childName: "Pat Child",
    childAge: "4",
    phone: "555-555-5555",
    email: "jane@example.com",
  };
  assert.throws(() => submissions.saveTour({ ...base, tourDate: "2026-02-31" }), /valid tour date/);
  assert.throws(() => submissions.saveTour({ ...base, tourDate: "2020-01-01" }), /past|Tuesday|Wednesday|Thursday/);
  const saved = submissions.saveTour({ ...base, tourDate: futureTourDate() });
  assert.equal(saved.type, "tour");
});

test("admission validation rejects invalid state, zip, and future child birth date", () => {
  const base = {
    parentName: "Jane Parent",
    parentRelation: "Mother",
    phone: "555-555-5555",
    email: "jane@example.com",
    addressLine: "1 Main St",
    city: "Forest",
    state: "NC",
    zip: "27514",
    childLegalName: "Pat Child",
    childDob: "2020-01-01",
    program: "Preschool",
    schedulePref: "Full day",
    start: "Next available",
    siblingAtSchool: "no",
    referralSource: "Website",
  };
  assert.throws(() => submissions.saveAdmission({ ...base, state: "ZZ" }), /state/);
  assert.throws(() => submissions.saveAdmission({ ...base, zip: "abc" }), /ZIP/);
  assert.throws(() => submissions.saveAdmission({ ...base, childDob: "2999-01-01" }), /past/);
  assert.equal(submissions.saveAdmission(base).type, "admission");
});

test("storage corruption is visible and admin listing is bounded", () => {
  const contactFile = path.join(tempDir, "contact-submissions.json");
  fs.writeFileSync(contactFile, "not-json", "utf8");
  assert.throws(
    () => submissions.saveContact({ name: "A User", email: "a@example.com", phone: "5555555555", message: "Hello" }),
    /Unable to read contact-submissions\.json/,
  );
  const listed = submissions.listAllSubmissions({ limit: 1 });
  assert.equal(listed.limit, 1);
  assert.match(listed.storageErrors.contact, /Unable to read contact-submissions\.json/);
});
