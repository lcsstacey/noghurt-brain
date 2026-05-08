import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Check, X, AlertTriangle, Hash, Atom, Wifi, Gamepad2, Skull, Sparkles, HelpCircle, Flame, Zap } from 'lucide-react';

// ════════════════════════════════════════════════════════════════
// PALETTE & STYLES
// ════════════════════════════════════════════════════════════════

const C = {
  pink: '#ff2e88', cyan: '#00f0ff', green: '#39ff14',
  yellow: '#ffe600', red: '#ff0040', purple: '#b829ff',
  skin: '#f5d4ad',
  white: '#e8e8e8',
  steel: '#9ca3af',
  rust: '#a04020',
  shadow: '#1a1a2e',
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
    .text-glow { text-shadow: 0 0 6px currentColor, 0 0 14px currentColor; }
    .text-glow-soft { text-shadow: 0 0 4px currentColor; }

    @keyframes blinkAnim { 0%,55% { opacity: 1; } 56%,100% { opacity: 0; } }
    .blink { animation: blinkAnim 1.1s infinite; }

    @keyframes scanLineMove { 0% { transform: translateY(-30%); } 100% { transform: translateY(130%); } }
    .scan-line {
      position: absolute; left: 0; right: 0; height: 8px;
      background: linear-gradient(180deg, transparent, rgba(0,240,255,0.35), transparent);
      animation: scanLineMove 5s linear infinite;
      pointer-events: none; z-index: 32;
    }

    @keyframes idleBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
    .idle-bob { animation: idleBob 1.6s ease-in-out infinite; }

    @keyframes idleBobSlow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
    .idle-bob-slow { animation: idleBobSlow 2.4s ease-in-out infinite; }

    @keyframes warningPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .warning-pulse { animation: warningPulse 0.4s infinite; }

    @keyframes nodePulse {
      0%,100% { box-shadow: 0 0 0 2px currentColor, 0 0 16px currentColor; }
      50%     { box-shadow: 0 0 0 2px currentColor, 0 0 28px currentColor; }
    }
    .node-pulse { animation: nodePulse 1.4s ease-in-out infinite; }

    @keyframes textIn {
      0% { opacity: 0; transform: translateX(-4px); filter: blur(2px); }
      100% { opacity: 1; transform: translateX(0); filter: blur(0); }
    }
    .text-in { animation: textIn 0.5s ease-out backwards; }

    @keyframes starTwinkle {
      0%,100% { opacity: 1; transform: scale(1) rotate(0); }
      50%     { opacity: 0.7; transform: scale(1.15) rotate(15deg); }
    }
    .star-twinkle { animation: starTwinkle 1.2s ease-in-out infinite; }

    @keyframes pathFlow {
      0%   { background-position: 0% 0; }
      100% { background-position: 16px 0; }
    }
    .path-flow {
      background-image: repeating-linear-gradient(90deg, currentColor 0 4px, transparent 4px 8px);
      animation: pathFlow 0.8s linear infinite;
    }

    @keyframes pixelPop {
      0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
      55%  { transform: scale(1.18) rotate(2deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    .pixel-pop { animation: pixelPop 0.35s ease-out backwards; }
  `}</style>
);

// ════════════════════════════════════════════════════════════════
// PIXEL SPRITES — 12x12 grids rendered as inline SVG
// ════════════════════════════════════════════════════════════════

// Each sprite: a 12-row array of 12-character strings, plus a palette
// '.' = transparent, otherwise a key in the palette

const SPRITES = {
  oracle: {
    palette: { '#': '#0a0a0a', H: C.purple, h: '#7a1bb3', F: C.skin, B: C.white, R: C.cyan, r: '#0099a8', S: C.yellow },
    grid: [
      '.....S......',
      '....SH#.....',
      '...#HHH#....',
      '..#HHHHH#...',
      '.#HHHHHHH#..',
      '#HHHHHHHHH#.',
      '..#FFFFFF#..',
      '..#FBBBBF#..',
      '.#BBBBBBBB#.',
      '.#RRRRRRRR#.',
      '..RRRRRRRR..',
      '..R##..##R..',
    ],
  },
  // MAGE — pink robes, pointed hat (the player class for YOU)
  mage: {
    palette: { '#': '#0a0a0a', H: C.pink, h: '#a01a5a', F: C.skin, R: C.pink, r: '#a01a5a', S: C.yellow },
    grid: [
      '....SH......',
      '....HH#.....',
      '...#HHH#....',
      '..#HHHHH#...',
      '.#HHHHHHH#..',
      '...#FFFF#...',
      '...#F##F#...',
      '..#RRRRRR#..',
      '.#RRRRRRRR#.',
      '.#RRRRRRRR#.',
      '..RRRrrRRR..',
      '..R##..##R..',
    ],
  },
  // HACKER — cyan hood, dark jacket
  hacker: {
    palette: { '#': '#0a0a0a', H: C.cyan, h: '#0099a8', F: C.skin, J: C.shadow, j: '#000', G: C.green },
    grid: [
      '...#HHHH#...',
      '..#HHHHHH#..',
      '.#HhhhhhhH#.',
      '#HhFFFFFFhH#',
      '#HhF#FF#FhH#',
      '.#HhFFFFhH#.',
      '..#HHHHHH#..',
      '..JJJJJJJJ..',
      '.JJJGJJJJJJ.',
      '.JJJJJJJJJJ.',
      '..JJJjjJJJ..',
      '..J##..##J..',
    ],
  },
  // BARD — green tunic, lute, feathered hat
  bard: {
    palette: { '#': '#0a0a0a', H: C.green, h: '#1aa00a', F: C.skin, V: '#a04020', v: '#6a2810', L: '#d4a050', S: C.yellow },
    grid: [
      '...#HHHH#...',
      '..#HHHHHH#..',
      '.#HHHHHHHH#.',
      '...#FFFF#...',
      '...#F##F#...',
      '..#FFFFFF#..',
      '..VVVVVVVV..',
      '.VVVLLLLVVV.',
      '.VVLLLLLLVV.',
      '..VVLLLLVV..',
      '..VVvvvvVV..',
      '..V##..##V..',
    ],
  },
  // PALADIN — yellow helm, steel armor, sword
  paladin: {
    palette: { '#': '#0a0a0a', H: C.yellow, h: '#b39600', F: C.skin, A: C.steel, a: '#525c69', S: '#e8e8e8', G: C.cyan },
    grid: [
      '...#HHHH#...',
      '..#HHHHHH#..',
      '.#HHHHHHHH#.',
      '.#HFFFFFFH#.',
      '.#HF#FF#FH#.',
      '..#HHHHHH#..',
      '.AAAAAAAAAA.',
      '.AAAGAAASSAA',
      '.AAaAAAA##S.',
      '.AAaAAAAS#S.',
      '..aAaaaaS...',
      '..a##..##...',
    ],
  },
};

function PixelSprite({ id, scale = 4, className = '', glowColor }) {
  const sprite = SPRITES[id];
  if (!sprite) return null;
  const rows = sprite.grid.length;
  const cols = sprite.grid[0].length;
  const w = cols * scale;
  const h = rows * scale;
  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${cols} ${rows}`}
      shapeRendering="crispEdges"
      className={className}
      style={{ filter: glowColor ? `drop-shadow(0 0 4px ${glowColor})` : 'none' }}
    >
      {sprite.grid.map((row, y) =>
        row.split('').map((ch, x) => {
          const fill = sprite.palette[ch];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
        })
      )}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════
// DATA — biomes, classes, oracle dialogue, sample quest
// ════════════════════════════════════════════════════════════════

const BIOMES = {
  science: {
    id: 'science',
    name: 'THE CRYSTAL CAVES',
    sub: 'HARDCORE SCIENCE',
    Icon: Atom,
    color: C.cyan,
    accent: '#0099a8',
    oracleLines: [
      'The numbers spiral, traveler. Decode them — or perish in the math.',
      'Even light has limits. Find them, and you find the truth.',
      'The Caves test reason. They forgive nothing.',
    ],
  },
  internet: {
    id: 'internet',
    name: 'THE DATAWILD',
    sub: 'INTERNET CULTURE',
    Icon: Wifi,
    color: C.pink,
    accent: '#a01a5a',
    oracleLines: [
      'The DATAWILD howls tonight. Mind your packets, friend.',
      'Three letters can hold an empire. Speak them.',
      'Every signal has a source. Follow it back to where the lies began.',
    ],
  },
  retro: {
    id: 'retro',
    name: 'THE PIXEL RUINS',
    sub: 'RETRO GAMING',
    Icon: Gamepad2,
    color: C.yellow,
    accent: '#b39600',
    oracleLines: [
      'Ancient pixel ghosts whisper. They remember every move.',
      'These ruins were once a kingdom. Order matters here.',
      'The old machines hum still. Their order is your only guide.',
    ],
  },
};

// Player → class mapping. Class colour matches player colour (no clash).
const PARTY = [
  { id: 'p1', name: 'YOU',      cls: 'MAGE',    sprite: 'mage',    color: C.pink,   streak: 3 },
  { id: 'p2', name: 'PIXELRAT', cls: 'HACKER',  sprite: 'hacker',  color: C.cyan,   streak: 0 },
  { id: 'p3', name: 'C1PHER',   cls: 'BARD',    sprite: 'bard',    color: C.green,  streak: 1 },
  { id: 'p4', name: 'N0VA',     cls: 'PALADIN', sprite: 'paladin', color: C.yellow, streak: 5 },
];

// ════════════════════════════════════════════════════════════════
// NODE TYPES — Slay-the-Spire-flavoured variety on the path
// ════════════════════════════════════════════════════════════════
// 'question' nodes use their biome for icon/colour/label.
// Other types stand alone with a fixed icon.
const NODE_TYPES = {
  question: { Icon: null,        color: null,     label: '',          size: 44 },
  elite:    { Icon: Flame,       color: C.red,    label: 'ELITE',     size: 50 },
  mystery:  { Icon: HelpCircle,  color: C.purple, label: '???',       size: 44 },
  cache:    { Icon: Zap,         color: C.green,  label: 'CACHE',     size: 44 },
  boss:     { Icon: Skull,       color: C.red,    label: 'MAINFRAME', size: 64 },
};

// Maps the visible question-type tab to which biome the player is "in" right now.
const TAB_TO_BIOME = {
  classic:   'science',
  decryptor: 'internet',
  sequence:  'retro',
};

// 6-node ascent: 5 challenges + the boss. Current node's biome is dynamic so
// the path actually tracks the tab the user picked.
function getQuestNodes(currentBiome) {
  return [
    { type: 'question', biome: 'science',     done: true,  current: false }, // floor 1 — cleared
    { type: 'elite',    biome: 'internet',    done: true,  current: false }, // floor 2 — elite cleared
    { type: 'question', biome: currentBiome,  done: false, current: true  }, // ← floor 3, current
    { type: 'mystery',  biome: null,          done: false, current: false }, // floor 4 — anomaly
    { type: 'cache',    biome: null,          done: false, current: false }, // floor 5 — recharge
    { type: 'boss',     biome: null,          done: false, current: false }, // floor 6 — MAINFRAME
  ];
}

const SAMPLE_QUESTIONS = {
  classic: {
    id: 'q_classic', type: 'classic', biome: 'science',
    prompt: 'Approximately how far does light travel in 1 second?',
    options: ['30,000 km', '300,000 km', '3,000,000 km', '30,000,000 km'],
    correct: 1,
  },
  decryptor: {
    id: 'q_decrypt', type: 'decryptor', biome: 'internet',
    prompt: 'WWW stands for…',
    answer: 'WORLD WIDE WEB',
  },
  sequence: {
    id: 'q_seq', type: 'sequence', biome: 'retro',
    prompt: 'Order consoles by RELEASE YEAR (oldest first):',
    items: ['Sega Genesis', 'NES', 'PlayStation'],
    correctOrder: [1, 0, 2],
  },
};

// ════════════════════════════════════════════════════════════════
// ADVENTURE PATH — horizontal pixel map of quest nodes
// ════════════════════════════════════════════════════════════════

function PathNode({ node, index }) {
  const isBoss = node.type === 'boss';
  const isQuestion = node.type === 'question';
  const nodeType = NODE_TYPES[node.type];
  const biome = node.biome ? BIOMES[node.biome] : null;

  // Resolve icon / colour / label / size per type
  const Icon = isQuestion ? biome.Icon : nodeType.Icon;
  const baseColor = isQuestion ? biome.color : nodeType.color;
  const size = nodeType.size;
  const label = isQuestion
    ? (index + 1).toString().padStart(2, '0')
    : nodeType.label;

  let state = 'future';
  if (node.done) state = 'done';
  else if (node.current) state = 'current';

  // Boss gets a permanent ominous glow even when far away — looms
  const persistentGlow = isBoss && state !== 'done';

  const stateStyles = {
    done:    { color: baseColor, opacity: 0.4, background: '#000' },
    current: { color: baseColor, opacity: 1,   background: `${baseColor}11` },
    future:  { color: persistentGlow ? baseColor : '#3f3f46', opacity: persistentGlow ? 1 : 0.7, background: '#000' },
  }[state];

  const iconSize = isBoss ? 32 : node.type === 'elite' ? 24 : 20;

  return (
    <div className="flex flex-col items-center gap-1.5 relative shrink-0">
      {state === 'current' && (
        <div className="font-pixel text-[8px] absolute -top-5 whitespace-nowrap" style={{ color: baseColor }}>
          ▼ HERE
        </div>
      )}
      <div className={`grid place-items-center border-2 transition-all relative ${state === 'current' || persistentGlow ? 'node-pulse' : ''}`}
        style={{
          width: size, height: size,
          color: stateStyles.color,
          opacity: stateStyles.opacity,
          background: stateStyles.background,
          borderColor: stateStyles.color,
        }}>
        <Icon size={iconSize}
          style={{ color: stateStyles.color, filter: state !== 'future' || persistentGlow ? `drop-shadow(0 0 4px ${stateStyles.color})` : 'none' }} />
        {state === 'done' && (
          <div className="absolute inset-0 grid place-items-center">
            <Check size={isBoss ? 28 : 22} strokeWidth={3} style={{ color: '#52525b' }} />
          </div>
        )}
      </div>
      <div className="font-pixel text-[8px] whitespace-nowrap"
        style={{ color: state === 'current' || persistentGlow ? baseColor : '#52525b' }}>
        {label}
      </div>
    </div>
  );
}

function PathLine({ active }) {
  return (
    <div className="flex-1 h-1 mx-1 self-center"
      style={{ color: active ? C.green : '#27272a', minWidth: 8 }}>
      <div className={`w-full h-full ${active ? 'path-flow' : ''}`}
        style={{ backgroundColor: active ? 'transparent' : '#27272a' }} />
    </div>
  );
}

function AdventurePath({ currentBiomeId }) {
  const nodes = getQuestNodes(currentBiomeId);
  const currentIdx = nodes.findIndex(n => n.current);

  return (
    <div className="border-2 border-zinc-800 bg-black/60 backdrop-blur-sm p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="relative flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
        {nodes.map((node, i) => (
          <React.Fragment key={i}>
            <PathNode node={node} index={i} />
            {i < nodes.length - 1 && <PathLine active={node.done} />}
          </React.Fragment>
        ))}
      </div>
      <div className="relative mt-2.5 flex items-center justify-between font-pixel text-[8px] text-zinc-500 flex-wrap gap-2">
        <span>ASCENT · FLOOR <span style={{ color: C.cyan }}>{(currentIdx + 1).toString().padStart(2,'0')}</span> / {nodes.length.toString().padStart(2,'0')}</span>
        <span className="flex items-center gap-1.5">
          <Skull size={9} style={{ color: C.red }} className="warning-pulse" />
          <span style={{ color: C.red, textShadow: `0 0 4px ${C.red}` }}>MAINFRAME LOOMS</span>
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ORACLE — the wizard NPC with a speech bubble
// ════════════════════════════════════════════════════════════════

function OracleNPC({ biome, message, questPrompt }) {
  return (
    <div className="border-2 border-zinc-800 bg-black/70 backdrop-blur-sm p-4 sm:p-5 flex gap-4 sm:gap-5 items-start relative">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at left, ${biome.color}11, transparent 60%)` }} />
      {/* Oracle sprite */}
      <div className="shrink-0 relative">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 star-twinkle pointer-events-none">
          <Sparkles size={10} style={{ color: C.yellow, filter: `drop-shadow(0 0 4px ${C.yellow})` }} />
        </div>
        <div className="idle-bob-slow">
          <PixelSprite id="oracle" scale={5} glowColor={C.purple} />
        </div>
        <div className="font-pixel text-[8px] text-center mt-1.5" style={{ color: C.purple, textShadow: `0 0 4px ${C.purple}` }}>
          THE ORACLE
        </div>
      </div>

      {/* Speech bubble */}
      <div className="flex-1 min-w-0 relative">
        {/* Bubble tail (chunky pixel triangle pointing left at sprite) */}
        <div className="absolute -left-2.5 top-3 hidden sm:block">
          <svg width="10" height="14" viewBox="0 0 5 7" shapeRendering="crispEdges">
            {/* Outer zinc edge — matches the bubble's border */}
            <rect x="3" y="0" width="2" height="1" fill="#3f3f46" />
            <rect x="2" y="1" width="3" height="1" fill="#3f3f46" />
            <rect x="1" y="2" width="4" height="1" fill="#3f3f46" />
            <rect x="0" y="3" width="5" height="1" fill="#3f3f46" />
            <rect x="1" y="4" width="4" height="1" fill="#3f3f46" />
            <rect x="2" y="5" width="3" height="1" fill="#3f3f46" />
            <rect x="3" y="6" width="2" height="1" fill="#3f3f46" />
            {/* Inner black fill — covers everything except the leftmost pixel of each row */}
            <rect x="4" y="0" width="1" height="1" fill="#000" />
            <rect x="3" y="1" width="2" height="1" fill="#000" />
            <rect x="2" y="2" width="3" height="1" fill="#000" />
            <rect x="1" y="3" width="4" height="1" fill="#000" />
            <rect x="2" y="4" width="3" height="1" fill="#000" />
            <rect x="3" y="5" width="2" height="1" fill="#000" />
            <rect x="4" y="6" width="1" height="1" fill="#000" />
          </svg>
        </div>
        <div className="border-2 border-zinc-700 bg-black p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-zinc-800">
            <biome.Icon size={12} style={{ color: biome.color }} />
            <div className="font-pixel text-[9px]" style={{ color: biome.color, textShadow: `0 0 4px ${biome.color}` }}>
              {biome.name}
            </div>
            <div className="font-pixel text-[8px] text-zinc-600">·</div>
            <div className="font-pixel text-[8px] text-zinc-500">{biome.sub}</div>
          </div>
          {/* Oracle's atmospheric line */}
          <div className="font-crt text-base sm:text-lg leading-snug text-zinc-400 italic mb-2 text-in">
            "{message}"
          </div>
          {/* The actual question, framed as the Oracle's challenge */}
          <div className="font-pixel text-xs sm:text-sm leading-relaxed text-white text-glow-soft text-in"
            style={{ animationDelay: '0.2s' }}>
            {questPrompt}
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// PARTY — the four adventurers as a row of pixel sprites
// ════════════════════════════════════════════════════════════════

function MoraleHearts({ count, color }) {
  // Cap visible hearts at 5; show "+" if more
  const cap = Math.min(count, 5);
  return (
    <div className="flex gap-0.5 items-center justify-center h-2.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < cap;
        return (
          <svg key={i} width="6" height="6" viewBox="0 0 6 6" shapeRendering="crispEdges">
            <rect x="1" y="1" width="1" height="1" fill={filled ? color : '#27272a'} />
            <rect x="2" y="1" width="1" height="1" fill={filled ? color : '#27272a'} />
            <rect x="3" y="1" width="1" height="1" fill={filled ? color : '#27272a'} />
            <rect x="4" y="1" width="1" height="1" fill={filled ? color : '#27272a'} />
            <rect x="0" y="2" width="6" height="1" fill={filled ? color : '#27272a'} />
            <rect x="0" y="3" width="6" height="1" fill={filled ? color : '#27272a'} />
            <rect x="1" y="4" width="4" height="1" fill={filled ? color : '#27272a'} />
            <rect x="2" y="5" width="2" height="1" fill={filled ? color : '#27272a'} />
          </svg>
        );
      })}
      {count > 5 && (
        <span className="font-pixel text-[7px] ml-1" style={{ color }}>+{count - 5}</span>
      )}
    </div>
  );
}

function PartyMember({ player, locked, size = 5 }) {
  // Stable bob phase per player — last char of id maps to a 0-0.6s offset.
  // (Math.random() here would re-roll every timer tick and make the sprite jitter.)
  const bobDelay = (player.id.charCodeAt(player.id.length - 1) % 7) * 0.09;
  return (
    <div className="flex flex-col items-center gap-1 min-w-[68px]">
      <div className="relative idle-bob" style={{ animationDelay: `${bobDelay}s` }}>
        <PixelSprite id={player.sprite} scale={size} glowColor={player.color} />
        {locked && (
          <div className="absolute inset-0 grid place-items-center bg-black/70">
            <Lock size={20} style={{ color: player.color, filter: `drop-shadow(0 0 4px ${player.color})` }} />
          </div>
        )}
      </div>
      <div className="font-pixel text-[8px] mt-0.5" style={{ color: player.color, textShadow: `0 0 4px ${player.color}` }}>
        {player.cls}
      </div>
      <div className="font-pixel text-[7px] text-zinc-500">{player.name}</div>
      <MoraleHearts count={player.streak} color={player.color} />
    </div>
  );
}

function PartyRow({ players, lockedSet }) {
  return (
    <div className="border-2 border-zinc-800 bg-black/60 backdrop-blur-sm p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-pixel text-[8px] text-zinc-500 flex items-center gap-1.5">
          <span style={{ color: C.green }}>▸</span>
          THE PARTY
        </div>
        <div className="font-pixel text-[8px] text-zinc-500">
          LOCKED: <span style={{ color: C.green }}>{lockedSet.size}/{players.length}</span>
        </div>
      </div>
      <div className="flex justify-around items-end flex-wrap gap-3">
        {players.map(p => (
          <PartyMember key={p.id} player={p} locked={lockedSet.has(p.id)} />
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// QUESTION TIMER + BODY (preserved from original)
// ════════════════════════════════════════════════════════════════

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

function ClassicAnswers({ q }) {
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

function DecryptorAnswers({ q, timeLeft, totalTime }) {
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
                <div key={i} className="w-8 h-11 grid place-items-center font-pixel text-base border-2 transition-all"
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

function SequenceAnswers({ q }) {
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
// CHALLENGE BLOCK — timer + answer area, biome-tinted
// ════════════════════════════════════════════════════════════════

function ChallengeBlock({ q, biome, timeLeft, totalTime }) {
  return (
    <div className="border-2 p-4 sm:p-5 bg-black/60 backdrop-blur-sm relative overflow-hidden"
      style={{ borderColor: `${biome.color}66` }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center bottom, ${biome.color}0a, transparent 60%)` }} />
      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          <div className="font-pixel text-3xl tabular-nums"
            style={{ color: timeLeft < totalTime * 0.25 ? C.red : timeLeft < totalTime * 0.5 ? C.yellow : C.green }}>
            {Math.ceil(timeLeft).toString().padStart(2, '0')}
          </div>
          <div className="flex-1"><TimerBar time={timeLeft} total={totalTime} ominous /></div>
          <div className="font-pixel text-[9px] text-zinc-500">CHALLENGE</div>
        </div>
        <div>
          {q.type === 'classic'   && <ClassicAnswers q={q} />}
          {q.type === 'decryptor' && <DecryptorAnswers q={q} timeLeft={timeLeft} totalTime={totalTime} />}
          {q.type === 'sequence'  && <SequenceAnswers q={q} />}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// AUTO-DEMO HOOK — runs the cycle without user input
// ════════════════════════════════════════════════════════════════

const TOTAL_TIME = 15;
const REVEAL_HOLD_MS = 5500;

function useAutoDemo(questionType) {
  const [phase, setPhase] = useState('question');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [lockedSet, setLockedSet] = useState(new Set());
  const [oracleLineIdx, setOracleLineIdx] = useState(0);

  // Reset on question type change
  useEffect(() => {
    setPhase('question');
    setTimeLeft(TOTAL_TIME);
    setLockedSet(new Set());
    setOracleLineIdx(prev => (prev + 1) % 3);
  }, [questionType]);

  // Timer
  useEffect(() => {
    if (phase !== 'question') return;
    const t = setInterval(() => {
      setTimeLeft(prev => prev <= 0.1 ? 0 : prev - 0.1);
    }, 100);
    return () => clearInterval(t);
  }, [phase]);

  // Stagger AI lock-ins
  useEffect(() => {
    if (phase !== 'question') return;
    const lockTimes = { p2: 2500, p3: 6500, p1: 9000, p4: 12500 };
    const timers = Object.entries(lockTimes).map(([id, ms]) =>
      setTimeout(() => setLockedSet(prev => new Set(prev).add(id)), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, questionType]);

  // Auto-advance to reveal at time 0
  useEffect(() => {
    if (phase !== 'question' || timeLeft > 0) return;
    const t = setTimeout(() => setPhase('reveal'), 800);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  // Hold reveal then restart cycle
  useEffect(() => {
    if (phase !== 'reveal') return;
    const t = setTimeout(() => {
      setPhase('question');
      setTimeLeft(TOTAL_TIME);
      setLockedSet(new Set());
      setOracleLineIdx(prev => (prev + 1) % 3);
    }, REVEAL_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  return { phase, timeLeft, totalTime: TOTAL_TIME, lockedSet, oracleLineIdx };
}

// ════════════════════════════════════════════════════════════════
// REVEAL PANEL (when phase === 'reveal')
// ════════════════════════════════════════════════════════════════

function RevealPanel({ q, biome, party, lockedSet }) {
  let correctText = '';
  if (q.type === 'classic')   correctText = q.options[q.correct];
  if (q.type === 'decryptor') correctText = q.answer;
  if (q.type === 'sequence')  correctText = q.correctOrder.map(i => q.items[i]).join(' → ');

  // Mock results: party member 'p1' (YOU/Mage) is correct, others mixed
  const results = useMemo(() => {
    return party.map(p => {
      const locked = lockedSet.has(p.id);
      let res = 'wrong';
      if (!locked) res = 'timeout';
      else if (p.id === 'p1' || p.id === 'p4') res = 'correct';
      else if (p.id === 'p2') res = 'wrong';
      else res = 'correct';
      return { ...p, result: res, points: res === 'correct' ? 450 : 0 };
    });
  }, [party, lockedSet]);

  return (
    <div className="border-2 p-4 sm:p-5 bg-black/60 backdrop-blur-sm space-y-4 relative overflow-hidden"
      style={{ borderColor: `${C.green}66` }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${C.green}0d, transparent 65%)` }} />
      <div className="relative space-y-3 text-center">
        <div className="font-pixel text-[10px]" style={{ color: C.green }}>▸ THE ORACLE'S TRUTH</div>
        <div className="font-pixel text-2xl sm:text-3xl text-glow inline-block px-4 py-3 pixel-pop"
          style={{ color: C.green, background: 'rgba(57,255,20,0.08)', border: `3px solid ${C.green}` }}>
          {correctText}
        </div>
      </div>
      <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2">
        {results.map((r, i) => (
          <div key={r.id} className="flex items-center gap-2 p-2 border-2"
            style={{
              borderColor: r.result === 'correct' ? C.green : r.result === 'wrong' ? C.red : '#3f3f46',
              background: '#000',
              animationDelay: `${i * 0.08}s`,
            }}>
            <div style={{ filter: r.result !== 'correct' ? 'grayscale(0.7)' : 'none' }}>
              <PixelSprite id={r.sprite} scale={2} glowColor={r.result === 'correct' ? r.color : null} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-pixel text-[8px] truncate" style={{ color: r.color }}>{r.name}</div>
              <div className="font-pixel text-[7px]"
                style={{ color: r.result === 'correct' ? C.green : r.result === 'wrong' ? C.red : '#52525b' }}>
                {r.result === 'correct' && <span className="flex items-center gap-1"><Check size={9} />+{r.points}</span>}
                {r.result === 'wrong'   && <span className="flex items-center gap-1"><X size={9} />0</span>}
                {r.result === 'timeout' && <span className="flex items-center gap-1"><AlertTriangle size={9} />—</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// TOP BAR
// ════════════════════════════════════════════════════════════════

function TopBar({ questionType, onChange }) {
  const tabs = [
    { id: 'classic',   label: 'CRYSTAL CAVES', color: C.cyan },
    { id: 'decryptor', label: 'DATAWILD',      color: C.pink },
    { id: 'sequence',  label: 'PIXEL RUINS',   color: C.yellow },
  ];

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-2 h-7 animate-pulse" style={{ background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
        <div>
          <div className="font-pixel text-sm sm:text-base text-glow-soft" style={{ color: C.pink }}>
            NOGHURT BRAIN
          </div>
          <div className="font-crt text-base text-zinc-500 leading-none mt-0.5 flex items-center gap-1.5">
            <Sparkles size={10} style={{ color: C.purple }} />
            Quest Mode preview
          </div>
        </div>
      </div>

      <div className="flex gap-1.5">
        {tabs.map(t => {
          const active = questionType === t.id;
          return (
            <button key={t.id} onClick={() => onChange(t.id)}
              className="font-pixel text-[9px] px-3 py-2 border-2 transition-all"
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
  const { phase, timeLeft, totalTime, lockedSet, oracleLineIdx } = useAutoDemo(questionType);

  const question = SAMPLE_QUESTIONS[questionType];
  const biome = BIOMES[question.biome];
  const oracleMessage = biome.oracleLines[oracleLineIdx % biome.oracleLines.length];

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 relative overflow-hidden font-pixel">
      <InjectedStyles />

      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at top, ${biome.color}11, transparent 60%), radial-gradient(ellipse at bottom right, rgba(184,41,255,0.10), transparent 60%)` }} />

      <div className="max-w-5xl mx-auto relative z-10 space-y-4">
        <TopBar questionType={questionType} onChange={setQuestionType} />

        {/* The whole quest stage as a frame */}
        <div className="relative bg-black border-4 border-zinc-800 rounded-lg overflow-hidden scanlines"
          style={{ boxShadow: `0 0 0 2px #000, 0 0 40px ${biome.color}33, inset 0 0 60px rgba(0,0,0,0.8)` }}>
          <div className="scan-line" />
          <div className="bg-grid absolute inset-0 opacity-50" />

          <div className="relative z-10 p-4 sm:p-5 space-y-4">
            <AdventurePath currentBiomeId={question.biome} />

            <OracleNPC
              biome={biome}
              message={oracleMessage}
              questPrompt={question.prompt}
            />

            {phase === 'question' ? (
              <ChallengeBlock q={question} biome={biome} timeLeft={timeLeft} totalTime={totalTime} />
            ) : (
              <RevealPanel q={question} biome={biome} party={PARTY} lockedSet={lockedSet} />
            )}

            <PartyRow players={PARTY} lockedSet={lockedSet} />
          </div>
        </div>
      </div>
    </div>
  );
}
