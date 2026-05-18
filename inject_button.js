(function () {
  if (document.getElementById('nb-fab-host')) return;

  const host = document.createElement('div');
  host.id = 'nb-fab-host';
  host.style.cssText = 'all:initial;position:fixed;right:0;top:calc(50% + 32px);z-index:2147483647';

  const shadow = host.attachShadow({ mode: 'open' });

  const btn = document.createElement('button');
  btn.id = 'nb-fab-btn';
  btn.title = 'Add to NotebookLM';
  btn.textContent = '+';
  btn.style.cssText = [
    'all:initial',
    'display:block',
    'background:#1a1a1a',
    'color:#fff',
    'border:none',
    'border-radius:8px 0 0 8px',
    'width:28px',
    'height:44px',
    'cursor:pointer',
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
    'font-size:20px',
    'font-weight:300',
    'text-align:center',
    'line-height:44px',
    'box-shadow:-2px 0 8px rgba(0,0,0,.4)',
  ].join(';');

  const toast = document.createElement('div');
  toast.style.cssText = [
    'all:initial',
    'display:none',
    'position:fixed',
    'right:36px',
    'top:calc(50% + 28px)',
    'z-index:2147483646',
    'background:rgba(0,0,0,.82)',
    'color:#fff',
    'border-radius:10px',
    'padding:9px 14px',
    'font-size:12px',
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
    'line-height:1.5',
    'max-width:220px',
    'box-shadow:0 2px 10px rgba(0,0,0,.2)',
    'white-space:nowrap',
    'pointer-events:none',
  ].join(';');
  toast.innerHTML = '✓ Link copied!<br>In NotebookLM, click <b style="font-weight:700">Add source → Website</b> and paste.';

  btn.addEventListener('mouseenter', () => { btn.style.background = '#333'; });
  btn.addEventListener('mouseleave', () => { btn.style.background = '#1a1a1a'; });

  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => {});
    chrome.runtime.sendMessage({ action: 'openNotebook' });
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3500);
  });

  shadow.appendChild(btn);
  document.documentElement.appendChild(host);
  document.documentElement.appendChild(toast);
})();
