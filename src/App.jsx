import { useState, useEffect, useRef } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

const LESSONS = [
  { id: 1, level: "Vowels", emoji: "🔴", words: [
    { word: "APE",   phonetic: "/eɪp/",  hint: "Say the letter A — long A sound",     sentence: "An ape swings in trees." },
    { word: "EGG",   phonetic: "/ɛɡ/",   hint: "Short E — like 'eh'",                 sentence: "Crack an egg gently." },
    { word: "INK",   phonetic: "/ɪŋk/",  hint: "Short I — like 'ih'",                 sentence: "The ink is black." },
    { word: "OX",    phonetic: "/ɒks/",  hint: "Short O — mouth open and round",      sentence: "An ox is very strong." },
    { word: "UP",    phonetic: "/ʌp/",   hint: "Short U — like 'uh'",                 sentence: "Jump up high!" },
  ]},
  { id: 2, level: "Letters", emoji: "🔤", words: [
    { word: "BAT",   phonetic: "/bæt/",  hint: "B is a lip-pop. A is short. T clicks.", sentence: "Hit the ball with a bat." },
    { word: "CAT",   phonetic: "/kæt/",  hint: "C is a throat click. A-T at the end.", sentence: "The cat sleeps all day." },
    { word: "DOG",   phonetic: "/dɒɡ/",  hint: "D-tongue tip. O is short. G at back.", sentence: "My dog loves to run." },
    { word: "FAN",   phonetic: "/fæn/",  hint: "F-teeth on lip. A-N at the end.",      sentence: "Turn on the fan please." },
    { word: "HAT",   phonetic: "/hæt/",  hint: "H is just a breath. A short. T click.",sentence: "She wore a big hat." },
    { word: "JAM",   phonetic: "/dʒæm/", hint: "J is a push sound. A-M at the end.",  sentence: "I love strawberry jam." },
  ]},
  { id: 3, level: "Blends", emoji: "🔗", words: [
    { word: "FROG",  phonetic: "/frɒɡ/", hint: "FR blend — F then R quickly. Say frog!", sentence: "A frog jumped in the pond." },
    { word: "STAR",  phonetic: "/stɑː/", hint: "ST blend — S hiss then T click.",        sentence: "I see a bright star." },
    { word: "SHIP",  phonetic: "/ʃɪp/",  hint: "SH — like shushing someone. Shhh-ip.",  sentence: "The ship sailed far away." },
    { word: "CHIN",  phonetic: "/tʃɪn/", hint: "CH — like a train. Ch-ch-chin!",         sentence: "She rubbed her chin." },
    { word: "THIN",  phonetic: "/θɪn/",  hint: "TH — tongue BETWEEN teeth. Blow softly.",sentence: "The paper is very thin." },
    { word: "PHONE", phonetic: "/foʊn/", hint: "PH sounds like F. Phone = fone.",         sentence: "Call me on the phone." },
  ]},
  { id: 4, level: "Sentences", emoji: "📖", words: [
    { word: "GOOD MORNING",    phonetic: "/ɡʊd ˈmɔːr.nɪŋ/", hint: "Stress the first part: GOOD. Morning — stress MOR.", sentence: "We say this every day at school." },
    { word: "HOW ARE YOU",     phonetic: "/haʊ ɑːr juː/",    hint: "How — rhymes with cow. Link all words smoothly.",    sentence: "Ask your friend how they feel." },
    { word: "THANK YOU",       phonetic: "/θæŋk juː/",       hint: "TH — tongue between teeth. Then ank-you!",           sentence: "Always say thank you." },
    { word: "I LOVE ENGLISH",  phonetic: "/aɪ lʌv ˈɪŋ.ɡlɪʃ/",hint: "LOVE — the O sounds like UH. ING-lish.",           sentence: "Say it with confidence!" },
    { word: "CAN YOU HELP ME", phonetic: "/kæn juː hɛlp miː/",hint: "Link the words: can-you-help-me. No pauses.",       sentence: "Ask politely for help." },
  ]},
];

const speak = (text, rate = 0.85) => {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = rate; u.pitch = 1.05;
  const voices = speechSynthesis.getVoices();
  const pref = voices.find(v => v.lang === "en-US" && v.name.includes("Female"))
    || voices.find(v => v.lang === "en-US")
    || voices[0];
  if (pref) u.voice = pref;
  speechSynthesis.speak(u);
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{min-height:100%;background:#07061a}
body{font-family:'Nunito',sans-serif;color:#f0eeff;-webkit-tap-highlight-color:transparent}
.ll-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:12px;background:radial-gradient(ellipse at 50% 0%,#1a0f3a 0%,#07061a 70%)}
.ll-card{width:100%;max-width:480px;display:flex;flex-direction:column;gap:12px}
.ll-header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:rgba(255,255,255,0.06);border-radius:22px;border:1px solid rgba(255,255,255,0.08)}
.ll-logo{display:flex;align-items:center;gap:10px}
.ll-logo-icon{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.ll-logo-title{font-weight:900;font-size:1.15rem;background:linear-gradient(90deg,#c084fc,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.ll-logo-sub{font-size:0.65rem;color:#a89fd8;margin-top:-2px}
.ll-stars{display:flex;align-items:center;gap:6px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.25);border-radius:20px;padding:6px 14px;font-size:0.85rem;font-weight:800;color:#fbbf24;flex-shrink:0}
.ll-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.ll-tab{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:10px 4px;text-align:center;cursor:pointer;transition:all .2s;font-size:0.7rem;font-weight:800;color:#a89fd8;font-family:'Nunito',sans-serif}
.ll-tab.active{background:rgba(124,58,237,0.25);border-color:#7c3aed;color:#c084fc}
.ll-tab-icon{font-size:1.2rem;display:block;margin-bottom:3px}
.ll-word-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:28px;padding:22px 20px;text-align:center;cursor:pointer;transition:all .2s;position:relative;user-select:none}
.ll-word-card:active{transform:scale(0.98)}
.ll-hear-hint{position:absolute;top:12px;right:14px;background:rgba(124,58,237,0.3);border-radius:10px;padding:3px 10px;font-size:0.68rem;color:#c084fc;font-weight:700}
.ll-dots{display:flex;justify-content:center;gap:7px;margin-bottom:14px}
.ll-dot{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,0.12);transition:all .3s;flex-shrink:0}
.ll-dot.done{background:#10b981}
.ll-dot.active{background:#7c3aed;transform:scale(1.4)}
.ll-word-big{font-size:clamp(2rem,8vw,3.2rem);font-weight:900;color:#fff;letter-spacing:3px;display:block;margin-bottom:8px}
.ll-phonetic{font-size:1rem;color:#c084fc;margin-bottom:6px}
.ll-hint-text{font-size:0.78rem;color:#a89fd8}
.ll-sentence{background:rgba(124,58,237,0.1);border-left:3px solid #7c3aed;border-radius:0 14px 14px 0;padding:10px 16px;font-size:0.88rem;color:#d4c8ff;font-style:italic;line-height:1.5}
.ll-tip{background:rgba(255,255,255,0.04);border-radius:16px;padding:12px 16px;font-size:0.82rem;color:#c084fc;line-height:1.6;display:flex;gap:8px;align-items:flex-start}
.ll-status{text-align:center;font-size:0.82rem;color:#a89fd8;min-height:22px;transition:color .3s;font-weight:700}
.ll-status.listening{color:#ef4444;animation:blink 1s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.5}}
.ll-result{border-radius:22px;padding:18px;text-align:center;transition:all .3s}
.ll-result.great{background:rgba(16,185,129,0.12);border:2px solid rgba(16,185,129,0.3)}
.ll-result.ok{background:rgba(251,191,36,0.12);border:2px solid rgba(251,191,36,0.25)}
.ll-result.retry{background:rgba(239,68,68,0.12);border:2px solid rgba(239,68,68,0.25)}
.ll-score{font-size:2.6rem;font-weight:900;margin-bottom:4px}
.ll-result.great .ll-score{color:#10b981}
.ll-result.ok .ll-score{color:#fbbf24}
.ll-result.retry .ll-score{color:#ef4444}
.ll-result-msg{font-size:0.95rem;font-weight:800;margin-bottom:6px}
.ll-result-detail{font-size:0.8rem;color:#a89fd8;line-height:1.5}
.ll-btn-row{display:grid;gap:10px}
.ll-btn-row.two{grid-template-columns:1fr 1fr}
.ll-btn{padding:16px;border-radius:18px;border:none;font-family:'Nunito',sans-serif;font-size:0.95rem;font-weight:800;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px;-webkit-tap-highlight-color:transparent}
.ll-btn:active{transform:scale(0.97)}
.ll-btn-mic{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-size:1rem}
.ll-btn-mic.recording{animation:pulse-mic 1s infinite;background:linear-gradient(135deg,#ef4444,#dc2626)}
@keyframes pulse-mic{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,0.5)}50%{box-shadow:0 0 0 14px rgba(220,38,38,0)}}
.ll-btn-hear{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff}
.ll-btn-next{background:linear-gradient(135deg,#059669,#047857);color:#fff}
.ll-btn-again{background:rgba(255,255,255,0.08);color:#f0eeff;border:1px solid rgba(255,255,255,0.12)}
.ll-ai-thinking{display:flex;align-items:center;gap:8px;justify-content:center;padding:14px;background:rgba(124,58,237,0.1);border-radius:16px;font-size:0.85rem;color:#c084fc;font-weight:700}
.ll-dot-anim{width:7px;height:7px;border-radius:50%;background:#c084fc;animation:bounce .9s infinite}
.ll-dot-anim:nth-child(2){animation-delay:.15s}
.ll-dot-anim:nth-child(3){animation-delay:.3s}
@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
.ll-badge{position:fixed;top:18px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#1a1200;padding:10px 26px;border-radius:22px;font-weight:900;font-size:0.95rem;z-index:999;white-space:nowrap;animation:badge-anim 2.8s forwards}
@keyframes badge-anim{0%{opacity:0;transform:translateX(-50%) translateY(-16px) scale(.85)}15%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.04)}85%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-10px) scale(.95)}}
.ll-onboard{display:flex;flex-direction:column;gap:14px;padding:8px 0}
.ll-onboard-hero{text-align:center;padding:20px 0 10px}
.ll-onboard-hero h1{font-size:clamp(1.6rem,6vw,2.2rem);font-weight:900;margin-bottom:8px}
.ll-onboard-hero p{color:#a89fd8;font-size:0.9rem;line-height:1.6}
.ll-age-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.ll-age-btn{background:rgba(255,255,255,0.06);border:2px solid transparent;border-radius:18px;padding:18px 8px;cursor:pointer;transition:all .2s;text-align:center;font-family:'Nunito',sans-serif;color:#f0eeff;font-weight:800}
.ll-age-btn:hover,.ll-age-btn.sel{background:rgba(124,58,237,0.2);border-color:#7c3aed;color:#c084fc}
.ll-age-btn-icon{font-size:2rem;display:block;margin-bottom:6px}
.ll-name-input{width:100%;background:rgba(255,255,255,0.07);border:2px solid rgba(124,58,237,0.3);border-radius:16px;padding:16px 20px;color:#f0eeff;font-family:'Nunito',sans-serif;font-size:1rem;font-weight:700;outline:none;text-align:center;transition:border-color .2s}
.ll-name-input:focus{border-color:#7c3aed}
.ll-name-input::placeholder{color:#a89fd8;font-weight:400}
.ll-start-btn{background:linear-gradient(135deg,#7c3aed,#ec4899);border:none;border-radius:18px;padding:18px;color:#fff;font-family:'Nunito',sans-serif;font-size:1.1rem;font-weight:900;cursor:pointer;transition:transform .15s;width:100%}
.ll-start-btn:active{transform:scale(0.98)}
.ll-progress{background:rgba(255,255,255,0.05);border-radius:14px;padding:10px 16px}
.ll-prog-top{display:flex;justify-content:space-between;font-size:0.72rem;color:#a89fd8;margin-bottom:6px;font-weight:700}
.ll-prog-bar{height:7px;background:rgba(255,255,255,0.08);border-radius:8px;overflow:hidden}
.ll-prog-fill{height:100%;background:linear-gradient(90deg,#7c3aed,#ec4899);border-radius:8px;transition:width .5s ease}
`;

export default function LingoLeap() {
  const [screen, setScreen] = useState("onboard");
  const [name, setName] = useState("");
  const [age, setAge] = useState(null);
  const [module, setModule] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [recording, setRecording] = useState(false);
  const [heard, setHeard] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [result, setResult] = useState(null);
  const [badge, setBadge] = useState(null);
  const recRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    speechSynthesis.getVoices();
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [result, aiThinking, heard]);

  const lesson = LESSONS[module];
  const item = lesson.words[wordIdx];

  function startApp() {
    if (!name.trim()) { alert("Please enter your name!"); return; }
    if (!age) { alert("Please select your age!"); return; }
    setScreen("main");
    setTimeout(() => speak(`Welcome to LingoLeap, ${name}! Let's learn to pronounce English perfectly!`), 400);
  }

  function switchModule(i) {
    setModule(i); setWordIdx(0); resetResult();
    setTimeout(() => speak(`${LESSONS[i].level} module. Let's go!`), 200);
  }

  function resetResult() { setResult(null); setHeard(null); }

  function hearWord() {
    speak(item.word.toLowerCase(), 0.7);
    setTimeout(() => speak(item.sentence, 0.85), 1800);
  }

  function toggleMic() {
    if (recording) { recRef.current?.stop(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      speak("Sorry, microphone not supported. Please use Google Chrome.");
      return;
    }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 3;
    rec.onstart = () => setRecording(true);
    rec.onresult = (e) => {
      const said = e.results[0][0].transcript;
      setHeard(said);
      judgeWithClaude(said);
    };
    rec.onerror = () => { setRecording(false); speak("I couldn't hear you. Please try again!"); };
    rec.onend = () => setRecording(false);
    rec.start();
    setTimeout(() => rec.stop(), 7000);
  }

  async function judgeWithClaude(said) {
    setAiThinking(true);
    setResult(null);
    const target = item.word;
    const phonetic = item.phonetic;
    const hint = item.hint;
    const prompt = `You are a friendly English pronunciation coach for children aged 5-20.

The student was asked to say: "${target}" (phonetic: ${phonetic})
Pronunciation tip: ${hint}
The speech recognition heard them say: "${said}"

Evaluate their pronunciation. Be warm and encouraging. Respond ONLY with a JSON object like this:
{
  "score": 85,
  "grade": "great",
  "message": "Amazing job!",
  "detail": "Your T sound was perfect! The A vowel was very clear.",
  "spoken_feedback": "Amazing! You said it really well! The word is ${target}. You scored 85 percent!"
}

grade must be: "great" (score 80+), "ok" (score 50-79), or "retry" (score below 50).
Score how close the student said "${said}" compared to the target "${target}".
spoken_feedback is what will be spoken aloud to the child — keep it short, warm, specific.
Return ONLY valid JSON, nothing else.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 300,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      speak(parsed.spoken_feedback || `You said ${said}. The correct word is ${target}. Try again!`);
      if (parsed.grade === "great") {
        const newStars = stars + (parsed.score >= 95 ? 2 : 1);
        setStars(newStars);
        if ([5, 10, 20, 30, 50].includes(newStars)) {
          triggerBadge(
            newStars === 5 ? "🌟 First 5 Stars!" :
            newStars === 10 ? "🏅 10 Stars!" :
            newStars === 20 ? "🏆 Word Wizard!" :
            newStars === 30 ? "🏆 Pronunciation Pro!" : "🏆 Champion!"
          );
        }
      }
    } catch {
      setResult({ score: 0, grade: "retry", message: "Try again!", detail: "Could not connect. Check your internet.", spoken_feedback: "Please try again!" });
      speak("Please try again!");
    }
    setAiThinking(false);
  }

  function triggerBadge(text) {
    setBadge(text);
    speak(text.replace(/[🌟🏅🏆]/g, ""));
    setTimeout(() => setBadge(null), 2800);
  }

  function nextWord() {
    if (wordIdx < lesson.words.length - 1) {
      setWordIdx(wordIdx + 1);
      resetResult();
      setTimeout(() => speak(LESSONS[module].words[wordIdx + 1].word.toLowerCase(), 0.7), 300);
    } else {
      triggerBadge("🏆 Module Complete!");
      if (module < LESSONS.length - 1) setTimeout(() => switchModule(module + 1), 2500);
    }
  }

  if (screen === "onboard") return (
    <div className="ll-wrap">
      {badge && <div className="ll-badge">{badge}</div>}
      <div className="ll-card">
        <div className="ll-header">
          <div className="ll-logo">
            <div className="ll-logo-icon">🎤</div>
            <div>
              <div className="ll-logo-title">LingoLeap</div>
              <div className="ll-logo-sub">English Pronunciation Coach</div>
            </div>
          </div>
        </div>
        <div className="ll-onboard">
          <div className="ll-onboard-hero">
            <div style={{fontSize:"3.5rem",marginBottom:"12px"}}>🎤</div>
            <h1>Learn to Speak<br/>English Perfectly!</h1>
            <p style={{marginTop:"10px"}}>Speak a word → AI listens → tells you exactly how you did!</p>
          </div>
          <input
            className="ll-name-input"
            placeholder="What is your name?"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && startApp()}
            maxLength={24}
          />
          <div className="ll-age-grid">
            {[["🐣","5 – 9","5-9"],["🌿","10 – 14","10-14"],["🚀","15+","15+"]].map(([icon,label,val]) => (
              <button key={val} className={`ll-age-btn${age===val?" sel":""}`} onClick={() => setAge(val)}>
                <span className="ll-age-btn-icon">{icon}</span>{label}
              </button>
            ))}
          </div>
          <button className="ll-start-btn" onClick={startApp}>Start Learning! 🚀</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ll-wrap">
      {badge && <div className="ll-badge">{badge}</div>}
      <div className="ll-card">
        <div className="ll-header">
          <div className="ll-logo">
            <div className="ll-logo-icon">🎤</div>
            <div>
              <div className="ll-logo-title">LingoLeap</div>
              <div className="ll-logo-sub">Hi {name}! 👋</div>
            </div>
          </div>
          <div className="ll-stars">⭐ {stars}</div>
        </div>

        <div className="ll-progress">
          <div className="ll-prog-top">
            <span>{lesson.emoji} {lesson.level}</span>
            <span>{wordIdx} / {lesson.words.length} words</span>
          </div>
          <div className="ll-prog-bar">
            <div className="ll-prog-fill" style={{width:`${(wordIdx/lesson.words.length)*100}%`}} />
          </div>
        </div>

        <div className="ll-tabs">
          {LESSONS.map((l,i) => (
            <button key={i} className={`ll-tab${module===i?" active":""}`} onClick={() => switchModule(i)}>
              <span className="ll-tab-icon">{l.emoji}</span>{l.level}
            </button>
          ))}
        </div>

        <div className="ll-word-card" onClick={hearWord}>
          <div className="ll-hear-hint">🔊 tap to hear</div>
          <div className="ll-dots">
            {lesson.words.map((_,i) => (
              <div key={i} className={`ll-dot${i<wordIdx?" done":i===wordIdx?" active":""}`} />
            ))}
          </div>
          <span className="ll-word-big">{item.word}</span>
          <div className="ll-phonetic">{item.phonetic}</div>
          <div className="ll-hint-text">Tap to hear how it sounds</div>
        </div>

        <div className="ll-sentence">{item.sentence}</div>

        <div className="ll-tip">
          <span style={{fontSize:"1.2rem",flexShrink:0}}>👄</span>
          <span>{item.hint}</span>
        </div>

        <div className={`ll-status${recording?" listening":""}`}>
          {recording ? "🔴 Listening… say the word now!" : heard ? `You said: "${heard}"` : `Tap 🎙️ and say the word out loud!`}
        </div>

        {aiThinking && (
          <div className="ll-ai-thinking">
            <div className="ll-dot-anim"/><div className="ll-dot-anim"/><div className="ll-dot-anim"/>
            <span>AI is judging your pronunciation…</span>
          </div>
        )}

        {result && !aiThinking && (
          <div className={`ll-result ${result.grade}`}>
            <div className="ll-score">{result.score}%</div>
            <div className="ll-result-msg">{result.message}</div>
            <div className="ll-result-detail">{result.detail}</div>
          </div>
        )}

        <div className="ll-btn-row two">
          <button className={`ll-btn ll-btn-mic${recording?" recording":""}`} onClick={toggleMic} disabled={aiThinking}>
            {recording ? "🔴 Stop" : "🎙️ Speak"}
          </button>
          <button className="ll-btn ll-btn-hear" onClick={hearWord} disabled={aiThinking}>
            🔊 Hear It
          </button>
        </div>

        {result && (
          <div className="ll-btn-row two">
            <button className="ll-btn ll-btn-next" onClick={nextWord}>Next ➜</button>
            <button className="ll-btn ll-btn-again" onClick={resetResult}>Try Again</button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
