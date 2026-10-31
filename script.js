// HTML behaviour follows DesignSystem's vanilla theme and tabs contracts.
(() => {
  const root = document.documentElement;
  const themeGroup = document.querySelector('[data-ds-theme-switcher]');
  const themeChoices = [...themeGroup.querySelectorAll('[data-theme-choice]')];
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  function reflectTheme() {
    for (const choice of themeChoices) choice.setAttribute('aria-pressed', String(choice.dataset.themeChoice === root.dataset.theme));
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.body).backgroundColor;
  }
  for (const choice of themeChoices) {
    choice.addEventListener('click', () => {
      const theme = choice.dataset.themeChoice;
      if (!['light', 'dark', 'auto'].includes(theme)) return;
      root.dataset.theme = theme;
      try { localStorage.setItem('aether-theme', theme); } catch { /* Optional preference. */ }
      reflectTheme();
    });
  }
  reflectTheme();
  systemTheme.addEventListener('change', reflectTheme);
  themeGroup.hidden = false;
  const languageSelect = document.querySelector('#language');
  languageSelect.addEventListener('change', () => {
    const selected = languageSelect.selectedOptions[0];
    if (selected) window.location.assign(selected.value);
  });
  document.querySelector('[data-language-control]').hidden = false;
  const mobileNavigation = document.querySelector('.mobile-navigation');
  mobileNavigation.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => { mobileNavigation.open = false; });
  });
  mobileNavigation.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileNavigation.open) {
      mobileNavigation.open = false;
      mobileNavigation.querySelector('summary').focus();
    }
  });
  const tabs = [...document.querySelectorAll('[data-ds-tabs] [role="tab"]')];
  const viewSelect = document.querySelector('#preview-view');
  const tabList = document.querySelector('[role="tablist"]');
  const mobileView = window.matchMedia('(max-width: 650px)');
  const mobileControl = document.querySelector('.preview-mobile-select');
  function reflectNavigation() {
    mobileControl.hidden = !mobileView.matches;
    tabList.hidden = mobileView.matches;
  }
  function activate(selected, focus = false) {
    for (const tab of tabs) {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    }
    viewSelect.value = selected.id.slice(4);
    if (focus) selected.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      const previousKey = tabList.getAttribute('aria-orientation') === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = tabList.getAttribute('aria-orientation') === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      const next = { [previousKey]: (index - 1 + tabs.length) % tabs.length, [nextKey]: (index + 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      activate(tabs[next], true);
    });
  });
  viewSelect.addEventListener('change', () => {
    const tab = tabs.find(item => item.id === `tab-${viewSelect.value}`);
    if (tab) activate(tab);
  });
  document.querySelectorAll('[data-preview-target]').forEach(link => {
    link.addEventListener('click', () => {
      const tab = tabs.find(item => item.id === `tab-${link.dataset.previewTarget}`);
      if (tab) activate(tab);
    });
  });
  reflectNavigation();
  mobileView.addEventListener('change', reflectNavigation);
  activate(tabs[0]);
  root.classList.add('js-ready');
  document.querySelector('[data-year]').textContent = String(new Date().getFullYear());
})();
