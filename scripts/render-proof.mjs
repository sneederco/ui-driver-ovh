import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../dist/dual-path.html', import.meta.url), 'utf8');

const checks = {
  hasMksPath: html.includes('Hosted OVH MKS'),
  hasNodePath: html.includes('OVH Nodes + RKE2/K3s'),
  hasFallback: html.includes('Fallback static options'),
  hasValidationText: html.includes('Validation failed') && html.includes('Validation passed for path')
};

const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
if (failed.length) {
  console.error('render proof failed:', failed.join(', '));
  process.exit(1);
}

console.log('render proof ok:', JSON.stringify(checks));
