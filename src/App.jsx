import { useState, useEffect, useRef, useCallback } from "react";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";

// ── WORD BANK ──────────────────────────────────────────────────────────────
const WORD_BANK = {
  vowels: [
    {word:"A",phonetic:"/eɪ/",hint:"Open mouth wide. Long A — like 'ay'",sentence:"A is the first letter.",emoji:"🅰️"},
    {word:"E",phonetic:"/iː/",hint:"Smile wide. Long E — like 'ee'",sentence:"E is a vowel.",emoji:"📧"},
    {word:"I",phonetic:"/aɪ/",hint:"Start open, close to a smile. Long I.",sentence:"I is a vowel sound.",emoji:"👁️"},
    {word:"O",phonetic:"/oʊ/",hint:"Round your lips like a circle. Long O.",sentence:"O is round like a ball.",emoji:"⭕"},
    {word:"U",phonetic:"/juː/",hint:"Lips forward like blowing. Long U.",sentence:"U is the last vowel.",emoji:"🔵"},
    {word:"ANT",phonetic:"/ænt/",hint:"Short A — mouth open, tongue flat. Then N-T.",sentence:"An ant is very small.",emoji:"🐜"},
    {word:"EGG",phonetic:"/ɛɡ/",hint:"Short E — like 'eh'. Then a hard G.",sentence:"Crack an egg carefully.",emoji:"🥚"},
    {word:"INK",phonetic:"/ɪŋk/",hint:"Short I — like 'ih'. Tongue high.",sentence:"The ink is blue.",emoji:"🖊️"},
    {word:"OX",phonetic:"/ɒks/",hint:"Short O — open round mouth. Then X.",sentence:"An ox pulls the cart.",emoji:"🐂"},
    {word:"UP",phonetic:"/ʌp/",hint:"Short U — relaxed 'uh'. Then P pop.",sentence:"Look up at the sky.",emoji:"⬆️"},
    {word:"APE",phonetic:"/eɪp/",hint:"Long A — say 'ay'. Then P.",sentence:"An ape is very clever.",emoji:"🦧"},
    {word:"EEL",phonetic:"/iːl/",hint:"Long E — stretch your smile. Then L.",sentence:"An eel lives in water.",emoji:"🐍"},
    {word:"ICE",phonetic:"/aɪs/",hint:"Long I — open wide then smile. Then S.",sentence:"Ice is cold and slippery.",emoji:"🧊"},
    {word:"OAK",phonetic:"/oʊk/",hint:"Long O — round lips. Then K click.",sentence:"An oak is a big tree.",emoji:"🌳"},
    {word:"USE",phonetic:"/juːz/",hint:"Long U — like 'you'. Then Z buzz.",sentence:"Use your pencil carefully.",emoji:"✏️"},
  ],
  cvc: [
    {word:"CAT",phonetic:"/kæt/",hint:"K click + short A + T click",sentence:"The cat sat on the mat.",emoji:"🐱"},
    {word:"DOG",phonetic:"/dɒɡ/",hint:"D tongue-tip + short O + G throat",sentence:"My dog loves to run.",emoji:"🐶"},
    {word:"SUN",phonetic:"/sʌn/",hint:"S hiss + short U + N hum",sentence:"The sun is very bright.",emoji:"☀️"},
    {word:"HAT",phonetic:"/hæt/",hint:"H breath + short A + T click",sentence:"She wore a red hat.",emoji:"🎩"},
    {word:"BIG",phonetic:"/bɪɡ/",hint:"B lip-pop + short I + G throat",sentence:"That is a big elephant.",emoji:"🐘"},
    {word:"RUN",phonetic:"/rʌn/",hint:"R float + short U + N hum",sentence:"I like to run fast.",emoji:"🏃"},
    {word:"PIG",phonetic:"/pɪɡ/",hint:"P lip-pop + short I + G throat",sentence:"The pig rolled in mud.",emoji:"🐷"},
    {word:"HOP",phonetic:"/hɒp/",hint:"H breath + short O + P pop",sentence:"Frogs like to hop.",emoji:"🐸"},
    {word:"BED",phonetic:"/bɛd/",hint:"B lip-pop + short E + D tongue",sentence:"I sleep in my bed.",emoji:"🛏️"},
    {word:"CUP",phonetic:"/kʌp/",hint:"K click + short U + P pop",sentence:"Fill the cup with water.",emoji:"☕"},
    {word:"FAN",phonetic:"/fæn/",hint:"F teeth-lip + short A + N hum",sentence:"Turn on the fan please.",emoji:"🌬️"},
    {word:"LEG",phonetic:"/lɛɡ/",hint:"L tongue-roof + short E + G throat",sentence:"The dog hurt its leg.",emoji:"🦵"},
    {word:"MOP",phonetic:"/mɒp/",hint:"M lip-hum + short O + P pop",sentence:"Use the mop to clean.",emoji:"🧹"},
    {word:"NET",phonetic:"/nɛt/",hint:"N hum + short E + T click",sentence:"Catch the fish in a net.",emoji:"🎣"},
    {word:"POT",phonetic:"/pɒt/",hint:"P pop + short O + T click",sentence:"Cook soup in a pot.",emoji:"🍲"},
    {word:"RAT",phonetic:"/ræt/",hint:"R float + short A + T click",sentence:"A rat ran across the floor.",emoji:"🐀"},
    {word:"SIT",phonetic:"/sɪt/",hint:"S hiss + short I + T click",sentence:"Please sit down quietly.",emoji:"🪑"},
    {word:"TUB",phonetic:"/tʌb/",hint:"T click + short U + B pop",sentence:"Fill the tub with water.",emoji:"🛁"},
    {word:"VAN",phonetic:"/væn/",hint:"V teeth-lip buzz + short A + N hum",sentence:"The van is parked outside.",emoji:"🚐"},
    {word:"WEB",phonetic:"/wɛb/",hint:"W round lips + short E + B pop",sentence:"A spider spins a web.",emoji:"🕸️"},
    {word:"YAK",phonetic:"/jæk/",hint:"Y glide + short A + K click",sentence:"A yak lives in the mountains.",emoji:"🐃"},
    {word:"ZIP",phonetic:"/zɪp/",hint:"Z buzz + short I + P pop",sentence:"Zip up your jacket.",emoji:"🤐"},
    {word:"BOX",phonetic:"/bɒks/",hint:"B pop + short O + KS sound",sentence:"Put it in the box.",emoji:"📦"},
    {word:"FOX",phonetic:"/fɒks/",hint:"F teeth-lip + short O + KS",sentence:"A fox is very clever.",emoji:"🦊"},
    {word:"MIX",phonetic:"/mɪks/",hint:"M hum + short I + KS",sentence:"Mix the flour and eggs.",emoji:"🥣"},
    {word:"SIX",phonetic:"/sɪks/",hint:"S hiss + short I + KS",sentence:"I have six fingers... just kidding!",emoji:"6️⃣"},
    {word:"WAX",phonetic:"/wæks/",hint:"W lips + short A + KS",sentence:"Polish with wax.",emoji:"🕯️"},
    {word:"BUS",phonetic:"/bʌs/",hint:"B pop + short U + S hiss",sentence:"Take the bus to school.",emoji:"🚌"},
    {word:"GUM",phonetic:"/ɡʌm/",hint:"G throat + short U + M hum",sentence:"Do not chew gum in class.",emoji:"🍬"},
    {word:"HUM",phonetic:"/hʌm/",hint:"H breath + short U + M hum",sentence:"She began to hum a song.",emoji:"🎵"},
  ],
  blends: [
    {word:"SHIP",phonetic:"/ʃɪp/",hint:"SH — tongue back, blow softly. Like shushing.",sentence:"The ship sails on the sea.",emoji:"🚢"},
    {word:"CHIN",phonetic:"/tʃɪn/",hint:"CH — like a sneeze. Ch! Then -in.",sentence:"She touched her chin.",emoji:"🧔"},
    {word:"THIN",phonetic:"/θɪn/",hint:"TH — tongue between teeth, blow. Then -in.",sentence:"The paper is very thin.",emoji:"📄"},
    {word:"THEN",phonetic:"/ðɛn/",hint:"TH voiced — tongue between teeth, voice on.",sentence:"Eat, then wash your hands.",emoji:"👅"},
    {word:"FROG",phonetic:"/frɒɡ/",hint:"FR — F then R blend quickly. Frrrog.",sentence:"A green frog jumped.",emoji:"🐸"},
    {word:"STAR",phonetic:"/stɑːr/",hint:"ST — S hiss then T click together.",sentence:"I see a bright star.",emoji:"⭐"},
    {word:"PLAY",phonetic:"/pleɪ/",hint:"PL — P pop then L tongue-roof together.",sentence:"Children love to play.",emoji:"🎮"},
    {word:"CLAP",phonetic:"/klæp/",hint:"CL — K click then L tongue-roof.",sentence:"Clap your hands together.",emoji:"👏"},
    {word:"GRIN",phonetic:"/ɡrɪn/",hint:"GR — G throat then R float together.",sentence:"He had a big grin.",emoji:"😁"},
    {word:"BRIM",phonetic:"/brɪm/",hint:"BR — B pop then R float quickly.",sentence:"Fill it to the brim.",emoji:"🥤"},
    {word:"DRIP",phonetic:"/drɪp/",hint:"DR — D tongue then R float together.",sentence:"Water began to drip.",emoji:"💧"},
    {word:"FLIP",phonetic:"/flɪp/",hint:"FL — F teeth-lip then L tongue-roof.",sentence:"Flip the pancake over.",emoji:"🥞"},
    {word:"SKIP",phonetic:"/skɪp/",hint:"SK — S hiss then K click together.",sentence:"Let's skip down the path.",emoji:"🏃"},
    {word:"SLIP",phonetic:"/slɪp/",hint:"SL — S hiss then L tongue-roof.",sentence:"Be careful not to slip.",emoji:"⚠️"},
    {word:"SNAP",phonetic:"/snæp/",hint:"SN — S hiss then N hum together.",sentence:"Snap your fingers.",emoji:"🫰"},
    {word:"SPIN",phonetic:"/spɪn/",hint:"SP — S hiss then P pop together.",sentence:"Watch the top spin.",emoji:"🌀"},
    {word:"STOP",phonetic:"/stɒp/",hint:"ST — S then T quickly. Then -op.",sentence:"Stop at the red light.",emoji:"🛑"},
    {word:"SWIM",phonetic:"/swɪm/",hint:"SW — S hiss then W lips together.",sentence:"Fish love to swim.",emoji:"🏊"},
    {word:"TWIN",phonetic:"/twɪn/",hint:"TW — T click then W lips together.",sentence:"They are twin sisters.",emoji:"👯"},
    {word:"PHONE",phonetic:"/foʊn/",hint:"PH sounds like F. fone. Long O.",sentence:"Call me on the phone.",emoji:"📱"},
    {word:"WHEAT",phonetic:"/wiːt/",hint:"WH sounds like W. Long E then T.",sentence:"Bread is made from wheat.",emoji:"🌾"},
    {word:"CHUNK",phonetic:"/tʃʌŋk/",hint:"CH start + short U + NK at end.",sentence:"Cut a big chunk of bread.",emoji:"🍞"},
    {word:"SHRINK",phonetic:"/ʃrɪŋk/",hint:"SHR blend — SH then R quickly. -ink.",sentence:"Wool can shrink when wet.",emoji:"🧶"},
    {word:"THROAT",phonetic:"/θroʊt/",hint:"THR blend — TH then R. Long O.",sentence:"My throat is sore.",emoji:"🤒"},
    {word:"SPRING",phonetic:"/sprɪŋ/",hint:"SPR — three sounds. S-P-R quickly.",sentence:"Flowers bloom in spring.",emoji:"🌸"},
  ],
  longVowels: [
    {word:"CAKE",phonetic:"/keɪk/",hint:"Long A — say 'ay'. K-AY-K.",sentence:"She baked a birthday cake.",emoji:"🎂"},
    {word:"KITE",phonetic:"/kaɪt/",hint:"Long I — open wide then smile. K-I-T.",sentence:"Fly a kite on a windy day.",emoji:"🪁"},
    {word:"HOME",phonetic:"/hoʊm/",hint:"Long O — round lips. H-OH-M.",sentence:"I love my home.",emoji:"🏠"},
    {word:"CUTE",phonetic:"/kjuːt/",hint:"Long U — like 'you'. CY-OOT.",sentence:"The puppy is so cute.",emoji:"🐶"},
    {word:"FEET",phonetic:"/fiːt/",hint:"Long E — stretch your smile. F-EE-T.",sentence:"Wash your feet every day.",emoji:"🦶"},
    {word:"RAIN",phonetic:"/reɪn/",hint:"Long A with AI. R-AY-N.",sentence:"I love the rain.",emoji:"🌧️"},
    {word:"BOAT",phonetic:"/boʊt/",hint:"Long O with OA. B-OH-T.",sentence:"Row the boat gently.",emoji:"⛵"},
    {word:"SEED",phonetic:"/siːd/",hint:"Long E with EE. S-EE-D.",sentence:"Plant a seed in the soil.",emoji:"🌱"},
    {word:"MINE",phonetic:"/maɪn/",hint:"Long I with silent E. M-I-N.",sentence:"That book is mine.",emoji:"📚"},
    {word:"TUNE",phonetic:"/tjuːn/",hint:"Long U with silent E. T-OO-N.",sentence:"Hum a happy tune.",emoji:"🎵"},
    {word:"BIKE",phonetic:"/baɪk/",hint:"Long I with silent E. B-I-K.",sentence:"Ride your bike to school.",emoji:"🚲"},
    {word:"BONE",phonetic:"/boʊn/",hint:"Long O with silent E. B-OH-N.",sentence:"The dog chewed a bone.",emoji:"🦴"},
    {word:"CAVE",phonetic:"/keɪv/",hint:"Long A with silent E. K-AY-V.",sentence:"A bear lives in a cave.",emoji:"🐻"},
    {word:"DIVE",phonetic:"/daɪv/",hint:"Long I with silent E. D-I-V.",sentence:"Dive into the pool.",emoji:"🏊"},
    {word:"DUNE",phonetic:"/djuːn/",hint:"Long U with silent E. D-OO-N.",sentence:"A sand dune in the desert.",emoji:"🏜️"},
    {word:"FLAME",phonetic:"/fleɪm/",hint:"FL blend + long A + silent E.",sentence:"The flame burned brightly.",emoji:"🔥"},
    {word:"GLOBE",phonetic:"/ɡloʊb/",hint:"GL blend + long O + silent E.",sentence:"Spin the globe around.",emoji:"🌍"},
    {word:"GRADE",phonetic:"/ɡreɪd/",hint:"GR blend + long A + silent E.",sentence:"She got a good grade.",emoji:"📝"},
    {word:"PRIDE",phonetic:"/praɪd/",hint:"PR blend + long I + silent E.",sentence:"Take pride in your work.",emoji:"🦁"},
    {word:"SMILE",phonetic:"/smaɪl/",hint:"SM blend + long I + silent E.",sentence:"Always smile and be happy.",emoji:"😊"},
    {word:"STONE",phonetic:"/stoʊn/",hint:"ST blend + long O + silent E.",sentence:"Skip a stone on the lake.",emoji:"🪨"},
    {word:"THRONE",phonetic:"/θroʊn/",hint:"THR blend + long O + silent E.",sentence:"The king sat on his throne.",emoji:"👑"},
    {word:"CRANE",phonetic:"/kreɪn/",hint:"CR blend + long A + silent E.",sentence:"A crane lifted the steel beam.",emoji:"🏗️"},
    {word:"FREEZE",phonetic:"/friːz/",hint:"FR blend + long E + Z buzz.",sentence:"Water will freeze at zero degrees.",emoji:"🧊"},
    {word:"SLOPE",phonetic:"/sloʊp/",hint:"SL blend + long O + silent E.",sentence:"Ski down the snowy slope.",emoji:"⛷️"},
  ],
  sightWords: [
    {word:"THE",phonetic:"/ðə/",hint:"TH voiced — tongue between teeth. Then 'uh'.",sentence:"The cat is on the mat.",emoji:"📖"},
    {word:"WAS",phonetic:"/wɒz/",hint:"W lips + short O + Z buzz. Not 'wass'!",sentence:"It was a sunny day.",emoji:"☀️"},
    {word:"SAID",phonetic:"/sɛd/",hint:"S + short E + D. Not 'sayed'!",sentence:"She said hello to me.",emoji:"💬"},
    {word:"HAVE",phonetic:"/hæv/",hint:"H breath + short A + V buzz. Silent E.",sentence:"I have two pencils.",emoji:"✏️"},
    {word:"COME",phonetic:"/kʌm/",hint:"K click + short U + M hum. Silent E.",sentence:"Come here please.",emoji:"👋"},
    {word:"SOME",phonetic:"/sʌm/",hint:"S hiss + short U + M hum. Silent E.",sentence:"I want some water.",emoji:"💧"},
    {word:"THEY",phonetic:"/ðeɪ/",hint:"TH voiced + long A + Y glide.",sentence:"They are my best friends.",emoji:"👫"},
    {word:"WERE",phonetic:"/wɜːr/",hint:"W lips + ER sound. Not 'wee-re'!",sentence:"We were at the park.",emoji:"🌳"},
    {word:"YOUR",phonetic:"/jɔːr/",hint:"Y glide + OR sound.",sentence:"Is this your book?",emoji:"📚"},
    {word:"WHAT",phonetic:"/wɒt/",hint:"WH = W sound. Short O then T.",sentence:"What is your name?",emoji:"❓"},
    {word:"WHEN",phonetic:"/wɛn/",hint:"WH = W sound. Short E then N.",sentence:"When do you go to school?",emoji:"⏰"},
    {word:"THERE",phonetic:"/ðɛr/",hint:"TH voiced + air ER sound.",sentence:"Put it over there.",emoji:"👉"},
    {word:"THEIR",phonetic:"/ðɛr/",hint:"TH voiced + air sound. Same as 'there'!",sentence:"That is their house.",emoji:"🏠"},
    {word:"WHICH",phonetic:"/wɪtʃ/",hint:"W lips + short I + CH sneeze.",sentence:"Which one do you want?",emoji:"🤔"},
    {word:"WOULD",phonetic:"/wʊd/",hint:"W lips + short OO + D. Silent L!",sentence:"Would you like some cake?",emoji:"🎂"},
    {word:"COULD",phonetic:"/kʊd/",hint:"K click + short OO + D. Silent L!",sentence:"Could you help me please?",emoji:"🙏"},
    {word:"SHOULD",phonetic:"/ʃʊd/",hint:"SH + short OO + D. Silent L!",sentence:"You should drink more water.",emoji:"💧"},
    {word:"PEOPLE",phonetic:"/ˈpiːpəl/",hint:"P + long E + P + ul. Stress first part.",sentence:"People are kind and helpful.",emoji:"👥"},
    {word:"WATER",phonetic:"/ˈwɔːtər/",hint:"W + AW sound + ter. Stress first part.",sentence:"Drink eight glasses of water.",emoji:"🥤"},
    {word:"BECAUSE",phonetic:"/bɪˈkɒz/",hint:"Bih-KOZ. Stress the second part.",sentence:"I am happy because it is sunny.",emoji:"😊"},
  ],
  sentences: [
    {word:"GOOD MORNING",phonetic:"/ɡʊd ˈmɔːrnɪŋ/",hint:"GOOD — short OO. MOR-ning — stress MOR.",sentence:"We greet people every morning.",emoji:"🌅"},
    {word:"HOW ARE YOU",phonetic:"/haʊ ɑːr juː/",hint:"HOW rhymes with COW. Link all words.",sentence:"Ask a friend how they feel.",emoji:"🤝"},
    {word:"THANK YOU",phonetic:"/θæŋk juː/",hint:"TH tongue between teeth. THANK-you.",sentence:"Always say thank you.",emoji:"🙏"},
    {word:"PLEASE HELP ME",phonetic:"/pliːz hɛlp miː/",hint:"PLEASE — long E. Link all 3 words.",sentence:"Ask politely when you need help.",emoji:"🆘"},
    {word:"I LOVE ENGLISH",phonetic:"/aɪ lʌv ˈɪŋɡlɪʃ/",hint:"LOVE — short U sound. ING-lish.",sentence:"Say it with confidence!",emoji:"❤️"},
    {word:"MY NAME IS",phonetic:"/maɪ neɪm ɪz/",hint:"MY — long I. NAME — long A. IS — short I.",sentence:"Introduce yourself proudly.",emoji:"👋"},
    {word:"THE SUN IS BRIGHT",phonetic:"/ðə sʌn ɪz braɪt/",hint:"Link words smoothly. BRIGHT — long I.",sentence:"Describe a sunny day.",emoji:"☀️"},
    {word:"I CAN READ WELL",phonetic:"/aɪ kæn riːd wɛl/",hint:"READ — long E. Say it with pride!",sentence:"Believe in yourself!",emoji:"📚"},
    {word:"SHE SELLS SEA SHELLS",phonetic:"/ʃiː sɛlz siː ʃɛlz/",hint:"SH sound four times! S and SH alternate.",sentence:"A classic tongue twister!",emoji:"🐚"},
    {word:"RED LORRY YELLOW LORRY",phonetic:"/rɛd lɒri jɛloʊ lɒri/",hint:"R and L sounds alternate. Go slowly first!",sentence:"Another fun tongue twister!",emoji:"🚛"},
    {word:"HOW MUCH WOOD",phonetic:"/haʊ mʌtʃ wʊd/",hint:"WH=W. MUCH — short U. WOOD — short OO.",sentence:"How much wood could a woodchuck chuck?",emoji:"🪵"},
    {word:"PETER PIPER PICKED",phonetic:"/ˈpiːtər ˈpaɪpər pɪkt/",hint:"P sound repeated. Long I in Piper.",sentence:"Peter Piper picked a peck of peppers.",emoji:"🌶️"},
  ],
};

// Build master list with levels
const buildWordList = (ageGroup) => {
  const all = [];
  const push = (arr, level, module) => arr.forEach(w => all.push({...w, level, module}));
  if (ageGroup === "5-9") {
    push(WORD_BANK.vowels, 1, "Vowels");
    push(WORD_BANK.cvc, 2, "CVC Words");
    push(WORD_BANK.blends, 3, "Blends");
    push(WORD_BANK.longVowels, 4, "Long Vowels");
    push(WORD_BANK.sightWords, 5, "Sight Words");
    push(WORD_BANK.sentences, 6, "Sentences");
  } else if (ageGroup === "10-14") {
    push(WORD_BANK.cvc, 1, "CVC Words");
    push(WORD_BANK.blends, 2, "Blends");
    push(WORD_BANK.longVowels, 3, "Long Vowels");
    push(WORD_BANK.sightWords, 4, "Sight Words");
    push(WORD_BANK.sentences, 5, "Sentences");
  } else {
    push(WORD_BANK.blends, 1, "Blends");
    push(WORD_BANK.longVowels, 2, "Long Vowels");
    push(WORD_BANK.sightWords, 3, "Sight Words");
    push(WORD_BANK.sentences, 4, "Sentences");
  }
  return all;
};

// Shuffle array
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

function getBestVoice() {
  const voices = speechSynthesis.getVoices();
  const preferred = ["Google US English","Google UK English Female","Samantha","Karen","Moira","Tessa","Microsoft Aria","Microsoft Jenny","Allison","Ava"];
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }
  return voices.find(v => v.lang === "en-US" && !v.name.toLowerCase().includes("compact"))
    || voices.find(v => v.lang.startsWith("en")) || voices[0];
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
.ll-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:12px 10px 32px;background:radial-gradient(ellipse at 50% 0%,#1a0f3a 0%,#07061a 70%)}
.ll-card{width:100%;max-width:480px;display:flex;flex-direction:column;gap:10px}
.ll-header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:rgba(255,255,255,0.06);border-radius:22px;border:1px solid rgba(255,255,255,0.08)}
.ll-logo{display:flex;align-items:center;gap:10px}
.ll-logo-icon{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,#7c3aed,#ec4899);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
.ll-logo-title{font-weight:900;font-size:1.15rem;background:linear-gradient(90deg,#c084fc,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.ll-logo-sub{font-size:0.65rem;color:#a89fd8;margin-top:-2px}
.ll-stars{display:flex;align-items:center;gap:6px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.25);border-radius:20px;padding:6px 14px;font-size:0.85rem;font-weight:800;color:#fbbf24;flex-shrink:0}
.ll-module-pill{background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.3);border-radius:20px;padding:6px 14px;font-size:0.72rem;font-weight:800;color:#c084fc;text-align:center}
.ll-progress{background:rgba(255,255,255,0.05);border-radius:14px;padding:10px 16px}
.ll-prog-top{display:flex;justify-content:space-between;font-size:0.72rem;color:#a89fd8;margin-bottom:6px;font-weight:700}
.ll-prog-bar{height:7px;background:rgba(255,255,255,0.08);border-radius:8px;overflow:hidden}
.ll-prog-fill{height:100%;background:linear-gradient(90deg,#7c3aed,#ec4899);border-radius:8px;transition:width .5s ease}
.ll-word-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:28px;padding:24px 20px;text-align:center;cursor:pointer;transition:all .2s;position:relative;user-select:none}
.ll-word-card:active{transform:scale(0.98)}
.ll-hear-hint{position:absolute;top:12px;right:14px;background:rgba(124,58,237,0.3);border-radius:10px;padding:3px 10px;font-size:0.68rem;color:#c084fc;font-weight:700}
.ll-word-emoji{font-size:3rem;display:block;margin-bottom:8px}
.ll-word-big{font-size:clamp(1.8rem,7vw,2.8rem);font-weight:900;color:#fff;letter-spacing:2px;display:block;margin-bottom:8px}
.ll-phonetic{font-size:0.95rem;color:#c084fc;margin-bottom:4px}
.ll-hint-text{font-size:0.78rem;color:#a89fd8}
.ll-sentence{background:rgba(124,58,237,0.1);border-left:3px solid #7c3aed;border-radius:0 14px 14px 0;padding:10px 16px;font-size:0.88rem;color:#d4c8ff;font-style:italic;line-height:1.5}
.ll-tip{background:rgba(255,255,255,0.04);border-radius:16px;padding:11px 16px;font-size:0.8rem;color:#c084fc;line-height:1.6;display:flex;gap:8px;align-items:flex-start}
.ll-waveform-wrap{background:rgba(0,0,0,0.3);border-radius:18px;border:1px solid rgba(124,58,237,0.2);height:72px;display:flex;align-items:center;justify-content:center;transition:border-color .3s;overflow:hidden;padding:8px 10px}
.ll-waveform-wrap.active{border-color:rgba(239,68,68,0.6);background:rgba(239,68,68,0.05)}
.ll-waveform-idle{display:flex;align-items:center;gap:3px;height:100%;width:100%;justify-content:center}
.ll-waveform-idle span{display:block;width:3px;border-radius:3px;background:rgba(124,58,237,0.3);animation:idle-wave 1.8s ease-in-out infinite}
@keyframes idle-wave{0%,100%{transform:scaleY(1);opacity:.25}50%{transform:scaleY(2);opacity:.5}}
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
.ll-hold-btn{width:100%;border:none;border-radius:22px;background:linear-gradient(135deg,#dc2626,#b91c1c);cursor:pointer;font-family:'Nunito',sans-serif;font-weight:900;font-size:1rem;color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;height:62px;user-select:none;-webkit-user-select:none;touch-action:none;position:relative;overflow:hidden;transition:transform .1s}
.ll-hold-btn:disabled{opacity:.5;cursor:not-allowed}
.ll-hold-btn.holding{transform:scale(0.97);animation:pulse-hold 0.8s infinite}
.ll-hold-btn-fill{position:absolute;left:0;top:0;height:100%;background:rgba(255,255,255,0.18);transition:width .08s linear;border-radius:22px 0 0 22px}
@keyframes pulse-hold{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.5)}50%{box-shadow:0 0 0 14px rgba(239,68,68,0)}}
.ll-hold-hint{font-size:0.7rem;color:#a89fd8;text-align:center;font-weight:700}
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
.ll-streak{display:flex;align-items:center;gap:6px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:20px;padding:5px 12px;font-size:0.78rem;font-weight:800;color:#f87171}
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

  const recRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);
  const holdTimerRef = useRef(null);
  const heardRef = useRef(null);
  const bottomRef = useRef(null);
  const holdingRef = useRef(false);

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
  }, [result, aiThinking]);

  const item = wordList[idx];

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
      const barCount = 50;
      const gap = 2;
      const barW = (canvas.width - gap * (barCount - 1)) / barCount;
      for (let i = 0; i < barCount; i++) {
        const val = dataArray[Math.floor(i * bufferLength / barCount)] / 255;
        const h = Math.max(4, val * canvas.height * 0.92);
        const x = i * (barW + gap);
        const y = (canvas.height - h) / 2;
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, `rgba(236,72,153,${0.6 + val * 0.4})`);
        g.addColorStop(1, `rgba(124,58,237,${0.6 + val * 0.4})`);
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
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  const startWaveform = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, echoCancellation: true, noiseSuppression: true });
      streamRef.current = stream;
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth * window.devicePixelRatio;
        canvasRef.current.height = canvasRef.current.offsetHeight * window.devicePixelRatio;
      }
      drawWaveform();
    } catch (e) {
      console.log("Mic error", e);
    }
  }, [drawWaveform]);

  const startHold = useCallback(async (e) => {
    e.preventDefault();
    if (aiThinking || holdingRef.current) return;
    speechSynthesis.cancel();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setStatus("Please use Google Chrome for mic support!"); return; }
    holdingRef.current = true;
    setHolding(true);
    setStatus("🔴 Listening… speak now!");
    setResult(null);
    setHeard(null);
    heardRef.current = null;
    setHoldProgress(0);
    await startWaveform();
    let prog = 0;
    holdTimerRef.current = setInterval(() => {
      prog = Math.min(100, prog + 1.2);
      setHoldProgress(prog);
    }, 80);
    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 5;
    rec.continuous = true;
    rec.onresult = (ev) => {
      let best = "";
      for (let i = 0; i < ev.results.length; i++) {
        const t = ev.results[i][0].transcript.trim();
        if (t.length > best.length) best = t;
      }
      if (best) { heardRef.current = best; setHeard(best); }
    };
    rec.onerror = (e) => { if (e.error !== "no-speech") console.log("SR error", e.error); };
    try { rec.start(); } catch(e) {}
  }, [aiThinking, startWaveform]);

  const endHold = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    setHoldProgress(0);
    clearInterval(holdTimerRef.current);
    stopWaveform();
    if (recRef.current) { try { recRef.current.stop(); recRef.current.abort(); } catch(e){} recRef.current = null; }
    setStatus("⚙️ Processing your voice…");
    setTimeout(() => {
      const finalHeard = heardRef.current;
      if (finalHeard && finalHeard.trim().length > 0) {
        judgeWithClaude(finalHeard.trim());
      } else {
        setStatus("Didn't catch that — try holding longer and speaking clearly!");
        speak("I didn't catch that. Hold the button and speak clearly!");
      }
    }, 800);
  }, [stopWaveform]);

  function startApp() {
    if (!name.trim()) { alert("Please enter your name!"); return; }
    if (!age) { alert("Please select your age!"); return; }
    const list = shuffle(buildWordList(age));
    setWordList(list);
    setIdx(0);
    setScreen("main");
    setTimeout(() => speak(`Welcome to LingoLeap, ${name}! Tap the word card to hear it, then hold the microphone to speak!`, 0.9), 500);
  }

  function resetResult() {
    setResult(null); setHeard(null);
    heardRef.current = null;
    setStatus("Hold the mic button and speak!");
  }

  function hearWord() {
    if (!item) return;
    speak(`${item.word.toLowerCase()}. ${item.sentence}`, 0.78);
  }

  async function judgeWithClaude(said) {
    if (!item) return;
    setAiThinking(true);
    setStatus("🤖 AI is judging…");
    const prompt = `You are a warm English pronunciation coach for ages 5 to adult.
Target word/phrase: "${item.word}" — phonetic: ${item.phonetic}
Tip: ${item.hint}
Speech recognition heard: "${said}"

Score the pronunciation from 0-100. Be encouraging and specific.
Reply ONLY with valid JSON (no markdown):
{"score":85,"grade":"great","message":"Well done!","detail":"Your vowel sound was clear. The ending was sharp.","spoken_feedback":"Well done! 85 percent. Your vowel sound was perfect!"}
grade: "great"=80+, "ok"=50-79, "retry"=below 50
spoken_feedback: max 2 warm sentences, spoken aloud to learner.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 220,
          messages: [{ role: "user", content: prompt }] })
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "{}";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setResult(parsed);
      setStatus("");
      speak(parsed.spoken_feedback || `You scored ${parsed.score} percent!`, 0.88);
      if (parsed.grade === "great") {
        const ns = stars + (parsed.score >= 95 ? 2 : 1);
        const ns2 = streak + 1;
        setStars(ns); setStreak(ns2);
        if ([5,10,20,30,50,100].includes(ns)) {
          const msg = ns===5?"🌟 5 Stars!":ns===10?"🏅 10 Stars!":ns===20?"🏆 Word Wizard!":ns===30?"🏆 Pro!":ns===50?"🏆 Champion!":"🎯 100 Stars!";
          setBadge(msg); setTimeout(()=>setBadge(null),2800);
        }
      } else { setStreak(0); }
    } catch(e) {
      setResult({score:0,grade:"retry",message:"Connection error",detail:"Check internet and try again.",spoken_feedback:"Please try again!"});
      setStatus(""); speak("Please try again!");
    }
    setAiThinking(false);
  }

  function nextWord() {
    if (!wordList.length) return;
    const next = (idx + 1) % wordList.length;
    if (next === 0) {
      // reshuffled
      const reshuffled = shuffle(wordList);
      setWordList(reshuffled);
    }
    setIdx(next);
    resetResult();
    setTimeout(() => { if (wordList[next]) speak(wordList[next].word.toLowerCase(), 0.75); }, 400);
  }

  const progress = wordList.length ? Math.round((idx / wordList.length) * 100) : 0;

  if (screen === "onboard") return (
    <div className="ll-wrap">
      <div className="ll-card">
        <div className="ll-header">
          <div className="ll-logo">
            <div className="ll-logo-icon">🎤</div>
            <div><div className="ll-logo-title">LingoLeap</div><div className="ll-logo-sub">English Pronunciation Coach</div></div>
          </div>
        </div>
        <div className="ll-onboard">
          <div className="ll-onboard-hero">
            <div style={{fontSize:"3.5rem",marginBottom:"12px"}}>🎤</div>
            <h1>Speak English<br/>Perfectly!</h1>
            <p style={{marginTop:"10px"}}>Hear the word → hold the mic → AI judges your pronunciation instantly!</p>
          </div>
          <input className="ll-name-input" placeholder="What is your name?" value={name}
            onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&startApp()} maxLength={24}/>
          <div className="ll-age-grid">
            {[["🐣","5 – 9","5-9"],["🌿","10 – 14","10-14"],["🚀","15 & up","15+"]].map(([icon,label,val])=>(
              <button key={val} className={`ll-age-btn${age===val?" sel":""}`} onClick={()=>setAge(val)}>
                <span className="ll-age-btn-icon">{icon}</span>{label}
              </button>
            ))}
          </div>
          <button className="ll-start-btn" onClick={startApp}>Start Learning! 🚀</button>
        </div>
      </div>
    </div>
  );

  if (!item) return <div className="ll-wrap"><div style={{color:"#a89fd8",marginTop:"40px"}}>Loading…</div></div>;

  return (
    <div className="ll-wrap">
      {badge && <div className="ll-badge">{badge}</div>}
      <div className="ll-card">

        <div className="ll-header">
          <div className="ll-logo">
            <div className="ll-logo-icon">🎤</div>
            <div><div className="ll-logo-title">LingoLeap</div><div className="ll-logo-sub">Hi {name}! 👋</div></div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            {streak>=3&&<div className="ll-streak">🔥 {streak}</div>}
            <div className="ll-stars">⭐ {stars}</div>
          </div>
        </div>

        <div className="ll-progress">
          <div className="ll-prog-top">
            <span>{item.module}</span>
            <span>{idx + 1} of {wordList.length}</span>
          </div>
          <div className="ll-prog-bar"><div className="ll-prog-fill" style={{width:`${progress}%`}}/></div>
        </div>

        <div className="ll-module-pill">Level {item.level} — {item.module}</div>

        <div className="ll-word-card" onClick={hearWord}>
          <div className="ll-hear-hint">🔊 tap to hear</div>
          <span className="ll-word-emoji">{item.emoji}</span>
          <span className="ll-word-big">{item.word}</span>
          <div className="ll-phonetic">{item.phonetic}</div>
          <div className="ll-hint-text">Tap to hear the word spoken</div>
        </div>

        <div className="ll-sentence">"{item.sentence}"</div>

        <div className="ll-tip">
          <span style={{fontSize:"1.1rem",flexShrink:0}}>👄</span>
          <span>{item.hint}</span>
        </div>

        <div className={`ll-waveform-wrap${holding?" active":""}`}>
          {holding
            ? <canvas ref={canvasRef} style={{width:"100%",height:"100%"}}/>
            : <div className="ll-waveform-idle">
                {Array.from({length:24}).map((_,i)=>(
                  <span key={i} style={{animationDelay:`${i*0.075}s`,height:`${6+Math.abs(Math.sin(i*0.6))*18}px`}}/>
                ))}
              </div>
          }
        </div>

        <div className={`ll-status${holding?" listening":aiThinking?" processing":""}`}>{status}</div>

        {heard && !holding && (
          <div className="ll-heard">
            <div className="ll-heard-label">I heard:</div>
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
            onTouchStart={startHold} onTouchEnd={endHold} onTouchCancel={endHold}
            disabled={aiThinking}
          >
            <div className="ll-hold-btn-fill" style={{width:`${holdProgress}%`}}/>
            <span style={{position:"relative",zIndex:1,fontSize:"1.3rem"}}>{holding?"🔴":"🎙️"}</span>
            <span style={{position:"relative",zIndex:1}}>{holding?"Release to Submit":"Hold to Speak"}</span>
          </button>
          <div className={`ll-hold-hint${holding?" active":""}`}>
            {holding?"🔴 Keep holding while you speak, release when done":"Press & hold while speaking — release when finished"}
          </div>
        </div>

        <button className="ll-btn-hear" onClick={hearWord} disabled={aiThinking||holding}>
          🔊 Hear Word + Example Sentence
        </button>

        {result && !aiThinking && (
          <div className="ll-action-row">
            <button className="ll-btn-next" onClick={nextWord}>Next Word ➜</button>
            <button className="ll-btn-again" onClick={resetResult}>Try Again 🔄</button>
          </div>
        )}

        <div ref={bottomRef} style={{height:"8px"}}/>
      </div>
    </div>
  );
}
