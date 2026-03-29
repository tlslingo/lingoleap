import { useState, useEffect, useRef, useCallback } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

const LESSONS = [
  { id: 1, level: "Vowels", emoji: "🔴", words: [
    { word: "APE",   phonetic: "/eɪp/",  hint: "Say the letter A — long A sound",      sentence: "An ape swings in trees." },
    { word: "EGG",   phonetic: "/ɛɡ/",   hint: "Short E — like 'eh'",                  sentence: "Crack an egg gently." },
    { word: "INK",   phonetic: "/ɪŋk/",  hint: "Short I — like 'ih'",                  sentence: "The ink is black." },
    { word: "OX",    phonetic: "/ɒks/",  hint: "Short O — mouth open and round",       sentence: "An ox is very strong." },
    { word: "UP",    phonetic: "/ʌp/",   hint: "Short U — like 'uh'",                  sentence: "Jump up high!" },
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
    { word: "FROG",  phonetic: "/frɒɡ/", hint: "FR blend — F then R quickly.",          sentence: "A frog jumped in the pond." },
    { word: "STAR",  phonetic: "/stɑː/", hint: "ST blend — S hiss then T click.",       sentence: "I see a bright star." },
    { word: "SHIP",  phonetic: "/ʃɪp/",  hint: "SH — like shushing someone. Shhh!",    sentence: "The ship sailed far away." },
    { word: "CHIN",  phonetic: "/tʃɪn/", hint: "CH — like a train. Ch-ch-chin!",        sentence: "She rubbed her chin." },
    { word: "THIN",  phonetic: "/θɪn/",  hint: "TH — tongue BETWEEN teeth. Blow.",     sentence: "The paper is very thin." },
    { word: "PHONE", phonetic: "/foʊn/", hint: "PH sounds like F. Phone = fone.",        sentence: "Call me on the phone." },
  ]},
  { id: 4, level: "Sentences", emoji: "📖", words: [
    { word: "GOOD MORNING",    phonetic: "/ɡʊd ˈmɔːr.nɪŋ/", hint: "Stress GOOD. Morning — stress MOR.",    sentence: "We say this every day at school." },
    { word: "HOW ARE YOU",     phonetic: "/haʊ ɑːr juː/",    hint: "How rhymes with cow. Link all words.",  sentence: "Ask your friend how they feel." },
    { word: "THANK YOU",       phonetic: "/θæŋk juː/",       hint: "TH — tongue between teeth. Ank-you!",  sentence: "Always say thank you." },
    { word: "I LOVE ENGLISH",  phonetic: "/aɪ lʌv ˈɪŋ.ɡlɪʃ/",hint: "LOVE — O sounds like UH. ING-lish.", sentence: "Say it with confidence!" },
    { word: "CAN YOU HELP ME", phonetic: "/kæn juː hɛlp miː/",hint: "Link words: can-you-help-me.",        sentence: "Ask politely for help." },
  ]},
];

function getBestVoice() {
  const voices = speechSynthesis.getVoices();
  const preferred = [
    "Google US English","Google UK English Female","Samantha","Karen",
    "Moira","Tessa","Fiona","Victoria","Allison","Ava","Susan",
    "Microsoft Aria","Microsoft Jenny","Microsoft Zira"
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }
  return voices.find(v => v.lang === "en-US" && !v.name.includes("compact"))
    || voices.find(v => v.lang.startsWith("en"))
    || voices[0];
}

function speak(text, rate = 0.88) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = rate; u.pitch = 1.0;
  const voice = getBestVoice();
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{min-height:100%;background:#07061a}
body{font-family:'Nunito',sans-serif;color:#f0eeff;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}
.ll-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:12px 10px 24px;background:radial-gradient(ellipse at 50% 0%,#1a0f3a 0%,#07061a 70%)}
.ll-card{width:100%;max-width:480px;display:flex;flex-direction:column;gap:11px}
.ll-header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:rgba(255,255,255,0.06);border-radius:22px;border:1px solid rgba(255,255,255,0.08)}
.ll-logo{display:flex;align-items:center;gap:10px}
.ll-logo-icon{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.ll-logo-title{font-weight:900;font-size:1.15rem;background:linear-gradient(90deg,#c084fc,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.ll-logo-sub{font-size:0.65rem;color:#a89fd8;margin-top:-2px}
.ll-stars{display:flex;align-items:center;gap:6px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.25);border-radius:20px;padding:6px 14px;font-size:0.85rem;font-weight:800;color:#fbbf24;flex-shrink:0}
.ll-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.ll-tab{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:10px 4px;text-align:center;cursor:pointer;transition:all .2s;font-size:0.7rem;font-weight:800;color:#a89fd8;font-family:'Nunito',sans-serif;user-select:none}
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
.ll-waveform-wrap{background:rgba(0,0,0,0.3);border-radius:18px;border:1px solid rgba(124,58,237,0.2);padding:10px 12px;height:80px;display:flex;align-items:center;justify-content:center;transition:border-color .3s;overflow:hidden}
.ll-waveform-wrap.active{border-color:rgba(239,68,68,0.5)}
.ll-waveform-idle{display:flex;align-items:center;gap:3px;height:100%}
.ll-waveform-idle span{display:block;width:3px;border-radius:3px;background:rgba(124,58,237,0.3);animation:idle-wave 1.5s ease-in-out infinite}
@keyframes idle-wave{0%,100%{transform:scaleY(1);opacity:.3}50%{transform:scaleY(1.6);opacity:.6}}
.ll-status{text-align:center;font-size:0.82rem;color:#a89fd8;min-height:22px;font-weight:700;transition:color .3s}
.ll-status.listening{color:#ef4444}
.ll-status.processing{color:#c084fc}
.ll-heard{background:rgba(255,255,255,0.05);border-radius:14px;padding:10px 16px;font-size:0.85rem;text-align:center}
.ll-heard-label{font-size:0.68rem;color:#a89fd8;margin-bottom:4px}
.ll-heard-val{font-weight:800;color:#f0eeff;font-size:1rem}
.ll-result{border-radius:22px;padding:18px;text-align:center}
.ll-result.great{background:rgba(16,185,129,0.12);border:2px solid rgba(16,185,129,0.3)}
.ll-result.ok{background:rgba(251,191,36,0.12);border:2px solid rgba(251,191,36,0.25)}
.ll-result.retry{background:rgba(239,68,68,0.12);border:2px solid rgba(239,68,68,0.25)}
.ll-score{font-size:2.6rem;font-weight:900;margin-bottom:4px}
.ll-result.great .ll-score{color:#10b981}
.ll-result.ok .ll-score{color:#fbbf24}
.ll-result.retry .ll-score{color:#ef4444}
.ll-result-msg{font-size:0.95rem;font-weight:800;margin-bottom:6px}
.ll-result-detail{font-size:0.8rem;color:#a89fd8;line-height:1.5}
.ll-mic-area{display:flex;flex-direction:column;align-items:center;gap:8px}
.ll-hold-btn{width:100%;padding:0;border:none;border-radius:22px;background:linear-gradient(135deg,#dc2626,#b91c1c);cursor:pointer;font-family:'Nunito',sans-serif;font-weight:900;font-size:1rem;color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;height:64px;transition:transform .1s,box-shadow .2s;user-select:none;-webkit-user-select:none;touch-action:none;position:relative;overflow:hidden}
.ll-hold-btn.holding{transform:scale(0.97);box-shadow:0 0 0 4px rgba(239,68,68,0.3),0 0 0 8px rgba(239,68,68,0.15);background:linear-gradient(135deg,#ef4444,#dc2626);animation:pulse-hold 0.8s infinite}
.ll-hold-btn-fill{position:absolute;left:0;top:0;height:100%;background:rgba(255,255,255,0.15);transition:width .1s linear;border-radius:22px}
@keyframes pulse-hold{0%,100%{box-shadow:0 0 0 4px rgba(239,68,68,0.4),0 0 0 12px rgba(239,68,68,0.1)}50%{box-shadow:0 0 0 6px rgba(239,68,68,0.5),0 0 0 16px rgba(239,68,68,0.15)}}
.ll-hold-hint{font-size:0.72rem;color:#a89fd8;text-align:center;font-weight:700}
.ll-hold-hint.active{color:#ef4444}
.ll-btn-hear{width:100%;padding:16px;border-radius:18px;border:none;font-family:'Nunito',sans-serif;font-size:0.95rem;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s}
.ll-btn-hear:active{transform:scale(0.97)}
.ll-action-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ll-btn-next{padding:16px;border-radius:18px;border:none;font-family:'Nunito',sans-serif;font-size:0.95rem;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#059669,#047857);color:#fff;transition:all .15s}
.ll-btn-again{padding:16px;border-radius:18px;border:1px solid rgba(255,255,255,0.12);font-family:'Nunito',sans-serif;font-size:0.95rem;font-weight:800;cursor:pointer;background:rgba(255,255,255,0.07);color:#f0eeff;transition:all .15s}
.ll-btn-next:active,.ll-btn-again:active{transform:scale(0.97)}
.ll-ai-thinking{display:flex;align-items:center;gap:8px;justify-content:center;padding:14px;background:rgba(124,58,237,0.1);border-radius:16px;font-size:0.85rem;color:#c084fc;font-weight:700}
.ll-dot-anim{width:7px;height:7px;border-radius:50%;background:#c084fc;animation:bounce .9s infinite}
.ll-dot-anim:nth-child(2){animation-delay:.15s}
.ll-dot-anim:nth-child(3){animation-delay:.3s}
@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
.ll-badge{position:fixed;top:18px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#1a1200;padding:10px 26px;border-radius:22px;font-weight:900;font-size:0.95rem;z-index:999;white-space:nowrap;animation:badge-anim 2.8s forwards;pointer-events:none}
@keyframes badge-anim{0%{opacity:0;transform:translateX(-50%) translateY(-16px) scale(.85)}15%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.04)}85%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-10px) scale(.95)}}
.ll-progress{background:rgba(255,255,255,0.05);border-radius:14px;padding:10px 16px}
.ll-prog-top{display:flex;justify-content:space-between;font-size:0.72rem;color:#a89fd8;margin-bottom:6px;font-weight:700}
.ll-prog-bar{height:7px;background:rgba(255,255,255,0.08);border-radius:8px;overflow:hidden}
.ll-prog-fill{height:100%;background:linear-gradient(90deg,#7c3aed,#ec4899);border-radius:8px;transition:width .5s ease}
.ll-onboard{display:flex;flex-direction:column;gap:14px;padding:8px 0}
.ll-onboard-hero{text-align:center;padding:20px 0 10px}
.ll-onboard-hero h1{font-size:clamp(1.6rem,6vw,2.2rem);font-weight:900;margin-bottom:8px}
.ll-onboard-hero p{color:#a89fd8;font-size:0.9rem;line-height:1.6}
.ll-age-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.ll-age-btn{background:rgba(255,255,255,0.06);border:2px solid transparent;border-radius:18px;padding:18px 8px;cursor:pointer;transition:all .2s;text-align:center;font-family:'Nunito',sans-serif;color:#f0eeff;font-weight:800}
.ll-age-btn.sel{background:rgba(124,58,237,0.2);border-color:#7c3aed;color:#c084fc}
.ll-age-btn-icon{font-size:2rem;display:block;margin-bottom:6px}
.ll-name-input{width:100%;background:rgba(255,255,255,0.07);border:2px solid rgba(124,58,237,0.3);border-radius:16px;padding:16px 20px;color:#f0eeff;font-family:'Nunito',sans-serif;font-size:1rem;font-weight:700;outline:none;text-align:center;transition:border-color .2s}
.ll-name-input:focus{border-color:#7c3aed}
.ll-name-input::placeholder{color:#a89fd8;font-weight:400}
.ll-start-btn{background:linear-gradient(135deg,#7c3aed,#ec4899);border:none;border-radius:18px;padding:18px;color:#fff;font-family:'Nunito',sans-serif;font-size:1.1rem;font-weight:900;cursor:pointer;width:100%;transition:transform .15s}
.ll-start-btn:active{transform:scale(0.98)}
`;

export default function LingoLeap() {
  const [screen, setScreen] = useState("onboard");
  const [name, setName] = useState("");
  const [age, setAge] = useState(null);
  const [module, setModule] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [holding, setHolding] = useState(false);
  const [heard, setHeard] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [result, setResult] = useState(null);
  const [badge, setBadge] = useState(null);
  const [status, setStatus] = useState("Hold the mic button and speak!");
  const [holdProgress, setHoldProgress] = useState(0);

  const recRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const holdTimerRef = useRef(null);
  const heardRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [result, aiThinking, heard]);

  const lesson = LESSONS[module];
  const item = lesson.words[wordIdx];

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 48;
      const barW = (canvas.width / barCount) - 2;
      for (let i = 0; i < barCount; i++) {
        const val = dataArray[Math.floor(i * bufferLength / barCount)] / 255;
        const h = Math.max(4, val * canvas.height * 0.9);
        const x = i * (barW + 2);
        const y = (canvas.height - h) / 2;
        const r = Math.floor(180 + val * 60);
        const g = Math.floor(60 + val * 40);
        ctx.fillStyle = `rgba(${r},${g},237,${0.5 + val * 0.5})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h, 3);
        ctx.fill();
      }
    };
    draw();
  }, []);

  const stopWaveform = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const startWaveform = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth * 2;
        canvasRef.current.height = canvasRef.current.offsetHeight * 2;
      }
      drawWaveform();
    } catch (e) {
      console.log("Mic error", e);
    }
  }, [drawWaveform]);

  const startHold = useCallback(async (e) => {
    e.preventDefault();
    if (aiThinking || holding) return;
    speechSynthesis.cancel();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setStatus("Please use Google Chrome!"); return; }
    setHolding(true);
    setStatus("🔴 Listening… speak now!");
    setResult(null);
    setHeard(null);
    heardRef.current = null;
    setHoldProgress(0);
    await startWaveform();
    let prog = 0;
    holdTimerRef.current = setInterval(() => {
      prog = Math.min(100, prog + 1.5);
      setHoldProgress(prog);
    }, 100);
    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = true;
    rec.onresult = (ev) => {
      const said = ev.results[ev.results.length - 1][0].transcript;
      if (said) { heardRef.current = said; setHeard(said); }
    };
    rec.onerror = () => {};
    rec.start();
  }, [aiThinking, holding, startWaveform]);

  const endHold = useCallback(() => {
    if (!holding) return;
    setHolding(false);
    setHoldProgress(0);
    clearInterval(holdTimerRef.current);
    stopWaveform();
    if (recRef.current) { try { recRef.current.stop(); } catch(e){} }
    setStatus("⚙️ Processing…");
    setTimeout(() => {
      const finalHeard = heardRef.current;
      if (finalHeard) {
        judgeWithClaude(finalHeard);
      } else {
        setStatus("Didn't catch that. Hold and try again!");
        speak("I didn't catch that. Please try again!");
      }
    }, 700);
  }, [holding, stopWaveform]);

  function startApp() {
    if (!name.trim()) { alert("Please enter your name!"); return; }
    if (!age) { alert("Please select your age!"); return; }
    setScreen("main");
    setTimeout(() => speak(`Welcome to LingoLeap, ${name}! Tap any word to hear it. Then hold the microphone button to speak.`, 0.9), 500);
  }

  function switchModule(i) {
    setModule(i); setWordIdx(0); resetResult();
    setTimeout(() => speak(`${LESSONS[i].level} module. Let's go!`, 0.9), 200);
  }

  function resetResult() {
    setResult(null); setHeard(null); heardRef.current = null;
    setStatus("Hold the mic button and speak!");
  }

  function hearWord() {
    speak(`${item.word.toLowerCase()}. ${item.sentence}`, 0.82);
  }

  async function judgeWithClaude(said) {
    setAiThinking(true);
    setStatus("🤖 AI is judging your pronunciation…");
    const prompt = `You are a friendly English pronunciation coach for children and adults.
The student was asked to pronounce: "${item.word}" (phonetic: ${item.phonetic})
Tip: ${item.hint}
Speech recognition heard: "${said}"
Evaluate how close their pronunciation was. Be warm, specific, encouraging.
Respond ONLY with valid JSON, no markdown:
{"score":88,"grade":"great","message":"Excellent!","detail":"Your vowel was spot on! Clear ending.","spoken_feedback":"Excellent! 88 percent. Your vowel was perfect!"}
grade: "great" 80+, "ok" 50-79, "retry" below 50. spoken_feedback max 2 sentences.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 250, messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setStatus("");
      speak(parsed.spoken_feedback || `You scored ${parsed.score} percent!`, 0.88);
      if (parsed.grade === "great") {
        const ns = stars + (parsed.score >= 95 ? 2 : 1);
        setStars(ns);
        if ([5,10,20,30,50].includes(ns)) {
          const msg = ns===5?"🌟 First 5 Stars!":ns===10?"🏅 10 Stars!":ns===20?"🏆 Word Wizard!":ns===30?"🏆 Pronunciation Pro!":"🏆 Champion!";
          setBadge(msg);
          setTimeout(() => setBadge(null), 2800);
        }
      }
    } catch {
      setResult({ score: 0, grade: "retry", message: "Connection error", detail: "Check your internet and try again.", spoken_feedback: "Please try again!" });
      setStatus(""); speak("Please try again!");
    }
    setAiThinking(false);
  }

  function nextWord() {
    if (wordIdx < lesson.words.length - 1) {
      const next = wordIdx + 1;
      setWordIdx(next); resetResult();
      setTimeout(() => speak(LESSONS[module].words[next].word.toLowerCase(), 0.75), 400);
    } else {
      setBadge("🏆 Module Complete!");
      speak("Module complete! Great job!");
      setTimeout(() => setBadge(null), 2800);
      if (module < LESSONS.length - 1) setTimeout(() => switchModule(module + 1), 2600);
    }
  }

  if (screen === "onboard") return (
    <div className="ll-wrap">
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
            <h1>Speak English<br/>Perfectly!</h1>
            <p style={{marginTop:"10px"}}>Hear the word → hold the mic → AI judges your pronunciation!</p>
          </div>
          <input className="ll-name-input" placeholder="What is your name?" value={name}
            onChange={e => setName(e.target.value)} onKeyDown={e => e.key==="Enter"&&startApp()} maxLength={24} />
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
          <div className="ll-hint-text">Tap to hear pronunciation + example</div>
        </div>

        <div className="ll-sentence">{item.sentence}</div>

        <div className="ll-tip">
          <span style={{fontSize:"1.2rem",flexShrink:0}}>👄</span>
          <span>{item.hint}</span>
        </div>

        <div className={`ll-waveform-wrap${holding?" active":""}`}>
          {holding
            ? <canvas ref={canvasRef} style={{width:"100%",height:"100%"}} />
            : <div className="ll-waveform-idle">
                {Array.from({length:20}).map((_,i) => (
                  <span key={i} style={{animationDelay:`${i*0.07}s`,height:`${8+Math.sin(i)*10+10}px`}} />
                ))}
              </div>
          }
        </div>

        <div className={`ll-status${holding?" listening":aiThinking?" processing":""}`}>{status}</div>

        {heard && !holding && (
          <div className="ll-heard">
            <div className="ll-heard-label">I heard you say:</div>
            <div className="ll-heard-val">"{heard}"</div>
          </div>
        )}

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

        <div className="ll-mic-area">
          <button
            className={`ll-hold-btn${holding?" holding":""}`}
            onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
            onTouchStart={startHold} onTouchEnd={endHold}
            disabled={aiThinking}
          >
            <div className="ll-hold-btn-fill" style={{width:`${holdProgress}%`}} />
            <span style={{position:"relative",zIndex:1,fontSize:"1.4rem"}}>{holding?"🔴":"🎙️"}</span>
            <span style={{position:"relative",zIndex:1}}>{holding?"Release to Submit":"Hold to Speak"}</span>
          </button>
          <div className={`ll-hold-hint${holding?" active":""}`}>
            {holding?"🔴 Recording… release when done":"Press and hold while speaking, release when finished"}
          </div>
        </div>

        <button className="ll-btn-hear" onClick={hearWord} disabled={aiThinking||holding}>
          🔊 Hear the Word + Example
        </button>

        {result && !aiThinking && (
          <div className="ll-action-row">
            <button className="ll-btn-next" onClick={nextWord}>Next Word ➜</button>
            <button className="ll-btn-again" onClick={resetResult}>Try Again 🔄</button>
          </div>
        )}

        <div ref={bottomRef} style={{height:"8px"}} />
      </div>
    </div>
  );
}
