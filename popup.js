document.getElementById('geminiBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'toggle' });
  window.close();
});

document.getElementById('notebookBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.sidePanel.open({ windowId: tab.windowId });
  window.close();
});
