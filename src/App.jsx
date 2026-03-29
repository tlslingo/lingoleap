import { useState, useEffect, useRef, useCallback } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// ResponsiveVoice — free, no key needed, human sounding
const RV_SCRIPT = "https://code.responsivevoice.org/responsivevoice.js?key=FREE";

function speak(text, rate = 0.9) {
  if (window.responsiveVoice) {
    window.responsiveVoice.cancel();
    window.responsiveVoice.speak(text, "UK English Female", {
      rate, pitch: 1.0, volume: 1,
    });
  } else {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = rate;
    const voices = speechSynthesis.getVoices();
    const v = voices.find(v => v.name.includes("Google US English"))
      || voices.find(v => v.lang === "en-US") || voices[0];
    if (v) u.voice = v;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
}

// ── PHONICS WORD BANK ──────────────────────────────────────────────────────
// All words teach the SOUND not the letter name
const WORD_BANK = {
  phonicsSounds: [
    // Short vowel sounds
    {word:"ANT",    sound:"ah",  phonetic:"/ænt/",   hint:"Say 'ah' like a doctor checks your throat. AH-nt.",      sentence:"An ant is tiny but strong.",   emoji:"🐜", category:"Short Vowels"},
    {word:"EGG",    sound:"eh",  phonetic:"/ɛɡ/",    hint:"Say 'eh' — mouth slightly open. EH-g.",                  sentence:"The hen laid a big egg.",       emoji:"🥚", category:"Short Vowels"},
    {word:"INK",    sound:"ih",  phonetic:"/ɪŋk/",   hint:"Say 'ih' — short and quick. IH-nk.",                    sentence:"Write with blue ink.",           emoji:"🖊️", category:"Short Vowels"},
    {word:"OX",     sound:"oh",  phonetic:"/ɒks/",   hint:"Say 'oh' but short and open. OH-ks.",                   sentence:"The ox is very strong.",         emoji:"🐂", category:"Short Vowels"},
    {word:"UP",     sound:"uh",  phonetic:"/ʌp/",    hint:"Say 'uh' — relaxed mouth. UH-p.",                       sentence:"Reach up to the sky.",           emoji:"⬆️", category:"Short Vowels"},
    {word:"CAT",    sound:"ah",  phonetic:"/kæt/",   hint:"kuh-AH-t. Three sounds. The middle is 'ah'.",           sentence:"The cat sat on the mat.",        emoji:"🐱", category:"Short Vowels"},
    {word:"PIG",    sound:"ih",  phonetic:"/pɪɡ/",   hint:"puh-IH-g. Middle sound is 'ih'.",                       sentence:"The pig loves mud.",             emoji:"🐷", category:"Short Vowels"},
    {word:"DOG",    sound:"oh",  phonetic:"/dɒɡ/",   hint:"duh-OH-g. Middle sound is short 'oh'.",                 sentence:"My dog loves to run.",           emoji:"🐶", category:"Short Vowels"},
    {word:"BUS",    sound:"uh",  phonetic:"/bʌs/",   hint:"buh-UH-s. Middle sound is 'uh'.",                       sentence:"Ride the bus to school.",        emoji:"🚌", category:"Short Vowels"},
    {word:"HEN",    sound:"eh",  phonetic:"/hɛn/",   hint:"huh-EH-n. Middle sound is 'eh'.",                       sentence:"The hen lays eggs.",             emoji:"🐔", category:"Short Vowels"},
    // Long vowel sounds
    {word:"CAKE",   sound:"ay",  phonetic:"/keɪk/",  hint:"Say 'ay' like the sound in 'say'. K-AY-k.",             sentence:"She baked a birthday cake.",    emoji:"🎂", category:"Long Vowels"},
    {word:"KITE",   sound:"eye", phonetic:"/kaɪt/",  hint:"Say 'eye' — like the letter I. K-EYE-t.",               sentence:"Fly a kite on a windy day.",    emoji:"🪁", category:"Long Vowels"},
    {word:"HOME",   sound:"oh",  phonetic:"/hoʊm/",  hint:"Say 'oh' long — round lips. H-OH-m.",                   sentence:"I love coming home.",           emoji:"🏠", category:"Long Vowels"},
    {word:"CUBE",   sound:"yoo", phonetic:"/kjuːb/", hint:"Say 'yoo' — like 'you'. K-YOO-b.",                      sentence:"A cube has six faces.",          emoji:"🎲", category:"Long Vowels"},
    {word:"FEET",   sound:"ee",  phonetic:"/fiːt/",  hint:"Say 'ee' — stretch your smile wide. F-EE-t.",           sentence:"Wash your feet every day.",     emoji:"🦶", category:"Long Vowels"},
    {word:"RAIN",   sound:"ay",  phonetic:"/reɪn/",  hint:"R then 'ay' sound. R-AY-n.",                            sentence:"I love to dance in the rain.",  emoji:"🌧️", category:"Long Vowels"},
    {word:"SEED",   sound:"ee",  phonetic:"/siːd/",  hint:"S then 'ee' then d. S-EE-d.",                           sentence:"Plant a seed and watch it grow.",emoji:"🌱", category:"Long Vowels"},
    {word:"BONE",   sound:"oh",  phonetic:"/boʊn/",  hint:"B then long 'oh' then n. B-OH-n.",                      sentence:"The dog chewed a bone.",        emoji:"🦴", category:"Long Vowels"},
    // Consonant sounds
    {word:"BAT",    sound:"buh", phonetic:"/bæt/",   hint:"BUH — press lips together, pop them open. BUH-at.",     sentence:"Hit the ball with a bat.",      emoji:"🏏", category:"Consonants"},
    {word:"CAP",    sound:"kuh", phonetic:"/kæp/",   hint:"KUH — back of throat click. KUH-ap.",                   sentence:"Wear a cap in the sun.",        emoji:"🧢", category:"Consonants"},
    {word:"DIG",    sound:"duh", phonetic:"/dɪɡ/",   hint:"DUH — tongue tip behind top teeth. DUH-ig.",            sentence:"Dig a hole in the garden.",     emoji:"⛏️", category:"Consonants"},
    {word:"FAN",    sound:"fff", phonetic:"/fæn/",   hint:"FFF — top teeth on lower lip, blow. FFF-an.",           sentence:"Turn on the fan.",              emoji:"🌬️", category:"Consonants"},
    {word:"GOT",    sound:"guh", phonetic:"/ɡɒt/",   hint:"GUH — back of throat, voiced. GUH-ot.",                 sentence:"I got a new book.",             emoji:"📗", category:"Consonants"},
    {word:"HAT",    sound:"huh", phonetic:"/hæt/",   hint:"HUH — just breathe out. HUH-at.",                       sentence:"She wore a big hat.",           emoji:"🎩", category:"Consonants"},
    {word:"JAM",    sound:"juh", phonetic:"/dʒæm/",  hint:"JUH — tongue pushes air. JUH-am.",                      sentence:"Spread jam on bread.",          emoji:"🍓", category:"Consonants"},
    {word:"KIT",    sound:"kuh", phonetic:"/kɪt/",   hint:"KUH — same as C. KUH-it.",                              sentence:"Open the first aid kit.",       emoji:"🧰", category:"Consonants"},
    {word:"LID",    sound:"lll", phonetic:"/lɪd/",   hint:"LLL — tongue touches roof of mouth. LLL-id.",           sentence:"Put the lid on the pot.",       emoji:"🍲", category:"Consonants"},
    {word:"MAP",    sound:"mmm", phonetic:"/mæp/",   hint:"MMM — lips together, hum. MMM-ap.",                     sentence:"Use a map to find the way.",    emoji:"🗺️", category:"Consonants"},
    {word:"NUT",    sound:"nnn", phonetic:"/nʌt/",   hint:"NNN — tongue behind teeth, hum. NNN-ut.",               sentence:"A nut is hard to crack.",       emoji:"🥜", category:"Consonants"},
    {word:"PAN",    sound:"puh", phonetic:"/pæn/",   hint:"PUH — lips pop, no voice. PUH-an.",                     sentence:"Cook eggs in a pan.",           emoji:"🍳", category:"Consonants"},
    {word:"RAG",    sound:"rrr", phonetic:"/ræɡ/",   hint:"RRR — tongue floats, don't touch roof. RRR-ag.",        sentence:"Use a rag to clean the floor.", emoji:"🧹", category:"Consonants"},
    {word:"SAP",    sound:"sss", phonetic:"/sæp/",   hint:"SSS — like a snake. Teeth together, blow. SSS-ap.",     sentence:"The tree has sweet sap.",       emoji:"🌳", category:"Consonants"},
    {word:"TAP",    sound:"tuh", phonetic:"/tæp/",   hint:"TUH — tongue tip clicks. TUH-ap.",                      sentence:"Turn off the tap.",             emoji:"🚿", category:"Consonants"},
    {word:"VAN",    sound:"vvv", phonetic:"/væn/",   hint:"VVV — like F but buzz! Teeth on lip. VVV-an.",          sentence:"The van is parked outside.",    emoji:"🚐", category:"Consonants"},
    {word:"WIG",    sound:"wuh", phonetic:"/wɪɡ/",   hint:"WUH — lips make a circle first. WUH-ig.",               sentence:"She wore a curly wig.",         emoji:"💇", category:"Consonants"},
    {word:"YAK",    sound:"yuh", phonetic:"/jæk/",   hint:"YUH — like the start of 'yes'. YUH-ak.",                sentence:"A yak lives in the mountains.", emoji:"🐃", category:"Consonants"},
    {word:"ZIP",    sound:"zzz", phonetic:"/zɪp/",   hint:"ZZZ — like a buzzing bee. ZZZ-ip.",                     sentence:"Zip up your jacket.",           emoji:"🤐", category:"Consonants"},
    // Digraphs
    {word:"SHIP",   sound:"shh", phonetic:"/ʃɪp/",   hint:"SHH — like telling someone to be quiet. SHH-ip.",      sentence:"The ship sails on the sea.",    emoji:"🚢", category:"Digraphs sh/ch/th"},
    {word:"CHIN",   sound:"chuh",phonetic:"/tʃɪn/",  hint:"CHuh — like a sneeze sound. CHuh-in.",                  sentence:"She rubbed her chin.",           emoji:"🧔", category:"Digraphs sh/ch/th"},
    {word:"THIN",   sound:"thh", phonetic:"/θɪn/",   hint:"THH — tongue between teeth, blow softly. THH-in.",      sentence:"The paper is very thin.",       emoji:"📄", category:"Digraphs sh/ch/th"},
    {word:"THEN",   sound:"thh", phonetic:"/ðɛn/",   hint:"THH voiced — tongue between teeth, voice on. THH-en.",  sentence:"Eat first, then wash hands.",   emoji:"👅", category:"Digraphs sh/ch/th"},
    {word:"SHOP",   sound:"shh", phonetic:"/ʃɒp/",   hint:"SHH then 'oh' then p. SHH-op.",                         sentence:"Go to the shop for milk.",      emoji:"🛒", category:"Digraphs sh/ch/th"},
    {word:"CHOP",   sound:"chuh",phonetic:"/tʃɒp/",  hint:"CHuh then 'oh' then p. CHuh-op.",                       sentence:"Chop the carrots finely.",      emoji:"🔪", category:"Digraphs sh/ch/th"},
    {word:"THREE",  sound:"thh", phonetic:"/θriː/",  hint:"THH then r then long ee. THH-ree.",                     sentence:"I have three pets.",            emoji:"3️⃣", category:"Digraphs sh/ch/th"},
    {word:"PHONE",  sound:"fff", phonetic:"/foʊn/",  hint:"PH makes FFF sound! FFF-oh-n.",                         sentence:"Call me on the phone.",         emoji:"📱", category:"Digraphs sh/ch/th"},
    // Blends
    {word:"FROG",   sound:"frr", phonetic:"/frɒɡ/",  hint:"F then R quickly together. FRR-og.",                   sentence:"A frog jumped in the pond.",    emoji:"🐸", category:"Blends"},
    {word:"STAR",   sound:"st",  phonetic:"/stɑːr/", hint:"S hiss then T click together. ST-ar.",                  sentence:"I see a bright star at night.", emoji:"⭐", category:"Blends"},
    {word:"PLAY",   sound:"pl",  phonetic:"/pleɪ/",  hint:"P pop then L tongue-roof together. PL-ay.",             sentence:"Children love to play outside.",emoji:"🎮", category:"Blends"},
    {word:"CLAP",   sound:"kl",  phonetic:"/klæp/",  hint:"K click then L tongue-roof. KL-ap.",                   sentence:"Clap your hands together.",     emoji:"👏", category:"Blends"},
    {word:"DRUM",   sound:"dr",  phonetic:"/drʌm/",  hint:"D tongue then R float quickly. DR-um.",                 sentence:"Bang the drum loudly.",         emoji:"🥁", category:"Blends"},
    {word:"FLIP",   sound:"fl",  phonetic:"/flɪp/",  hint:"F teeth-lip then L tongue-roof. FL-ip.",               sentence:"Flip the pancake carefully.",   emoji:"🥞", category:"Blends"},
    {word:"GRIN",   sound:"gr",  phonetic:"/ɡrɪn/",  hint:"G throat then R float together. GR-in.",               sentence:"He had a big grin on his face.",emoji:"😁", category:"Blends"},
    {word:"SWIM",   sound:"sw",  phonetic:"/swɪm/",  hint:"S hiss then W lips together. SW-im.",                  sentence:"Fish love to swim in the sea.", emoji:"🏊", category:"Blends"},
    {word:"STOP",   sound:"st",  phonetic:"/stɒp/",  hint:"S then T quickly. No vowel between. ST-op.",            sentence:"Stop at the red traffic light.", emoji:"🛑", category:"Blends"},
    {word:"SPRING", sound:"spr", phonetic:"/sprɪŋ/", hint:"Three sounds together: S-P-R. SPR-ing.",               sentence:"Flowers bloom in the spring.",  emoji:"🌸", category:"Blends"},
    // Sight words with phonics focus
    {word:"THE",    sound:"thh", phonetic:"/ðə/",    hint:"THH voiced + uh. Tongue between teeth. THE.",           sentence:"The cat is on the mat.",        emoji:"📖", category:"Sight Words"},
    {word:"WAS",    sound:"wuh", phonetic:"/wɒz/",   hint:"WUH + short oh + zzz. Not WASS. WUZ.",                  sentence:"It was a lovely sunny day.",    emoji:"☀️", category:"Sight Words"},
    {word:"SAID",   sound:"sss", phonetic:"/sɛd/",   hint:"SSS + short eh + d. Not SAYED. SED.",                   sentence:"She said good morning.",        emoji:"💬", category:"Sight Words"},
    {word:"HAVE",   sound:"huh", phonetic:"/hæv/",   hint:"HUH + ah + vvv. Silent E at end. HAV.",                 sentence:"I have two brothers.",          emoji:"✋", category:"Sight Words"},
    {word:"COME",   sound:"kuh", phonetic:"/kʌm/",   hint:"KUH + uh + mmm. Silent E. KUM.",                        sentence:"Come here please.",             emoji:"👋", category:"Sight Words"},
    {word:"THEY",   sound:"thh", phonetic:"/ðeɪ/",   hint:"THH voiced + ay. Tongue between teeth. THAY.",          sentence:"They are my best friends.",     emoji:"👫", category:"Sight Words"},
    {word:"WHAT",   sound:"wuh", phonetic:"/wɒt/",   hint:"WUH + short oh + t. WOT.",                              sentence:"What is your favourite colour?",emoji:"❓", category:"Sight Words"},
    {word:"WERE",   sound:"wuh", phonetic:"/wɜːr/",  hint:"WUH + er sound. Like 'fur' with W. WER.",               sentence:"We were at the park yesterday.", emoji:"🌳", category:"Sight Words"},
    {word:"THERE",  sound:"thh", phonetic:"/ðɛr/",   hint:"THH voiced + air sound. THAIR.",                        sentence:"Put your bag over there.",      emoji:"👉", category:"Sight Words"},
    {word:"WOULD",  sound:"wuh", phonetic:"/wʊd/",   hint:"WUH + short oo + d. Silent L! WOOD.",                   sentence:"Would you like some water?",   emoji:"💧", category:"Sight Words"},
    // Sentences
    {word:"GOOD MORNING",        phonetic:"/ɡʊd ˈmɔːrnɪŋ/",  hint:"GOOD — short oo. MOR-ning. Stress MOR.",       sentence:"Say this to greet people.",    emoji:"🌅", category:"Sentences"},
    {word:"THANK YOU",           phonetic:"/θæŋk juː/",       hint:"THH tongue between teeth. THANK. Then YOU.",   sentence:"Always say this after help.",  emoji:"🙏", category:"Sentences"},
    {word:"HOW ARE YOU",         phonetic:"/haʊ ɑːr juː/",    hint:"HOW rhymes with COW. Link all 3 smoothly.",    sentence:"Ask a friend this question.",  emoji:"🤝", category:"Sentences"},
    {word:"I CAN DO IT",         phonetic:"/aɪ kæn duː ɪt/",  hint:"Say with confidence! Eye-KAN-DOO-IT.",         sentence:"Believe in yourself!",         emoji:"💪", category:"Sentences"},
    {word:"THE CAT SAT ON THE MAT",phonetic:"/ðə kæt sæt ɒn ðə mæt/",hint:"Link all words smoothly. No pauses.",  sentence:"A classic phonics sentence!",  emoji:"🐱", category:"Sentences"},
    {word:"SHE SELLS SEA SHELLS", phonetic:"/ʃiː sɛlz siː ʃɛlz/",hint:"SHH sound four times! Practice slowly.",  sentence:"A famous tongue twister!",     emoji:"🐚", category:"Sentences"},
    {word:"RED LORRY YELLOW LORRY",phonetic:"/rɛd lɒri jɛloʊ lɒri/",hint:"R and L alternate. Say slowly first.", sentence:"Another fun tongue twister!",  emoji:"🚛", category:"Sentences"},
  ],
};

const AGE_MODULES = {
  "5-9":  ["Short Vowels","Long Vowels","Consonants","Digraphs sh/ch/th","Blends","Sight Words","Sentences"],
  "10-14":["Consonants","Digraphs sh/ch/th","Blends","Long Vowels","Sight Words","Sentences"],
  "15+":  ["Digraphs sh/ch/th","Blends","Long Vowels","Sight Words","Sentences"],
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildList = (ageGroup) => {
  const modules = AGE_MODULES[ageGroup] || AGE_MODULES["5-9"];
  const all = WORD_BANK.phonicsSounds.filter(w => modules.includes(w.category));
  // structured: 60% in order, 40% random
  const ordered = modules.flatMap(m => all.filter(w => w.category === m));
  const randomPart = shuffle(all).slice(0, Math.floor(all.length * 0.4));
  return [...ordered, ...randomPart];
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{min-height:100%;background:#07061a}
body{font-family:'Nunito',sans-serif;color:#f0eeff;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}
.ll-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:12px 10px 32px;background:radial-gradient(ellipse at 50% 0%,#1a0f3a 0%,#07061a 70%)}
.ll-card{width:100%;max-width:480px;display:flex;flex-direction:column;gap:10px}
.ll-header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:rgba(255,255,255,0.06);border-radius:22px;border:1px solid rgba(255,255,255,0.08)}
.ll-logo{display:flex;align-items:center;gap:10px}
.ll-logo-icon{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.ll-logo-title{font-weight:900;font-size:1.15rem;background:linear-gradient(90deg,#c084fc,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.ll-logo-sub{font-size:0.65rem;color:#a89fd8;margin-top:-2px}
.ll-stars{display:flex;align-items:center;gap:6px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.25);border-radius:20px;padding:6px 14px;font-size:0.85rem;font-weight:800;color:#fbbf24;flex-shrink:0}
.ll-streak{display:flex;align-items:center;gap:5px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:20px;padding:5px 12px;font-size:0.78rem;font-weight:800;color:#f87171}
.ll-progress{background:rgba(255,255,255,0.05);border-radius:14px;padding:10px 16px}
.ll-prog-top{display:flex;justify-content:space-between;font-size:0.72rem;color:#a89fd8;margin-bottom:6px;font-weight:700}
.ll-prog-bar{height:7px;background:rgba(255,255,255,0.08);border-radius:8px;overflow:hidden}
.ll-prog-fill{height:100%;background:linear-gradient(90deg,#7c3aed,#ec4899);border-radius:8px;transition:width .5s ease}
.ll-category-pill{background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3);border-radius:20px;padding:6px 14px;font-size:0.72rem;font-weight:800;color:#c084fc;text-align:center}
.ll-word-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:28px;padding:24px 20px;text-align:center;cursor:pointer;transition:all .2s;position:relative;user-select:none}
.ll-word-card:active{transform:scale(0.98)}
.ll-hear-hint{position:absolute;top:12px;right:14px;background:rgba(124,58,237,0.3);border-radius:10px;padding:3px 10px;font-size:0.68rem;color:#c084fc;font-weight:700}
.ll-word-emoji{font-size:3rem;display:block;margin-bottom:8px}
.ll-word-big{font-size:clamp(1.8rem,7vw,2.8rem);font-weight:900;color:#fff;letter-spacing:2px;display:block;margin-bottom:8px}
.ll-phonetic{font-size:0.95rem;color:#c084fc;margin-bottom:4px}
.ll-sound-badge{display:inline-block;background:rgba(236,72,153,0.2);border:1px solid rgba(236,72,153,0.3);border-radius:12px;padding:4px 14px;font-size:0.8rem;font-weight:800;color:#f9a8d4;margin-top:4px}
.ll-sentence{background:rgba(124,58,237,0.1);border-left:3px solid #7c3aed;border-radius:0 14px 14px 0;padding:10px 16px;font-size:0.88rem;color:#d4c8ff;font-style:italic;line-height:1.5}
.ll-tip{background:rgba(255,255,255,0.04);border-radius:16px;padding:11px 16px;font-size:0.8rem;color:#c084fc;line-height:1.6;display:flex;gap:8px;align-items:flex-start}
.ll-waveform-wrap{background:rgba(0,0,0,0.3);border-radius:18px;border:1px solid rgba(124,58,237,0.2);height:72px;display:flex;align-items:center;justify-content:center;transition:all .3s;overflow:hidden;padding:8px 10px}
.ll-waveform-wrap.active{border-color:rgba(239,68,68,0.6);background:rgba(239,68,68,0.04)}
.ll-waveform-idle{display:flex;align-items:center;gap:3px;height:100%;width:100%;justify-content:center}
.ll-waveform-idle span{display:block;width:3px;border-radius:3px;background:rgba(124,58,237,0.3);animation:idle-wave 1.8s ease-in-out infinite}
@keyframes idle-wave{0%,100%{transform:scaleY(1);opacity:.25}50%{transform:scaleY(2.2);opacity:.55}}
.ll-status{text-align:center;font-size:0.8rem;color:#a89fd8;min-height:20px;font-weight:700}
.ll-status.listening{color:#ef4444}
.ll-status.processing{color:#c084fc}
.ll-heard{background:rgba(255,255,255,0.05);border-radius:14px;padding:10px 16px;text-align:center}
.ll-heard-label{font-size:0.65rem;color:#a89fd8;margin-bottom:3px}
.ll-heard-val{font-weight:800;color:#f0eeff;font-size:0.95rem}
.ll-result{border-radius:22px;padding:16px;text-align:center}
.ll-result.great{background:rgba(16,185,129,0.12);border:2px solid rgba(16,185,129,0.3)}
.ll-result.ok{background:rgba(251,191,36,0.12);border:2px solid rgba(251,191,36,0.25)}
.ll-result.retry{background:rgba(239,68,68,0.12);border:2px solid rgba(239,68,68,0.25)}
.ll-score{font-size:2.4rem;font-weight:900;margin-bottom:4px}
.ll-result.great .ll-score{color:#10b981}
.ll-result.ok .ll-score{color:#fbbf24}
.ll-result.retry .ll-score{color:#ef4444}
.ll-result-msg{font-size:0.9rem;font-weight:800;margin-bottom:4px}
.ll-result-detail{font-size:0.78rem;color:#a89fd8;line-height:1.5}
.ll-mic-area{display:flex;flex-direction:column;align-items:center;gap:6px}
.ll-hold-btn{width:100%;border:none;border-radius:22px;background:linear-gradient(135deg,#dc2626,#991b1b);cursor:pointer;font-family:'Nunito',sans-serif;font-weight:900;font-size:1rem;color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;height:64px;user-select:none;-webkit-user-select:none;touch-action:none;position:relative;overflow:hidden;transition:transform .1s,box-shadow .2s}
.ll-hold-btn:disabled{opacity:.5;cursor:not-allowed}
.ll-hold-btn.holding{transform:scale(0.97);box-shadow:0 0 0 0 rgba(239,68,68,0.6);animation:pulse-hold .8s infinite}
.ll-hold-btn-fill{position:absolute;left:0;top:0;height:100%;background:rgba(255,255,255,0.2);transition:width .08s linear;border-radius:22px 0 0 22px}
@keyframes pulse-hold{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}50%{box-shadow:0 0 0 16px rgba(239,68,68,0)}}
.ll-hold-hint{font-size:0.7rem;color:#a89fd8;text-align:center;font-weight:700;padding:0 10px}
.ll-hold-hint.active{color:#ef4444}
.ll-btn-hear{width:100%;padding:14px;border-radius:18px;border:none;font-family:'Nunito',sans-serif;font-size:0.9rem;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s}
.ll-btn-hear:active{transform:scale(0.97)}
.ll-action-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ll-btn-next{padding:14px;border-radius:18px;border:none;font-family:'Nunito',sans-serif;font-size:0.9rem;font-weight:800;cursor:pointer;background:linear-gradient(135deg,#059669,#047857);color:#fff;transition:all .15s}
.ll-btn-again{padding:14px;border-radius:18px;border:1px solid rgba(255,255,255,0.12);font-family:'Nunito',sans-serif;font-size:0.9rem;font-weight:800;cursor:pointer;background:rgba(255,255,255,0.07);color:#f0eeff;transition:all .15s}
.ll-btn-next:active,.ll-btn-again:active{transform:scale(0.97)}
.ll-ai-thinking{display:flex;align-items:center;gap:8px;justify-content:center;padding:12px;background:rgba(124,58,237,0.1);border-radius:16px;font-size:0.82rem;color:#c084fc;font-weight:700}
.ll-dot-anim{width:7px;height:7px;border-radius:50%;background:#c084fc;animation:bounce .9s infinite}
.ll-dot-anim:nth-child(2){animation-delay:.15s}
.ll-dot-anim:nth-child(3){animation-delay:.3s}
@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
.ll-badge{position:fixed;top:18px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#1a1200;padding:10px 26px;border-radius:22px;font-weight:900;font-size:0.95rem;z-index:999;white-space:nowrap;animation:badge-anim 2.8s forwards;pointer-events:none}
@keyframes badge-anim{0%{opacity:0;transform:translateX(-50%) translateY(-16px) scale(.85)}15%{opacity:1;transform:translateX(-50%) translateY(0) scale(1.04)}85%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-10px) scale(.95)}}
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
  const [wordList, setWordList] = useState([]);
  const [idx, setIdx] = useState(0);
  const [stars, setStars] = useState(0);
  const [streak, setStreak] = useState(0);
  const [holding, setHolding] = useState(false);
  const [heard, setHeard] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [result, setResult] = useState(null);
  const [badge, setBadge] = useState(null);
  const [status, setStatus] = useState("Hold the mic button and speak!");
  const [holdProgress, setHoldProgress] = useState(0);
  const [rvReady, setRvReady] = useState(false);

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const holdTimerRef = useRef(null);
  const heardRef = useRef(null);
  const holdingRef = useRef(false);
  const recRef = useRef(null);
  const bottomRef = useRef(null);

  // Load ResponsiveVoice
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    if (!document.querySelector(`script[src="${RV_SCRIPT}"]`)) {
      const s = document.createElement("script");
      s.src = RV_SCRIPT;
      s.onload = () => setRvReady(true);
      document.head.appendChild(s);
    } else { setRvReady(true); }
    speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [result, aiThinking]);

  const item = wordList[idx];

  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = 48;
      const barW = (canvas.width - (barCount - 1) * 2) / barCount;
      for (let i = 0; i < barCount; i++) {
        const val = dataArray[Math.floor(i * analyser.frequencyBinCount / barCount)] / 255;
        const h = Math.max(4, val * canvas.height * 0.9);
        const x = i * (barW + 2);
        const y = (canvas.height - h) / 2;
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, `rgba(236,72,153,${0.5 + val * 0.5})`);
        g.addColorStop(1, `rgba(124,58,237,${0.5 + val * 0.5})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h, 2);
        ctx.fill();
      }
    };
    draw();
  }, []);

  const stopWaveform = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch(e){} audioCtxRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    analyserRef.current = null;
  }, []);

  const startWaveform = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, echoCancellation: true, noiseSuppression: false });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const src = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
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

  const startHold = useCallback(async (e) => {
    e.preventDefault();
    if (aiThinking || holdingRef.current) return;
    // Stop any speech
    if (window.responsiveVoice) window.responsiveVoice.cancel();
    speechSynthesis.cancel();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setStatus("Please use Google Chrome!"); return; }

    holdingRef.current = true;
    setHolding(true);
    setResult(null);
    setHeard(null);
    heardRef.current = null;
    setHoldProgress(0);
    setStatus("🔴 Listening… speak now!");

    await startWaveform();

    let prog = 0;
    holdTimerRef.current = setInterval(() => {
      prog = Math.min(100, prog + 1.0);
      setHoldProgress(prog);
    }, 80);

    // KEY FIX: Use single-shot recognition, restart on end while holding
    const startRec = () => {
      if (!holdingRef.current) return;
      const rec = new SR();
      recRef.current = rec;
      rec.lang = "en-US";
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      rec.continuous = false; // single-shot is more reliable for short words

      rec.onresult = (ev) => {
        let best = "";
        for (let i = 0; i < ev.results.length; i++) {
          const t = ev.results[i][0].transcript.trim();
          if (t.length > best.length) best = t;
        }
        if (best) { heardRef.current = best; setHeard(best); }
      };

      rec.onend = () => {
        // Restart if still holding
        if (holdingRef.current) {
          setTimeout(startRec, 100);
        }
      };

      rec.onerror = (e) => {
        if (e.error === "not-allowed") {
          setStatus("Microphone blocked. Allow mic access in browser settings.");
          holdingRef.current = false;
          setHolding(false);
        }
      };

      try { rec.start(); } catch(e) {}
    };

    startRec();
  }, [aiThinking, startWaveform]);

  const endHold = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    setHoldProgress(0);
    clearInterval(holdTimerRef.current);
    stopWaveform();

    if (recRef.current) {
      try { recRef.current.onend = null; recRef.current.stop(); } catch(e){}
      recRef.current = null;
    }

    setStatus("⚙️ Processing…");

    setTimeout(() => {
      const finalHeard = heardRef.current;
      if (finalHeard && finalHeard.trim().length > 0) {
        judgeWithClaude(finalHeard.trim());
      } else {
        setStatus("Didn't catch it — speak louder and hold longer!");
        speak("I didn't catch that. Try speaking a little louder and hold the button longer.");
      }
    }, 500);
  }, [stopWaveform]);

  function startApp() {
    if (!name.trim()) { alert("Please enter your name!"); return; }
    if (!age) { alert("Please select your age!"); return; }
    const list = buildList(age);
    setWordList(list);
    setIdx(0);
    setScreen("main");
    setTimeout(() => speak(`Welcome to LingoLeap, ${name}! I will teach you the sounds of English. Tap the word card to hear the sou
