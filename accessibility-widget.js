(function () {
  'use strict';
  if (document.getElementById('acc-widget-root')) return;

  /* ═══════════════════════════════════════════════════════
     ACC ACCESSIBILITY WIDGET  |  acclogo embedded
  ═══════════════════════════════════════════════════════ */

  const ACC_LOGO = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2064%22%3E%3Crect%20width%3D%2264%22%20height%3D%2264%22%20rx%3D%2214%22%20fill%3D%22%230f1117%22%2F%3E%3Crect%20width%3D%2262%22%20height%3D%2262%22%20x%3D%221%22%20y%3D%221%22%20rx%3D%2213%22%20fill%3D%22none%22%20stroke%3D%22%232a2d3e%22%20stroke-width%3D%221.5%22%2F%3E%3Ccircle%20cx%3D%2232%22%20cy%3D%2214%22%20r%3D%225.5%22%20fill%3D%22%234f8ef7%22%2F%3E%3Cpath%20d%3D%22M32%2021%20L32%2039%22%20stroke%3D%22%234f8ef7%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M13%2027%20L32%2023%20L51%2027%22%20stroke%3D%22%2338d9a9%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20fill%3D%22none%22%2F%3E%3Cpath%20d%3D%22M32%2039%20L22%2053%22%20stroke%3D%22%2338d9a9%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M32%2039%20L42%2053%22%20stroke%3D%22%2338d9a9%22%20stroke-width%3D%224%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E';

  // ── Audit history stored in memory
  const auditHistory = [];

  // ══════════════════════════════════════════
  // 1. STYLES
  // ══════════════════════════════════════════
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(fontLink);

  const style = document.createElement('style');
  style.id = 'acc-widget-styles';
  style.textContent = `
    :root {
      --acc-dark:    #0f1117;
      --acc-panel:   #16181f;
      --acc-surface: #1e2130;
      --acc-border:  #2a2d3e;
      --acc-accent:  #4f8ef7;
      --acc-accent2: #38d9a9;
      --acc-warn:    #f5a623;
      --acc-error:   #f75f5f;
      --acc-text:    #e8eaf0;
      --acc-muted:   #6b7280;
      --acc-font:    'Sora', sans-serif;
      --acc-mono:    'JetBrains Mono', monospace;
    }

    /* ── Floating button ── */
    #acc-toggle {
      position: fixed; bottom: 24px; right: 24px;
      width: 62px; height: 62px; border-radius: 16px;
      background: var(--acc-dark);
      border: 1.5px solid var(--acc-border);
      cursor: pointer; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 3px;
      box-shadow: 0 8px 32px rgba(0,0,0,.5), 0 0 0 0 rgba(79,142,247,0);
      z-index: 2147483646; padding: 0; outline: none;
      transition: transform .2s, box-shadow .3s, border-color .2s;
    }
    #acc-toggle:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,.6), 0 0 0 4px rgba(79,142,247,.2);
      border-color: var(--acc-accent);
    }
    #acc-toggle:focus-visible { outline: 2px solid var(--acc-accent) !important; outline-offset: 3px !important; }
    #acc-toggle img { width: 36px; height: 36px; object-fit: contain; filter: brightness(1.1); }
    #acc-toggle-label {
      font-family: var(--acc-mono); font-size: 7px; font-weight: 500;
      color: var(--acc-muted); letter-spacing: .08em; text-transform: uppercase;
    }

    /* ── Panel ── */
    #acc-panel {
      position: fixed; bottom: 100px; right: 24px;
      width: min(380px, calc(100vw - 48px)); max-height: 84vh;
      background: var(--acc-panel);
      border: 1px solid var(--acc-border);
      border-radius: 20px;
      box-shadow: 0 24px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.04) inset;
      z-index: 2147483645; overflow: hidden;
      display: flex; flex-direction: column;
      transform: scale(.92) translateY(16px); opacity: 0; pointer-events: none;
      transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .2s;
      font-family: var(--acc-font); box-sizing: border-box;
    }
    #acc-panel.acc-open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
    #acc-panel * { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Wix iframe mode: absolute so panel isn't clipped by iframe box ── */
    body.acc-in-iframe { overflow: hidden; }
    body.acc-in-iframe #acc-toggle { position: absolute !important; bottom: 10px !important; right: 10px !important; }
    body.acc-in-iframe #acc-panel  { position: absolute !important; top: 70px !important; bottom: auto !important; right: 10px !important; left: 10px !important; max-height: calc(100% - 90px) !important; width: calc(100% - 20px) !important; overflow-y: auto !important; }

    /* Header */
    .acc-header {
      background: linear-gradient(135deg, #0f1117 0%, #1a1d2e 100%);
      border-bottom: 1px solid var(--acc-border);
      padding: 16px 18px 0; flex-shrink: 0;
    }
    .acc-header-top {
      display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
    }
    .acc-header-logo {
      width: 32px; height: 32px; object-fit: contain;
      filter: brightness(1.15) drop-shadow(0 0 6px rgba(79,142,247,.3));
    }
    .acc-header-title { flex: 1; }
    .acc-header-title h2 {
      font-size: .9rem; font-weight: 700; color: var(--acc-text);
      letter-spacing: .05em; text-transform: uppercase;
    }
    .acc-header-title p { font-size: .7rem; color: var(--acc-muted); margin-top: 1px; }
    .acc-close-btn {
      width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--acc-border);
      background: var(--acc-surface); color: var(--acc-muted); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; transition: background .15s, color .15s;
    }
    .acc-close-btn:hover { background: var(--acc-border); color: var(--acc-text); }

    /* Tabs */
    .acc-tabs { display: flex; gap: 2px; padding-bottom: 0; }
    .acc-tab {
      flex: 1; padding: 9px 6px; font-size: .72rem; font-weight: 600;
      color: var(--acc-muted); cursor: pointer; border: none; background: none;
      letter-spacing: .04em; text-transform: uppercase; border-bottom: 2px solid transparent;
      transition: color .15s, border-color .15s; font-family: var(--acc-font);
      white-space: nowrap;
    }
    .acc-tab.acc-active { color: var(--acc-accent); border-bottom-color: var(--acc-accent); }

    /* Tab panels */
    .acc-panel-content { display: none; flex: 1; overflow-y: auto; flex-direction: column; }
    .acc-panel-content.acc-active { display: flex; }
    .acc-panel-content::-webkit-scrollbar { width: 4px; }
    .acc-panel-content::-webkit-scrollbar-track { background: transparent; }
    .acc-panel-content::-webkit-scrollbar-thumb { background: var(--acc-border); border-radius: 4px; }

    .acc-body { padding: 14px; display: flex; flex-direction: column; gap: 7px; flex: 1; }

    /* Section label */
    .acc-section {
      font-size: .63rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase;
      color: var(--acc-muted); margin: 6px 0 2px; font-family: var(--acc-mono);
      display: flex; align-items: center; gap: 6px;
    }
    .acc-section::after { content: ''; flex: 1; height: 1px; background: var(--acc-border); }

    /* Toggle row */
    .acc-row {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--acc-surface); border: 1px solid var(--acc-border);
      border-radius: 10px; padding: 10px 12px; cursor: pointer;
      transition: background .15s, border-color .15s; user-select: none;
    }
    .acc-row:hover { background: #242638; border-color: #363a54; }
    .acc-row.acc-on { background: rgba(79,142,247,.08); border-color: rgba(79,142,247,.35); }
    .acc-row-label { display: flex; align-items: center; gap: 9px; font-size: .83rem; font-weight: 500; color: var(--acc-text); }
    .acc-row-icon { font-size: 1.1rem; line-height: 1; width: 22px; text-align: center; }
    .acc-row-sub { font-size: .68rem; color: var(--acc-muted); margin-top: 1px; }

    /* Toggle switch */
    .acc-switch {
      width: 36px; height: 20px; background: var(--acc-border); border-radius: 99px;
      position: relative; transition: background .2s; flex-shrink: 0;
    }
    .acc-switch::after {
      content: ''; position: absolute; top: 2px; left: 2px;
      width: 16px; height: 16px; background: #fff; border-radius: 50%;
      transition: transform .2s; box-shadow: 0 1px 4px rgba(0,0,0,.3);
    }
    .acc-row.acc-on .acc-switch { background: var(--acc-accent); }
    .acc-row.acc-on .acc-switch::after { transform: translateX(16px); }

    /* Stepper */
    .acc-stepper {
      display: flex; align-items: center; justify-content: space-between;
      background: var(--acc-surface); border: 1px solid var(--acc-border);
      border-radius: 10px; padding: 9px 12px;
    }
    .acc-stepper-label { font-size: .83rem; font-weight: 500; color: var(--acc-text); display: flex; align-items: center; gap: 9px; }
    .acc-stepper-ctrl { display: flex; align-items: center; gap: 8px; }
    .acc-step-btn {
      width: 26px; height: 26px; border-radius: 7px; border: 1px solid var(--acc-border);
      background: var(--acc-dark); color: var(--acc-text); font-size: 1rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .15s; font-weight: 700; line-height: 1; padding: 0; font-family: inherit;
    }
    .acc-step-btn:hover { background: var(--acc-border); }
    .acc-step-val {
      font-size: .8rem; font-family: var(--acc-mono); min-width: 38px;
      text-align: center; color: var(--acc-accent); font-weight: 500;
    }

    /* Color swatches */
    .acc-colors-box { background: var(--acc-surface); border: 1px solid var(--acc-border); border-radius: 10px; padding: 11px 12px; }
    .acc-colors-label { font-size: .83rem; font-weight: 500; color: var(--acc-text); margin-bottom: 9px; display: flex; align-items: center; gap: 8px; }
    .acc-swatches { display: flex; gap: 7px; flex-wrap: wrap; }
    .acc-swatch {
      width: 30px; height: 30px; border-radius: 8px; border: 2px solid transparent; cursor: pointer;
      transition: transform .15s, border-color .15s, box-shadow .15s; outline: none; padding: 0;
      font-size: .6rem; display: flex; align-items: center; justify-content: center; font-weight: 700;
    }
    .acc-swatch:hover { transform: scale(1.1); }
    .acc-swatch.acc-picked { border-color: var(--acc-accent) !important; box-shadow: 0 0 0 3px rgba(79,142,247,.25); transform: scale(1.1); }

    /* Reset */
    .acc-reset {
      width: 100%; padding: 10px; border-radius: 10px; margin-top: 2px;
      border: 1px solid rgba(247,95,95,.3); background: rgba(247,95,95,.08);
      color: var(--acc-error); font-size: .82rem; font-weight: 600; cursor: pointer;
      font-family: var(--acc-font); transition: background .15s;
    }
    .acc-reset:hover { background: rgba(247,95,95,.15); }

    /* ── Auto-Fix Tab ── */
    .acc-fix-body { padding: 14px; display: flex; flex-direction: column; gap: 10px; flex: 1; }

    .acc-score-card {
      background: linear-gradient(135deg, #0f1117, #1a2040);
      border: 1px solid var(--acc-border); border-radius: 14px; padding: 18px;
      text-align: center; position: relative; overflow: hidden;
    }
    .acc-score-card::before {
      content: ''; position: absolute; top: -40px; right: -40px;
      width: 120px; height: 120px; border-radius: 50%;
      background: radial-gradient(circle, rgba(79,142,247,.12), transparent 70%);
    }
    .acc-score-ring {
      width: 80px; height: 80px; margin: 0 auto 10px;
      border-radius: 50%; background: var(--acc-surface);
      border: 3px solid var(--acc-border);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .acc-score-num { font-size: 1.8rem; font-weight: 700; color: var(--acc-text); font-family: var(--acc-mono); line-height: 1; }
    .acc-score-label { font-size: .65rem; color: var(--acc-muted); text-transform: uppercase; letter-spacing: .1em; margin-top: 2px; }
    .acc-score-sub { font-size: .72rem; color: var(--acc-muted); margin-top: 8px; }
    .acc-stats { display: flex; justify-content: center; gap: 20px; margin-top: 12px; }
    .acc-stat { text-align: center; }
    .acc-stat-n { font-size: 1.1rem; font-weight: 700; font-family: var(--acc-mono); }
    .acc-stat-n.g { color: var(--acc-accent2); }
    .acc-stat-n.y { color: var(--acc-warn); }
    .acc-stat-n.r { color: var(--acc-error); }
    .acc-stat-l { font-size: .6rem; color: var(--acc-muted); text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; }

    .acc-scan-btn {
      width: 100%; padding: 12px; border-radius: 11px; border: none;
      background: linear-gradient(135deg, var(--acc-accent), #3a6fd8);
      color: #fff; font-size: .88rem; font-weight: 700; cursor: pointer;
      font-family: var(--acc-font); transition: opacity .15s, transform .1s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      letter-spacing: .02em; box-shadow: 0 4px 16px rgba(79,142,247,.3);
    }
    .acc-scan-btn:hover { opacity: .92; }
    .acc-scan-btn:active { transform: scale(.98); }
    .acc-scan-btn:disabled { background: var(--acc-surface); color: var(--acc-muted); box-shadow: none; cursor: default; }

    .acc-dl-btn {
      width: 100%; padding: 10px; border-radius: 11px;
      border: 1px solid rgba(56,217,169,.3); background: rgba(56,217,169,.07);
      color: var(--acc-accent2); font-size: .82rem; font-weight: 600; cursor: pointer;
      font-family: var(--acc-font); transition: background .15s;
      display: flex; align-items: center; justify-content: center; gap: 7px;
    }
    .acc-dl-btn:hover { background: rgba(56,217,169,.14); }
    .acc-dl-btn:disabled { opacity: .35; cursor: default; }

    .acc-issues { display: flex; flex-direction: column; gap: 6px; }
    .acc-issue {
      background: var(--acc-surface); border-radius: 10px; padding: 10px 12px;
      border-left: 3px solid var(--acc-border);
    }
    .acc-issue.fixed   { border-left-color: var(--acc-accent2); background: rgba(56,217,169,.05); }
    .acc-issue.warning { border-left-color: var(--acc-warn);    background: rgba(245,166,35,.05); }
    .acc-issue.error   { border-left-color: var(--acc-error);   background: rgba(247,95,95,.05); }
    .acc-issue-head { display: flex; align-items: flex-start; gap: 7px; justify-content: space-between; }
    .acc-issue-title { font-size: .82rem; font-weight: 600; color: var(--acc-text); display: flex; align-items: center; gap: 6px; }
    .acc-badge {
      font-size: .6rem; font-weight: 700; padding: 2px 7px; border-radius: 6px;
      text-transform: uppercase; letter-spacing: .05em; flex-shrink: 0; margin-top: 1px;
    }
    .acc-badge.fixed   { background: rgba(56,217,169,.15);  color: var(--acc-accent2); }
    .acc-badge.warning { background: rgba(245,166,35,.15);  color: var(--acc-warn); }
    .acc-badge.error   { background: rgba(247,95,95,.15);   color: var(--acc-error); }
    .acc-issue-desc { font-size: .75rem; color: var(--acc-muted); margin-top: 5px; line-height: 1.55; }
    .acc-issue-cnt  { font-size: .68rem; font-family: var(--acc-mono); color: #4a5068; margin-top: 4px; }

    /* ── History Tab ── */
    .acc-hist-body { padding: 14px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
    .acc-hist-empty { text-align: center; color: var(--acc-muted); font-size: .83rem; padding: 30px 0; line-height: 1.7; }
    .acc-hist-card {
      background: var(--acc-surface); border: 1px solid var(--acc-border);
      border-radius: 10px; padding: 11px 13px;
    }
    .acc-hist-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
    .acc-hist-date { font-size: .7rem; color: var(--acc-muted); font-family: var(--acc-mono); }
    .acc-hist-score { font-size: .88rem; font-weight: 700; font-family: var(--acc-mono); color: var(--acc-accent); }
    .acc-hist-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .acc-hist-pill { font-size: .65rem; padding: 2px 8px; border-radius: 6px; font-weight: 600; }
    .acc-hist-pill.g { background: rgba(56,217,169,.12);  color: var(--acc-accent2); }
    .acc-hist-pill.y { background: rgba(245,166,35,.12);  color: var(--acc-warn); }
    .acc-hist-pill.r { background: rgba(247,95,95,.12);   color: var(--acc-error); }
    .acc-hist-dl {
      margin-top: 8px; width: 100%; padding: 6px; border-radius: 7px;
      border: 1px solid var(--acc-border); background: transparent;
      color: var(--acc-muted); font-size: .72rem; cursor: pointer;
      font-family: var(--acc-font); transition: border-color .15s, color .15s;
    }
    .acc-hist-dl:hover { border-color: var(--acc-accent2); color: var(--acc-accent2); }

    /* Footer */
    .acc-footer {
      padding: 9px 16px; border-top: 1px solid var(--acc-border);
      font-size: .65rem; color: var(--acc-muted); text-align: center;
      display: flex; align-items: center; justify-content: center; gap: 6px; flex-shrink: 0;
    }
    .acc-footer img { width: 14px; height: 14px; object-fit: contain; opacity: .5; }

    /* Reading guide */
    #acc-reading-line {
      position: fixed; left: 0; right: 0; height: 34px;
      background: rgba(79,142,247,.1);
      border-top: 2px solid rgba(79,142,247,.4);
      border-bottom: 2px solid rgba(79,142,247,.4);
      pointer-events: none; z-index: 2147483644; display: none; top: 0;
    }

    /* ── Accessibility effect classes ── */
    body.acc-big-cursor, body.acc-big-cursor * {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Ccircle cx='11' cy='11' r='10' fill='%230f1117' stroke='%234f8ef7' stroke-width='2.5'/%3E%3C/svg%3E") 11 11, auto !important;
    }
    body.acc-highlight-links a { outline: 2px solid var(--acc-warn) !important; outline-offset: 2px !important; background: rgba(245,166,35,.08) !important; }
    body.acc-readable,  body.acc-readable  * { font-family: Georgia, 'Times New Roman', serif !important; letter-spacing: .03em !important; }
    body.acc-dyslexia,  body.acc-dyslexia  * { font-family: 'Trebuchet MS', Verdana, sans-serif !important; line-height: 2 !important; letter-spacing: .09em !important; word-spacing: .22em !important; }
    body.acc-high-contrast   { filter: contrast(180%) !important; }
    body.acc-invert          { filter: invert(1) hue-rotate(180deg) !important; }
    body.acc-grayscale       { filter: grayscale(1) !important; }
    body.acc-low-saturation  { filter: saturate(0.2) !important; }
    body.acc-stop-anim *,
    body.acc-stop-anim *::before,
    body.acc-stop-anim *::after { animation: none !important; transition: none !important; }
    body.acc-focus-ring *:focus { outline: 3px solid var(--acc-accent) !important; outline-offset: 3px !important; }
    body.acc-text-spacing,
    body.acc-text-spacing * { line-height: 1.95 !important; letter-spacing: .13em !important; word-spacing: .15em !important; }

    /* ══════════════════════════════════════════
       MOBILE RESPONSIVE
    ══════════════════════════════════════════ */

    /* Mobile responsive - sizing only, no position overrides */
    @media (max-width: 480px) {
      #acc-toggle {
        width: 54px;
        height: 54px;
        border-radius: 14px;
      }
      #acc-toggle img { width: 30px; height: 30px; }
      #acc-toggle-label { display: none; }
      .acc-header { padding: 14px 14px 0; }
      .acc-header-title h2 { font-size: .82rem; }
      .acc-body, .acc-fix-body, .acc-hist-body { padding: 10px; gap: 6px; }
      .acc-tab { font-size: .63rem; padding: 8px 3px; letter-spacing: .01em; }
      .acc-stepper, .acc-row { padding: 8px 10px; }
      .acc-row-label { font-size: .78rem; }
      .acc-score-ring { width: 68px; height: 68px; }
      .acc-score-num { font-size: 1.45rem; }
      .acc-swatches { gap: 5px; }
      .acc-swatch { width: 28px; height: 28px; border-radius: 7px; }
      .acc-stats { gap: 14px; }
    }
  `;
  document.head.appendChild(style);

  // ══════════════════════════════════════════
  // 2. HTML
  // ══════════════════════════════════════════
  const root = document.createElement('div');
  root.id = 'acc-widget-root';
  root.innerHTML = `
    <div id="acc-reading-line" role="presentation"></div>

    <button id="acc-toggle" aria-label="Open ACC Accessibility Panel" aria-expanded="false">
      <img src="${ACC_LOGO}" alt="ACC" />
    </button>

    <div id="acc-panel" role="dialog" aria-modal="false" aria-label="ACC Accessibility Settings">

      <div class="acc-header">
        <div class="acc-header-top">
          <img class="acc-header-logo" src="${ACC_LOGO}" alt="ACC Logo" />
          <div class="acc-header-title">
            <h2>ACC Accessibility</h2>
            <p>Powered by Auto AI Engine</p>
          </div>
          <button class="acc-close-btn" id="acc-close" aria-label="Close panel">✕</button>
        </div>
        <div class="acc-tabs">
          <button class="acc-tab acc-active" data-tab="settings">⚙ Settings</button>
          <button class="acc-tab" data-tab="autofix">🔧 Auto-Fix</button>
          <button class="acc-tab" data-tab="history">📋 History</button>
        </div>
      </div>

      <!-- ═══ SETTINGS TAB ═══ -->
      <div class="acc-panel-content acc-active" data-panel="settings">
        <div class="acc-body">

          <div class="acc-section">Content</div>

          <div class="acc-stepper">
            <div class="acc-stepper-label"><span class="acc-row-icon">🔤</span> Font Size</div>
            <div class="acc-stepper-ctrl">
              <button class="acc-step-btn" id="acc-fs-dn" aria-label="Decrease font size">−</button>
              <span class="acc-step-val" id="acc-fs-val">100%</span>
              <button class="acc-step-btn" id="acc-fs-up" aria-label="Increase font size">+</button>
            </div>
          </div>

          <div class="acc-stepper">
            <div class="acc-stepper-label"><span class="acc-row-icon">↕</span> Line Height</div>
            <div class="acc-stepper-ctrl">
              <button class="acc-step-btn" id="acc-lh-dn" aria-label="Decrease line height">−</button>
              <span class="acc-step-val" id="acc-lh-val">1.6</span>
              <button class="acc-step-btn" id="acc-lh-up" aria-label="Increase line height">+</button>
            </div>
          </div>

          <div class="acc-stepper">
            <div class="acc-stepper-label"><span class="acc-row-icon">↔</span> Letter Spacing</div>
            <div class="acc-stepper-ctrl">
              <button class="acc-step-btn" id="acc-ls-dn" aria-label="Decrease letter spacing">−</button>
              <span class="acc-step-val" id="acc-ls-val">0px</span>
              <button class="acc-step-btn" id="acc-ls-up" aria-label="Increase letter spacing">+</button>
            </div>
          </div>

          <div class="acc-section">Vision</div>

          <div class="acc-colors-box">
            <div class="acc-colors-label">🎨 Colour Filter</div>
            <div class="acc-swatches" id="acc-swatches">
              <button class="acc-swatch acc-picked" data-filter="" style="background:#1e2130;border-color:#4a5068;color:#6b7280;" title="Default">↺</button>
              <button class="acc-swatch" data-filter="acc-high-contrast"  style="background:#000;color:#fff;"  title="High Contrast">HC</button>
              <button class="acc-swatch" data-filter="acc-invert"         style="background:linear-gradient(135deg,#000 50%,#fff 50%);" title="Invert"></button>
              <button class="acc-swatch" data-filter="acc-grayscale"      style="background:#888;" title="Greyscale">GS</button>
              <button class="acc-swatch" data-filter="acc-low-saturation" style="background:#b3a89d;" title="Low Saturation">LS</button>
            </div>
          </div>

          <div class="acc-row" id="acc-t-guide" role="switch" aria-checked="false" tabindex="0">
            <div><div class="acc-row-label"><span class="acc-row-icon">📏</span> Reading Guide</div><div class="acc-row-sub">Highlights current reading line</div></div>
            <div class="acc-switch" aria-hidden="true"></div>
          </div>

          <div class="acc-section">Navigation</div>

          <div class="acc-row" id="acc-t-links" role="switch" aria-checked="false" tabindex="0">
            <div><div class="acc-row-label"><span class="acc-row-icon">🔗</span> Highlight Links</div><div class="acc-row-sub">Outlines all hyperlinks</div></div>
            <div class="acc-switch" aria-hidden="true"></div>
          </div>
          <div class="acc-row" id="acc-t-cursor" role="switch" aria-checked="false" tabindex="0">
            <div><div class="acc-row-label"><span class="acc-row-icon">🖱</span> Large Cursor</div><div class="acc-row-sub">Enlarged mouse pointer</div></div>
            <div class="acc-switch" aria-hidden="true"></div>
          </div>
          <div class="acc-row" id="acc-t-focus" role="switch" aria-checked="false" tabindex="0">
            <div><div class="acc-row-label"><span class="acc-row-icon">🔲</span> Focus Ring</div><div class="acc-row-sub">Enhanced keyboard focus indicator</div></div>
            <div class="acc-switch" aria-hidden="true"></div>
          </div>

          <div class="acc-section">Reading</div>

          <div class="acc-row" id="acc-t-dyslexia" role="switch" aria-checked="false" tabindex="0">
            <div><div class="acc-row-label"><span class="acc-row-icon">📖</span> Dyslexia Font</div><div class="acc-row-sub">Trebuchet with wide spacing</div></div>
            <div class="acc-switch" aria-hidden="true"></div>
          </div>
          <div class="acc-row" id="acc-t-readable" role="switch" aria-checked="false" tabindex="0">
            <div><div class="acc-row-label"><span class="acc-row-icon">🅰</span> Readable Font</div><div class="acc-row-sub">Serif for long-form reading</div></div>
            <div class="acc-switch" aria-hidden="true"></div>
          </div>
          <div class="acc-row" id="acc-t-spacing" role="switch" aria-checked="false" tabindex="0">
            <div><div class="acc-row-label"><span class="acc-row-icon">📐</span> Text Spacing</div><div class="acc-row-sub">Extra word & letter spacing</div></div>
            <div class="acc-switch" aria-hidden="true"></div>
          </div>
          <div class="acc-row" id="acc-t-anim" role="switch" aria-checked="false" tabindex="0">
            <div><div class="acc-row-label"><span class="acc-row-icon">⏸</span> Pause Animations</div><div class="acc-row-sub">Stops all motion & transitions</div></div>
            <div class="acc-switch" aria-hidden="true"></div>
          </div>

          <button class="acc-reset" id="acc-reset">↺ Reset All Settings</button>
        </div>
      </div>

      <!-- ═══ AUTO-FIX TAB ═══ -->
      <div class="acc-panel-content" data-panel="autofix">
        <div class="acc-fix-body">
          <div class="acc-score-card">
            <div class="acc-score-ring">
              <div>
                <div class="acc-score-num" id="acc-score">--</div>
                <div class="acc-score-label">/100</div>
              </div>
            </div>
            <div class="acc-score-sub">Accessibility Score</div>
            <div class="acc-stats">
              <div class="acc-stat"><div class="acc-stat-n g" id="acc-n-fixed">0</div><div class="acc-stat-l">Auto‑Fixed</div></div>
              <div class="acc-stat"><div class="acc-stat-n y" id="acc-n-warn">0</div><div class="acc-stat-l">Warnings</div></div>
              <div class="acc-stat"><div class="acc-stat-n r" id="acc-n-err">0</div><div class="acc-stat-l">Critical</div></div>
            </div>
          </div>

          <button class="acc-scan-btn" id="acc-scan">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            Scan &amp; Auto-Fix Page
          </button>

          <button class="acc-dl-btn" id="acc-dl-now" disabled>
            ↓ Download Audit Report
          </button>

          <div class="acc-issues" id="acc-issues">
            <div style="text-align:center;color:#4a5068;font-size:.82rem;padding:24px 10px;line-height:1.7;">
              Run a scan to detect and automatically fix accessibility issues on this page.
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ HISTORY TAB ═══ -->
      <div class="acc-panel-content" data-panel="history">
        <div class="acc-hist-body">
          <div class="acc-hist-empty" id="acc-hist-empty">
            No audit history yet.<br>Run your first scan on the Auto-Fix tab.
          </div>
          <div id="acc-hist-list"></div>
        </div>
      </div>

      <div class="acc-footer">
        <img src="${ACC_LOGO}" alt="" />
        ACC Accessibility Widget &mdash; Auto AI Engine
      </div>
    </div>
  `;
  document.body.appendChild(root);

  // ══════════════════════════════════════════
  // 3. SETTINGS LOGIC
  // ══════════════════════════════════════════
  const S = {
    open: false, fontSize: 100, lineHeight: 1.6, letterSpacing: 0,
    colorFilter: '', toggles: {}
  };
  const toggleBtn = document.getElementById('acc-toggle');
  const panel     = document.getElementById('acc-panel');
  const guide     = document.getElementById('acc-reading-line');
  const widgetEl  = document.getElementById('acc-widget-root');

  // ── Wix iframe detection & resize ─────────
  // position:fixed inside a Wix iframe is clipped to the iframe box.
  // Strategy: mark body with acc-in-iframe, use position:absolute,
  // and postMessage Wix to resize the iframe on open/close.
  const isInIframe = window.self !== window.top;
  if (isInIframe) document.body.classList.add('acc-in-iframe');

  const openPanel = () => {
    S.open = true;
    panel.classList.add('acc-open');
    toggleBtn.setAttribute('aria-expanded', true);
  };
  const closePanel = () => {
    S.open = false;
    panel.classList.remove('acc-open');
    toggleBtn.setAttribute('aria-expanded', false);
  };

  toggleBtn.addEventListener('click', () => S.open ? closePanel() : openPanel());
  document.getElementById('acc-close').addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.open) { closePanel(); toggleBtn.focus(); } });

  // Tabs
  document.querySelectorAll('.acc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.acc-tab').forEach(t => t.classList.remove('acc-active'));
      document.querySelectorAll('.acc-panel-content').forEach(c => c.classList.remove('acc-active'));
      tab.classList.add('acc-active');
      document.querySelector(`.acc-panel-content[data-panel="${tab.dataset.tab}"]`).classList.add('acc-active');
    });
  });

  // Steppers helper
  function stepper(upId, dnId, valId, getV, setV, fmt, min, max, step) {
    const valEl = document.getElementById(valId);
    document.getElementById(upId).addEventListener('click', () => { if (getV() < max) { setV(+(getV() + step).toFixed(2)); valEl.textContent = fmt(getV()); } });
    document.getElementById(dnId).addEventListener('click', () => { if (getV() > min) { setV(+(getV() - step).toFixed(2)); valEl.textContent = fmt(getV()); } });
  }

  stepper('acc-fs-up','acc-fs-dn','acc-fs-val',
    () => S.fontSize, v => { S.fontSize = v; document.documentElement.style.fontSize = v + '%'; },
    v => v + '%', 70, 200, 10);
  stepper('acc-lh-up','acc-lh-dn','acc-lh-val',
    () => S.lineHeight, v => { S.lineHeight = v; document.body.style.lineHeight = v; },
    v => v, 1.0, 3.0, 0.2);
  stepper('acc-ls-up','acc-ls-dn','acc-ls-val',
    () => S.letterSpacing, v => { S.letterSpacing = v; document.body.style.letterSpacing = v + 'px'; },
    v => v + 'px', 0, 10, 1);

  // Colour swatches
  document.querySelectorAll('.acc-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      if (S.colorFilter) document.body.classList.remove(S.colorFilter);
      document.querySelectorAll('.acc-swatch').forEach(s => s.classList.remove('acc-picked'));
      sw.classList.add('acc-picked');
      S.colorFilter = sw.dataset.filter;
      if (S.colorFilter) document.body.classList.add(S.colorFilter);
    });
  });

  // Toggle rows
  const toggleMap = {
    'acc-t-guide':   'acc-reading-guide-on',
    'acc-t-links':   'acc-highlight-links',
    'acc-t-cursor':  'acc-big-cursor',
    'acc-t-focus':   'acc-focus-ring',
    'acc-t-dyslexia':'acc-dyslexia',
    'acc-t-readable':'acc-readable',
    'acc-t-spacing': 'acc-text-spacing',
    'acc-t-anim':    'acc-stop-anim',
  };
  Object.entries(toggleMap).forEach(([id, cls]) => {
    S.toggles[cls] = false;
    const row = document.getElementById(id);
    const go = () => {
      const on = row.classList.toggle('acc-on');
      row.setAttribute('aria-checked', on);
      document.body.classList.toggle(cls, on);
      S.toggles[cls] = on;
      if (cls === 'acc-reading-guide-on') guide.style.display = on ? 'block' : 'none';
    };
    row.addEventListener('click', go);
    row.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); go(); } });
  });

  document.addEventListener('mousemove', e => {
    if (S.toggles['acc-reading-guide-on']) guide.style.top = (e.clientY - 17) + 'px';
  });

  // Reset
  document.getElementById('acc-reset').addEventListener('click', () => {
    S.fontSize = 100; document.documentElement.style.fontSize = ''; document.getElementById('acc-fs-val').textContent = '100%';
    S.lineHeight = 1.6; document.body.style.lineHeight = ''; document.getElementById('acc-lh-val').textContent = '1.6';
    S.letterSpacing = 0; document.body.style.letterSpacing = ''; document.getElementById('acc-ls-val').textContent = '0px';
    if (S.colorFilter) document.body.classList.remove(S.colorFilter);
    S.colorFilter = '';
    document.querySelectorAll('.acc-swatch').forEach(s => s.classList.remove('acc-picked'));
    document.querySelector('.acc-swatch[data-filter=""]').classList.add('acc-picked');
    Object.entries(toggleMap).forEach(([id, cls]) => {
      const row = document.getElementById(id);
      row.classList.remove('acc-on');
      row.setAttribute('aria-checked', false);
      document.body.classList.remove(cls);
      S.toggles[cls] = false;
    });
    guide.style.display = 'none';
  });

  // ══════════════════════════════════════════
  // 4. AUTO-FIX ENGINE
  // ══════════════════════════════════════════
  let lastAudit = null;

  function runScan() {
    const issues = [];

    // 1. HTML lang
    if (!document.documentElement.getAttribute('lang')) {
      document.documentElement.setAttribute('lang', 'en');
      issues.push({ type:'fixed', icon:'🌐', title:'Page Language Set', desc:'Set lang="en" on <html>. Screen readers use this to choose the correct speech synthesis voice.' });
    }

    // 2. Images missing alt
    (function(){
      const imgs = Array.from(document.querySelectorAll('img')).filter(e => !widgetEl.contains(e));
      let fixed=0, warned=0;
      imgs.forEach(img => {
        if (!img.hasAttribute('alt')) {
          const file = (img.getAttribute('src')||'').split('/').pop().replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
          img.setAttribute('alt', file && file.length < 80 ? file : 'image');
          fixed++;
        } else if (img.getAttribute('alt') === img.getAttribute('src')) warned++;
      });
      if (fixed)  issues.push({ type:'fixed',   icon:'🖼', title:'Missing Alt Text Added',   desc:`Assigned descriptive alt attributes to ${fixed} image(s) based on filename. Review for accuracy.`, count: fixed });
      if (warned) issues.push({ type:'warning', icon:'🖼', title:'Alt Equals File Path',      desc:`${warned} image(s) have the file path as their alt. Replace with a human-readable description.`, count: warned });
    })();

    // 3. Links — empty & generic
    (function(){
      const links = Array.from(document.querySelectorAll('a')).filter(e => !widgetEl.contains(e));
      let fixed=0, warned=0;
      links.forEach(link => {
        const txt = link.textContent.trim();
        const aria = link.getAttribute('aria-label')||link.getAttribute('title');
        if (!txt && !aria && !link.querySelector('img[alt]')) {
          link.setAttribute('aria-label', link.getAttribute('href') || 'link');
          fixed++;
        } else if (['click here','read more','here','more','link','details','learn more'].includes(txt.toLowerCase())) warned++;
      });
      if (fixed)  issues.push({ type:'fixed',   icon:'🔗', title:'Empty Links Labelled',     desc:`Added aria-label to ${fixed} anchor(s) with no visible text.`, count: fixed });
      if (warned) issues.push({ type:'warning', icon:'🔗', title:'Vague Link Text',           desc:`${warned} link(s) use non-descriptive text. Screen readers read links in isolation — use meaningful phrases.`, count: warned });
    })();

    // 4. Buttons — no accessible name
    (function(){
      const btns = Array.from(document.querySelectorAll('button,input[type=submit],input[type=button],input[type=reset]')).filter(e => !widgetEl.contains(e));
      let fixed=0;
      btns.forEach(btn => {
        const txt = (btn.textContent||'').trim();
        const val = btn.getAttribute('value');
        const aria = btn.getAttribute('aria-label')||btn.getAttribute('title');
        if (!txt && !val && !aria) {
          const t = btn.querySelector('svg title');
          btn.setAttribute('aria-label', t ? t.textContent : 'button');
          fixed++;
        }
      });
      if (fixed) issues.push({ type:'fixed', icon:'🔘', title:'Unlabelled Buttons Fixed', desc:`Added aria-label to ${fixed} button(s) that had no accessible name.`, count: fixed });
    })();

    // 5. Inputs — no label
    (function(){
      const inputs = Array.from(document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]),select,textarea')).filter(e => !widgetEl.contains(e));
      let fixed=0, warned=0;
      inputs.forEach(inp => {
        const lbl = inp.id ? document.querySelector(`label[for="${inp.id}"]`) : null;
        const aria = inp.getAttribute('aria-label')||inp.getAttribute('aria-labelledby');
        if (!lbl && !aria) {
          inp.setAttribute('aria-label', inp.getAttribute('placeholder')||inp.getAttribute('name')||inp.getAttribute('type')||'field');
          fixed++;
        } else if (lbl && !lbl.textContent.trim()) warned++;
      });
      if (fixed)  issues.push({ type:'fixed',   icon:'📝', title:'Unlabelled Inputs Fixed',  desc:`Assigned aria-label to ${fixed} form control(s) missing a programmatic label.`, count: fixed });
      if (warned) issues.push({ type:'warning', icon:'📝', title:'Empty Label Elements',     desc:`${warned} <label>(s) contain no text. Add meaningful content inside each label.`, count: warned });
    })();

    // 6. Skip link
    (function(){
      if (!document.querySelector('[data-acc-skip],[href="#main"],[href="#content"],[href="#main-content"],.skip-link,.skip-nav')) {
        const main = document.querySelector('main,[role=main],#main,#content,#main-content');
        if (main) {
          if (!main.id) main.id = 'acc-main';
          const skip = document.createElement('a');
          skip.href = '#' + main.id;
          skip.textContent = 'Skip to main content';
          skip.setAttribute('data-acc-skip','1');
          Object.assign(skip.style, { position:'absolute', top:'-999px', left:'0', zIndex:'9999999', background:'#0f1117', color:'#4f8ef7', padding:'8px 18px', borderRadius:'0 0 10px 0', fontFamily:'sans-serif', fontSize:'14px', textDecoration:'none', fontWeight:'600' });
          skip.addEventListener('focus', () => skip.style.top = '0');
          skip.addEventListener('blur',  () => skip.style.top = '-999px');
          document.body.insertBefore(skip, document.body.firstChild);
          issues.push({ type:'fixed', icon:'⏭', title:'Skip Navigation Added', desc:'Injected a "Skip to main content" link. Keyboard users can now bypass navigation with one Tab press.' });
        }
      }
    })();

    // 7. Landmarks
    if (!document.querySelector('main,[role=main]'))           issues.push({ type:'warning', icon:'🗺', title:'No <main> Landmark',      desc:'Add a <main> element around your primary content for screen reader landmark navigation.' });
    if (!document.querySelector('nav,[role=navigation]'))      issues.push({ type:'warning', icon:'🗺', title:'No <nav> Landmark',        desc:'Wrap navigation menus in a <nav> element so screen reader users can jump to them directly.' });

    // 8. Headings
    (function(){
      const hds = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(h => !widgetEl.contains(h));
      const h1s = hds.filter(h => h.tagName==='H1');
      let skipped = 0;
      for (let i=1;i<hds.length;i++) if (parseInt(hds[i].tagName[1]) - parseInt(hds[i-1].tagName[1]) > 1) skipped++;
      if (!h1s.length)    issues.push({ type:'warning', icon:'📋', title:'No H1 Heading',            desc:'Every page needs exactly one <h1> as its primary title.' });
      if (h1s.length > 1) issues.push({ type:'warning', icon:'📋', title:'Multiple H1s',             desc:`Found ${h1s.length} H1 elements. A page should have only one.`, count: h1s.length });
      if (skipped)        issues.push({ type:'warning', icon:'📋', title:'Heading Levels Skipped',   desc:`${skipped} place(s) where heading levels jump non-sequentially (e.g. H2→H4).`, count: skipped });
    })();

    // 9. iframes
    (function(){
      const frames = Array.from(document.querySelectorAll('iframe')).filter(e => !widgetEl.contains(e));
      let fixed=0;
      frames.forEach(f => { if (!f.getAttribute('title')&&!f.getAttribute('aria-label')) { f.setAttribute('title','Embedded content'); fixed++; }});
      if (fixed) issues.push({ type:'fixed', icon:'🖥', title:'iFrames Titled', desc:`Added title to ${fixed} iframe(s). Screen readers will now announce the embedded content.`, count: fixed });
    })();

    // 10. Tables
    (function(){
      const bad = Array.from(document.querySelectorAll('table')).filter(t => !widgetEl.contains(t) && (!t.querySelector('th')||!t.querySelector('caption'))).length;
      if (bad) issues.push({ type:'warning', icon:'📊', title:'Tables Missing Semantics', desc:`${bad} table(s) lack <th> headers or <caption>. These help screen readers interpret tabular data.`, count: bad });
    })();

    // 11. Autoplay media
    (function(){
      const media = Array.from(document.querySelectorAll('video[autoplay],audio[autoplay]')).filter(e => !widgetEl.contains(e));
      let fixed=0;
      media.forEach(m => { if (!m.muted) { m.muted=true; fixed++; }});
      if (fixed) issues.push({ type:'fixed', icon:'🔇', title:'Autoplay Media Muted', desc:`Muted ${fixed} auto-playing media element(s). Unexpected audio confuses screen reader users.`, count: fixed });
    })();

    // 12. tabindex > 0
    (function(){
      const bad = Array.from(document.querySelectorAll('[tabindex]')).filter(e => !widgetEl.contains(e) && parseInt(e.getAttribute('tabindex'))>0).length;
      if (bad) issues.push({ type:'warning', icon:'⌨', title:'Positive tabindex Values', desc:`${bad} element(s) use tabindex > 0, disrupting the natural keyboard focus order.`, count: bad });
    })();

    // 13. target=_blank security + notice
    (function(){
      const links = Array.from(document.querySelectorAll('a[target=_blank]')).filter(e => !widgetEl.contains(e));
      let fixed=0;
      links.forEach(a => {
        const rel = a.getAttribute('rel')||'';
        if (!rel.includes('noopener')) { a.setAttribute('rel','noopener noreferrer'); }
        const lbl = a.getAttribute('aria-label')||a.textContent.trim();
        if (lbl && !lbl.includes('new tab')) a.setAttribute('aria-label', lbl + ' (opens in new tab)');
        fixed++;
      });
      if (fixed) issues.push({ type:'fixed', icon:'🔒', title:'External Links Secured', desc:`Applied rel="noopener noreferrer" and "opens in new tab" notice to ${fixed} link(s).`, count: fixed });
    })();

    // 14. Missing meta viewport
    (function(){
      const vp = document.querySelector('meta[name=viewport]');
      if (!vp) {
        const m = document.createElement('meta');
        m.name='viewport'; m.content='width=device-width,initial-scale=1';
        document.head.appendChild(m);
        issues.push({ type:'fixed', icon:'📱', title:'Viewport Meta Added', desc:'Injected <meta name="viewport"> for correct scaling on mobile devices.' });
      }
    })();

    // 15. Low-contrast text (spot check — visible text nodes)
    (function(){
      let warned = 0;
      const els = Array.from(document.querySelectorAll('p,span,li,h1,h2,h3,h4,h5,h6,a,button,label')).filter(e => !widgetEl.contains(e) && e.textContent.trim());
      els.slice(0,60).forEach(el => {
        try {
          const cs = getComputedStyle(el);
          const fgMatch = cs.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          const bgMatch = cs.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (!fgMatch || !bgMatch) return;
          const lum = (r,g,b) => { const t=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);}; return .2126*t(r)+.7152*t(g)+.0722*t(b); };
          const l1 = lum(+fgMatch[1],+fgMatch[2],+fgMatch[3]);
          const l2 = lum(+bgMatch[1],+bgMatch[2],+bgMatch[3]);
          const ratio = (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
          const bg = cs.backgroundColor;
          if (bg !== 'rgba(0, 0, 0, 0)' && ratio < 4.5) warned++;
        } catch(e) {}
      });
      if (warned) issues.push({ type:'warning', icon:'🎨', title:'Potential Low Contrast Text', desc:`~${warned} text element(s) may fail WCAG AA contrast ratio (4.5:1). Review with a colour contrast checker.`, count: warned });
    })();

    // ── Compute score & render ──────────────
    const nFixed = issues.filter(i=>i.type==='fixed').length;
    const nWarn  = issues.filter(i=>i.type==='warning').length;
    const nErr   = issues.filter(i=>i.type==='error').length;
    const score  = Math.max(0, Math.round(100 - nWarn*7 - nErr*14));

    document.getElementById('acc-score').textContent = score;
    document.getElementById('acc-n-fixed').textContent = nFixed;
    document.getElementById('acc-n-warn').textContent  = nWarn;
    document.getElementById('acc-n-err').textContent   = nErr;

    const scanBtn = document.getElementById('acc-scan');
    scanBtn.innerHTML = '✓ Scan Complete — Scan Again';
    scanBtn.disabled = false;
    document.getElementById('acc-dl-now').disabled = false;

    const list = document.getElementById('acc-issues');
    if (!issues.length) {
      list.innerHTML = '<div style="text-align:center;color:#38d9a9;font-size:.88rem;padding:24px 0;line-height:1.6;">🎉 Excellent! No issues found on this page.</div>';
    } else {
      const order = { fixed:0, warning:1, error:2 };
      issues.sort((a,b) => order[a.type]-order[b.type]);
      list.innerHTML = issues.map(issue => `
        <div class="acc-issue ${issue.type}">
          <div class="acc-issue-head">
            <div class="acc-issue-title">${issue.icon} ${issue.title}</div>
            <span class="acc-badge ${issue.type}">${issue.type==='fixed'?'Fixed':issue.type==='warning'?'Warn':'Critical'}</span>
          </div>
          <div class="acc-issue-desc">${issue.desc}</div>
          ${issue.count&&issue.count>1?`<div class="acc-issue-cnt">Affected: ${issue.count} element(s)</div>`:''}
        </div>
      `).join('');
    }

    // Store in history
    const record = {
      date: new Date().toLocaleString(),
      score, nFixed, nWarn, nErr,
      issues: JSON.parse(JSON.stringify(issues))
    };
    lastAudit = record;
    auditHistory.unshift(record);
    if (auditHistory.length > 20) auditHistory.length = 20;
    renderHistory();
    return record;
  }

  // ── Render history tab ──────────────────────
  function renderHistory() {
    const empty = document.getElementById('acc-hist-empty');
    const list  = document.getElementById('acc-hist-list');
    if (!auditHistory.length) { empty.style.display=''; list.innerHTML=''; return; }
    empty.style.display = 'none';
    list.innerHTML = auditHistory.map((r, idx) => `
      <div class="acc-hist-card">
        <div class="acc-hist-top">
          <div class="acc-hist-date">${r.date}</div>
          <div class="acc-hist-score">${r.score}/100</div>
        </div>
        <div class="acc-hist-pills">
          <span class="acc-hist-pill g">${r.nFixed} Fixed</span>
          <span class="acc-hist-pill y">${r.nWarn} Warnings</span>
          <span class="acc-hist-pill r">${r.nErr} Critical</span>
        </div>
        <button class="acc-hist-dl" data-idx="${idx}">↓ Download this report</button>
      </div>
    `).join('');
    list.querySelectorAll('.acc-hist-dl').forEach(btn => {
      btn.addEventListener('click', () => downloadReport(auditHistory[+btn.dataset.idx]));
    });
  }

  // ── Download audit report as HTML ──────────
  function downloadReport(record) {
    const now = record.date;
    const rows = record.issues.map(i => `
      <tr class="${i.type}">
        <td>${i.icon} ${i.title}</td>
        <td><span class="badge ${i.type}">${i.type==='fixed'?'Auto-Fixed':i.type==='warning'?'Warning':'Critical'}</span></td>
        <td>${i.desc}</td>
        <td>${i.count||1}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ACC Accessibility Audit Report — ${now}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; background: #f4f5f7; color: #1a1a1a; margin: 0; padding: 40px; }
  .report { max-width: 860px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.1); }
  .rhead { background: linear-gradient(135deg, #0f1117, #1a2040); color: #fff; padding: 28px 32px; display: flex; align-items: center; gap: 16px; }
  .rhead img { width: 52px; height: 52px; object-fit: contain; }
  .rhead h1 { font-size: 1.2rem; margin: 0; font-weight: 700; letter-spacing: .04em; }
  .rhead p  { font-size: .78rem; color: #a0aec0; margin: 3px 0 0; }
  .rscore { display: flex; align-items: center; gap: 32px; padding: 24px 32px; background: #f8f9fc; border-bottom: 1px solid #e5e7eb; }
  .score-big { font-size: 3rem; font-weight: 800; color: #1a1a2e; font-variant-numeric: tabular-nums; }
  .score-lbl { font-size: .75rem; color: #6b7280; text-transform: uppercase; letter-spacing: .1em; }
  .pills { display: flex; gap: 10px; flex-wrap: wrap; margin-left: auto; }
  .pill { padding: 6px 14px; border-radius: 8px; font-size: .8rem; font-weight: 600; }
  .pill.g { background: #d1fae5; color: #065f46; }
  .pill.y { background: #fef3c7; color: #92400e; }
  .pill.r { background: #fee2e2; color: #991b1b; }
  .rtable { width: 100%; }
  .rtable th { background: #f1f3f9; padding: 12px 16px; font-size: .78rem; letter-spacing: .06em; text-transform: uppercase; color: #6b7280; text-align: left; border-bottom: 1px solid #e5e7eb; }
  .rtable td { padding: 12px 16px; font-size: .85rem; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  tr.fixed   td:first-child { border-left: 3px solid #10b981; }
  tr.warning td:first-child { border-left: 3px solid #f59e0b; }
  tr.error   td:first-child { border-left: 3px solid #ef4444; }
  .badge { padding: 2px 8px; border-radius: 6px; font-size: .7rem; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
  .badge.fixed   { background: #d1fae5; color: #065f46; }
  .badge.warning { background: #fef3c7; color: #92400e; }
  .badge.error   { background: #fee2e2; color: #991b1b; }
  .rfooter { padding: 16px 32px; font-size: .72rem; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; }
  .meta-row { padding: 12px 32px; font-size: .78rem; color: #6b7280; background: #fff; border-bottom: 1px solid #e5e7eb; }
</style>
</head>
<body>
<div class="report">
  <div class="rhead">
    <img src="${ACC_LOGO}" alt="ACC" />
    <div>
      <h1>ACC Accessibility Audit Report</h1>
      <p>Auto AI Engine &mdash; Generated ${now}</p>
    </div>
  </div>
  <div class="meta-row">🌐 Page: <strong>${window.location.href}</strong></div>
  <div class="rscore">
    <div><div class="score-big">${record.score}</div><div class="score-lbl">out of 100</div></div>
    <div class="pills">
      <span class="pill g">✓ ${record.nFixed} Auto-Fixed</span>
      <span class="pill y">⚠ ${record.nWarn} Warnings</span>
      <span class="pill r">✕ ${record.nErr} Critical</span>
    </div>
  </div>
  <table class="rtable">
    <thead><tr><th>Issue</th><th>Status</th><th>Description</th><th>#</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="rfooter">ACC Accessibility Widget &mdash; Auto AI Engine &mdash; Report generated ${now}</div>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type:'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `ACC-Audit-${new Date().toISOString().slice(0,10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Wire scan button ──────────────────────
  document.getElementById('acc-scan').addEventListener('click', () => {
    const btn = document.getElementById('acc-scan');
    btn.innerHTML = '⏳ Scanning…';
    btn.disabled = true;
    setTimeout(runScan, 150);
  });

  document.getElementById('acc-dl-now').addEventListener('click', () => {
    if (lastAudit) downloadReport(lastAudit);
  });

})();
