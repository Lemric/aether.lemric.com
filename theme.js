// Apply the saved DesignSystem theme before rendering the page.
(() => {
  try {
    const theme = localStorage.getItem('aether-theme');
    if (['auto', 'light', 'dark'].includes(theme)) {
      document.documentElement.dataset.theme = theme;
    }
  } catch {
    // The CSS system preference still works when storage is unavailable.
  }
})();
