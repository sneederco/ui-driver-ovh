import { mkdirSync, copyFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = new URL('../src/dual-path.html', import.meta.url);
const dest = new URL('../dist/dual-path.html', import.meta.url);
mkdirSync(dirname(fileURLToPath(dest)), { recursive: true });
copyFileSync(src, dest);
console.log('build ok: wrote dist/dual-path.html');
