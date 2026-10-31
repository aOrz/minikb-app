// Parse project-authored application scripts without executing native/network APIs.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
let count = 0;
function check(source, filename) {
  new vm.Script(source, { filename });
  count++;
}
for (const name of ['myjs.js', 'update.js']) {
  check(fs.readFileSync(path.join(root, 'src/js', name), 'utf8'), 'src/js/' + name);
}
for (const name of fs.readdirSync(path.join(root, 'src')).filter(name => name.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, 'src', name), 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/\bsrc\s*=/.test(match[1]) || /\btype\s*=\s*["'](?!text\/javascript|application\/javascript)/i.test(match[1])) continue;
    check(match[2], 'src/' + name);
  }
}
function walk(directory) {
  for (const name of fs.readdirSync(directory)) {
    const file = path.join(directory, name);
    if (fs.statSync(file).isDirectory()) walk(file);
    else if (name.endsWith('.js')) check(fs.readFileSync(file, 'utf8'), path.relative(root, file));
  }
}
walk(path.join(root, 'wxmp'));
console.log(`Syntax OK: ${count} application script blocks (native APIs were not executed).`);
