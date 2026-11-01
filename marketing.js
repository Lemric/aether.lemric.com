(() => {
  const root = document.documentElement;
  const themeControl = document.querySelector('[data-theme-control]');
  const choices = [...themeControl.querySelectorAll('[data-theme-choice]')];
  function reflectTheme() {
    choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice.dataset.themeChoice === root.dataset.theme)));
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.body).backgroundColor;
  }
  choices.forEach(choice => choice.addEventListener('click', () => {
    root.dataset.theme = choice.dataset.themeChoice;
    try { localStorage.setItem('aether-theme', root.dataset.theme); } catch { /* Preference is optional. */ }
    reflectTheme();
  }));
  reflectTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', reflectTheme);
  themeControl.hidden = false;
  const language = document.querySelector('#language');
  language.addEventListener('change', () => window.location.assign(language.value));
  document.querySelector('[data-language-control]').hidden = false;
  const menu = document.querySelector('.m-mobile-menu');
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
  });
  document.querySelector('[data-year]').textContent = String(new Date().getFullYear());
  const tabs = [...document.querySelectorAll('[data-product-tabs] [role="tab"]')];
  if (tabs.length) {
    const select = document.querySelector('#product-view');
    const tablist = document.querySelector('[data-product-tabs] [role="tablist"]');
    const mobileControl = document.querySelector('.m-preview-select');
    const mobile = matchMedia('(max-width: 720px)');
    const activate = (selected, focus = false) => {
      tabs.forEach(tab => {
        const active = selected === tab;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      });
      select.value = selected.id.slice(5);
      if (focus) selected.focus();
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab));
      tab.addEventListener('keydown', event => {
        const target = { ArrowRight: (index+1)%tabs.length, ArrowLeft: (index-1+tabs.length)%tabs.length, Home: 0, End: tabs.length-1 }[event.key];
        if (target !== undefined) { event.preventDefault(); activate(tabs[target], true); }
      });
    });
    select.addEventListener('change', () => {
      const tab = tabs.find(item => item.id === `view-${select.value}`);
      if (tab) activate(tab);
    });
    const reflectControls = () => { mobileControl.hidden = !mobile.matches; tablist.hidden = mobile.matches; };
    mobile.addEventListener('change', reflectControls);
    reflectControls();
    activate(tabs[0]);
  }
  root.classList.add('marketing-ready');
})();
