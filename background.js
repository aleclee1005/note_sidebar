chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

function toggleInTab(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const root = document.getElementById('aisidebar-root');
      const tab  = document.getElementById('aisidebar-tab');
      if (!root) return;
      const hidden = root.style.display === 'none';
      root.style.display = hidden ? 'flex' : 'none';
      if (tab) tab.style.display = hidden ? 'none' : 'flex';
      if (!hidden && root._mode === 'split') {
        document.documentElement.style.marginRight = '';
      } else if (hidden && root._mode === 'split') {
        document.documentElement.style.marginRight = root.offsetWidth + 'px';
      }
    }
  });
}

// Auto-open NotebookLM side panel for every new tab
chrome.tabs.onCreated.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
});

// Message from popup.js
chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action === 'toggle') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url?.startsWith('http')) toggleInTab(tab.id);
  }
  if (msg.action === 'openNotebook') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
  }
  if (msg.action === 'setMode') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url?.startsWith('http')) return;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (mode) => {
        const root = document.getElementById('aisidebar-root');
        if (root?.__setMode) root.__setMode(mode);
      },
      args: [msg.mode]
    });
  }
});
