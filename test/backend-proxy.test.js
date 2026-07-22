const assert = require("node:assert/strict");
const test = require("node:test");

const { app, trustLocalReverseProxy } = require("../server/index");

test("trust proxy is limited to the local reverse proxy hop", () => {
  assert.equal(app.get("trust proxy fn"), trustLocalReverseProxy);

  assert.equal(trustLocalReverseProxy("127.0.0.1"), true);
  assert.equal(trustLocalReverseProxy("127.10.20.30"), true);
  assert.equal(trustLocalReverseProxy("::1"), true);
  assert.equal(trustLocalReverseProxy("::ffff:127.0.0.1"), true);

  assert.equal(trustLocalReverseProxy("10.0.0.5"), false);
  assert.equal(trustLocalReverseProxy("172.16.0.5"), false);
  assert.equal(trustLocalReverseProxy("192.168.1.10"), false);
  assert.equal(trustLocalReverseProxy("203.0.113.10"), false);
  assert.equal(trustLocalReverseProxy("::ffff:10.0.0.5"), false);
  assert.equal(trustLocalReverseProxy("127.0.0.999"), false);
});
