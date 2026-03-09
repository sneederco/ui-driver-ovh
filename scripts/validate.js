const fs = require('fs');

const ui = JSON.parse(fs.readFileSync('rancher/ovh-ui-config.json', 'utf8'));
const schema = JSON.parse(fs.readFileSync('rancher/ovh-create-node-schema.json', 'utf8'));

const alwaysRequired = ['provisioningMode'];
for (const name of alwaysRequired) {
  const field = ui.fields.find((f) => f.name === name);
  if (!field) throw new Error(`missing field in ui config: ${name}`);
  if (!field.required) throw new Error(`field must be required: ${name}`);
}

const hostedFields = [
  'mksClusterName',
  'mksRegion',
  'mksVersion',
  'mksNodepoolFlavor',
  'mksNodepoolDesiredNodes'
];
const nodeFields = ['region', 'flavor', 'image'];

for (const name of [...hostedFields, ...nodeFields]) {
  const field = ui.fields.find((f) => f.name === name);
  if (!field) throw new Error(`missing field in ui config: ${name}`);
}

for (const name of ['mksRegion', 'mksVersion', 'mksNodepoolFlavor', 'region', 'flavor', 'image']) {
  const field = ui.fields.find((f) => f.name === name);
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

function includesAll(required, payload) {
  return required.every((key) => Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== '');
}

if (!includesAll(hostedRequired, validHosted)) throw new Error('valid hosted payload failed required check');
if (includesAll(hostedRequired, invalidHosted)) throw new Error('invalid hosted payload passed required check');
if (!includesAll(nodeRequired, validNode)) throw new Error('valid node payload failed required check');
if (includesAll(nodeRequired, invalidNode)) throw new Error('invalid node payload passed required check');

console.log('validate: dual-path UI fields + conditional required validation + fallback options verified');
