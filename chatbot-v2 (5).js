(function () {
  const WORKER_URL = "https://brandmycareer.hassanmustapha216000.workers.dev/";

  const widgetHTML = `
  <style>
    :root {
      --bmc-accent: #2563eb;
      --bmc-accent-soft: rgba(37, 99, 235, 0.22);
      --bmc-bg: #ffffff;
      --bmc-bubble-bot: #f3f4f6;
      --bmc-text: #111827;
      --bmc-muted: #6b7280;
      --bmc-border: #e5e7eb;
    }

    /* Bottom-Left Floating Bubble */
    #bmc-chat-launcher {
      position: fixed; bottom: 24px; left: 24px; width: 60px; height: 60px;
      border-radius: 50%; background: var(--bmc-accent); color: #fff; border: none;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25); cursor: pointer; z-index: 9999;
      display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease;
    }
    #bmc-chat-launcher:hover { transform: scale(1.06); }

    /* Larger Modern Chat Window */
    #bmc-chat-window {
      position: fixed; bottom: 96px; left: 24px; width: 420px; max-width: calc(100vw - 32px);
      height: 620px; max-height: calc(100vh - 115px); background: var(--bmc-bg);
      border: 1px solid var(--bmc-border); border-radius: 20px;
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18); display: none;
      flex-direction: column; overflow: hidden; z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: width 0.25s ease, height 0.25s ease;
    }
    #bmc-chat-window.open { display: flex; }
    #bmc-chat-window.expanded { width: 660px; height: 740px; }

    /* Header */
    .bmc-header {
      background: #ffffff; padding: 14px 16px; border-bottom: 1px solid var(--bmc-border);
      display: flex; align-items: center; justify-content: space-between; position: relative;
    }
    .bmc-header-left { display: flex; align-items: center; gap: 11px; }
    .bmc-avatar {
      width: 40px; height: 40px; border-radius: 10px; background: #111827; color: #ffffff;
      display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;
    }
    .bmc-title h4 { margin: 0; font-size: 15px; font-weight: 700; color: var(--bmc-text); }
    .bmc-title span { font-size: 12px; color: var(--bmc-muted); display: block; margin-top: 1px; }
    .bmc-title span.offline { color: #dc2626; font-weight: 500; }
    .bmc-header-actions { display: flex; align-items: center; gap: 4px; }
    .bmc-icon-btn {
      background: transparent; border: none; color: var(--bmc-muted); width: 34px; height: 34px;
      border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 17px;
      transition: background 0.15s, color 0.15s;
    }
    .bmc-icon-btn:hover { background: #f3f4f6; color: var(--bmc-text); }
    .bmc-call-header-btn { color: #16a34a; }
    .bmc-call-header-btn:hover { background: #dcfce7; color: #15803d; }

    /* Three-Dot Menu */
    #bmc-menu-dropdown {
      position: absolute; top: 58px; right: 16px; width: 215px; background: #ffffff;
      border: 1px solid var(--bmc-border); border-radius: 14px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14); padding: 6px; display: none; flex-direction: column; z-index: 10001;
    }
    #bmc-menu-dropdown.show { display: flex; }
    .bmc-menu-item {
      background: transparent; border: none; padding: 10px 12px; border-radius: 10px;
      display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: var(--bmc-text); cursor: pointer; text-align: left;
    }
    .bmc-menu-item:hover { background: #f3f4f6; }

    /* Search Bar */
    #bmc-search-bar {
      display: none; padding: 8px 16px; background: #f9fafb; border-bottom: 1px solid var(--bmc-border); gap: 8px; align-items: center;
    }
    #bmc-search-bar.show { display: flex; }
    #bmc-search-input { flex: 1; border: 1px solid var(--bmc-border); border-radius: 8px; padding: 6px 10px; font-size: 13px; outline: none; }

    /* Live Voice Call Overlay */
    #bmc-call-overlay {
      position: absolute; inset: 0; z-index: 10005; display: none; flex-direction: column;
      align-items: center; justify-content: space-between; text-align: center; color: #ffffff;
      padding: 34px 22px 30px; box-sizing: border-box;
      background: radial-gradient(120% 80% at 50% 28%, #1e3a8a 0%, #0f172a 62%, #070b16 100%);
    }
    #bmc-call-overlay.active { display: flex; }
    .bmc-call-top { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .bmc-call-name { font-size: 18px; font-weight: 700; letter-spacing: 0.2px; }
    .bmc-call-status { font-size: 15px; color: #bfdbfe; min-height: 20px; }
    .bmc-call-time { font-size: 12.5px; color: #94a3b8; font-variant-numeric: tabular-nums; }
    .bmc-call-stage { display: flex; flex-direction: column; align-items: center; gap: 22px; }
    .bmc-orb {
      position: relative; width: 132px; height: 132px; border-radius: 50%; border: none; padding: 0;
      background: transparent; cursor: pointer; -webkit-tap-highlight-color: transparent;
    }
    .bmc-orb-core {
      position: absolute; inset: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 34px; font-weight: 800; color: #ffffff; letter-spacing: 1px;
      background: radial-gradient(circle at 32% 28%, #60a5fa 0%, #2563eb 55%, #1d4ed8 100%);
      box-shadow: 0 10px 40px rgba(37, 99, 235, 0.55);
      transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
    }
    .bmc-orb-ring {
      position: absolute; inset: -10px; border-radius: 50%; border: 3px solid rgba(96, 165, 250, 0.55); opacity: 0;
    }
    #bmc-call-overlay[data-state="listening"] .bmc-orb-ring { animation: bmcRing 1.9s ease-out infinite; }
    #bmc-call-overlay[data-state="listening"] .bmc-orb-ring.r2 { animation-delay: 0.95s; }
    #bmc-call-overlay[data-state="listening"] .bmc-orb-core { animation: bmcBreathe 2.2s ease-in-out infinite; }
    #bmc-call-overlay[data-state="thinking"] .bmc-orb-ring.r1 {
      opacity: 1; border-color: transparent; border-top-color: #93c5fd; animation: bmcSpin 0.9s linear infinite;
    }
    #bmc-call-overlay[data-state="speaking"] .bmc-orb-core {
      animation: bmcBreathe 0.9s ease-in-out infinite;
      background: radial-gradient(circle at 32% 28%, #86efac 0%, #16a34a 55%, #15803d 100%);
      box-shadow: 0 10px 40px rgba(22, 163, 74, 0.55);
    }
    #bmc-call-overlay[data-state="muted"] .bmc-orb-core,
    #bmc-call-overlay[data-state="idle"] .bmc-orb-core {
      background: radial-gradient(circle at 32% 28%, #64748b 0%, #475569 60%, #334155 100%);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.6);
    }
    @keyframes bmcRing { 0% { transform: scale(0.92); opacity: 0.75; } 100% { transform: scale(1.55); opacity: 0; } }
    @keyframes bmcBreathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
    @keyframes bmcSpin { to { transform: rotate(360deg); } }
    .bmc-wave { height: 26px; display: flex; align-items: center; gap: 5px; visibility: hidden; }
    #bmc-call-overlay[data-state="speaking"] .bmc-wave { visibility: visible; }
    .bmc-wave span { width: 5px; height: 8px; border-radius: 3px; background: #86efac; animation: bmcBar 0.8s ease-in-out infinite; }
    .bmc-wave span:nth-child(2) { animation-delay: 0.12s; }
    .bmc-wave span:nth-child(3) { animation-delay: 0.24s; }
    .bmc-wave span:nth-child(4) { animation-delay: 0.36s; }
    .bmc-wave span:nth-child(5) { animation-delay: 0.48s; }
    @keyframes bmcBar { 0%, 100% { height: 6px; } 50% { height: 24px; } }
    .bmc-call-captions { width: 100%; max-width: 330px; display: flex; flex-direction: column; gap: 10px; min-height: 96px; }
    .bmc-cap-user { font-size: 14px; color: #93c5fd; font-style: italic; min-height: 18px; word-wrap: break-word; }
    .bmc-cap-ai { font-size: 15px; line-height: 1.5; color: #f1f5f9; max-height: 112px; overflow-y: auto; word-wrap: break-word; }
    .bmc-call-hint { font-size: 12px; color: #64748b; margin-bottom: 4px; }
    .bmc-call-controls { display: flex; gap: 26px; align-items: center; justify-content: center; }
    .bmc-call-ctrl-btn {
      width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; padding: 0;
      display: flex; align-items: center; justify-content: center; transition: transform 0.15s, background 0.2s;
    }
    .bmc-call-ctrl-btn:active { transform: scale(0.94); }
    #bmc-mute-btn { background: rgba(255, 255, 255, 0.16); color: #ffffff; }
    #bmc-mute-btn.muted { background: #f59e0b; color: #111827; }
    #bmc-mute-btn .bmc-slash { display: none; }
    #bmc-mute-btn.muted .bmc-slash { display: block; }
    #bmc-end-call-btn { background: #ef4444; color: #ffffff; }
    #bmc-end-call-btn svg { transform: rotate(135deg); }

    /* Messages Feed */
    #bmc-messages { flex: 1; padding: 18px; overflow-y: auto; background: #ffffff; display: flex; flex-direction: column; gap: 14px; }
    .bmc-intro-note { text-align: center; font-size: 12.5px; color: var(--bmc-muted); margin-bottom: 4px; }
    .bmc-msg-group { display: flex; flex-direction: column; max-width: 84%; }
    .bmc-msg-group.bot { align-self: flex-start; }
    .bmc-msg-group.user { align-self: flex-end; align-items: flex-end; }
    .bmc-msg { padding: 12px 15px; border-radius: 16px; font-size: 14.5px; line-height: 1.5; word-wrap: break-word; }
    .bmc-msg-group.bot .bmc-msg { background: var(--bmc-bubble-bot); color: var(--bmc-text); border-bottom-left-radius: 4px; }
    .bmc-msg-group.user .bmc-msg { background: var(--bmc-accent); color: #ffffff; border-bottom-right-radius: 4px; }
    .bmc-meta { font-size: 11.5px; color: var(--bmc-muted); margin-top: 5px; padding: 0 2px; }
    .bmc-msg img.bmc-chat-img { max-width: 100%; border-radius: 10px; margin-top: 6px; display: block; }
    .bmc-file-badge {
      display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.2);
      padding: 5px 10px; border-radius: 8px; font-size: 12.5px; margin-top: 4px;
    }

    /* Quick Chips */
    .bmc-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 16px 8px; background: #ffffff; }
    .bmc-chip {
      background: #f9fafb; border: 1px solid var(--bmc-border); color: var(--bmc-text);
      border-radius: 999px; padding: 6px 12px; font-size: 12.5px; font-weight: 500; cursor: pointer;
    }
    .bmc-chip:hover { border-color: var(--bmc-accent); color: var(--bmc-accent); background: #eff6ff; }

    /* Attachment Preview Bar */
    #bmc-attachment-preview {
      display: none; align-items: center; justify-content: space-between;
      background: #f1f5f9; border-radius: 10px; padding: 6px 10px; margin-bottom: 6px;
      font-size: 12.5px; color: var(--bmc-text);
    }
    #bmc-attachment-preview.show { display: flex; }
    #bmc-remove-file { background: none; border: none; color: #ef4444; font-weight: bold; cursor: pointer; font-size: 16px; }

    /* Input Box */
    .bmc-input-wrapper { padding: 10px 16px 16px; background: #ffffff; }
    .bmc-input-box {
      border: 1.5px solid var(--bmc-accent); box-shadow: 0 0 0 3px var(--bmc-accent-soft);
      border-radius: 16px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; background: #ffffff;
    }
    #bmc-input {
      width: 100%; border: none; outline: none; font-size: 14.5px; font-family: inherit;
      resize: none; color: var(--bmc-text); min-height: 38px; max-height: 110px;
    }
    .bmc-input-footer { display: flex; align-items: center; justify-content: space-between; }
    .bmc-tool-row { display: flex; align-items: center; gap: 4px; }
    .bmc-tool-btn {
      background: transparent; border: none; cursor: pointer; color: var(--bmc-muted);
      width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    .bmc-tool-btn:hover { background: #f3f4f6; color: var(--bmc-text); }
    #bmc-send-btn {
      width: 34px; height: 34px; border-radius: 50%; border: none; background: var(--bmc-accent);
      color: #ffffff; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform 0.15s, background 0.15s;
    }
    #bmc-send-btn:hover { transform: scale(1.06); }

    /* ---- Isolation fixes: stop the website's own form/input/button styles
       (booking form CSS) from leaking into the chatbot ---- */
    #bmc-chat-window form#bmc-form {
      max-width: none; width: 100%; margin: 0; padding: 10px 16px 16px;
      background: #ffffff; border: none; border-radius: 0; box-shadow: none;
      box-sizing: border-box;
    }
    #bmc-chat-window form#bmc-form .bmc-input-box {
      box-sizing: border-box; width: 100%; margin: 0; padding: 10px 12px;
      background: #ffffff; border: 1.5px solid var(--bmc-accent);
      border-radius: 16px; box-shadow: 0 0 0 3px var(--bmc-accent-soft);
    }
    #bmc-chat-window form#bmc-form textarea#bmc-input {
      display: block; box-sizing: border-box; width: 100%; margin: 0; padding: 6px 4px;
      min-height: 40px; max-height: 110px; background: transparent; border: none;
      border-radius: 0; box-shadow: none; outline: none; color: #111827;
      font-size: 15px; line-height: 1.4; resize: none;
    }
    #bmc-chat-window form#bmc-form textarea#bmc-input:focus {
      background: transparent; border: none; box-shadow: none; outline: none;
    }
    #bmc-chat-window form#bmc-form textarea#bmc-input::placeholder { color: #9ca3af; opacity: 1; }
    #bmc-chat-window form#bmc-form .bmc-input-footer {
      display: flex; align-items: center; justify-content: space-between; margin: 0; padding: 0;
    }
    #bmc-chat-window form#bmc-form .bmc-tool-row { display: flex; align-items: center; gap: 4px; margin: 0; }
    #bmc-chat-window form#bmc-form button.bmc-tool-btn {
      display: flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; min-width: 36px; margin: 0; padding: 0;
      background: transparent; border: none; border-radius: 10px;
      color: #4b5563; font-size: 14px; font-weight: normal; box-shadow: none;
    }
    #bmc-chat-window form#bmc-form button.bmc-tool-btn:hover { background: #f3f4f6; color: #111827; }
    #bmc-chat-window form#bmc-form button.bmc-tool-btn svg { display: block; width: 20px; height: 20px; }
    #bmc-chat-window form#bmc-form button#bmc-send-btn {
      display: flex; align-items: center; justify-content: center;
      width: 38px; height: 38px; min-width: 38px; margin: 0; padding: 0;
      background: var(--bmc-accent); color: #ffffff; border: none; border-radius: 50%;
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35); font-size: 14px; font-weight: normal;
    }
    #bmc-chat-window form#bmc-form button#bmc-send-btn:hover { background: #1d4ed8; transform: scale(1.06); }
    #bmc-chat-window form#bmc-form button#bmc-send-btn svg { display: block; width: 18px; height: 18px; }
    #bmc-chat-window form#bmc-form #bmc-attachment-preview {
      box-sizing: border-box; width: 100%; margin: 0 0 6px; padding: 6px 10px;
    }
    #bmc-chat-window form#bmc-form button#bmc-remove-file {
      display: block; width: auto; margin: 0; padding: 0 4px; background: none;
      border: none; color: #ef4444; font-size: 18px;
    }
    #bmc-chat-window input#bmc-search-input {
      box-sizing: border-box; width: auto; flex: 1; margin: 0; padding: 6px 10px;
      background: #ffffff; color: #111827; border: 1px solid var(--bmc-border);
      border-radius: 8px; box-shadow: none; font-size: 13px;
    }
    #bmc-chat-window form#bmc-form button.bmc-tool-btn.listening {
      background: #fee2e2; color: #dc2626; animation: bmcMicPulse 1.2s ease-in-out infinite;
    }
    @keyframes bmcMicPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.35); } 50% { box-shadow: 0 0 0 7px rgba(220, 38, 38, 0); } }
  </style>

  <!-- Bottom-Left Launcher -->
  <button id="bmc-chat-launcher" aria-label="Open BrandMyCareer Assistant">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </button>

  <!-- Chat Window -->
  <div id="bmc-chat-window">
    <!-- Voice Call Overlay -->
    <div id="bmc-call-overlay" data-state="idle">
      <div class="bmc-call-top">
        <div class="bmc-call-name">BrandMyCareer AI</div>
        <div class="bmc-call-status" id="bmc-call-status">Connecting...</div>
        <div class="bmc-call-time" id="bmc-call-timer">00:00</div>
      </div>
      <div class="bmc-call-stage">
        <button type="button" class="bmc-orb" id="bmc-orb" aria-label="Tap to talk or interrupt">
          <span class="bmc-orb-ring r1"></span>
          <span class="bmc-orb-ring r2"></span>
          <span class="bmc-orb-core">HM</span>
        </button>
        <div class="bmc-wave"><span></span><span></span><span></span><span></span><span></span></div>
      </div>
      <div class="bmc-call-captions">
        <div class="bmc-cap-user" id="bmc-call-user-text"></div>
        <div class="bmc-cap-ai" id="bmc-call-ai-text"></div>
      </div>
      <div>
        <div class="bmc-call-hint">Tap the circle to interrupt or start talking</div>
        <div class="bmc-call-controls">
          <button type="button" class="bmc-call-ctrl-btn" id="bmc-mute-btn" title="Mute / Unmute" aria-label="Mute microphone">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line class="bmc-slash" x1="3" y1="3" x2="21" y2="21"></line>
            </svg>
          </button>
          <button type="button" class="bmc-call-ctrl-btn" id="bmc-end-call-btn" title="End call" aria-label="End call">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="bmc-header">
      <div class="bmc-header-left">
        <div class="bmc-avatar">HM</div>
        <div class="bmc-title">
          <h4>BrandMyCareer AI</h4>
          <span id="bmc-status-text">Hassan can also help</span>
        </div>
      </div>
      <div class="bmc-header-actions">
        <button class="bmc-icon-btn bmc-call-header-btn" id="bmc-start-call-top" title="Voice Call AI Agent" aria-label="Voice Call">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        </button>
        <button class="bmc-icon-btn" id="bmc-menu-btn" aria-label="More options">•••</button>
        <button class="bmc-icon-btn" id="bmc-close-btn" aria-label="Close chat">&times;</button>
      </div>
      <div id="bmc-menu-dropdown">
        <button class="bmc-menu-item" id="bmc-expand-opt"><span>⤢</span> <span id="bmc-expand-label">Expand window</span></button>
        <button class="bmc-menu-item" id="bmc-search-opt"><span>🔍</span> <span>Search conversation</span></button>
        <button class="bmc-menu-item" id="bmc-download-opt"><span>⬇</span> <span>Download transcript</span></button>
      </div>
    </div>

    <!-- Search Bar -->
    <div id="bmc-search-bar">
      <input type="text" id="bmc-search-input" placeholder="Search messages..." />
      <button class="bmc-icon-btn" id="bmc-search-close" style="width:26px;height:26px;font-size:15px;">&times;</button>
    </div>

    <!-- Messages -->
    <div id="bmc-messages">
      <div class="bmc-intro-note">Ask anything, upload your CV, or start a voice call.</div>
      <div class="bmc-msg-group bot">
        <div class="bmc-msg">
          Hey, I'm BrandMyCareer AI 👋<br><br>
          Ask me anything about ATS CV revamps, cover letters, LinkedIn makeovers, or upload your current CV/screenshot for review.
        </div>
        <div class="bmc-meta">BrandMyCareer AI • Just now</div>
      </div>
    </div>

    <!-- Quick Chips -->
    <div class="bmc-chips">
      <button class="bmc-chip" data-q="What are your packages and prices?">Packages & Pricing</button>
      <button class="bmc-chip" data-q="How long does delivery take?">Turnaround Time</button>
      <button class="bmc-chip" data-q="I don't have an existing CV">No Existing CV?</button>
    </div>

    <!-- Input Box with Attach, Call & Send Arrow -->
    <form class="bmc-input-wrapper" id="bmc-form">
      <div class="bmc-input-box">
        <div id="bmc-attachment-preview">
          <span id="bmc-file-name"></span>
          <button type="button" id="bmc-remove-file" title="Remove file">&times;</button>
        </div>
        <textarea id="bmc-input" placeholder="Message or upload CV/image..." rows="1"></textarea>
        <input type="file" id="bmc-file-input" accept="image/*,.pdf,.doc,.docx,.txt" style="display:none;" />
        <div class="bmc-input-footer">
          <div class="bmc-tool-row">
            <!-- Attach File / Picture -->
            <button type="button" class="bmc-tool-btn" id="bmc-attach-btn" title="Attach image or CV file">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <!-- Attach Picture Shortcut -->
            <button type="button" class="bmc-tool-btn" id="bmc-image-btn" title="Upload picture">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
            <!-- Voice Typing (speech to text) -->
            <button type="button" class="bmc-tool-btn" id="bmc-mic-btn" title="Speak to type" aria-label="Voice typing">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
          </div>

          <!-- Clean Arrow Send Icon -->
          <button type="submit" id="bmc-send-btn" aria-label="Send message" title="Send">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </form>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", widgetHTML);

  const launcher = document.getElementById("bmc-chat-launcher");
  const chatWindow = document.getElementById("bmc-chat-window");
  const closeBtn = document.getElementById("bmc-close-btn");
  const statusText = document.getElementById("bmc-status-text");
  const menuBtn = document.getElementById("bmc-menu-btn");
  const menuDropdown = document.getElementById("bmc-menu-dropdown");
  const expandOpt = document.getElementById("bmc-expand-opt");
  const expandLabel = document.getElementById("bmc-expand-label");
  const searchOpt = document.getElementById("bmc-search-opt");
  const searchBar = document.getElementById("bmc-search-bar");
  const searchInput = document.getElementById("bmc-search-input");
  const searchClose = document.getElementById("bmc-search-close");
  const downloadOpt = document.getElementById("bmc-download-opt");
  const form = document.getElementById("bmc-form");
  const input = document.getElementById("bmc-input");
  const messages = document.getElementById("bmc-messages");

  // File & Image Attachment Elements
  const fileInput = document.getElementById("bmc-file-input");
  const attachBtn = document.getElementById("bmc-attach-btn");
  const imageBtn = document.getElementById("bmc-image-btn");
  const attachmentPreview = document.getElementById("bmc-attachment-preview");
  const fileNameLabel = document.getElementById("bmc-file-name");
  const removeFileBtn = document.getElementById("bmc-remove-file");
  let selectedFile = null;

  // Voice Elements
  const callOverlay = document.getElementById("bmc-call-overlay");
  const startCallTop = document.getElementById("bmc-start-call-top");
  const micBtn = document.getElementById("bmc-mic-btn");
  const endCallBtn = document.getElementById("bmc-end-call-btn");
  const muteBtn = document.getElementById("bmc-mute-btn");
  const orbBtn = document.getElementById("bmc-orb");
  const callTimer = document.getElementById("bmc-call-timer");
  const callStatus = document.getElementById("bmc-call-status");
  const callUserText = document.getElementById("bmc-call-user-text");
  const callAiText = document.getElementById("bmc-call-ai-text");
  let callInterval = null;
  let callSeconds = 0;
  let isMuted = false;

  // Live Internet Connection Monitor
  function updateConnectionStatus() {
    if (navigator.onLine) {
      statusText.textContent = "Hassan can also help";
      statusText.classList.remove("offline");
    } else {
      statusText.textContent = "Offline — No internet connection";
      statusText.classList.add("offline");
    }
  }
  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);
  updateConnectionStatus();

  launcher.addEventListener("click", () => {
    chatWindow.classList.toggle("open");
    if (chatWindow.classList.contains("open")) input.focus();
  });
  closeBtn.addEventListener("click", () => chatWindow.classList.remove("open"));

  // Menu Actions
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle("show");
  });
  document.addEventListener("click", () => menuDropdown.classList.remove("show"));

  expandOpt.addEventListener("click", () => {
    const isExpanded = chatWindow.classList.toggle("expanded");
    expandLabel.textContent = isExpanded ? "Shrink window" : "Expand window";
  });

  searchOpt.addEventListener("click", () => {
    searchBar.classList.add("show");
    searchInput.focus();
  });
  searchClose.addEventListener("click", () => {
    searchBar.classList.remove("show");
    searchInput.value = "";
    document.querySelectorAll(".bmc-msg-group").forEach(g => g.style.display = "flex");
  });
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    document.querySelectorAll(".bmc-msg-group").forEach(group => {
      const txt = group.innerText.toLowerCase();
      group.style.display = txt.includes(term) ? "flex" : "none";
    });
  });

  downloadOpt.addEventListener("click", () => {
    let lines = ["BrandMyCareer AI — Chat Transcript", "==================================", ""];
    document.querySelectorAll(".bmc-msg-group").forEach(group => {
      const sender = group.classList.contains("user") ? "You" : "BrandMyCareer AI";
      const body = group.querySelector(".bmc-msg").innerText.trim();
      lines.push(`[${sender}]:\n${body}\n`);
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "BrandMyCareer-Chat-Transcript.txt";
    a.click();
  });

  // File / Picture Handling
  attachBtn.addEventListener("click", () => {
    fileInput.accept = "image/*,.pdf,.doc,.docx,.txt";
    fileInput.click();
  });
  imageBtn.addEventListener("click", () => {
    fileInput.accept = "image/*";
    fileInput.click();
  });
  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) {
      selectedFile = fileInput.files[0];
      fileNameLabel.textContent = "📎 " + selectedFile.name;
      attachmentPreview.classList.add("show");
    }
  });
  removeFileBtn.addEventListener("click", () => {
    selectedFile = null;
    fileInput.value = "";
    attachmentPreview.classList.remove("show");
  });

  // ===== Shared helpers =====
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synth = window.speechSynthesis;
  let speechLang = "en-NG"; // Nigerian English. Falls back to en-US automatically if unsupported.
  let chatHistory = []; // { role: "user" | "model", text } so the AI remembers the conversation

  function escapeHtml(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function htmlToSpeech(html) {
    const d = document.createElement("div");
    d.innerHTML = String(html).replace(/<br\s*\/?>/gi, " ");
    let t = (d.textContent || "").trim();
    t = t.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "");
    t = t.replace(/(?:₦|\bN)\s?(\d[\d,]*)/g, "$1 naira");
    t = t.replace(/\$\s?(\d[\d,]*)/g, "$1 dollars");
    t = t.replace(/\s+/g, " ").trim();
    return t;
  }

  // One place that talks to your backend (text chat AND voice call use it)
  async function askBackend(text, file, mode) {
    const fd = new FormData();
    fd.append("message", text);
    if (file) fd.append("file", file);
    fd.append("history", JSON.stringify(chatHistory.slice(-12)));
    if (mode) fd.append("mode", mode);
    const res = await fetch(WORKER_URL, { method: "POST", body: fd });
    if (!res.ok) throw new Error("Server error");
    const data = await res.json();
    const html = data.reply || "Sorry, I couldn't get a response right now.";
    chatHistory.push({ role: "user", text: text || "[sent a file]" });
    chatHistory.push({ role: "model", text: htmlToSpeech(html) });
    if (chatHistory.length > 24) chatHistory = chatHistory.slice(-24);
    return html;
  }

  // ===== Voice typing (mic button in the message box) =====
  let dictRec = null;
  let dictActive = false;

  function stopDictation() {
    dictActive = false;
    micBtn.classList.remove("listening");
    input.placeholder = "Message or upload CV/image...";
    if (dictRec) {
      const r = dictRec;
      dictRec = null;
      try { r.stop(); } catch (e) {}
    }
  }

  function startDictation() {
    if (!SpeechRec) {
      addMessage("Voice typing is not supported in this browser. Please open this site in Google Chrome.", "bot");
      return;
    }
    if (callOverlay.classList.contains("active")) return;
    dictActive = true;
    micBtn.classList.add("listening");
    input.placeholder = "Listening... speak now";
    let emptyRounds = 0;

    const runRound = () => {
      if (!dictActive) return;
      const base = input.value ? input.value.replace(/\s+$/, "") + " " : "";
      let finalText = "";
      let gotSomething = false;
      const rec = new SpeechRec();
      dictRec = rec;
      rec.lang = speechLang;
      rec.interimResults = true;
      rec.continuous = false;
      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalText += r[0].transcript;
          else interim += r[0].transcript;
        }
        gotSomething = true;
        input.value = base + finalText + interim;
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          stopDictation();
          addMessage("Microphone access is blocked. Tap the lock icon in your browser address bar, allow the microphone, then try again.", "bot");
        } else if (e.error === "language-not-supported" && speechLang !== "en-US") {
          speechLang = "en-US";
        }
      };
      rec.onend = () => {
        if (dictRec !== rec) return;
        dictRec = null;
        if (!dictActive) return;
        if (gotSomething) emptyRounds = 0; else emptyRounds++;
        if (emptyRounds >= 2) { stopDictation(); return; }
        runRound();
      };
      try { rec.start(); } catch (err) { stopDictation(); }
    };
    runRound();
  }

  micBtn.addEventListener("click", () => {
    if (dictActive) stopDictation(); else startDictation();
  });

  // ===== Voice call (speak -> AI thinks -> AI speaks back) =====
  let callActive = false;
  let callRec = null;
  let isBusy = false;
  let ttsId = 0;
  let silentRounds = 0;
  let ttsVoice = null;
  const liveUtterances = []; // keeps utterances alive (Chrome can drop them otherwise)

  function pickVoice() {
    if (!synth) return;
    const voices = synth.getVoices() || [];
    ttsVoice =
      voices.find((v) => /^en[-_]NG/i.test(v.lang)) ||
      voices.find((v) => /^en[-_]GB/i.test(v.lang)) ||
      voices.find((v) => /^en[-_]US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang)) || null;
  }
  if (synth) {
    pickVoice();
    if (typeof synth.addEventListener === "function") synth.addEventListener("voiceschanged", pickVoice);
  }

  function setCallState(state, text) {
    callOverlay.setAttribute("data-state", state);
    const labels = { listening: "Listening...", thinking: "Thinking...", speaking: "Speaking...", muted: "Muted", idle: "Tap the circle to talk" };
    callStatus.textContent = text || labels[state] || "";
  }

  function stopSpeaking() {
    ttsId++;
    if (synth) { try { synth.cancel(); } catch (e) {} }
  }

  function speak(text, onDone) {
    if (!synth || !text) { if (onDone) onDone(); return; }
    const myId = ++ttsId;
    try { synth.cancel(); } catch (e) {}
    setCallState("speaking");
    const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
    const chunks = [];
    let cur = "";
    sentences.forEach((sn) => {
      if ((cur + sn).length > 180 && cur) { chunks.push(cur); cur = sn; } else { cur += sn; }
    });
    if (cur.trim()) chunks.push(cur);
    let i = 0;
    const next = () => {
      if (myId !== ttsId || !callActive) return;
      if (i >= chunks.length) { if (onDone) onDone(); return; }
      const u = new SpeechSynthesisUtterance(chunks[i++].trim());
      try { u.lang = ttsVoice ? ttsVoice.lang : speechLang; } catch (e) {}
      try { if (ttsVoice) u.voice = ttsVoice; } catch (e) {}
      u.rate = 1;
      u.onend = next;
      u.onerror = next;
      liveUtterances.push(u);
      if (liveUtterances.length > 20) liveUtterances.shift();
      try { synth.speak(u); } catch (e) { next(); }
    };
    next();
  }

  function stopListening() {
    if (callRec) {
      const r = callRec;
      callRec = null;
      try { r.abort(); } catch (e) {}
    }
  }

  function callFail(msg) {
    stopListening();
    stopSpeaking();
    isBusy = false;
    setCallState("idle", msg);
  }

  function listen() {
    if (!callActive || isBusy) return;
    if (isMuted) { setCallState("muted", "Muted. Tap the mic to talk"); return; }
    stopListening();
    const rec = new SpeechRec();
    callRec = rec;
    rec.lang = speechLang;
    rec.interimResults = true;
    rec.continuous = false;
    let heard = "";
    setCallState("listening");
    callUserText.textContent = "";
    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      heard = t.trim();
      callUserText.textContent = heard;
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        callFail("Microphone blocked. Allow it in your browser settings.");
      } else if (e.error === "language-not-supported" && speechLang !== "en-US") {
        speechLang = "en-US";
      }
    };
    rec.onend = () => {
      if (callRec !== rec) return;
      callRec = null;
      if (!callActive) return;
      if (heard) { silentRounds = 0; respond(heard); return; }
      silentRounds++;
      if (silentRounds >= 3) { setCallState("idle", "I can't hear you. Tap the circle to talk"); return; }
      listen();
    };
    try { rec.start(); } catch (err) { callFail("Could not start the microphone."); }
  }

  async function respond(text) {
    isBusy = true;
    setCallState("thinking");
    callUserText.textContent = text;
    callAiText.textContent = "";
    addMessage(escapeHtml(text), "user");
    try {
      const html = await askBackend(text, null, "voice");
      addMessage(html, "bot");
      isBusy = false;
      if (!callActive) return;
      const spoken = htmlToSpeech(html);
      callAiText.textContent = spoken;
      speak(spoken, () => { listen(); });
    } catch (err) {
      isBusy = false;
      if (!callActive) return;
      const msg = "Sorry, I could not reach the server. Please try again.";
      callAiText.textContent = msg;
      speak(msg, () => { listen(); });
    }
  }

  function startVoiceCall() {
    if (!navigator.onLine) {
      addMessage("⚠️ Internet connection required to start a voice call with BrandMyCareer AI.", "bot");
      return;
    }
    if (!SpeechRec) {
      addMessage("Voice calls need Google Chrome (or another browser that supports speech). Please open this site in Chrome.", "bot");
      return;
    }
    if (!WORKER_URL) {
      addMessage("🔌 Live AI server is not connected yet.", "bot");
      return;
    }
    if (dictActive) stopDictation();
    callActive = true;
    isBusy = false;
    isMuted = false;
    silentRounds = 0;
    muteBtn.classList.remove("muted");
    callUserText.textContent = "";
    callAiText.textContent = "";
    callOverlay.classList.add("active");
    callSeconds = 0;
    callTimer.textContent = "00:00";
    setCallState("thinking", "Connecting...");

    clearInterval(callInterval);
    callInterval = setInterval(() => {
      callSeconds++;
      const mins = String(Math.floor(callSeconds / 60)).padStart(2, "0");
      const secs = String(callSeconds % 60).padStart(2, "0");
      callTimer.textContent = `${mins}:${secs}`;
    }, 1000);

    const greeting = "Hi, I'm BrandMyCareer AI. How can I help you today?";
    callAiText.textContent = greeting;
    speak(greeting, () => { listen(); });
  }

  function endVoiceCall() {
    callActive = false;
    isBusy = false;
    stopSpeaking();
    stopListening();
    clearInterval(callInterval);
    callOverlay.classList.remove("active");
    setCallState("idle");
  }

  // Tap the circle: interrupt the AI, or start listening again
  orbBtn.addEventListener("click", () => {
    if (!callActive) return;
    const state = callOverlay.getAttribute("data-state");
    if (state === "speaking") {
      stopSpeaking();
      silentRounds = 0;
      listen();
    } else if (state === "idle" || state === "muted") {
      if (isMuted) { isMuted = false; muteBtn.classList.remove("muted"); }
      silentRounds = 0;
      listen();
    }
  });

  startCallTop.addEventListener("click", startVoiceCall);
  endCallBtn.addEventListener("click", endVoiceCall);
  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    muteBtn.classList.toggle("muted", isMuted);
    if (!callActive) return;
    if (isMuted) {
      stopListening();
      if (callOverlay.getAttribute("data-state") === "listening") setCallState("muted", "Muted. Tap the mic to talk");
    } else if (!isBusy && callOverlay.getAttribute("data-state") !== "speaking") {
      silentRounds = 0;
      listen();
    }
  });

  // Send on Enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });

  function addMessage(htmlContent, sender) {
    const group = document.createElement("div");
    group.className = `bmc-msg-group ${sender}`;
    const label = sender === "bot" ? "BrandMyCareer AI • Just now" : "You • Just now";
    group.innerHTML = `<div class="bmc-msg">${htmlContent}</div><div class="bmc-meta">${label}</div>`;
    messages.appendChild(group);
    messages.scrollTop = messages.scrollHeight;
    return group.querySelector(".bmc-msg");
  }

  async function handleSend(userText) {
    const trimmed = userText.trim();
    if (!trimmed && !selectedFile) return;

    let userHTML = trimmed ? trimmed.replace(/\n/g, "<br>") : "";
    const fileToSend = selectedFile;

    if (fileToSend) {
      if (fileToSend.type.startsWith("image/")) {
        const imgURL = URL.createObjectURL(fileToSend);
        userHTML += `<img src="${imgURL}" class="bmc-chat-img" alt="Uploaded image" />`;
      } else {
        userHTML += `<div class="bmc-file-badge">📄 ${fileToSend.name}</div>`;
      }
    }

    addMessage(userHTML, "user");
    input.value = "";
    selectedFile = null;
    fileInput.value = "";
    attachmentPreview.classList.remove("show");

    // Strictly block replies if offline
    if (!navigator.onLine) {
      addMessage("⚠️ You are currently offline. Please connect to the internet to chat with BrandMyCareer AI.", "bot");
      return;
    }

    if (!WORKER_URL) {
      addMessage("🔌 Live AI server is not connected yet. Once we add your backend URL, I will process your messages, images, and CVs here.", "bot");
      return;
    }

    const botBubble = addMessage("Thinking...", "bot");

    try {
      botBubble.innerHTML = await askBackend(trimmed, fileToSend, "");
    } catch (err) {
      botBubble.innerHTML = "⚠️ Unable to reach the server. Please check your internet connection and try again.";
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSend(input.value);
  });

  document.querySelectorAll(".bmc-chip").forEach((chip) => {
    chip.addEventListener("click", () => handleSend(chip.getAttribute("data-q")));
  });
})();
