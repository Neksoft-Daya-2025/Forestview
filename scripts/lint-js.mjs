import { readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const roots = ['server', 'scripts', 'test'];
const ignored = new Set(['node_modules', 'dist', '.git']);
const extensions = new Set(['.js', '.mjs', '.cjs']);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(path, files);
    } else if (extensions.has(path.slice(path.lastIndexOf('.')))) {
      files.push(path);
    }
  }
  return files;
}

const files = roots.filter((root) => statSync(root, { throwIfNoEntry: false })?.isDirectory()).flatMap((root) => walk(root));

let failed = false;
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) failed = true;
}

if (failed) {
  process.exit(1);
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);
