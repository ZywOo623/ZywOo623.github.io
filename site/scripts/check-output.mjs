import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative as pathRelative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory()
    ? filesIn(join(directory, entry.name))
    : Promise.resolve([join(directory, entry.name)])));
  return nested.flat();
}

const files = await filesIn(dist);
const pages = files.filter(file => file.endsWith('.html'));
const errors = [];
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  for (const [, raw] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (!raw.startsWith('/')) continue;
    const relative = decodeURI(raw.split(/[?#]/, 1)[0]);
    const target = resolve(dist, `.${relative.endsWith('/') ? `${relative}index.html` : relative}`);
    if (pathRelative(dist, target).startsWith('..')) errors.push(`${file}: escaped root ${raw}`);
    else if (!(await stat(target).catch(() => null))?.isFile()) errors.push(`${file}: missing ${raw}`);
  }
}

const index = await readFile(join(dist, 'index.html'), 'utf8');
const archive = await readFile(join(dist, 'blog/index.html'), 'utf8');
const first = await readFile(join(dist, 'blog/0x01-bit-operation/index.html'), 'utf8');
const second = await readFile(join(dist, 'blog/0x02-recursion/index.html'), 'utf8');
if (!index.includes('55')) errors.push('Codeforces snapshot is not displayed');
if (!index.includes('/blog/0x01-bit-operation/')) errors.push('Learning to Blog link is missing');
if (archive.indexOf('0x01-bit-operation') >= archive.indexOf('0x02-recursion')) errors.push('Guide series is not ordered 0x01 then 0x02');
if (!first.includes('class="katex') || !first.includes('<pre') || !first.includes('data-language="cpp"')) errors.push('0x01 article lost math or C++ formatting');
if (!second.includes('CF550B') || !second.includes('data-language="cpp"')) errors.push('0x02 article content or C++ formatting is missing');
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${pages.length} HTML pages: internal links, article order, Markdown, math, code and Learning links are valid.`);
