import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../src/dual-path.html', import.meta.url), 'utf8');

const requiredMarkers = [
  'Hosted OVH MKS',
  'OVH Nodes + RKE2/K3s',
  'Fallback static options',
  'Validation passed for path'
];

const missing = requiredMarkers.filter((m) => !html.includes(m));
if (missing.length > 0) {
  console.error('Lint failed. Missing markers:', missing.join(', '));
  process.exit(1);
}

console.log('lint ok: dual-path markers present');
