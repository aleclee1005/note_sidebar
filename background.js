chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});


chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === 'openNotebookTab') {
    chrome.tabs.create({ url: 'https://notebooklm.google.com' });
  }
  if (msg.action === 'openNotebook') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.windowId) chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
  }
});
