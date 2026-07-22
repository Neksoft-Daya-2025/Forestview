const assert = require("node:assert/strict");
const test = require("node:test");

const auth = require("../server/api/auth");

test("admin login has no insecure default credentials", () => {
  const oldUser = process.env.ADMIN_USERNAME;
  const oldPass = process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_USERNAME;
  delete process.env.ADMIN_PASSWORD;
  try {
    assert.equal(auth.login("forestview", "FvAdmin@2026"), null);
  } finally {
    if (oldUser === undefined) delete process.env.ADMIN_USERNAME;
    else process.env.ADMIN_USERNAME = oldUser;
    if (oldPass === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = oldPass;
  }
});

test("admin login accepts configured credentials and constant-time helper requires exact equality", () => {
  const oldUser = process.env.ADMIN_USERNAME;
  const oldPass = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_USERNAME = "admin-user";
  process.env.ADMIN_PASSWORD = "correct horse battery staple";
  try {
    const token = auth.login("admin-user", "correct horse battery staple");
    assert.match(token, /^[a-f0-9]{64}$/);
    assert.equal(auth.getSession(token).username, "admin-user");
    assert.equal(auth.safeEqualString("abc", "abc"), true);
    assert.equal(auth.safeEqualString("abc", "abcd"), false);
  } finally {
    if (oldUser === undefined) delete process.env.ADMIN_USERNAME;
    else process.env.ADMIN_USERNAME = oldUser;
    if (oldPass === undefined) delete process.env.ADMIN_PASSWORD;
    else process.env.ADMIN_PASSWORD = oldPass;
  }
});
