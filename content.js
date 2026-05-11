(function () {
  if (document.getElementById('aisidebar-root')) return;

  const GEMINI_URL     = 'https://gemini.google.com';
  const NOTEBOOKLM_URL = 'https://notebooklm.google.com';
  const DEFAULT_W      = 420;

  // ── State ─────────────────────────────────────────────────────────────────
  let st = { mode: 'float', x: null, y: null, width: DEFAULT_W, collapsed: true, service: 'gemini' };
  function save() { chrome.storage.local.set({ aisidebar: st }); }

  // ── Root (shadow host) — only positioning lives here ──────────────────────
  const root = document.createElement('div');
  root.id = 'aisidebar-root';
  Object.assign(root.style, {
    position: 'fixed', zIndex: '2147483647',
    width: DEFAULT_W + 'px', overflow: 'hidden',
  });

  // Shadow DOM isolates inner elements from page CSS
  const shadow = root.attachShadow({ mode: 'open' });
  const resetStyle = document.createElement('style');
  resetStyle.textContent = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`;
  shadow.appendChild(resetStyle);

  // Inner container (flex column, fills host)
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'relative', display: 'flex', flexDirection: 'column',
    background: '#fff', overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    width: '100%', height: '100%',
  });
  shadow.appendChild(container);

  // ── Header ────────────────────────────────────────────────────────────────
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '7px 8px', background: '#f8f9fa',
    borderBottom: '1px solid #e8eaed',
    userSelect: 'none', flexShrink: '0', cursor: 'grab',
  });

  // Collapse toggle button (▾/▸ chevron)
  const collapseBtn = hdrBtn(
    `<svg width="10" height="10" viewBox="0 0 10 10"><path d="M3.5 2L6.5 5L3.5 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    '收起/展开'
  );
  collapseBtn.addEventListener('click', () => {
    st.collapsed = !st.collapsed;
    applyCollapsed();
    save();
  });

  // Service tab buttons
  const geminiTab   = makeTabBtn('Gemini');
  const notebookTab = makeTabBtn('NotebookLM');
  geminiTab.addEventListener('click',   () => setService('gemini'));
  notebookTab.addEventListener('click', () => setService('notebooklm'));

  // Spacer
  const spacer = document.createElement('div');
  spacer.style.flex = '1';

  // Reload button
  const reloadBtn = hdrBtn(
    `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2L14 3v4h-4l1.6-1.6A3.5 3.5 0 1 0 11.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    '刷新'
  );
  reloadBtn.addEventListener('click', () => {
    iframe.src = st.service === 'gemini' ? GEMINI_URL : NOTEBOOKLM_URL;
  });

  // Float button
  const floatBtn = hdrBtn(
    `<svg width="13" height="13" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="5" y="5" width="8" height="8" rx="1.5" fill="currentColor"/></svg>`,
    '浮窗模式'
  );
  floatBtn.addEventListener('click', () => setMode('float'));

  // Split button
  const splitBtn = hdrBtn(
    `<svg width="13" height="13" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" stroke-width="1.5"/></svg>`,
    '分屏模式'
  );
  splitBtn.addEventListener('click', () => setMode('split'));

  // Close button
  const closeBtn = hdrBtn(
    `<svg width="11" height="11" viewBox="0 0 11 11"><line x1="1" y1="1" x2="10" y2="10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="10" y1="1" x2="1" y2="10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    '关闭'
  );
  closeBtn.addEventListener('click', hide);

  header.append(collapseBtn, geminiTab, notebookTab, spacer, sep(), reloadBtn, sep(), floatBtn, splitBtn, sep(), closeBtn);

  // ── iframe ────────────────────────────────────────────────────────────────
  const iframe = document.createElement('iframe');
  iframe.src = GEMINI_URL;
  iframe.allow = 'fullscreen; clipboard-read; clipboard-write';
  Object.assign(iframe.style, { flex: '1', border: 'none', minHeight: '0' });

  // ── Resize handle (left edge) ─────────────────────────────────────────────
  const resizer = document.createElement('div');
  Object.assign(resizer.style, {
    position: 'absolute', left: '0', top: '0', bottom: '0',
    width: '5px', cursor: 'ew-resize', zIndex: '1',
  });

  container.append(resizer, header, iframe);

  // ── Toggle tab (shown when sidebar is closed) ─────────────────────────────
  const toggleTab = document.createElement('button');
  toggleTab.id = 'aisidebar-tab';
  toggleTab.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16"><path d="M6 3l5 5-5 5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  Object.assign(toggleTab.style, {
    position: 'fixed', right: '0', top: '50%', transform: 'translateY(-50%)',
    zIndex: '2147483646', background: '#1a73e8', border: 'none',
    borderRadius: '8px 0 0 8px', width: '24px', height: '48px',
    cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
  });
  toggleTab.addEventListener('click', show);

  // ── Add to NotebookLM button ─────────────────────────────────────────────
  const addNbBtn = document.createElement('button');
  addNbBtn.id = 'aisidebar-add-nb';
  addNbBtn.title = '添加到 NotebookLM';
  addNbBtn.textContent = '+ NotebookLM';
  Object.assign(addNbBtn.style, {
    position: 'fixed', left: '16px', top: '80px',
    zIndex: '2147483647', background: '#34a853', color: '#fff',
    border: 'none', borderRadius: '20px', padding: '7px 14px',
    fontSize: '12px', fontWeight: '700', cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)', transition: 'background 0.15s',
    display: 'block',
  });
  addNbBtn.addEventListener('mouseenter', () => addNbBtn.style.background = '#2d9147');
  addNbBtn.addEventListener('mouseleave', () => addNbBtn.style.background = '#34a853');

  const nbToast = document.createElement('div');
  Object.assign(nbToast.style, {
    position: 'fixed', left: '16px', top: '130px',
    zIndex: '2147483646', background: 'rgba(0,0,0,0.78)', color: '#fff',
    borderRadius: '10px', padding: '9px 14px', fontSize: '12px',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    lineHeight: '1.5', display: 'none', maxWidth: '220px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  });
  nbToast.innerHTML = '✓ 链接已复制！<br>在 NotebookLM 点 <b>Add source → Website</b> 粘贴';

  addNbBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(window.location.href).catch(() => {});
    chrome.runtime.sendMessage({ action: 'openNotebook' });
    nbToast.style.display = 'block';
    setTimeout(() => { nbToast.style.display = 'none'; }, 3500);
  });

  document.documentElement.append(root, toggleTab, addNbBtn, nbToast);

  // ── Layout functions ──────────────────────────────────────────────────────
  function applyFloat() {
    const x = st.x !== null ? st.x : (window.innerWidth - st.width - 16);
    const y = st.y !== null ? st.y : 60;
    Object.assign(root.style, {
      top: y + 'px', left: x + 'px', right: '', bottom: '',
      width: st.width + 'px', height: '80vh',
      borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.16)',
    });
    document.documentElement.style.marginRight = '';
    document.documentElement.style.transition  = '';
    header.style.cursor = 'grab';
  }

  function applySplit() {
    Object.assign(root.style, {
      top: '0', right: '0', left: '', bottom: '0',
      width: st.width + 'px', height: '100vh',
      borderRadius: '0', boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
    });
    document.documentElement.style.transition  = 'margin-right 0.2s';
    document.documentElement.style.marginRight = st.width + 'px';
    header.style.cursor = 'default';
  }

  function applyCollapsed() {
    if (st.collapsed) {
      const h = header.offsetHeight + 'px';
      iframe.style.display = 'none';
      root.style.height = h;
      root.style.minHeight = h;
      collapseBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10"><path d="M3.5 2L6.5 5L3.5 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      if (st.mode === 'split') document.documentElement.style.marginRight = '';
    } else {
      iframe.style.display = 'flex';
      root.style.minHeight = '';
      root.style.height = st.mode === 'split' ? '100vh' : '80vh';
      collapseBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 3.5L5 6.5L8 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      if (st.mode === 'split') document.documentElement.style.marginRight = st.width + 'px';
    }
  }

  function setMode(m) {
    st.mode = m; save();
    if (m === 'float') {
      applyFloat();
      floatBtn.style.background = '#e8f0fe'; floatBtn.style.color = '#1a73e8';
      splitBtn.style.background = 'transparent'; splitBtn.style.color = '#5f6368';
    } else {
      applySplit();
      splitBtn.style.background = '#e8f0fe'; splitBtn.style.color = '#1a73e8';
      floatBtn.style.background = 'transparent'; floatBtn.style.color = '#5f6368';
    }
    if (st.collapsed) applyCollapsed();
  }

  function setService(s) {
    st.service = s;
    iframe.src = s === 'gemini' ? GEMINI_URL : NOTEBOOKLM_URL;
    updateServiceTabs();
    if (st.collapsed) { st.collapsed = false; applyCollapsed(); }
    save();
  }

  function updateServiceTabs() {
    const active   = { fontWeight: '700', color: '#1a73e8', borderBottom: '2px solid #1a73e8' };
    const inactive = { fontWeight: '400', color: '#5f6368', borderBottom: '2px solid transparent' };
    Object.assign(geminiTab.style,   st.service === 'gemini'     ? active : inactive);
    Object.assign(notebookTab.style, st.service === 'notebooklm' ? active : inactive);
  }

  function hide() {
    root.style.display = 'none';
    toggleTab.style.display = 'flex';
    if (st.mode === 'split') document.documentElement.style.marginRight = '';
  }

  function show() {
    root.style.display = 'block';
    toggleTab.style.display = 'none';
    if (st.mode === 'split' && !st.collapsed) applySplit();
  }

  // ── Drag (float only) ─────────────────────────────────────────────────────
  let dragging = false, dx, dy, ox, oy;
  header.addEventListener('mousedown', (e) => {
    if (st.mode !== 'float' || e.target.closest('button')) return;
    dragging = true; dx = e.clientX; dy = e.clientY;
    const r = root.getBoundingClientRect(); ox = r.left; oy = r.top;
    iframe.style.pointerEvents = 'none';
    root.style.transition = 'none';
    e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    st.x = Math.max(0, Math.min(window.innerWidth  - root.offsetWidth,  ox + e.clientX - dx));
    st.y = Math.max(0, Math.min(window.innerHeight - root.offsetHeight, oy + e.clientY - dy));
    root.style.left = st.x + 'px';
    root.style.top  = st.y + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    iframe.style.pointerEvents = '';
    root.style.transition = '';
    save();
  });

  // ── Resize ────────────────────────────────────────────────────────────────
  let resizing = false, rx, rw;
  resizer.addEventListener('mousedown', (e) => {
    resizing = true; rx = e.clientX; rw = root.offsetWidth;
    iframe.style.pointerEvents = 'none';
    document.body.style.cursor = 'ew-resize';
    e.stopPropagation(); e.preventDefault();
  });
  document.addEventListener('mousemove', (e) => {
    if (!resizing) return;
    st.width = Math.max(280, Math.min(window.innerWidth * 0.7, rw + rx - e.clientX));
    root.style.width = st.width + 'px';
    if (st.mode === 'split') document.documentElement.style.marginRight = st.width + 'px';
  });
  document.addEventListener('mouseup', () => {
    if (!resizing) return;
    resizing = false;
    iframe.style.pointerEvents = '';
    document.body.style.cursor = '';
    save();
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  function hdrBtn(svg, title) {
    const b = document.createElement('button');
    b.innerHTML = svg; b.title = title;
    Object.assign(b.style, {
      border: 'none', borderRadius: '6px', padding: '4px 6px',
      cursor: 'pointer', background: 'transparent', color: '#5f6368',
      display: 'flex', alignItems: 'center', transition: 'background 0.15s',
    });
    b.addEventListener('mouseenter', () => b.style.background = '#e8eaed');
    b.addEventListener('mouseleave', () => {
      const active = (b === floatBtn && st.mode === 'float') ||
                     (b === splitBtn && st.mode === 'split');
      b.style.background = active ? '#e8f0fe' : 'transparent';
    });
    return b;
  }

  function makeTabBtn(text) {
    const b = document.createElement('button');
    b.textContent = text;
    Object.assign(b.style, {
      border: 'none', background: 'transparent', cursor: 'pointer',
      fontSize: '13px', fontWeight: '400', color: '#5f6368',
      padding: '2px 8px', borderBottom: '2px solid transparent',
      borderRadius: '0', lineHeight: '1.5',
      transition: 'color 0.15s',
    });
    b.addEventListener('mouseenter', () => {
      const isActive = st.service === (text === 'Gemini' ? 'gemini' : 'notebooklm');
      if (!isActive) b.style.color = '#1a1a1a';
    });
    b.addEventListener('mouseleave', () => {
      const isActive = st.service === (text === 'Gemini' ? 'gemini' : 'notebooklm');
      if (!isActive) b.style.color = '#5f6368';
    });
    return b;
  }

  function sep() {
    const d = document.createElement('div');
    Object.assign(d.style, { width: '1px', height: '18px', background: '#e0e0e0', flexShrink: '0' });
    return d;
  }

  // Expose setMode for background.js
  root.__setMode = setMode;

  // ── Init: apply defaults first, then load saved state ────────────────────
  setMode('float');
  updateServiceTabs();
  applyCollapsed();

  chrome.storage.local.get(['aisidebar'], (result) => {
    if (result.aisidebar) {
      Object.assign(st, result.aisidebar, { collapsed: true });
      root.style.width = st.width + 'px';
      setMode(st.mode);
      updateServiceTabs();
      applyCollapsed();
    }
  });

})();
