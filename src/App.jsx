import { useState, useEffect, useRef } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

const SYSTEM_PROMPT = `You are LingoLeap — a warm, encouraging, and highly interactive English pronunciation and reading coach for learners aged 5 to 20. Your entire purpose is to make learning to speak and read English correctly feel like a game, not a lesson. You are patient, celebratory, and never make the learner feel bad about mistakes.

## YOUR CORE PERSONALITY
- Speak like a kind, fun older sibling — never like a teacher lecturing
- Use emojis generously to make it visual and fun
- Celebrate every correct answer with genuine enthusiasm
- When something is wrong, always say "Almost! Let's try again" — never "Wrong" or "Incorrect"
- For ages 5–9: use very simple words, big emojis, short sentences
- For ages 10–20: be slightly more mature but still warm and encouraging
- Always tell the learner exactly what to do next — never leave them guessing

## ONBOARDING FLOW
When the conversation starts (first message from user is "BEGIN_SESSION"), greet them and ask for their age. Then ask for their name. Then ask their level (A/B/C).

After onboarding, set their path and say "Type GO when ready to start!"

## MODULES
Module 1: Vowel Sounds (A E I O U)
Module 2: Alphabet Sounds A-Z (5 letters per session)
Module 3: Two-Letter Words
Module 4: Three-Letter CVC Words
Module 5: Short Sentences
Module 6: Full Sentences & Conversations
Module 7: Speed Reading & Retention (age 10+ only)

## MIC SIMULATION
Since this is a text interface, when it is time to practice pronunciation:
- Tell the learner to say the word OUT LOUD
- Show a mic prompt
- Ask them to type what it sounded like phonetically, or just type the word
- Then give encouraging feedback based on their typed response

## GAMIFICATION
Track stars, celebrate badges, mention their level progression.

## KEY RULES
- Never move to next module until learner is ready
- Always offer AGAIN option
- Use learner's name every few messages
- Keep responses concise but warm
- After scoring a practice, always offer TRY AGAIN or NEXT
- Format your responses nicely with emojis and clear structure
- Respond in a way that feels like a fun app, not a wall of text`;

const COLORS = {
  bg: "#0f0c29",
  bgMid: "#1a1640",
  card: "#1e1a4a",
  cardBorder: "#2d2870",
  accent1: "#7c3aed",
  accent2: "#a855f7",
  accent3: "#c084fc",
  gold: "#fbbf24",
  green: "#10b981",
  pink: "#ec4899",
  text: "#f0eeff",
  textMuted: "#a89fd8",
  glow: "rgba(124,58,237,0.35)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Grotesk:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0f0c29; font-family: 'Nunito', sans-serif; color: #f0eeff; min-height: 100vh; overflow: hidden; }
  .app { display: flex; flex-direction: column; height: 100vh; max-width: 700px; margin: 0 auto; position: relative; }
  .stars-bg { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 0; }
  .star-particle { position: absolute; width: 2px; height: 2px; background: white; border-radius: 50%; animation: twinkle 3s infinite alternate; }
  @keyframes twinkle { 0% { opacity: 0.1; transform: scale(1); } 100% { opacity: 0.8; transform: scale(1.5); } }
  .header { padding: 16px 20px 12px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #2d2870; background: linear-gradient(180deg, rgba(15,12,41,0.98) 0%, rgba(26,22,64,0.95) 100%); backdrop-filter: blur(12px); position: relative; z-index: 10; flex-shrink: 0; }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 38px; height: 38px; background: linear-gradient(135deg, #7c3aed, #ec4899); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 0 20px rgba(124,58,237,0.35); }
  .logo-text { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 1.3rem; background: linear-gradient(90deg, #c084fc, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
  .stats-bar { display: flex; align-items: center; gap: 12px; }
  .stat-pill { display: flex; align-items: center; gap: 5px; background: #1e1a4a; border: 1px solid #2d2870; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; color: #fbbf24; }
  .messages { flex: 1; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 14px; position: relative; z-index: 1; scroll-behavior: smooth; }
  .messages::-webkit-scrollbar { width: 4px; }
  .messages::-webkit-scrollbar-track { background: transparent; }
  .messages::-webkit-scrollbar-thumb { background: #2d2870; border-radius: 4px; }
  .bubble { max-width: 88%; padding: 14px 18px; border-radius: 20px; line-height: 1.6; font-size: 0.95rem; animation: fadeUp 0.3s ease; white-space: pre-wrap; word-break: break-word; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .bubble.ai { background: linear-gradient(135deg, #1e1a4a 0%, rgba(45,40,112,0.7) 100%); border: 1px solid #2d2870; align-self: flex-start; border-bottom-left-radius: 6px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
  .bubble.user { background: linear-gradient(135deg, #7c3aed, #5b21b6); align-self: flex-end; border-bottom-right-radius: 6px; box-shadow: 0 4px 20px rgba(124,58,237,0.4); color: white; }
  .bubble.system { background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05)); border: 1px solid rgba(16,185,129,0.3); align-self: center; max-width: 100%; text-align: center; font-size: 0.85rem; color: #10b981; font-weight: 700; border-radius: 12px; padding: 10px 16px; }
  .thinking { display: flex; align-items: center; gap: 6px; padding: 14px 18px; background: #1e1a4a; border: 1px solid #2d2870; border-radius: 20px; border-bottom-left-radius: 6px; align-self: flex-start; max-width: 88%; }
  .dot { width: 7px; height: 7px; background: #c084fc; border-radius: 50%; animation: bounce 1.2s infinite; }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
  .input-area { padding: 14px 16px; border-top: 1px solid #2d2870; background: rgba(15,12,41,0.95); backdrop-filter: blur(12px); display: flex; gap: 10px; align-items: flex-end; position: relative; z-index: 10; flex-shrink: 0; }
  .text-input { flex: 1; background: #1e1a4a; border: 1px solid #2d2870; border-radius: 16px; padding: 12px 16px; color: #f0eeff; font-family: 'Nunito', sans-serif; font-size: 0.95rem; resize: none; outline: none; max-height: 120px; min-height: 46px; line-height: 1.5; transition: border-color 0.2s; }
  .text-input:focus { border-color: #a855f7; box-shadow: 0 0 0 3px rgba(168,85,247,0.15); }
  .text-input::placeholder { color: #a89fd8; }
  .send-btn { width: 46px; height: 46px; background: linear-gradient(135deg, #7c3aed, #ec4899); border: none; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 4px 15px rgba(124,58,237,0.5); flex-shrink: 0; color: white; }
  .send-btn:hover:not(:disabled) { transform: scale(1.08); }
  .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .quick-btns { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 10px; position: relative; z-index: 10; background: rgba(15,12,41,0.95); flex-shrink: 0; }
  .qbtn { background: #1e1a4a; border: 1px solid #2d2870; border-radius: 20px; padding: 6px 14px; color: #c084fc; font-family: 'Nunito', sans-serif; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
  .qbtn:hover { background: #7c3aed; border-color: #7c3aed; color: white; transform: translateY(-1px); }
  .mic-btn { background: linear-gradient(135deg, #dc2626, #b91c1c); border: none; border-radius: 14px; padding: 10px 16px; color: white; font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 15px rgba(220,38,38,0.4); transition: transform 0.15s; flex-shrink: 0; }
  .mic-btn:hover { transform: scale(1.05); }
  .mic-btn.recording { animation: pulse-red 1s infinite; }
  @keyframes pulse-red { 0%, 100% { box-shadow: 0 4px 15px rgba(220,38,38,0.4); } 50% { box-shadow: 0 4px 30px rgba(220,38,38,0.8); } }
  .badge-popup { position: fixed; top: 80px; left: 50%; transform: translateX(-50%) translateY(-20px); background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #1a1200; padding: 12px 24px; border-radius: 20px; font-weight: 900; font-size: 1rem; z-index: 100; animation: badgePop 3s forwards; box-shadow: 0 8px 30px rgba(251,191,36,0.5); white-space: nowrap; }
  @keyframes badgePop { 0% { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.8); } 15% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.05); } 85% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } 100% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.95); } }
  .progress-bar-outer { height: 4px; background: #2d2870; border-radius: 4px; margin: 6px 0 2px; overflow: hidden; }
  .progress-bar-inner { height: 100%; background: linear-gradient(90deg, #7c3aed, #ec4899); border-radius: 4px; transition: width 0.5s ease; }
`;

function StarsBg() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    size: Math.random() > 0.8 ? 3 : 2,
  }));
  return (
    <div className="stars-bg">
      {stars.map((s) => (
        <div key={s.id} className="star-particle" style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, width: s.size, height: s.size }} />
      ))}
    </div>
  );
}

export default function LingoLeap() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [stars, setStars] = useState(0);
  const [badge, setBadge] = useState(null);
  const [recording, setRecording] = useState(false);
  const messagesEnd = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const conversationRef = useRef([]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!started) { beginSession(); setStarted(true); }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === "ai") {
        if (last.text.includes("Vowel Champion")) { showBadge("🏅 Vowel Champion Unlocked!"); setStars((s) => s + 10); }
        else if (last.text.includes("Alphabet Hero")) { showBadge("🏅 Alphabet Hero Unlocked!"); setStars((s) => s + 15); }
        else if (last.text.includes("Word Wizard")) { showBadge("🏅 Word Wizard Unlocked!"); setStars((s) => s + 20); }
        else if (last.text.toLowerCase().includes("perfect") || last.text.toLowerCase().includes("amazing")) { setStars((s) => s + 1); }
      }
    }
  }, [messages]);

  function showBadge(text) {
    setBadge(text);
    setTimeout(() => setBadge(null), 3200);
  }

  async function callClaude(userMessage) {
    const history = conversationRef.current;
    const newHistory = [...history, { role: "user", content: userMessage }];
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
},
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 1000, system: SYSTEM_PROMPT, messages: newHistory }),
    });
    const data = await response.json();
    const aiText = data.content?.find((b) => b.type === "text")?.text || "Hmm, something went wrong. Try again!";
    conversationRef.current = [...newHistory, { role: "assistant", content: aiText }];
    return aiText;
  }

  async function beginSession() {
    setLoading(true);
    try {
      const aiText = await callClaude("BEGIN_SESSION");
      setMessages([{ role: "ai", text: aiText, id: Date.now() }]);
    } catch {
      setMessages([{ role: "ai", text: "🌟 Welcome to LingoLeap! Having trouble connecting. Please refresh.", id: Date.now() }]);
    }
    setLoading(false);
  }

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "46px";
    setMessages((prev) => [...prev, { role: "user", text: userText, id: Date.now() }]);
    setLoading(true);
    try {
      const aiText = await callClaude(userText);
      setMessages((prev) => [...prev, { role: "ai", text: aiText, id: Date.now() + 1 }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Oops! Something went wrong. Try again 😊", id: Date.now() + 1 }]);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  function handleTextarea(e) {
    setInput(e.target.value);
    e.target.style.height = "46px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  function startMic() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported. Please type your answer."); return; }
    if (recording) { recognitionRef.current?.stop(); setRecording(false); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setInput((prev) => prev ? prev + " " + spoken : spoken);
      setRecording(false);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognition.start();
    setRecording(true);
    setTimeout(() => { recognition.stop(); setRecording(false); }, 5000);
  }

  const quickButtons = ["GO", "YES", "NEXT →", "AGAIN", "BREAK"];
  const level = stars < 50 ? "Beginner" : stars < 150 ? "Explorer" : stars < 300 ? "Reader" : stars < 500 ? "Speaker" : "Champion";
  const levelMax = stars < 50 ? 50 : stars < 150 ? 150 : stars < 300 ? 300 : 500;
  const levelMin = stars < 50 ? 0 : stars < 150 ? 50 : stars < 300 ? 150 : 300;
  const pct = Math.min(100, ((stars - levelMin) / (levelMax - levelMin)) * 100);

  return (
    <>
      <StarsBg />
      {badge && <div className="badge-popup">{badge}</div>}
      <div className="app">
        <div className="header">
          <div className="logo">
            <div className="logo-icon">🎤</div>
            <div>
              <div className="logo-text">LingoLeap</div>
              <div style={{ fontSize: "0.7rem", color: "#a89fd8", marginTop: -2 }}>English Coach</div>
            </div>
          </div>
          <div className="stats-bar">
            <div className="stat-pill">⭐ {stars} <span style={{ marginLeft: 4, fontSize: "0.7rem", color: "#a89fd8" }}>{level}</span></div>
          </div>
        </div>
        <div style={{ padding: "4px 16px 0", background: "rgba(15,12,41,0.95)", position: "relative", zIndex: 10, flexShrink: 0 }}>
          <div className="progress-bar-outer">
            <div className="progress-bar-inner" style={{ width: `${pct}%` }} />
          </div>
          <div style={{ fontSize: "0.7rem", color: "#a89fd8", textAlign: "right", marginBottom: 4 }}>
            {stars < 500 ? `${levelMax - stars} stars to next level` : "Max Level!"}
          </div>
        </div>
        <div className="messages">
          {messages.map((m) => (
            <div key={m.id} className={`bubble ${m.role === "ai" ? "ai" : m.role === "system" ? "system" : "user"}`}>
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="thinking">
              <div className="dot" /><div className="dot" /><div className="dot" />
            </div>
          )}
          <div ref={messagesEnd} />
        </div>
        <div className="quick-btns">
          {quickButtons.map((b) => (
            <button key={b} className="qbtn" onClick={() => sendMessage(b)} disabled={loading}>{b}</button>
          ))}
        </div>
        <div className="input-area">
          <button className={`mic-btn ${recording ? "recording" : ""}`} onClick={startMic}>
            {recording ? "🔴 Stop" : "🎙️"}
          </button>
          <textarea ref={textareaRef} className="text-input" value={input} onChange={handleTextarea} onKeyDown={handleKey} placeholder="Type your answer… or press 🎙️ to speak" rows={1} disabled={loading} />
          <button className="send-btn" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>➤</button>
        </div>
      </div>
    </>
  );
}
