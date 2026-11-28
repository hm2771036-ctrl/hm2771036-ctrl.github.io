(function () {
  const WORKER_URL = ""; // We will paste your Cloudflare Worker URL here next!

  const widgetHTML = `
  <style>
    :root {
      --bmc-accent: #2563eb;
      --bmc-accent-soft: rgba(37, 99, 235, 0.25);
      --bmc-bg: #ffffff;
      --bmc-bubble-bot: #f3f4f6;
      --bmc-text: #111827;
      --bmc-muted: #6b7280;
      --bmc-border: #e5e7eb;
    }
    #bmc-chat-launcher {
      position: fixed; bottom: 24px; left: 24px; width: 60px; height: 60px;
      border-radius: 50%; background: var(--bmc-accent); color: #fff; border: none;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.22); cursor: pointer; z-index: 9999;
      display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease;
    }
    #bmc-chat-launcher:hover { transform: scale(1.06); }
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
    .bmc-header {
      background: #ffffff; padding: 16px 18px; border-bottom: 1px solid var(--bmc-border);
      display: flex; align-items: center; justify-content: space-between; position: relative;
    }
    .bmc-header-left { display: flex; align-items: center; gap: 12px; }
    .bmc-avatar {
      width: 40px; height: 40px; border-radius: 10px; background: #111827; color: #ffffff;
      display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;
    }
    .bmc-title h4 { margin: 0; font-size: 15px; font-weight: 700; color: var(--bmc-text); }
    .bmc-title span { font-size: 12.5px; color: var(--bmc-muted); display: block; margin-top: 1px; }
    .bmc-title span.offline { color: #dc2626; font-weight: 500; }
    .bmc-header-actions { display: flex; align-items: center; gap: 6px; }
    .bmc-icon-btn {
      background: transparent; border: none; color: var(--bmc-muted); width: 34px; height: 34px;
      border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .bmc-icon-btn:hover { background: #f3f4f6; color: var(--bmc-text); }
    #bmc-menu-dropdown {
      position: absolute; top: 60px; right: 18px; width: 220px; background: #ffffff;
      border: 1px solid var(--bmc-border); border-radius: 14px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14); padding: 6px; display: none; flex-direction: column; z-index: 10001;
    }
    #bmc-menu-dropdown.show { display: flex; }
    .bmc-menu-item {
      background: transparent; border: none; padding: 11px 12px; border-radius: 10px;
      display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--bmc-text); cursor: pointer; text-align: left;
    }
    .bmc-menu-item:hover { background: #f3f4f6; }
    #bmc-search-bar {
      display: none; padding: 8px 16px; background: #f9fafb; border-bottom: 1px solid var(--bmc-border); gap: 8px; align-items: center;
    }
    #bmc-search-bar.show { display: flex; }
    #bmc-search-input { flex: 1; border: 1px solid var(--bmc-border); border-radius: 8px; padding: 6px 10px; font-size: 13px; outline: none; }
    #bmc-messages { flex: 1; padding: 18px; overflow-y: auto; background: #ffffff; display: flex; flex-direction: column; gap: 14px; }
    .bmc-intro-note { text-align: center; font-size: 12.5px; color: var(--bmc-muted); margin-bottom: 4px; }
    .bmc-msg-group { display: flex; flex-direction: column; max-width: 84%; }
    .bmc-msg-group.bot { align-self: flex-start; }
    .bmc-msg-group.user { align-self: flex-end; align-items: flex-end; }
    .bmc-msg { padding: 12px 15px; border-radius: 16px; font-size: 14.5px; line-height: 1.5; word-wrap: break-word; }
    .bmc-msg-group.bot .bmc-msg { background: var(--bmc-bubble-bot); color: var(--bmc-text); border-bottom-left-radius: 4px; }
    .bmc-msg-group.user .bmc-msg { background: var(--bmc-accent); color: #ffffff; border-bottom-right-radius: 4px; }
    .bmc-meta { font-size: 11.5px; color: var(--bmc-muted); margin-top: 5px; padding: 0 2px; }
    .bmc-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 16px 10px; background: #ffffff; }
    .bmc-chip {
      background: #f9fafb; border: 1px solid var(--bmc-border); color: var(--bmc-text);
      border-radius: 999px; padding: 6px 12px; font-size: 12.5px; font-weight: 500; cursor: pointer;
    }
    .bmc-chip:hover { border-color: var(--bmc-accent); color: var(--bmc-accent); background: #eff6ff; }
    .bmc-input-wrapper { padding: 12px 16px 16px; background: #ffffff; }
    .bmc-input-box {
      border: 1.5px solid var(--bmc-accent); box-shadow: 0 0 0 3px var(--bmc-accent-soft);
      border-radius: 16px; padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; background: #ffffff;
    }
    #bmc-input { width: 100%; border: none; outline: none; font-size: 14.5px; font-family: inherit; resize: none; color: var(--bmc-text); min-height: 42px; max-height: 110px; }
    .bmc-input-footer { display: flex; align-items: center; justify-content: space-between; }
    .bmc-emoji-row { display: flex; gap: 6px; }
    .bmc-emoji-btn { background: transparent; border: none; cursor: pointer; font-size: 16px; padding: 2px 4px; border-radius: 6px; }
    .bmc-emoji-btn:hover { background: #f3f4f6; }
    #bmc-send-btn { width: 34px; height: 34px; border-radius: 50%; border: none; background: var(--bmc-accent); color: #ffffff; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  </style>

  <button id="bmc-chat-launcher" aria-label="Open BrandMyCareer Assistant">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </button>

  <div id="bmc-chat-window">
    <div class="bmc-header">
      <div class="bmc-header-left">
        <div class="bmc-avatar">HM</div>
        <div class="bmc-title">
          <h4>BrandMyCareer AI</h4>
          <span id="bmc-status-text">Hassan can also help</span>
        </div>
      </div>
      <div class="bmc-header-actions">
        <button class="bmc-icon-btn" id="bmc-menu-btn" aria-label="More options">•••</button>
        <button class="bmc-icon-btn" id="bmc-close-btn" aria-label="Close chat">&times;</button>
      </div>
      <div id="bmc-menu-dropdown">
        <button class="bmc-menu-item" id="bmc-expand-opt"><span>⤢</span> <span id="bmc-expand-label">Expand window</span></button>
        <button class="bmc-menu-item" id="bmc-search-opt"><span>🔍</span> <span>Search conversation</span></button>
        <button class="bmc-menu-item" id="bmc-download-opt"><span>⬇</span> <span>Download transcript</span></button>
      </div>
    </div>

    <div id="bmc-search-bar">
      <input type="text" id="bmc-search-input" placeholder="Search messages..." />
      <button class="bmc-icon-btn" id="bmc-search-close" style="width:26px;height:26px;font-size:15px;">&times;</button>
    </div>

    <div id="bmc-messages">
      <div class="bmc-intro-note">Ask anything about your CV, LinkedIn profile, or pricing.</div>
      <div class="bmc-msg-group bot">
        <div class="bmc-msg">
          Hey, I'm BrandMyCareer AI 👋<br><br>
          Ask me anything about ATS CV revamps, cover letters, LinkedIn makeovers, or turnaround times.<br><br>
          If you need a custom review, I'll connect you straight to Hassan.
        </div>
        <div class="bmc-meta">BrandMyCareer AI • Just now</div>
      </div>
    </div>

    <div class="bmc-chips">
      <button class="bmc-chip" data-q="What are your packages and prices?">Packages & Pricing</button>
      <button class="bmc-chip" data-q="How long does delivery take?">Turnaround Time</button>
      <button class="bmc-chip" data-q="I don't have an existing CV">No Existing CV?</button>
    </div>

    <form class="bmc-input-wrapper" id="bmc-form">
      <div class="bmc-input-box">
        <textarea id="bmc-input" placeholder="Message..." rows="1" required></textarea>
        <div class="bmc-input-footer">
          <div class="bmc-emoji-row">
            <button type="button" class="bmc-emoji-btn" data-emoji="👋">👋</button>
            <button type="button" class="bmc-emoji-btn" data-emoji="📄">📄</button>
            <button type="button" class="bmc-emoji-btn" data-emoji="💼">💼</button>
          </div>
          <button type="submit" id="bmc-send-btn" aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
  
