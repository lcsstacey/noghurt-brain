import React, { useState, useEffect, useRef, useContext, createContext, useMemo } from 'react';
import { Zap, Skull, Brain, Gamepad2, Crown, Cpu, Globe, Atom, Wifi, RotateCcw, Trophy, Lock, Check, X, AlertTriangle, Radio, Power, Flame, ChevronRight, Hash } from 'lucide-react';

// ════════════════════════════════════════════════════════════════
// STYLES, CONSTANTS, DATA
// ════════════════════════════════════════════════════════════════

const InjectedStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
    .font-pixel { font-family: 'Press Start 2P', ui-monospace, monospace; letter-spacing: 0.04em; }
    .font-crt { font-family: 'VT323', 'Courier New', monospace; letter-spacing: 0.02em; }

    .bg-grid {
      background-image:
        linear-gradient(rgba(255, 46, 136, 0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 240, 255, 0.06) 1px, transparent 1px);
      background-size: 28px 28px;
    }
    .scanlines { position: relative; }
    .scanlines::after {
      content: ''; position: absolute; inset: 0;
      background: repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0px, rgba(0,0,0,0.28) 1px, transparent 1px, transparent 3px);
      pointer-events: none; z-index: 30; mix-blend-mode: multiply;
    }
    .vignette::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%);
      pointer-events: none; z-index: 20;
    }
    .text-glow { text-shadow: 0 0 6px currentColor, 0 0 14px currentColor; }
    .text-glow-soft { text-shadow: 0 0 4px currentColor; }
    .pixel-shadow { box-shadow: 0 0 0 2px #000, 0 0 0 6px currentColor, 0 0 24px currentColor; }

    @keyframes glitchAnim {
      0%,100% { transform: translate(0); text-shadow: 0 0 0 currentColor, 4px 0 0 transparent, -4px 0 0 transparent; }
      20% { transform: translate(-1px, 1px); text-shadow: 3px 0 #ff2e88, -3px 0 #00f0ff; }
      40% { transform: translate(-1px,-1px); text-shadow: -3px 0 #ff2e88, 3px 0 #00f0ff; }
      60% { transform: translate(1px, 1px); text-shadow: 3px 0 #00f0ff, -3px 0 #ff2e88; }
      80% { transform: translate(1px,-1px); text-shadow: -3px 0 #00f0ff, 3px 0 #ff2e88; }
    }
    .glitch { animation: glitchAnim 0.5s infinite; }
    .glitch-slow { animation: glitchAnim 2s infinite; }

    @keyframes shakeAnim {
      0%,100% { transform: translateX(0); }
      10%,30%,50%,70%,90% { transform: translateX(-12px); }
      20%,40%,60%,80% { transform: translateX(12px); }
    }
    .shake { animation: shakeAnim 0.55s; }

    @keyframes neonPulse {
      0%,100% { box-shadow: 0 0 6px currentColor, 0 0 14px currentColor, inset 0 0 6px currentColor; }
      50% { box-shadow: 0 0 16px currentColor, 0 0 30px currentColor, inset 0 0 12px currentColor; }
    }
    .neon-pulse { animation: neonPulse 1.4s ease-in-out infinite; }

    @keyframes blinkAnim { 0%,55% { opacity: 1; } 56%,100% { opacity: 0; } }
    .blink { animation: blinkAnim 1.1s infinite; }

    @keyframes pixelPop {
      0% { transform: scale(0) rotate(-10deg); opacity: 0; }
      55% { transform: scale(1.18) rotate(2deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    .pixel-pop { animation: pixelPop 0.35s ease-out backwards; }

    @keyframes floatUp {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-90px); opacity: 0; }
    }
    .float-up { animation: floatUp 1.2s forwards; }

    @keyframes scanLineMove {
      0% { transform: translateY(-30%); }
      100% { transform: translateY(130%); }
    }
    .scan-line {
      position: absolute; left: 0; right: 0; height: 8px;
      background: linear-gradient(180deg, transparent, rgba(0,240,255,0.35), transparent);
      animation: scanLineMove 5s linear infinite;
      pointer-events: none; z-index: 32;
    }

    @keyframes warningPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .warning-pulse { animation: warningPulse 0.4s infinite; }

    @keyframes mainframeBg {
      0%,100% { background-position: 0% 0%; }
      50% { background-position: 100% 100%; }
    }
    .mainframe-bg {
      background: linear-gradient(45deg, #ff0040, #b829ff, #00f0ff, #ff2e88, #ff0040);
      background-size: 400% 400%;
      animation: mainframeBg 3s ease infinite;
    }

    @keyframes flicker { 0%,100% { opacity:1; } 50% { opacity: 0.85; } 51% { opacity: 1; } }
    .flicker { animation: flicker 4s infinite; }

    @keyframes slideInUp {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .slide-up { animation: slideInUp 0.4s ease-out backwards; }

    @keyframes radarSweep {
      0% { transform: rotate(0); }
      100% { transform: rotate(360deg); }
    }
    .radar-sweep { animation: radarSweep 2s linear infinite; }

    .btn-3d {
      transition: transform 0.06s, box-shadow 0.06s;
      box-shadow: 0 6px 0 0 rgba(0,0,0,0.85), 0 0 0 3px currentColor;
    }
    .btn-3d:active:not(:disabled) {
      transform: translateY(4px);
      box-shadow: 0 2px 0 0 rgba(0,0,0,0.85), 0 0 0 3px currentColor;
    }

    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

    input.retro-input::placeholder { color: rgba(57, 255, 20, 0.4); }
    input.retro-input:focus { outline: none; }
  `}</style>
);

const C = {
  pink: '#ff2e88', cyan: '#00f0ff', green: '#39ff14',
  yellow: '#ffe600', red: '#ff0040', purple: '#b829ff',
  bg: '#05050a', panel: '#0d0d18',
};

const CATEGORIES = [
  { id: 'science',   name: 'HARDCORE SCIENCE', short: 'SCI',   Icon: Atom,     color: C.cyan },
  { id: 'internet',  name: 'INTERNET CULTURE', short: 'NET',   Icon: Wifi,     color: C.pink },
  { id: 'geography', name: 'GEOGRAPHY',        short: 'GEO',   Icon: Globe,    color: C.green },
  { id: 'retro',     name: 'RETRO GAMING',     short: 'RETRO', Icon: Gamepad2, color: C.yellow },
];
const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

const QUESTIONS = [
  // SCIENCE
  { id:'sci1', type:'classic', cat:'science', diff:'normal',
    prompt:'Approximately how far does light travel in 1 second?',
    options:['30,000 km','300,000 km','3,000,000 km','30,000,000 km'], correct:1 },
  { id:'sci2', type:'decryptor', cat:'science', diff:'normal',
    prompt:'The acronym DNA stands for…',
    answer:'DEOXYRIBONUCLEIC ACID' },
  { id:'sci3', type:'sequence', cat:'science', diff:'normal',
    prompt:'Order CLOSEST → FARTHEST from the Sun:',
    items:['Mars','Venus','Earth'], correctOrder:[1,2,0] },
  { id:'sci4', type:'classic', cat:'science', diff:'nightmare',
    prompt:'In what year was the Higgs boson discovered?',
    options:['1995','2008','2012','2018'], correct:2 },
  // INTERNET
  { id:'net1', type:'decryptor', cat:'internet', diff:'normal',
    prompt:'WWW stands for…',
    answer:'WORLD WIDE WEB' },
  { id:'net2', type:'sequence', cat:'internet', diff:'normal',
    prompt:'Order by FOUNDING YEAR (oldest → newest):',
    items:['Instagram','Facebook','Twitter'], correctOrder:[1,2,0] },
  { id:'net3', type:'classic', cat:'internet', diff:'normal',
    prompt:'What does HTTP code "404" mean?',
    options:['Server Error','Page Not Found','Forbidden','Redirect'], correct:1 },
  { id:'net4', type:'classic', cat:'internet', diff:'nightmare',
    prompt:'What was the first registered .com domain?',
    options:['ibm.com','apple.com','symbolics.com','hp.com'], correct:2 },
  // GEOGRAPHY
  { id:'geo1', type:'classic', cat:'geography', diff:'normal',
    prompt:'What is the capital of Australia?',
    options:['Sydney','Melbourne','Canberra','Perth'], correct:2 },
  { id:'geo2', type:'sequence', cat:'geography', diff:'normal',
    prompt:'Order by POPULATION (smallest → largest):',
    items:['Tokyo','Madrid','Mexico City'], correctOrder:[1,2,0] },
  { id:'geo3', type:'decryptor', cat:'geography', diff:'nightmare',
    prompt:'Country containing the MOST pyramids in the world:',
    answer:'SUDAN' },
  { id:'geo4', type:'classic', cat:'geography', diff:'normal',
    prompt:'Which is the LONGEST river in the world?',
    options:['Amazon','Nile','Yangtze','Mississippi'], correct:1 },
  // RETRO
  { id:'ret1', type:'classic', cat:'retro', diff:'normal',
    prompt:'In Pac-Man, what color is the ghost CLYDE?',
    options:['Red','Pink','Cyan','Orange'], correct:3 },
  { id:'ret2', type:'decryptor', cat:'retro', diff:'normal',
    prompt:"Mario's plumber brother is named…",
    answer:'LUIGI' },
  { id:'ret3', type:'sequence', cat:'retro', diff:'normal',
    prompt:'Order consoles by RELEASE YEAR (oldest first):',
    items:['Sega Genesis','NES','PlayStation'], correctOrder:[1,0,2] },
  { id:'ret4', type:'classic', cat:'retro', diff:'nightmare',
    prompt:'First commercially successful video game?',
    options:['Pong','Spacewar!','Tennis for Two','Computer Space'], correct:0 },
];

const MAINFRAME_POOL = [
  { id:'mf1', type:'classic', cat:'science', diff:'nightmare', isMainframe:true,
    prompt:'Which particle was the LAST to be experimentally confirmed?',
    options:['Electron','Proton','Neutrino','Higgs Boson'], correct:3 },
  { id:'mf2', type:'classic', cat:'internet', diff:'nightmare', isMainframe:true,
    prompt:'Which site was the FIRST to be streamed on Twitch (June 2011)?',
    options:['Justin.tv','YouTube','Twitch.tv','Stickam'], correct:0 },
];

const PLAYERS_INIT = [
  { id:'p1', name:'YOU',      color:C.pink,   Icon:Brain,   isAI:false, skill:1.0 },
  { id:'p2', name:'PIXELRAT', color:C.cyan,   Icon:Skull,   isAI:true,  skill:0.78 },
  { id:'p3', name:'C1PHER',   color:C.green,  Icon:Cpu,     isAI:true,  skill:0.66 },
  { id:'p4', name:'N0VA',     color:C.yellow, Icon:Zap,     isAI:true,  skill:0.58 },
];

// ════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════

const norm = s => (s ?? '').toString().toUpperCase().replace(/[^A-Z0-9]/g,'');

function checkAnswer(q, a) {
  if (a == null) return false;
  if (q.type === 'classic')   return a === q.correct;
  if (q.type === 'decryptor') return norm(a) === norm(q.answer);
  if (q.type === 'sequence')  return Array.isArray(a) && a.length === q.correctOrder.length && a.every((v,i)=>v===q.correctOrder[i]);
  return false;
}

function calcScore(timeRemaining, totalTime, streak) {
  const base = 500;
  const speed = Math.floor(Math.max(0, timeRemaining) * 50);
  const mult = 1 + streak * 0.2;
  return Math.floor((base + speed) * mult);
}

function generateAIAnswer(q, isCorrect) {
  if (q.type === 'classic') {
    if (isCorrect) return q.correct;
    const wrongs = q.options.map((_,i)=>i).filter(i=>i!==q.correct);
    return wrongs[Math.floor(Math.random()*wrongs.length)];
  }
  if (q.type === 'decryptor') return isCorrect ? q.answer : 'XXXX';
  if (q.type === 'sequence') {
    if (isCorrect) return [...q.correctOrder];
    const wrong = [...q.correctOrder]; [wrong[0],wrong[1]] = [wrong[1],wrong[0]];
    return wrong;
  }
}

function pickQuestions(settings) {
  const pool = QUESTIONS.filter(q => settings.categories.includes(q.cat) &&
    (settings.difficulty === 'nightmare' ? true : q.diff !== 'nightmare' || Math.random() < 0.3));
  const usable = pool.length >= settings.rounds - 1 ? pool : QUESTIONS.filter(q => settings.categories.includes(q.cat));
  const shuffled = [...usable].sort(()=>Math.random()-0.5);
  // diversify question types in the lineup
  const byType = { classic: [], decryptor: [], sequence: [] };
  shuffled.forEach(q => byType[q.type].push(q));
  const lineup = [];
  const wantedRounds = settings.rounds - 1;
  let i = 0;
  while (lineup.length < wantedRounds) {
    const types = ['classic','decryptor','sequence'];
    const t = types[i % 3];
    if (byType[t].length) lineup.push(byType[t].shift());
    else {
      const any = ['classic','decryptor','sequence'].find(k => byType[k].length);
      if (!any) break;
      lineup.push(byType[any].shift());
    }
    i++;
  }
  const mf = MAINFRAME_POOL[Math.floor(Math.random()*MAINFRAME_POOL.length)];
  return [...lineup, mf];
}

function fakeQRCells(seed) {
  let s = 0; for (const ch of seed) s = (s*31 + ch.charCodeAt(0)) >>> 0;
  const out = [];
  for (let i = 0; i < 121; i++) {
    s = (s * 1103515245 + 12345 + i*73) >>> 0;
    out.push((s & 1) === 1);
  }
  // force corner finder squares (top-left, top-right, bottom-left)
  const finders = [[0,0],[0,8],[8,0]];
  finders.forEach(([r,c]) => {
    for (let dr=0; dr<3; dr++) for (let dc=0; dc<3; dc++) {
      const idx = (r+dr)*11 + (c+dc);
      if (idx < 121) out[idx] = true;
    }
  });
  return out;
}

// ════════════════════════════════════════════════════════════════
// GAME CONTEXT (mocked real-time multiplayer state)
// ════════════════════════════════════════════════════════════════

const GameContext = createContext(null);
const useGame = () => useContext(GameContext);

function GameProvider({ children }) {
  const [phase, setPhase] = useState('lobby');
  // phases: lobby | intro | question | reveal | mainframe_intro | wager | final_question | final_reveal | game_over

  const [players, setPlayers] = useState(() =>
    PLAYERS_INIT.map(p => ({ ...p, score: 0, streak: 0, locked: false, answer: null,
      lockedAt: null, lastResult: null, lastPoints: 0, wager: null }))
  );
  const [settings, setSettings] = useState({
    categories: ['science','internet','geography','retro'],
    difficulty: 'normal',
    rounds: 5,
  });
  const [round, setRound] = useState(0);
  const [questionList, setQuestionList] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(15);
  const [roomCode] = useState(() => Math.random().toString(36).slice(2, 6).toUpperCase());
  const [shake, setShake] = useState(false);

  const currentQuestion = questionList[round] || null;

  const timeLeftRef = useRef(timeLeft);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  // ─── Phase: question setup ──────────────────────────────────
  useEffect(() => {
    if ((phase !== 'question' && phase !== 'final_question') || !currentQuestion) return;

    const time = phase === 'final_question'
      ? 18
      : settings.difficulty === 'nightmare' ? 12 : 15;
    setTotalTime(time); setTimeLeft(time);

    setPlayers(prev => prev.map(p => ({
      ...p, locked: false, answer: null, lockedAt: null, lastResult: null, lastPoints: 0,
    })));

    const skillMod = (phase === 'final_question' ? 0.65 : 1) * (settings.difficulty === 'nightmare' ? 0.78 : 1);
    const aiTimers = PLAYERS_INIT.filter(p => p.isAI).map(p => {
      const lockTime = 2 + Math.random() * (time - 4);
      const remaining = Math.max(0, time - lockTime);
      const isCorrect = Math.random() < (p.skill * skillMod);
      const answer = generateAIAnswer(currentQuestion, isCorrect);
      return setTimeout(() => {
        setPlayers(prev => prev.map(pl =>
          pl.id === p.id && !pl.locked ? { ...pl, locked: true, answer, lockedAt: remaining } : pl
        ));
      }, lockTime * 1000);
    });

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const rem = time - elapsed;
      if (rem <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        setPhase(phase === 'question' ? 'reveal' : 'final_reveal');
      } else setTimeLeft(rem);
    }, 80);

    return () => { clearInterval(interval); aiTimers.forEach(t => clearTimeout(t)); };
  }, [phase, currentQuestion?.id, settings.difficulty]);

  // ─── End early when everyone locked ─────────────────────────
  useEffect(() => {
    if ((phase === 'question' || phase === 'final_question') && players.every(p => p.locked)) {
      const t = setTimeout(() => setPhase(phase === 'question' ? 'reveal' : 'final_reveal'), 700);
      return () => clearTimeout(t);
    }
  }, [phase, players]);

  // ─── Phase: reveal — score the round, then advance ──────────
  useEffect(() => {
    if (phase !== 'reveal' || !currentQuestion) return;
    setPlayers(prev => prev.map(p => {
      if (!p.locked) return { ...p, streak: 0, lastResult: 'timeout', lastPoints: 0 };
      const ok = checkAnswer(currentQuestion, p.answer);
      if (ok) {
        const pts = calcScore(p.lockedAt || 0, totalTime, p.streak);
        return { ...p, streak: p.streak + 1, score: p.score + pts, lastResult: 'correct', lastPoints: pts };
      }
      return { ...p, streak: 0, lastResult: 'wrong', lastPoints: 0 };
    }));
    setShake(true);
    const ks = setTimeout(() => setShake(false), 600);
    const t = setTimeout(() => {
      if (round + 1 < questionList.length) { setRound(r => r + 1); setPhase('intro'); }
      else setPhase('game_over');
    }, 5500);
    return () => { clearTimeout(t); clearTimeout(ks); };
  }, [phase]);

  // ─── Phase: intro → question / mainframe_intro ──────────────
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => {
      setPhase(currentQuestion?.isMainframe ? 'mainframe_intro' : 'question');
    }, 1400);
    return () => clearTimeout(t);
  }, [phase, currentQuestion]);

  // ─── Phase: mainframe_intro → wager ─────────────────────────
  useEffect(() => {
    if (phase !== 'mainframe_intro') return;
    const t = setTimeout(() => setPhase('wager'), 3200);
    return () => clearTimeout(t);
  }, [phase]);

  // ─── Phase: wager (set wagers) ──────────────────────────────
  useEffect(() => {
    if (phase !== 'wager') return;
    const time = 12; setTotalTime(time); setTimeLeft(time);

    setPlayers(prev => prev.map(p => ({
      ...p, wager: null, locked: false, answer: null, lockedAt: null, lastResult: null, lastPoints: 0,
    })));

    const aiTimers = PLAYERS_INIT.filter(p => p.isAI).map(p => {
      const t = 2 + Math.random() * (time - 4);
      return setTimeout(() => {
        setPlayers(prev => prev.map(pl => {
          if (pl.id !== p.id) return pl;
          const aggression = 0.35 + Math.random() * 0.55;
          const w = Math.max(100, Math.min(pl.score || 100, Math.floor((pl.score || 1000) * aggression)));
          return { ...pl, wager: pl.score === 0 ? 100 : w };
        }));
      }, t * 1000);
    });

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const rem = time - elapsed;
      if (rem <= 0) {
        clearInterval(interval); setTimeLeft(0);
        setPlayers(prev => prev.map(p => p.wager == null ? { ...p, wager: Math.max(100, Math.floor((p.score || 100) * 0.25)) } : p));
        setTimeout(() => setPhase('final_question'), 600);
      } else setTimeLeft(rem);
    }, 80);

    return () => { clearInterval(interval); aiTimers.forEach(t => clearTimeout(t)); };
  }, [phase]);

  // ─── Wager → final_question (early when all wagered) ────────
  useEffect(() => {
    if (phase === 'wager' && players.every(p => p.wager != null)) {
      const t = setTimeout(() => setPhase('final_question'), 700);
      return () => clearTimeout(t);
    }
  }, [phase, players]);

  // ─── Phase: final_reveal — apply wagers ─────────────────────
  useEffect(() => {
    if (phase !== 'final_reveal' || !currentQuestion) return;
    setPlayers(prev => prev.map(p => {
      const w = p.wager || 0;
      if (!p.locked) return { ...p, streak: 0, lastResult: 'timeout', lastPoints: -w, score: Math.max(0, p.score - w) };
      const ok = checkAnswer(currentQuestion, p.answer);
      if (ok) return { ...p, streak: p.streak + 1, score: p.score + w, lastResult: 'correct', lastPoints: w };
      return { ...p, streak: 0, lastResult: 'wrong', lastPoints: -w, score: Math.max(0, p.score - w) };
    }));
    setShake(true);
    const ks = setTimeout(() => setShake(false), 600);
    const t = setTimeout(() => setPhase('game_over'), 6500);
    return () => { clearTimeout(t); clearTimeout(ks); };
  }, [phase]);

  // ─── Actions ────────────────────────────────────────────────
  const startGame = () => {
    if (settings.categories.length === 0) return;
    const lineup = pickQuestions(settings);
    setQuestionList(lineup);
    setRound(0);
    setPlayers(PLAYERS_INIT.map(p => ({ ...p, score: 0, streak: 0, locked: false, answer: null,
      lockedAt: null, lastResult: null, lastPoints: 0, wager: null })));
    setPhase('intro');
  };
  const lockIn = (playerId, answer) => {
    setPlayers(prev => prev.map(p =>
      p.id === playerId && !p.locked ? { ...p, locked: true, answer, lockedAt: timeLeftRef.current } : p
    ));
  };
  const setWager = (playerId, wager) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, wager } : p));
  };
  const updateSettings = patch => setSettings(s => ({ ...s, ...patch }));
  const playAgain = () => {
    setPhase('lobby'); setRound(0); setQuestionList([]);
    setPlayers(PLAYERS_INIT.map(p => ({ ...p, score: 0, streak: 0, locked: false, answer: null,
      lockedAt: null, lastResult: null, lastPoints: 0, wager: null })));
  };

  const value = {
    phase, players, settings, round, currentQuestion, timeLeft, totalTime, questionList,
    roomCode, shake, youId: 'p1',
    startGame, lockIn, setWager, updateSettings, playAgain,
  };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ════════════════════════════════════════════════════════════════
// SHARED PIECES
// ════════════════════════════════════════════════════════════════

function PlayerAvatar({ player, size=64, showName=true, locked=false, glow=true, dim=false }) {
  const Icon = player.Icon;
  return (
    <div className="flex flex-col items-center gap-1.5 transition-all">
      <div
        className={`relative grid place-items-center rounded transition-all ${dim ? 'opacity-30 grayscale' : ''}`}
        style={{
          width: size, height: size, color: player.color,
          background: '#000',
          boxShadow: glow ? `0 0 0 3px ${player.color}, 0 0 18px ${player.color}` : `0 0 0 3px ${player.color}`,
        }}
      >
        <Icon size={size * 0.5} strokeWidth={2.5} style={{ color: player.color, filter: `drop-shadow(0 0 4px ${player.color})` }} />
        {locked && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 rounded">
            <Lock size={size*0.45} style={{ color: player.color, filter: `drop-shadow(0 0 6px ${player.color})` }} />
          </div>
        )}
      </div>
      {showName && (
        <div className="font-pixel text-[9px] text-glow-soft" style={{ color: player.color }}>
          {player.name}
        </div>
      )}
    </div>
  );
}

function TimerBar({ time, total, ominous=false }) {
  const pct = Math.max(0, Math.min(1, time/total));
  const color = pct > 0.5 ? C.green : pct > 0.25 ? C.yellow : C.red;
  return (
    <div className="relative w-full h-3 bg-black border-2 border-zinc-700 overflow-hidden">
      <div className="h-full transition-[width] duration-75 relative"
        style={{ width: `${pct*100}%`, background: color, boxShadow: `0 0 12px ${color}` }}>
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4) 4px, transparent 4px, transparent 8px)' }} />
      </div>
      {ominous && pct < 0.25 && <div className="absolute inset-0 bg-red-500/20 animate-pulse" />}
    </div>
  );
}

function HostFrame({ children, className='' }) {
  const { shake } = useGame();
  return (
    <div className={`relative bg-black border-4 border-zinc-800 rounded-lg overflow-hidden scanlines vignette ${shake ? 'shake' : ''} ${className}`}
      style={{ boxShadow: '0 0 0 2px #000, 0 0 40px rgba(0,240,255,0.18), inset 0 0 60px rgba(0,0,0,0.8)', minHeight: 560 }}>
      <div className="scan-line" />
      <div className="bg-grid absolute inset-0 opacity-50" />
      <div className="relative z-10 p-5 sm:p-7 h-full">{children}</div>
    </div>
  );
}

function PhoneFrame({ children }) {
  return (
    <div className="mx-auto w-[280px] shrink-0">
      <div className="rounded-[2.2rem] p-2.5 bg-zinc-900 border-[3px] border-zinc-700"
        style={{ boxShadow: '0 0 0 1px #000, 10px 14px 0 rgba(0,0,0,0.5), 0 0 30px rgba(255,46,136,0.15)' }}>
        <div className="flex justify-center mb-1">
          <div className="h-1.5 w-16 bg-zinc-800 rounded-full" />
        </div>
        <div className="bg-black rounded-2xl overflow-hidden relative" style={{ aspectRatio: '9/19', height: 520 }}>
          <div className="scanlines absolute inset-0 z-30 pointer-events-none" />
          <div className="relative z-10 h-full overflow-y-auto no-scrollbar">{children}</div>
        </div>
        <div className="flex justify-center mt-2">
          <div className="h-1 w-20 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HOST VIEW
// ════════════════════════════════════════════════════════════════

function HostView() {
  const { phase } = useGame();
  return (
    <HostFrame>
      {phase === 'lobby'             && <LobbyHost />}
      {phase === 'intro'             && <IntroHost />}
      {phase === 'question'          && <QuestionHost />}
      {phase === 'reveal'            && <RevealHost />}
      {phase === 'mainframe_intro'   && <MainframeIntroHost />}
      {phase === 'wager'             && <WagerHost />}
      {phase === 'final_question'    && <QuestionHost final />}
      {phase === 'final_reveal'      && <RevealHost final />}
      {phase === 'game_over'         && <GameOverHost />}
    </HostFrame>
  );
}

function LobbyHost() {
  const { players, settings, updateSettings, startGame, roomCode } = useGame();
  const cells = useMemo(() => fakeQRCells(roomCode), [roomCode]);

  const toggleCat = id => updateSettings({
    categories: settings.categories.includes(id)
      ? settings.categories.filter(c => c !== id)
      : [...settings.categories, id]
  });

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="font-pixel text-[10px] text-zinc-500 mb-1 flex items-center gap-2">
            <Radio size={10} className="animate-pulse" style={{ color: C.green }} />
            <span>SYS:// BROADCAST READY</span>
            <span className="blink" style={{ color: C.green }}>▓</span>
          </div>
          <h1 className="font-pixel text-3xl sm:text-5xl glitch-slow leading-tight" style={{ color: C.pink }}>
            NOGHURT<br/><span style={{ color: C.cyan }}>BRAIN</span>
          </h1>
          <div className="font-crt text-xl mt-1" style={{ color: C.green }}>v0.42.7 // PARTY TRIVIA NETWORK</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="grid grid-cols-11 gap-0 p-2 bg-white" style={{ width: 110, height: 110 }}>
            {cells.map((on, i) => <div key={i} style={{ background: on ? '#000' : '#fff' }} />)}
          </div>
          <div className="font-pixel text-xs">
            <div className="text-zinc-400">JOIN AT:</div>
            <div className="text-white text-glow-soft" style={{ color: C.cyan }}>noghurt.xyz/play</div>
            <div className="text-zinc-400 mt-3">ROOM CODE:</div>
            <div className="text-2xl font-pixel text-glow" style={{ color: C.yellow }}>{roomCode}</div>
          </div>
        </div>
      </div>

      <div>
        <div className="font-pixel text-xs text-zinc-400 mb-3 flex items-center gap-2">
          <span style={{ color: C.green }}>▸</span>
          PLAYERS CONNECTED <span style={{ color: C.green }}>[{players.length}/8]</span>
        </div>
        <div className="flex flex-wrap gap-5">
          {players.map((p, i) => (
            <div key={p.id} className="pixel-pop" style={{ animationDelay: `${i*0.08}s` }}>
              <PlayerAvatar player={p} size={68} />
            </div>
          ))}
          {Array.from({ length: 8 - players.length }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 opacity-30">
              <div className="w-[68px] h-[68px] border-2 border-dashed border-zinc-700 grid place-items-center font-pixel text-zinc-600">?</div>
              <div className="font-pixel text-[9px] text-zinc-600">EMPTY</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
        <div>
          <div className="font-pixel text-xs text-zinc-400 mb-3 flex items-center gap-2">
            <span style={{ color: C.pink }}>▸</span>
            CATEGORIES <span style={{ color: C.pink }}>[{settings.categories.length}/4]</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {CATEGORIES.map(cat => {
              const active = settings.categories.includes(cat.id);
              return (
                <button key={cat.id} onClick={() => toggleCat(cat.id)}
                  className="font-pixel text-[10px] p-3 transition-all flex items-center gap-2 border-2 text-left"
                  style={{
                    borderColor: active ? cat.color : '#27272a',
                    background: active ? `${cat.color}1a` : 'transparent',
                    color: active ? cat.color : '#52525b',
                    boxShadow: active ? `0 0 14px ${cat.color}66, inset 0 0 14px ${cat.color}33` : 'none',
                  }}>
                  <cat.Icon size={18} />
                  <span className="leading-tight">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="font-pixel text-xs text-zinc-400 mb-3 flex items-center gap-2">
              <span style={{ color: C.yellow }}>▸</span>DIFFICULTY
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id:'normal',    label:'NORMAL',    color:C.green, sub:'Standard timing' },
                { id:'nightmare', label:'NIGHTMARE', color:C.red,   sub:'Faster · Harder' },
              ].map(d => {
                const on = settings.difficulty === d.id;
                return (
                  <button key={d.id} onClick={() => updateSettings({ difficulty: d.id })}
                    className="font-pixel text-[10px] p-3 transition-all border-2 text-left"
                    style={{
                      borderColor: on ? d.color : '#27272a',
                      background: on ? `${d.color}1a` : 'transparent',
                      color: on ? d.color : '#52525b',
                      boxShadow: on ? `0 0 14px ${d.color}66, inset 0 0 10px ${d.color}33` : 'none',
                    }}>
                    <div>{d.label}</div>
                    <div className="font-crt text-sm opacity-70 mt-0.5">{d.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="font-pixel text-xs text-zinc-400 mb-3 flex items-center gap-2">
              <span style={{ color: C.cyan }}>▸</span>ROUNDS
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateSettings({ rounds: Math.max(3, settings.rounds - 1) })}
                className="font-pixel text-lg w-10 h-10 border-2 border-zinc-600 hover:border-cyan-400 text-zinc-300">−</button>
              <div className="font-pixel text-3xl flex-1 text-center text-glow" style={{ color: C.cyan }}>
                {settings.rounds}
              </div>
              <button onClick={() => updateSettings({ rounds: Math.min(8, settings.rounds + 1) })}
                className="font-pixel text-lg w-10 h-10 border-2 border-zinc-600 hover:border-cyan-400 text-zinc-300">+</button>
            </div>
            <div className="font-crt text-base mt-1.5 text-zinc-500">
              {settings.rounds - 1} normal + 1 MAINFRAME
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-2">
        <button onClick={startGame} disabled={settings.categories.length === 0}
          className="btn-3d font-pixel text-base sm:text-xl w-full py-5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            color: C.green,
            background: '#0a0a0a',
            border: 'none',
          }}>
          <span className="flex items-center justify-center gap-3">
            <Power size={22} className="warning-pulse" />
            INITIATE BROADCAST
            <ChevronRight size={22} />
          </span>
        </button>
      </div>
    </div>
  );
}

function IntroHost() {
  const { round, questionList, currentQuestion } = useGame();
  if (!currentQuestion) return null;
  const cat = CAT_BY_ID[currentQuestion.cat];
  return (
    <div className="h-full grid place-items-center text-center">
      <div className="space-y-4 pixel-pop">
        <div className="font-pixel text-sm text-zinc-500">▶ INCOMING ROUND</div>
        <div className="font-pixel text-7xl text-glow" style={{ color: C.cyan }}>
          {(round + 1).toString().padStart(2,'0')}
          <span className="text-zinc-700 mx-2">/</span>
          <span className="text-zinc-500">{questionList.length.toString().padStart(2,'0')}</span>
        </div>
        <div className="flex items-center justify-center gap-3 mt-3">
          <cat.Icon size={28} style={{ color: cat.color }} />
          <div className="font-pixel text-base" style={{ color: cat.color }}>{cat.name}</div>
        </div>
      </div>
    </div>
  );
}

function QuestionHost({ final=false }) {
  const { currentQuestion, players, timeLeft, totalTime, round, questionList } = useGame();
  if (!currentQuestion) return null;
  const cat = CAT_BY_ID[currentQuestion.cat];
  const lockedCount = players.filter(p => p.locked).length;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <cat.Icon size={20} style={{ color: cat.color }} />
          <div className="font-pixel text-xs" style={{ color: cat.color }}>{cat.name}</div>
          {final && <div className="font-pixel text-xs px-2 py-1 mainframe-bg text-black">★ MAINFRAME ★</div>}
        </div>
        <div className="font-pixel text-xs text-zinc-400">
          ROUND <span style={{ color: C.cyan }}>{round + 1}</span>
          <span className="text-zinc-700 mx-1">/</span>
          {questionList.length}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="font-pixel text-3xl tabular-nums" style={{ color: timeLeft < totalTime*0.25 ? C.red : timeLeft < totalTime*0.5 ? C.yellow : C.green }}>
          {Math.ceil(timeLeft).toString().padStart(2,'0')}
        </div>
        <div className="flex-1"><TimerBar time={timeLeft} total={totalTime} ominous /></div>
      </div>

      <div className="flex-1 grid place-items-center py-2">
        <div className="font-pixel text-lg sm:text-2xl leading-relaxed text-center max-w-3xl text-white text-glow-soft">
          {currentQuestion.prompt}
        </div>
      </div>

      <div>
        {currentQuestion.type === 'classic'   && <ClassicHostBody q={currentQuestion} />}
        {currentQuestion.type === 'decryptor' && <DecryptorHostBody q={currentQuestion} timeLeft={timeLeft} totalTime={totalTime} />}
        {currentQuestion.type === 'sequence'  && <SequenceHostBody q={currentQuestion} />}
      </div>

      <div className="mt-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-3">
          {players.map(p => <PlayerAvatar key={p.id} player={p} size={48} locked={p.locked} dim={!p.locked} showName={false} />)}
        </div>
        <div className="font-pixel text-xs" style={{ color: C.green }}>
          LOCKED IN: {lockedCount}/{players.length}
        </div>
      </div>
    </div>
  );
}

function ClassicHostBody({ q }) {
  const tags = ['A','B','C','D'];
  const colors = [C.pink, C.cyan, C.green, C.yellow];
  return (
    <div className="grid grid-cols-2 gap-3">
      {q.options.map((opt, i) => (
        <div key={i} className="font-pixel text-xs sm:text-sm p-3 border-2 flex items-center gap-3"
          style={{ borderColor: colors[i] + '88', color: colors[i], background: '#000' }}>
          <div className="w-7 h-7 grid place-items-center font-pixel text-base"
            style={{ background: colors[i], color: '#000' }}>{tags[i]}</div>
          <span className="text-white text-glow-soft">{opt}</span>
        </div>
      ))}
    </div>
  );
}

function DecryptorHostBody({ q, timeLeft, totalTime }) {
  const revealOrder = useMemo(() => {
    const idxs = q.answer.split('').map((c,i)=>({c,i})).filter(x=>x.c!==' ').map(x=>x.i);
    let s = 0; for (const ch of q.id) s = (s*31 + ch.charCodeAt(0)) >>> 0;
    return idxs.sort((a,b)=>{ s = (s*1103515245+12345)>>>0; return (s%2)?1:-1; });
  }, [q.id]);
  const elapsed = totalTime - timeLeft;
  const ratio = elapsed / totalTime;
  const revealCount = Math.floor(ratio * revealOrder.length * 0.5);
  const revealedSet = new Set(revealOrder.slice(0, revealCount));

  return (
    <div className="space-y-3">
      <div className="font-pixel text-[9px] text-zinc-500 text-center">▸ DECRYPTING SIGNAL…</div>
      <div className="flex flex-wrap gap-3 justify-center">
        {q.answer.split(' ').map((word, wi) => (
          <div key={wi} className="flex gap-1">
            {word.split('').map((ch, i) => {
              const globalIdx = q.answer.split(' ').slice(0, wi).reduce((a,w)=>a+w.length+1,0) + i;
              const revealed = revealedSet.has(globalIdx);
              return (
                <div key={i}
                  className="w-7 h-10 sm:w-8 sm:h-11 grid place-items-center font-pixel text-sm sm:text-base border-2 transition-all"
                  style={{
                    borderColor: revealed ? C.green : '#3f3f46',
                    color: revealed ? C.green : '#52525b',
                    background: revealed ? '#0a1f0a' : '#0a0a0a',
                    boxShadow: revealed ? `0 0 8px ${C.green}66` : 'none',
                  }}>
                  {revealed ? ch : '█'}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function SequenceHostBody({ q }) {
  const colors = [C.pink, C.cyan, C.yellow];
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {q.items.map((item, i) => (
        <div key={i} className="font-pixel text-sm px-4 py-3 border-2 flex items-center gap-2"
          style={{ borderColor: colors[i % 3] + 'cc', color: colors[i % 3], background: '#000' }}>
          <Hash size={16} />
          <span className="text-white text-glow-soft">{item}</span>
        </div>
      ))}
    </div>
  );
}

function RevealHost({ final=false }) {
  const { currentQuestion, players } = useGame();
  if (!currentQuestion) return null;
  const cat = CAT_BY_ID[currentQuestion.cat];

  let correctText = '';
  if (currentQuestion.type === 'classic')   correctText = currentQuestion.options[currentQuestion.correct];
  if (currentQuestion.type === 'decryptor') correctText = currentQuestion.answer;
  if (currentQuestion.type === 'sequence')  correctText = currentQuestion.correctOrder.map(i => currentQuestion.items[i]).join(' → ');

  const sorted = [...players].sort((a,b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-3">
        <cat.Icon size={20} style={{ color: cat.color }} />
        <div className="font-pixel text-xs" style={{ color: cat.color }}>{cat.name}</div>
        {final && <div className="font-pixel text-xs px-2 py-1 mainframe-bg text-black">★ MAINFRAME ★</div>}
      </div>

      <div className="font-pixel text-base sm:text-lg leading-relaxed text-zinc-300 text-center">
        {currentQuestion.prompt}
      </div>

      <div className="text-center pixel-pop space-y-2">
        <div className="font-pixel text-[10px]" style={{ color: C.green }}>▸ ANSWER UNLOCKED</div>
        <div className="font-pixel text-2xl sm:text-4xl text-glow inline-block px-4 py-3"
          style={{ color: C.green, background: 'rgba(57,255,20,0.08)', border: `3px solid ${C.green}` }}>
          {correctText}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 justify-center">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 slide-up" style={{ animationDelay: `${i*0.1}s` }}>
            <div className="font-pixel text-2xl w-8 text-zinc-500 text-center">{i + 1}</div>
            <PlayerAvatar player={p} size={42} showName={false}
              glow={p.lastResult === 'correct'}
              dim={p.lastResult === 'wrong' || p.lastResult === 'timeout'} />
            <div className="font-pixel text-xs flex-1" style={{ color: p.color }}>{p.name}</div>

            <div className="font-pixel text-xs"
              style={{ color: p.lastResult === 'correct' ? C.green : p.lastResult === 'wrong' ? C.red : '#52525b' }}>
              {p.lastResult === 'correct' && <span className="flex items-center gap-1"><Check size={14}/>+{p.lastPoints}{final && p.wager?` (×${p.wager})`:''}</span>}
              {p.lastResult === 'wrong'   && <span className="flex items-center gap-1"><X size={14}/>{final ? p.lastPoints : '0'}</span>}
              {p.lastResult === 'timeout' && <span className="flex items-center gap-1"><AlertTriangle size={14}/>—</span>}
            </div>
            <div className="font-pixel text-base tabular-nums w-20 text-right text-glow-soft" style={{ color: p.color }}>
              {p.score.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MainframeIntroHost() {
  return (
    <div className="h-full grid place-items-center text-center">
      <div className="space-y-4 pixel-pop">
        <div className="font-pixel text-sm" style={{ color: C.red }}>⚠ INCOMING TRANSMISSION ⚠</div>
        <div className="relative">
          <div className="font-pixel text-5xl sm:text-7xl glitch text-glow tracking-wider" style={{ color: C.pink }}>
            THE
          </div>
          <div className="font-pixel text-6xl sm:text-8xl mt-3 mainframe-bg p-4 inline-block text-black tracking-wider">
            MAINFRAME
          </div>
        </div>
        <div className="font-crt text-2xl mt-4" style={{ color: C.yellow }}>
          ▸ WAGER YOUR POINTS · WIN BIG · LOSE EVERYTHING ▸
        </div>
      </div>
    </div>
  );
}

function WagerHost() {
  const { currentQuestion, players, timeLeft, totalTime } = useGame();
  if (!currentQuestion) return null;
  const cat = CAT_BY_ID[currentQuestion.cat];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-2">
        <div className="font-pixel text-xs px-3 py-1 mainframe-bg text-black">★ MAINFRAME ★</div>
      </div>

      <div className="flex items-center gap-3">
        <div className="font-pixel text-2xl tabular-nums" style={{ color: timeLeft < 4 ? C.red : C.yellow }}>
          {Math.ceil(timeLeft).toString().padStart(2,'0')}
        </div>
        <div className="flex-1"><TimerBar time={timeLeft} total={totalTime} ominous /></div>
      </div>

      <div className="flex-1 grid place-items-center text-center">
        <div className="space-y-4">
          <div className="font-pixel text-xs text-zinc-400">▸ CATEGORY DETECTED</div>
          <div className="flex items-center justify-center gap-4 px-6 py-4 border-4"
            style={{ borderColor: cat.color, background: `${cat.color}11`, boxShadow: `0 0 30px ${cat.color}55` }}>
            <cat.Icon size={48} style={{ color: cat.color, filter: `drop-shadow(0 0 10px ${cat.color})` }} />
            <div className="font-pixel text-xl sm:text-3xl" style={{ color: cat.color }}>{cat.name}</div>
          </div>
          <div className="font-crt text-2xl text-zinc-300">PLACE YOUR WAGERS — QUESTION INCOMING</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {players.map(p => (
          <div key={p.id} className="border-2 p-3"
            style={{ borderColor: p.color, background: '#000', boxShadow: p.wager != null ? `0 0 16px ${p.color}77` : 'none' }}>
            <div className="flex items-center gap-2 mb-1">
              <PlayerAvatar player={p} size={28} showName={false} glow={false} />
              <div className="font-pixel text-[10px]" style={{ color: p.color }}>{p.name}</div>
            </div>
            <div className="font-pixel text-[9px] text-zinc-500">SCORE: {p.score}</div>
            <div className="font-pixel text-base mt-1" style={{ color: p.wager != null ? C.yellow : '#52525b' }}>
              {p.wager != null ? <>WAGER: <span className="text-glow">{p.wager}</span></> : '— LOCKED —'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameOverHost() {
  const { players, playAgain } = useGame();
  const sorted = [...players].sort((a,b) => b.score - a.score);
  const winner = sorted[0];
  const max = Math.max(1, ...sorted.map(p => p.score));

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="text-center space-y-2">
        <div className="font-pixel text-xs text-zinc-500">▸ TRANSMISSION COMPLETE</div>
        <div className="font-pixel text-3xl sm:text-5xl text-glow" style={{ color: C.yellow }}>GAME OVER</div>
      </div>

      <div className="text-center space-y-3 pixel-pop">
        <Trophy size={56} className="mx-auto warning-pulse" style={{ color: winner.color }} />
        <div className="font-pixel text-xs text-zinc-400">CHAMPION</div>
        <div className="flex items-center justify-center gap-3">
          <PlayerAvatar player={winner} size={64} showName={false} />
          <div className="font-pixel text-2xl sm:text-4xl text-glow" style={{ color: winner.color }}>{winner.name}</div>
        </div>
        <div className="font-pixel text-2xl text-glow-soft" style={{ color: C.green }}>{winner.score.toLocaleString()} PTS</div>
      </div>

      <div className="flex-1 space-y-2.5">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 slide-up" style={{ animationDelay: `${i*0.12}s` }}>
            <div className="font-pixel text-2xl w-8 text-zinc-500 text-center">{i+1}</div>
            <PlayerAvatar player={p} size={36} showName={false} />
            <div className="font-pixel text-xs w-24" style={{ color: p.color }}>{p.name}</div>
            <div className="flex-1 h-5 bg-black border-2 border-zinc-800 relative overflow-hidden">
              <div className="h-full transition-all" style={{
                width: `${(p.score/max)*100}%`,
                background: p.color,
                boxShadow: `0 0 8px ${p.color}`,
              }} />
            </div>
            <div className="font-pixel text-sm tabular-nums w-20 text-right" style={{ color: p.color }}>{p.score.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <button onClick={playAgain}
        className="btn-3d font-pixel text-base w-full py-4"
        style={{ color: C.cyan, background: '#0a0a0a' }}>
        <span className="flex items-center justify-center gap-3"><RotateCcw size={18}/> RUN IT BACK</span>
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PLAYER CONTROLLER (Mobile)
// ════════════════════════════════════════════════════════════════

function PlayerController() {
  const { phase } = useGame();
  return (
    <div className="h-full bg-black relative">
      {phase === 'lobby'             && <LobbyPhone />}
      {phase === 'intro'             && <WaitingPhone label="GET READY" />}
      {phase === 'question'          && <QuestionPhone />}
      {phase === 'reveal'            && <ResultPhone />}
      {phase === 'mainframe_intro'   && <MainframePhoneIntro />}
      {phase === 'wager'             && <WagerPhone />}
      {phase === 'final_question'    && <QuestionPhone final />}
      {phase === 'final_reveal'      && <ResultPhone final />}
      {phase === 'game_over'         && <GameOverPhone />}
    </div>
  );
}

function PhoneShell({ children, you, accent }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 flex items-center justify-between border-b-2"
        style={{ borderColor: accent || you?.color, background: '#000' }}>
        <div className="flex items-center gap-2">
          {you && <PlayerAvatar player={you} size={22} showName={false} />}
          <div className="font-pixel text-[8px]" style={{ color: you?.color }}>{you?.name || 'PLAYER'}</div>
        </div>
        <div className="font-pixel text-[8px] flex items-center gap-1" style={{ color: C.green }}>
          <Radio size={8} className="animate-pulse" /> CONNECTED
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">{children}</div>
    </div>
  );
}

function LobbyPhone() {
  const { players, youId } = useGame();
  const you = players.find(p => p.id === youId);
  return (
    <PhoneShell you={you}>
      <div className="h-full flex flex-col items-center justify-center text-center gap-4">
        <PlayerAvatar player={you} size={80} showName={false} glow />
        <div className="font-pixel text-base text-glow" style={{ color: you.color }}>{you.name}</div>
        <div className="font-pixel text-[9px] text-zinc-500">▸ JOINED LOBBY</div>
        <div className="border-2 px-4 py-3 mt-2" style={{ borderColor: C.green }}>
          <div className="font-pixel text-[8px] text-zinc-500">STATUS</div>
          <div className="font-pixel text-sm flicker" style={{ color: C.green }}>WAITING FOR HOST</div>
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
            <div className="w-1.5 h-1.5 bg-green-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </PhoneShell>
  );
}

function WaitingPhone({ label='STAND BY', sub }) {
  const { players, youId } = useGame();
  const you = players.find(p => p.id === youId);
  return (
    <PhoneShell you={you}>
      <div className="h-full flex flex-col items-center justify-center text-center gap-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
          <div className="absolute inset-0 border-t-4 rounded-full radar-sweep" style={{ borderColor: C.cyan }} />
          <div className="absolute inset-3 grid place-items-center">
            <Radio size={24} style={{ color: C.cyan }} />
          </div>
        </div>
        <div className="font-pixel text-base text-glow" style={{ color: C.cyan }}>{label}</div>
        {sub && <div className="font-crt text-base text-zinc-400">{sub}</div>}
      </div>
    </PhoneShell>
  );
}

function QuestionPhone({ final=false }) {
  const { currentQuestion, players, youId, timeLeft, totalTime, lockIn } = useGame();
  const you = players.find(p => p.id === youId);
  if (!currentQuestion) return null;

  if (you.locked) return <LockedPhone you={you} />;

  return (
    <PhoneShell you={you} accent={final ? C.purple : you.color}>
      <div className="flex items-center gap-2 mb-3">
        <div className="font-pixel text-[9px] tabular-nums" style={{ color: timeLeft < totalTime*0.25 ? C.red : C.green }}>
          {Math.ceil(timeLeft).toString().padStart(2,'0')}s
        </div>
        <div className="flex-1"><TimerBar time={timeLeft} total={totalTime} ominous /></div>
        {final && <Flame size={14} style={{ color: C.purple }} className="warning-pulse" />}
      </div>

      <div className="font-pixel text-[10px] text-zinc-400 mb-3 leading-relaxed">{currentQuestion.prompt}</div>

      {currentQuestion.type === 'classic'   && <ClassicPhoneBody q={currentQuestion} onLock={a => lockIn(youId, a)} />}
      {currentQuestion.type === 'decryptor' && <DecryptorPhoneBody onLock={a => lockIn(youId, a)} />}
      {currentQuestion.type === 'sequence'  && <SequencePhoneBody q={currentQuestion} onLock={a => lockIn(youId, a)} />}
    </PhoneShell>
  );
}

function ClassicPhoneBody({ q, onLock }) {
  const tags = ['A','B','C','D'];
  const colors = [C.pink, C.cyan, C.green, C.yellow];
  return (
    <div className="grid grid-cols-2 gap-2 h-full">
      {q.options.map((opt, i) => (
        <button key={i} onClick={() => onLock(i)}
          className="btn-3d font-pixel text-[10px] p-2 leading-tight transition-all min-h-[80px] flex flex-col items-center justify-center gap-1"
          style={{ color: colors[i], background: '#0a0a0a' }}>
          <div className="w-6 h-6 grid place-items-center font-pixel text-sm"
            style={{ background: colors[i], color: '#000' }}>{tags[i]}</div>
          <div className="text-white text-center text-[9px]">{opt}</div>
        </button>
      ))}
    </div>
  );
}

function DecryptorPhoneBody({ onLock }) {
  const [val, setVal] = useState('');
  return (
    <div className="space-y-3">
      <div className="font-pixel text-[8px] text-zinc-500">▸ TYPE YOUR DECRYPTION</div>
      <input value={val} onChange={e => setVal(e.target.value)}
        autoFocus
        placeholder="ENTER ANSWER…"
        className="retro-input w-full p-3 bg-black border-2 font-pixel text-sm uppercase"
        style={{ borderColor: C.green, color: C.green, caretColor: C.green }} />
      <button onClick={() => onLock(val)} disabled={!val.trim()}
        className="btn-3d font-pixel text-xs w-full py-3 disabled:opacity-30"
        style={{ color: C.pink, background: '#0a0a0a' }}>
        <span className="flex items-center justify-center gap-2"><Lock size={14}/>LOCK IN</span>
      </button>
      <div className="font-crt text-base text-zinc-500 text-center">⚡ Faster lock = more points</div>
    </div>
  );
}

function SequencePhoneBody({ q, onLock }) {
  const [order, setOrder] = useState([]); // array of original indices
  const colors = [C.pink, C.cyan, C.yellow];

  useEffect(() => { if (order.length === q.items.length) onLock(order); }, [order]);

  const tap = i => {
    if (order.includes(i)) setOrder(order.filter(x => x !== i));
    else if (order.length < q.items.length) setOrder([...order, i]);
  };

  return (
    <div className="space-y-2">
      <div className="font-pixel text-[8px] text-zinc-500">▸ TAP IN ORDER (1 → 3)</div>
      <div className="flex justify-center gap-1.5 my-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-7 h-7 grid place-items-center font-pixel text-xs border-2"
            style={{
              borderColor: order[i] != null ? colors[i] : '#3f3f46',
              background: order[i] != null ? colors[i] + '22' : 'transparent',
              color: order[i] != null ? colors[i] : '#52525b',
            }}>
            {order[i] != null ? `#${i+1}` : '·'}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {q.items.map((item, i) => {
          const pos = order.indexOf(i);
          const used = pos !== -1;
          return (
            <button key={i} onClick={() => tap(i)}
              className="btn-3d font-pixel text-[11px] w-full p-3 flex items-center justify-between transition-all"
              style={{
                color: used ? colors[pos] : C.green,
                background: '#0a0a0a',
                opacity: used ? 1 : 0.95,
              }}>
              <span className="text-white">{item}</span>
              <span className="w-7 h-7 grid place-items-center"
                style={{ background: used ? colors[pos] : '#27272a', color: used ? '#000' : '#71717a' }}>
                {used ? `${pos+1}` : '?'}
              </span>
            </button>
          );
        })}
      </div>
      <button onClick={() => setOrder([])}
        className="font-pixel text-[9px] w-full py-1.5 text-zinc-500 hover:text-white">CLEAR</button>
    </div>
  );
}

function LockedPhone({ you }) {
  return (
    <PhoneShell you={you}>
      <div className="h-full flex flex-col items-center justify-center text-center gap-3">
        <Lock size={48} className="pixel-pop" style={{ color: you.color, filter: `drop-shadow(0 0 12px ${you.color})` }}/>
        <div className="font-pixel text-base text-glow" style={{ color: you.color }}>LOCKED IN</div>
        <div className="font-crt text-lg text-zinc-400">awaiting other players…</div>
        <div className="flex gap-1 mt-2">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 animate-pulse" style={{ background: you.color, animationDelay: `${i*0.2}s` }}/>
          ))}
        </div>
      </div>
    </PhoneShell>
  );
}

function ResultPhone({ final=false }) {
  const { players, youId } = useGame();
  const you = players.find(p => p.id === youId);
  const ok = you.lastResult === 'correct';
  const color = ok ? C.green : you.lastResult === 'timeout' ? '#71717a' : C.red;

  return (
    <PhoneShell you={you}>
      <div className={`h-full flex flex-col items-center justify-center text-center gap-3 ${ok ? 'pixel-pop' : 'shake'}`}>
        <div className="w-20 h-20 grid place-items-center border-4"
          style={{ borderColor: color, background: `${color}22`, boxShadow: `0 0 20px ${color}` }}>
          {ok ? <Check size={48} style={{ color }} /> :
           you.lastResult === 'timeout' ? <AlertTriangle size={40} style={{ color }} /> :
           <X size={48} style={{ color }} />}
        </div>
        <div className="font-pixel text-base text-glow" style={{ color }}>
          {ok ? 'CORRECT' : you.lastResult === 'timeout' ? 'TIME UP' : 'WRONG'}
        </div>
        <div className="font-pixel text-2xl text-glow-soft" style={{ color: ok ? C.yellow : '#52525b' }}>
          {ok ? `+${you.lastPoints}` : final && you.lastPoints < 0 ? `${you.lastPoints}` : '+0'}
        </div>
        <div className="font-pixel text-[9px] text-zinc-500">SCORE: <span style={{ color: you.color }}>{you.score.toLocaleString()}</span></div>
        {you.streak > 1 && (
          <div className="font-pixel text-[9px] mt-1" style={{ color: C.pink }}>
            🔥 STREAK ×{you.streak}
          </div>
        )}
      </div>
    </PhoneShell>
  );
}

function MainframePhoneIntro() {
  const { players, youId } = useGame();
  const you = players.find(p => p.id === youId);
  return (
    <PhoneShell you={you} accent={C.purple}>
      <div className="h-full flex flex-col items-center justify-center text-center gap-3">
        <Flame size={48} className="warning-pulse" style={{ color: C.pink }} />
        <div className="font-pixel text-sm glitch" style={{ color: C.purple }}>THE MAINFRAME</div>
        <div className="font-crt text-lg text-zinc-300 leading-tight px-2">
          Place your wager.<br/>Be brave.<br/>Be wrong → lose it all.
        </div>
      </div>
    </PhoneShell>
  );
}

function WagerPhone() {
  const { players, youId, setWager, timeLeft, totalTime } = useGame();
  const you = players.find(p => p.id === youId);
  const max = Math.max(100, you.score);
  const [val, setVal] = useState(Math.max(100, Math.floor(you.score * 0.5)));

  if (you.wager != null) {
    return (
      <PhoneShell you={you} accent={C.purple}>
        <div className="h-full flex flex-col items-center justify-center text-center gap-3">
          <Lock size={40} style={{ color: C.yellow, filter: `drop-shadow(0 0 10px ${C.yellow})` }} />
          <div className="font-pixel text-xs text-glow" style={{ color: C.yellow }}>WAGER LOCKED</div>
          <div className="font-pixel text-3xl text-glow" style={{ color: C.yellow }}>{you.wager.toLocaleString()}</div>
          <div className="font-crt text-base text-zinc-500">awaiting question…</div>
        </div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell you={you} accent={C.purple}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="font-pixel text-[9px] tabular-nums" style={{ color: timeLeft < 4 ? C.red : C.yellow }}>
            {Math.ceil(timeLeft).toString().padStart(2,'0')}s
          </div>
          <div className="flex-1"><TimerBar time={timeLeft} total={totalTime} ominous /></div>
        </div>
        <div className="font-pixel text-[10px] text-center" style={{ color: C.purple }}>★ MAINFRAME WAGER ★</div>
        <div className="font-pixel text-[9px] text-zinc-500 text-center">SCORE: {you.score.toLocaleString()}</div>

        <div className="text-center py-2">
          <div className="font-pixel text-[9px] text-zinc-500 mb-1">YOU WAGER</div>
          <div className="font-pixel text-3xl text-glow" style={{ color: C.yellow }}>
            {val.toLocaleString()}
          </div>
        </div>

        <input type="range" min={Math.min(100, max)} max={max} value={val}
          onChange={e => setVal(parseInt(e.target.value))}
          className="w-full accent-yellow-400" />

        <div className="grid grid-cols-3 gap-1.5">
          {[0.25, 0.5, 1].map(f => (
            <button key={f} onClick={() => setVal(Math.max(100, Math.floor(max * f)))}
              className="btn-3d font-pixel text-[9px] py-2"
              style={{ color: f === 1 ? C.red : C.cyan, background: '#0a0a0a' }}>
              {f === 1 ? 'ALL IN' : f === 0.5 ? 'HALF' : 'QTR'}
            </button>
          ))}
        </div>

        <button onClick={() => setWager(youId, val)}
          className="btn-3d font-pixel text-xs w-full py-3"
          style={{ color: C.yellow, background: '#0a0a0a' }}>
          <span className="flex items-center justify-center gap-2"><Lock size={14}/>LOCK WAGER</span>
        </button>
      </div>
    </PhoneShell>
  );
}

function GameOverPhone() {
  const { players, youId, playAgain } = useGame();
  const you = players.find(p => p.id === youId);
  const sorted = [...players].sort((a,b) => b.score - a.score);
  const place = sorted.findIndex(p => p.id === youId) + 1;
  const won = place === 1;

  return (
    <PhoneShell you={you}>
      <div className="h-full flex flex-col items-center justify-center text-center gap-3">
        {won ? <Crown size={52} className="warning-pulse" style={{ color: C.yellow }} /> : <Trophy size={42} style={{ color: C.cyan }} />}
        <div className="font-pixel text-base text-glow" style={{ color: won ? C.yellow : you.color }}>
          {won ? 'YOU WON' : `${place}${['st','nd','rd'][place-1]||'th'} PLACE`}
        </div>
        <div className="font-pixel text-2xl text-glow-soft" style={{ color: you.color }}>{you.score.toLocaleString()}</div>
        <button onClick={playAgain}
          className="btn-3d font-pixel text-[10px] px-5 py-3 mt-2"
          style={{ color: C.cyan, background: '#0a0a0a' }}>
          <span className="flex items-center gap-2"><RotateCcw size={12}/>PLAY AGAIN</span>
        </button>
      </div>
    </PhoneShell>
  );
}

// ════════════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════════════

export default function App() {
  return (
    <GameProvider>
      <InjectedStyles />
      <div className="min-h-screen bg-black text-white p-4 sm:p-6 relative overflow-hidden font-pixel">
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(255,46,136,0.08), transparent 60%), radial-gradient(ellipse at bottom right, rgba(0,240,255,0.08), transparent 60%)' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <header className="mb-5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-8 animate-pulse" style={{ background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
              <div>
                <div className="font-pixel text-[10px] text-zinc-500">▸ SCREEN SHARE // BIG SCREEN</div>
                <div className="font-pixel text-sm" style={{ color: C.cyan }}>HOST OUTPUT</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-pixel text-[10px] text-zinc-500">MOBILE CONTROLLER ◂</div>
                <div className="font-pixel text-sm" style={{ color: C.pink }}>YOUR PHONE</div>
              </div>
              <div className="w-3 h-8 animate-pulse" style={{ background: C.pink, boxShadow: `0 0 10px ${C.pink}` }} />
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1 min-w-0 w-full">
              <HostView />
            </div>
            <div className="w-full lg:w-auto lg:shrink-0 flex justify-center">
              <PhoneFrame><PlayerController /></PhoneFrame>
            </div>
          </div>

          <footer className="mt-6 font-pixel text-[9px] text-zinc-600 text-center flex items-center justify-center gap-2">
            <span style={{ color: C.green }}>●</span>
            NOGHURT BRAIN · MOCKED MULTIPLAYER STATE · WIRE TO SUPABASE WHEN READY
            <span style={{ color: C.green }}>●</span>
          </footer>
        </div>
      </div>
    </GameProvider>
  );
}
