(function () {
  if (document.getElementById('nb-fab-host')) return;

  const host = document.createElement('div');
  host.id = 'nb-fab-host';
  host.style.cssText = 'all:initial;position:fixed;right:0;top:120px;z-index:2147483647';

  const shadow = host.attachShadow({ mode: 'open' });

  const btn = document.createElement('button');
  btn.id = 'nb-fab-btn';

  function updateBtnText() {
    const url = window.location.href;
    const short = url.replace(/^https?:\/\//, '').slice(0, 20);
    btn.textContent = '➕ ' + short;
  }
  updateBtnText();

  btn.style.cssText = [
    'all:initial',
    'display:block',
    'background:#34a853',
    'color:#fff',
    'border:none',
    'border-radius:8px 0 0 8px',
    'padding:8px 10px',
    'font-size:11px',
    'font-weight:700',
    'cursor:pointer',
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
    'box-shadow:-2px 2px 8px rgba(0,0,0,.25)',
    'white-space:nowrap',
    'writing-mode:horizontal-tb',
    'max-width:160px',
    'overflow:hidden',
    'text-overflow:ellipsis',
    'line-height:1.4',
  ].join(';');

  const toast = document.createElement('div');
  toast.style.cssText = [
    'all:initial',
    'display:none',
    'position:fixed',
    'right:12px',
    'top:170px',
    'z-index:2147483647',
    'background:rgba(0,0,0,.82)',
    'color:#fff',
    'border-radius:10px',
    'padding:9px 14px',
    'font-size:12px',
    'font-family:-apple-system,BlinkMacSystemFont,sans-serif',
    'line-height:1.5',
    'max-width:220px',
    'box-shadow:0 2px 10px rgba(0,0,0,.2)',
  ].join(';');
  toast.innerHTML = '✓ 链接已复制！<br>在 NotebookLM 点 <b style="font-weight:700">Add source → Website</b> 粘贴';

  btn.addEventListener('mouseenter', () => btn.style.background = '#2d9147');
  btn.addEventListener('mouseleave', () => btn.style.background = '#34a853');

  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => {});
    chrome.runtime.sendMessage({ action: 'openNotebook' });
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3500);
  });

  shadow.appendChild(btn);
  document.documentElement.appendChild(host);
  document.documentElement.appendChild(toast);

  // Update URL text on navigation (SPAs)
  const _pushState = history.pushState.bind(history);
  history.pushState = function (...args) {
    _pushState(...args);
    updateBtnText();
  };
  window.addEventListener('popstate', updateBtnText);
})();
