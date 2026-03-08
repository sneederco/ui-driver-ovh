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

if (!Array.isArray(schema.allOf) || schema.allOf.length < 2) {
  throw new Error('schema must include conditional allOf blocks for hosted and node paths');
}

const hostedRequired =
  schema.allOf.find((entry) => entry?.if?.properties?.provisioningMode?.const === 'hosted-mks')?.then
    ?.required || [];
const nodeRequired =
  schema.allOf.find((entry) => entry?.if?.properties?.provisioningMode?.const === 'node-rke2-k3s')?.then
    ?.required || [];

for (const key of hostedFields) {
  if (!hostedRequired.includes(key)) throw new Error(`hosted required field missing in schema: ${key}`);
}
for (const key of nodeFields) {
  if (!nodeRequired.includes(key)) throw new Error(`node required field missing in schema: ${key}`);
}

const validHosted = {
  provisioningMode: 'hosted-mks',
  mksClusterName: 'prod-mks-cluster',
  mksRegion: 'GRA',
  mksVersion: '1.30',
  mksNodepoolFlavor: 'b2-7',
  mksNodepoolDesiredNodes: 3
};

const invalidHosted = {
  provisioningMode: 'hosted-mks',
  mksClusterName: 'prod-mks-cluster',
  mksRegion: 'GRA'
};

const validNode = {
  provisioningMode: 'node-rke2-k3s',
  region: 'GRA',
  flavor: 'b2-7',
  image: 'ubuntu-22.04'
};

const invalidNode = {
  provisioningMode: 'node-rke2-k3s',
  region: 'GRA',
  flavor: 'default'
};

function includesAll(required, payload) {
  return required.every((key) => Object.prototype.hasOwnProperty.call(payload, key) && payload[key] !== '');
}

if (!includesAll(hostedRequired, validHosted)) throw new Error('valid hosted payload failed required check');
if (includesAll(hostedRequired, invalidHosted)) throw new Error('invalid hosted payload passed required check');
if (!includesAll(nodeRequired, validNode)) throw new Error('valid node payload failed required check');
if (includesAll(nodeRequired, invalidNode)) throw new Error('invalid node payload passed required check');

console.log('validate: dual-path UI fields + conditional required validation + fallback options verified');
