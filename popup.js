// Load saved mode and highlight active button
chrome.storage.local.get(['currentMode'], (s) => {
  const mode = s.currentMode || 'float';
  document.getElementById(mode === 'float' ? 'floatBtn' : 'splitBtn').classList.add('active');
});

// Toggle sidebar
document.getElementById('toggleBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'toggle' });
  window.close();
});

// Mode buttons
document.getElementById('floatBtn').addEventListener('click', () => setMode('float'));
document.getElementById('splitBtn').addEventListener('click', () => setMode('split'));

function setMode(mode) {
  document.getElementById('floatBtn').classList.toggle('active', mode === 'float');
  document.getElementById('splitBtn').classList.toggle('active', mode === 'split');
  chrome.storage.local.set({ currentMode: mode });
  chrome.runtime.sendMessage({ action: 'setMode', mode });
  window.close();
}
