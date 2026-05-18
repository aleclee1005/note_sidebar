document.getElementById('open-tab-link').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://notebooklm.google.com' });
});
