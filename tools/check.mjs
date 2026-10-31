import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const languages = ['bg','cs','da','de','el','en','es','et','fi','fr','ga','hr','hu','it','lt','lv','mt','nl','pl','pt','ro','sk','sl','sv'];
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const base = JSON.parse(await readFile(`${root}locales/pl.json`, 'utf8'));
let pages = 0;
for (const language of languages) {
  const dictionary = JSON.parse(await readFile(`${root}locales/${language}.json`, 'utf8'));
  assert.deepEqual(Object.keys(dictionary).sort(), Object.keys(base).sort(), `${language}: missing translation keys`);
  for (const relativePath of [`${language}/index.html`, ...(language === 'pl' ? ['index.html'] : [])]) {
    const path = resolve(root, relativePath);
    const html = await readFile(path, 'utf8');
    assert.ok(html.includes(`<html lang="${language}"`), `${relativePath}: language attribute`);
    assert.ok(!/\b(?:undefined|null)\b/.test(html), `${relativePath}: unresolved content`);
    for (const view of ['board','dashboard','components','releases','development','gantt','workflow','time']) {
      assert.ok(html.includes(`id="tab-${view}"`), `${relativePath}: missing product navigation ${view}`);
      assert.ok(html.includes(`id="panel-${view}"`), `${relativePath}: missing product view ${view}`);
      assert.ok(html.includes(`value="${view}"`), `${relativePath}: missing mobile product view ${view}`);
    }
    for (const [key, value] of Object.entries(dictionary)) {
      assert.ok(typeof value === 'string' && value.trim(), `${language}.${key}: empty translation`);
      assert.ok(html.includes(escape(value)), `${relativePath}: missing or stale ${key}`);
      if (!['pl','en'].includes(language) && value.length > 100) assert.notEqual(value, base[key], `${language}.${key}: untranslated paragraph`);
    }
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${relativePath}: duplicate IDs`);
    for (const [, refs] of html.matchAll(/\b(?:aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g)) {
      for (const ref of refs.split(' ')) assert.ok(ids.includes(ref), `${relativePath}: missing ARIA target ${ref}`);
    }
    for (const [, target] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      if (/^https?:/.test(target)) continue;
      if (target.startsWith('#')) { assert.ok(ids.includes(target.slice(1)), `${relativePath}: broken anchor ${target}`); continue; }
      const local = resolve(dirname(path), target);
      assert.ok(local.startsWith(root), `${relativePath}: link outside site`);
      assert.ok((await stat(local)).isFile(), `${relativePath}: missing asset or page ${target}`);
    }
    for (const code of languages) assert.ok(html.includes(`hreflang="${code}"`), `${relativePath}: missing language alternate ${code}`);
    pages++;
  }
}
const provenance = JSON.parse(await readFile(`${root}assets/vendor/provenance.json`, 'utf8'));
for (const [name, source] of Object.entries(provenance.files)) {
  const bytes = await readFile(`${root}assets/vendor/${name}`);
  const hash = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  assert.equal(hash, source.sha, `DesignSystem file has changed: ${name}`);
}
for (const file of ['theme.js', 'script.js']) new Script(await readFile(`${root}${file}`, 'utf8'));
const css = await readFile(`${root}styles.css`, 'utf8');
assert.ok(!/(?:font-size|padding(?:-[\w-]+)?|margin(?:-[\w-]+)?|gap|border-radius|letter-spacing)\s*:\s*[^;{}]*\b\d+(?:\.\d+)?(?:px|rem|em|ch)\b/.test(css), 'Page uses sizes outside DS tokens');
console.log(`PASS: ${pages} static pages, ${languages.length} complete dictionaries, local assets and links, ARIA references, DS source hashes, JS syntax and DS sizing tokens.`);
