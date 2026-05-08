# NOGHURT BRAIN — Project Kickoff

You are joining the build of **Noghurt Brain**, a Jackbox-style multiplayer trivia web app with a cyberpunk / CRT / retro-arcade aesthetic. This message bootstraps your context. Read everything before writing any code.

---

## What you're building

A web app where one host opens a "TV view" on a laptop or projector, up to 8 players join from their phones with a 4-letter room code, and the group plays 5 trivia questions plus a final **Mainframe** wager round. The host screen is the spectacle (animated, audio-reactive, full of CRT vibes). The phone is the controller.

**Stack (locked, do not change):** Next.js 15 App Router · TypeScript · Tailwind v4 · Supabase (Auth + Postgres + Realtime) · pnpm · Vercel · Anthropic API (deferred to v2 for AI question generation).

---

## Critical context — read before writing any code

### 1. The aesthetic is LOCKED

The original prototype `noghurt-brain.tsx` is the **visual specification**. Every component, color, animation, and font in it is an explicit design decision. You do not redesign anything from that file. You port it. The polished single-screen prototype `noghurt-brain-question-preview.jsx` is the spec for the question phase specifically.

Read `DESIGN_SYSTEM.md` for the palette, fonts, animation keyframes, and component patterns. Read `CLAUDE.md` for the rules you must follow during development.

### 2. Scope is ALSO locked

Read `MVP_SCOPE.md` first. **You are building v1.** The Quest Mode RPG framing, the multi-track jukebox, the AI question generation, the daily challenge, and the friend duel system are all explicitly v2/v3 work and **do not get implemented in this phase regardless of how much they would improve things**. If you find yourself wanting to add one of these, stop and re-read this section.

### 3. The build is phased, not freeform

`BUILD_PLAN.md` lists five phases. Do them in order. Each phase has its own session-starter prompt — start a fresh session for each phase, paste the prompt, then work in Plan Mode before you write any code.

---

## Document index — read in this order

1. **`README.md`** — orientation, tech stack, how to run locally.
2. **`CLAUDE.md`** — your operating constitution. Read this twice.
3. **`MVP_SCOPE.md`** — what's in v1 and what's deferred. Hard cuts justified.
4. **`DESIGN_SYSTEM.md`** — the locked aesthetic. Palette, fonts, animations, components, copy-paste-ready snippets.
5. **`ARCHITECTURE.md`** — routes, database schema, RLS policies, realtime channels, auth flow.
6. **`BUILD_PLAN.md`** — the five phases with embedded session prompts and definition-of-done.

---

## Prototype files — what they are

The user is uploading a set of `.tsx` and `.jsx` prototype files alongside this kickoff. Treat them as **read-only specifications**, not as source code to copy verbatim. Refer to them when porting components.

| File | Status | Purpose |
|---|---|---|
| `noghurt-brain.tsx` | **SPEC** | The original locked design. Source of truth for lobby, intro, question, reveal, mainframe, wager, game-over phases. Both host and phone views. |
| `noghurt-brain-question-preview.jsx` | **SPEC** | Polished single-view spec for the host's question screen. Shows lock-in badges, streak flames, heat border, emote floaters. *These visual effects are v1.5+, but the layout and structure are v1.* |
| `noghurt-brain-v2.jsx` | reference | Original + audio/particles/boot sequence layered. **Do not implement these effects in v1.** Reference for v1.5 only. |
| `noghurt-brain-theme-v1_1.jsx`, `noghurt-brain-jukebox.jsx` | deferred | Web Audio chiptune themes. Music is **not v1**. Defer. |
| `noghurt-brain-question-lab-v1_1.jsx` | deferred | Question lab with power-ups, emotes, side-by-side host+phone. Power-ups and emotes are **not v1**. The side-by-side is a prototype affordance only — host and phone are separate routes in production. |
| `noghurt-brain-quest-mode-v1_1.jsx` | **deferred to v3** | RPG / Slay-the-Spire framing. Inspirational but **out of scope for v1, v1.5, and v2**. |

---

## First action

Once you've read all the docs above, your first response should be:

> "I've read the kickoff and all six docs. Here is my understanding of v1 scope: [3-sentence summary]. Here are the questions I have before we start Phase 0: [list]. Ready to begin Phase 0 when you are."

Do not write code, scaffold a project, or run commands until the user confirms.
