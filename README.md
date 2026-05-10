# noghurt brain

**noghurt brain** is a real-time multiplayer trivia web app — Jackbox-style party energy in a cyberpunk CRT shell. The host creates a room, friends join from the same URL on any device, and the group plays through a configurable set of trivia rounds capped by a high-stakes "Mainframe" wager finale.

**Live**: [noghurt-brain.vercel.app](https://noghurt-brain.vercel.app)

## Core Features

The game is structured around three loops:

- **Lobby**: host picks categories (multi-select), difficulty (`NORMAL` or `NIGHTMARE` — affects the timer), and round count (3–7). Friends join via a 4-letter code or QR. Each player's chosen color renders as a pixel-art class portrait — `MAGE`, `HACKER`, `BARD`, `PALADIN`, `BERSERKER`, `ORACLE` — laying foundations for a future quest mode.
- **Round loop**: one of two question types per round. **Classic** is four-option multiple choice; **Decryptor** is a typed answer with a progressive letter-reveal animation that ramps up to half the word as the timer drains. Speed-bonus scoring rewards faster locks; consecutive correct answers stack a streak multiplier.
- **Mainframe**: a single wager round after the normal rounds end. Players bet any portion of their score; correct doubles the wager, wrong loses it. Then a podium with score-bar animation and a one-click "run it back" reset.

Every screen is phase-aware. The host has a floating admin drawer for room control (start, kick during lobby, reset post-game). Player phones get a compact mobile layout; the same URL on desktop renders the rich CRT TV view with full leaderboard.

## Technical Architecture

The project is server-authoritative on a Supabase Postgres backend, with row-level security policies that double as the trust boundary. The `rooms`, `players`, `answers`, and `wagers` tables are all RLS-locked so a player can never see another player's answer pre-reveal. Cross-table RLS recursion (a common Supabase footgun) is handled by `SECURITY DEFINER` helper functions that bypass RLS for the chicken-and-egg lookups the join flow needs.

The phase state machine lives in a single `advance_phase()` Postgres function called by the host's browser at natural transition points — the host orchestrates timing client-side, the server only validates and stamps. Real-time updates flow through Supabase Realtime's `postgres_changes` channels with a polling fallback for sessions that drop the WebSocket.

Music is generated entirely in-browser with the Web Audio API — six original chiptune tracks (mainframe theme, lobby variant, mainframe-round intensity variant, ambient menu music, victory anthem, dread protocol) composed as 16th-note step sequences with per-voice envelope synthesis. The audio engine lives in a React Provider at the root layout so the AudioContext survives page navigations. No audio files are shipped.

The frontend stack is **Next.js 15** (App Router, server components, server actions) + **TypeScript** + **Tailwind v4**. Auth is **Discord OAuth + anonymous Supabase guest play** sharing a single `auth.users` table. Deployed on **Vercel**.

## Design Philosophy

The aesthetic was locked from the start: a prototype `noghurt-brain.tsx` shipped with the kickoff brief, and every component, color, animation, and font in it counted as a design decision already made. The build was about porting that prototype into production multiplayer infrastructure without re-litigating the visual language. CRT scanlines, Press Start 2P + VT323 fonts, neon palette, and a single `crt.css` keyframe library define the surface.

Server authority is enforced where it matters (RLS on answer visibility, host-only `advance_phase`) but pragmatically relaxed where it doesn't (question grading runs client-side on the host's browser since the question pool lives in TypeScript). The trade-off is documented and intentional — it cuts deployment complexity by half without meaningfully widening the trust surface for friend-group play.

Scope discipline is its own design choice. The build plan locks each phase to a deployable state. Music, RPG class portraits, host kicks, settings selectors — all of these were originally tagged for v1.5 / v2 / v3 and pulled forward intentionally with explicit scope tracking. The original v1 cuts (sequence questions, power-ups, persistent stats, friend duels, leaderboards, daily challenge) remain firm.

**License note**: This repository is published as portfolio work. The source code, design, prompts, and microcopy are not available for reuse or derivative works.
