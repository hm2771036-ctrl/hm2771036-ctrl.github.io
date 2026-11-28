(function () {
  const WORKER_URL = ""; // We will paste your Cloudflare Worker URL here next!

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
      position: absolute; inset: 0; background: linear-gradient(160deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff; display: none; flex-direction: column; align-items: center; justify-content: space-between;
      padding: 40px 24px 36px; z-index: 10005; text-align: center;
    }
    #bmc-call-overlay.active { display: flex; }
    .bmc-call-pulse {
      width: 88px; height: 88px; border-radius: 50%; background: var(--bmc-accent);
      display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800;
      box-shadow: 0 0 0 14px rgba(37, 99, 235, 0.25); margin-bottom: 16px;
      animation: bmcPulse 1.8s infinite;
    }
    @keyframes bmcPulse {
      0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.55); }
      70% { box-shadow: 0 0 0 22px rgba(37, 99, 235, 0); }
      100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
    }
    .bmc-call-status { font-size: 14px; color: #94a3b8; margin-top: 6px; }
    .bmc-call-transcript {
      font-size: 13.5px; color: #e2e8f0; background: rgba(255,255,255,0.08);
      padding: 12px 16px; border-radius: 12px; max-width: 90%; min-height: 44px;
    }
    .bmc-call-controls { display: flex; gap: 20px; align-items: center; }
    .bmc-call-ctrl-btn {
      width: 54px; height: 54px; border-radius: 50%; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: 20px; transition: transform 0.15s;
    }
    .bmc-call-ctrl-btn:hover { transform: scale(1.07); }
    #bmc-mute-btn { background: rgba(255,255,255,0.15); color: #ffffff; }
    #bmc-mute-btn.muted { background: #f59e0b; color: #111827; }
    #bmc-end-call-btn { background: #ef4444; color: #ffffff; }

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
    <div id="bmc-call-overlay">
      <div style="margin-top: 20px; display:flex; flex-direction:column; align-items:center;">
        <div class="bmc-call-pulse">HM</div>
        <h3 style="margin:0; font-size:19px;">BrandMyCareer Voice AI</h3>
        <div class="bmc-call-status" id="bmc-call-timer">Connecting...</div>
      </div>
      <div class="bmc-call-transcript" id="bmc-call-live-text">
        Speak clearly to ask about CV revamps, LinkedIn optimization, or pricing...
      </div>
      <div class="bmc-call-controls">
        <button type="button" class="bmc-call-ctrl-btn" id="bmc-mute-btn" title="Mute / Unmute">🎤</button>
        <button type="button" class="bmc-call-ctrl-btn" id="bmc-end-call-btn" title="End Call">📞</button>
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
            <!-- Voice Call Shortcut -->
            <button type="button" class="bmc-tool-btn" id="bmc-call-input-btn" title="Call AI Agent">
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

  // Voice Call Elements
  const callOverlay = document.getElementById("bmc-call-overlay");
  const startCallTop = document.getElementById("bmc-start-call-top");
  const callInputBtn = document.getElementById("bmc-call-input-btn");
  const endCallBtn = document.getElementById("bmc-end-call-btn");
  const muteBtn = document.getElementById("bmc-mute-btn");
  const callTimer = document.getElementById("bmc-call-timer");
  const callLiveText = document.getElementById("bmc-call-live-text");
  let callInterval = null;
  let callSeconds = 0;
  let isMuted = false;
  let recognition = null;

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

  // Voice Call Logic
  function startVoiceCall() {
    if (!navigator.onLine) {
      addMessage("⚠️ Internet connection required to start a voice call with BrandMyCareer AI.", "bot");
      return;
    }
    callOverlay.classList.add("active");
    callSeconds = 0;
    isMuted = false;
    muteBtn.classList.remove("muted");
    callTimer.textContent = "00:00 • Live";
    callLiveText.textContent = WORKER_URL
      ? "Listening... Go ahead and speak."
      : "Voice UI active — Connect your AI backend URL to enable live AI voice responses.";

    callInterval = setInterval(() => {
      callSeconds++;
      const mins = String(Math.floor(callSeconds / 60)).padStart(2, "0");
      const secs = String(callSeconds % 60).padStart(2, "0");
      callTimer.textContent = `${mins}:${secs} • ${isMuted ? "Muted" : "Live"}`;
    }, 1000);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        if (isMuted) return;
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript)
          .join("");
        callLiveText.textContent = `"${transcript}"`;
      };
      try { recognition.start(); } catch (e) {}
    }
  }

  function endVoiceCall() {
    callOverlay.classList.remove("active");
    clearInterval(callInterval);
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
      recognition = null;
    }
  }

  startCallTop.addEventListener("click", startVoiceCall);
  callInputBtn.addEventListener("click", startVoiceCall);
  endCallBtn.addEventListener("click", endVoiceCall);
  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    muteBtn.classList.toggle("muted", isMuted);
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
      const formData = new FormData();
      formData.append("message", trimmed);
      if (fileToSend) formData.append("file", fileToSend);

      const res = await fetch(WORKER_URL, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      botBubble.innerHTML = data.reply || "Sorry, I couldn't get a response right now.";
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
