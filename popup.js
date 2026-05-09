// Load saved mode and highlight active button
chrome.storage.local.get(['aisidebar'], (s) => {
  const mode = s.aisidebar?.mode || 'float';
  document.getElementById(mode === 'float' ? 'floatBtn' : 'splitBtn').classList.add('active');
});

// Mode buttons
document.getElementById('floatBtn').addEventListener('click', () => setMode('float'));
document.getElementById('splitBtn').addEventListener('click', () => setMode('split'));

function setMode(mode) {
  document.getElementById('floatBtn').classList.toggle('active', mode === 'float');
  document.getElementById('splitBtn').classList.toggle('active', mode === 'split');
  chrome.runtime.sendMessage({ action: 'setMode', mode });
  window.close();
}
