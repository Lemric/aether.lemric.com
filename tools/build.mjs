import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { languages, renderLegacy } from './legacy.mjs';
import { marketingLanguages, marketingPages, renderMarketing } from './marketing.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const assets = ['styles.css', 'script.js', 'theme.js', 'marketing.css', 'marketing.js'];
const revision = createHash('sha256').update((await Promise.all(assets.map(file => readFile(`${root}${file}`, 'utf8')))).join('\n')).digest('hex').slice(0, 12);
const filename = page => `${page === 'home' ? 'index' : page}.html`;
for (const language of languages) {
  await mkdir(`${root}${language}`, { recursive: true });
  const html = marketingLanguages.includes(language) ? renderMarketing(language, '../', 'home', revision) : renderLegacy(language, '../');
  await writeFile(`${root}${language}/index.html`, html);
}
for (const language of marketingLanguages) {
  for (const page of marketingPages.filter(page => page !== 'home')) await writeFile(`${root}${language}/${filename(page)}`, renderMarketing(language, '../', page, revision));
}
for (const page of marketingPages) await writeFile(`${root}${filename(page)}`, renderMarketing('pl', '', page, revision));
console.log(`Generated ${languages.length} language home pages, full PL/EN product pages and Polish root entries.`);
