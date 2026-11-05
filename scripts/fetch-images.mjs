// Downloads every photograph listed in src/data/images.json into assets/img/photos
// so the site can be self-hosted without relying on the Unsplash CDN.
// Usage: node scripts/fetch-images.mjs   then   node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'src/data/images.json');
const images = JSON.parse(readFileSync(file, 'utf8'));
const outDir = join(root, 'assets/img/photos');
mkdirSync(outDir, { recursive: true });
const widths = [800, 1600];

for (const [key, im] of Object.entries(images)) {
  if (key.startsWith('_') || !im.id) continue;
  for (const w of widths) {
    const url = `https://images.unsplash.com/${im.id}?auto=format&fit=crop&q=75&fm=jpg&w=${w}`;
    const res = await fetch(url);
    if (!res.ok) { console.error(`Failed ${key} (${w}px): HTTP ${res.status}`); continue; }
    writeFileSync(join(outDir, `${key}-${w}.jpg`), Buffer.from(await res.arrayBuffer()));
  }
  im.local = `assets/img/photos/${key}`;
  console.log('saved', key);
}
writeFileSync(file, JSON.stringify(images, null, 2) + '\n');
console.log('Done. Run `node build.mjs` to rebuild with local images.');
