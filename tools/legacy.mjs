// Retained translations pending the new editorial pass. Primary PL/EN pages use marketing.mjs.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { productCopy, productLanguages, productSections, productPage } from './product.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const revision = createHash('sha256').update((await Promise.all(['styles.css', 'script.js', 'theme.js', 'marketing.css', 'marketing.js'].map(file => readFile(`${root}${file}`, 'utf8')))).join('\n')).digest('hex').slice(0, 12);
import { languages } from './languages.mjs';
export { languages } from './languages.mjs';
const dictionaries = {};
for (const language of languages) dictionaries[language] = JSON.parse(await readFile(`${root}locales/${language}.json`, 'utf8'));
const keys = Object.keys(dictionaries.pl).sort();
for (const [language, dictionary] of Object.entries(dictionaries)) {
  if (JSON.stringify(Object.keys(dictionary).sort()) !== JSON.stringify(keys) || Object.values(dictionary).some(value => typeof value !== 'string' || !value.trim())) throw new Error(`Incomplete translation: ${language}`);
}
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const icon = name => `<svg aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`;

export function renderLegacy(language, prefix, page = 'home') {
  const productLanguage = productLanguages.includes(language) ? language : 'en';
  const copy = productCopy[productLanguage];
  const enhanced = productLanguages.includes(language);
  const pageHref = target => `${prefix}${target === 'home' ? language : productLanguage}/${target === 'home' ? 'index' : target}.html`;
  const sections = productSections(language, pageHref);
  const pageLanguages = page === 'home' ? languages : productLanguages;
  const nav = [['home', dictionaries[language].featuresNav, '#features'], ['why', copy.nav.why], ['server', dictionaries[language].hostingNav], ['about', copy.nav.about]].map(([target, label, anchor]) => `<a class="ds-button ds-button--ghost" href="${anchor ? (page === 'home' ? anchor : pageHref('home') + anchor) : pageHref(target)}"${target === page && page !== 'home' ? ' aria-current="page"' : ''}${!enhanced && !anchor ? ` hreflang="en"${target !== 'server' ? ' lang="en"' : ''}` : ''}>${escape(label)}${!enhanced && !anchor ? ' (EN)' : ''}</a>`).join('');
  const t = key => {
    if (!(key in dictionaries[language])) throw new Error(`Unknown translation key: ${key}`);
    return escape(dictionaries[language][key]);
  };
  const href = code => `${prefix}${code}/${page === 'home' ? 'index' : page}.html`;
  const meta = key => page === 'home' ? t(key) : escape(copy[page][key]);
  const hours = value => escape(new Intl.NumberFormat(language, { style: 'unit', unit: 'hour', unitDisplay: 'short', maximumFractionDigits: 2 }).format(value));
  const issue = (id, title, person, tone) => `<li class="ds-kanban-card ds-stack ds-stack--column ds-gap-3"><span class="issue-key">${id}</span><h5 class="ds-heading">${t(title)}</h5><div class="issue-meta"><span class="ds-badge ds-tone--${tone}">${t(tone === 'success' ? 'done' : tone === 'info' ? 'inProgress' : 'todo')}</span><span class="ds-avatar ds-avatar--sm" role="img" aria-label="${t('assigned')}: ${person}">${person}</span></div></li>`;
  const card = (symbol, key, detail = false) => `<article class="ds-card ds-stack ds-stack--column ds-gap-4"><span class="feature-icon">${icon(symbol)}</span><h3 class="ds-heading">${t(`${key}Title`)}</h3><p class="ds-text ds-text--secondary">${t(`${key}Description`)}</p>${detail ? `<p class="feature-detail ds-text ds-text--secondary">${t(`${key}Detail`)}</p>` : ''}</article>`;
  const views = [
    ['board', 'boardsTitle', 'boardsDescription', 'board'],
    ['dashboard', 'dashboardTitle', 'dashboardDescription', 'dashboard'],
    ['components', 'componentsTitle', 'componentsDescription', 'components'],
    ['releases', 'releasesTitle', 'releasesDescription', 'release'],
    ['development', 'developmentTitle', 'developmentDescription', 'code'],
    ['gantt', 'ganttTitle', 'ganttDescription', 'gantt'],
    ['workflow', 'workflowTab', 'flowDescription', 'flow'],
    ['time', 'timeTab', 'timeDescription', 'clock'],
  ];
  const tasks = [['JAL-12','issue1','todo','neutral'], ['JAL-14','issue2','todo','neutral'], ['JAL-08','issue3','inProgress','info'], ['JAL-05','issue4','done','success']];
  const stats = () => `<div class="summary-grid">${[['todo',2],['inProgress',1],['done',1]].map(([key,count]) => `<div class="ds-stat-card"><span class="ds-stat-label">${t(key)}</span><strong>${count}</strong></div>`).join('')}</div>`;
  const taskTable = caption => `<div class="ds-table-scroll" role="region" aria-label="${t(caption)}" tabindex="0"><table class="ds-table"><caption class="ds-sr-only">${t(caption)}</caption><thead><tr><th scope="col">${t('issueColumn')}</th><th scope="col">${t('statusLabel')}</th></tr></thead><tbody>${tasks.map(([id,key,status,tone]) => `<tr><td><span class="issue-key">${id}</span><span class="table-task">${t(key)}</span></td><td><span class="ds-badge ds-tone--${tone}">${t(status)}</span></td></tr>`).join('')}</tbody></table></div>`;
  const board = `<div class="ds-kanban-columns">${[['todo','neutral',tasks.slice(0,2)],['inProgress','info',[tasks[2]]],['done','success',[tasks[3]]]].map(([status,tone,items]) => `<section class="ds-kanban-column"><h4 class="ds-heading">${t(status)}<span class="ds-badge ds-tone--${tone}">${items.length}</span></h4><ul>${items.map(([id,key],index) => issue(id,key,['AK','JP','MK'][status==='inProgress'?2:index],tone)).join('')}</ul></section>`).join('')}</div>`;
  const components = `<div class="ds-table-scroll" role="region" aria-label="${t('componentsTitle')}" tabindex="0"><table class="ds-table"><thead><tr><th scope="col">${t('componentsTitle')}</th><th scope="col">${t('issueColumn')}</th><th scope="col">${t('assigned')}</th></tr></thead><tbody>${[['workflowTab','JAL-08','issue3','MK'],['boardTab','JAL-12','issue1','AK'],['timeTab','JAL-14','issue2','JP']].map(([component,id,key,person]) => `<tr><td>${t(component)}</td><td><span class="issue-key">${id}</span><span class="table-task">${t(key)}</span></td><td>${person}</td></tr>`).join('')}</tbody></table></div>`;
  const development = `<div class="ds-stack ds-stack--column ds-gap-4">${[['branchLabel','feature/jal-08-workflow'],['commitLabel','7c81e2a · JAL-08'],['reviewLabel','JAL-08 · #24']].map(([key,value]) => `<div class="development-row"><span class="ds-text ds-text--secondary">${t(key)}</span><code>${value}</code></div>`).join('')}</div>`;
  const gantt = `<div class="ds-table-scroll" role="region" aria-label="${t('ganttTitle')}" tabindex="0"><table class="ds-table gantt-table"><caption class="ds-sr-only">${t('ganttTitle')}</caption><thead><tr><th scope="col">${t('issueColumn')}</th>${[1,2,3,4].map(week => `<th scope="col">${t('weekLabel')} ${week}</th>`).join('')}</tr></thead><tbody>${tasks.map(([id,key],index) => `<tr><td><span class="issue-key">${id}</span><span class="table-task">${t(key)}</span></td>${index?`<td colspan="${index}" aria-label="—"></td>`:''}<td colspan="${Math.min(2,4-index)}"><span class="timeline-bar">${id}</span></td>${index<2?`<td colspan="${2-index}" aria-label="—"></td>`:''}</tr>`).join('')}</tbody></table></div>`;
  const workflow = `<ol class="ds-stepper"><li data-complete="true"><span>1</span><strong>${t('todo')}</strong></li><li aria-current="step"><span>2</span><strong>${t('inProgress')}</strong></li><li><span>3</span><strong>${t('done')}</strong></li></ol><div class="ds-alert ds-tone--info"><div><strong>${t('flowRuleTitle')}</strong><p class="ds-alert-content">${t('flowRuleText')}</p></div></div>`;
  const time = `<div class="ds-table-scroll" role="region" aria-label="${t('timeCaption')}" tabindex="0"><table class="ds-table"><caption class="ds-sr-only">${t('timeCaption')}</caption><thead><tr><th scope="col">${t('issueColumn')}</th><th scope="col">${t('durationColumn')}</th></tr></thead><tbody>${[['JAL-08','issue3',1.5],['JAL-05','issue4',.75],['JAL-12','issue1',1]].map(([id,key,duration]) => `<tr><td><span class="issue-key">${id}</span><span class="table-task">${t(key)}</span></td><td class="duration">${hours(duration)}</td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">${t('total')}</th><td class="duration">${hours(3.25)}</td></tr></tfoot></table></div>`;
  const panels = { board, dashboard: stats()+taskTable('dashboardTitle'), components, releases: `<div class="release-summary"><span class="ds-badge ds-tone--info">0.1</span><span>${t('projectName')}</span></div>`+taskTable('releasesTitle'), development, gantt, workflow, time };
  const preview = `<section id="preview" class="section-block ds-stack ds-stack--column ds-gap-6" aria-labelledby="preview-title"><div class="section-intro"><div><p class="section-kicker">Aether / JAL</p><h2 class="ds-heading" id="preview-title">${t('previewTitle')}</h2></div><p class="ds-text ds-text--secondary" id="preview-description">${t('previewDescription')}</p></div><div class="workspace-preview" aria-describedby="preview-description"><div class="workspace-topbar"><span class="workspace-mark">J</span><strong>${t('projectName')}</strong><span class="ds-badge ds-tone--neutral">JAL</span></div><div class="preview-mobile-select ds-field" hidden><label class="ds-label" for="preview-view">${t('previewNav')}</label><select class="ds-input ds-native-select" id="preview-view">${views.map(([view,label]) => `<option value="${view}">${t(label)}</option>`).join('')}</select></div><div class="ds-tabs workspace-tabs" data-ds-tabs><div class="ds-tab-list" role="tablist" aria-orientation="vertical" aria-label="${t('previewNav')}">${views.map(([view,label,,symbol],index) => `<button type="button" role="tab" id="tab-${view}" aria-controls="panel-${view}" aria-selected="${index===0}" tabindex="${index===0?0:-1}">${icon(symbol)}<span>${t(label)}</span></button>`).join('')}</div>${views.map(([view,label,description]) => `<div class="ds-tab-panel workspace-panel" id="panel-${view}" role="tabpanel" aria-labelledby="tab-${view}" tabindex="0"><div class="ds-stack ds-stack--column ds-gap-5"><div class="ds-stack ds-stack--column ds-gap-3"><h3 class="ds-heading">${t(label)}</h3><p class="ds-text ds-text--secondary">${t(description)}</p></div>${panels[view]}</div></div>`).join('')}</div></div></section>`;
  return `<!doctype html>
<html lang="${language}" data-brand="lemric" data-theme="auto">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="${meta('description')}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${meta('title')}">
  <meta property="og:description" content="${meta('description')}">
  <meta property="og:locale" content="${({en:'en_GB',el:'el_GR',ga:'ga_IE',sv:'sv_SE',da:'da_DK',et:'et_EE',cs:'cs_CZ'})[language] ?? `${language}_${language.toUpperCase()}`}">
  <meta name="theme-color" content="#f7f6f3">
  <title>${meta('title')}</title>
  <link rel="canonical" href="${href(language)}">
  ${pageLanguages.map(code => `<link rel="alternate" hreflang="${code}" href="${href(code)}">`).join('\n  ')}
  <link rel="alternate" hreflang="x-default" href="${page === 'home' ? prefix + 'index.html' : prefix + 'en/' + page + '.html'}">
  <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="${prefix}assets/vendor/index.css">
  <link rel="stylesheet" href="${prefix}styles.css?v=${revision}">
  <script src="${prefix}theme.js?v=${revision}"></script>
  <script src="${prefix}script.js?v=${revision}" defer></script>
</head>
<body>
  <a class="skip-link ds-button ds-button--primary" href="#main">${t('skip')}</a>
  <svg class="icon-library" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <symbol id="i-mark" viewBox="0 0 32 32"><path d="M11 7h13v13a8 8 0 0 1-16 0"/></symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></symbol>
    <symbol id="i-board" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16m6-16v16"/></symbol>
    <symbol id="i-flow" viewBox="0 0 24 24"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h5a4 4 0 0 1 4 4v5M3 18h8m-3-3 3 3-3 3"/></symbol>
    <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
    <symbol id="i-server" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M15 6.5h3M15 17.5h3"/></symbol>
    <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M6 19a5 5 0 1 1 .8-9.9 6 6 0 0 1 11.6 0A5 5 0 0 1 18 19Z"/></symbol>
    <symbol id="i-components" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></symbol>
    <symbol id="i-dashboard" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="10" rx="1"/><rect x="14" y="3" width="7" height="6" rx="1"/><rect x="3" y="17" width="7" height="4" rx="1"/><rect x="14" y="13" width="7" height="8" rx="1"/></symbol>
    <symbol id="i-release" viewBox="0 0 24 24"><path d="M20 13 11 22 2 13V3h10l8 8a1.4 1.4 0 0 1 0 2Z"/><circle cx="7" cy="8" r="1.5"/></symbol>
    <symbol id="i-code" viewBox="0 0 24 24"><path d="m8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18"/></symbol>
    <symbol id="i-gantt" viewBox="0 0 24 24"><path d="M3 3v18h18M7 6h7M10 11h9M15 16h6"/></symbol>
    <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></symbol>
  </svg>
  <header class="site-header">
    <div class="ds-container header-top">
      <a class="brand" href="${pageHref('home')}" aria-label="${t('home')}"><span class="brand-mark">${icon('mark')}</span><span>Aether <span class="brand-owner">Lemric</span></span></a>
      <nav class="site-nav ds-stack ds-stack--row ds-gap-2" aria-label="${t('navigation')}">${nav}</nav>
      <div class="header-preferences">
        <div class="ds-field" data-language-control hidden><label class="ds-sr-only" for="language">${t('language')}</label><select class="ds-input ds-native-select ds-native-select--locale" id="language">${pageLanguages.map(code => `<option value="${href(code)}" lang="${code}"${code===language?' selected':''}>${escape(dictionaries[code].name)}</option>`).join('')}</select></div>
        <details class="mobile-navigation"><summary class="ds-button ds-button--ghost ds-icon-button" aria-label="${t('navigation')}">${icon('menu')}</summary><nav class="mobile-nav-links" aria-label="${t('navigation')}">${nav}</nav></details>
      </div>
    </div>
  </header>
  <main id="main" class="ds-container" data-page="${page}">
    ${page !== 'home' ? productPage(language, page, pageHref) : `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy ds-stack ds-stack--column ds-gap-5"><div class="ds-stack ds-stack--row ds-gap-3"><span class="ds-badge ds-tone--info">${t('soon')}</span><span class="eyebrow">${t('eyebrow')}</span></div><h1 id="hero-title" class="ds-heading hero-title">${t('heroTitle')}</h1><p class="ds-text ds-text--secondary">${t('heroDescription')}</p><div class="ds-stack ds-stack--row ds-gap-3"><a class="ds-button ds-button--primary ds-button--lg" href="#preview">${t('primaryAction')}${icon('arrow')}</a><a class="ds-link hero-secondary" href="${enhanced ? pageHref('server') : '#preview'}">${t('secondaryAction')}</a></div><p class="stage-note ds-text ds-text--secondary">${t('stageNote')}</p></div>
      <figure class="product-window" aria-labelledby="hero-preview-caption"><div class="window-chrome"><span aria-hidden="true">● ● ●</span><span>Aether Lemric / JAL</span></div><div class="hero-workspace ds-stack ds-stack--column ds-gap-5"><div class="preview-heading"><strong>${t('projectName')}</strong><span class="ds-badge ds-tone--neutral">0.1</span></div>${stats()}<div class="hero-issue-list">${tasks.slice(0,3).map(([id,key,status,tone])=>`<div><span class="issue-key">${id}</span><span>${t(key)}</span><span class="issue-status ds-tone--${tone}" aria-label="${t(status)}"></span></div>`).join('')}</div></div><figcaption id="hero-preview-caption">${t('previewDescription')}</figcaption></figure>
    </section>
    ${sections.trust}
    <nav class="product-capabilities" aria-label="${t('featuresNav')}">${[views[0], views[6], views[7], views[2], views[3], views[1]].map(([view,label,,symbol])=>`<a href="#preview" data-preview-target="${view}">${icon(symbol)}<span>${t(label)}</span></a>`).join('')}</nav>
    <section id="features" class="section-block ds-stack ds-stack--column ds-gap-6" aria-labelledby="features-title">
      <h2 class="ds-heading" id="features-title">${t('featuresTitle')}</h2>
      <div class="ds-grid feature-stories">${[['board','issues'],['flow','workflow'],['clock','time']].map(([symbol,key],index)=>`<article class="ds-stack ds-stack--column ds-gap-4"><div class="feature-story-top"><span class="feature-icon">${icon(symbol)}</span><span class="issue-key">0${index+1}</span></div><h3 class="ds-heading">${t(`${key}Title`)}</h3><p class="ds-text ds-text--secondary">${t(`${key}Description`)}</p><p class="feature-detail ds-text ds-text--secondary">${t(`${key}Detail`)}</p></article>`).join('')}</div>
    </section>
    ${sections.boards}
    ${preview}
    ${sections.access}
    ${enhanced ? sections.hosting : `<section id="deployment" class="section-block ds-stack ds-stack--column ds-gap-6" aria-labelledby="hosting-title"><div class="ds-stack ds-stack--column ds-gap-4"><h2 class="ds-heading" id="hosting-title">${t('hostingTitle')}</h2><p class="ds-text ds-text--secondary reading-width">${t('hostingDescription')}</p></div><div class="ds-grid">${card('server','self')}${card('cloud','cloud')}</div></section>`}
    ${enhanced ? sections.faq + sections.cta : `<section class="section-block ds-stack ds-stack--column ds-gap-5" aria-labelledby="launch-title"><span class="launch-badge ds-badge ds-tone--info">${t('soon')}</span><h2 class="ds-heading" id="launch-title">${t('launchTitle')}</h2><p class="ds-text ds-text--secondary reading-width">${t('launchDescription')}</p><p class="ds-text ds-text--secondary reading-width">${t('launchTiming')}</p><div><a class="ds-button ds-button--secondary" href="https://github.com/Lemric">${t('githubAction')}${icon('arrow')}</a></div></section>`}
    `}
  </main>
  <footer class="site-footer"><div class="ds-container ds-stack ds-stack--column ds-gap-5"><div class="footer-preferences"><span class="brand">Aether <span class="brand-owner">Lemric</span></span><div class="ds-theme-switcher" role="group" aria-label="${t('theme')}" data-ds-theme-switcher hidden>${['light','dark','auto'].map(theme=>`<button type="button" data-theme-choice="${theme}" aria-pressed="${theme==='auto'}"><span>${t(theme)}</span></button>`).join('')}</div></div><nav class="footer-links" aria-label="${t('navigation')}">${nav}</nav><div class="footer-main"><p class="ds-text ds-text--secondary">© <span data-year>2026</span> Lemric. ${t('footerText')}</p><div class="footer-contact"><a class="ds-link" href="mailto:support@lemric.com">support@lemric.com</a><a class="ds-link" href="https://github.com/Lemric">${t('footerGithub')}</a></div></div><noscript><p class="ds-text ds-text--secondary">${t('languages')}</p><nav class="language-links" aria-label="${t('languages')}">${pageLanguages.map(code => `<a class="ds-link" href="${href(code)}" lang="${code}" hreflang="${code}"${code===language?' aria-current="page"':''}>${escape(dictionaries[code].name)}</a>`).join('')}</nav></noscript></div></footer>
</body>
</html>
`.replace(/^[ \t]+$/gm, '');
}
