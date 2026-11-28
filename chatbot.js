(function () {
  const WORKER_URL = ""; // We will add your backend URL here next

  const widgetHTML = `
  <style>
    :root {
      --bmc-primary: #0f172a;
      --bmc-accent: #2563eb;
      --bmc-accent-hover: #1d4ed8;
      --bmc-bg: #ffffff;
      --bmc-surface: #f8fafc;
      --bmc-text: #1e293b;
      --bmc-border: #e2e8f0;
    }
    #bmc-chat-launcher {
      position: fixed; bottom: 24px; left: 24px; width: 60px; height: 60px;
      border-radius: 50%; background: var(--bmc-accent); color: #fff; border: none;
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.35); cursor: pointer; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s ease, background 0.2s ease;
    }
    #bmc-chat-launcher:hover { transform: scale(1.06); background: var(--bmc-accent-hover); }
    #bmc-chat-window {
      position: fixed; bottom: 96px; left: 24px; width: 370px; max-width: calc(100vw - 32px);
      height: 520px; max-height: calc(100vh - 120px); background: var(--bmc-bg);
      border: 1px solid var(--bmc-border); border-radius: 16px;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18); display: none;
      flex-direction: column; overflow: hidden; z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #bmc-chat-window.open { display: flex; }
    .bmc-header {
      background: var(--bmc-primary); color: #fff; padding: 16px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .bmc-header-info { display: flex; align-items: center; gap: 10px; }
    .bmc-avatar {
      width: 38px; height: 38px; border-radius: 50%; background: var(--bmc-accent);
      display: flex; align-items: center; justify-content: center; font-weight: 700;
      font-size: 14px; position: relative;
    }
    .bmc-status-dot {
      width: 10px; height: 10px; background: #22c55e; border: 2px solid var(--bmc-primary);
      border-radius: 50%; position: absolute; bottom: 0; right: 0;
    }
    .bmc-title h4 { margin: 0; font-size: 15px; font-weight: 600; }
    .bmc-title span { font-size: 12px; color: #cbd5e1; }
    #bmc-close-btn { background: transparent; border: none; color: #cbd5e1; font-size: 22px; cursor: pointer; }
    #bmc-messages {
      flex: 1; padding: 16px; overflow-y: auto; background: var(--bmc-surface);
      display: flex; flex-direction: column; gap: 12px;
    }
    .bmc-msg { max-width: 82%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.45; }
    .bmc-msg.bot { background: #fff; color: var(--bmc-text); border: 1px solid var(--bmc-border); align-self: flex-start; border-bottom-left-radius: 4px; }
    .bmc-msg.user { background: var(--bmc-accent); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .bmc-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 16px 4px; background: var(--bmc-surface); }
    .bmc-chip {
      background: #fff; border: 1px solid var(--bmc-accent); color: var(--bmc-accent);
      border-radius: 999px; padding: 5px 11px; font-size: 12px; cursor: pointer;
    }
    .bmc-chip:hover { background: var(--bmc-accent); color: #fff; }
    .bmc-input-area { display: flex; padding: 12px; background: #fff; border-top: 1px solid var(--bmc-border); gap: 8px; }
    #bmc-input { flex: 1; border: 1px solid var(--bmc-border); border-radius: 999px; padding: 10px 14px; font-size: 14px; outline: none; }
    #bmc-send-btn { background: var(--bmc-accent); color: #fff; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  </style>

  <button id="bmc-chat-launcher" aria-label="Chat with BrandMyCareer Assistant">
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  </button>

  <div id="bmc-chat-window">
    <div class="bmc-header">
      <div class="bmc-header-info">
        <div class="bmc-avatar">HM<span class="bmc-status-dot"></span></div>
        <div class="bmc-title"><h4>BrandMyCareer AI</h4><span>Ask about CVs, LinkedIn & Pricing</span></div>
      </div>
      <button id="bmc-close-btn" aria-label="Close chat">&times;</button>
    </div>
    <div id="bmc-messages">
      <div class="bmc-msg bot">Hi! 👋 I'm Hassan's virtual assistant. Looking to upgrade your CV, Cover Letter, or LinkedIn profile? Ask me anything!</div>
    </div>
    <div class="bmc-chips">
      <button class="bmc-chip" data-q="What are your packages and prices?">Packages & Pricing</button>
      <button class="bmc-chip" data-q="How long does delivery take?">Turnaround Time</button>
      <button class="bmc-chip" data-q="How do I book my CV upgrade?">How to Book</button>
    </div>
    <form class="bmc-input-area" id="bmc-form">
      <input type="text" id="bmc-input" placeholder="Type your question..." autocomplete="off" required />
      <button type="submit" id="bmc-send-btn" aria-label="Send message">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </form>
  </div>`;

  document.body.insertAdjacentHTML("beforeend", widgetHTML);

  const launcher = document.getElementById("bmc-chat-launcher");
  const chatWindow = document.getElementById("bmc-chat-window");
  const closeBtn = document.getElementById("bmc-close-btn");
  const form = document.getElementById("bmc-form");
  const input = document.getElementById("bmc-input");
  const messages = document.getElementById("bmc-messages");

  launcher.addEventListener("click", () => {
    chatWindow.classList.toggle("open");
    if (chatWindow.classList.contains("open")) input.focus();
  });
  closeBtn.addEventListener("click", () => chatWindow.classList.remove("open"));

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `bmc-msg ${sender}`;
    div.innerHTML = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function getOfflineReply(q) {
    const text = q.toLowerCase();
    if (text.includes("price") || text.includes("cost") || text.includes("package") || text.includes("how much")) {
      return "Here are Hassan's packages:<br>• <b>ATS CV Revamp:</b> ₦15,000 / $35<br>• <b>Tailored Cover Letter:</b> ₦8,000 / $20<br>• <b>LinkedIn Makeover:</b> ₦15,000 / $35<br>• <b>Complete Career Bundle:</b> ₦30,000 / $75 (Most Popular)";
    }
    if (text.includes("time") || text.includes("long") || text.includes("turnaround") || text.includes("days")) {
      return "Cover Letters take <b>1–2 days</b>, ATS CVs & LinkedIn Makeovers take <b>2–3 days</b>, and the Complete Bundle takes <b>3–4 days</b>.";
    }
    if (text.includes("book") || text.includes("start") || text.includes("whatsapp")) {
      return "You can fill out the <b>Booking Form</b> right on this page or click <b>WhatsApp Me</b> at the bottom to send your current CV!";
    }
    return "Thanks for reaching out! Once my full AI brain is connected, I'll answer custom questions here. In the meantime, check the packages above or scroll down to book with Hassan directly.";
  }

  async function handleSend(userText) {
    if (!userText.trim()) return;
    addMessage(userText, "user");
    input.value = "";
    const typingIndicator = addMessage("Typing...", "bot");

    if (!WORKER_URL) {
      setTimeout(() => { typingIndicator.innerHTML = getOfflineReply(userText); }, 450);
      return;
    }

    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      typingIndicator.innerHTML = data.reply || "Sorry, I couldn't process that right now.";
    } catch (err) {
      typingIndicator.innerHTML = "Connection error. Please try again or message Hassan on WhatsApp!";
    }
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); handleSend(input.value); });
  document.querySelectorAll(".bmc-chip").forEach((chip) => {
    chip.addEventListener("click", () => handleSend(chip.getAttribute("data-q")));
  });
})();
      
