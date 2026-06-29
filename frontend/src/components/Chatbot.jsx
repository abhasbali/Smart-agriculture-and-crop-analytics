import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../api.js";

const SEED_PROMPTS = [
  "Which state ranks #1 overall?",
  "Top 3 wheat-producing states?",
  "Which states are water-stressed?",
  "Compare rice yield in Punjab vs West Bengal",
];

const INITIAL_GREETING = {
  role: "assistant",
  content:
    "Namaste 🌾 I am **Krishi Sahayak**. Ask me anything about the crops, states, yields, irrigation, revenue, or water-risk data in this dashboard.",
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 220);
    }
  }, [open]);

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || busy) return;

    const userTurn = { role: "user", content: trimmed };
    const history = messages
      .filter((m) => m !== INITIAL_GREETING)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userTurn]);
    setInput("");
    setBusy(true);
    setError(null);

    try {
      const data = await sendChatMessage(trimmed, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not reach the chatbot.";
      setError(detail);
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const reset = () => {
    setMessages([INITIAL_GREETING]);
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        className={`chatbot-launcher ${open ? "is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
        {!open && <span className="chatbot-launcher-label">Ask Krishi Sahayak</span>}
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="Krishi Sahayak chatbot">
          <header className="chatbot-header">
            <div className="chatbot-header-icon">
              <SproutIcon />
            </div>
            <div className="chatbot-header-text">
              <span className="chatbot-header-title">Krishi Sahayak</span>
              <span className="chatbot-header-sub">
                Grounded in your pipeline data · powered by Groq
              </span>
            </div>
            <button
              type="button"
              className="chatbot-header-btn"
              onClick={reset}
              title="Reset conversation"
            >
              <RefreshIcon />
            </button>
            <button
              type="button"
              className="chatbot-header-btn"
              onClick={() => setOpen(false)}
              title="Close"
            >
              <CloseIcon />
            </button>
          </header>

          <div className="chatbot-scroll" ref={scrollRef}>
            {messages.map((m, i) => (
              <Message key={i} role={m.role} content={m.content} />
            ))}
            {busy && (
              <div className="chatbot-msg assistant">
                <div className="chatbot-bubble">
                  <span className="chatbot-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}
            {error && (
              <div className="chatbot-error">
                <strong>Couldn't get a reply.</strong>
                <span>{error}</span>
              </div>
            )}
          </div>

          {messages.length <= 1 && !busy && (
            <div className="chatbot-suggestions">
              {SEED_PROMPTS.map((p) => (
                <button
                  type="button"
                  key={p}
                  className="chatbot-chip"
                  onClick={() => send(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <form
            className="chatbot-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Ask about a state, crop, yield, irrigation…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={busy}
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={busy || !input.trim()}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Message({ role, content }) {
  return (
    <div className={`chatbot-msg ${role}`}>
      <div className="chatbot-bubble">{renderInline(content)}</div>
    </div>
  );
}

// Tiny markdown-ish renderer: paragraph splits, **bold**, `code`, bullets.
function renderInline(text) {
  const lines = text.split(/\n/);
  const blocks = [];
  let listBuf = [];

  const flushList = () => {
    if (listBuf.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="chatbot-list">
          {listBuf.map((item, i) => (
            <li key={i}>{formatSpans(item)}</li>
          ))}
        </ul>
      );
      listBuf = [];
    }
  };

  lines.forEach((line, idx) => {
    const m = line.match(/^\s*[-*]\s+(.*)/);
    if (m) {
      listBuf.push(m[1]);
    } else {
      flushList();
      if (line.trim()) {
        blocks.push(
          <p key={`p-${idx}`} className="chatbot-para">
            {formatSpans(line)}
          </p>
        );
      }
    }
  });
  flushList();
  return blocks;
}

function formatSpans(text) {
  // Handle **bold** and `code`
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const seg = m[0];
    if (seg.startsWith("**")) {
      parts.push(<strong key={i++}>{seg.slice(2, -2)}</strong>);
    } else {
      parts.push(<code key={i++}>{seg.slice(1, -1)}</code>);
    }
    last = m.index + seg.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/* ------- icons (inline SVG, no deps) ------- */
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function SproutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12" />
      <path d="M12 12c0-4 3-7 7-7-0 4-3 7-7 7z" />
      <path d="M12 12c0-3-2-6-6-6 0 4 2 6 6 6z" />
    </svg>
  );
}
