/*!
 * Botflow embeddable chat widget.
 * Standalone, dependency-free. Loaded via:
 *   <script src=".../widget/botflow-widget.js" data-bot-id="..." async></script>
 */
(function () {
  "use strict";

  var scriptEl =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  var BOT_ID = scriptEl.getAttribute("data-bot-id");
  var API_BASE = (function () {
    try {
      return new URL(scriptEl.src).origin;
    } catch (e) {
      return "";
    }
  })();

  if (!BOT_ID || !API_BASE) {
    console.warn("[botflow] Missing data-bot-id or unable to resolve widget origin.");
    return;
  }

  // ── Storage helpers ──────────────────────────────────────────────────────

  var STORAGE_PREFIX = "botflow:" + BOT_ID + ":";

  function loadJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      // localStorage unavailable (private mode, quota) — degrade to in-memory only.
    }
  }

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getVisitorId() {
    var id = loadJSON("visitorId", null);
    if (!id) {
      id = uuid();
      saveJSON("visitorId", id);
    }
    return id;
  }

  // ── State ────────────────────────────────────────────────────────────────

  var state = {
    visitorId: getVisitorId(),
    conversationId: loadJSON("conversationId", null),
    lead: loadJSON("lead", null), // { name, email }
    messages: loadJSON("messages", []), // [{ role: "user"|"assistant", content, ts }]
    config: null,
    open: false,
    sending: false,
  };

  function persistMessages() {
    saveJSON("messages", state.messages);
  }

  // ── DOM / styles ─────────────────────────────────────────────────────────

  var host = document.createElement("div");
  host.id = "botflow-widget-root";
  host.style.all = "initial";
  var shadow = host.attachShadow({ mode: "open" });

  var STYLE = "" +
    ":host, .bf-widget { all: initial; }\n" +
    ".bf-widget, .bf-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }\n" +
    ".bf-widget { position: fixed; bottom: 20px; z-index: 2147483000; }\n" +
    ".bf-widget.bf-pos-right { right: 20px; }\n" +
    ".bf-widget.bf-pos-left { left: 20px; }\n" +
    ".bf-launcher { display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; padding: 12px 18px; border-radius: 999px; background: var(--bf-color, #4F46E5); color: #fff; font-size: 14px; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.18); transition: transform 0.15s ease; }\n" +
    ".bf-launcher:hover { transform: translateY(-2px); }\n" +
    ".bf-launcher-icon { width: 20px; height: 20px; border-radius: 999px; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\n" +
    ".bf-launcher-icon svg { width: 20px; height: 20px; }\n" +
    ".bf-launcher-icon img { width: 100%; height: 100%; object-fit: cover; }\n" +
    ".bf-launcher.bf-hidden { display: none; }\n" +
    ".bf-window { position: absolute; bottom: 0; width: 320px; height: 480px; max-height: 70vh; background: #fff; border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.22); display: flex; flex-direction: column; overflow: hidden; opacity: 0; transform: translateY(16px) scale(0.98); pointer-events: none; transition: opacity 0.18s ease, transform 0.18s ease; }\n" +
    ".bf-pos-right .bf-window { right: 0; }\n" +
    ".bf-pos-left .bf-window { left: 0; }\n" +
    ".bf-window.bf-open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }\n" +
    ".bf-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; background: var(--bf-color, #4F46E5); color: #fff; flex-shrink: 0; }\n" +
    ".bf-header-info { display: flex; align-items: center; gap: 10px; min-width: 0; }\n" +
    ".bf-avatar { width: 32px; height: 32px; border-radius: 999px; background: rgba(255,255,255,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }\n" +
    ".bf-avatar img { width: 100%; height: 100%; object-fit: cover; }\n" +
    ".bf-title { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\n" +
    ".bf-close { background: transparent; border: none; color: #fff; cursor: pointer; font-size: 20px; line-height: 1; padding: 4px; opacity: 0.85; }\n" +
    ".bf-close:hover { opacity: 1; }\n" +
    ".bf-body { flex: 1; display: flex; flex-direction: column; min-height: 0; background: #f8f8fb; }\n" +
    ".bf-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px; }\n" +
    ".bf-msg { max-width: 82%; padding: 8px 12px; border-radius: 14px; font-size: 13.5px; line-height: 1.45; }\n" +
    ".bf-msg-text { white-space: pre-wrap; word-wrap: break-word; }\n" +
    ".bf-msg-time { font-size: 10px; margin-top: 3px; opacity: 0.6; }\n" +
    ".bf-msg-user { align-self: flex-end; background: var(--bf-color, #4F46E5); color: #fff; border-bottom-right-radius: 3px; }\n" +
    ".bf-msg-user .bf-msg-time { text-align: right; }\n" +
    ".bf-msg-assistant { align-self: flex-start; background: #eceef1; color: #1f2937; border-bottom-left-radius: 3px; }\n" +
    ".bf-typing { align-self: flex-start; display: none; gap: 4px; padding: 10px 14px; background: #eceef1; border-radius: 14px; border-bottom-left-radius: 3px; }\n" +
    ".bf-typing.bf-visible { display: inline-flex; }\n" +
    ".bf-typing span { width: 6px; height: 6px; border-radius: 999px; background: #9ca3af; animation: bf-bounce 1.2s infinite ease-in-out; }\n" +
    ".bf-typing span:nth-child(2) { animation-delay: 0.15s; }\n" +
    ".bf-typing span:nth-child(3) { animation-delay: 0.3s; }\n" +
    "@keyframes bf-bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-4px); opacity: 1; } }\n" +
    ".bf-input-row { display: flex; gap: 8px; padding: 10px; border-top: 1px solid #e5e7eb; background: #fff; flex-shrink: 0; }\n" +
    ".bf-input-row input { flex: 1; border: 1px solid #e5e7eb; border-radius: 999px; padding: 9px 14px; font-size: 13.5px; outline: none; min-width: 0; }\n" +
    ".bf-input-row input:focus { border-color: var(--bf-color, #4F46E5); }\n" +
    ".bf-send { border: none; background: var(--bf-color, #4F46E5); color: #fff; width: 36px; height: 36px; border-radius: 999px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\n" +
    ".bf-send:disabled { opacity: 0.5; cursor: default; }\n" +
    ".bf-send svg { width: 16px; height: 16px; }\n" +
    ".bf-lead { flex: 1; display: flex; flex-direction: column; gap: 10px; padding: 18px; overflow-y: auto; }\n" +
    ".bf-lead p { margin: 0 0 4px; font-size: 13.5px; color: #374151; line-height: 1.5; }\n" +
    ".bf-lead input { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; font-size: 13.5px; outline: none; }\n" +
    ".bf-lead input:focus { border-color: var(--bf-color, #4F46E5); }\n" +
    ".bf-lead button { margin-top: 4px; border: none; background: var(--bf-color, #4F46E5); color: #fff; font-weight: 600; font-size: 13.5px; padding: 10px 14px; border-radius: 10px; cursor: pointer; }\n" +
    ".bf-error { font-size: 12px; color: #dc2626; padding: 0 14px 8px; }\n" +
    "@media (max-width: 480px) {\n" +
    "  .bf-window { position: fixed; inset: 0; width: 100%; height: 100%; max-height: none; border-radius: 0; }\n" +
    "  .bf-widget.bf-pos-right, .bf-widget.bf-pos-left { right: 20px; left: auto; }\n" +
    "}\n";

  var styleEl = document.createElement("style");
  styleEl.textContent = STYLE;
  shadow.appendChild(styleEl);

  var CHAT_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>';
  var SEND_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

  var widgetEl = document.createElement("div");
  widgetEl.className = "bf-widget";

  var launcherBtn = document.createElement("button");
  launcherBtn.className = "bf-launcher";
  launcherBtn.type = "button";

  var launcherIconEl = document.createElement("span");
  launcherIconEl.className = "bf-launcher-icon";
  launcherIconEl.innerHTML = CHAT_ICON;

  var launcherTextEl = document.createElement("span");
  launcherTextEl.textContent = "Chat with us";

  launcherBtn.appendChild(launcherIconEl);
  launcherBtn.appendChild(launcherTextEl);

  var windowEl = document.createElement("div");
  windowEl.className = "bf-window";

  var headerEl = document.createElement("div");
  headerEl.className = "bf-header";

  var headerInfo = document.createElement("div");
  headerInfo.className = "bf-header-info";
  var avatarEl = document.createElement("div");
  avatarEl.className = "bf-avatar";
  avatarEl.innerHTML = CHAT_ICON;
  var titleEl = document.createElement("span");
  titleEl.className = "bf-title";
  headerInfo.appendChild(avatarEl);
  headerInfo.appendChild(titleEl);

  var closeBtn = document.createElement("button");
  closeBtn.className = "bf-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close chat");
  closeBtn.textContent = "×";

  headerEl.appendChild(headerInfo);
  headerEl.appendChild(closeBtn);

  var bodyEl = document.createElement("div");
  bodyEl.className = "bf-body";

  windowEl.appendChild(headerEl);
  windowEl.appendChild(bodyEl);

  widgetEl.appendChild(windowEl);
  widgetEl.appendChild(launcherBtn);
  shadow.appendChild(widgetEl);

  function setOpen(open) {
    state.open = open;
    windowEl.classList.toggle("bf-open", open);
  }

  launcherBtn.addEventListener("click", function () {
    setOpen(!state.open);
  });
  closeBtn.addEventListener("click", function () {
    setOpen(false);
  });

  // ── Lead capture view ────────────────────────────────────────────────────

  function renderLeadForm() {
    bodyEl.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "bf-lead";

    var intro = document.createElement("p");
    intro.textContent = state.config.welcomeMessage || "Hi! How can I help you today?";
    wrap.appendChild(intro);

    var nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Your name";
    nameInput.required = true;

    var emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.placeholder = "Your email";
    emailInput.required = true;

    var errorEl = document.createElement("div");
    errorEl.className = "bf-error";

    var submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.textContent = "Start Chat";

    submitBtn.addEventListener("click", function () {
      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      if (!name || !email) {
        errorEl.textContent = "Please enter your name and email to continue.";
        return;
      }
      errorEl.textContent = "";
      submitBtn.disabled = true;
      submitBtn.textContent = "Starting…";
      startConversation(name, email)
        .then(renderChatView)
        .catch(function () {
          errorEl.textContent = "Something went wrong. Please try again.";
          submitBtn.disabled = false;
          submitBtn.textContent = "Start Chat";
        });
    });

    wrap.appendChild(nameInput);
    wrap.appendChild(emailInput);
    wrap.appendChild(errorEl);
    wrap.appendChild(submitBtn);
    bodyEl.appendChild(wrap);
  }

  function startConversation(name, email) {
    return fetch(API_BASE + "/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        botId: BOT_ID,
        visitorId: state.visitorId,
        visitorName: name,
        visitorEmail: email,
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to start conversation");
        return res.json();
      })
      .then(function (conversation) {
        state.lead = { name: name, email: email };
        state.conversationId = conversation.id;
        saveJSON("lead", state.lead);
        saveJSON("conversationId", state.conversationId);
      });
  }

  // ── Chat view ────────────────────────────────────────────────────────────

  var messagesEl, typingEl, inputForm, inputEl, sendBtn;

  function renderChatView() {
    bodyEl.innerHTML = "";

    messagesEl = document.createElement("div");
    messagesEl.className = "bf-messages";

    typingEl = document.createElement("div");
    typingEl.className = "bf-typing";
    typingEl.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(typingEl);

    if (state.messages.length === 0) {
      pushMessage("assistant", state.config.welcomeMessage || "Hi! How can I help you today?", false);
    } else {
      state.messages.forEach(function (m) {
        renderBubble(m.role, m.content, m.ts);
      });
    }

    bodyEl.appendChild(messagesEl);

    inputForm = document.createElement("form");
    inputForm.className = "bf-input-row";

    inputEl = document.createElement("input");
    inputEl.type = "text";
    inputEl.placeholder = "Type a message…";
    inputEl.autocomplete = "off";

    sendBtn = document.createElement("button");
    sendBtn.type = "submit";
    sendBtn.className = "bf-send";
    sendBtn.innerHTML = SEND_ICON;
    sendBtn.setAttribute("aria-label", "Send message");

    inputForm.appendChild(inputEl);
    inputForm.appendChild(sendBtn);
    bodyEl.appendChild(inputForm);

    inputForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var text = inputEl.value.trim();
      if (!text || state.sending) return;
      inputEl.value = "";
      sendMessage(text);
    });

    scrollToBottom();
  }

  function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function formatTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  }

  function renderBubble(role, content, ts) {
    var bubble = document.createElement("div");
    bubble.className = "bf-msg " + (role === "user" ? "bf-msg-user" : "bf-msg-assistant");

    var textEl = document.createElement("div");
    textEl.className = "bf-msg-text";
    textEl.textContent = content;

    var timeEl = document.createElement("div");
    timeEl.className = "bf-msg-time";
    timeEl.textContent = formatTime(ts || Date.now());

    bubble.appendChild(textEl);
    bubble.appendChild(timeEl);
    bubble.bfTextEl = textEl;

    messagesEl.insertBefore(bubble, typingEl);
    scrollToBottom();
    return bubble;
  }

  function pushMessage(role, content, persist) {
    state.messages.push({ role: role, content: content, ts: Date.now() });
    if (persist !== false) persistMessages();
    if (messagesEl) renderBubble(role, content, state.messages[state.messages.length - 1].ts);
  }

  function setTyping(visible) {
    if (typingEl) typingEl.classList.toggle("bf-visible", visible);
    scrollToBottom();
  }

  function sendMessage(text) {
    state.sending = true;
    if (sendBtn) sendBtn.disabled = true;
    pushMessage("user", text);
    setTyping(true);

    var assistantBubble = null;
    var assistantText = "";

    fetch(API_BASE + "/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        botId: BOT_ID,
        message: text,
        conversationId: state.conversationId,
        visitorId: state.visitorId,
        visitorName: state.lead ? state.lead.name : undefined,
        visitorEmail: state.lead ? state.lead.email : undefined,
      }),
    })
      .then(function (res) {
        if (!res.ok || !res.body) throw new Error("Chat request failed");

        var convoId = res.headers.get("X-Conversation-Id");
        if (convoId) {
          state.conversationId = convoId;
          saveJSON("conversationId", convoId);
        }

        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var buffer = "";

        function pump() {
          return reader.read().then(function (result) {
            if (result.done) return;
            buffer += decoder.decode(result.value, { stream: true });
            var parts = buffer.split("\n\n");
            buffer = parts.pop();

            parts.forEach(function (part) {
              var line = part.trim();
              if (line.slice(0, 5) !== "data:") return;
              var payload;
              try {
                payload = JSON.parse(line.slice(5).trim());
              } catch (e) {
                return;
              }

              if (payload.delta) {
                if (!assistantBubble) {
                  setTyping(false);
                  assistantBubble = renderBubble("assistant", "");
                }
                assistantText += payload.delta;
                assistantBubble.bfTextEl.textContent = assistantText;
                scrollToBottom();
              } else if (payload.error) {
                setTyping(false);
                if (!assistantBubble) assistantBubble = renderBubble("assistant", "");
                assistantText = assistantText || "Sorry, something went wrong. Please try again.";
                assistantBubble.bfTextEl.textContent = assistantText;
              }
            });

            return pump();
          });
        }

        return pump();
      })
      .then(function () {
        setTyping(false);
        if (assistantText) {
          state.messages.push({ role: "assistant", content: assistantText, ts: Date.now() });
          persistMessages();
        }
      })
      .catch(function () {
        setTyping(false);
        if (!assistantBubble) renderBubble("assistant", "Sorry, something went wrong. Please try again.");
      })
      .finally(function () {
        state.sending = false;
        if (sendBtn) sendBtn.disabled = false;
      });
  }

  // ── Init ─────────────────────────────────────────────────────────────────

  function init() {
    fetch(API_BASE + "/api/widget-config?botId=" + encodeURIComponent(BOT_ID))
      .then(function (res) {
        if (!res.ok) throw new Error("widget-config failed");
        return res.json();
      })
      .then(function (config) {
        state.config = config;

        widgetEl.style.setProperty("--bf-color", config.widgetColor || "#4F46E5");
        widgetEl.classList.add(config.widgetPosition === "bottom-left" ? "bf-pos-left" : "bf-pos-right");
        titleEl.textContent = config.name || "Chat";
        if (config.avatarUrl) {
          avatarEl.innerHTML = "";
          var img = document.createElement("img");
          img.src = config.avatarUrl;
          img.alt = "";
          avatarEl.appendChild(img);

          launcherIconEl.innerHTML = "";
          var launcherImg = document.createElement("img");
          launcherImg.src = config.avatarUrl;
          launcherImg.alt = "";
          launcherIconEl.appendChild(launcherImg);
        }

        document.body.appendChild(host);

        if (state.conversationId && state.lead) {
          renderChatView();
        } else {
          renderLeadForm();
        }
      })
      .catch(function () {
        // Bot inactive, deleted, or domain not allowed — fail silently, no widget shown.
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
