const fs = require('fs');
const path = require('path');

const outDir = 'dist';
const inputs = [
  'rancher/ovh-ui-config.json',
  'rancher/ovh-create-node-schema.json',
  'samples/field-definitions.sample.json',
  'samples/validation-messages.sample.json'
];

fs.mkdirSync(outDir, { recursive: true });

const bundle = {};
for (const rel of inputs) {
  const raw = fs.readFileSync(rel, 'utf8');
  const parsed = JSON.parse(raw);
  const outPath = path.join(outDir, path.basename(rel));
  fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2) + '\n');
  bundle[path.basename(rel)] = parsed;
}

fs.writeFileSync(path.join(outDir, 'ovh-ui-bundle.json'), JSON.stringify(bundle, null, 2) + '\n');
console.log(`build: wrote ${inputs.length + 1} artifacts to ${outDir}/`);
