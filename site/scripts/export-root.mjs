import { cp, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../dist');
const destination = resolve(here, '../..');
const items = await readdir(source);
if (!(await stat(join(source, 'index.html'))).isFile()) {
  throw new Error('Build the site before exporting it to the repository root.');
}
for (const item of items) {
  await cp(join(source, item), join(destination, item), { recursive: true, force: true });
}
console.log(`Published ${items.length} top-level build entries into ${destination}`);
