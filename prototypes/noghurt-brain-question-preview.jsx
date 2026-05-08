import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Skull, Brain, Cpu, Atom, Wifi, Globe, Gamepad2, Lock, Check, X, AlertTriangle, Hash, Flame, Eye, Crown, Snowflake } from 'lucide-react';

// ════════════════════════════════════════════════════════════════
// PALETTE & STYLES (verbatim from original)
// ════════════════════════════════════════════════════════════════

const C = {
  pink: '#ff2e88', cyan: '#00f0ff', green: '#39ff14',
  yellow: '#ffe600', red: '#ff0040', purple: '#b829ff',
};

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

    @keyframes shakeAnim {
      0%,100% { transform: translateX(0); }
      10%,30%,50%,70%,90% { transform: translateX(-12px); }
      20%,40%,60%,80% { transform: translateX(12px); }
    }
    .shake { animation: shakeAnim 0.55s; }

    @keyframes blinkAnim { 0%,55% { opacity: 1; } 56%,100% { opacity: 0; } }
    .blink { animation: blinkAnim 1.1s infinite; }

    @keyframes pixelPop {
      0% { transform: scale(0) rotate(-10deg); opacity: 0; }
      55% { transform: scale(1.18) rotate(2deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    .pixel-pop { animation: pixelPop 0.35s ease-out backwards; }

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

    @keyframes flameFlick { 0%,100% { transform: scale(1) rotate(-2deg); } 50% { transform: scale(1.12) rotate(2deg); } }
    .flame-flick { animation: flameFlick 0.4s infinite; }

    @keyframes heatPulse {
      0%,100% { box-shadow: inset 0 0 0px 0px rgba(255, 0, 64, 0); }
      50% { box-shadow: inset 0 0 60px 4px rgba(255, 0, 64, 0.8); }
    }

    @keyframes lockBadgeIn {
      0% { transform: translateY(8px) scale(0.8); opacity: 0; }
      30% { transform: translateY(-12px) scale(1.1); opacity: 1; }
      80% { transform: translateY(-32px) scale(1); opacity: 1; }
      100% { transform: translateY(-50px) scale(0.95); opacity: 0; }
    }
    .lock-badge { animation: lockBadgeIn 1.6s ease-out forwards; }

    @keyframes emoteFloat {
      0% { transform: translateY(40px) scale(0.6); opacity: 0; }
      15% { transform: translateY(0) scale(1.2); opacity: 1; }
      80% { transform: translateY(-200px) scale(1); opacity: 1; }
      100% { transform: translateY(-280px) scale(0.9); opacity: 0; }
    }
    .emote-float { animation: emoteFloat 2.5s ease-out forwards; }

    @keyframes decryptIn {
      0% { transform: translateY(4px); opacity: 0; filter: blur(2px); }
      100% { transform: translateY(0); opacity: 1; filter: blur(0); }
    }
    .decrypt-in { animation: decryptIn 0.4s ease-out backwards; }

    @keyframes slideUp {
      0% { transform: translateY(20px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .slide-up { animation: slideUp 0.4s ease-out backwards; }
  `}</style>
);

// ════════════════════════════════════════════════════════════════
// DATA
// ════════════════════════════════════════════════════════════════

const CATEGORIES = {
  science:   { name: 'HARDCORE SCIENCE', Icon: Atom,     color: C.cyan },
  internet:  { name: 'INTERNET CULTURE', Icon: Wifi,     color: C.pink },
  retro:     { name: 'RETRO GAMING',     Icon: Gamepad2, color: C.yellow },
};

const SAMPLE_QUESTIONS = {
  classic: {
    id: 'q_classic', type: 'classic', cat: 'science',
    prompt: 'Approximately how far does light travel in 1 second?',
    options: ['30,000 km', '300,000 km', '3,000,000 km', '30,000,000 km'],
    correct: 1,
  },
  decryptor: {
    id: 'q_decrypt', type: 'decryptor', cat: 'internet',
    prompt: 'WWW stands for…',
    answer: 'WORLD WIDE WEB',
  },
  sequence: {
    id: 'q_seq', type: 'sequence', cat: 'retro',
    prompt: 'Order consoles by RELEASE YEAR (oldest first):',
    items: ['Sega Genesis', 'NES', 'PlayStation'],
    correctOrder: [1, 0, 2],
  },
};

const PLAYERS_INIT = [
  { id: 'p1', name: 'YOU',      color: C.pink,   Icon: Brain,  streak: 3, score: 1850 },
  { id: 'p2', name: 'PIXELRAT', color: C.cyan,   Icon: Skull,  streak: 0, score: 1420 },
  { id: 'p3', name: 'C1PHER',   color: C.green,  Icon: Cpu,    streak: 1, score: 1100 },
  { id: 'p4', name: 'N0VA',     color: C.yellow, Icon: Zap,    streak: 5, score: 2240 },
];

const EMOTES = [
  { id: 'fire', label: 'FIRE', Icon: Flame },
  { id: 'sus',  label: 'SUS',  Icon: Eye },
  { id: 'dead', label: 'DEAD', Icon: Skull },
  { id: 'gg',   label: 'GG',   Icon: Crown },
];

// ════════════════════════════════════════════════════════════════
// UTILITIES
// ════════════════════════════════════════════════════════════════

const norm = s => (s ?? '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');

function checkAnswer(q, a) {
  if (a == null) return false;
  if (q.type === 'classic')   return a === q.correct;
  if (q.type === 'decryptor') return norm(a) === norm(q.answer);
  if (q.type === 'sequence')  return Array.isArray(a) && a.length === q.correctOrder.length && a.every((v, i) => v === q.correctOrder[i]);
  return false;
}

// ════════════════════════════════════════════════════════════════
// CORE COMPONENTS — preserved from original
// ════════════════════════════════════════════════════════════════

function PlayerAvatar({ player, size = 64, showName = true, locked = false, glow = true, dim = false }) {
  const Icon = player.Icon;
  return (
    <div className="flex flex-col items-center gap-1.5 transition-all">
      <div className={`relative grid place-items-center rounded transition-all ${dim ? 'opacity-30 grayscale' : ''}`}
        style={{
          width: size, height: size, color: player.color,
          background: '#000',
          boxShadow: glow ? `0 0 0 3px ${player.color}, 0 0 18px ${player.color}` : `0 0 0 3px ${player.color}`,
        }}>
        <Icon size={size * 0.5} strokeWidth={2.5} style={{ color: player.color, filter: `drop-shadow(0 0 4px ${player.color})` }} />
        {locked && (
          <div className="absolute inset-0 grid place-items-center bg-black/70 rounded">
            <Lock size={size * 0.45} style={{ color: player.color, filter: `drop-shadow(0 0 6px ${player.color})` }} />
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

function TimerBar({ time, total, ominous = false }) {
  const pct = Math.max(0, Math.min(1, time / total));
  const color = pct > 0.5 ? C.green : pct > 0.25 ? C.yellow : C.red;
  return (
    <div className="relative w-full h-3 bg-black border-2 border-zinc-700 overflow-hidden">
      <div className="h-full transition-[width] duration-75 relative"
        style={{ width: `${pct * 100}%`, background: color, boxShadow: `0 0 12px ${color}` }}>
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4) 4px, transparent 4px, transparent 8px)' }} />
      </div>
      {ominous && pct < 0.25 && <div className="absolute inset-0 bg-red-500/20 animate-pulse" />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HOST-SIDE ENHANCEMENTS
// ════════════════════════════════════════════════════════════════

function StreakBadge({ streak, color }) {
  if (!streak || streak < 2) return null;
  return (
    <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 px-1 py-0.5 bg-black border z-10"
      style={{ borderColor: color, boxShadow: `0 0 6px ${color}` }}>
      <Flame size={9} className="flame-flick" style={{ color: C.yellow, filter: `drop-shadow(0 0 3px ${C.yellow})` }} />
      <span className="font-pixel text-[8px] text-glow-soft" style={{ color: C.yellow }}>{streak}</span>
    </div>
  );
}

function PlayerAvatarWithStreak({ player, ...rest }) {
  return (
    <div className="relative">
      <PlayerAvatar player={player} {...rest} />
      <StreakBadge streak={player.streak} color={player.color} />
    </div>
  );
}

function LockInFloater({ player }) {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 -top-2 lock-badge pointer-events-none whitespace-nowrap z-20">
      <div className="font-pixel text-[8px] px-1.5 py-1 border-2 flex items-center gap-1"
        style={{
          color: player.color, background: '#000', borderColor: player.color,
          boxShadow: `0 0 12px ${player.color}, 0 0 0 1px #000`,
        }}>
        <Check size={9} strokeWidth={3} />
        LOCKED
      </div>
    </div>
  );
}

function HeatBorder({ timeLeft, frozen }) {
  if (frozen || timeLeft > 5 || timeLeft <= 0) return null;
  const intensity = Math.min(0.85, (5 - timeLeft) / 5);
  return (
    <div className="absolute inset-0 pointer-events-none rounded-lg"
      style={{
        boxShadow: `inset 0 0 ${30 + intensity * 50}px ${4 + intensity * 8}px rgba(255, 0, 64, ${0.3 + intensity * 0.5})`,
        animation: `heatPulse ${0.85 - intensity * 0.35}s ease-in-out infinite`,
        zIndex: 25,
      }} />
  );
}

function FrozenOverlay({ active }) {
  if (!active) return null;
  return (
    <>
      <div className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          boxShadow: `inset 0 0 60px 6px rgba(184, 41, 255, 0.45), inset 0 0 0 2px rgba(0, 240, 255, 0.6)`,
          background: 'rgba(0, 240, 255, 0.04)',
          zIndex: 26,
        }} />
      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-30">
        <div className="font-pixel text-[10px] px-2 py-1 border-2 flex items-center gap-1.5 bg-black"
          style={{
            color: C.cyan, borderColor: C.cyan,
            boxShadow: `0 0 14px ${C.cyan}`,
            animation: 'warningPulse 0.6s infinite',
          }}>
          <Snowflake size={11} />
          TIMER FROZEN
        </div>
      </div>
    </>
  );
}

function EmoteFloater({ emote, x, color }) {
  const Icon = emote.Icon;
  return (
    <div className="absolute bottom-2 emote-float pointer-events-none z-20" style={{ left: `${x}%` }}>
      <div className="flex flex-col items-center gap-1">
        <div className="grid place-items-center w-12 h-12 border-2 bg-black"
          style={{ borderColor: color, boxShadow: `0 0 16px ${color}` }}>
          <Icon size={24} style={{ color, filter: `drop-shadow(0 0 6px ${color})` }} />
        </div>
        <div className="font-pixel text-[9px] px-1.5 py-0.5 bg-black border" style={{ color, borderColor: color }}>
          {emote.label}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// HOST FRAME
// ════════════════════════════════════════════════════════════════

function HostFrame({ children, timeLeft, emotes, frozen, shake }) {
  return (
    <div className={`relative bg-black border-4 border-zinc-800 rounded-lg overflow-hidden scanlines vignette ${shake ? 'shake' : ''}`}
      style={{
        boxShadow: '0 0 0 2px #000, 0 0 40px rgba(0,240,255,0.18), inset 0 0 60px rgba(0,0,0,0.8)',
        minHeight: 600,
      }}>
      <div className="scan-line" />
      <div className="bg-grid absolute inset-0 opacity-50" />
      <HeatBorder timeLeft={timeLeft} frozen={frozen} />
      <FrozenOverlay active={frozen} />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {emotes.map(e => (
          <EmoteFloater key={e.id} emote={e.emote} x={e.x} color={e.color} />
        ))}
      </div>
      <div className="relative z-10 p-6 sm:p-8 h-full">{children}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// QUESTION-PHASE BODIES
// ════════════════════════════════════════════════════════════════

function ClassicHostBody({ q }) {
  const tags = ['A', 'B', 'C', 'D'];
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
    const idxs = q.answer.split('').map((char, idx) => ({ char, idx })).filter(x => x.char !== ' ').map(x => x.idx);
    let s = 0; for (const ch of q.id) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
    return idxs.sort(() => { s = (s * 1103515245 + 12345) >>> 0; return (s % 2) ? 1 : -1; });
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
              const globalIdx = q.answer.split(' ').slice(0, wi).reduce((a, w) => a + w.length + 1, 0) + i;
              const revealed = revealedSet.has(globalIdx);
              return (
                <div key={i} className="w-8 h-11 sm:w-9 sm:h-12 grid place-items-center font-pixel text-sm sm:text-base border-2 transition-all"
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

// ════════════════════════════════════════════════════════════════
// PHASES
// ════════════════════════════════════════════════════════════════

function QuestionHost({ question, players, timeLeft, totalTime, recentLocks, frozen }) {
  const cat = CATEGORIES[question.cat];
  const lockedCount = players.filter(p => p.locked).length;
  const timerColor = frozen
    ? C.cyan
    : timeLeft < totalTime * 0.25 ? C.red
    : timeLeft < totalTime * 0.5 ? C.yellow
    : C.green;

  return (
    <div className="flex flex-col h-full gap-4 min-h-[560px]">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <cat.Icon size={20} style={{ color: cat.color }} />
          <div className="font-pixel text-xs" style={{ color: cat.color }}>{cat.name}</div>
        </div>
        <div className="font-pixel text-xs text-zinc-400">
          ROUND <span style={{ color: C.cyan }}>03</span>
          <span className="text-zinc-700 mx-1">/</span>05
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="font-pixel text-3xl tabular-nums flex items-center gap-2" style={{ color: timerColor }}>
          {frozen && <Snowflake size={20} className="warning-pulse" />}
          {Math.ceil(timeLeft).toString().padStart(2, '0')}
        </div>
        <div className="flex-1"><TimerBar time={timeLeft} total={totalTime} ominous /></div>
      </div>

      <div className="flex-1 grid place-items-center py-4">
        <div className="font-pixel text-lg sm:text-2xl leading-relaxed text-center max-w-3xl text-white text-glow-soft">
          {question.prompt}
        </div>
      </div>

      <div>
        {question.type === 'classic'   && <ClassicHostBody q={question} />}
        {question.type === 'decryptor' && <DecryptorHostBody q={question} timeLeft={timeLeft} totalTime={totalTime} />}
        {question.type === 'sequence'  && <SequenceHostBody q={question} />}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-3">
          {players.map(p => (
            <div key={p.id} className="relative">
              <PlayerAvatarWithStreak player={p} size={48} locked={p.locked} dim={!p.locked} showName={false} />
              {recentLocks[p.id] && <LockInFloater key={recentLocks[p.id]} player={p} />}
            </div>
          ))}
        </div>
        <div className="font-pixel text-xs" style={{ color: C.green }}>
          LOCKED IN: {lockedCount}/{players.length}
        </div>
      </div>
    </div>
  );
}

function RevealHost({ question, players }) {
  const cat = CATEGORIES[question.cat];
  let correctText = '';
  if (question.type === 'classic')   correctText = question.options[question.correct];
  if (question.type === 'decryptor') correctText = question.answer;
  if (question.type === 'sequence')  correctText = question.correctOrder.map(i => question.items[i]).join(' → ');

  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full gap-4 min-h-[560px]">
      <div className="flex items-center gap-3">
        <cat.Icon size={20} style={{ color: cat.color }} />
        <div className="font-pixel text-xs" style={{ color: cat.color }}>{cat.name}</div>
      </div>

      <div className="font-pixel text-base sm:text-lg leading-relaxed text-zinc-300 text-center">
        {question.prompt}
      </div>

      <div className="text-center pixel-pop space-y-2 py-2">
        <div className="font-pixel text-[10px]" style={{ color: C.green }}>▸ ANSWER UNLOCKED</div>
        <div className="font-pixel text-2xl sm:text-3xl text-glow inline-block px-4 py-3"
          style={{ color: C.green, background: 'rgba(57,255,20,0.08)', border: `3px solid ${C.green}` }}>
          {correctText.split('').map((ch, i) => (
            <span key={i} className="inline-block decrypt-in" style={{ animationDelay: `${i * 0.03}s` }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 justify-center">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="font-pixel text-2xl w-8 text-zinc-500 text-center">{i + 1}</div>
            <PlayerAvatarWithStreak player={p} size={42} showName={false}
              glow={p.lastResult === 'correct'}
              dim={p.lastResult === 'wrong' || p.lastResult === 'timeout'} />
            <div className="font-pixel text-xs flex-1" style={{ color: p.color }}>{p.name}</div>
            <div className="font-pixel text-xs"
              style={{ color: p.lastResult === 'correct' ? C.green : p.lastResult === 'wrong' ? C.red : '#52525b' }}>
              {p.lastResult === 'correct' && <span className="flex items-center gap-1"><Check size={14} />+{p.lastPoints}</span>}
              {p.lastResult === 'wrong'   && <span className="flex items-center gap-1"><X size={14} />0</span>}
              {p.lastResult === 'timeout' && <span className="flex items-center gap-1"><AlertTriangle size={14} />—</span>}
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

// ════════════════════════════════════════════════════════════════
// AUTO-DEMO HOOK
// ════════════════════════════════════════════════════════════════

const TOTAL_TIME = 15;
const REVEAL_HOLD_MS = 5500;

function useAutoDemo(questionType) {
  const [phase, setPhase] = useState('question');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [players, setPlayers] = useState(() => PLAYERS_INIT.map(p => ({ ...p, locked: false, answer: null })));
  const [recentLocks, setRecentLocks] = useState({});
  const [emotes, setEmotes] = useState([]);
  const [frozen, setFrozen] = useState(false);
  const [revealedPlayers, setRevealedPlayers] = useState([]);

  // Reset everything when the question type changes
  useEffect(() => {
    setPhase('question');
    setTimeLeft(TOTAL_TIME);
    setPlayers(PLAYERS_INIT.map(p => ({ ...p, locked: false, answer: null })));
    setRecentLocks({});
    setEmotes([]);
    setFrozen(false);
  }, [questionType]);

  // Timer — paused while frozen
  useEffect(() => {
    if (phase !== 'question' || frozen) return;
    const t = setInterval(() => {
      setTimeLeft(prev => prev <= 0.1 ? 0 : prev - 0.1);
    }, 100);
    return () => clearInterval(t);
  }, [phase, frozen]);

  // Auto-events timeline (real-time clock, fires regardless of game-time freeze)
  useEffect(() => {
    if (phase !== 'question') return;
    const q = SAMPLE_QUESTIONS[questionType];

    const correct = q.type === 'classic' ? q.correct
      : q.type === 'decryptor' ? q.answer
      : q.correctOrder;
    const wrong = q.type === 'classic' ? (q.correct + 1) % 4
      : q.type === 'decryptor' ? 'XXXXX'
      : [...q.correctOrder].reverse();

    const fireEmote = (playerId, emoteId) => {
      const emote = EMOTES.find(e => e.id === emoteId);
      const player = PLAYERS_INIT.find(p => p.id === playerId);
      if (!emote || !player) return;
      setEmotes(prev => [...prev, {
        id: Date.now() + Math.random(),
        emote, color: player.color,
        x: 15 + Math.random() * 70,
      }]);
    };

    const lockPlayer = (id, answer) => {
      setPlayers(prev => prev.map(p => p.id === id && !p.locked ? { ...p, locked: true, answer } : p));
      setRecentLocks(prev => ({ ...prev, [id]: Date.now() }));
    };

    const timeline = [
      [2500,  () => lockPlayer('p2', correct)],     // PIXELRAT — correct
      [4500,  () => fireEmote('p2', 'fire')],
      [6500,  () => lockPlayer('p3', wrong)],       // C1PHER — wrong
      [8000,  () => setFrozen(true)],
      [9000,  () => lockPlayer('p1', correct)],     // YOU — correct (auto-locks during freeze)
      [10500, () => setFrozen(false)],
      [12500, () => lockPlayer('p4', correct)],     // N0VA — correct
      [14500, () => fireEmote('p4', 'gg')],
    ];

    const timers = timeline.map(([d, fn]) => setTimeout(fn, d));
    return () => timers.forEach(clearTimeout);
  }, [phase, questionType]);

  // Auto-advance to reveal a beat after timer hits zero
  useEffect(() => {
    if (phase !== 'question' || timeLeft > 0) return;
    const t = setTimeout(() => setPhase('reveal'), 800);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // Compute reveal results once on phase entry — frozen for the rest of the cycle
  useEffect(() => {
    if (phase !== 'reveal') return;
    const q = SAMPLE_QUESTIONS[questionType];
    setRevealedPlayers(players.map(p => {
      let result = 'wrong', points = 0;
      if (!p.locked) result = 'timeout';
      else {
        const correct = checkAnswer(q, p.answer);
        result = correct ? 'correct' : 'wrong';
        if (correct) points = 350 + Math.floor(Math.random() * 200);
      }
      return {
        ...p,
        lastResult: result,
        lastPoints: points,
        score: p.score + points,
        streak: result === 'correct' ? p.streak + 1 : 0,
      };
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // After reveal sits, restart the cycle
  useEffect(() => {
    if (phase !== 'reveal') return;
    const t = setTimeout(() => {
      setPhase('question');
      setTimeLeft(TOTAL_TIME);
      setPlayers(PLAYERS_INIT.map(p => ({ ...p, locked: false, answer: null })));
      setRecentLocks({});
      setEmotes([]);
      setFrozen(false);
    }, REVEAL_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Sweep stale lock badges + emotes
  useEffect(() => {
    if (Object.keys(recentLocks).length === 0) return;
    const t = setTimeout(() => {
      setRecentLocks(prev => {
        const cutoff = Date.now() - 1700;
        const next = {};
        for (const [id, ts] of Object.entries(prev)) if (ts > cutoff) next[id] = ts;
        return next;
      });
    }, 250);
    return () => clearTimeout(t);
  }, [recentLocks]);

  useEffect(() => {
    if (emotes.length === 0) return;
    const t = setTimeout(() => {
      setEmotes(prev => prev.filter(e => Date.now() - e.id < 2600));
    }, 250);
    return () => clearTimeout(t);
  }, [emotes]);

  return { phase, timeLeft, totalTime: TOTAL_TIME, players, recentLocks, emotes, frozen, revealedPlayers };
}

// ════════════════════════════════════════════════════════════════
// TOP BAR
// ════════════════════════════════════════════════════════════════

function TopBar({ questionType, onChange }) {
  const tabs = [
    { id: 'classic',   label: 'CLASSIC',   color: C.pink },
    { id: 'decryptor', label: 'DECRYPTOR', color: C.green },
    { id: 'sequence',  label: 'SEQUENCE',  color: C.cyan },
  ];

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-2 h-7 animate-pulse" style={{ background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
        <div>
          <div className="font-pixel text-sm sm:text-base text-glow-soft" style={{ color: C.pink }}>
            NOGHURT BRAIN
          </div>
          <div className="font-crt text-base text-zinc-500 leading-none mt-0.5">Question Phase preview</div>
        </div>
      </div>

      <div className="flex gap-1.5">
        {tabs.map(t => {
          const active = questionType === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              className="font-pixel text-[10px] px-3 py-2 border-2 transition-all"
              style={{
                color: active ? '#000' : t.color,
                background: active ? t.color : 'transparent',
                borderColor: t.color,
                boxShadow: active ? `0 0 14px ${t.color}` : 'none',
              }}>
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════════════

export default function App() {
  const [questionType, setQuestionType] = useState('classic');
  const demo = useAutoDemo(questionType);
  const question = SAMPLE_QUESTIONS[questionType];

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 relative overflow-hidden font-pixel">
      <InjectedStyles />

      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(255,46,136,0.08), transparent 60%), radial-gradient(ellipse at bottom right, rgba(0,240,255,0.08), transparent 60%)' }} />

      <div className="max-w-6xl mx-auto relative z-10 space-y-5">
        <TopBar questionType={questionType} onChange={setQuestionType} />

        <HostFrame timeLeft={demo.timeLeft} emotes={demo.emotes} frozen={demo.frozen}>
          {demo.phase === 'question' ? (
            <QuestionHost
              question={question}
              players={demo.players}
              timeLeft={demo.timeLeft}
              totalTime={demo.totalTime}
              recentLocks={demo.recentLocks}
              frozen={demo.frozen}
            />
          ) : (
            <RevealHost question={question} players={demo.revealedPlayers} />
          )}
        </HostFrame>
      </div>
    </div>
  );
}
