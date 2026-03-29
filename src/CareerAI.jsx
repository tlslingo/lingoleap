import { useState, useEffect, useRef, useCallback } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const RV_SCRIPT = "https://code.responsivevoice.org/responsivevoice.js?key=FREE";
const TLS_LOGO = "https://thelincolnschool.edu.pk/wp-content/uploads/2026/01/Red-and-Yellow-Modern-Shocking-Moments-YouTube-Thumbnail-1.png";

const SYSTEM_PROMPT = `You are CareerAI — a highly experienced, warm, and deeply knowledgeable career counsellor for The Lincoln School, specialising in Pakistan's job market. You have 20 years of experience helping students and professionals find their ideal career paths.

You are having a VOICE conversation. Keep responses conversational, max 3-4 sentences unless asked for detail. Be warm, encouraging, and honest. Specific to Pakistan's job market.

Your knowledge includes:
- Pakistan's top universities: LUMS, IBA, NUST, FAST, Aga Khan, UET, QAU, IoBM, NED, COMSATS, Bahria, Air University
- Pakistan's highest paying sectors: IT/tech, banking/finance, oil and gas, FMCG, telecom, medicine, engineering
- Salary ranges in PKR for major roles in 2024-2025
- Remote work and freelancing via Upwork, Fiverr, Toptal
- Gulf job market for Pakistani professionals (UAE, Saudi, Qatar, Kuwait)
- CSS/PMS exam paths for civil service
- Current demand: software engineers, data scientists, digital marketers, accountants, doctors, engineers

When analysing a CV, be specific about strengths, identify skill gaps honestly, suggest improvements, recommend job titles.

Always ask follow-up questions before giving advice. When the user says they are done or asks for a report, summarise everything discussed into a detailed career counselling report.`;

function speak(text, onEnd) {
  if (window.responsiveVoice && window.responsiveVoice.voiceSupport()) {
    window.responsiveVoice.cancel();
    window.responsiveVoice.speak(text, "UK English Female", { rate: 0.92, pitch: 1.0, volume: 1, onend: onEnd || function(){} });
  } else {
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.9;
    var voices = speechSynthesis.getVoices();
    var v = voices.find(function(x){ return x.name.includes("Google US English"); }) || voices.find(function(x){ return x.lang === "en-US"; }) || voices[0];
    if (v) u.voice = v;
    if (onEnd) u.onend = onEnd;
    speechSynthesis.speak(u);
  }
}

function stopSpeaking() {
  if (window.responsiveVoice) window.responsiveVoice.cancel();
  speechSynthesis.cancel();
}

var QUIZ = [
  { id:1, q:"Are you currently a student or working professional?", opts:["Student","Working Professional","Recently Graduated","Career Change"] },
  { id:2, q:"What is your highest level of education?", opts:["Matric / O-Levels","Intermediate / A-Levels","Bachelor's Degree","Master's or higher"] },
  { id:3, q:"Which field interests you most?", opts:["Technology & IT","Business & Finance","Medicine & Health","Engineering","Arts & Media","Law & Civil Service"] },
  { id:4, q:"What is your biggest career concern?", opts:["Finding my first job","Increasing my salary","Changing careers","Going abroad","Starting a business"] },
  { id:5, q:"How are your English communication skills?", opts:["Basic","Conversational","Fluent","Native-level"] },
];

var QUICK_QUESTIONS = [
  "What careers suit me?","Best universities in Pakistan?","How to increase my salary?",
  "Freelancing tips for Pakistan","Jobs in UAE from Pakistan","CSS exam guidance",
  "Best IT jobs in Pakistan 2025","How to get job in Gulf from Pakistan",
  "Highest paying jobs in Karachi","Should I do MBA or work?",
  "How to start freelancing in Pakistan","Salary negotiation tips"
];

var CSS_STYLES = [
  "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');",
  "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }",
  "html, body, #root { min-height: 100%; background: #f0f4ff; }",
  "body { font-family: 'Poppins', sans-serif; color: #1e293b; -webkit-tap-highlight-color: transparent; }",
  ".ca-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 12px 10px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); }",
  ".ca-card { width: 100%; max-width: 580px; display: flex; flex-direction: column; gap: 10px; }",

  ".ca-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #fff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }",
  ".ca-header-left { display: flex; align-items: center; gap: 10px; }",
  ".ca-header-logo { height: 48px; width: auto; border-radius: 8px; object-fit: contain; }",
  ".ca-header-text { display: flex; flex-direction: column; }",
  ".ca-header-title { font-size: 0.75rem; font-weight: 800; color: #c8102e; line-height: 1.2; text-transform: uppercase; letter-spacing: 0.5px; }",
  ".ca-header-sub { font-size: 0.65rem; color: #64748b; font-weight: 500; }",
  ".ca-mode-btns { display: flex; gap: 6px; }",
  ".ca-mode-btn { padding: 6px 12px; border-radius: 10px; border: 2px solid #e2e8f0; background: #fff; color: #64748b; font-family: 'Poppins', sans-serif; font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }",
  ".ca-mode-btn.active { background: #c8102e; border-color: #c8102e; color: #fff; }",

  ".ca-tab-bar { display: flex; gap: 6px; }",
  ".ca-tab { flex: 1; padding: 10px 6px; border-radius: 14px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.2); color: #fff; font-family: 'Poppins', sans-serif; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: all 0.2s; text-align: center; }",
  ".ca-tab.active { background: #fff; border-color: #fff; color: #c8102e; }",

  ".ca-messages { display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; padding: 4px 2px; }",
  ".ca-messages::-webkit-scrollbar { width: 4px; }",
  ".ca-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 4px; }",
  ".ca-bubble { max-width: 88%; padding: 12px 16px; border-radius: 18px; line-height: 1.6; font-size: 0.88rem; animation: fadeUp 0.3s ease; }",
  "@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }",
  ".ca-bubble.ai { background: #fff; border: 2px solid #e2e8f0; align-self: flex-start; border-bottom-left-radius: 5px; color: #1e293b; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }",
  ".ca-bubble.user { background: linear-gradient(135deg,#c8102e,#9b0d23); align-self: flex-end; border-bottom-right-radius: 5px; color: #fff; box-shadow: 0 2px 12px rgba(200,16,46,0.4); }",
  ".ca-bubble.system { background: rgba(255,255,255,0.9); border: 2px solid rgba(200,16,46,0.3); align-self: center; text-align: center; font-size: 0.75rem; color: #c8102e; border-radius: 12px; padding: 8px 16px; max-width: 100%; font-weight: 600; }",

  ".ca-thinking { display: flex; align-items: center; gap: 6px; padding: 12px 16px; background: #fff; border: 2px solid #e2e8f0; border-radius: 18px; border-bottom-left-radius: 5px; align-self: flex-start; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }",
  ".ca-dot { width: 7px; height: 7px; border-radius: 50%; background: #c8102e; animation: bounce 0.9s infinite; }",
  ".ca-dot:nth-child(2) { animation-delay: 0.15s; }",
  ".ca-dot:nth-child(3) { animation-delay: 0.3s; }",
  "@keyframes bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-5px); opacity: 1; } }",

  ".ca-speaking-indicator { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(255,255,255,0.9); border-radius: 12px; border: 2px solid rgba(200,16,46,0.3); align-self: flex-start; font-size: 0.72rem; color: #c8102e; font-weight: 700; }",
  ".ca-speak-wave { display: flex; align-items: center; gap: 2px; }",
  ".ca-speak-wave span { display: block; width: 3px; border-radius: 2px; background: #c8102e; animation: speak-wave 0.8s ease-in-out infinite; }",
  ".ca-speak-wave span:nth-child(2) { animation-delay: 0.1s; }",
  ".ca-speak-wave span:nth-child(3) { animation-delay: 0.2s; }",
  ".ca-speak-wave span:nth-child(4) { animation-delay: 0.3s; }",
  "@keyframes speak-wave { 0%,100% { height: 4px; } 50% { height: 14px; } }",

  ".ca-waveform { background: rgba(255,255,255,0.9); border-radius: 16px; border: 2px solid rgba(200,16,46,0.3); height: 64px; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 8px 12px; transition: border-color 0.3s; }",
  ".ca-waveform.active { border-color: #c8102e; background: rgba(200,16,46,0.05); }",
  ".ca-waveform-idle { display: flex; align-items: center; gap: 3px; }",
  ".ca-waveform-idle span { display: block; width: 3px; border-radius: 3px; background: rgba(200,16,46,0.3); animation: idle-wave 2s ease-in-out infinite; }",
  "@keyframes idle-wave { 0%,100% { transform: scaleY(1); opacity: 0.3; } 50% { transform: scaleY(2); opacity: 0.7; } }",

  ".ca-input-area { display: flex; gap: 8px; align-items: flex-end; }",
  ".ca-text-input { flex: 1; background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 12px 16px; color: #1e293b; font-family: 'Poppins', sans-serif; font-size: 0.85rem; resize: none; outline: none; min-height: 46px; max-height: 120px; line-height: 1.5; transition: border-color 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }",
  ".ca-text-input:focus { border-color: #c8102e; }",
  ".ca-text-input::placeholder { color: #94a3b8; }",
  ".ca-send-btn { width: 46px; height: 46px; border-radius: 14px; border: none; background: linear-gradient(135deg,#c8102e,#9b0d23); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; transition: transform 0.15s; box-shadow: 0 4px 12px rgba(200,16,46,0.4); }",
  ".ca-send-btn:active { transform: scale(0.95); }",
  ".ca-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }",

  ".ca-mic-btn { width: 100%; height: 58px; border-radius: 18px; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 0.95rem; color: #fff; display: flex; align-items: center; justify-content: center; gap: 10px; touch-action: none; user-select: none; -webkit-user-select: none; position: relative; overflow: hidden; transition: transform 0.1s; }",
  ".ca-mic-btn.idle { background: linear-gradient(135deg,#c8102e,#9b0d23); box-shadow: 0 6px 20px rgba(200,16,46,0.5); }",
  ".ca-mic-btn.holding { background: linear-gradient(135deg,#ef4444,#c8102e); transform: scale(0.97); animation: mic-pulse 0.8s infinite; }",
  ".ca-mic-btn:disabled { opacity: 0.4; cursor: not-allowed; }",
  ".ca-mic-btn-fill { position: absolute; left: 0; top: 0; height: 100%; background: rgba(255,255,255,0.25); transition: width 0.08s linear; border-radius: 18px 0 0 18px; }",
  "@keyframes mic-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(200,16,46,0.6); } 50% { box-shadow: 0 0 0 16px rgba(200,16,46,0); } }",
  ".ca-mic-hint { text-align: center; font-size: 0.68rem; color: rgba(255,255,255,0.8); font-weight: 600; }",

  ".ca-cv-area { display: flex; flex-direction: column; gap: 8px; }",
  ".ca-cv-textarea { width: 100%; background: #fff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 14px 16px; color: #1e293b; font-family: 'Poppins', sans-serif; font-size: 0.82rem; resize: none; outline: none; min-height: 150px; line-height: 1.6; transition: border-color 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }",
  ".ca-cv-textarea:focus { border-color: #c8102e; }",
  ".ca-cv-textarea::placeholder { color: #94a3b8; }",
  ".ca-cv-btn { padding: 14px; border-radius: 14px; border: none; background: linear-gradient(135deg,#c8102e,#9b0d23); color: #fff; font-family: 'Poppins', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: transform 0.15s; box-shadow: 0 4px 12px rgba(200,16,46,0.4); }",
  ".ca-cv-btn:active { transform: scale(0.97); }",
  ".ca-cv-btn:disabled { opacity: 0.4; }",

  ".ca-section-label { font-size: 0.68rem; color: rgba(255,255,255,0.8); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }",
  ".ca-quick-btns { display: flex; flex-wrap: wrap; gap: 6px; }",
  ".ca-quick-btn { background: rgba(255,255,255,0.9); border: 2px solid rgba(255,255,255,0.5); border-radius: 12px; padding: 7px 14px; color: #c8102e; font-family: 'Poppins', sans-serif; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.15s; }",
  ".ca-quick-btn:hover { background: #c8102e; color: #fff; border-color: #c8102e; }",

  ".ca-report-btn { width: 100%; padding: 14px; border-radius: 14px; border: none; background: linear-gradient(135deg,#f59e0b,#d97706); color: #fff; font-family: 'Poppins', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: transform 0.15s; box-shadow: 0 4px 12px rgba(245,158,11,0.4); display: flex; align-items: center; justify-content: center; gap: 8px; }",
  ".ca-report-btn:active { transform: scale(0.97); }",
  ".ca-report-btn:disabled { opacity: 0.4; }",

  ".ca-heard { background: rgba(255,255,255,0.9); border-radius: 12px; padding: 8px 14px; font-size: 0.8rem; color: #c8102e; font-style: italic; border: 2px solid rgba(200,16,46,0.2); }",
  ".ca-heard-label { font-size: 0.65rem; color: #64748b; margin-bottom: 2px; font-weight: 600; }",

  ".ca-quiz-card { background: #fff; border-radius: 24px; padding: 24px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); }",
  ".ca-quiz-progress { height: 6px; background: #f1f5f9; border-radius: 6px; margin-bottom: 16px; overflow: hidden; }",
  ".ca-quiz-progress-fill { height: 100%; background: linear-gradient(90deg,#c8102e,#f59e0b); border-radius: 6px; transition: width 0.4s ease; }",
  ".ca-quiz-num { font-size: 0.7rem; color: #64748b; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }",
  ".ca-quiz-q { font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 16px; line-height: 1.5; }",
  ".ca-quiz-opts { display: flex; flex-direction: column; gap: 8px; }",
  ".ca-quiz-opt { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 13px 16px; cursor: pointer; transition: all 0.2s; font-family: 'Poppins', sans-serif; font-size: 0.88rem; color: #1e293b; text-align: left; font-weight: 500; }",
  ".ca-quiz-opt:hover { background: #fff1f2; border-color: #c8102e; color: #c8102e; }",
  ".ca-quiz-opt.selected { background: #fff1f2; border-color: #c8102e; color: #c8102e; }",

  ".ca-onboard { display: flex; flex-direction: column; gap: 14px; padding: 8px 0; }",
  ".ca-onboard-hero { text-align: center; padding: 20px 0 10px; }",
  ".ca-onboard-hero h1 { font-size: clamp(1.5rem,5vw,2rem); font-weight: 800; color: #fff; margin-bottom: 10px; line-height: 1.3; text-shadow: 0 2px 8px rgba(0,0,0,0.2); }",
  ".ca-onboard-hero p { color: rgba(255,255,255,0.85); font-size: 0.88rem; line-height: 1.6; }",
  ".ca-features { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }",
  ".ca-feature { background: rgba(255,255,255,0.95); border-radius: 16px; padding: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }",
  ".ca-feature-icon { font-size: 1.4rem; margin-bottom: 6px; }",
  ".ca-feature-title { font-size: 0.8rem; font-weight: 700; color: #1e293b; margin-bottom: 2px; }",
  ".ca-feature-desc { font-size: 0.7rem; color: #64748b; line-height: 1.4; }",
  ".ca-name-input { width: 100%; background: #fff; border: 3px solid rgba(255,255,255,0.5); border-radius: 16px; padding: 16px 20px; color: #1e293b; font-family: 'Poppins', sans-serif; font-size: 1rem; outline: none; transition: border-color 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }",
  ".ca-name-input:focus { border-color: #c8102e; }",
  ".ca-name-input::placeholder { color: #94a3b8; }",
  ".ca-start-btn { background: linear-gradient(135deg,#c8102e,#9b0d23); border: none; border-radius: 16px; padding: 18px; color: #fff; font-family: 'Poppins', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%; transition: transform 0.15s; box-shadow: 0 6px 20px rgba(200,16,46,0.5); }",
  ".ca-start-btn:active { transform: scale(0.98); }",
  ".ca-fullname-input { width: 100%; background: #fff; border: 2px solid #e2e8f0; border-radius: 14px; padding: 14px 18px; color: #1e293b; font-family: 'Poppins', sans-serif; font-size: 0.95rem; outline: none; transition: border-color 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }",
  ".ca-fullname-input:focus { border-color: #c8102e; }",
  ".ca-fullname-input::placeholder { color: #94a3b8; }"
].join("\n");

export default function CareerAI() {
  var s1 = useState("onboard"); var screen = s1[0]; var setScreen = s1[1];
  var s2 = useState(""); var userName = s2[0]; var setUserName = s2[1];
  var s3 = useState(""); var fullName = s3[0]; var setFullName = s3[1];
  var s4 = useState(0); var quizStep = s4[0]; var setQuizStep = s4[1];
  var s5 = useState({}); var quizAnswers = s5[0]; var setQuizAnswers = s5[1];
  var s6 = useState([]); var messages = s6[0]; var setMessages = s6[1];
  var s7 = useState(false); var loading = s7[0]; var setLoading = s7[1];
  var s8 = useState("voice"); var inputMode = s8[0]; var setInputMode = s8[1];
  var s9 = useState("chat"); var activeTab = s9[0]; var setActiveTab = s9[1];
  var s10 = useState(""); var textInput = s10[0]; var setTextInput = s10[1];
  var s11 = useState(""); var cvText = s11[0]; var setCvText = s11[1];
  var s12 = useState(false); var holding = s12[0]; var setHolding = s12[1];
  var s13 = useState(null); var heard = s13[0]; var setHeard = s13[1];
  var s14 = useState(0); var holdProgress = s14[0]; var setHoldProgress = s14[1];
  var s15 = useState(false); var isSpeaking = s15[0]; var setIsSpeaking = s15[1];
  var s16 = useState(false); var generatingReport = s16[0]; var setGeneratingReport = s16[1];

  var conversationRef = useRef([]);
  var holdingRef = useRef(false);
  var recRef = useRef(null);
  var holdTimerRef = useRef(null);
  var canvasRef = useRef(null);
  var animRef = useRef(null);
  var analyserRef = useRef(null);
  var audioCtxRef = useRef(null);
  var streamRef = useRef(null);
  var heardRef = useRef(null);
  var messagesEndRef = useRef(null);

  useEffect(function() {
    var el = document.createElement("style");
    el.textContent = CSS_STYLES;
    document.head.appendChild(el);
    if (!document.querySelector("script[src='" + RV_SCRIPT + "']")) {
      var sc = document.createElement("script");
      sc.src = RV_SCRIPT;
      document.head.appendChild(sc);
    }
    speechSynthesis.getVoices();
    return function() { try { document.head.removeChild(el); } catch(e){} };
  }, []);

  useEffect(function() {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  var drawWaveform = useCallback(function() {
    if (!canvasRef.current || !analyserRef.current) return;
    var canvas = canvasRef.current;
    var ctx = canvas.getContext("2d");
    var analyser = analyserRef.current;
    var dataArray = new Uint8Array(analyser.frequencyBinCount);
    function draw() {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var barCount = 40;
      var barW = (canvas.width - (barCount - 1) * 2) / barCount;
      for (var i = 0; i < barCount; i++) {
        var val = dataArray[Math.floor(i * analyser.frequencyBinCount / barCount)] / 255;
        var h = Math.max(4, val * canvas.height * 0.88);
        var x = i * (barW + 2);
        var y = (canvas.height - h) / 2;
        var g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "rgba(200,16,46," + (0.5 + val * 0.5) + ")");
        g.addColorStop(1, "rgba(245,158,11," + (0.5 + val * 0.5) + ")");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h, 2);
        ctx.fill();
      }
    }
    draw();
  }, []);

  var stopWaveform = useCallback(function() {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch(e){} audioCtxRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(function(t){ t.stop(); }); streamRef.current = null; }
    analyserRef.current = null;
  }, []);

  var startWaveform = useCallback(async function() {
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true, echoCancellation: true });
      streamRef.current = stream;
      var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      var src = audioCtx.createMediaStreamSource(stream);
      var analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128; analyser.smoothingTimeConstant = 0.8;
      src.connect(analyser); analyserRef.current = analyser;
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth * window.devicePixelRatio;
        canvasRef.current.height = canvasRef.current.offsetHeight * window.devicePixelRatio;
      }
      drawWaveform();
    } catch(e) { console.log("Mic err", e); }
  }, [drawWaveform]);

  var startHold = useCallback(async function(e) {
    e.preventDefault();
    if (loading || holdingRef.current) return;
    stopSpeaking();
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Please use Google Chrome!"); return; }
    holdingRef.current = true;
    setHolding(true); setHeard(null); heardRef.current = null; setHoldProgress(0);
    await startWaveform();
    var prog = 0;
    holdTimerRef.current = setInterval(function() { prog = Math.min(100, prog + 0.8); setHoldProgress(prog); }, 80);
    function startRec() {
      if (!holdingRef.current) return;
      var rec = new SR();
      recRef.current = rec;
      rec.lang = "en-US"; rec.interimResults = true; rec.maxAlternatives = 3; rec.continuous = false;
      rec.onresult = function(ev) {
        var best = "";
        for (var i = 0; i < ev.results.length; i++) { var t = ev.results[i][0].transcript.trim(); if (t.length > best.length) best = t; }
        if (best) { heardRef.current = best; setHeard(best); }
      };
      rec.onend = function() { if (holdingRef.current) setTimeout(startRec, 80); };
      rec.onerror = function(err) { if (err.error === "not-allowed") { alert("Please allow microphone!"); holdingRef.current = false; setHolding(false); } };
      try { rec.start(); } catch(e) {}
    }
    startRec();
  }, [loading, startWaveform]);

  var endHold = useCallback(function() {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false); setHoldProgress(0);
    clearInterval(holdTimerRef.current);
    stopWaveform();
    if (recRef.current) { try { recRef.current.onend = null; recRef.current.stop(); } catch(e){} recRef.current = null; }
    setTimeout(function() {
      var f = heardRef.current;
      setHeard(null);
      if (f && f.trim()) { sendMessage(f.trim()); }
      else { speak("I didn't catch that. Please try again or type your response."); }
    }, 500);
  }, [stopWaveform]);

  async function callClaude(userMsg) {
    var history = conversationRef.current;
    var newHistory = history.concat([{ role: "user", content: userMsg }]);
    var res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 700, system: SYSTEM_PROMPT, messages: newHistory })
    });
    var data = await res.json();
    var aiText = "";
    if (data.content) { for (var i = 0; i < data.content.length; i++) { if (data.content[i].type === "text") { aiText = data.content[i].text; break; } } }
    conversationRef.current = newHistory.concat([{ role: "assistant", content: aiText }]);
    return aiText;
  }

  async function sendMessage(userText) {
    if (!userText.trim() || loading) return;
    setMessages(function(prev){ return prev.concat([{ role: "user", text: userText, id: Date.now() }]); });
    setTextInput("");
    setLoading(true);
    try {
      var aiText = await callClaude(userText);
      setMessages(function(prev){ return prev.concat([{ role: "ai", text: aiText, id: Date.now() + 1 }]); });
      setIsSpeaking(true);
      speak(aiText, function(){ setIsSpeaking(false); });
    } catch(e) {
      setMessages(function(prev){ return prev.concat([{ role: "ai", text: "Sorry, connection error. Please try again.", id: Date.now() + 1 }]); });
    }
    setLoading(false);
  }

  async function generateReport() {
    setGeneratingReport(true);
    var reportPrompt = "Based on our entire conversation, please generate a comprehensive career counselling report for " + fullName + ". Include: 1) Executive Summary 2) Current Profile Assessment 3) Recommended Career Paths (top 3 with reasons) 4) Skills to Develop 5) University/Course Recommendations 6) Action Plan for next 6 months 7) Salary Expectations in Pakistan 8) Final Advice. Be specific and detailed.";
    try {
      var reportText = await callClaude(reportPrompt);
      printReport(reportText);
    } catch(e) {
      alert("Could not generate report. Please try again.");
    }
    setGeneratingReport(false);
  }

  function printReport(reportText) {
    var today = new Date();
    var dateStr = today.toLocaleDateString("en-PK", { year:"numeric", month:"long", day:"numeric" });
    var win = window.open("", "_blank");
    win.document.write(
      "<html><head><title>Career Counselling Report - " + fullName + "</title>" +
      "<style>" +
      "body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; }" +
      ".header { text-align: center; border-bottom: 3px solid #c8102e; padding-bottom: 24px; margin-bottom: 32px; }" +
      ".logo { height: 80px; margin-bottom: 16px; }" +
      ".school-name { font-size: 1.4rem; font-weight: 800; color: #c8102e; margin-bottom: 4px; }" +
      ".report-title { font-size: 1.1rem; color: #64748b; font-weight: 500; }" +
      ".person-info { display: flex; justify-content: space-between; background: #fff1f2; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px; }" +
      ".person-name { font-size: 1.2rem; font-weight: 800; color: #c8102e; }" +
      ".person-date { font-size: 0.9rem; color: #64748b; margin-top: 4px; }" +
      ".content { line-height: 1.8; font-size: 0.95rem; white-space: pre-wrap; }" +
      ".footer { margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 0.8rem; }" +
      "@media print { body { padding: 20px; } }" +
      "</style></head><body>" +
      "<div class='header'>" +
      "<img src='" + TLS_LOGO + "' class='logo' onerror='this.style.display=none' />" +
      "<div class='school-name'>The Lincoln School</div>" +
      "<div class='report-title'>Career Counselling Report</div>" +
      "</div>" +
      "<div class='person-info'>" +
      "<div><div class='person-name'>" + fullName + "</div><div class='person-date'>Date: " + dateStr + "</div></div>" +
      "<div style='text-align:right;color:#64748b;font-size:0.85rem;'>Prepared by CareerAI<br/>The Lincoln School</div>" +
      "</div>" +
      "<div class='content'>" + reportText.replace(/</g,"&lt;").replace(/>/g,"&gt;") + "</div>" +
      "<div class='footer'>This report was generated by CareerAI, The Lincoln School Career Counselling Service.<br/>Mirpurkhas, Sindh, Pakistan &bull; thelincolnschool.edu.pk</div>" +
      "</body></html>"
    );
    win.document.close();
    setTimeout(function(){ win.print(); }, 800);
  }

  function handleQuizAnswer(questionId, answer) {
    var newAnswers = Object.assign({}, quizAnswers);
    newAnswers[questionId] = answer;
    setQuizAnswers(newAnswers);
    if (quizStep < QUIZ.length - 1) { setQuizStep(quizStep + 1); }
    else { finishQuiz(newAnswers); }
  }

  async function finishQuiz(answers) {
    setScreen("chat");
    var summary = "My assessment: ";
    QUIZ.forEach(function(q){ summary += q.q + " " + (answers[q.id] || "") + ". "; });
    summary += "Please give me personalised career guidance based on this.";
    setLoading(true);
    var greeting = "Welcome " + userName + "! I am your CareerAI counsellor at The Lincoln School. I have reviewed your assessment and I am ready to guide you. Let me give you personalised advice!";
    conversationRef.current = [{ role: "assistant", content: greeting }];
    setMessages([{ role: "ai", text: greeting, id: Date.now() }]);
    setIsSpeaking(true);
    speak(greeting, function(){
      setIsSpeaking(false);
      sendMessage(summary);
    });
  }

  function startApp() {
    if (!userName.trim()) { alert("Please enter your name!"); return; }
    if (!fullName.trim()) { alert("Please enter your full name for the report!"); return; }
    setScreen("quiz");
    speak("Welcome " + userName + "! I am CareerAI from The Lincoln School. Let me ask you a few quick questions to personalise your career guidance.");
  }

  if (screen === "onboard") return (
    <div className="ca-wrap">
      <div className="ca-card">
        <div className="ca-header">
          <div className="ca-header-left">
            <img src={TLS_LOGO} className="ca-header-logo" alt="The Lincoln School" onError={function(e){ e.target.style.display="none"; }} />
            <div className="ca-header-text">
              <div className="ca-header-title">The Lincoln School</div>
              <div className="ca-header-sub">Career Counselling</div>
            </div>
          </div>
        </div>
        <div className="ca-onboard">
          <div className="ca-onboard-hero">
            <div style={{fontSize:"3rem",marginBottom:"12px"}}>🎯</div>
            <h1>AI Career Counselling</h1>
            <p style={{marginTop:"8px"}}>Voice-powered career guidance tailored for Pakistan's job market. Speak or type — get expert advice instantly.</p>
          </div>
          <div className="ca-features">
            {[["🎤","Voice Conversation","Speak naturally, get spoken advice"],["📋","Career Assessment","Personalised quiz to find your path"],["📄","CV Analysis","Expert feedback on your resume"],["📊","Generate Report","Detailed PDF report with your name"]].map(function(f){
              return <div key={f[0]} className="ca-feature"><div className="ca-feature-icon">{f[0]}</div><div className="ca-feature-title">{f[1]}</div><div className="ca-feature-desc">{f[2]}</div></div>;
            })}
          </div>
          <input className="ca-name-input" placeholder="Your first name (e.g. Ahmed)" value={userName} onChange={function(e){ setUserName(e.target.value); }} />
          <input className="ca-fullname-input" placeholder="Your full name for the report (e.g. Ahmed Khan)" value={fullName} onChange={function(e){ setFullName(e.target.value); }} onKeyDown={function(e){ if(e.key==="Enter") startApp(); }} />
          <button className="ca-start-btn" onClick={startApp}>Start My Career Consultation 🚀</button>
        </div>
      </div>
    </div>
  );

  if (screen === "quiz") {
    var q = QUIZ[quizStep];
    return (
      <div className="ca-wrap">
        <div className="ca-card">
          <div className="ca-header">
            <div className="ca-header-left">
              <img src={TLS_LOGO} className="ca-header-logo" alt="The Lincoln School" onError={function(e){ e.target.style.display="none"; }} />
              <div className="ca-header-text">
                <div className="ca-header-title">The Lincoln School</div>
                <div className="ca-header-sub">Career Assessment</div>
              </div>
            </div>
          </div>
          <div className="ca-quiz-card">
            <div className="ca-quiz-progress"><div className="ca-quiz-progress-fill" style={{width: ((quizStep / QUIZ.length) * 100) + "%"}} /></div>
            <div className="ca-quiz-num">Question {quizStep + 1} of {QUIZ.length}</div>
            <div className="ca-quiz-q">{q.q}</div>
            <div className="ca-quiz-opts">
              {q.opts.map(function(opt){
                return <button key={opt} className={"ca-quiz-opt" + (quizAnswers[q.id] === opt ? " selected" : "")} onClick={function(){ handleQuizAnswer(q.id, opt); }}>{opt}</button>;
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ca-wrap">
      <div className="ca-card">
        <div className="ca-header">
          <div className="ca-header-left">
            <img src={TLS_LOGO} className="ca-header-logo" alt="The Lincoln School" onError={function(e){ e.target.style.display="none"; }} />
            <div className="ca-header-text">
              <div className="ca-header-title">The Lincoln School</div>
              <div className="ca-header-sub">Career Counselling — Hi {userName}!</div>
            </div>
          </div>
          <div className="ca-mode-btns">
            <button className={"ca-mode-btn" + (inputMode === "voice" ? " active" : "")} onClick={function(){ setInputMode("voice"); }}>🎤 Voice</button>
            <button className={"ca-mode-btn" + (inputMode === "text" ? " active" : "")} onClick={function(){ setInputMode("text"); }}>⌨️ Type</button>
          </div>
        </div>

        <div className="ca-tab-bar">
          {[["chat","💬 Chat"],["cv","📄 CV Analysis"],["quick","⚡ Quick"],["report","📊 Report"]].map(function(t){
            return <button key={t[0]} className={"ca-tab" + (activeTab === t[0] ? " active" : "")} onClick={function(){ setActiveTab(t[0]); }}>{t[1]}</button>;
          })}
        </div>

        {activeTab === "chat" && (
          <>
            <div className="ca-messages">
              {messages.map(function(m){ return <div key={m.id} className={"ca-bubble " + (m.role === "ai" ? "ai" : m.role === "system" ? "system" : "user")}>{m.text}</div>; })}
              {loading && <div className="ca-thinking"><div className="ca-dot"/><div className="ca-dot"/><div className="ca-dot"/><span style={{fontSize:"0.75rem",color:"#64748b",marginLeft:"4px"}}>CareerAI is thinking...</span></div>}
              {isSpeaking && !loading && (
                <div className="ca-speaking-indicator">
                  <div className="ca-speak-wave"><span/><span/><span/><span/></div>
                  Speaking...
                  <button onClick={stopSpeaking} style={{background:"none",border:"none",color:"#c8102e",cursor:"pointer",fontSize:"0.75rem",marginLeft:"4px",fontWeight:"700"}}>Stop</button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {heard && <div className="ca-heard"><div className="ca-heard-label">I heard:</div><div>"{heard}"</div></div>}
            {inputMode === "voice" && (
              <>
                <div className={"ca-waveform" + (holding ? " active" : "")}>
                  {holding ? <canvas ref={canvasRef} style={{width:"100%",height:"100%"}} /> : <div className="ca-waveform-idle">{Array.from({length:20}).map(function(_,i){ return <span key={i} style={{animationDelay:(i*0.1)+"s",height:(6+Math.abs(Math.sin(i*0.5))*16)+"px"}} />; })}</div>}
                </div>
                <button className={"ca-mic-btn " + (holding ? "holding" : "idle")} onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold} onTouchStart={startHold} onTouchEnd={endHold} onTouchCancel={endHold} disabled={loading}>
                  <div className="ca-mic-btn-fill" style={{width:holdProgress+"%"}} />
                  <span style={{position:"relative",zIndex:1,fontSize:"1.2rem"}}>{holding ? "🔴" : "🎤"}</span>
                  <span style={{position:"relative",zIndex:1}}>{holding ? "Release to Send" : "Hold to Speak"}</span>
                </button>
                <div className="ca-mic-hint">Press and hold while speaking — release when done</div>
              </>
            )}
            {inputMode === "text" && (
              <div className="ca-input-area">
                <textarea className="ca-text-input" value={textInput} onChange={function(e){ setTextInput(e.target.value); e.target.style.height="46px"; e.target.style.height=Math.min(e.target.scrollHeight,120)+"px"; }} onKeyDown={function(e){ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendMessage(textInput); } }} placeholder="Type your question..." rows={1} disabled={loading} />
                <button className="ca-send-btn" onClick={function(){ sendMessage(textInput); }} disabled={!textInput.trim()||loading}>➤</button>
              </div>
            )}
          </>
        )}

        {activeTab === "cv" && (
          <div className="ca-cv-area">
            <div className="ca-section-label">Paste your CV or resume text below</div>
            <textarea className="ca-cv-textarea" value={cvText} onChange={function(e){ setCvText(e.target.value); }} placeholder={"Paste your CV text here...\n\nExample:\nName: Ahmed Khan\nEducation: BBA LUMS 2022\nExperience: 2 years marketing at XYZ Company\nSkills: Excel, Digital Marketing, Communication\n\nCareerAI will analyse and give specific feedback."} />
            <button className="ca-cv-btn" onClick={function(){ if(!cvText.trim()) return; setActiveTab("chat"); setTimeout(function(){ sendMessage("Please analyse my CV and give me detailed feedback:\n\n" + cvText); }, 200); }} disabled={!cvText.trim()||loading}>
              {loading ? "Analysing..." : "🔍 Analyse My CV"}
            </button>
          </div>
        )}

        {activeTab === "quick" && (
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <div className="ca-section-label">Tap any question to get instant advice</div>
            <div className="ca-quick-btns">
              {QUICK_QUESTIONS.map(function(q){
                return <button key={q} className="ca-quick-btn" onClick={function(){ setActiveTab("chat"); setTimeout(function(){ sendMessage(q); }, 200); }}>{q}</button>;
              })}
            </div>
          </div>
        )}

        {activeTab === "report" && (
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <div className="ca-section-label">Generate your career counselling report</div>
            <div style={{background:"rgba(255,255,255,0.9)",borderRadius:"16px",padding:"16px",fontSize:"0.85rem",color:"#1e293b",lineHeight:"1.6"}}>
              <div style={{fontWeight:"700",marginBottom:"8px",color:"#c8102e"}}>Your Report Will Include:</div>
              <div>✅ Executive Summary</div>
              <div>✅ Career Profile Assessment</div>
              <div>✅ Top 3 Recommended Career Paths</div>
              <div>✅ Skills to Develop</div>
              <div>✅ University & Course Recommendations</div>
              <div>✅ 6-Month Action Plan</div>
              <div>✅ Salary Expectations in Pakistan</div>
              <div style={{marginTop:"12px",padding:"10px",background:"#fff1f2",borderRadius:"10px",fontSize:"0.78rem",color:"#64748b"}}>
                Report will be generated as a printable PDF with The Lincoln School logo and your full name: <strong style={{color:"#c8102e"}}>{fullName}</strong>
              </div>
            </div>
            <button className="ca-report-btn" onClick={generateReport} disabled={generatingReport||loading||messages.length<2}>
              {generatingReport ? "⏳ Generating Report..." : "📊 Generate & Print Report"}
            </button>
            {messages.length < 2 && <div style={{textAlign:"center",fontSize:"0.75rem",color:"rgba(255,255,255,0.7)"}}>Complete at least one conversation first</div>}
          </div>
        )}
      </div>
    </div>
  );
}
