import { useState, useEffect, useRef, useCallback } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

const RV_SCRIPT = "https://code.responsivevoice.org/responsivevoice.js?key=FREE";

function speak(text, rate) {
  var r = rate || 0.88;
  if (window.responsiveVoice) {
    window.responsiveVoice.cancel();
    window.responsiveVoice.speak(text, "UK English Female", { rate: r, pitch: 1.0, volume: 1 });
  } else {
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = r;
    var voices = speechSynthesis.getVoices();
    var v = voices.find(function(x){ return x.name.includes("Google US English"); })
      || voices.find(function(x){ return x.lang === "en-US"; })
      || voices[0];
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }
}

var WORDS = [
  { word:"ANT", phonetic:"/aent/", sound:"ah", hint:"Say AH like a doctor checks your throat. AH-nt.", sentence:"An ant is tiny but strong.", emoji:"ant", category:"Short Vowels" },
  { word:"EGG", phonetic:"/eg/", sound:"eh", hint:"Say EH - mouth slightly open. EH-g.", sentence:"The hen laid a big egg.", emoji:"egg", category:"Short Vowels" },
  { word:"INK", phonetic:"/ink/", sound:"ih", hint:"Say IH - short and quick. IH-nk.", sentence:"Write with blue ink.", emoji:"pen", category:"Short Vowels" },
  { word:"OX", phonetic:"/oks/", sound:"oh", hint:"Say OH but short and open. OH-ks.", sentence:"The ox is very strong.", emoji:"ox", category:"Short Vowels" },
  { word:"UP", phonetic:"/up/", sound:"uh", hint:"Say UH - relaxed mouth. UH-p.", sentence:"Reach up to the sky.", emoji:"up", category:"Short Vowels" },
  { word:"CAT", phonetic:"/kaet/", sound:"ah", hint:"kuh-AH-t. Three sounds. Middle is AH.", sentence:"The cat sat on the mat.", emoji:"cat", category:"Short Vowels" },
  { word:"PIG", phonetic:"/pig/", sound:"ih", hint:"puh-IH-g. Middle sound is IH.", sentence:"The pig loves mud.", emoji:"pig", category:"Short Vowels" },
  { word:"DOG", phonetic:"/dog/", sound:"oh", hint:"duh-OH-g. Middle sound is short OH.", sentence:"My dog loves to run.", emoji:"dog", category:"Short Vowels" },
  { word:"BUS", phonetic:"/bus/", sound:"uh", hint:"buh-UH-s. Middle sound is UH.", sentence:"Ride the bus to school.", emoji:"bus", category:"Short Vowels" },
  { word:"HEN", phonetic:"/hen/", sound:"eh", hint:"huh-EH-n. Middle sound is EH.", sentence:"The hen lays eggs.", emoji:"hen", category:"Short Vowels" },
  { word:"CAKE", phonetic:"/keik/", sound:"ay", hint:"Say AY like in say. K-AY-k.", sentence:"She baked a birthday cake.", emoji:"cake", category:"Long Vowels" },
  { word:"KITE", phonetic:"/kait/", sound:"eye", hint:"Say EYE like the body part. K-EYE-t.", sentence:"Fly a kite on a windy day.", emoji:"kite", category:"Long Vowels" },
  { word:"HOME", phonetic:"/houm/", sound:"oh", hint:"Say OH long - round lips. H-OH-m.", sentence:"I love coming home.", emoji:"home", category:"Long Vowels" },
  { word:"FEET", phonetic:"/fiit/", sound:"ee", hint:"Say EE - stretch your smile wide. F-EE-t.", sentence:"Wash your feet every day.", emoji:"feet", category:"Long Vowels" },
  { word:"RAIN", phonetic:"/rein/", sound:"ay", hint:"R then AY sound. R-AY-n.", sentence:"I love to dance in the rain.", emoji:"rain", category:"Long Vowels" },
  { word:"SEED", phonetic:"/siid/", sound:"ee", hint:"S then EE then d. S-EE-d.", sentence:"Plant a seed and watch it grow.", emoji:"seed", category:"Long Vowels" },
  { word:"BONE", phonetic:"/boun/", sound:"oh", hint:"B then long OH then n. B-OH-n.", sentence:"The dog chewed a bone.", emoji:"bone", category:"Long Vowels" },
  { word:"BAT", phonetic:"/baet/", sound:"buh", hint:"BUH - press lips together, pop open. BUH-at.", sentence:"Hit the ball with a bat.", emoji:"bat", category:"Consonants" },
  { word:"CAP", phonetic:"/kaep/", sound:"kuh", hint:"KUH - back of throat click. KUH-ap.", sentence:"Wear a cap in the sun.", emoji:"cap", category:"Consonants" },
  { word:"DIG", phonetic:"/dig/", sound:"duh", hint:"DUH - tongue tip behind top teeth. DUH-ig.", sentence:"Dig a hole in the garden.", emoji:"dig", category:"Consonants" },
  { word:"FAN", phonetic:"/faen/", sound:"fff", hint:"FFF - top teeth on lower lip, blow. FFF-an.", sentence:"Turn on the fan.", emoji:"fan", category:"Consonants" },
  { word:"HAT", phonetic:"/haet/", sound:"huh", hint:"HUH - just breathe out. HUH-at.", sentence:"She wore a big hat.", emoji:"hat", category:"Consonants" },
  { word:"JAM", phonetic:"/dzaem/", sound:"juh", hint:"JUH - tongue pushes air. JUH-am.", sentence:"Spread jam on bread.", emoji:"jam", category:"Consonants" },
  { word:"MAP", phonetic:"/maep/", sound:"mmm", hint:"MMM - lips together, hum. MMM-ap.", sentence:"Use a map to find the way.", emoji:"map", category:"Consonants" },
  { word:"NUT", phonetic:"/nut/", sound:"nnn", hint:"NNN - tongue behind teeth, hum. NNN-ut.", sentence:"A nut is hard to crack.", emoji:"nut", category:"Consonants" },
  { word:"PAN", phonetic:"/paen/", sound:"puh", hint:"PUH - lips pop, no voice. PUH-an.", sentence:"Cook eggs in a pan.", emoji:"pan", category:"Consonants" },
  { word:"SAP", phonetic:"/saep/", sound:"sss", hint:"SSS - like a snake. Teeth together, blow. SSS-ap.", sentence:"The tree has sweet sap.", emoji:"tree", category:"Consonants" },
  { word:"TAP", phonetic:"/taep/", sound:"tuh", hint:"TUH - tongue tip clicks. TUH-ap.", sentence:"Turn off the tap.", emoji:"tap", category:"Consonants" },
  { word:"VAN", phonetic:"/vaen/", sound:"vvv", hint:"VVV - like F but buzz! Teeth on lip. VVV-an.", sentence:"The van is parked outside.", emoji:"van", category:"Consonants" },
  { word:"ZIP", phonetic:"/zip/", sound:"zzz", hint:"ZZZ - like a buzzing bee. ZZZ-ip.", sentence:"Zip up your jacket.", emoji:"zip", category:"Consonants" },
  { word:"SHIP", phonetic:"/ship/", sound:"shh", hint:"SHH - like telling someone to be quiet. SHH-ip.", sentence:"The ship sails on the sea.", emoji:"ship", category:"Digraphs" },
  { word:"CHIN", phonetic:"/tchin/", sound:"chuh", hint:"CHuh - like a sneeze sound. CHuh-in.", sentence:"She rubbed her chin.", emoji:"chin", category:"Digraphs" },
  { word:"THIN", phonetic:"/thin/", sound:"thh", hint:"THH - tongue between teeth, blow softly. THH-in.", sentence:"The paper is very thin.", emoji:"paper", category:"Digraphs" },
  { word:"SHOP", phonetic:"/shop/", sound:"shh", hint:"SHH then OH then p. SHH-op.", sentence:"Go to the shop for milk.", emoji:"shop", category:"Digraphs" },
  { word:"THREE", phonetic:"/thrii/", sound:"thh", hint:"THH then r then long ee. THH-ree.", sentence:"I have three pets.", emoji:"three", category:"Digraphs" },
  { word:"PHONE", phonetic:"/foun/", sound:"fff", hint:"PH makes FFF sound! FFF-oh-n.", sentence:"Call me on the phone.", emoji:"phone", category:"Digraphs" },
  { word:"FROG", phonetic:"/frog/", sound:"frr", hint:"F then R quickly together. FRR-og.", sentence:"A frog jumped in the pond.", emoji:"frog", category:"Blends" },
  { word:"STAR", phonetic:"/staar/", sound:"st", hint:"S hiss then T click together. ST-ar.", sentence:"I see a bright star at night.", emoji:"star", category:"Blends" },
  { word:"PLAY", phonetic:"/plei/", sound:"pl", hint:"P pop then L tongue-roof together. PL-ay.", sentence:"Children love to play outside.", emoji:"play", category:"Blends" },
  { word:"CLAP", phonetic:"/klaep/", sound:"kl", hint:"K click then L tongue-roof. KL-ap.", sentence:"Clap your hands together.", emoji:"clap", category:"Blends" },
  { word:"DRUM", phonetic:"/drum/", sound:"dr", hint:"D tongue then R float quickly. DR-um.", sentence:"Bang the drum loudly.", emoji:"drum", category:"Blends" },
  { word:"FLIP", phonetic:"/flip/", sound:"fl", hint:"F teeth-lip then L tongue-roof. FL-ip.", sentence:"Flip the pancake carefully.", emoji:"flip", category:"Blends" },
  { word:"SWIM", phonetic:"/swim/", sound:"sw", hint:"S hiss then W lips together. SW-im.", sentence:"Fish love to swim in the sea.", emoji:"swim", category:"Blends" },
  { word:"STOP", phonetic:"/stop/", sound:"st", hint:"S then T quickly. No vowel between. ST-op.", sentence:"Stop at the red traffic light.", emoji:"stop", category:"Blends" },
  { word:"SPRING", phonetic:"/spring/", sound:"spr", hint:"Three sounds together S-P-R. SPR-ing.", sentence:"Flowers bloom in the spring.", emoji:"spring", category:"Blends" },
  { word:"THE", phonetic:"/the/", sound:"thh", hint:"THH voiced plus uh. Tongue between teeth.", sentence:"The cat is on the mat.", emoji:"book", category:"Sight Words" },
  { word:"WAS", phonetic:"/woz/", sound:"wuh", hint:"WUH plus short oh plus zzz. Not WASS. WUZ.", sentence:"It was a lovely sunny day.", emoji:"sun", category:"Sight Words" },
  { word:"SAID", phonetic:"/sed/", sound:"sss", hint:"SSS plus short eh plus d. Not SAYED. SED.", sentence:"She said good morning.", emoji:"chat", category:"Sight Words" },
  { word:"HAVE", phonetic:"/haev/", sound:"huh", hint:"HUH plus ah plus vvv. Silent E at end. HAV.", sentence:"I have two brothers.", emoji:"hand", category:"Sight Words" },
  { word:"COME", phonetic:"/kum/", sound:"kuh", hint:"KUH plus uh plus mmm. Silent E. KUM.", sentence:"Come here please.", emoji:"wave", category:"Sight Words" },
  { word:"THEY", phonetic:"/thei/", sound:"thh", hint:"THH voiced plus ay. Tongue between teeth. THAY.", sentence:"They are my best friends.", emoji:"friends", category:"Sight Words" },
  { word:"WHAT", phonetic:"/wot/", sound:"wuh", hint:"WUH plus short oh plus t. WOT.", sentence:"What is your favourite colour?", emoji:"question", category:"Sight Words" },
  { word:"WOULD", phonetic:"/wud/", sound:"wuh", hint:"WUH plus short oo plus d. Silent L! WOOD.", sentence:"Would you like some water?", emoji:"water", category:"Sight Words" },
  { word:"GOOD MORNING", phonetic:"/gud morning/", sound:"", hint:"GOOD short oo. MOR-ning. Stress MOR.", sentence:"Say this to greet people.", emoji:"morning", category:"Sentences" },
  { word:"THANK YOU", phonetic:"/thaenk yuu/", sound:"", hint:"THH tongue between teeth. THANK. Then YOU.", sentence:"Always say this after help.", emoji:"thanks", category:"Sentences" },
  { word:"HOW ARE YOU", phonetic:"/hau aar yuu/", sound:"", hint:"HOW rhymes with COW. Link all 3 smoothly.", sentence:"Ask a friend this question.", emoji:"hello", category:"Sentences" },
  { word:"I CAN DO IT", phonetic:"/ai kaen duu it/", sound:"", hint:"Say with confidence! Eye-KAN-DOO-IT.", sentence:"Believe in yourself!", emoji:"muscle", category:"Sentences" },
  { word:"THE CAT SAT ON THE MAT", phonetic:"/the kaet saet on the maet/", sound:"", hint:"Link all words smoothly. No pauses.", sentence:"A classic phonics sentence!", emoji:"mat", category:"Sentences" }
];

var AGE_MODULES = {
  "5-9":  ["Short Vowels","Long Vowels","Consonants","Digraphs","Blends","Sight Words","Sentences"],
  "10-14":["Consonants","Digraphs","Blends","Long Vowels","Sight Words","Sentences"],
  "15+":  ["Digraphs","Blends","Long Vowels","Sight Words","Sentences"]
};

function shuffle(arr) {
  return arr.slice().sort(function(){ return Math.random() - 0.5; });
}

function buildList(ageGroup) {
  var modules = AGE_MODULES[ageGroup] || AGE_MODULES["5-9"];
  var ordered = [];
  modules.forEach(function(m) {
    WORDS.filter(function(w){ return w.category === m; }).forEach(function(w){ ordered.push(w); });
  });
  return ordered.concat(shuffle(WORDS).slice(0, 20));
}

var STYLES = [
  "@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');",
  "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }",
  "html, body, #root { min-height: 100%; background: #07061a; }",
  "body { font-family: 'Nunito', sans-serif; color: #f0eeff; -webkit-tap-highlight-color: transparent; overscroll-behavior: none; }",
  ".ll-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 12px 10px 32px; background: radial-gradient(ellipse at 50% 0%, #1a0f3a 0%, #07061a 70%); }",
  ".ll-card { width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 10px; }",
  ".ll-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; background: rgba(255,255,255,0.06); border-radius: 22px; border: 1px solid rgba(255,255,255,0.08); }",
  ".ll-logo { display: flex; align-items: center; gap: 10px; }",
  ".ll-logo-icon { width: 42px; height: 42px; border-radius: 14px; background: linear-gradient(135deg,#7c3aed,#ec4899); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }",
  ".ll-logo-title { font-weight: 900; font-size: 1.15rem; background: linear-gradient(90deg,#c084fc,#ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }",
  ".ll-logo-sub { font-size: 0.65rem; color: #a89fd8; margin-top: -2px; }",
  ".ll-stars { display: flex; align-items: center; gap: 6px; background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.25); border-radius: 20px; padding: 6px 14px; font-size: 0.85rem; font-weight: 800; color: #fbbf24; flex-shrink: 0; }",
  ".ll-streak { display: flex; align-items: center; gap: 5px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 20px; padding: 5px 12px; font-size: 0.78rem; font-weight: 800; color: #f87171; }",
  ".ll-progress { background: rgba(255,255,255,0.05); border-radius: 14px; padding: 10px 16px; }",
  ".ll-prog-top { display: flex; justify-content: space-between; font-size: 0.72rem; color: #a89fd8; margin-bottom: 6px; font-weight: 700; }",
  ".ll-prog-bar { height: 7px; background: rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden; }",
  ".ll-prog-fill { height: 100%; background: linear-gradient(90deg,#7c3aed,#ec4899); border-radius: 8px; transition: width 0.5s ease; }",
  ".ll-cat-pill { background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.3); border-radius: 20px; padding: 6px 14px; font-size: 0.72rem; font-weight: 800; color: #c084fc; text-align: center; }",
  ".ll-word-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 28px; padding: 24px 20px; text-align: center; cursor: pointer; transition: all 0.2s; position: relative; user-select: none; }",
  ".ll-word-card:active { transform: scale(0.98); }",
  ".ll-hear-hint { position: absolute; top: 12px; right: 14px; background: rgba(124,58,237,0.3); border-radius: 10px; padding: 3px 10px; font-size: 0.68rem; color: #c084fc; font-weight: 700; }",
  ".ll-word-emoji { font-size: 3rem; display: block; margin-bottom: 8px; }",
  ".ll-word-big { font-size: clamp(1.8rem,7vw,2.8rem); font-weight: 900; color: #fff; letter-spacing: 2px; display: block; margin-bottom: 8px; }",
  ".ll-phonetic { font-size: 0.95rem; color: #c084fc; margin-bottom: 4px; }",
  ".ll-sound-badge { display: inline-block; background: rgba(236,72,153,0.2); border: 1px solid rgba(236,72,153,0.3); border-radius: 12px; padding: 4px 14px; font-size: 0.8rem; font-weight: 800; color: #f9a8d4; margin-top: 4px; }",
  ".ll-sentence { background: rgba(124,58,237,0.1); border-left: 3px solid #7c3aed; border-radius: 0 14px 14px 0; padding: 10px 16px; font-size: 0.88rem; color: #d4c8ff; font-style: italic; line-height: 1.5; }",
  ".ll-tip { background: rgba(255,255,255,0.04); border-radius: 16px; padding: 11px 16px; font-size: 0.8rem; color: #c084fc; line-height: 1.6; display: flex; gap: 8px; align-items: flex-start; }",
  ".ll-waveform-wrap { background: rgba(0,0,0,0.3); border-radius: 18px; border: 1px solid rgba(124,58,237,0.2); height: 72px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; overflow: hidden; padding: 8px 10px; }",
  ".ll-waveform-wrap.active { border-color: rgba(239,68,68,0.6); background: rgba(239,68,68,0.04); }",
  ".ll-waveform-idle { display: flex; align-items: center; gap: 3px; height: 100%; width: 100%; justify-content: center; }",
  ".ll-waveform-idle span { display: block; width: 3px; border-radius: 3px; background: rgba(124,58,237,0.3); animation: idle-wave 1.8s ease-in-out infinite; }",
  "@keyframes idle-wave { 0%,100% { transform: scaleY(1); opacity: 0.25; } 50% { transform: scaleY(2.2); opacity: 0.55; } }",
  ".ll-status { text-align: center; font-size: 0.8rem; color: #a89fd8; min-height: 20px; font-weight: 700; }",
  ".ll-status.listening { color: #ef4444; }",
  ".ll-status.processing { color: #c084fc; }",
  ".ll-heard { background: rgba(255,255,255,0.05); border-radius: 14px; padding: 10px 16px; text-align: center; }",
  ".ll-heard-label { font-size: 0.65rem; color: #a89fd8; margin-bottom: 3px; }",
  ".ll-heard-val { font-weight: 800; color: #f0eeff; font-size: 0.95rem; }",
  ".ll-result { border-radius: 22px; padding: 16px; text-align: center; }",
  ".ll-result.great { background: rgba(16,185,129,0.12); border: 2px solid rgba(16,185,129,0.3); }",
  ".ll-result.ok { background: rgba(251,191,36,0.12); border: 2px solid rgba(251,191,36,0.25); }",
  ".ll-result.retry { background: rgba(239,68,68,0.12); border: 2px solid rgba(239,68,68,0.25); }",
  ".ll-score { font-size: 2.4rem; font-weight: 900; margin-bottom: 4px; }",
  ".ll-result.great .ll-score { color: #10b981; }",
  ".ll-result.ok .ll-score { color: #fbbf24; }",
  ".ll-result.retry .ll-score { color: #ef4444; }",
  ".ll-result-msg { font-size: 0.9rem; font-weight: 800; margin-bottom: 4px; }",
  ".ll-result-detail { font-size: 0.78rem; color: #a89fd8; line-height: 1.5; }",
  ".ll-mic-area { display: flex; flex-direction: column; align-items: center; gap: 6px; }",
  ".ll-hold-btn { width: 100%; border: none; border-radius: 22px; background: linear-gradient(135deg,#dc2626,#991b1b); cursor: pointer; font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1rem; color: #fff; display: flex; align-items: center; justify-content: center; gap: 10px; height: 64px; user-select: none; -webkit-user-select: none; touch-action: none; position: relative; overflow: hidden; transition: transform 0.1s; }",
  ".ll-hold-btn:disabled { opacity: 0.5; cursor: not-allowed; }",
  ".ll-hold-btn.holding { transform: scale(0.97); animation: pulse-hold 0.8s infinite; }",
  ".ll-hold-btn-fill { position: absolute; left: 0; top: 0; height: 100%; background: rgba(255,255,255,0.2); transition: width 0.08s linear; border-radius: 22px 0 0 22px; }",
  "@keyframes pulse-hold { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); } 50% { box-shadow: 0 0 0 16px rgba(239,68,68,0); } }",
  ".ll-hold-hint { font-size: 0.7rem; color: #a89fd8; text-align: center; font-weight: 700; padding: 0 10px; }",
  ".ll-hold-hint.active { color: #ef4444; }",
  ".ll-btn-hear { width: 100%; padding: 14px; border-radius: 18px; border: none; font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 800; cursor: pointer; background: linear-gradient(135deg,#7c3aed,#6d28d9); color: #fff; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.15s; }",
  ".ll-btn-hear:active { transform: scale(0.97); }",
  ".ll-action-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }",
  ".ll-btn-next { padding: 14px; border-radius: 18px; border: none; font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 800; cursor: pointer; background: linear-gradient(135deg,#059669,#047857); color: #fff; transition: all 0.15s; }",
  ".ll-btn-again { padding: 14px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.12); font-family: 'Nunito', sans-serif; font-size: 0.9rem; font-weight: 800; cursor: pointer; background: rgba(255,255,255,0.07); color: #f0eeff; transition: all 0.15s; }",
  ".ll-ai-thinking { display: flex; align-items: center; gap: 8px; justify-content: center; padding: 12px; background: rgba(124,58,237,0.1); border-radius: 16px; font-size: 0.82rem; color: #c084fc; font-weight: 700; }",
  ".ll-dot-anim { width: 7px; height: 7px; border-radius: 50%; background: #c084fc; animation: bounce 0.9s infinite; }",
  ".ll-dot-anim:nth-child(2) { animation-delay: 0.15s; }",
  ".ll-dot-anim:nth-child(3) { animation-delay: 0.3s; }",
  "@keyframes bounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }",
  ".ll-badge { position: fixed; top: 18px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg,#fbbf24,#f59e0b); color: #1a1200; padding: 10px 26px; border-radius: 22px; font-weight: 900; font-size: 0.95rem; z-index: 999; white-space: nowrap; animation: badge-anim 2.8s forwards; pointer-events: none; }",
  "@keyframes badge-anim { 0% { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.85); } 15% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1.04); } 85% { opacity: 1; } 100% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.95); } }",
  ".ll-onboard { display: flex; flex-direction: column; gap: 14px; padding: 8px 0; }",
  ".ll-onboard-hero { text-align: center; padding: 20px 0 10px; }",
  ".ll-onboard-hero h1 { font-size: clamp(1.6rem,6vw,2.2rem); font-weight: 900; margin-bottom: 8px; }",
  ".ll-onboard-hero p { color: #a89fd8; font-size: 0.9rem; line-height: 1.6; }",
  ".ll-age-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }",
  ".ll-age-btn { background: rgba(255,255,255,0.06); border: 2px solid transparent; border-radius: 18px; padding: 18px 8px; cursor: pointer; transition: all 0.2s; text-align: center; font-family: 'Nunito', sans-serif; color: #f0eeff; font-weight: 800; }",
  ".ll-age-btn.sel { background: rgba(124,58,237,0.2); border-color: #7c3aed; color: #c084fc; }",
  ".ll-age-btn-icon { font-size: 2rem; display: block; margin-bottom: 6px; }",
  ".ll-name-input { width: 100%; background: rgba(255,255,255,0.07); border: 2px solid rgba(124,58,237,0.3); border-radius: 16px; padding: 16px 20px; color: #f0eeff; font-family: 'Nunito', sans-serif; font-size: 1rem; font-weight: 700; outline: none; text-align: center; transition: border-color 0.2s; }",
  ".ll-name-input:focus { border-color: #7c3aed; }",
  ".ll-name-input::placeholder { color: #a89fd8; font-weight: 400; }",
  ".ll-start-btn { background: linear-gradient(135deg,#7c3aed,#ec4899); border: none; border-radius: 18px; padding: 18px; color: #fff; font-family: 'Nunito', sans-serif; font-size: 1.1rem; font-weight: 900; cursor: pointer; width: 100%; transition: transform 0.15s; }",
  ".ll-start-btn:active { transform: scale(0.98); }"
].join("\n");

var EMOJIS = {
  cat:"🐱", dog:"🐶", pig:"🐷", ant:"🐜", egg:"🥚", pen:"🖊️", ox:"🐂",
  up:"⬆️", bus:"🚌", hen:"🐔", cake:"🎂", kite:"🪁", home:"🏠", feet:"🦶",
  rain:"🌧️", seed:"🌱", bone:"🦴", bat:"🏏", cap:"🧢", dig:"⛏️", fan:"🌬️",
  hat:"🎩", jam:"🍓", map:"🗺️", nut:"🥜", pan:"🍳", tree:"🌳", tap:"🚿",
  van:"🚐", zip:"🤐", ship:"🚢", chin:"🧔", paper:"📄", shop:"🛒", three:"3️⃣",
  phone:"📱", frog:"🐸", star:"⭐", play:"🎮", clap:"👏", drum:"🥁", flip:"🥞",
  swim:"🏊", stop:"🛑", spring:"🌸", book:"📖", sun:"☀️", chat:"💬", hand:"✋",
  wave:"👋", friends:"👫", question:"❓", water:"💧", morning:"🌅", thanks:"🙏",
  hello:"🤝", muscle:"💪", mat:"🐾"
};

export default function LingoLeap() {
  var s = useState("onboard"); var screen = s[0]; var setScreen = s[1];
  var s2 = useState(""); var name = s2[0]; var setName = s2[1];
  var s3 = useState(null); var age = s3[0]; var setAge = s3[1];
  var s4 = useState([]); var wordList = s4[0]; var setWordList = s4[1];
  var s5 = useState(0); var idx = s5[0]; var setIdx = s5[1];
  var s6 = useState(0); var stars = s6[0]; var setStars = s6[1];
  var s7 = useState(0); var streak = s7[0]; var setStreak = s7[1];
  var s8 = useState(false); var holding = s8[0]; var setHolding = s8[1];
  var s9 = useState(null); var heard = s9[0]; var setHeard = s9[1];
  var s10 = useState(false); var aiThinking = s10[0]; var setAiThinking = s10[1];
  var s11 = useState(null); var result = s11[0]; var setResult = s11[1];
  var s12 = useState(null); var badge = s12[0]; var setBadge = s12[1];
  var s13 = useState("Hold the mic button and speak!"); var status = s13[0]; var setStatus = s13[1];
  var s14 = useState(0); var holdProgress = s14[0]; var setHoldProgress = s14[1];

  var canvasRef = useRef(null);
  var animRef = useRef(null);
  var analyserRef = useRef(null);
  var audioCtxRef = useRef(null);
  var streamRef = useRef(null);
  var holdTimerRef = useRef(null);
  var heardRef = useRef(null);
  var holdingRef = useRef(false);
  var recRef = useRef(null);
  var bottomRef = useRef(null);

  useEffect(function() {
    var el = document.createElement("style");
    el.textContent = STYLES;
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
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [result, aiThinking]);

  var item = wordList[idx];

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
      var barCount = 48;
      var barW = (canvas.width - (barCount - 1) * 2) / barCount;
      for (var i = 0; i < barCount; i++) {
        var val = dataArray[Math.floor(i * analyser.frequencyBinCount / barCount)] / 255;
        var h = Math.max(4, val * canvas.height * 0.9);
        var x = i * (barW + 2);
        var y = (canvas.height - h) / 2;
        var g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "rgba(236,72,153," + (0.5 + val * 0.5) + ")");
        g.addColorStop(1, "rgba(124,58,237," + (0.5 + val * 0.5) + ")");
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
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true, echoCancellation: true, noiseSuppression: false });
      streamRef.current = stream;
      var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      var src = audioCtx.createMediaStreamSource(stream);
      var analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.75;
      src.connect(analyser);
      analyserRef.current = analyser;
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth * window.devicePixelRatio;
        canvasRef.current.height = canvasRef.current.offsetHeight * window.devicePixelRatio;
      }
      drawWaveform();
    } catch(e) { console.log("Mic err", e); }
  }, [drawWaveform]);

  var startHold = useCallback(async function(e) {
    e.preventDefault();
    if (aiThinking || holdingRef.current) return;
    if (window.responsiveVoice) window.responsiveVoice.cancel();
    speechSynthesis.cancel();
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setStatus("Please use Google Chrome!"); return; }
    holdingRef.current = true;
    setHolding(true);
    setResult(null);
    setHeard(null);
    heardRef.current = null;
    setHoldProgress(0);
    setStatus("Listening - speak now!");
    await startWaveform();
    var prog = 0;
    holdTimerRef.current = setInterval(function() {
      prog = Math.min(100, prog + 1.0);
      setHoldProgress(prog);
    }, 80);
    function startRec() {
      if (!holdingRef.current) return;
      var rec = new SR();
      recRef.current = rec;
      rec.lang = "en-US";
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      rec.continuous = false;
      rec.onresult = function(ev) {
        var best = "";
        for (var i = 0; i < ev.results.length; i++) {
          var t = ev.results[i][0].transcript.trim();
          if (t.length > best.length) best = t;
        }
        if (best) { heardRef.current = best; setHeard(best); }
      };
      rec.onend = function() { if (holdingRef.current) setTimeout(startRec, 100); };
      rec.onerror = function(e) {
        if (e.error === "not-allowed") {
          setStatus("Microphone blocked. Allow mic in browser settings.");
          holdingRef.current = false;
          setHolding(false);
        }
      };
      try { rec.start(); } catch(e) {}
    }
    startRec();
  }, [aiThinking, startWaveform]);

  var endHold = useCallback(function() {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    setHoldProgress(0);
    clearInterval(holdTimerRef.current);
    stopWaveform();
    if (recRef.current) {
      try { recRef.current.onend = null; recRef.current.stop(); } catch(e) {}
      recRef.current = null;
    }
    setStatus("Processing your voice...");
    setTimeout(function() {
      var finalHeard = heardRef.current;
      if (finalHeard && finalHeard.trim().length > 0) {
        judgeWithClaude(finalHeard.trim());
      } else {
        setStatus("Didn't catch it - speak louder and hold longer!");
        speak("I didn't catch that. Try speaking a little louder and hold the button longer.");
      }
    }, 500);
  }, [stopWaveform]);

  function startApp() {
    if (!name.trim()) { alert("Please enter your name!"); return; }
    if (!age) { alert("Please select your age!"); return; }
    setWordList(buildList(age));
    setIdx(0);
    setScreen("main");
    setTimeout(function() {
      speak("Welcome to LingoLeap, " + name + "! Tap the word card to hear the phonics sound, then hold the microphone to practise!");
    }, 600);
  }

  function resetResult() {
    setResult(null); setHeard(null); heardRef.current = null;
    setStatus("Hold the mic button and speak!");
  }

  function hearWord() {
    if (!item) return;
    var t = item.sound
      ? "The sound is " + item.sound + ". The word is " + item.word.toLowerCase() + ". " + item.sentence
      : item.word.toLowerCase() + ". " + item.sentence;
    speak(t, 0.78);
  }

  async function judgeWithClaude(said) {
    if (!item) return;
    setAiThinking(true);
    setStatus("AI is judging your phonics sound...");
    var prompt = "You are a warm English phonics coach for ages 5 to adult.\n"
      + "The student is practising PHONICS - learning sounds, not letter names.\n"
      + "Target word: " + item.word + " phonetic: " + item.phonetic + "\n"
      + "The key sound being practised: " + (item.sound || "the correct pronunciation") + "\n"
      + "Pronunciation tip: " + item.hint + "\n"
      + "Speech recognition heard: " + said + "\n\n"
      + "Important: Even if the student said just the sound (like ah for ANT, or buh for BAT), that is CORRECT.\n"
      + "Score from 0-100. Be encouraging, warm and specific.\n\n"
      + "Reply ONLY with valid JSON no markdown:\n"
      + "{\"score\":85,\"grade\":\"great\",\"message\":\"Brilliant!\",\"detail\":\"Your ah sound was clear.\",\"spoken_feedback\":\"Brilliant! 85 percent. Your ah sound was perfect!\"}\n\n"
      + "grade: great is 80 or more, ok is 50 to 79, retry is below 50";
    try {
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 220, messages: [{ role: "user", content: prompt }] })
      });
      var data = await res.json();
      var raw = "";
      if (data.content) { for (var i = 0; i < data.content.length; i++) { if (data.content[i].type === "text") { raw = data.content[i].text; break; } } }
      var parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setStatus("");
      speak(parsed.spoken_feedback || ("You scored " + parsed.score + " percent!"), 0.88);
      if (parsed.grade === "great") {
        var ns = stars + (parsed.score >= 95 ? 2 : 1);
        setStars(ns);
        setStreak(streak + 1);
        var bmap = { 5:"5 Stars!", 10:"10 Stars!", 20:"Word Wizard!", 30:"Phonics Pro!", 50:"Champion!" };
        if (bmap[ns]) { setBadge(bmap[ns]); setTimeout(function(){ setBadge(null); }, 2800); }
      } else { setStreak(0); }
    } catch(e) {
      setResult({ score:0, grade:"retry", message:"Connection error", detail:"Check internet and try again.", spoken_feedback:"Please try again!" });
      setStatus("");
      speak("Please try again!");
    }
    setAiThinking(false);
  }

  function nextWord() {
    if (!wordList.length) return;
    var next = idx + 1;
    if (next >= wordList.length) { setWordList(shuffle(wordList)); next = 0; }
    setIdx(next);
    resetResult();
    var nw = wordList[next];
    if (nw) setTimeout(function(){ speak(nw.word.toLowerCase(), 0.75); }, 400);
  }

  var progress = wordList.length ? Math.round((idx / wordList.length) * 100) : 0;
  var emoji = item ? (EMOJIS[item.emoji] || "🔤") : "🔤";

  if (screen === "onboard") return (
    <div className="ll-wrap">
      <div className="ll-card">
        <div className="ll-header">
          <div className="ll-logo">
            <div className="ll-logo-icon">🎤</div>
            <div>
              <div className="ll-logo-title">LingoLeap</div>
              <div className="ll-logo-sub">English Phonics Coach</div>
            </div>
          </div>
        </div>
        <div className="ll-onboard">
          <div className="ll-onboard-hero">
            <div style={{fontSize:"3.5rem",marginBottom:"12px"}}>🎤</div>
            <h1>Learn English Phonics Sounds!</h1>
            <p style={{marginTop:"10px"}}>Hear the sound, hold the mic, AI judges instantly!</p>
          </div>
          <input className="ll-name-input" placeholder="What is your name?" value={name}
            onChange={function(e){ setName(e.target.value); }}
            onKeyDown={function(e){ if(e.key==="Enter") startApp(); }}
            maxLength={24} />
          <div className="ll-age-grid">
            {[["🐣","5 to 9","5-9"],["🌿","10 to 14","10-14"],["🚀","15 and up","15+"]].map(function(item){
              return (
                <button key={item[2]} className={"ll-age-btn" + (age === item[2] ? " sel" : "")}
                  onClick={function(){ setAge(item[2]); }}>
                  <span className="ll-age-btn-icon">{item[0]}</span>
                  {item[1]}
                </button>
              );
            })}
          </div>
          <button className="ll-start-btn" onClick={startApp}>Start Learning Phonics! 🚀</button>
        </div>
      </div>
    </div>
  );

  if (!item) return <div className="ll-wrap"><div style={{color:"#a89fd8",marginTop:"40px"}}>Loading...</div></div>;

  return (
    <div className="ll-wrap">
      {badge && <div className="ll-badge">{badge}</div>}
      <div className="ll-card">
        <div className="ll-header">
          <div className="ll-logo">
            <div className="ll-logo-icon">🎤</div>
            <div>
              <div className="ll-logo-title">LingoLeap</div>
              <div className="ll-logo-sub">Hi {name}!</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            {streak >= 3 && <div className="ll-streak">🔥 {streak}</div>}
            <div className="ll-stars">⭐ {stars}</div>
          </div>
        </div>

        <div className="ll-progress">
          <div className="ll-prog-top">
            <span>{item.category}</span>
            <span>{idx + 1} of {wordList.length}</span>
          </div>
          <div className="ll-prog-bar">
            <div className="ll-prog-fill" style={{width:progress + "%"}} />
          </div>
        </div>

        <div className="ll-cat-pill">{item.category}</div>

        <div className="ll-word-card" onClick={hearWord}>
          <div className="ll-hear-hint">🔊 tap to hear</div>
          <span className="ll-word-emoji">{emoji}</span>
          <span className="ll-word-big">{item.word}</span>
          <div className="ll-phonetic">{item.phonetic}</div>
          {item.sound && <div className="ll-sound-badge">Sound: "{item.sound}"</div>}
        </div>

        <div className="ll-sentence">"{item.sentence}"</div>

        <div className="ll-tip">
          <span style={{fontSize:"1.1rem",flexShrink:0}}>👄</span>
          <span>{item.hint}</span>
        </div>

        <div className={"ll-waveform-wrap" + (holding ? " active" : "")}>
          {holding
            ? <canvas ref={canvasRef} style={{width:"100%",height:"100%"}} />
            : <div className="ll-waveform-idle">
                {Array.from({length:24}).map(function(_,i){
                  return <span key={i} style={{animationDelay:(i*0.075)+"s",height:(6+Math.abs(Math.sin(i*0.6))*18)+"px"}} />;
                })}
              </div>
          }
        </div>

        <div className={"ll-status" + (holding ? " listening" : aiThinking ? " processing" : "")}>{status}</div>

        {heard && !holding && (
          <div className="ll-heard">
            <div className="ll-heard-label">I heard:</div>
            <div className="ll-heard-val">"{heard}"</div>
          </div>
        )}

        {aiThinking && (
          <div className="ll-ai-thinking">
            <div className="ll-dot-anim" />
            <div className="ll-dot-anim" />
            <div className="ll-dot-anim" />
            <span>AI is judging your phonics sound...</span>
          </div>
        )}

        {result && !aiThinking && (
          <div className={"ll-result " + result.grade}>
            <div className="ll-score">{result.score}%</div>
            <div className="ll-result-msg">{result.message}</div>
            <div className="ll-result-detail">{result.detail}</div>
          </div>
        )}

        <div className="ll-mic-area">
          <button
            className={"ll-hold-btn" + (holding ? " holding" : "")}
            onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold}
            onTouchStart={startHold} onTouchEnd={endHold} onTouchCancel={endHold}
            disabled={aiThinking}
          >
            <div className="ll-hold-btn-fill" style={{width:holdProgress+"%"}} />
            <span style={{position:"relative",zIndex:1,fontSize:"1.3rem"}}>{holding ? "🔴" : "🎙️"}</span>
            <span style={{position:"relative",zIndex:1}}>{holding ? "Release to Submit" : "Hold to Speak"}</span>
          </button>
          <div className={"ll-hold-hint" + (holding ? " active" : "")}>
            {holding ? "Keep holding while you speak, release when done" : "Press and hold while speaking, release when finished"}
          </div>
        </div>

        <button className="ll-btn-hear" onClick={hearWord} disabled={aiThinking || holding}>
          🔊 Hear the Sound and Word
        </button>

        {result && !aiThinking && (
          <div className="ll-action-row">
            <button className="ll-btn-next" onClick={nextWord}>Next Word</button>
            <button className="ll-btn-again" onClick={resetResult}>Try Again 🔄</button>
          </div>
        )}

        <div ref={bottomRef} style={{height:"8px"}} />
      </div>
    </div>
  );
}
