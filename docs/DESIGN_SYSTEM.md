# DESIGN_SYSTEM.md — Locked Aesthetic Specification

The visual language of Noghurt Brain is not up for redesign. This document captures the locked decisions so they can be ported faithfully from the prototype into the production codebase.

> **Source of truth:** the prototypes `noghurt-brain.tsx` and `noghurt-brain-question-preview.jsx`. This file documents what's in them; if there's a conflict, the prototypes win.

---

## 1. The Palette

The neon palette is a single object exported from `src/styles/palette.ts`:

```ts
export const C = {
  pink:   '#ff2e88',  // accent / player 1 / errors-as-glow
  cyan:   '#00f0ff',  // accent / player 2 / "currently active"
  green:  '#39ff14',  // accent / player 3 / success / "go"
  yellow: '#ffe600',  // accent / player 4 / score / streak flames
  red:    '#ff0040',  // wrong answers / heat / mainframe boss
  purple: '#b829ff',  // mainframe theming / mystery / oracle
  bg:     '#05050a',  // app background (near-black)
  panel:  '#0d0d18',  // panel/card backgrounds (slight blue tint)
} as const;
```

**Usage rules:**

- Player colors are assigned in order: pink (P1), cyan (P2), green (P3), yellow (P4). Players 5–8 cycle back through the same four.
- `red` is reserved for failure states and the Mainframe boss.
- `purple` is reserved for Mainframe theming and the Oracle (v3+).
- `bg` is the body background. `panel` is for raised surfaces (cards, frames).
- Don't introduce new colors. If a new accent is needed, recompose existing ones.

---

## 2. Typography

Two web fonts loaded from Google Fonts:

```
Press Start 2P  — pixel display font, headlines, labels, small caps
VT323           — CRT terminal font, body copy, dialogue, longer text
```

Loaded in the root layout via a `<link>` tag, then exposed as Tailwind utility classes:

```css
.font-pixel { font-family: 'Press Start 2P', ui-monospace, monospace; letter-spacing: 0.04em; }
.font-crt   { font-family: 'VT323', 'Courier New', monospace;        letter-spacing: 0.02em; }
```

**Sizing minimums:**

- `font-pixel` minimum size is `text-[8px]` (8px). Below 8px it's illegible.
- `font-crt` minimum size is `text-base` (16px). It's a chunkier font, holds up at smaller sizes but read better at base.
- For tiny system labels (status, counts), use `text-[8px]` or `text-[9px]` `font-pixel`.
- For body prose / dialogue, use `text-base` or `text-lg` `font-crt`.

**Glow utilities:**

```css
.text-glow      { text-shadow: 0 0 6px currentColor, 0 0 14px currentColor; }
.text-glow-soft { text-shadow: 0 0 4px currentColor; }
```

Use `.text-glow` on big headlines (correct answer reveal, "GAME OVER", etc.). Use `.text-glow-soft` on player names, scores, and accent labels.

---

## 3. Animations & keyframes

All keyframes live in a single `src/styles/crt.css` file imported once at the root layout. Do not duplicate keyframes per component.

### Required keyframes (port from prototype)

| Class | Use |
|---|---|
| `.scanlines::after` | Static CRT scanline overlay. Apply to any frame component. |
| `.scan-line` | Animated scan-line that traverses top-to-bottom every 5s. |
| `.vignette::before` | Radial darkening at the edges of any frame. |
| `.glitch` | RGB-split glitch effect on text. Use sparingly (boot sequence, mainframe intro). |
| `.shake` | Camera shake. Trigger on wrong-answer reveals (~0.55s). |
| `.neon-pulse` | Pulsing neon glow. Use on selected/active buttons. |
| `.blink` | Cursor blink. Use on `▓` accents in headers. |
| `.pixel-pop` | Scale-and-rotate intro for revealed answers. |
| `.warning-pulse` | Quick scale pulse for urgent UI (low timer, mainframe). |
| `.flame-flick` | Streak flame icon animation. (v1.5) |

The full keyframe definitions are in the InjectedStyles component in any prototype — copy them verbatim into `src/styles/crt.css`.

### Animation discipline

- Animations earn their place. Don't add an animation to something just because you can.
- All animations should be skippable or end-state-stable — don't leave the UI in a transient state.
- `prefers-reduced-motion` should disable scan-line traversal and shake. Other animations can stay subdued.

---

## 4. Component patterns

These components must be ported faithfully from the prototype. Each is the product of design decisions you should not relitigate.

### `<HostFrame>`

The CRT-bordered container that wraps every host phase. Black background, 4px zinc-800 border, rounded-lg, scanlines + vignette overlays, scan-line traversing. All host phases render as children of HostFrame.

**Source:** `noghurt-brain-question-preview.jsx`, function `HostFrame`. Port as `src/components/chrome/HostFrame.tsx`.

### `<PhoneFrame>`

The phone-shaped container for the player view. Outer rounded-[2.2rem] padding, inner aspect-ratio 9/19 black screen with scanlines. Speaker notch at top, home indicator at bottom.

**Source:** `noghurt-brain.tsx`, function `PhoneFrame`. Port as `src/components/chrome/PhoneFrame.tsx`.

> **Note:** in production, PhoneFrame is *not* used to wrap the actual phone view. The phone view is the entire viewport on the player's actual device. PhoneFrame is only used in marketing/landing pages or for showing what the phone looks like to the host (optional v1.5+). The player at `/play/[code]` sees the contents directly.

### `<PlayerAvatar>`

48px or 64px square (configurable via `size` prop) with the player's icon centered, neon ring border in their color, drop-shadow glow. Has `locked` overlay (Lock icon on dimmed background) and `dim` (greyscale) variants.

**Source:** `noghurt-brain-question-preview.jsx`, function `PlayerAvatar`. Port as `src/components/shared/PlayerAvatar.tsx`.

### `<TimerBar>`

Horizontal progress bar with neon fill. Color shifts green → yellow → red as it drains. Has an `ominous` variant that adds a red flash overlay in the last 25%.

**Source:** `noghurt-brain.tsx` / `noghurt-brain-question-preview.jsx`, function `TimerBar`. Port as `src/components/shared/TimerBar.tsx`.

### Phase components

Each game phase is its own component. v1 needs:

- `<LobbyHost>` / `<LobbyPhone>` — players joining, color picker, name input, host's "Start Game" button
- `<IntroHost>` — round X-of-5 indicator, category preview, "GET READY"
- `<QuestionHost>` / `<QuestionPhone>` — the timer + prompt + answer area (split per question type)
- `<RevealHost>` / `<RevealPhone>` — correct answer + score updates per player
- `<MainframeIntroHost>` — "THE MAINFRAME" cinematic
- `<WagerHost>` / `<WagerPhone>` — wager input on phone, players' wager status on host
- `<FinalQuestionHost>` / `<FinalQuestionPhone>` — same shape as QuestionHost, mainframe-themed
- `<FinalRevealHost>` — score swing animation
- `<GameOverHost>` / `<GameOverPhone>` — podium, final scores, "PLAY AGAIN"

Each phase pair lives in `src/components/phases/{phaseName}/Host.tsx` and `Phone.tsx`.

### Question type bodies

Per question type, there's a host-side body (renders the question and answers visually) and a phone-side body (renders the controls):

- `ClassicHostBody` / `ClassicPhoneBody` — 4 colored A/B/C/D options
- `DecryptorHostBody` / `DecryptorPhoneBody` — letter-grid reveal on host, text input on phone

Source: both `noghurt-brain.tsx` and `noghurt-brain-question-preview.jsx` have these. The preview's host bodies are slightly more polished — port from the preview.

---

## 5. Layout grid

- **Host TV view:** designed for 16:9, max-width 1280px, centered. Padding scales `p-4 sm:p-6`.
- **Phone view:** full viewport, mobile-first. No max-width. Padding `p-3` inside the screen area, `p-2` on outer chrome.

The host view is **not** mobile-responsive in v1. It's designed for the laptop / projector use case. If a player accidentally opens `/host/[code]` on their phone, it'll look weird — that's acceptable for v1. (We can add a "this is the host view, are you sure?" prompt in v1.5.)

---

## 6. Copy / voice

Tone is **terse, retro, slightly menacing**. Examples from the prototype:

| Where | Copy |
|---|---|
| Lobby empty state | `AWAITING SIGNAL…` |
| Player joined | `[name] CONNECTED` |
| Lock-in waiting screen | `LOCKED IN — awaiting reveal…` |
| Decryptor body | `▸ DECRYPTING SIGNAL…` |
| Reveal headline | `▸ ANSWER UNLOCKED` |
| Game over | `▸ TRANSMISSION ENDED` |

Avoid friendly chat copy ("Great job!", "Awesome!"). The voice is closer to a terminal log or a hacker movie HUD than a kids' game show.

When showing real-time status, lean on the symbolic accents from the prototype: `▸`, `▓`, `●`, `★`, `◊`. Use them sparingly — one per UI section.

---

## 7. Don'ts

- **Don't introduce a UI library** (shadcn/ui, Radix primitives, Mantine, Material UI). The pixel aesthetic doesn't survive their default styling, and the rebrand effort exceeds the build effort.
- **Don't introduce a CSS-in-JS library** (styled-components, emotion). Tailwind + inline `style={}` for dynamic colors is enough.
- **Don't use Tailwind's default font stack.** Always specify `font-pixel` or `font-crt` on text-bearing elements.
- **Don't use rounded-full or rounded-3xl for primary surfaces.** The aesthetic is square / rounded-lg max. Soft shapes don't fit.
- **Don't use the modern CSS gradient meshes / glassmorphism / "frosted glass" effects.** They're at war with the CRT/pixel feel.
- **Don't add subtle decorative motion** (parallax, mouse-follow, smooth-scroll spy). The prototype is busy enough; over-animating is the easiest way to make it feel like AI slop.
