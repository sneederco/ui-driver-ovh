const fs = require('fs');
const path = require('path');

const roots = ['rancher', 'samples', 'docs'];
let checked = 0;

for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  walk(root);
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.json')) {
      const data = fs.readFileSync(full, 'utf8');
      JSON.parse(data);
      checked++;
    }
  }
}

console.log(`lint: parsed ${checked} JSON files successfully`);
