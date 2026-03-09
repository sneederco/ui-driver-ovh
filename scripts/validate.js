const fs = require('fs');

const ui = JSON.parse(fs.readFileSync('rancher/ovh-ui-config.json', 'utf8'));
const schema = JSON.parse(fs.readFileSync('rancher/ovh-create-node-schema.json', 'utf8'));

const expected = ['region', 'flavor', 'image'];
for (const name of expected) {
  const field = ui.fields.find((f) => f.name === name);
  if (!field) throw new Error(`missing field in ui config: ${name}`);
  if (!field.required) throw new Error(`field must be required: ${name}`);
  if (!Array.isArray(field.fallbackOptions) || field.fallbackOptions.length < 1) {
    throw new Error(`fallbackOptions required for ${name}`);
  }
}

const valid = {
  projectId: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
  region: 'GRA',
  flavor: 'b2-7',
  image: 'ubuntu-22.04',
  sshKey: 'my-ssh-key',
  billingPeriod: 'hourly'
};

const invalid = {
  projectId: 'invalid',
  region: '',
  flavor: 'default',
  image: 'select-image',
  sshKey: '',
  billingPeriod: 'invalid'
};

function validateRequired(payload) {
  for (const key of schema.required || []) {
    if (!payload[key]) return false;
  }
  return true;
}

if (!validateRequired(valid)) throw new Error('valid payload failed required check');
if (validateRequired(invalid)) throw new Error('invalid payload passed required check');

console.log('validate: ui fields + required validation + fallback options verified');
