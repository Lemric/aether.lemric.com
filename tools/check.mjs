import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';
import { marketingCopy, marketingLanguages, marketingPages, renderMarketing } from './marketing.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const languages = ['bg','cs','da','de','el','en','es','et','fi','fr','ga','hr','hu','it','lt','lv','mt','nl','pl','pt','ro','sk','sl','sv'];
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const assets = ['styles.css', 'script.js', 'theme.js', 'marketing.css', 'marketing.js'];
const revision = createHash('sha256').update((await Promise.all(assets.map(file => readFile(`${root}${file}`, 'utf8')))).join('\n')).digest('hex').slice(0,12);
const base = JSON.parse(await readFile(`${root}locales/pl.json`, 'utf8'));
const shape = value => Array.isArray(value) ? value.map(shape) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key,shape(value[key])])) : typeof value;
assert.deepEqual(shape(marketingCopy.pl), shape(marketingCopy.en), 'PL/EN product content structure differs');
function assertComplete(value, path) {
  if (typeof value === 'string') assert.ok(value.trim(), `Empty content: ${path}`);
  else for (const [key, child] of Object.entries(value)) assertComplete(child, `${path}.${key}`);
}
for (const language of marketingLanguages) assertComplete(marketingCopy[language], language);
let pages = 0;
async function checkDocument(relativePath, language, alternates) {
  const path = resolve(root, relativePath);
  const html = await readFile(path, 'utf8');
  assert.ok(html.includes(`<html lang="${language}"`), `${relativePath}: wrong language`);
  assert.ok(!/\b(?:undefined|null)\b/.test(html), `${relativePath}: unresolved content`);
  assert.ok(!/<form\b/i.test(html), `${relativePath}: the website must stay static without forms`);
  assert.ok(html.includes('href="mailto:support@lemric.com"'), `${relativePath}: missing contact`);
  assert.equal([...html.matchAll(/<h1\b/g)].length,1,`${relativePath}: one main heading`);
  assert.equal([...html.matchAll(/<main\b/g)].length,1,`${relativePath}: one main landmark`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length,new Set(ids).size,`${relativePath}: duplicate IDs`);
  for (const [, refs] of html.matchAll(/\b(?:aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g)) {
    for (const ref of refs.split(' ')) assert.ok(ids.includes(ref),`${relativePath}: missing ARIA target ${ref}`);
  }
  for (const [, target] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (/^(?:https?:|mailto:)/.test(target)) continue;
    if (target.startsWith('#')) { assert.ok(ids.includes(target.slice(1)),`${relativePath}: missing anchor ${target}`); continue; }
    const [file,fragment] = target.split('#');
    const local = resolve(dirname(path),file.split('?')[0]);
    assert.ok(local.startsWith(root) && (await stat(local)).isFile(),`${relativePath}: missing local target ${target}`);
    if (fragment) assert.ok((await readFile(local,'utf8')).includes(`id="${fragment}"`),`${relativePath}: broken destination anchor ${target}`);
  }
  assert.deepEqual([...html.matchAll(/rel="alternate" hreflang="([^"]+)"/g)].map(x=>x[1]).sort(),[...alternates,'x-default'].sort(),`${relativePath}: inaccurate language alternates`);
  pages++;
  return html;
}
for (const language of languages) {
  const dictionary = JSON.parse(await readFile(`${root}locales/${language}.json`,'utf8'));
  assert.deepEqual(Object.keys(dictionary).sort(),Object.keys(base).sort(),`${language}: incomplete legacy dictionary`);
  for (const [key,value] of Object.entries(dictionary)) assert.ok(typeof value==='string' && value.trim(),`${language}.${key}: empty translation`);
  if (marketingLanguages.includes(language)) continue;
  const relativePath = `${language}/index.html`;
  const html = await checkDocument(relativePath,language,languages);
  for (const view of ['board','dashboard','components','releases','development','gantt','workflow','time']) {
    assert.ok(html.includes(`id="tab-${view}"`) && html.includes(`id="panel-${view}"`),`${relativePath}: lost retained view ${view}`);
  }
  for (const [key,value] of Object.entries(dictionary)) assert.ok(html.includes(escape(value)),`${relativePath}: stale retained translation ${key}`);
}
for (const language of marketingLanguages) {
  for (const page of marketingPages) {
    const filename = `${page==='home'?'index':page}.html`;
    const paths = [[`${language}/${filename}`,'../'],...(language==='pl'?[[filename,'']]:[])];
    for (const [relativePath,prefix] of paths) {
      const html = await checkDocument(relativePath,language,page==='home'?languages:marketingLanguages);
      assert.equal(html,renderMarketing(language,prefix,page,revision),`${relativePath}: generated output is stale`);
      assert.ok(html.includes('href="mailto:support@lemric.com?subject=Aether%20Lemric%20Server"'),`${relativePath}: missing conversion action`);
      assert.ok(!/id="(?:tab-gantt|tab-development)"/.test(html),`${relativePath}: speculative features in primary presentation`);
      if (page==='home') for (const [view] of marketingCopy[language].explorer.views) {
        assert.ok(html.includes(`id="view-${view}"`) && html.includes(`id="demo-${view}"`) && html.includes(`value="${view}"`),`${relativePath}: missing product view ${view}`);
      }
      if (page==='features') for (const feature of marketingCopy[language].features) assert.ok(html.includes(`id="${feature.id}"`) && html.includes(escape(feature.text)),`${relativePath}: incomplete feature ${feature.id}`);
    }
  }
}
const provenance = JSON.parse(await readFile(`${root}assets/vendor/provenance.json`,'utf8'));
for (const [name,source] of Object.entries(provenance.files)) {
  const bytes = await readFile(`${root}assets/vendor/${name}`);
  assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),source.sha,`Modified vendor DS source: ${name}`);
}
for (const file of ['theme.js','script.js','marketing.js']) new Script(await readFile(`${root}${file}`,'utf8'));
const css = await readFile(`${root}marketing.css`,'utf8');
for (const token of new Set([...css.matchAll(/var\((--m-[\w-]+)/g)].map(match=>match[1]))) assert.ok(css.includes(`${token}:`),`Undefined marketing token ${token}`);
console.log(`PASS: ${pages} pages, complete PL/EN product content, 22 retained translations, links, anchors, ARIA, contact without forms, DS integrity and JS syntax.`);
