import { readFile } from 'node:fs/promises';

export const productLanguages = ['pl', 'en'];
export const productCopy = Object.fromEntries(await Promise.all(productLanguages.map(async language => [language, JSON.parse(await readFile(new URL(`../locales/product.${language}.json`, import.meta.url), 'utf8'))])));
const e = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
const heading = copy => `<div class="section-intro"><div><p class="section-kicker">${e(copy.kicker)}</p><h2 class="ds-heading">${e(copy.title)}</h2></div><p class="ds-text ds-text--secondary">${e(copy.description)}</p></div>`;
const items = values => values.map(([title, text], index) => `<article class="editorial-item"><span class="editorial-index" aria-hidden="true">0${index + 1}</span><div><h3 class="ds-heading">${e(title)}</h3><p class="ds-text ds-text--secondary">${e(text)}</p></div></article>`).join('');
export function productSections(language, pageHref, page = 'home') {
  const copy = productCopy[language];
  if (!copy) return { trust: '', boards: '', access: '', hosting: '', faq: '', cta: '' };
  const primaryHref = 'mailto:support@lemric.com?subject=Aether%20Lemric%20Server';
  const primaryLabel = copy.cta.contact;
  const secondaryHref = page === 'server' ? `${pageHref('home')}#preview` : pageHref('server');
  const secondaryLabel = page === 'server' ? copy.cta.preview : copy.cta.primary;
  return {
    trust: `<ul class="product-principles">${copy.trust.map(text => `<li><span aria-hidden="true">✓</span>${e(text)}</li>`).join('')}</ul>`,
    boards: `<section class="section-block editorial-section" aria-label="${e(copy.boards.title)}">${heading(copy.boards)}<div class="editorial-grid">${items(copy.boards.items)}</div></section>`,
    access: `<section id="permissions" class="section-block access-section" aria-label="${e(copy.access.title)}">${heading(copy.access)}<div class="access-layout"><div class="editorial-list">${items(copy.access.items)}</div><figure class="permission-example"><figcaption>${e(copy.access.example)}</figcaption><dl>${copy.access.roles.map(([role, action]) => `<div><dt>${e(role)}</dt><dd>${e(action)}</dd></div>`).join('')}</dl><p>${e(copy.access.note)}</p></figure></div></section>`,
    hosting: `<section id="deployment" class="section-block hosting-section" aria-label="${e(copy.hosting.title)}">${heading(copy.hosting)}<div class="hosting-layout"><div class="editorial-list">${items(copy.hosting.items)}<a class="ds-link" href="${pageHref('server')}">${e(copy.hosting.action)} <span aria-hidden="true">↗</span></a></div><figure class="infrastructure"><figcaption>${e(copy.hosting.caption)}</figcaption><div class="infrastructure-boundary"><span class="section-kicker">${e(copy.hosting.boundary)}</span>${copy.hosting.diagram.map((label, index) => `${index ? '<span class="infrastructure-arrow" aria-hidden="true">↓</span>' : ''}<div class="infrastructure-node"><span class="node-symbol" aria-hidden="true">${['◎','A','▤'][index]}</span><strong>${e(label)}</strong></div>`).join('')}</div></figure></div></section>`,
    faq: `<section class="section-block faq-section" aria-labelledby="faq-title"><h2 id="faq-title" class="ds-heading">${e(copy.faq.title)}</h2><div>${copy.faq.items.map(([question, answer]) => `<details class="faq-item"><summary>${e(question)}<span aria-hidden="true">+</span></summary><p class="ds-text ds-text--secondary">${e(answer)}</p></details>`).join('')}</div></section>`,
    cta: `<section class="section-block product-cta" aria-labelledby="cta-title"><p class="section-kicker">Aether LEMRIC</p><h2 id="cta-title" class="ds-heading">${e(copy.cta.title)}</h2><p class="ds-text ds-text--secondary reading-width">${e(copy.cta.description)}</p><div class="cta-actions"><a class="ds-button ds-button--primary ds-button--lg" href="${primaryHref}">${e(primaryLabel)} <span aria-hidden="true">↗</span></a><a class="ds-link" href="${secondaryHref}">${e(secondaryLabel)}</a></div></section>`
  };
}
export function productPage(language, page, pageHref) {
  const copy = productCopy[language];
  const content = copy[page];
  const main = `<section class="page-hero"><a class="ds-link back-link" href="${pageHref('home')}">← ${e(copy.nav.back)}</a><p class="section-kicker">${e(content.kicker)}</p><h1 class="ds-heading">${e(content.heading)}</h1><p class="page-lead ds-text ds-text--secondary">${e(content.lead)}</p></section><div class="page-story"><aside><p class="page-statement">${e(content.statement)}</p><span class="brand-owner">Aether Lemric</span></aside><div class="page-chapters">${content.sections.map(([title,text], index) => `<section><p class="section-kicker" aria-hidden="true">0${index+1}</p><h2 class="ds-heading">${e(title)}</h2><p class="ds-text ds-text--secondary">${e(text)}</p></section>`).join('')}</div></div>`;
  const fit = page === 'why' ? `<section class="section-block fit-section"><h2 class="ds-heading">${e(content.fitTitle)}</h2><ul>${content.fit.map(text => `<li>${e(text)}</li>`).join('')}</ul><p class="ds-text ds-text--secondary reading-width">${e(content.note)}</p></section>` : '';
  const related = page === 'about' ? `<div class="page-related"><a class="ds-link" href="https://github.com/Lemric">${e(content.related)} ↗</a><a class="ds-link" href="${pageHref('why')}">${e(content.next)} →</a></div>` : '';
  const note = page === 'server' ? `<p class="release-note ds-text ds-text--secondary">${e(content.note)}</p>` : '';
  return main + fit + related + note + productSections(language, pageHref, page).cta;
}
