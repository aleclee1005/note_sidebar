(function () {
  if (document.getElementById('aisidebar-root')) return;

  const GEMINI_URL = 'https://gemini.google.com';
  const DEFAULT_W  = 420;

  // ── Persisted state ───────────────────────────────────────────────────────
  let st = { mode: 'float', x: null, y: null, width: DEFAULT_W };
  try { Object.assign(st, JSON.parse(localStorage.getItem('aisidebar') || '{}')); } catch (_) {}
  function save() {
    try { localStorage.setItem('aisidebar', JSON.stringify(st)); } catch (_) {}
  }

  // ── Root ──────────────────────────────────────────────────────────────────
  const root = document.createElement('div');
  root.id = 'aisidebar-root';
  root._mode = st.mode;
  Object.assign(root.style, {
    position: 'fixed', zIndex: '2147483647',
    display: 'flex', flexDirection: 'column',
    background: '#fff', overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    width: st.width + 'px',
  });

  // ── Header ────────────────────────────────────────────────────────────────
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', alignItems: 'center', gap: '4px',
    padding: '7px 8px', background: '#f8f9fa',
    borderBottom: '1px solid #e8eaed',
    userSelect: 'none', flexShrink: '0', cursor: 'grab',
  });

  // ── Collapse / expand on label click ─────────────────────────────────────
  let collapsed = false;

  const label = document.createElement('span');
  label.textContent = 'Gemini ▾';
  Object.assign(label.style, {
    fontWeight: '700', fontSize: '13px', color: '#1a1a1a', flex: '1',
    cursor: 'pointer', userSelect: 'none',
  });
  label.addEventListener('click', () => {
    collapsed = !collapsed;
    const headerH = header.offsetHeight + 'px';
    if (collapsed) {
      iframe.style.display = 'none';
      root.style.height = headerH;
      root.style.minHeight = headerH;
      label.textContent = 'Gemini ▸';
      if (st.mode === 'split') document.documentElement.style.marginRight = '';
    } else {
      iframe.style.display = 'flex';
      root.style.minHeight = '';
      root.style.height = st.mode === 'split' ? '100vh' : '80vh';
      label.textContent = 'Gemini ▾';
      if (st.mode === 'split') document.documentElement.style.marginRight = st.width + 'px';
    }
  });

  header.appendChild(label);
  header.appendChild(sep());

  // Reload button
  const reloadBtn = hdrBtn(
    `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2L14 3v4h-4l1.6-1.6A3.5 3.5 0 1 0 11.5 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    '刷新 Gemini'
  );
  reloadBtn.addEventListener('click', () => { iframe.src = GEMINI_URL; });
  header.appendChild(reloadBtn);
  header.appendChild(sep());

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

  header.appendChild(floatBtn);
  header.appendChild(splitBtn);
  header.appendChild(sep());

  // Close button
  const closeBtn = hdrBtn(
    `<svg width="11" height="11" viewBox="0 0 11 11"><line x1="1" y1="1" x2="10" y2="10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="10" y1="1" x2="1" y2="10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    '关闭'
  );
  closeBtn.addEventListener('click', hide);
  header.appendChild(closeBtn);

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

  root.append(resizer, header, iframe);

  // ── Toggle tab ────────────────────────────────────────────────────────────
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

  document.documentElement.append(root, toggleTab);

  // ── Layout ────────────────────────────────────────────────────────────────
  function applyFloat() {
    const x = st.x !== null ? st.x : (window.innerWidth - st.width - 16);
    const y = st.y !== null ? st.y : 60;
    Object.assign(root.style, {
      top: y + 'px', left: x + 'px', right: '', bottom: '',
      width: st.width + 'px', height: '80vh', borderRadius: '12px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.16)',
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

  function setMode(m) {
    st.mode = m; root._mode = m; save();
    if (m === 'float') {
      applyFloat();
      floatBtn.style.background = '#e8f0fe'; floatBtn.style.color = '#1a73e8';
      splitBtn.style.background = 'transparent'; splitBtn.style.color = '#5f6368';
    } else {
      applySplit();
      splitBtn.style.background = '#e8f0fe'; splitBtn.style.color = '#1a73e8';
      floatBtn.style.background = 'transparent'; floatBtn.style.color = '#5f6368';
    }
  }
  // Expose for background.js
  root.__setMode = setMode;

  function hide() {
    root.style.display = 'none';
    toggleTab.style.display = 'flex';
    if (st.mode === 'split') document.documentElement.style.marginRight = '';
  }

  function show() {
    root.style.display = 'flex';
    toggleTab.style.display = 'none';
    if (st.mode === 'split') applySplit();
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
      if (b !== floatBtn && b !== splitBtn) b.style.background = 'transparent';
    });
    return b;
  }

  function sep() {
    const d = document.createElement('div');
    Object.assign(d.style, { width: '1px', height: '18px', background: '#e0e0e0', flexShrink: '0' });
    return d;
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  setMode(st.mode);
})();
