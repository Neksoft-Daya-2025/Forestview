import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(path, 'utf8');

test('package exposes usable quality scripts and patched Nodemailer range', () => {
  const pkg = JSON.parse(read('package.json'));

  assert.equal(pkg.scripts.test, 'node --test test/*.test.js');
  assert.equal(pkg.scripts.lint, 'node scripts/lint-js.mjs');
  assert.match(pkg.scripts.check, /npm run lint/);
  assert.match(pkg.scripts.check, /npm test/);
  assert.equal(pkg.dependencies.nodemailer, '^9.0.3');
});

test('local secret files are ignored and env example contains placeholders only', () => {
  const gitignore = read('.gitignore');
  assert.match(gitignore, /^\.env$/m);

  const envExample = read('.env.example');
  assert.doesNotMatch(envExample, /ready-to-use `.env` with real values/i);
  assert.match(envExample, /^SMTP_USER=$/m);
  assert.match(envExample, /^SMTP_PASS=$/m);
  assert.match(envExample, /^SMTP_FROM=$/m);
  assert.match(envExample, /^ADMIN_USERNAME=$/m);
  assert.match(envExample, /^ADMIN_PASSWORD=$/m);
});

test('README documents secret hygiene, required env vars, and cleanup actions', () => {
  const readme = read('README.md');
  assert.doesNotMatch(readme, /included in the repo/i);
  assert.doesNotMatch(readme, /clone and run, no extra config needed/i);
  assert.match(readme, /Secrets are not committed/i);
  assert.match(readme, /Rotate the affected SMTP\/admin credentials/i);
  assert.match(readme, /git filter-repo|BFG/i);

  for (const name of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM', 'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'NODE_ENV', 'DATA_DIR']) {
    assert.ok(readme.includes(`\`${name}\``), `${name} should be documented`);
  }
});
